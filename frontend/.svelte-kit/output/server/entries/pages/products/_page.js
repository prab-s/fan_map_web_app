import { error } from "@sveltejs/kit";
import { p as getPublicProductTypes } from "../../../chunks/api.js";
async function load({ fetch }) {
  try {
    const productTypes = await getPublicProductTypes(fetch);
    return { productTypes };
  } catch (err) {
    throw error(err?.status || 500, err?.message || "Unable to load the public catalog.");
  }
}
export {
  load
};
