import logging
import time
import hashlib
import colorsys
import html

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse

from app.api_client import api, ApiClientError
from app.catalogue_cache import catalogue_cache
from app.seo import seo_meta
from app.slug import product_url, products_url, series_url
from app.view_templates import templates

router = APIRouter()
logger = logging.getLogger(__name__)


async def common_context():
    await catalogue_cache.refresh_if_stale()
    product_types = catalogue_cache.product_types()
    return {"product_types": product_types}


def parse_slug_id(value: str) -> int:
    try:
        return int(str(value).split("-", 1)[0])
    except (TypeError, ValueError):
        raise HTTPException(status_code=404) from None


def optional_sections(*pairs):
    return [{"title": title, "html": html} for title, html in pairs if html]


def download_group(title: str, description: str, items: list[dict]) -> dict:
    return {"title": title, "description": description, "links": [item for item in items if item.get("url")]}


def request_quote_url() -> str:
    return "mailto:admin@venttech.co.nz?subject=Vent-Tech%20quote%20request"


def product_type_downloads(selected_type: dict) -> list[dict]:
    items = [
        {"label": "Main catalogue", "url": selected_type.get("product_type_pdf_url"), "note": "Product type overview"},
        {"label": "Printed brochure", "url": selected_type.get("product_type_printed_pdf_url"), "note": "Layout-ready brochure"},
    ]
    return [item for item in items if item["url"]]


def series_downloads(series: dict) -> list[dict]:
    items = [
        {"label": "Series brochure", "url": series.get("series_pdf_url"), "note": "Series overview"},
        {"label": "Printed PDF", "url": series.get("series_printed_pdf_url"), "note": "Press-friendly version"},
        {"label": "Online PDF", "url": series.get("series_online_pdf_url"), "note": "Web-ready version"},
    ]
    return [item for item in items if item["url"]]


SERIES_PERFORMANCE_COLUMN_LIMIT = 3
SERIES_PERFORMANCE_EXCLUDED_GROUP_NAMES = {"__graph__"}


def format_parameter_value(parameter: dict, default_unit: str | None = None) -> str:
    if parameter.get("value_string") not in (None, ""):
        return str(parameter.get("value_string")).strip()

    value_number = parameter.get("value_number")
    if value_number in (None, ""):
        return ""

    try:
        numeric_value = float(value_number)
    except (TypeError, ValueError):
        return str(value_number)

    unit = str(parameter.get("unit") or default_unit or "").strip()
    return f"{numeric_value:g}{f' {unit}' if unit else ''}"


def _template_token_slug(value: str) -> str:
    return "".join(ch if ch.isalnum() else "-" for ch in str(value or "").strip().casefold()).strip("-")


def _series_performance_candidate_columns(series_products: list[dict]) -> list[tuple[str, str, str]]:
    candidate_columns: list[tuple[str, str, str]] = []
    seen_columns: set[tuple[str, str]] = set()

    for product in series_products or []:
        for group in sorted(product.get("parameter_groups", []) or [], key=lambda item: (item.get("sort_order", 0), item.get("id", 0))):
            group_name = str(group.get("group_name") or "").strip()
            if not group_name or group_name.casefold() in SERIES_PERFORMANCE_EXCLUDED_GROUP_NAMES:
                continue
            for parameter in sorted(group.get("parameters", []) or [], key=lambda item: (item.get("sort_order", 0), item.get("id", 0))):
                parameter_name = str(parameter.get("parameter_name") or "").strip()
                if not parameter_name:
                    continue

                key = (group_name, parameter_name)
                if key in seen_columns:
                    continue

                seen_columns.add(key)
                candidate_columns.append((group_name, parameter_name, f"{group_name}: {parameter_name}"))
                if len(candidate_columns) >= SERIES_PERFORMANCE_COLUMN_LIMIT:
                    return candidate_columns

    return candidate_columns


