import { A as API_BASE } from "./config.js";
function url(path) {
  return `${API_BASE}${path}`;
}
async function apiFetch(path, options = {}, fetchImpl = fetch) {
  const response = await fetchImpl(url(path), {
    credentials: "include",
    ...options
  });
  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const rawText = await response.text();
    let message = rawText;
    if (contentType.includes("application/json")) {
      try {
        const payload = JSON.parse(rawText);
        if (typeof payload?.detail === "string") {
          message = payload.detail;
        } else if (Array.isArray(payload?.detail)) {
          message = payload.detail.map((item) => {
            const location = Array.isArray(item?.loc) ? item.loc.filter(Boolean).join(".") : "";
            const prefix = location ? `${location}: ` : "";
            return `${prefix}${item?.msg || "Invalid value"}`;
          }).join("; ");
        } else if (typeof payload?.message === "string") {
          message = payload.message;
        }
      } catch {
        message = rawText;
      }
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return response;
}
async function getAuthSession() {
  const r = await apiFetch("/auth/session");
  return r.json();
}
async function login(username, password) {
  const r = await apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  return r.json();
}
async function logout() {
  const r = await apiFetch("/auth/logout", {
    method: "POST"
  });
  return r.json();
}
async function getProducts(params = {}) {
  const sp = new URLSearchParams(params).toString();
  const r = await apiFetch("/products" + (sp ? "?" + sp : ""));
  return r.json();
}
async function getProductTypes() {
  const r = await apiFetch("/product-types");
  return r.json();
}
async function getSeries(params = {}) {
  const sp = new URLSearchParams(params).toString();
  const r = await apiFetch("/series" + (sp ? "?" + sp : ""));
  return r.json();
}
async function getSeriesById(id) {
  const r = await apiFetch(`/series/${encodeURIComponent(String(id))}`);
  return r.json();
}
async function getPublicSeries(seriesIdentifier, fetchImpl = fetch) {
  const r = await apiFetch(`/public/series/${encodeURIComponent(seriesIdentifier)}`, {}, fetchImpl);
  return r.json();
}
async function getPublicProductTypes(fetchImpl = fetch) {
  const r = await apiFetch("/public/product-types", {}, fetchImpl);
  return r.json();
}
async function getPublicProducts(params = {}, fetchImpl = fetch) {
  const sp = new URLSearchParams(params).toString();
  const r = await apiFetch("/public/products" + (sp ? `?${sp}` : ""), {}, fetchImpl);
  return r.json();
}
async function getPublicProduct(productIdentifier, fetchImpl = fetch) {
  const r = await apiFetch(`/public/products/${encodeURIComponent(productIdentifier)}`, {}, fetchImpl);
  return r.json();
}
async function uploadSeriesImages(seriesId, files) {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  const r = await apiFetch(`/series/${seriesId}/series-images`, {
    method: "POST",
    body: formData
  });
  return r.json();
}
async function reorderSeriesImages(seriesId, imageIds) {
  const r = await apiFetch(`/series/${seriesId}/series-images/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_ids: imageIds })
  });
  return r.json();
}
async function deleteSeriesImage(seriesId, imageId) {
  const r = await apiFetch(`/series/${seriesId}/series-images/${imageId}`, {
    method: "DELETE"
  });
  return r.json();
}
async function getAssociatedDocuments(ownerType, ownerId) {
  const r = await apiFetch(`/${ownerType === "product_type" ? "product-types" : `${ownerType}s`}/${ownerId}/documents`);
  return r.json();
}
async function getProduct(id) {
  const r = await apiFetch(`/products/${id}`);
  return r.json();
}
async function updateProduct(id, body) {
  const r = await apiFetch(`/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return r.json();
}
async function getRpmLines(productId) {
  const r = await apiFetch(`/products/${productId}/rpm-lines`);
  return r.json();
}
async function getRpmPoints(productId) {
  const r = await apiFetch(`/products/${productId}/rpm-points`);
  return r.json();
}
async function getEfficiencyPoints(productId) {
  const r = await apiFetch(`/products/${productId}/efficiency-points`);
  return r.json();
}
async function refreshGraphImage(productId) {
  const r = await apiFetch(`/products/${productId}/graph-image/refresh`, {
    method: "POST"
  });
  return r.json();
}
async function startRefreshProductPdfJob(productId) {
  const r = await apiFetch(`/maintenance/jobs/products/${productId}/pdf/refresh`, {
    method: "POST"
  });
  return r.json();
}
async function getProductChartData(productId) {
  const [rpmLines, rpmPoints, efficiencyPoints] = await Promise.all([
    getRpmLines(productId),
    getRpmPoints(productId),
    getEfficiencyPoints(productId)
  ]);
  return { rpmLines, rpmPoints, efficiencyPoints };
}
async function uploadProductImages(productId, files) {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  const r = await apiFetch(`/products/${productId}/product-images`, {
    method: "POST",
    body: formData
  });
  return r.json();
}
async function reorderProductImages(productId, imageIds) {
  const r = await apiFetch(`/products/${productId}/product-images/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_ids: imageIds })
  });
  return r.json();
}
async function deleteProductImage(productId, imageId) {
  const r = await apiFetch(`/products/${productId}/product-images/${imageId}`, {
    method: "DELETE"
  });
  return r.json();
}
async function getMaintenanceJob(jobId) {
  const r = await apiFetch(`/maintenance/jobs/${jobId}`);
  return r.json();
}
async function getUsers() {
  const r = await apiFetch("/users");
  return r.json();
}
export {
  getProductChartData as A,
  getSeriesById as B,
  reorderProductImages as a,
  uploadProductImages as b,
  getProduct as c,
  deleteProductImage as d,
  getRpmLines as e,
  getRpmPoints as f,
  getProducts as g,
  getEfficiencyPoints as h,
  deleteSeriesImage as i,
  reorderSeriesImages as j,
  uploadSeriesImages as k,
  logout as l,
  login as m,
  getAuthSession as n,
  getMaintenanceJob as o,
  getAssociatedDocuments as p,
  getPublicProductTypes as q,
  refreshGraphImage as r,
  startRefreshProductPdfJob as s,
  getPublicProducts as t,
  updateProduct as u,
  getPublicProduct as v,
  getPublicSeries as w,
  getSeries as x,
  getUsers as y,
  getProductTypes as z
};
