from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, JSONResponse

from app.api_client import api
from app.catalogue_cache import catalogue_cache
from app.catalogue_data import build_finder_metadata, build_series_summary_from_products
from app.view_templates import templates

router = APIRouter()


def _cache_has_any_data() -> bool:
    snapshot = catalogue_cache.snapshot()
    return bool(snapshot.product_types or snapshot.series or snapshot.products)


@router.get("/finder/results", response_class=HTMLResponse)
async def finder_results(
    request: Request,
    product_type_key: str = "",
    search: str = "",
    series_id: str = "",
    parameter_filters: str = "",
):
    if _cache_has_any_data():
        result = catalogue_cache.finder_results(
            product_type_key=product_type_key,
            search=search,
            series_id=series_id or None,
            parameter_filters=parameter_filters or "",
        )
    else:
        products = await api.products(
            search=search,
            product_type_key=product_type_key,
            series_id=series_id or None,
            parameter_filters=parameter_filters or None,
        )
        result = {
            "products": products,
            "series": build_series_summary_from_products(products),
        }

    return templates.TemplateResponse(
        request,
        "partials/product_results.html",
        {
            "request": request,
            "series": result["series"],
            "products": result["products"],
        },
    )


@router.get("/finder/metadata", response_class=JSONResponse)
async def finder_metadata(
    product_type_key: str = "",
    search: str = "",
    series_id: str = "",
    parameter_filters: str = "",
):
    if not product_type_key:
        return JSONResponse({"series": [], "groups": []})

    selected_type = catalogue_cache.product_type(product_type_key)
    if not selected_type:
        try:
            product_types = await api.product_types()
        except Exception:
            product_types = []
        selected_type = next((item for item in product_types if item.get("key") == product_type_key), None)
    if not selected_type:
        return JSONResponse({"series": [], "groups": []})

    if _cache_has_any_data():
        return JSONResponse(
            catalogue_cache.finder_metadata(
                product_type_key=product_type_key,
                search=search,
                series_id=series_id or None,
                parameter_filters=parameter_filters or "",
            )
        )

    product_query = {
        "product_type_key": product_type_key,
        "search": search,
        "parameter_filters": parameter_filters or None,
    }
    if series_id:
        product_query["series_id"] = series_id

    products = await api.products(**product_query)
    return JSONResponse(build_finder_metadata(selected_type, products, product_type_key))
