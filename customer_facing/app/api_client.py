import asyncio
import json
import logging
from urllib.parse import urlparse
import httpx
from app.config import settings


logger = logging.getLogger(__name__)


class ApiClientError(Exception):
    def __init__(self, status_code, message):
        self.status_code = status_code
        self.message = message
        super().__init__(message)


class CatalogueApi:
    def __init__(self):
        self.base_url = settings.backend_api_base_url
        self.timeout = settings.request_timeout_seconds
        self.cms_api_token = settings.cms_api_token
        self._client: httpx.AsyncClient | None = None
        self._client_lock = asyncio.Lock()

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is not None:
            return self._client

        async with self._client_lock:
            if self._client is None:
                self._client = httpx.AsyncClient(timeout=self.timeout)
        return self._client

    async def aclose(self):
        if self._client is None:
            return

        await self._client.aclose()
        self._client = None

    async def _get(self, path, params=None):
        url = f"{self.base_url}{path}"
        headers = {}

        if self.cms_api_token:
            headers["Authorization"] = f"Bearer {self.cms_api_token}"

        logger.debug("catalogue api request url=%s params=%s", url, params or {})

        client = await self._get_client()
        try:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            detail = exc.response.text.strip() or f"Catalogue API request failed with status {exc.response.status_code}."
            raise ApiClientError(exc.response.status_code, detail) from exc
        except httpx.HTTPError as exc:
            raise ApiClientError(502, "Catalogue API is unavailable right now.") from exc

        logger.debug("catalogue api response url=%s status=%s bytes=%s", url, response.status_code, len(response.content))
        return response.json()

    async def product_types(self):
        return await self._get("/api/public/product-types")

    async def products(self, **filters):
        params = {k: v for k, v in filters.items() if v not in (None, "")}

        if isinstance(params.get("parameter_filters"), dict):
            params["parameter_filters"] = json.dumps(params["parameter_filters"])

        return await self._get("/api/public/products", params=params)

    async def product_graph_values(self, **filters):
        params = {k: v for k, v in filters.items() if v not in (None, "")}

        if isinstance(params.get("parameter_filters"), dict):
            params["parameter_filters"] = json.dumps(params["parameter_filters"])

        return await self._get("/api/public/product-graph-values", params=params)

    async def product(self, product_id):
        return await self._get(f"/api/public/products/{product_id}")

    async def series_list(self, product_type_key=None):
        params = {"product_type_key": product_type_key} if product_type_key else None
        return await self._get("/api/public/series", params=params)

    async def series(self, series_id):
        return await self._get(f"/api/public/series/{series_id}")

    def media_url(self, relative_url):
        if not relative_url:
            return None

        if relative_url.startswith("http://") or relative_url.startswith("https://"):
            parsed = urlparse(relative_url)
            backend_base = urlparse(self.base_url)
            if (
                parsed.scheme == backend_base.scheme
                and parsed.netloc == backend_base.netloc
            ):
                relative_url = parsed.path
                if parsed.query:
                    relative_url = f"{relative_url}?{parsed.query}"
            else:
                return relative_url

        if relative_url.startswith("/api/cms/media/"):
            relative_url = relative_url.replace("/api/cms/media/", "/api/public/media/", 1)

        if not relative_url.startswith("/"):
            return f"/{relative_url}"

        return relative_url


api = CatalogueApi()