def _series_type_2_performance_columns(series_products: list[dict]) -> list[tuple[str, str, str]]:
    selected_columns: list[tuple[str, str, str]] = []
    seen_columns: set[tuple[str, str]] = set()
    main_parameter_count = 0
    impeller_size_selected = False

    for product in series_products or []:
        for group in sorted(product.get("parameter_groups", []) or [], key=lambda item: (item.get("sort_order", 0), item.get("id", 0))):
            group_name = str(group.get("group_name") or "").strip()
            if not group_name or group_name.casefold() in SERIES_PERFORMANCE_EXCLUDED_GROUP_NAMES:
                continue

            group_slug = _template_token_slug(group_name)
            for parameter in sorted(group.get("parameters", []) or [], key=lambda item: (item.get("sort_order", 0), item.get("id", 0))):
                parameter_name = str(parameter.get("parameter_name") or "").strip()
                if not parameter_name:
                    continue

                key = (group_name, parameter_name)
                if key in seen_columns:
                    continue

                if group_slug == "main" and main_parameter_count < 2:
                    selected_columns.append((group_name, parameter_name, parameter_name))
                    seen_columns.add(key)
                    main_parameter_count += 1
                    if len(selected_columns) >= SERIES_PERFORMANCE_COLUMN_LIMIT:
                        return selected_columns
                    continue

                if group_slug == "impeller" and parameter_name.casefold() == "size" and not impeller_size_selected:
                    selected_columns.append((group_name, parameter_name, "Impeller size"))
                    seen_columns.add(key)
                    impeller_size_selected = True
                    if len(selected_columns) >= SERIES_PERFORMANCE_COLUMN_LIMIT:
                        return selected_columns

        if len(selected_columns) >= SERIES_PERFORMANCE_COLUMN_LIMIT:
            return selected_columns

    if len(selected_columns) < SERIES_PERFORMANCE_COLUMN_LIMIT:
        for column in _series_performance_candidate_columns(series_products):
            key = (column[0], column[1])
            if key in seen_columns:
                continue
            selected_columns.append((column[0], column[1], column[2]))
            seen_columns.add(key)
            if len(selected_columns) >= SERIES_PERFORMANCE_COLUMN_LIMIT:
                break

    return selected_columns[:SERIES_PERFORMANCE_COLUMN_LIMIT]


def _series_performance_value_map(product: dict) -> dict[tuple[str, str], str]:
    values: dict[tuple[str, str], str] = {}
    for group in product.get("parameter_groups", []) or []:
        group_name = str(group.get("group_name") or "").strip()
        if not group_name or group_name.casefold() in SERIES_PERFORMANCE_EXCLUDED_GROUP_NAMES:
            continue
        for parameter in group.get("parameters", []) or []:
            parameter_name = str(parameter.get("parameter_name") or "").strip()
            if not parameter_name:
                continue
            default_unit = "mm" if _template_token_slug(group_name) == "impeller" and parameter_name.casefold() == "size" else None
            values[(group_name, parameter_name)] = format_parameter_value(parameter, default_unit=default_unit) or "—"
    return values


def _format_range(values: list[float], unit: str = "", precision: int = 0) -> str:
    if not values:
        return "—"
    minimum = min(values)
    maximum = max(values)
    if precision > 0:
        minimum_text = f"{minimum:.{precision}f}".rstrip("0").rstrip(".")
        maximum_text = f"{maximum:.{precision}f}".rstrip("0").rstrip(".")
    else:
        minimum_text = f"{minimum:g}"
        maximum_text = f"{maximum:g}"
    unit_text = f" {unit}" if unit else ""
    if minimum_text == maximum_text:
        return f"{minimum_text}{unit_text}"
    return f"{minimum_text} - {maximum_text}{unit_text}"


def _product_performance_ranges(product: dict) -> dict[str, str]:
    airflow_values: list[float] = []
    pressure_values: list[float] = []
    power_values: list[float] = []
    swl_values: list[float] = []

    for line in sorted(product.get("rpm_lines", []) or [], key=lambda item: item.get("rpm", 0)):
        for point in line.get("points", []) or []:
            if point.get("airflow") is not None:
                airflow_values.append(float(point.get("airflow")))
            if point.get("pressure") is not None:
                pressure_values.append(float(point.get("pressure")))

    fan_table = product.get("fan_acoustic_table") or {}
    for row in fan_table.get("rows") or []:
        if not isinstance(row, dict):
            continue
        if row.get("peak_power_kw") not in {None, ""}:
            try:
                power_values.append(float(row.get("peak_power_kw")))
            except (TypeError, ValueError):
                pass
        sound_power_levels = row.get("sound_power_levels") or {}
        if isinstance(sound_power_levels, dict):
            for value in sound_power_levels.values():
                if value in {None, ""}:
                    continue
                try:
                    swl_values.append(float(value))
                except (TypeError, ValueError):
                    continue

    return {
        "pressure_range": _format_range(pressure_values, "Pa"),
        "airflow_range": _format_range(airflow_values, "L/s"),
        "swl_range": _format_range(swl_values, "dB"),
        "power_range": _format_range(power_values, "kW", precision=2),
    }


