export async function load({ fetch, params }) {
  const product_type = params.product_type || '';

  return {
    product_type
  };
}
