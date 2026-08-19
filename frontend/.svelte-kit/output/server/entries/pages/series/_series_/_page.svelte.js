import { s as store_get, h as head, e as escape_html, b as attr, d as ensure_array_like, u as unsubscribe_stores, f as bind_props } from "../../../../chunks/index2.js";
import { g as getChartTheme, b as buildFullChartOption, E as ECharts } from "../../../../chunks/fullChart.js";
import { t as theme } from "../../../../chunks/config.js";
import { a as getDescriptionSections } from "../../../../chunks/descriptionSections.js";
import { f as fallback } from "../../../../chunks/equality.js";
import { h as html } from "../../../../chunks/html.js";
function numericValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
function graphPoints(payload) {
  if (Array.isArray(payload?.rpmPoints) && payload.rpmPoints.length) return payload.rpmPoints;
  return (payload?.rpmLines || []).flatMap(
    (line) => (line?.points || []).map((point) => ({
      ...point,
      rpm_line_id: point?.rpm_line_id ?? line?.id,
      rpm: point?.rpm ?? line?.rpm
    }))
  );
}
function seriesGraphFilterValues(payload) {
  const airflow = /* @__PURE__ */ new Set();
  const pressure = /* @__PURE__ */ new Set();
  for (const point of graphPoints(payload)) {
    const pointAirflow = numericValue(point?.airflow);
    const pointPressure = numericValue(point?.pressure);
    if (pointAirflow != null) airflow.add(pointAirflow);
    if (pointPressure != null) pressure.add(pointPressure);
  }
  return {
    airflow: [...airflow].sort((a, b) => a - b),
    pressure: [...pressure].sort((a, b) => a - b)
  };
}
function seriesGraphFilterRanges(payload) {
  const values = seriesGraphFilterValues(payload);
  return {
    airflow: {
      min: values.airflow[0] ?? null,
      max: values.airflow.at(-1) ?? null
    },
    pressure: {
      min: values.pressure[0] ?? null,
      max: values.pressure.at(-1) ?? null
    }
  };
}
function filterSeriesGraphPayload(payload, lineMode = "both", airflow = "", pressure = "") {
  if (!payload) return null;
  const normalizedMode = ["high", "low", "both"].includes(lineMode) ? lineMode : "both";
  const selectedAirflow = airflow === "" || airflow == null ? null : numericValue(airflow);
  const selectedPressure = pressure === "" || pressure == null ? null : numericValue(pressure);
  const pointsByLineId = /* @__PURE__ */ new Map();
  for (const point of graphPoints(payload)) {
    const lineId = String(point?.rpm_line_id ?? "");
    if (!pointsByLineId.has(lineId)) pointsByLineId.set(lineId, []);
    pointsByLineId.get(lineId).push(point);
  }
  const lines = (payload.rpmLines || []).filter((line) => {
    const role = String(line?.line_role || "high").toLowerCase();
    if (normalizedMode !== "both" && role !== normalizedMode) return false;
    const points = pointsByLineId.get(String(line?.id ?? line?.rpm ?? "")) || [];
    if (selectedAirflow == null && selectedPressure == null) return true;
    const airflowValues = points.map((point) => numericValue(point?.airflow)).filter((value) => value != null);
    const pressureValues = points.map((point) => numericValue(point?.pressure)).filter((value) => value != null);
    const airflowMatches = selectedAirflow == null || airflowValues.length > 0 && selectedAirflow >= Math.min(...airflowValues) && selectedAirflow <= Math.max(...airflowValues);
    const pressureMatches = selectedPressure == null || pressureValues.length > 0 && selectedPressure >= Math.min(...pressureValues) && selectedPressure <= Math.max(...pressureValues);
    return airflowMatches && pressureMatches;
  });
  const lineIds = new Set(lines.map((line) => String(line?.id ?? line?.rpm ?? "")));
  return {
    ...payload,
    rpmLines: lines,
    rpmPoints: Array.isArray(payload.rpmPoints) ? payload.rpmPoints.filter((point) => lineIds.has(String(point?.rpm_line_id ?? point?.rpm ?? ""))) : void 0
  };
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let graphFilterRanges, filteredSeriesGraphPayload;
    let data = fallback($$props["data"], () => ({}), true);
    let series = null;
    let seriesGraphPayload = null;
    let chartTheme = getChartTheme(store_get($$store_subs ??= {}, "$theme", theme));
    let chartOption = {};
    let seriesTitle = "Series";
    let productTypeLabel = "Series";
    let pageTitle = "Series";
    let seriesDescriptionSections = [];
    let lineMode = "both";
    let selectedAirflow = "";
    let selectedPressure = "";
    series = data?.series ?? null;
    seriesGraphPayload = series?.series_graph_payload ?? null;
    graphFilterRanges = seriesGraphFilterRanges(seriesGraphPayload);
    filteredSeriesGraphPayload = filterSeriesGraphPayload(seriesGraphPayload, lineMode, selectedAirflow, selectedPressure);
    chartTheme = getChartTheme(store_get($$store_subs ??= {}, "$theme", theme));
    chartOption = filteredSeriesGraphPayload ? buildFullChartOption({
      rpmLines: filteredSeriesGraphPayload.rpmLines || [],
      rpmPoints: filteredSeriesGraphPayload.rpmPoints || [],
      efficiencyPoints: filteredSeriesGraphPayload.efficiencyPoints || [],
      chartTheme,
      title: filteredSeriesGraphPayload.title || `${series?.name || "Series"} Series Graph`,
      graphConfig: filteredSeriesGraphPayload.graphConfig || null,
      graphMode: "series",
      showRpmBandShading: Boolean(filteredSeriesGraphPayload.showRpmBandShading),
      graphStyle: filteredSeriesGraphPayload.graphStyle || null,
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
    if (series?.series_printed_pdf_url || series?.series_pdf_url) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<a class="btn btn-outline-secondary"${attr("href", series.series_printed_pdf_url || series.series_pdf_url)} target="_blank" rel="noreferrer">PDF</a>`);
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
    if (seriesGraphPayload) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="graph-filters card border-0 mb-3 svelte-a8na6i"><div class="card-body p-3"><div class="row g-3 align-items-end"><div class="col-12 col-md-4"><label class="form-label small fw-semibold" for="series-line-mode">Lines to show</label> `);
      $$renderer2.select(
        {
          id: "series-line-mode",
          class: "form-select",
          value: lineMode
        },
        ($$renderer3) => {
          $$renderer3.option({ value: "both" }, ($$renderer4) => {
            $$renderer4.push(`High and low lines`);
          });
          $$renderer3.option({ value: "high" }, ($$renderer4) => {
            $$renderer4.push(`High lines only`);
          });
          $$renderer3.option({ value: "low" }, ($$renderer4) => {
            $$renderer4.push(`Low lines only`);
          });
        }
      );
      $$renderer2.push(`</div> <div class="col-12 col-md-4"><label class="form-label small fw-semibold" for="series-airflow-filter">Airflow</label> <input id="series-airflow-filter" class="form-control" type="number" step="any" inputmode="decimal"${attr("placeholder", `${graphFilterRanges.airflow.min ?? ""}–${graphFilterRanges.airflow.max ?? ""}`)}${attr("value", selectedAirflow)}/></div> <div class="col-12 col-md-4"><label class="form-label small fw-semibold" for="series-pressure-filter">Pressure</label> <input id="series-pressure-filter" class="form-control" type="number" step="any" inputmode="decimal"${attr("placeholder", `${graphFilterRanges.pressure.min ?? ""}–${graphFilterRanges.pressure.max ?? ""}`)}${attr("value", selectedPressure)}/></div></div> <div class="d-flex flex-wrap justify-content-between gap-2 mt-3 small text-body-secondary"><span>Enter performance targets; lines unable to cover those targets are hidden.</span> <span>${escape_html(filteredSeriesGraphPayload?.rpmLines?.length || 0)} matching line${escape_html(filteredSeriesGraphPayload?.rpmLines?.length === 1 ? "" : "s")}</span></div></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (chartOption && Object.keys(chartOption).length && filteredSeriesGraphPayload?.rpmLines?.length) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="chart-wrap svelte-a8na6i">`);
      ECharts($$renderer2, { option: chartOption, height: "720px" });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="empty-state svelte-a8na6i"><p class="mb-0">${escape_html(seriesGraphPayload ? "No graph lines match the selected filters." : "No graph data is available for this series yet.")}</p></div>`);
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
