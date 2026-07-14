import { h as head, c as attr_class, b as attr, d as ensure_array_like, e as escape_html } from "../../../chunks/index2.js";
import "../../../chunks/auth.js";
import { o as onDestroy } from "../../../chunks/index-server.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let targetOptions;
    const DEFAULT_PRODUCT_TYPE_KEY = "fan";
    let workbookFiles = [];
    let downsampleImportedCurves = true;
    let downsamplePointCount = 5;
    let productTypes = [];
    let selectedProductTypeKey = DEFAULT_PRODUCT_TYPE_KEY;
    let selectedWorkbookSeriesId = "";
    let imageFiles = [];
    let imageTargetKind = "product";
    let imageTargetId = "";
    let imageTargetDestinationText = "Select a target to see the destination folder.";
    let imageSeriesFilterSelections = {};
    let selectedImageSeriesFilterId = "";
    let products = [];
    let series = [];
    let filteredProducts = [];
    let filteredSeries = [];
    function formatBytes(value) {
      if (value == null) return "";
      const units = ["B", "KB", "MB", "GB"];
      let size = Number(value);
      let unit = units[0];
      for (const nextUnit of units) {
        unit = nextUnit;
        if (size < 1024 || nextUnit === units[units.length - 1]) break;
        size /= 1024;
      }
      return `${size.toFixed(size >= 10 || unit === "B" ? 0 : 1)} ${unit}`;
    }
    function summarizeKind(file) {
      const name = (file?.name || "").toLowerCase();
      if (name.endsWith(".xlsx") || name.endsWith(".xlsm")) return "Workbook";
      if (name.endsWith(".csv")) return "CSV";
      if (/\.(png|jpe?g|gif|webp|bmp|tif|tiff)$/i.test(name)) return "Image";
      return "File";
    }
    function describeSeries(item) {
      if (!item) return "Series";
      return item.name || `Series ${item.id}`;
    }
    function resolveSelectedWorkbookSeriesId() {
      if (!selectedWorkbookSeriesId) return "";
      if (!series.length) return selectedWorkbookSeriesId;
      return filteredSeries.some((item) => String(item.id) === String(selectedWorkbookSeriesId)) ? String(selectedWorkbookSeriesId) : "";
    }
    function syncSelectedWorkbookSeries() {
      const nextSeriesId = resolveSelectedWorkbookSeriesId();
      if (nextSeriesId !== selectedWorkbookSeriesId) {
        selectedWorkbookSeriesId = nextSeriesId;
      }
    }
    function resolveSelectedProductTypeKey() {
      if (productTypes.some((item) => item.key === selectedProductTypeKey)) {
        return selectedProductTypeKey;
      }
      if (productTypes.some((item) => item.key === DEFAULT_PRODUCT_TYPE_KEY)) {
        return DEFAULT_PRODUCT_TYPE_KEY;
      }
      return productTypes[0]?.key || DEFAULT_PRODUCT_TYPE_KEY;
    }
    function syncSelectedProductType() {
      const nextKey = resolveSelectedProductTypeKey();
      if (nextKey !== selectedProductTypeKey) {
        selectedProductTypeKey = nextKey;
      }
    }
    function ensureImageTargetSelection() {
      if (!targetOptions.length) {
        imageTargetId = "";
        return;
      }
      if (!targetOptions.some((option) => option.value === imageTargetId)) {
        imageTargetId = targetOptions[0].value;
      }
    }
    function resolveImageSeriesFilterId(productTypeKey = selectedProductTypeKey) {
      const availableSeries = series.filter((item) => (item.product_type_key || DEFAULT_PRODUCT_TYPE_KEY) === productTypeKey);
      const storedId = imageSeriesFilterSelections[productTypeKey] || "";
      if (storedId && availableSeries.some((item) => String(item.id) === storedId)) {
        return storedId;
      }
      return availableSeries.length ? String(availableSeries[0].id) : "";
    }
    onDestroy(() => {
    });
    filteredSeries = series.filter((item) => (item.product_type_key || DEFAULT_PRODUCT_TYPE_KEY) === selectedProductTypeKey);
    {
      const nextSeriesFilterId = resolveImageSeriesFilterId();
      if (imageSeriesFilterSelections[selectedProductTypeKey] !== nextSeriesFilterId) {
        imageSeriesFilterSelections = {
          ...imageSeriesFilterSelections,
          [selectedProductTypeKey]: nextSeriesFilterId
        };
      }
      selectedImageSeriesFilterId = nextSeriesFilterId;
    }
    filteredProducts = products.filter((item) => {
      const matchesType = (item.product_type_key || DEFAULT_PRODUCT_TYPE_KEY) === selectedProductTypeKey;
      const matchesSeries = !selectedImageSeriesFilterId || String(item.series_id || "") === selectedImageSeriesFilterId;
      return matchesType && matchesSeries;
    });
    targetOptions = filteredProducts.map((item) => ({
      value: String(item.id),
      label: `Product: ${item.model}${item.series_name ? ` · ${item.series_name}` : ""} (${item.product_images?.length || 0} images)`
    }));
    {
      ensureImageTargetSelection();
    }
    imageTargetDestinationText = imageTargetId ? `Destination: data/product_images/product_${imageTargetId}` : "Select a target to see the destination folder.";
    {
      syncSelectedProductType();
    }
    {
      syncSelectedWorkbookSeries();
    }
    head("u3860d", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Bulk Import | Internal Facing</title>`);
      });
    });
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="bulk-shell svelte-u3860d"><section class="hero-panel card shadow-sm mb-4 svelte-u3860d"><div class="card-body p-4 p-lg-5"><p class="eyebrow mb-2 svelte-u3860d">Maintenance</p> <h1 class="display-title mb-2 svelte-u3860d">Bulk Import</h1> <p class="lead text-body-secondary mb-0">Use the workbook importer for graph points and the image importer for product or series media. You can set a workbook-wide default series before the dry run, then override individual sheets in the inline mapping panel. If a workbook sheet is named after a product that does not yet exist, importing it will create that product automatically and load the map points into it.</p></div></section> <div class="card shadow-sm mb-4 svelte-u3860d"><div class="card-body p-3 p-lg-3"><h2 class="h5 mb-2">Import Contract</h2> <ul class="text-body-secondary mb-0 ps-3"><li>The workbook flow only handles graph data files and keeps the sheet-to-product mapping inline on the page.</li> <li>You can assign a default series before analysing, then change any sheet's series in the dry-run panel.</li> <li>The image flow targets exactly one product or one series at a time.</li> <li>Image uploads overwrite any existing file with the same name in that target folder.</li> <li>Files are stored in dedicated \`product_&lt;id>\` and \`series_&lt;id>\` subfolders.</li></ul></div></div> <div class="row g-4"><div class="col-12 col-xl-7"><div class="card shadow-sm mb-4 svelte-u3860d"><div class="card-body p-2 p-lg-2"><div${attr_class(`dropzone rounded-4 p-4 p-lg-5 ${""}`, "svelte-u3860d")} role="button" tabindex="0" aria-label="Workbook import file drop zone"><div class="dropzone-inner text-center"><p class="section-label mb-2 svelte-u3860d">Graph Data Import</p> <h2 class="h4 mb-2">Drop workbook or CSV files here</h2> <p class="text-body-secondary mb-4">Upload \`.xlsx\`, \`.xlsm\`, or \`.csv\` files. Click Analyse to build an inline sheet-to-product mapping panel before you import.</p> <div class="d-flex justify-content-center flex-wrap gap-2"><label class="btn btn-primary" for="bulk-workbook-files">Choose Files</label> <button class="btn btn-outline-secondary" type="button"${attr("disabled", workbookFiles.length === 0, true)}>Clear Selection</button></div> <input id="bulk-workbook-files" class="visually-hidden" type="file" multiple="" accept=".xlsx,.xlsm,.csv"/> <div class="row g-3 mt-3 text-start"><div class="col-12 col-lg-6"><div class="form-check form-switch"><input class="form-check-input" id="bulk-downsample" type="checkbox"${attr("checked", downsampleImportedCurves, true)}/> <label class="form-check-label" for="bulk-downsample">Downsample imported curves</label></div></div></div> <div class="row g-3 mt-2 text-start"><div class="col-12 col-lg-4"><label class="form-label form-label-sm" for="bulk-downsample-count">Points per curve</label> <input id="bulk-downsample-count" class="form-control" type="number" min="1" step="1"${attr("value", downsamplePointCount)}${attr("disabled", !downsampleImportedCurves, true)}/></div> <div class="col-12 col-lg-8"><label class="form-label form-label-sm" for="bulk-series-default">Default series for new products</label> `);
    $$renderer2.select(
      {
        id: "bulk-series-default",
        class: "form-select",
        value: selectedWorkbookSeriesId
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`No default series`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(filteredSeries);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let item = each_array[$$index];
          $$renderer3.option({ value: String(item.id) }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(describeSeries(item))}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(` <div class="form-text">Sheets can inherit this series or override it individually in the dry run.</div></div></div></div></div> <div class="d-flex flex-wrap gap-2 mt-3"><button class="btn btn-outline-secondary" type="button"${attr("disabled", workbookFiles.length === 0, true)}>${escape_html("Analyse Workbook")}</button> <button class="btn btn-primary" type="button"${attr("disabled", workbookFiles.length === 0, true)}>${escape_html("Run Import")}</button></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (workbookFiles.length) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="card shadow-sm mt-3 svelte-u3860d"><div class="card-body p-3"><div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2"><h3 class="h6 mb-0">Selected Files</h3> <span class="text-body-secondary small">${escape_html(workbookFiles.length)} files queued</span></div> <div class="list-group"><!--[-->`);
      const each_array_7 = ensure_array_like(workbookFiles);
      for (let index = 0, $$length = each_array_7.length; index < $$length; index++) {
        let file = each_array_7[index];
        $$renderer2.push(`<div class="list-group-item d-flex justify-content-between align-items-center gap-3"><div class="min-w-0"><div class="d-flex flex-wrap gap-2 align-items-center"><strong class="text-truncate">${escape_html(file.webkitRelativePath || file.name)}</strong> <span class="badge text-bg-secondary">${escape_html(summarizeKind(file))}</span></div> <div class="small text-body-secondary">${escape_html(formatBytes(file.size))}</div></div> <button class="btn btn-outline-danger btn-sm" type="button">Remove</button></div>`);
      }
      $$renderer2.push(`<!--]--></div></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<p class="text-body-secondary mt-4 mb-0">No workbook files selected yet.</p>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="col-12 col-xl-5"><div class="card shadow-sm mb-4 svelte-u3860d"><div class="card-body p-4"><p class="section-label mb-2 svelte-u3860d">Image Import</p> <h2 class="h5 mb-2">Bulk upload product or series images</h2> <p class="text-body-secondary mb-3">Drop images here, choose a single product or series target, and the files will overwrite any existing image with the same file name.</p> <div class="row g-2 align-items-end"><div class="col-12 col-md-4"><label class="form-label form-label-sm" for="image-product-type">Product type</label> `);
    $$renderer2.select(
      {
        id: "image-product-type",
        class: "form-select",
        value: selectedProductTypeKey
      },
      ($$renderer3) => {
        if (!productTypes.length) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.option({ value: DEFAULT_PRODUCT_TYPE_KEY }, ($$renderer4) => {
            $$renderer4.push(`Fan`);
          });
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--><!--[-->`);
        const each_array_8 = ensure_array_like(productTypes);
        for (let $$index_8 = 0, $$length = each_array_8.length; $$index_8 < $$length; $$index_8++) {
          let productType = each_array_8[$$index_8];
          $$renderer3.option({ value: productType.key }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(productType.label)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div class="col-12 col-md-4"><label class="form-label form-label-sm" for="image-target-kind">Target type</label> `);
    $$renderer2.select(
      {
        id: "image-target-kind",
        class: "form-select",
        value: imageTargetKind
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "product" }, ($$renderer4) => {
          $$renderer4.push(`Product`);
        });
        $$renderer3.option({ value: "series" }, ($$renderer4) => {
          $$renderer4.push(`Series`);
        });
      }
    );
    $$renderer2.push(`</div> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="col-12 col-md-4"><label class="form-label form-label-sm" for="image-series-filter">Series filter</label> `);
      $$renderer2.select(
        {
          id: "image-series-filter",
          class: "form-select",
          value: selectedImageSeriesFilterId
        },
        ($$renderer3) => {
          if (!filteredSeries.length) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.option({ value: "" }, ($$renderer4) => {
              $$renderer4.push(`No series loaded`);
            });
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--><!--[-->`);
          const each_array_9 = ensure_array_like(filteredSeries);
          for (let $$index_9 = 0, $$length = each_array_9.length; $$index_9 < $$length; $$index_9++) {
            let seriesItem = each_array_9[$$index_9];
            $$renderer3.option({ value: String(seriesItem.id) }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(seriesItem.name)} (${escape_html(seriesItem.product_count || 0)} products)`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
      );
      $$renderer2.push(`</div>`);
    }
    $$renderer2.push(`<!--]--> <div class="col-12"><label class="form-label form-label-sm mb-1" for="image-target-id">Target</label> `);
    $$renderer2.select(
      {
        id: "image-target-id",
        class: "form-select",
        value: imageTargetId
      },
      ($$renderer3) => {
        if (!targetOptions.length) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.option({ value: "" }, ($$renderer4) => {
            $$renderer4.push(`No targets loaded`);
          });
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--><!--[-->`);
        const each_array_10 = ensure_array_like(targetOptions);
        for (let $$index_10 = 0, $$length = each_array_10.length; $$index_10 < $$length; $$index_10++) {
          let option = each_array_10[$$index_10];
          $$renderer3.option({ value: option.value }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(option.label)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(` <div class="form-text" aria-live="polite">${escape_html(imageTargetDestinationText)}</div></div></div> <div${attr_class(`dropzone dropzone-image rounded-4 p-4 mt-4 ${""}`, "svelte-u3860d")} role="button" tabindex="0" aria-label="Image bulk upload drop zone"><div class="dropzone-inner text-center"><h3 class="h6 mb-2">Drop image files here</h3> <p class="text-body-secondary mb-0">PNG, JPG, GIF, WebP, BMP, and TIFF files are supported.</p> <div class="d-flex justify-content-center flex-wrap gap-2 mt-3"><label class="btn btn-outline-primary" for="bulk-image-files">Choose Images</label> <button class="btn btn-outline-secondary" type="button"${attr("disabled", imageFiles.length === 0, true)}>Clear Selection</button></div> <input id="bulk-image-files" class="visually-hidden" type="file" multiple="" accept="image/*"/></div></div> `);
    if (imageFiles.length) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="mt-4"><div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2"><h3 class="h6 mb-0">Selected Images</h3> <span class="text-body-secondary small">${escape_html(imageFiles.length)} files queued</span></div> <div class="list-group"><!--[-->`);
      const each_array_11 = ensure_array_like(imageFiles);
      for (let index = 0, $$length = each_array_11.length; index < $$length; index++) {
        let file = each_array_11[index];
        $$renderer2.push(`<div class="list-group-item d-flex justify-content-between align-items-center gap-3"><div class="min-w-0"><div class="d-flex flex-wrap gap-2 align-items-center"><strong class="text-truncate">${escape_html(file.name)}</strong> <span class="badge text-bg-secondary">${escape_html(summarizeKind(file))}</span></div> <div class="small text-body-secondary">${escape_html(formatBytes(file.size))}</div></div> <button class="btn btn-outline-danger btn-sm" type="button">Remove</button></div>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<p class="text-body-secondary mt-4 mb-0">No image files selected yet.</p>`);
    }
    $$renderer2.push(`<!--]--> <div class="d-flex flex-wrap gap-2 mt-4"><button class="btn btn-primary" type="button"${attr("disabled", imageFiles.length === 0 || !imageTargetId || !targetOptions.length, true)}>${escape_html("Upload Images")}</button></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div></div></div></div>`);
  });
}
export {
  _page as default
};