def render_series_performance_table_html(series: dict, series_products: list[dict]) -> str:
    ordered_products = sorted(series_products or [], key=lambda item: str(item.get("model") or "").casefold())
    if not ordered_products:
        return '<p class="performance-table__empty text-muted mb-0">No products are linked to this series yet.</p>'

    template_id = series.get("printed_template_id") or series.get("online_template_id") or series.get("template_id")
    if template_id == "series-series_type_2":
        performance_columns = _series_type_2_performance_columns(ordered_products)
    else:
        performance_columns = _series_performance_candidate_columns(ordered_products)

    performance_columns = list(performance_columns[:SERIES_PERFORMANCE_COLUMN_LIMIT])
    while len(performance_columns) < SERIES_PERFORMANCE_COLUMN_LIMIT:
        performance_columns.append(("", "", "—"))

    performance_column_labels = [column[2] for column in performance_columns]

    rows: list[str] = []
    for product in ordered_products:
        values = _series_performance_value_map(product)
        ranges = _product_performance_ranges(product)
        cells = [
            f"<td>{html.escape(str(product.get('model') or '—'))}</td>",
            *[
                f"<td>{html.escape(values.get((group_name, parameter_name), '—'))}</td>"
                for group_name, parameter_name, _ in performance_columns
            ],
            f"<td>{html.escape(ranges['pressure_range'])}</td>",
            f"<td>{html.escape(ranges['airflow_range'])}</td>",
            f"<td>{html.escape(ranges['swl_range'])}</td>",
            f"<td>{html.escape(ranges['power_range'])}</td>",
        ]
        rows.append("<tr>" + "".join(cells) + "</tr>")

    return (
        '<div class="performance-table">'
        '<div class="table-responsive performance-table__wrap">'
        '<table class="table table-sm align-middle mb-0 performance-table__table">'
        '<colgroup>'
        '<col class="performance-table__col performance-table__col--model" />'
        + "".join('<col class="performance-table__col performance-table__col--spec" />' for _ in performance_column_labels)
        + '<col class="performance-table__col performance-table__col--range" />'
        + '<col class="performance-table__col performance-table__col--range" />'
        + '<col class="performance-table__col performance-table__col--range" />'
        + '<col class="performance-table__col performance-table__col--range" />'
        + '</colgroup>'
        '<thead><tr>'
        '<th scope="col">Model</th>'
        + "".join(f"<th scope=\"col\">{html.escape(label)}</th>" for label in performance_column_labels)
        + '<th scope="col">Pressure Range</th>'
        + '<th scope="col">Airflow Range</th>'
        + '<th scope="col">SWL Range</th>'
        + '<th scope="col">Power Range</th>'
        + '</tr></thead><tbody>'
        + "".join(rows)
        + '</tbody></table></div></div>'
    )


def product_downloads(product: dict) -> list[dict]:
    items = [
        {"label": "Model datasheet", "url": product.get("product_pdf_url"), "note": "Exact model PDF"},
        {"label": "Printed PDF", "url": product.get("product_printed_pdf_url"), "note": "Press-friendly version"},
        {"label": "Online PDF", "url": product.get("product_online_pdf_url"), "note": "Web-ready version"},
    ]
    return [item for item in items if item["url"]]


def product_color_for_identity(identity: int | str | None) -> str:
    if identity in (None, ""):
        return "#64748b"
    digest = hashlib.sha1(str(identity).encode("utf-8")).digest()
    hue = int.from_bytes(digest[:2], "big") / 65535.0
    saturation = 0.62 + (digest[2] / 255.0) * 0.18
    lightness = 0.44 + (digest[3] / 255.0) * 0.08
    red, green, blue = colorsys.hls_to_rgb(hue, lightness, saturation)
    return "#{:02x}{:02x}{:02x}".format(int(red * 255 * 0.72), int(green * 255 * 0.72), int(blue * 255 * 0.72))


