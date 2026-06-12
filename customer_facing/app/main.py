import datetime
import httpx
import json
import ipaddress
import logging
import time
import threading
from urllib.parse import urlparse
from collections import deque
from fastapi import FastAPI, HTTPException, Request
from fastapi import Depends
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from starlette.background import BackgroundTask

from app.api_client import api
from app.catalogue_cache import catalogue_cache
from app.config import settings
from app.routes import pages, finder
from app.api_client import ApiClientError
from app.view_templates import TEMPLATE_DIR, templates

LOG_BUFFER_SIZE = int(getattr(settings, "log_buffer_size", 500)) if hasattr(settings, "log_buffer_size") else 500
LOG_BUFFER = deque(maxlen=LOG_BUFFER_SIZE)
LOG_BUFFER_LOCK = threading.Lock()
LOG_SEQUENCE = 0
LOG_HANDLER_ATTACHED = False
PUBLIC_ACCESS_LOG_PREFIX = "public-access "
root_logger = logging.getLogger()
root_logger.setLevel(getattr(logging, settings.log_level, logging.INFO))
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)


class SuppressLogPollingFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        message = record.getMessage()
        if " /api/logs/recent" in message:
            return False
        if " /api/customer-facing/logs/recent" in message:
            return False
        return True


class InMemoryLogHandler(logging.Handler):
    def emit(self, record: logging.LogRecord):
        global LOG_SEQUENCE
        try:
            timestamp = datetime.datetime.fromtimestamp(record.created, tz=datetime.timezone.utc).astimezone().isoformat(timespec="seconds")
            message = self.format(record)
            entry = {
                "id": 0,
                "timestamp": timestamp,
                "level": record.levelname,
                "logger": record.name,
                "message": message,
                "formatted": f"{timestamp} [{record.levelname:<5}] {record.name}: {message}",
            }
        except Exception:
            self.handleError(record)
            return

        with LOG_BUFFER_LOCK:
            LOG_SEQUENCE += 1
            entry["id"] = LOG_SEQUENCE
            LOG_BUFFER.append(entry)


def attach_in_memory_log_handler():
    global LOG_HANDLER_ATTACHED
    if LOG_HANDLER_ATTACHED:
        return

    handler = InMemoryLogHandler()
    handler.setLevel(getattr(logging, settings.log_level, logging.INFO))
    handler.setFormatter(logging.Formatter("%(message)s"))
    suppress_polling = SuppressLogPollingFilter()

    root_logger.addHandler(handler)
    root_logger.addFilter(suppress_polling)
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        logger = logging.getLogger(name)
        logger.addHandler(handler)
        logger.addFilter(suppress_polling)

    LOG_HANDLER_ATTACHED = True


attach_in_memory_log_handler()
root_logger.info(
    "Customer-facing app booting build=%s backend_api_base_url=%s public_site_url=%s log_level=%s finder_debug=%s",
    settings.app_build_marker,
    settings.backend_api_base_url,
    settings.public_site_url,
    settings.log_level,
    settings.finder_debug,
)
print(
    "Customer-facing app booting "
    f"build={settings.app_build_marker} "
    f"backend_api_base_url={settings.backend_api_base_url} "
    f"public_site_url={settings.public_site_url} "
    f"log_level={settings.log_level} "
    f"finder_debug={settings.finder_debug}",
    flush=True,
)


def _strip_ip_port(value: str) -> str:
    candidate = (value or "").strip().strip('"').strip("'")
    if not candidate:
        return ""
    if candidate.startswith("[") and "]" in candidate:
        return candidate[1 : candidate.index("]")]
    if candidate.count(":") == 1:
        host, port = candidate.rsplit(":", 1)
        if port.isdigit():
            return host
    return candidate


def _parse_ip_address(value: str) -> ipaddress._BaseAddress | None:
    candidate = _strip_ip_port(value)
    if not candidate or candidate.lower() == "unknown":
        return None
    try:
        return ipaddress.ip_address(candidate)
    except ValueError:
        return None


def _iter_forwarded_ips(request: Request):
    forwarded = request.headers.get("forwarded", "")
    if forwarded:
        for entry in forwarded.split(","):
            for part in entry.split(";"):
                key, separator, raw_value = part.partition("=")
                if not separator or key.strip().lower() != "for":
                    continue
                yield raw_value.strip()
                break

    x_forwarded_for = request.headers.get("x-forwarded-for", "")
    if x_forwarded_for:
        for value in x_forwarded_for.split(","):
            yield value.strip()


