import { redirect, error } from "@sveltejs/kit";
async function load({ fetch, params }) {
  const product = params.product || "";
  if (product) {
    const response = await fetch(`/api/products/${encodeURIComponent(product)}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw redirect(307, "/editor/edit");
      }
      throw error(response.status === 404 ? 404 : response.status, "Product not found.");
    }
  }
  return {
    product
  };
}
export {
  load
};