def build_product_graph_payload(product: dict, product_type: dict | None) -> dict:
    graph_config_source = product_type or {}

    def resolve_field(name: str, fallback=None):
        value = graph_config_source.get(name)
        if value not in (None, ""):
            return value
        value = product.get(name)
        if value not in (None, ""):
            return value
        return fallback

    rpm_lines = []
    for index, line in enumerate(sorted(product.get("rpm_lines", []) or [], key=lambda item: (item.get("rpm", 0), item.get("id", 0)))):
        rpm_lines.append({
            "rpm": line.get("rpm"),
            "band_color": line.get("band_color"),
            "sort_order": line.get("sort_order", index),
            "points": [
                {
                    "airflow": point.get("airflow"),
                    "pressure": point.get("pressure"),
                    "sort_order": point.get("sort_order", point_index),
                }
                for point_index, point in enumerate(sorted(line.get("points", []) or [], key=lambda item: item.get("sort_order", item.get("id", 0))))
            ],
        })

    efficiency_points = []
    for index, point in enumerate(sorted(product.get("efficiency_points", []) or [], key=lambda item: (item.get("airflow", 0), item.get("id", 0)))):
        efficiency_points.append({
            "airflow": point.get("airflow"),
            "sort_order": point.get("sort_order", index),
            "efficiency_centre": point.get("efficiency_centre"),
            "efficiency_lower_end": point.get("efficiency_lower_end"),
            "efficiency_higher_end": point.get("efficiency_higher_end"),
            "permissible_use": point.get("permissible_use"),
        })

    product_type_name = str(product.get("product_type_label") or product_type.get("label") or product_type.get("key") or "").strip()
    series_name = str(product.get("series_name") or "").strip()
    product_name = str(product.get("model") or "").strip()
    title_prefix = f"{product_type_name} | " if product_type_name else ""
    title_middle = f"{series_name} - " if series_name else ""
    graph_title = f"{title_prefix}{title_middle}{product_name} performance graph".strip()

    return {
        "productModel": product.get("model"),
        "graphTitle": graph_title,
        "graphMode": "product",
        "hasGraphData": bool(rpm_lines or efficiency_points),
        "graphConfig": {
            "graph_kind": resolve_field("graph_kind"),
            "supports_graph": bool(resolve_field("supports_graph", False)),
            "supports_graph_overlays": bool(resolve_field("supports_graph_overlays", True)),
            "supports_band_graph_style": bool(resolve_field("supports_band_graph_style", True)),
            "graph_line_value_label": resolve_field("graph_line_value_label"),
            "graph_line_value_unit": resolve_field("graph_line_value_unit"),
            "graph_x_axis_label": resolve_field("graph_x_axis_label"),
            "graph_x_axis_unit": resolve_field("graph_x_axis_unit"),
            "graph_y_axis_label": resolve_field("graph_y_axis_label"),
            "graph_y_axis_unit": resolve_field("graph_y_axis_unit"),
            "band_graph_background_color": resolve_field("band_graph_background_color"),
            "band_graph_label_text_color": resolve_field("band_graph_label_text_color"),
            "band_graph_faded_opacity": resolve_field("band_graph_faded_opacity"),
            "band_graph_permissible_label_color": resolve_field("band_graph_permissible_label_color"),
        },
        "showRpmBandShading": bool(product.get("show_rpm_band_shading", True)),
        "rpmLines": rpm_lines,
        "efficiencyPoints": efficiency_points,
    }


