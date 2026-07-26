import datetime
import json
import logging
import secrets
from collections import deque
from urllib.parse import urlparse

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import JSONResponse, Response

from app.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)
LOG_BUFFER = deque(maxlen=500)
LOG_SEQUENCE = 0


def _route_group(page_url: str) -> str:
    path = urlparse(page_url).path or "/"
    if path == "/":
        return "home"
    if path.startswith("/series/"):
        return "series-page"
    if path.startswith("/products/"):
        return "product-page"
    return "public-page"


def _client_host(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",", 1)[0].strip()
    return request.client.host if request.client else ""


def _append_telemetry_log(request: Request, payload: dict):
    global LOG_SEQUENCE

    page_url = str(payload.get("page_url") or "")
    telemetry = {
        "page_url": page_url,
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
        "languages": payload.get("languages") if isinstance(payload.get("languages"), list) else [],
        "platform": str(payload.get("platform") or ""),
        "user_agent": str(payload.get("user_agent") or request.headers.get("user-agent", "")),
        "device_type": str(payload.get("device_type") or ""),
        "touch_points": payload.get("touch_points"),
    }
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")
    entry_payload = {
        "event": "browser-telemetry",
        "site": "customer-facing",
        "route_group": _route_group(page_url),
        "logged_at": timestamp,
        "public_host": request.headers.get("host", ""),
        "public_ipv4": _client_host(request),
        "public_source": "customer-facing",
        "telemetry": telemetry,
    }
    LOG_SEQUENCE += 1
    message = f"public-access {json.dumps(entry_payload, ensure_ascii=True, sort_keys=True, separators=(',', ':'))}"
    LOG_BUFFER.append({
        "id": LOG_SEQUENCE,
        "timestamp": timestamp,
        "level": "INFO",
        "logger": __name__,
        "message": message,
        "formatted": f"{timestamp} [INFO ] {__name__}: {message}",
        "payload": entry_payload,
    })


def _authorized(request: Request) -> bool:
    configured_token = settings.cms_api_token
    supplied_token = request.headers.get("authorization", "").removeprefix("Bearer ").strip()
    return bool(configured_token and supplied_token and secrets.compare_digest(supplied_token, configured_token))


@router.post("/api/client-telemetry")
async def client_telemetry(request: Request):
    try:
        payload = await request.json()
    except Exception:
        payload = None

    logger.debug("Received public client telemetry: %s", payload)
    if isinstance(payload, dict):
        _append_telemetry_log(request, payload)
    return Response(status_code=204)


@router.get("/api/logs/recent")
async def recent_logs(
    request: Request,
    limit: int = Query(200, ge=1, le=500),
    public_only: bool = Query(True),
):
    if not _authorized(request):
        raise HTTPException(status_code=401, detail="Invalid log credentials.")

    entries = list(LOG_BUFFER)[-limit:]
    if public_only:
        entries = [entry for entry in entries if entry["payload"].get("event") == "browser-telemetry"]
    return JSONResponse(entries)
