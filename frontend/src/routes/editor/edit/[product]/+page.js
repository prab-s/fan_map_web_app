export async function load({ fetch, params }) {
  const product = params.product || '';

  return {
    product
  };
}
