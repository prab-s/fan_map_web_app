import { error, redirect } from '@sveltejs/kit';

export async function load({ fetch, params }) {
  const product_type = params.product_type || '';

  if (product_type) {
    const response = await fetch('/api/product-types');
    if (!response.ok) {
      throw error(response.status, 'Unable to load product types.');
    }

    const productTypes = await response.json();
    if (!productTypes.some((productType) => String(productType.id) === String(product_type))) {
      throw redirect(307, '/editor/product-types/edit');
    }
  }

  return {
    product_type
  };
}