def build_series_graph_payload(series: dict, product_type: dict | None, series_products: list[dict]) -> dict:
    graph_config_source = product_type or {}

    def resolve_field(name: str, fallback=None):
        value = graph_config_source.get(name)
        if value not in (None, ""):
            return value
        return fallback

    if not product_type or not product_type.get("supports_graph", False):
        return {
            "productModel": series.get("name"),
            "graphTitle": f"{str(series.get('name') or '').strip()} performance graph".strip(),
            "graphMode": "series",
            "hasGraphData": False,
            "graphConfig": {
                "graph_kind": resolve_field("graph_kind"),
                "supports_graph": False,
                "supports_graph_overlays": bool(resolve_field("supports_graph_overlays", True)),
                "supports_band_graph_style": bool(resolve_field("supports_band_graph_style", True)),
                "graph_line_value_label": resolve_field("graph_line_value_label"),
                "graph_line_value_unit": resolve_field("graph_line_value_unit"),
                "graph_x_axis_label": resolve_field("graph_x_axis_label"),
                "graph_x_axis_unit": resolve_field("graph_x_axis_unit"),
                "graph_y_axis_label": resolve_field("graph_y_axis_label"),
                "graph_y_axis_unit": resolve_field("graph_y_axis_unit"),
            },
            "showRpmBandShading": False,
            "rpmLines": [],
            "efficiencyPoints": [],
        }

    synthetic_lines: list[dict] = []
    next_line_id = 1

    ordered_products = sorted(series_products or [], key=lambda item: str(item.get("model") or "").casefold())
    for product in ordered_products:
        ordered_lines = sorted(product.get("rpm_lines", []) or [], key=lambda item: (item.get("rpm", 0), item.get("id", 0)))
        if not ordered_lines:
            continue
        product_color = product_color_for_identity(product.get("id"))

        selected_lines = [line for line in ordered_lines if line.get("points")]
        if not selected_lines:
            continue
        if len(selected_lines) > 1:
            selected_lines = [selected_lines[0], selected_lines[-1]]

        for index, line in enumerate(selected_lines):
            synthetic_line_id = next_line_id
            next_line_id += 1
            line_rpm = line.get("rpm")
            display_label = (
                f"{product.get('model')} low"
                if len(selected_lines) > 1 and index == 0
                else f"{product.get('model')} high"
                if len(selected_lines) > 1
                else f"{product.get('model')}"
            )
            synthetic_lines.append({
                "id": synthetic_line_id,
                "rpm": synthetic_line_id,
                "display_label": display_label,
                "band_color": product_color,
                "line_role": "low" if len(selected_lines) > 1 and index == 0 else "high",
                "points": [],
            })
            for point in sorted(line.get("points", []) or [], key=lambda item: (item.get("airflow", 0), item.get("id", 0))):
                synthetic_lines[-1]["points"].append({
                    "id": point.get("id"),
                    "airflow": point.get("airflow"),
                    "pressure": point.get("pressure"),
                })

    return {
        "productModel": series.get("name"),
        "graphTitle": f"{str(series.get('name') or '').strip()} performance graph".strip(),
        "graphMode": "series",
        "hasGraphData": bool(synthetic_lines),
        "graphConfig": {
            "graph_kind": resolve_field("graph_kind"),
            "supports_graph": True,
            "supports_graph_overlays": bool(resolve_field("supports_graph_overlays", True)),
            "supports_band_graph_style": bool(resolve_field("supports_band_graph_style", True)),
            "graph_line_value_label": resolve_field("graph_line_value_label"),
            "graph_line_value_unit": resolve_field("graph_line_value_unit"),
            "graph_x_axis_label": resolve_field("graph_x_axis_label"),
            "graph_x_axis_unit": resolve_field("graph_x_axis_unit"),
            "graph_y_axis_label": resolve_field("graph_y_axis_label"),
            "graph_y_axis_unit": resolve_field("graph_y_axis_unit"),
            "band_graph_background_color": resolve_field("band_graph_background_color"),
            "band_graph_label_text_color": resolve_field("band_graph_label_text_color"),
            "band_graph_faded_opacity": resolve_field("band_graph_faded_opacity"),
            "band_graph_permissible_label_color": resolve_field("band_graph_permissible_label_color"),
        },
        "showRpmBandShading": False,
        "rpmLines": synthetic_lines,
        "efficiencyPoints": [],
    }