def _extract_public_client_ip(request: Request) -> str | None:
    peer = _parse_ip_address(request.client.host if request.client else "")
    if peer is not None and peer.is_global:
        return str(peer)

    if peer is None or peer.is_private or peer.is_loopback or peer.is_link_local:
        for candidate in _iter_forwarded_ips(request):
            parsed = _parse_ip_address(candidate)
            if parsed is not None and parsed.is_global:
                return str(parsed)

    return None


def _request_path_with_query(request: Request) -> str:
    if request.url.query:
        return f"{request.url.path}?{request.url.query}"
    return request.url.path


def _route_group_for_path(path: str) -> str:
    path = path or ""
    if path == "/api/health":
        return "health"
    if path == "/api/client-telemetry":
        return "telemetry"
    if path == "/api/cache/refresh":
        return "cache-refresh"
    if path.startswith("/api/public/") or path.startswith("/api/cms/"):
        return "public-api"
    if path.startswith("/api/"):
        return "internal-api"
    if path.startswith("/series/") or path.startswith("/products/") or path in {"/", "/contact", "/engineering-services", "/finder/results"}:
        return "public-page"
    return "other"


def _page_route_group_for_path(path: str) -> str:
    path = path or ""
    if path == "/":
        return "home"
    if path.startswith("/series/"):
        return "series-page"
    if path.startswith("/products/"):
        return "product-page"
    if path in {"/contact", "/engineering-services", "/finder/results"}:
        return "public-page"
    return "other"


def _split_host_port(value: str) -> tuple[str, int | None]:
    candidate = _strip_ip_port(value)
    if not candidate:
        return "", None
    if candidate.startswith("[") and "]" in candidate:
        candidate = candidate[1 : candidate.index("]")]
    if candidate.count(":") == 1:
        host, port = candidate.rsplit(":", 1)
        if port.isdigit():
            return host, int(port)
    return candidate, None


def _extract_public_client(request: Request) -> dict[str, object]:
    peer_host = request.client.host if request.client else ""
    peer_port = request.client.port if request.client else None
    forwarded_for = request.headers.get("forwarded", "")
    x_forwarded_for = request.headers.get("x-forwarded-for", "")
    x_real_ip = request.headers.get("x-real-ip", "")
    public_host = ""
    public_port = None
    public_source = ""
    forwarded_chain: list[str] = []

    forwarded_values: list[str] = []
    if forwarded_for:
        for entry in forwarded_for.split(","):
            for part in entry.split(";"):
                key, separator, raw_value = part.partition("=")
                if not separator or key.strip().lower() != "for":
                    continue
                forwarded_values.append(raw_value.strip())
                forwarded_chain.append(raw_value.strip())
                break

    if x_forwarded_for:
        for value in x_forwarded_for.split(","):
            cleaned = value.strip()
            if cleaned:
                forwarded_chain.append(cleaned)
                forwarded_values.append(cleaned)

    for candidate in forwarded_values:
        host, port = _split_host_port(candidate)
        parsed = _parse_ip_address(host)
        if parsed is not None and parsed.is_global:
            public_host = str(parsed)
            public_port = port
            public_source = "forwarded"
            break

    if not public_host:
        peer = _parse_ip_address(peer_host)
        if peer is not None and peer.is_global:
            public_host = str(peer)
            public_port = peer_port
            public_source = "peer"

    device_type = "desktop"
    user_agent = request.headers.get("user-agent", "")
    sec_ch_ua_mobile = request.headers.get("sec-ch-ua-mobile", "")
    if sec_ch_ua_mobile.strip().lower() in {'?1', '1', 'true'}:
        device_type = "mobile"
    elif "ipad" in user_agent.lower() or "tablet" in user_agent.lower():
        device_type = "tablet"
    elif "mobile" in user_agent.lower():
        device_type = "mobile"

    return {
        "peer_host": peer_host,
        "peer_port": peer_port,
        "public_host": public_host,
        "public_port": public_port,
        "public_source": public_source,
        "forwarded_chain": forwarded_chain,
        "forwarded_for": forwarded_for,
        "x_forwarded_for": x_forwarded_for,
        "x_real_ip": x_real_ip,
        "host": request.headers.get("host", ""),
        "scheme": request.url.scheme,
        "method": request.method,
        "path": _request_path_with_query(request),
        "user_agent": user_agent,
        "referer": request.headers.get("referer", ""),
        "accept_language": request.headers.get("accept-language", ""),
        "origin": request.headers.get("origin", ""),
        "sec_ch_ua": request.headers.get("sec-ch-ua", ""),
        "sec_ch_ua_mobile": sec_ch_ua_mobile,
        "sec_ch_ua_platform": request.headers.get("sec-ch-ua-platform", ""),
        "sec_fetch_site": request.headers.get("sec-fetch-site", ""),
        "sec_fetch_mode": request.headers.get("sec-fetch-mode", ""),
        "sec_fetch_dest": request.headers.get("sec-fetch-dest", ""),
        "sec_fetch_user": request.headers.get("sec-fetch-user", ""),
        "device_type": device_type,
    }


