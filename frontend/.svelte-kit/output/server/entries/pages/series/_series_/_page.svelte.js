import { s as store_get, h as head, e as escape_html, b as attr, d as ensure_array_like, u as unsubscribe_stores, f as bind_props } from "../../../../chunks/index2.js";
import { g as getChartTheme, b as buildFullChartOption, E as ECharts } from "../../../../chunks/fullChart.js";
import { t as theme } from "../../../../chunks/config.js";
import { a as getDescriptionSections } from "../../../../chunks/descriptionSections.js";
import { f as fallback } from "../../../../chunks/equality.js";
import { h as html } from "../../../../chunks/html.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let data = fallback($$props["data"], () => ({}), true);
    let series = null;
    let seriesGraphPayload = null;
    let chartTheme = getChartTheme(store_get($$store_subs ??= {}, "$theme", theme));
    let chartOption = {};
    let seriesTitle = "Series";
    let productTypeLabel = "Series";
    let pageTitle = "Series";
    let seriesDescriptionSections = [];
    series = data?.series ?? null;
    seriesGraphPayload = series?.series_graph_payload ?? null;
    chartTheme = getChartTheme(store_get($$store_subs ??= {}, "$theme", theme));
    chartOption = seriesGraphPayload ? buildFullChartOption({
      rpmLines: seriesGraphPayload.rpmLines || [],
      rpmPoints: seriesGraphPayload.rpmPoints || [],
      efficiencyPoints: seriesGraphPayload.efficiencyPoints || [],
      chartTheme,
      title: seriesGraphPayload.title || `${series?.name || "Series"} Series Graph`,
      graphConfig: seriesGraphPayload.graphConfig || null,
      graphMode: "series",
      showRpmBandShading: Boolean(seriesGraphPayload.showRpmBandShading),
      graphStyle: seriesGraphPayload.graphStyle || null,
      adaptGraphBackgroundToTheme: true
    }) : {};
    seriesDescriptionSections = getDescriptionSections(series || {});
    seriesTitle = series?.name || "Series";
    productTypeLabel = series?.product_type_label || series?.product_type_key || "Series";
    pageTitle = `${seriesTitle} | ${productTypeLabel}`;
    head("a8na6i", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(pageTitle)}</title>`);
      });
      $$renderer3.push(`<meta name="description"${attr("content", `Customer-facing graph for ${seriesTitle}${series?.product_type_label ? ` in ${series.product_type_label}` : ""}.`)}/>`);
    });
    $$renderer2.push(`<div class="series-public-page svelte-a8na6i"><section class="hero-panel card shadow-sm border-0 mb-4 svelte-a8na6i"><div class="card-body p-4 p-lg-5"><div class="d-flex flex-wrap justify-content-between align-items-start gap-3"><div class="me-auto"><p class="eyebrow mb-2 svelte-a8na6i">Customer Facing</p> <h1 class="display-title mb-2 svelte-a8na6i">${escape_html(seriesTitle)}</h1> <p class="lead text-body-secondary mb-0">${escape_html(productTypeLabel)} `);
    if (series?.product_count != null) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="dot svelte-a8na6i">•</span> ${escape_html(series.product_count)} linked products`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></p></div> <div class="d-flex flex-wrap gap-2">`);
    if (series?.series_printed_pdf_url) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<a class="btn btn-outline-secondary"${attr("href", series.series_printed_pdf_url)} target="_blank" rel="noreferrer">Printed PDF</a>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (series?.series_pdf_url) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<a class="btn btn-primary"${attr("href", series.series_pdf_url)} target="_blank" rel="noreferrer">Open PDF</a>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div></div></section> <section class="card shadow-sm border-0 graph-panel mb-4 svelte-a8na6i"><div class="card-body p-3 p-lg-4"><div class="d-flex flex-wrap align-items-center gap-2 mb-3"><div><h2 class="h4 mb-1">Performance Graph</h2> <p class="text-body-secondary mb-0">Interactive chart with hover tooltip and the same shared graph logic used internally.</p></div> <div class="ms-auto small text-body-secondary">`);
    if (series?.series_graph_image_url) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<a${attr("href", series.series_graph_image_url)} target="_blank" rel="noreferrer">Static image fallback</a>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> `);
    if (chartOption && Object.keys(chartOption).length) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="chart-wrap svelte-a8na6i">`);
      ECharts($$renderer2, { option: chartOption, height: "720px" });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="empty-state svelte-a8na6i"><p class="mb-0">No graph data is available for this series yet.</p></div>`);
    }
    $$renderer2.push(`<!--]--></div></section> <section class="card shadow-sm border-0 table-panel mb-4 svelte-a8na6i"><div class="card-body p-3 p-lg-4"><div class="d-flex flex-wrap align-items-center gap-2 mb-3"><div><h2 class="h4 mb-1">Performance Table</h2> <p class="text-body-secondary mb-0">Model variants, key specification columns, and performance ranges for this series.</p></div></div> `);
    if (series?.performance_table_html) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="performance-table-host svelte-a8na6i">${html(series.performance_table_html)}</div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="performance-table-host performance-table-host--empty svelte-a8na6i"><p class="performance-table__empty text-body-secondary mb-0">No performance table is available for this series yet.</p></div>`);
    }
    $$renderer2.push(`<!--]--></div></section> <section class="row g-4"><!--[-->`);
    const each_array = ensure_array_like(seriesDescriptionSections);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let section = each_array[$$index];
      $$renderer2.push(`<div class="col-12 col-lg-6"><div class="card shadow-sm h-100 border-0"><div class="card-body p-4"><div class="public-html svelte-a8na6i">${html(section.html || '<p class="text-body-secondary mb-0">Not provided.</p>')}</div></div></div></div>`);
    }
    $$renderer2.push(`<!--]--></section></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { data });
  });
}
export {
  _page as default
};
