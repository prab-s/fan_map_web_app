<script>
  export let data = {};

  $: productTypes = data?.productTypes ?? [];
</script>

<svelte:head>
  <title>Products | Customer Facing</title>
</svelte:head>

<div class="catalog-shell">
  <section class="hero-panel card shadow-sm border-0 mb-4">
    <div class="card-body p-4 p-lg-5">
      <p class="eyebrow mb-2">Customer Facing</p>
      <h1 class="display-title mb-2">Products</h1>
      <p class="lead text-body-secondary mb-0">
        Browse product types, then open a product page for the live graph, images, PDFs, and specs.
      </p>
    </div>
  </section>

  <section class="row g-4">
    {#each productTypes as productType}
      <div class="col-12 col-md-6 col-xl-4">
        <div class="card shadow-sm h-100 border-0 type-card">
          <div class="card-body p-4 d-flex flex-column gap-3">
            <div>
              <p class="section-label mb-2">{productType.key}</p>
              <h2 class="h4 mb-2">{productType.label}</h2>
              <p class="text-body-secondary mb-0">
                {productType.series_names?.length || 0} linked series
              </p>
            </div>

            <div class="d-flex flex-wrap gap-2 mt-auto">
              <a class="btn btn-primary" href={`/products/type/${encodeURIComponent(productType.key)}`}>Open Type</a>
            </div>
          </div>
        </div>
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

  .type-card {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  }
</style>
