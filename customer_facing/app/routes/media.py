from urllib.parse import urlsplit

import httpx
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from app.config import settings

router = APIRouter()


def _backend_media_url(media_path: str) -> str:
    normalized = str(media_path or "").strip()
    if not normalized:
        raise HTTPException(status_code=404, detail="Media not found")

    if normalized.startswith("/api/public/media/"):
        backend_path = normalized
    elif normalized.startswith("/api/cms/media/"):
        backend_path = normalized.replace("/api/cms/media/", "/api/public/media/", 1)
    elif normalized.startswith("/cms/media/"):
        backend_path = normalized.replace("/cms/media/", "/api/public/media/", 1)
    elif normalized.startswith("/media/"):
        backend_path = normalized.replace("/media/", "/api/public/media/", 1)
    else:
        backend_path = f"/api/public/media/{normalized.lstrip('/')}"

    return f"{settings.backend_api_base_url}{backend_path}"


@router.get("/api/public/media/{media_path:path}")
async def proxy_public_media(request: Request, media_path: str):
    backend_url = _backend_media_url(f"/api/public/media/{media_path}")
    query_string = request.url.query
    if query_string:
        backend_url = f"{backend_url}?{query_string}"

    async with httpx.AsyncClient(timeout=settings.request_timeout_seconds, follow_redirects=True) as client:
        try:
            upstream = await client.get(backend_url)
            upstream.raise_for_status()
        except httpx.HTTPStatusError as exc:
            status_code = exc.response.status_code
            detail = exc.response.text.strip() or exc.response.reason_phrase or "Media request failed."
            raise HTTPException(status_code=status_code, detail=detail) from exc
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail="Unable to reach media backend.") from exc

    headers = {}
    for header_name in ("content-type", "content-length", "cache-control", "content-disposition", "etag", "last-modified"):
        if upstream.headers.get(header_name):
            headers[header_name] = upstream.headers[header_name]

    return StreamingResponse(
        iter([upstream.content]),
        status_code=upstream.status_code,
        media_type=upstream.headers.get("content-type"),
        headers=headers,
    )
