from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from app.routes import pages, finder
from app.api_client import api
from app.view_templates import templates

app = FastAPI(title="Vent-tech catalogue")

app.mount("/static", StaticFiles(directory="app/static"), name="static")

app.include_router(pages.router)
app.include_router(finder.router)


@app.exception_handler(404)
async def not_found(request: Request, exc):
    product_types = []

    try:
        product_types = await api.product_types()
    except Exception:
        pass

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