@router.get("/")
async def homepage(request: Request):
    start = time.perf_counter()
    context = await common_context()
    product_types = context["product_types"]
    featured_product_type = product_types[0] if product_types else None
    home_product_types = []
    for product_type in product_types:
        preview_images = []
        type_products = catalogue_cache.products(product_type_key=product_type.get("key", ""))
        series_list = catalogue_cache.series_list(product_type_key=product_type.get("key", ""))
        first_product_by_series: dict[str, dict] = {}
        for product in type_products:
            series_id = product.get("series_id")
            if series_id is None:
                continue
            series_key = str(series_id)
            if series_key not in first_product_by_series:
                first_product_by_series[series_key] = product

        for series in series_list:
            series_product = first_product_by_series.get(str(series.get("id")))
            if not series_product:
                continue
            preview_image_url = series_product.get("primary_product_image_url") or series_product.get("graph_image_url")
            if preview_image_url:
                preview_images.append(preview_image_url)

        if len(preview_images) < 4:
            seen_images = set(preview_images)
            for product in type_products:
                for preview_image_url in (
                    product.get("primary_product_image_url"),
                    product.get("graph_image_url"),
                ):
                    if not preview_image_url or preview_image_url in seen_images:
                        continue
                    preview_images.append(preview_image_url)
                    seen_images.add(preview_image_url)
                    if len(preview_images) >= 4:
                        break
                if len(preview_images) >= 4:
                    break

        if not preview_images:
            fallback_image = product_type.get("contents_icon_url")
            if fallback_image:
                preview_images = [fallback_image]

        home_product_types.append({
            **product_type,
            "preview_images": preview_images,
            "series_count": len(series_list),
            "product_count": len(type_products),
        })
    context.update({
        "request": request,
        "seo": seo_meta(
            "Vent-tech catalogue",
            "Overview of the Vent-tech catalogue and product types.",
            "/",
        ),
        "featured_product_type": featured_product_type,
        "home_product_types": home_product_types,
    })
    logger.info("Rendered homepage in %.1fms (%d product types)", (time.perf_counter() - start) * 1000.0, len(product_types))
    return templates.TemplateResponse(request, "index.html", context)


@router.get("/products")
async def products_page(request: Request):
    start = time.perf_counter()
    products = catalogue_cache.products()
    context = await common_context()
    context.update({
        "request": request,
        "seo": seo_meta(
            "Product Finder",
            "Find suitable industrial products by product type, mounting style, discharge type, and specification range.",
            products_url(),
        ),
        "products": products,
    })
    logger.info(
        "Rendered products page in %.1fms (%d products, %d product types)",
        (time.perf_counter() - start) * 1000.0,
        len(products),
        len(context["product_types"]),
    )
    return templates.TemplateResponse(request, "products.html", context)


@router.get("/contact")
async def contact_page(request: Request):
    context = await common_context()
    context.update({
        "request": request,
        "seo": seo_meta(
            "Contact Vent-Tech",
            "Get in touch with Vent-Tech for selection support, quotations, and project enquiries.",
            "/contact",
        ),
        "request_quote_url": request_quote_url(),
    })
    return templates.TemplateResponse(request, "contact.html", context)


@router.get("/engineering-services")
async def engineering_services_page(request: Request):
    context = await common_context()
    context.update({
        "request": request,
        "seo": seo_meta(
            "Engineering services",
            "Laser cutting, brake pressing, rolling, and flanging services for custom fabrication and project support.",
            "/engineering-services",
        ),
        "request_quote_url": request_quote_url(),
        "services": [
            {
                "title": "Laser cutter",
                "summary": "Fast, precise cutting for sheet metal parts, cut-outs, brackets, panels, and repeatable fabrication work.",
                "image": "/static/media/laser-cutter.svg",
                "points": [
                    "Clean profiles with consistent edges",
                    "Ideal for one-offs, short runs, and repeat jobs",
                    "Supports detailed openings and custom shapes",
                ],
                "badge": "Precision cutting",
                "tone": "laser",
            },
            {
                "title": "Brake press",
                "summary": "Accurate folding for enclosures, returns, brackets, and formed components that need repeatable angles.",
                "image": "/static/media/brake-press.svg",
                "points": [
                    "Reliable bends and formed sections",
                    "Good for enclosures and structural parts",
                    "Helps move from flat sheet to finished parts",
                ],
                "badge": "Clean folds",
                "tone": "press",
            },
            {
                "title": "Roller",
                "summary": "Rolling for curved sections, arcs, cylindrical forms, and other components that need a controlled radius.",
                "image": "/static/media/roller.svg",
                "points": [
                    "Curved profiles and rolled sections",
                    "Useful for ducting and shaped assemblies",
                    "Supports gentle forming without harsh edges",
                ],
                "badge": "Controlled curves",
                "tone": "roller",
            },
            {
                "title": "Flanger",
                "summary": "Edge forming and stiffening for components that need a flange, a stronger rim, or a cleaner join.",
                "image": "/static/media/flanger.svg",
                "points": [
                    "Strengthens edges and improves rigidity",
                    "Helps prepare parts for assembly",
                    "Useful on round and custom fabricated components",
                ],
                "badge": "Stiffened edges",
                "tone": "flange",
            },
        ],
    })
    return templates.TemplateResponse(request, "engineering_services.html", context)


