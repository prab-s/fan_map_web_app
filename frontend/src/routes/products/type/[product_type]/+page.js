import { error } from '@sveltejs/kit';
import { getPublicProducts, getPublicProductTypes } from '$lib/api.js';

export async function load({ fetch, params }) {
  const productTypeKey = params.product_type;

  try {
    const [productTypes, products] = await Promise.all([
      getPublicProductTypes(fetch),
      getPublicProducts({ product_type_key: productTypeKey }, fetch)
    ]);
    return {
      productTypeKey,
      productTypes,
      products
    };
  } catch (err) {
    if (err?.status === 404) {
      throw error(404, 'Product type not found.');
    }
    throw error(err?.status || 500, err?.message || 'Unable to load this product type.');
  }
}
