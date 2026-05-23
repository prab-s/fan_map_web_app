import { error, redirect } from '@sveltejs/kit';

function productTypeEditPath(productType = '') {
  return productType ? `/editor/product-types/edit/${encodeURIComponent(String(productType))}` : '/editor/product-types/edit';
}

export async function load({ fetch, url }) {
  const product_type = url.searchParams.get('product_type') || '';

  if (product_type) {
    throw redirect(307, productTypeEditPath(product_type));
  }

  return {
    product_type: ''
  };
}