def _log_request_event(site: str, request: Request, status_code: int | None = None, duration_ms: float | None = None, telemetry: dict | None = None):
    payload = {
        "site": site,
        "event": "request" if telemetry is None else "browser-telemetry",
        "route_group": _route_group_for_path(request.url.path),
        "logged_at": datetime.datetime.now().astimezone().isoformat(timespec="seconds"),
        **_extract_public_client(request),
    }
    if status_code is not None:
        payload["status"] = status_code
    if duration_ms is not None:
        payload["duration_ms"] = round(duration_ms, 1)
    if telemetry is not None:
        payload["telemetry"] = telemetry
    root_logger.info("public-access %s", json.dumps(payload, ensure_ascii=True, sort_keys=True, separators=(",", ":")))


def _serialize_customer_facing_log_entry(entry: dict) -> dict:
    payload: dict[str, object] = {}
    message = str(entry.get("message") or "")
    if message.startswith(PUBLIC_ACCESS_LOG_PREFIX):
        payload_text = message[len(PUBLIC_ACCESS_LOG_PREFIX) :].strip()
        if payload_text:
            try:
                parsed = json.loads(payload_text)
                if isinstance(parsed, dict):
                    payload = parsed
            except json.JSONDecodeError:
                payload = {"raw": payload_text}
    return {**entry, "payload": payload}


def _get_customer_facing_log_entries(limit: int = 200, *, public_only: bool = False) -> list[dict]:
    with LOG_BUFFER_LOCK:
        entries = list(LOG_BUFFER)[-max(int(limit), 0) :]
    if public_only:
        entries = [entry for entry in entries if str(entry.get("message") or "").startswith(PUBLIC_ACCESS_LOG_PREFIX)]
    return [_serialize_customer_facing_log_entry(entry) for entry in entries]


def _require_log_access(request: Request):
    provided_token = (request.headers.get("authorization") or "").removeprefix("Bearer ").strip()
    if not settings.cms_api_token or provided_token != settings.cms_api_token:
        raise HTTPException(status_code=401, detail="Unauthorized")


def _get_recent_customer_facing_log_entries(limit: int = 200, *, public_only: bool = False) -> list[dict]:
    with LOG_BUFFER_LOCK:
        entries = list(LOG_BUFFER)[-max(int(limit), 0) :]
    if public_only:
        entries = [entry for entry in entries if str(entry.get("message") or "").startswith(PUBLIC_ACCESS_LOG_PREFIX)]
    return [_serialize_customer_facing_log_entry(entry) for entry in entries]

