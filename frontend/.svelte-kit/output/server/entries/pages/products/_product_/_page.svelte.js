import { s as store_get, h as head, e as escape_html, b as attr, u as unsubscribe_stores, f as bind_props } from "../../../../chunks/index2.js";
import { g as getChartTheme, b as buildFullChartOption, E as ECharts } from "../../../../chunks/fullChart.js";
import { t as theme } from "../../../../chunks/config.js";
import { f as fallback } from "../../../../chunks/equality.js";
import { h as html } from "../../../../chunks/html.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let productType;
    let data = fallback($$props["data"], () => ({}), true);
    let product = null;
    let productTypes = [];
    let chartTheme = getChartTheme(store_get($$store_subs ??= {}, "$theme", theme));
    let chartOption = {};
    let pageTitle = "Product";
    product = data?.product ?? null;
    productTypes = data?.productTypes ?? [];
    productType = productTypes.find((item) => String(item.key) === String(product?.product_type_key)) || null;
    chartTheme = getChartTheme(store_get($$store_subs ??= {}, "$theme", theme));
    chartOption = product ? buildFullChartOption({
      rpmLines: product.rpm_lines || [],
      rpmPoints: (product.rpm_lines || []).flatMap((line) => (line.points || []).map((point) => ({
        ...point,
        rpm: point.rpm ?? line.rpm,
        rpm_line_id: line.id,
        product_id: product.id
      }))),
      efficiencyPoints: product.efficiency_points || [],
      chartTheme,
      title: `${product.product_type_label || product.product_type_key || "Product"} | ${product.series_name ? `${product.series_name} - ` : ""}${product.model} performance graph`,
      graphConfig: productType || null,
      graphMode: "product",
      showRpmBandShading: Boolean(product?.show_rpm_band_shading ?? productType?.supports_band_graph_style ?? true),
      graphStyle: {
        band_graph_background_color: product?.band_graph_background_color,
        band_graph_label_text_color: product?.band_graph_label_text_color,
        band_graph_faded_opacity: product?.band_graph_faded_opacity,
        band_graph_permissible_label_color: product?.band_graph_permissible_label_color
      },
      adaptGraphBackgroundToTheme: true
    }) : {};
    pageTitle = product ? `${product.model} | ${product.product_type_label || product.product_type_key || "Product"}` : "Product";
    head("1e2w8fh", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(pageTitle)}</title>`);
      });
    });
    $$renderer2.push(`<div class="product-public-page svelte-1e2w8fh"><section class="hero-panel card shadow-sm border-0 mb-4 svelte-1e2w8fh"><div class="card-body p-4 p-lg-5"><div class="d-flex flex-wrap justify-content-between align-items-start gap-3"><div class="me-auto"><p class="eyebrow mb-2 svelte-1e2w8fh">Customer Facing</p> <h1 class="display-title mb-2 svelte-1e2w8fh">${escape_html(product?.model || "Product")}</h1> <p class="lead text-body-secondary mb-0">${escape_html(product?.product_type_label || product?.product_type_key || "Product")} `);
    if (product?.series_name) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="dot svelte-1e2w8fh">•</span> ${escape_html(product.series_name)}`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></p></div> <div class="d-flex flex-wrap gap-2">`);
    if (product?.product_printed_pdf_url) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<a class="btn btn-outline-secondary"${attr("href", product.product_printed_pdf_url)} target="_blank" rel="noreferrer">Printed PDF</a>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (product?.product_online_pdf_url) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<a class="btn btn-outline-secondary"${attr("href", product.product_online_pdf_url)} target="_blank" rel="noreferrer">Online PDF</a>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (product?.product_pdf_url) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<a class="btn btn-primary"${attr("href", product.product_pdf_url)} target="_blank" rel="noreferrer">Open PDF</a>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div></div></section> <section class="card shadow-sm border-0 graph-panel mb-4 svelte-1e2w8fh"><div class="card-body p-3 p-lg-4"><div class="d-flex flex-wrap align-items-center gap-2 mb-3"><div><h2 class="h4 mb-1">Performance Graph</h2> <p class="text-body-secondary mb-0">Interactive chart with the shared internal graph logic.</p></div> <div class="ms-auto small text-body-secondary">`);
    if (product?.graph_image_url) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<a${attr("href", product.graph_image_url)} target="_blank" rel="noreferrer">Static image fallback</a>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> `);
    if (chartOption && Object.keys(chartOption).length) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="chart-wrap svelte-1e2w8fh">`);
      ECharts($$renderer2, { option: chartOption, height: "720px" });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="empty-state svelte-1e2w8fh"><p class="mb-0">No graph data is available for this product yet.</p></div>`);
    }
    $$renderer2.push(`<!--]--></div></section> <section class="row g-4"><div class="col-12 col-xl-6"><div class="card shadow-sm h-100 border-0"><div class="card-body p-4"><p class="section-label mb-2 svelte-1e2w8fh">Description 1</p> <div class="public-html svelte-1e2w8fh">${html(product?.description1_html || '<p class="text-body-secondary mb-0">Not provided.</p>')}</div></div></div></div> <div class="col-12 col-xl-6"><div class="card shadow-sm h-100 border-0"><div class="card-body p-4"><p class="section-label mb-2 svelte-1e2w8fh">Description 2</p> <div class="public-html svelte-1e2w8fh">${html(product?.description2_html || '<p class="text-body-secondary mb-0">Not provided.</p>')}</div></div></div></div> <div class="col-12 col-xl-6"><div class="card shadow-sm h-100 border-0"><div class="card-body p-4"><p class="section-label mb-2 svelte-1e2w8fh">Description 3</p> <div class="public-html svelte-1e2w8fh">${html(product?.description3_html || '<p class="text-body-secondary mb-0">Not provided.</p>')}</div></div></div></div> <div class="col-12 col-xl-6"><div class="card shadow-sm h-100 border-0"><div class="card-body p-4"><p class="section-label mb-2 svelte-1e2w8fh">Comments</p> <div class="public-html svelte-1e2w8fh">${html(product?.comments_html || '<p class="text-body-secondary mb-0">Not provided.</p>')}</div></div></div></div></section> `);
    if (product?.primary_product_image_url) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<section class="card shadow-sm border-0 mt-4"><div class="card-body p-4"><p class="section-label mb-3 svelte-1e2w8fh">Product Image</p> <img class="product-image-large svelte-1e2w8fh"${attr("src", product.primary_product_image_url)}${attr("alt", `${product.model} product image`)}/></div></section>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { data });
  });
}
export {
  _page as default
};
