import { error } from '@sveltejs/kit';
import { getPublicProductTypes, getPublicProducts } from '$lib/api.js';

export async function load({ fetch, url }) {
  try {
    const search = url.searchParams.get('search') || '';
    const [productTypes, products] = await Promise.all([
      getPublicProductTypes(fetch),
      search ? getPublicProducts({ search }, fetch) : Promise.resolve([])
    ]);
    return { productTypes, products, search };
  } catch (err) {
    throw error(err?.status || 500, err?.message || 'Unable to load the public catalog.');
  }
}
