import secrets

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.routes import pages, finder, telemetry, media
from app.api_client import api
from app.catalogue_cache import catalogue_cache
from app.config import settings
from app.view_templates import templates

app = FastAPI(title="Vent-tech catalogue")

app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/api/site-version", include_in_schema=False)
async def site_version():
    return JSONResponse(
        {"version": settings.app_build_marker},
        headers={"Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"},
    )


@app.post("/api/cache/refresh", include_in_schema=False)
async def refresh_cache(request: Request):
    configured_token = settings.cms_api_token
    authorization = request.headers.get("authorization", "")
    supplied_token = authorization.removeprefix("Bearer ").strip()
    if not configured_token or not supplied_token or not secrets.compare_digest(supplied_token, configured_token):
        raise HTTPException(status_code=401, detail="Invalid cache refresh credentials.")

    await catalogue_cache.refresh()
    snapshot = catalogue_cache.snapshot()
    return {
        "product_types": len(snapshot.product_types),
        "series": len(snapshot.series),
        "products": len(snapshot.products),
        "fetched_at": snapshot.fetched_at,
    }

app.include_router(pages.router)
app.include_router(finder.router)
app.include_router(telemetry.router)
app.include_router(media.router)


@app.middleware("http")
async def prevent_html_caching(request: Request, call_next):
    response = await call_next(request)
    content_type = response.headers.get("content-type", "")
    if content_type.startswith("text/html"):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
    return response


@app.on_event("startup")
async def startup():
    await catalogue_cache.initialize()


@app.on_event("shutdown")
async def shutdown():
    await catalogue_cache.shutdown()


@app.exception_handler(404)
async def not_found(request: Request, exc):
    product_types = catalogue_cache.product_types()
    if not product_types:
        try:
            product_types = await api.product_types()
        except Exception:
            product_types = []

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
