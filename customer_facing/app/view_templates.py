from pathlib import Path
import re

from fastapi.templating import Jinja2Templates

from app.api_client import api
from app.config import settings
from app.slug import product_url, series_url, product_type_url, products_url
from app.catalogue_data import fan_acoustic_table_variant

APP_DIR = Path(__file__).resolve().parent
TEMPLATE_DIR = APP_DIR / "templates"


def format_numeric_value(value):
    if value is None or value == "":
        return ""
    try:
        numeric_value = float(value)
    except (TypeError, ValueError):
        return value
    return f"{numeric_value:g}"


def phone_href(value):
    """Convert a displayed NZ phone number into a dialling-safe href value."""
    digits = re.sub(r"\D", "", str(value or ""))
    if digits.startswith("0"):
        digits = "64" + digits[1:]
    return f"+{digits}" if digits else ""


templates = Jinja2Templates(directory=str(TEMPLATE_DIR))
templates.env.globals["product_url"] = product_url
templates.env.globals["series_url"] = series_url
templates.env.globals["product_type_url"] = product_type_url
templates.env.globals["products_url"] = products_url
templates.env.globals["media_url"] = api.media_url
templates.env.globals["site_name"] = settings.site_name
templates.env.globals["app_build_marker"] = settings.app_build_marker
templates.env.globals["finder_debug"] = settings.finder_debug
templates.env.globals["backend_api_base_url"] = settings.backend_api_base_url
templates.env.globals["quote_request_endpoint_url"] = "/api/quote-requests"
templates.env.globals["fan_acoustic_table_variant"] = fan_acoustic_table_variant
templates.env.globals["site_contact"] = {
    "address": "576c Fergusson Drive, Upper Hutt 5018, Wellington",
    "admin_phone": "04 595 1403",
    "admin_email": "admin@venttech.co.nz",
    "gerald_phone": "022 0697 270",
    "gerald_email": "gerald@venttech.co.nz",
    "mahendra_phone": "027 5560 197",
    "mahendra_email": "mahendra@venttech.co.nz",
    "alex_phone": "027 815 9924",
    "alex_email": "alex@venttech.co.nz",
    "nilesh_phone": "021 088 969 55",
    "nilesh_email": "nilesh@venttech.co.nz",
    "request_quote_url": "#quoteRequestModal",
}
templates.env.filters["format_numeric_value"] = format_numeric_value
templates.env.filters["phone_href"] = phone_href