app = FastAPI(
    title=settings.site_name,
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

app.mount("/static", StaticFiles(directory=TEMPLATE_DIR.parent / "static"), name="static")

app.include_router(pages.router)
app.include_router(finder.router)


@app.middleware("http")
async def add_build_marker_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-App-Build"] = settings.app_build_marker
    return response


@app.middleware("http")
async def log_public_requests(request: Request, call_next):
    started = time.perf_counter()
    response = None
    try:
        response = await call_next(request)
        return response
    finally:
        if _extract_public_client(request).get("public_host"):
            status_code = getattr(response, "status_code", 500)
            duration_ms = (time.perf_counter() - started) * 1000.0
            _log_request_event("customer-facing", request, status_code=status_code, duration_ms=duration_ms)
@app.on_event("startup")
async def startup_catalogue_cache():
    app.state.catalogue_cache = catalogue_cache
    app.state.media_client = httpx.AsyncClient(timeout=settings.request_timeout_seconds)
    await catalogue_cache.initialize()


@app.on_event("shutdown")
async def shutdown_catalogue_cache():
    await catalogue_cache.shutdown()
    await api.aclose()
    media_client = getattr(app.state, "media_client", None)
    if media_client is not None:
        await media_client.aclose()
        app.state.media_client = None


@app.post("/api/cache/refresh")
async def refresh_catalogue_cache(request: Request):
    provided_token = (request.headers.get("authorization") or "").removeprefix("Bearer ").strip()
    if not settings.cms_api_token or provided_token != settings.cms_api_token:
        raise HTTPException(status_code=401, detail="Unauthorized")

    await catalogue_cache.refresh_best_effort()
    snapshot = catalogue_cache.snapshot()
    return {
        "refreshed": True,
        "fetched_at": snapshot.fetched_at,
        "product_types": len(snapshot.product_types),
        "series": len(snapshot.series),
        "products": len(snapshot.products),
    }


@app.get("/api/logs/recent")
async def get_recent_logs(
    request: Request,
    limit: int = 200,
    public_only: bool = False,
):
    _require_log_access(request)
    return _get_recent_customer_facing_log_entries(limit, public_only=public_only)


@app.post("/api/client-telemetry")
async def client_telemetry(request: Request):
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    page_url = str(payload.get("page_url") or "")
    parsed_page = urlparse(page_url)
    telemetry = {
        "page_url": str(payload.get("page_url") or ""),
        "referrer": str(payload.get("referrer") or ""),
        "screen_width": payload.get("screen_width"),
        "screen_height": payload.get("screen_height"),
        "viewport_width": payload.get("viewport_width"),
        "viewport_height": payload.get("viewport_height"),
        "device_pixel_ratio": payload.get("device_pixel_ratio"),
        "color_depth": payload.get("color_depth"),
        "timezone": str(payload.get("timezone") or ""),
        "timezone_offset": payload.get("timezone_offset"),
        "language": str(payload.get("language") or ""),
        "languages": payload.get("languages") or [],
        "platform": str(payload.get("platform") or ""),
        "user_agent": str(payload.get("user_agent") or request.headers.get("user-agent", "")),
        "device_type": str(payload.get("device_type") or ""),
        "touch_points": payload.get("touch_points"),
    }
    telemetry_payload = {
        "page_url": page_url,
        "page_route_group": _page_route_group_for_path(parsed_page.path),
        **telemetry,
    }
    _log_request_event("customer-facing", request, telemetry=telemetry_payload)
    return {"ok": True}


@app.get("/api/cms/media/{media_path:path}")
@app.get("/api/public/media/{media_path:path}")
async def proxy_public_media(media_path: str, request: Request):
    upstream_url = f"{settings.backend_api_base_url}/api/public/media/{media_path}"
    if request.url.query:
        upstream_url = f"{upstream_url}?{request.url.query}"

    upstream = None
    try:
        client = request.app.state.media_client

        upstream_request = client.build_request("GET", upstream_url)
        upstream = await client.send(upstream_request, stream=True)
        upstream.raise_for_status()
    except httpx.HTTPStatusError as exc:
        if upstream is not None:
            await upstream.aclose()
        detail = exc.response.text.strip() or f"Media request failed with status {exc.response.status_code}."
        raise HTTPException(status_code=exc.response.status_code, detail=detail) from exc
    except httpx.HTTPError as exc:
        if upstream is not None:
            await upstream.aclose()
        raise HTTPException(status_code=502, detail="Media is unavailable right now.") from exc

    passthrough_headers = {}
    for header_name in ("content-type", "cache-control", "etag", "last-modified", "content-disposition"):
        if header_name in upstream.headers:
            passthrough_headers[header_name] = upstream.headers[header_name]

    return StreamingResponse(
        upstream.aiter_bytes(),
        media_type=upstream.headers.get("content-type"),
        headers=passthrough_headers,
        background=BackgroundTask(upstream.aclose),
    )


@app.exception_handler(404)
async def not_found(request: Request, exc):
    product_types = request.app.state.catalogue_cache.product_types() if hasattr(request.app.state, "catalogue_cache") else []

    return templates.TemplateResponse(
        request,
        "errors/404.html",
        {
            "request": request,
            "product_types": product_types,
            "seo": {
                "title": "Page not found | Vent-tech catalogue",
                "description": "The requested page could not be found.",
                "canonical": str(request.url),
            },
        },
        status_code=404,
    )


@app.exception_handler(ApiClientError)
async def upstream_error(request: Request, exc: ApiClientError):
    product_types = request.app.state.catalogue_cache.product_types() if hasattr(request.app.state, "catalogue_cache") else []

    return templates.TemplateResponse(
        request,
        "errors/upstream.html",
        {
            "request": request,
            "product_types": product_types,
            "seo": {
                "title": f"Catalogue unavailable | {settings.site_name}",
                "description": "The catalogue is temporarily unavailable.",
                "canonical": str(request.url),
            },
            "message": exc.message,
            "status_code": exc.status_code,
        },
        status_code=502 if exc.status_code < 500 else exc.status_code,
    )
