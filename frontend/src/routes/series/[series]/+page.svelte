<script>
  import ECharts from '$lib/ECharts.svelte';
  import { getChartTheme, theme } from '$lib/config.js';
  import { getDescriptionSections } from '$lib/descriptionSections.js';
  import { buildFullChartOption } from '$lib/fullChart.js';

  export let data = {};

  let series = null;
  let seriesGraphPayload = null;
  let chartTheme = getChartTheme($theme);
  let chartOption = {};
  let seriesTitle = 'Series';
  let productTypeLabel = 'Series';
  let pageTitle = 'Series';
  let seriesDescriptionSections = [];

  $: series = data?.series ?? null;
  $: seriesGraphPayload = series?.series_graph_payload ?? null;
  $: chartTheme = getChartTheme($theme);
  $: chartOption = seriesGraphPayload
    ? buildFullChartOption({
        rpmLines: seriesGraphPayload.rpmLines || [],
        rpmPoints: seriesGraphPayload.rpmPoints || [],
        efficiencyPoints: seriesGraphPayload.efficiencyPoints || [],
        chartTheme,
        title: seriesGraphPayload.title || `${series?.name || 'Series'} Series Graph`,
        graphConfig: seriesGraphPayload.graphConfig || null,
        graphMode: 'series',
        showRpmBandShading: Boolean(seriesGraphPayload.showRpmBandShading),
        graphStyle: seriesGraphPayload.graphStyle || null,
        adaptGraphBackgroundToTheme: true
      })
    : {};
  $: seriesDescriptionSections = getDescriptionSections(series || {});

  $: seriesTitle = series?.name || 'Series';
  $: productTypeLabel = series?.product_type_label || series?.product_type_key || 'Series';
  $: pageTitle = `${seriesTitle} | ${productTypeLabel}`;
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta
    name="description"
    content={`Customer-facing graph for ${seriesTitle}${series?.product_type_label ? ` in ${series.product_type_label}` : ''}.`}
  />
</svelte:head>

<div class="series-public-page">
  <section class="hero-panel card shadow-sm border-0 mb-4">
    <div class="card-body p-4 p-lg-5">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div class="me-auto">
          <p class="eyebrow mb-2">Customer Facing</p>
          <h1 class="display-title mb-2">{seriesTitle}</h1>
          <p class="lead text-body-secondary mb-0">
            {productTypeLabel}
            {#if series?.product_count != null}
              <span class="dot">•</span> {series.product_count} linked products
            {/if}
          </p>
        </div>

        <div class="d-flex flex-wrap gap-2">
          {#if series?.series_printed_pdf_url}
            <a class="btn btn-outline-secondary" href={series.series_printed_pdf_url} target="_blank" rel="noreferrer">Printed PDF</a>
          {/if}
          {#if series?.series_pdf_url}
            <a class="btn btn-primary" href={series.series_pdf_url} target="_blank" rel="noreferrer">Open PDF</a>
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
          <p class="text-body-secondary mb-0">Interactive chart with hover tooltip and the same shared graph logic used internally.</p>
        </div>
        <div class="ms-auto small text-body-secondary">
          {#if series?.series_graph_image_url}
            <a href={series.series_graph_image_url} target="_blank" rel="noreferrer">Static image fallback</a>
          {/if}
        </div>
      </div>

      {#if chartOption && Object.keys(chartOption).length}
        <div class="chart-wrap">
          <ECharts option={chartOption} height="720px" />
        </div>
      {:else}
        <div class="empty-state">
          <p class="mb-0">No graph data is available for this series yet.</p>
        </div>
      {/if}
    </div>
  </section>

  <section class="card shadow-sm border-0 table-panel mb-4">
    <div class="card-body p-3 p-lg-4">
      <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
        <div>
          <h2 class="h4 mb-1">Performance Table</h2>
          <p class="text-body-secondary mb-0">Model variants, key specification columns, and performance ranges for this series.</p>
        </div>
      </div>
      {#if series?.performance_table_html}
        <div class="performance-table-host">{@html series.performance_table_html}</div>
      {:else}
        <div class="performance-table-host performance-table-host--empty">
          <p class="performance-table__empty text-body-secondary mb-0">No performance table is available for this series yet.</p>
        </div>
      {/if}
    </div>
  </section>

  <section class="row g-4">
    {#each seriesDescriptionSections as section}
      <div class="col-12 col-lg-6">
        <div class="card shadow-sm h-100 border-0">
          <div class="card-body p-4">
            <div class="public-html">{@html section.html || '<p class="text-body-secondary mb-0">Not provided.</p>'}</div>
          </div>
        </div>
      </div>
    {/each}

  </section>
</div>

<style>
  .series-public-page {
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

  .table-panel {
    overflow: hidden;
  }

  .chart-wrap {
    background: #fff;
    border-radius: 1rem;
    overflow: hidden;
  }

  .performance-table-host {
    overflow-x: auto;
    background: #fff;
    border-radius: 1rem;
    border: 1px solid rgba(100, 116, 139, 0.18);
  }

  .performance-table-host--empty {
    padding: 1rem;
  }

  .performance-table-host :global(.performance-table) {
    min-width: 100%;
  }

  .performance-table-host :global(.performance-table__table) {
    width: max-content;
    min-width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 0.84rem;
    line-height: 1.1;
  }

  .performance-table-host :global(.performance-table__col--model) {
    width: 15%;
  }

  .performance-table-host :global(.performance-table__col--spec) {
    width: 10.5%;
  }

  .performance-table-host :global(.performance-table__col--range) {
    width: 13.5%;
  }

  .performance-table-host :global(.performance-table__table th),
  .performance-table-host :global(.performance-table__table td) {
    border: 1px solid #c7d3e6;
    padding: 0.35rem 0.45rem;
    text-align: center;
    vertical-align: middle;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .performance-table-host :global(.performance-table__table thead th) {
    background: rgba(208, 225, 253, 0.8);
    font-weight: 700;
  }

  .performance-table-host :global(.performance-table__table tbody tr:nth-child(even) td) {
    background: rgba(208, 225, 253, 0.35);
  }

  .performance-table-host :global(.performance-table__empty) {
    margin: 0;
  }

  @media (max-width: 575.98px) {
    .performance-table-host :global(.performance-table__table) {
      font-size: 0.76rem;
    }

    .performance-table-host :global(.performance-table__table th),
    .performance-table-host :global(.performance-table__table td) {
      padding: 0.25rem 0.35rem;
    }
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

  .public-html :global(img) {
    max-width: 100%;
    height: auto;
  }

  @media (max-width: 768px) {
    .series-public-page {
      padding-top: 1rem;
    }
  }
</style>
