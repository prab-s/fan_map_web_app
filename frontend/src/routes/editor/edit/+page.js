import { error, redirect } from '@sveltejs/kit';

function productEditPath(product = '') {
  return product ? `/editor/edit/${encodeURIComponent(String(product))}` : '/editor/edit';
}

export async function load({ fetch, url }) {
  const product = url.searchParams.get('product') || '';

  if (product) {
    throw redirect(307, productEditPath(product));
  }

  return {
    product: ''
  };
}
