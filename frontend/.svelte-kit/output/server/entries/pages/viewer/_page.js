import { redirect } from "@sveltejs/kit";
function viewerPath(tab, record = "") {
  const nextTab = tab || "product";
  const nextRecord = record == null || record === "" ? "" : `/${encodeURIComponent(String(record))}`;
  return `/viewer/${nextTab}${nextRecord}`;
}
function load({ url }) {
  const tab = url.searchParams.get("tab") || "";
  const product = url.searchParams.get("product") || "";
  const productType = url.searchParams.get("product_type") || "";
  const series = url.searchParams.get("series") || "";
  if (tab === "series" || !tab && series) {
    throw redirect(307, viewerPath("series", series));
  }
  if (tab === "product-type" || !tab && productType) {
    throw redirect(307, viewerPath("product-type", productType));
  }
  if (tab === "product" || !tab && product) {
    throw redirect(307, viewerPath("product", product));
  }
  throw redirect(307, viewerPath("product"));
}
export {
  load
};
