import { error } from "@sveltejs/kit";
import { q as getPublicProduct, l as getPublicProductTypes } from "../../../../chunks/api.js";
async function load({ fetch, params }) {
  const productIdentifier = params.product;
  try {
    const [product, productTypes] = await Promise.all([
      getPublicProduct(productIdentifier, fetch),
      getPublicProductTypes(fetch)
    ]);
    return {
      productIdentifier,
      product,
      productTypes
    };
  } catch (err) {
    if (err?.status === 404) {
      throw error(404, "Product not found.");
    }
    throw error(err?.status || 500, err?.message || "Unable to load the product.");
  }
}
export {
  load
};
