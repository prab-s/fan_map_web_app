<script>
  import ECharts from '$lib/ECharts.svelte';
  import { getChartTheme, theme } from '$lib/config.js';
  import { buildFullChartOption } from '$lib/fullChart.js';

  export let data = {};

  let product = null;
  let productTypes = [];
  let chartTheme = getChartTheme($theme);
  let chartOption = {};
  let pageTitle = 'Product';

  $: product = data?.product ?? null;
  $: productTypes = data?.productTypes ?? [];
  $: productType = productTypes.find((item) => String(item.key) === String(product?.product_type_key)) || null;
  $: chartTheme = getChartTheme($theme);
  $: chartOption = product
    ? buildFullChartOption({
        rpmLines: product.rpm_lines || [],
        rpmPoints: (product.rpm_lines || []).flatMap((line) => (line.points || []).map((point) => ({
          ...point,
          rpm: point.rpm ?? line.rpm,
          rpm_line_id: line.id,
          product_id: product.id
        }))),
        efficiencyPoints: product.efficiency_points || [],
        chartTheme,
        title: `${product.product_type_label || product.product_type_key || 'Product'} | ${product.series_name ? `${product.series_name} - ` : ''}${product.model} performance graph`,
        graphConfig: productType || null,
        graphMode: 'product',
        showRpmBandShading: Boolean(
          product?.show_rpm_band_shading ?? productType?.supports_band_graph_style ?? true
        ),
        graphStyle: {
          band_graph_background_color: product?.band_graph_background_color,
          band_graph_label_text_color: product?.band_graph_label_text_color,
          band_graph_faded_opacity: product?.band_graph_faded_opacity,
          band_graph_permissible_label_color: product?.band_graph_permissible_label_color
        },
        adaptGraphBackgroundToTheme: true
      })
    : {};
  $: pageTitle = product ? `${product.model} | ${product.product_type_label || product.product_type_key || 'Product'}` : 'Product';
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<div class="product-public-page">
  <section class="hero-panel card shadow-sm border-0 mb-4">
    <div class="card-body p-4 p-lg-5">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div class="me-auto">
          <p class="eyebrow mb-2">Customer Facing</p>
          <h1 class="display-title mb-2">{product?.model || 'Product'}</h1>
          <p class="lead text-body-secondary mb-0">
            {product?.product_type_label || product?.product_type_key || 'Product'}
            {#if product?.series_name}
              <span class="dot">•</span> {product.series_name}
            {/if}
          </p>
        </div>

        <div class="d-flex flex-wrap gap-2">
          {#if product?.product_printed_pdf_url}
            <a class="btn btn-outline-secondary" href={product.product_printed_pdf_url} target="_blank" rel="noreferrer">Printed PDF</a>
          {/if}
          {#if product?.product_online_pdf_url}
            <a class="btn btn-outline-secondary" href={product.product_online_pdf_url} target="_blank" rel="noreferrer">Online PDF</a>
          {/if}
          {#if product?.product_pdf_url}
            <a class="btn btn-primary" href={product.product_pdf_url} target="_blank" rel="noreferrer">Open PDF</a>
          {/if}
        </div>
      </div>
    </div>
  </section>

  <section class="card shadow-sm border-0 graph-panel mb-4">
    <div class="card-body p-3 p-lg-4">
      <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
        <div>
          <h2 class="h4 mb-1">Performance Graph</h2>
          <p class="text-body-secondary mb-0">Interactive chart with the shared internal graph logic.</p>
        </div>
        <div class="ms-auto small text-body-secondary">
          {#if product?.graph_image_url}
            <a href={product.graph_image_url} target="_blank" rel="noreferrer">Static image fallback</a>
          {/if}
        </div>
      </div>

      {#if chartOption && Object.keys(chartOption).length}
        <div class="chart-wrap">
          <ECharts option={chartOption} height="720px" />
        </div>
      {:else}
        <div class="empty-state">
          <p class="mb-0">No graph data is available for this product yet.</p>
        </div>
      {/if}
    </div>
  </section>

  <section class="row g-4">
    <div class="col-12 col-xl-6">
      <div class="card shadow-sm h-100 border-0">
        <div class="card-body p-4">
          <p class="section-label mb-2">Description 1</p>
          <div class="public-html">{@html product?.description1_html || '<p class="text-body-secondary mb-0">Not provided.</p>'}</div>
        </div>
      </div>
    </div>

    <div class="col-12 col-xl-6">
      <div class="card shadow-sm h-100 border-0">
        <div class="card-body p-4">
          <p class="section-label mb-2">Description 2</p>
          <div class="public-html">{@html product?.description2_html || '<p class="text-body-secondary mb-0">Not provided.</p>'}</div>
        </div>
      </div>
    </div>

    <div class="col-12 col-xl-6">
      <div class="card shadow-sm h-100 border-0">
        <div class="card-body p-4">
          <p class="section-label mb-2">Description 3</p>
          <div class="public-html">{@html product?.description3_html || '<p class="text-body-secondary mb-0">Not provided.</p>'}</div>
        </div>
      </div>
    </div>

    <div class="col-12 col-xl-6">
      <div class="card shadow-sm h-100 border-0">
        <div class="card-body p-4">
          <p class="section-label mb-2">Comments</p>
          <div class="public-html">{@html product?.comments_html || '<p class="text-body-secondary mb-0">Not provided.</p>'}</div>
        </div>
      </div>
    </div>
  </section>

  {#if product?.primary_product_image_url}
    <section class="card shadow-sm border-0 mt-4">
      <div class="card-body p-4">
        <p class="section-label mb-3">Product Image</p>
        <img class="product-image-large" src={product.primary_product_image_url} alt={`${product.model} product image`} />
      </div>
    </section>
  {/if}
</div>

<style>
  .product-public-page {
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

  .dot {
    display: inline-block;
    margin: 0 0.35rem;
  }

  .graph-panel {
    overflow: hidden;
  }

  .chart-wrap {
    background: #fff;
    border-radius: 1rem;
    overflow: hidden;
  }

  .empty-state {
    border: 1px dashed rgba(100, 116, 139, 0.35);
    border-radius: 1rem;
    padding: 2rem;
    color: #64748b;
    background: rgba(248, 250, 252, 0.65);
  }

  .public-html :global(p:last-child) {
    margin-bottom: 0;
  }

  .product-image-large {
    width: 100%;
    height: auto;
    border-radius: 1rem;
  }
</style>
