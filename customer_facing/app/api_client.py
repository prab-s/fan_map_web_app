import json
import httpx
import hashlib
import colorsys
from urllib.parse import urlsplit, urlunsplit
from app.config import settings


class ApiClientError(RuntimeError):
    def __init__(self, status_code, message):
        super().__init__(message)
        self.status_code = status_code
        self.message = message


class CatalogueApi:
    def __init__(self):
        self.base_url = settings.backend_api_base_url
        self.timeout = settings.request_timeout_seconds

    async def _get(self, path, params=None):
        url = f"{self.base_url}{path}"

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
            except httpx.HTTPStatusError as exc:
                message = exc.response.text.strip() or exc.response.reason_phrase or "Request failed."
                raise ApiClientError(exc.response.status_code, message) from exc
            return response.json()

    async def product_types(self):
        return await self._get("/api/public/product-types")

    async def products(self, **filters):
        params = {k: v for k, v in filters.items() if v not in (None, "")}

        if isinstance(params.get("parameter_filters"), dict):
            params["parameter_filters"] = json.dumps(params["parameter_filters"])

        return await self._get("/api/public/products", params=params)

    async def product(self, product_id):
        return await self._get(f"/api/public/products/{product_id}")

    async def series_list(self, product_type_key=None):
        params = {"product_type_key": product_type_key} if product_type_key else None
        return await self._get("/api/public/series", params=params)

    async def series(self, series_id):
        return await self._get(f"/api/public/series/{series_id}")

    async def site_page(self, slug):
        return await self._get(f"/api/public/site-pages/{slug}")

    async def site_navigation(self):
        return await self._get("/api/public/site-navigation")

    async def all_product_types_pdf(self):
        metadata_path = "/api/public/catalogue/all-product-types-pdf"
        media_path = "/api/public/media/all-product-types-pdf"
        try:
            metadata = await self._get(metadata_path)
            if metadata.get("available") and metadata.get("size_bytes"):
                return metadata
        except (httpx.HTTPError, ValueError):
            metadata = {}

        # Keep the customer page useful while an older SIT backend is being
        # refreshed: the PDF response itself exposes its exact byte length.
        async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
            try:
                response = await client.head(f"{self.base_url}{media_path}")
                response.raise_for_status()
            except httpx.HTTPStatusError:
                async with client.stream("GET", f"{self.base_url}{media_path}") as response:
                    response.raise_for_status()
                    content_length = response.headers.get("content-length")
                    return {
                        "available": True,
                        "url": media_path,
                        "size_bytes": int(content_length) if content_length else None,
                    }
            content_length = response.headers.get("content-length")
            return {
                "available": True,
                "url": media_path,
                "size_bytes": int(content_length) if content_length else None,
            }

    def media_url(self, relative_url):
        if not relative_url:
            return None

        backend_base = urlsplit(settings.backend_api_base_url)
        parsed_input = urlsplit(str(relative_url).strip())
        if parsed_input.scheme in {"http", "https"}:
            if backend_base.netloc and parsed_input.netloc == backend_base.netloc:
                normalized = parsed_input.path
                if normalized.startswith("/api/cms/media/"):
                    normalized = normalized.replace("/api/cms/media/", "/api/public/media/", 1)
                elif normalized.startswith("/cms/media/"):
                    normalized = normalized.replace("/cms/media/", "/api/public/media/", 1)
                elif normalized.startswith("/media/"):
                    normalized = f"/api/public{normalized}"
                elif not normalized.startswith("/api/public/media/") and "media/" in normalized:
                    normalized = normalized.replace("/media/", "/api/public/media/", 1)

                if parsed_input.query:
                    return urlunsplit(("", "", normalized, parsed_input.query, ""))
                return normalized
            return str(relative_url)

        normalized = parsed_input.path or str(relative_url).strip()
        if not normalized.startswith("/"):
            normalized = f"/{normalized}"

        if normalized.startswith("/api/cms/media/"):
            normalized = normalized.replace("/api/cms/media/", "/api/public/media/", 1)
        elif normalized.startswith("/cms/media/"):
            normalized = normalized.replace("/cms/media/", "/api/public/media/", 1)
        elif normalized.startswith("/media/"):
            normalized = f"/api/public{normalized}"
        elif not normalized.startswith("/api/public/media/") and "media/" in normalized:
            normalized = normalized.replace("/media/", "/api/public/media/", 1)

        if parsed_input.query:
            return urlunsplit(("", "", normalized, parsed_input.query, ""))
        return normalized


api = CatalogueApi()
