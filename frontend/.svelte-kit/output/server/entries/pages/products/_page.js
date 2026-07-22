import { error } from "@sveltejs/kit";
import { q as getPublicProductTypes, t as getPublicProducts } from "../../../chunks/api.js";
async function load({ fetch, url }) {
  try {
    const search = url.searchParams.get("search") || "";
    const [productTypes, products] = await Promise.all([
      getPublicProductTypes(fetch),
      search ? getPublicProducts({ search }, fetch) : Promise.resolve([])
    ]);
    return { productTypes, products, search };
  } catch (err) {
    throw error(err?.status || 500, err?.message || "Unable to load the public catalog.");
  }
}
export {
  load
};