@router.get("/finder")
async def finder_page_redirect():
    return RedirectResponse(products_url(), status_code=307)


@router.get("/products/type/{product_type_key}")
async def product_type_page(request: Request, product_type_key: str):
    start = time.perf_counter()
    selected_type = catalogue_cache.product_type(product_type_key)

    if not selected_type:
        raise HTTPException(status_code=404)

    series = catalogue_cache.series_list(product_type_key=product_type_key)
    products = catalogue_cache.products(product_type_key=product_type_key)

    context = await common_context()
    context.update({
        "request": request,
        "seo": seo_meta(
            selected_type["label"],
            f"Browse {selected_type['label']} series and products.",
            f"/products/type/{product_type_key}",
        ),
        "selected_type": selected_type,
        "series": series,
        "products": products,
        "product_type_downloads": product_type_downloads(selected_type),
        "request_quote_url": request_quote_url(),
    })
    logger.info(
        "Rendered product type page %s in %.1fms (%d series, %d products)",
        product_type_key,
        (time.perf_counter() - start) * 1000.0,
        len(series),
        len(products),
    )
    return templates.TemplateResponse(request, "product_type.html", context)


@router.get("/series/{series_slug}")
async def series_page(request: Request, series_slug: str):
    start = time.perf_counter()
    series_id = parse_slug_id(series_slug)
    try:
        series = await api.series(series_id)
    except ApiClientError as exc:
        if exc.status_code == 404:
            raise HTTPException(status_code=404) from exc
        raise

    canonical_path = series_url(series)
    if request.url.path != canonical_path:
        return RedirectResponse(canonical_path, status_code=307)

    cached_products = catalogue_cache.products(series_id=series_id)

    context = await common_context()
    product_type = catalogue_cache.product_type(series.get("product_type_key"))
    context.update({
        "request": request,
        "seo": seo_meta(
            series["name"],
            f"View product information, specifications, graphs, PDFs, and models for {series['name']}.",
            canonical_path,
        ),
        "series": series,
        "product_type": product_type,
        "series_products": cached_products,
        "series_downloads": series_downloads(series),
        "product_type_downloads": product_type_downloads(product_type) if product_type else [],
        "request_quote_url": request_quote_url(),
        "series_graph": build_series_graph_payload(series, product_type, cached_products),
        "series_performance_table_html": render_series_performance_table_html(series, cached_products),
        "series_sections": optional_sections(
            ("Overview", series.get("description1_html")),
            ("Features", series.get("description2_html")),
            ("Specifications", series.get("description3_html")),
            ("Notes", series.get("comments_html")),
        ),
    })

    logger.info(
        "Rendered series page %s in %.1fms (%d cached products)",
        series_id,
        (time.perf_counter() - start) * 1000.0,
        len(cached_products),
    )

    return templates.TemplateResponse(request, "series.html", context)


@router.get("/products/{product_slug}")
async def product_page(request: Request, product_slug: str):
    start = time.perf_counter()
    product_id = parse_slug_id(product_slug)
    try:
        product = await api.product(product_id)
    except ApiClientError as exc:
        if exc.status_code == 404:
            raise HTTPException(status_code=404) from exc
        raise

    canonical_path = product_url(product)
    if request.url.path != canonical_path:
        return RedirectResponse(canonical_path, status_code=307)

    context = await common_context()
    product_type = catalogue_cache.product_type(product.get("product_type_key"))
    series = await api.series(product["series_id"]) if product.get("series_id") else None
    context.update({
        "request": request,
        "seo": seo_meta(
            product["model"],
            f"View specifications, graphs, images, and PDFs for {product['model']}.",
            canonical_path,
        ),
        "product": product,
        "product_type": product_type,
        "series": series,
        "product_downloads": product_downloads(product),
        "series_downloads": series_downloads(series) if series else [],
        "product_type_downloads": product_type_downloads(product_type) if product_type else [],
        "request_quote_url": request_quote_url(),
        "product_graph": build_product_graph_payload(product, product_type),
        "product_sections": optional_sections(
            ("Overview", product.get("description1_html")),
            ("Features", product.get("description2_html")),
            ("Specifications", product.get("description3_html")),
            ("Notes", product.get("comments_html")),
        ),
    })

    logger.info("Rendered product page %s in %.1fms", product_id, (time.perf_counter() - start) * 1000.0)

    return templates.TemplateResponse(request, "product.html", context)
