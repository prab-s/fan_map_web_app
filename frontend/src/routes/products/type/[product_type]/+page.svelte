<script>
  export let data = {};

  $: productTypeKey = data?.productTypeKey ?? '';
  $: productTypes = data?.productTypes ?? [];
  $: products = data?.products ?? [];
  $: productType = productTypes.find((item) => String(item.key) === String(productTypeKey)) || null;
  $: pageTitle = `${productType?.label || productTypeKey || 'Product Type'} | Products`;
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<div class="catalog-shell">
  <section class="hero-panel card shadow-sm border-0 mb-4">
    <div class="card-body p-4 p-lg-5">
      <p class="eyebrow mb-2">Customer Facing</p>
      <h1 class="display-title mb-2">{productType?.label || productTypeKey}</h1>
      <p class="lead text-body-secondary mb-0">
        {products.length} products in this type
      </p>
    </div>
  </section>

  <section class="row g-4">
    {#each products as product}
      <div class="col-12 col-lg-6 col-xxl-4">
        <article class="card shadow-sm h-100 border-0 product-card">
          {#if product.primary_product_image_url}
            <img
              class="card-img-top product-image"
              src={product.primary_product_image_url}
              alt={`${product.model} product image`}
            />
          {/if}
          <div class="card-body p-4 d-flex flex-column gap-3">
            <div>
              <p class="section-label mb-2">{product.product_type_label || product.product_type_key}</p>
              <h2 class="h4 mb-2">{product.model}</h2>
              <p class="text-body-secondary mb-0">
                {product.series_name || 'No series'}{#if product.series_name && product.product_type_label} • {/if}{product.product_type_label || product.product_type_key || ''}
              </p>
            </div>

            <div class="d-flex flex-wrap gap-2 mt-auto">
              <a class="btn btn-primary" href={`/products/${encodeURIComponent(product.id)}`}>Open Product</a>
              {#if product.product_pdf_url}
                <a class="btn btn-outline-secondary" href={product.product_pdf_url} target="_blank" rel="noreferrer">PDF</a>
              {/if}
            </div>
          </div>
        </article>
      </div>
    {/each}
  </section>
</div>

<style>
  .catalog-shell {
    max-width: 1320px;
    margin: 0 auto;
    padding: 1.5rem 0 3rem;
  }

  .hero-panel {
    background:
      radial-gradient(circle at top right, rgba(37, 99, 235, 0.12), transparent 35%),
      linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 0.98));
  }

  .eyebrow,
  .section-label {
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .display-title {
    font-size: clamp(2rem, 4vw, 3.5rem);
    line-height: 1.02;
    letter-spacing: -0.04em;
    margin: 0;
  }

  .product-card {
    overflow: hidden;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  }

  .product-image {
    aspect-ratio: 16 / 9;
    object-fit: cover;
    background: #fff;
  }
</style>
