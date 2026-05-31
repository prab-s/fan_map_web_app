<script>
  import {
    getProductTypes,
    getProducts,
    getSeries,
    runBulkWorkbookImport,
    uploadBulkProductImages,
    uploadBulkSeriesImages
  } from '$lib/api.js';
  import { auth } from '$lib/auth.js';
  import { afterNavigate } from '$app/navigation';
  import { onDestroy, onMount } from 'svelte';

  const DEFAULT_PRODUCT_TYPE_KEY = 'fan';

  let workbookFiles = [];
  let workbookKeySet = new Set();
  let workbookDragActive = false;
  let workbookBusy = false;
  let workbookError = '';
  let workbookReport = null;
  let workbookMappings = [];
  let downsampleImportedCurves = true;
  let downsamplePointCount = 5;
  let scaleEfficiencyPermissibleAgainstHighestRpm = true;
  let overlayScaleTuningFactor = 0.99;
  let productTypes = [];
  let selectedProductTypeKey = DEFAULT_PRODUCT_TYPE_KEY;

  let imageFiles = [];
  let imageKeySet = new Set();
  let imageDragActive = false;
  let imageBusy = false;
  let imageError = '';
  let imageTargetKind = 'product';
  let imageTargetId = '';
  let imageTargetDestinationText = 'Select a target to see the destination folder.';
  let imageSeriesFilterSelections = {};
  let selectedImageSeriesFilterId = '';
  let products = [];
  let series = [];
  let filteredProducts = [];
  let filteredSeries = [];
  let imageTargetsLoading = false;
  let successMessage = '';
  let successToastKey = 0;
  let successDismissTimeout = null;

  function fileKey(file) {
    return `${file?.webkitRelativePath || file?.name || ''}:${file?.size || 0}:${file?.lastModified || 0}`;
  }

  function formatBytes(value) {
    if (value == null) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = Number(value);
    let unit = units[0];
    for (const nextUnit of units) {
      unit = nextUnit;
      if (size < 1024 || nextUnit === units[units.length - 1]) break;
      size /= 1024;
    }
    return `${size.toFixed(size >= 10 || unit === 'B' ? 0 : 1)} ${unit}`;
  }

  function summarizeKind(file) {
    const name = (file?.name || '').toLowerCase();
    if (name.endsWith('.xlsx') || name.endsWith('.xlsm')) return 'Workbook';
    if (name.endsWith('.csv')) return 'CSV';
    if (/\.(png|jpe?g|gif|webp|bmp|tif|tiff)$/i.test(name)) return 'Image';
    return 'File';
  }

  function describeFile(file) {
    const path = file?.webkitRelativePath || file?.name || 'Unnamed file';
    return `${path} · ${formatBytes(file?.size)}`;
  }

  function addFiles(fileList, selectedFiles, selectedKeySet) {
    const nextFiles = Array.from(fileList || []);
    if (!nextFiles.length) return { selectedFiles, selectedKeySet };

    const seen = new Set(selectedKeySet);
    const merged = [...selectedFiles];
    for (const file of nextFiles) {
      const key = fileKey(file);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      merged.push(file);
    }

    return { selectedFiles: merged, selectedKeySet: seen };
  }

  function resetWorkbookMessages() {
    workbookError = '';
  }

  function resetImageMessages() {
    imageError = '';
  }

  function clearSuccessToast() {
    successMessage = '';
    successToastKey += 1;
    if (successDismissTimeout) {
      clearTimeout(successDismissTimeout);
      successDismissTimeout = null;
    }
  }

  function showSuccess(message) {
    if (!message) return;
    successMessage = message;
    successToastKey += 1;
    if (successDismissTimeout) {
      clearTimeout(successDismissTimeout);
    }
    successDismissTimeout = setTimeout(() => {
      successMessage = '';
      successDismissTimeout = null;
    }, 3000);
  }

  function handleWorkbookInput(event) {
    const result = addFiles(event.currentTarget.files, workbookFiles, workbookKeySet);
    workbookFiles = result.selectedFiles;
    workbookKeySet = result.selectedKeySet;
    workbookReport = null;
    workbookMappings = [];
    resetWorkbookMessages();
    clearSuccessToast();
    event.currentTarget.value = '';
  }

  function handleWorkbookDrop(event) {
    workbookDragActive = false;
    const result = addFiles(event.dataTransfer?.files, workbookFiles, workbookKeySet);
    workbookFiles = result.selectedFiles;
    workbookKeySet = result.selectedKeySet;
    workbookReport = null;
    workbookMappings = [];
    resetWorkbookMessages();
    clearSuccessToast();
  }

  function removeWorkbookFile(index) {
    const nextFiles = [...workbookFiles];
    nextFiles.splice(index, 1);
    workbookFiles = nextFiles;
    workbookKeySet = new Set(nextFiles.map((file) => fileKey(file)));
  }

  function clearWorkbookFiles() {
    workbookFiles = [];
    workbookKeySet = new Set();
    workbookReport = null;
    workbookMappings = [];
    resetWorkbookMessages();
    clearSuccessToast();
  }

  function handleImageInput(event) {
    const result = addFiles(event.currentTarget.files, imageFiles, imageKeySet);
    imageFiles = result.selectedFiles;
    imageKeySet = result.selectedKeySet;
    resetImageMessages();
    clearSuccessToast();
    event.currentTarget.value = '';
  }

  function handleImageDrop(event) {
    imageDragActive = false;
    const result = addFiles(event.dataTransfer?.files, imageFiles, imageKeySet);
    imageFiles = result.selectedFiles;
    imageKeySet = result.selectedKeySet;
    resetImageMessages();
    clearSuccessToast();
  }

  function removeImageFile(index) {
    const nextFiles = [...imageFiles];
    nextFiles.splice(index, 1);
    imageFiles = nextFiles;
    imageKeySet = new Set(nextFiles.map((file) => fileKey(file)));
  }

  function clearImageFiles() {
    imageFiles = [];
    imageKeySet = new Set();
    resetImageMessages();
    clearSuccessToast();
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

  async function refreshProductTypes() {
    try {
      const list = await getProductTypes();
      productTypes = Array.isArray(list) ? list : [];
    } catch {
      productTypes = [];
    } finally {
      syncSelectedProductType();
      ensureImageTargetSelection();
      syncImageSeriesFilterSelection();
    }
  }

  function buildWorkbookManifestJson() {
    const sheets = {};
    for (const row of workbookMappings) {
      const sheetName = (row.sheet_name || '').trim();
      if (!sheetName) continue;
      sheets[sheetName] = {
        product_model: (row.product_model || '').trim() || sheetName,
        product_type_key: DEFAULT_PRODUCT_TYPE_KEY,
        skip_import: !row.include_in_import
      };
    }

    return JSON.stringify({
      defaults: {
        downsample_imported_curves: downsampleImportedCurves,
        downsample_point_count: Number(downsamplePointCount) || 5,
        scale_efficiency_permissible_against_highest_rpm: scaleEfficiencyPermissibleAgainstHighestRpm,
        overlay_scale_tuning_factor:
          Number.isFinite(Number(overlayScaleTuningFactor)) && Number(overlayScaleTuningFactor) > 0
            ? Number(overlayScaleTuningFactor)
            : 1,
        product_type_key: DEFAULT_PRODUCT_TYPE_KEY
      },
      sheets
    });
  }

  function mergeWorkbookMappings(report) {
    const previous = new Map(workbookMappings.map((item) => [item.sheet_name, item]));
    const normalizationBySheet = new Map((report?.sheet_normalizations || []).map((item) => [item.sheet_name, item]));
    const nextMappings = [];
    for (const table of report?.tables || []) {
      if (!table?.name) continue;
      const existing = previous.get(table.name);
      nextMappings.push({
        sheet_name: table.name,
        row_count: table.row_count || 0,
        product_model: existing?.product_model || table.name,
        include_in_import: existing?.include_in_import ?? true,
        normalization: normalizationBySheet.get(table.name) || existing?.normalization || null
      });
    }
    workbookMappings = nextMappings;
  }

  async function analyzeWorkbookData() {
    const report = await runBulkWorkbookImport(workbookFiles, {
      dryRun: true,
      downsampleImportedCurves,
      downsamplePointCount,
      scaleEfficiencyPermissibleAgainstHighestRpm,
      manifestJson: buildWorkbookManifestJson()
    });
    workbookReport = report;
    mergeWorkbookMappings(report);
    showSuccess('Workbook analysis complete. Review the sheet mappings below.');
  }

  function formatWorkbookMappingLabel(item) {
    const productName = (item.product_model || '').trim() || item.sheet_name;
    return `${item.sheet_name} -> ${productName}`;
  }

  function ensureImageTargetSelection() {
    if (!targetOptions.length) {
      imageTargetId = '';
      return;
    }
    if (!targetOptions.some((option) => option.value === imageTargetId)) {
      imageTargetId = targetOptions[0].value;
    }
  }

  function resolveImageSeriesFilterId(productTypeKey = selectedProductTypeKey) {
    const availableSeries = series.filter((item) => (item.product_type_key || DEFAULT_PRODUCT_TYPE_KEY) === productTypeKey);
    const storedId = imageSeriesFilterSelections[productTypeKey] || '';
    if (storedId && availableSeries.some((item) => String(item.id) === storedId)) {
      return storedId;
    }
    return availableSeries.length ? String(availableSeries[0].id) : '';
  }

  function syncImageSeriesFilterSelection() {
    const nextId = resolveImageSeriesFilterId();
    imageSeriesFilterSelections = {
      ...imageSeriesFilterSelections,
      [selectedProductTypeKey]: nextId
    };
    selectedImageSeriesFilterId = nextId;
  }

  function handleImageSeriesFilterChange(event) {
    selectedImageSeriesFilterId = event.currentTarget.value;
    imageSeriesFilterSelections = {
      ...imageSeriesFilterSelections,
      [selectedProductTypeKey]: selectedImageSeriesFilterId
    };
    ensureImageTargetSelection();
  }

  async function refreshTargetLists() {
    imageTargetsLoading = true;
    resetImageMessages();
    try {
      const [productList, seriesList] = await Promise.all([getProducts(), getSeries()]);
      products = Array.isArray(productList) ? productList : [];
      series = Array.isArray(seriesList) ? seriesList : [];
    } finally {
      imageTargetsLoading = false;
    }
    ensureImageTargetSelection();
    syncImageSeriesFilterSelection();
  }

  async function analyzeWorkbook() {
    if (!workbookFiles.length || workbookBusy) return;
    workbookBusy = true;
    resetWorkbookMessages();
    workbookReport = null;
    try {
      await analyzeWorkbookData();
    } catch (err) {
      workbookError = err?.message || 'Workbook analysis failed.';
    } finally {
      workbookBusy = false;
    }
  }

  async function runWorkbookImport(dryRun) {
    if (!workbookFiles.length || workbookBusy) return;
    workbookBusy = true;
    resetWorkbookMessages();
    workbookReport = null;
    try {
      if (!workbookMappings.length) {
        await analyzeWorkbookData();
        if (!workbookMappings.length) {
          throw new Error('Please analyze the workbook before importing so the sheet mappings can be reviewed.');
        }
      }
      const report = await runBulkWorkbookImport(workbookFiles, {
        dryRun,
        downsampleImportedCurves,
        downsamplePointCount,
        scaleEfficiencyPermissibleAgainstHighestRpm,
        manifestJson: buildWorkbookManifestJson()
      });
      workbookReport = report;
      showSuccess(dryRun ? 'Dry run completed.' : 'Import completed.');
    } catch (err) {
      workbookError = err?.message || 'Workbook import failed.';
    } finally {
      workbookBusy = false;
    }
  }

  async function runImageImport() {
    if (!imageFiles.length || imageBusy || !imageTargetId) return;
    imageBusy = true;
    resetImageMessages();
    try {
      const targetId = Number(imageTargetId);
      const result =
        imageTargetKind === 'series'
          ? await uploadBulkSeriesImages(targetId, imageFiles)
          : await uploadBulkProductImages(targetId, imageFiles);
      await refreshTargetLists();
      clearImageFiles();
      showSuccess(`Imported ${result.file_names?.length || 0} new file(s)${result.overwritten_file_names?.length ? ` and overwrote ${result.overwritten_file_names.length} existing file(s)` : ''}.`);
    } catch (err) {
      imageError = err?.message || 'Image upload failed.';
    } finally {
      imageBusy = false;
    }
  }

  onMount(() => {
    if ($auth.ready && $auth.authenticated) {
      void refreshProductTypes();
      void refreshTargetLists().catch((err) => {
        imageError = err?.message || 'Failed to load products and series.';
      });
    }

    const unsubscribe = auth.subscribe((state) => {
      if (!state.ready) return;
      if (!state.authenticated) {
        productTypes = [];
        selectedProductTypeKey = DEFAULT_PRODUCT_TYPE_KEY;
        products = [];
        series = [];
        filteredProducts = [];
        filteredSeries = [];
        imageSeriesFilterSelections = {};
        selectedImageSeriesFilterId = '';
        imageTargetId = '';
        return;
      }
      void refreshProductTypes();
      void refreshTargetLists().catch((err) => {
        imageError = err?.message || 'Failed to load products and series.';
      });
    });

    return unsubscribe;
  });

  onDestroy(() => {
    if (successDismissTimeout) {
      clearTimeout(successDismissTimeout);
    }
  });

  $: workbookSheetCount = workbookReport?.tables?.filter((table) => table.kind === 'sheet' || table.kind === 'table')?.length || 0;
  $: filteredSeries = series.filter((item) => (item.product_type_key || DEFAULT_PRODUCT_TYPE_KEY) === selectedProductTypeKey);
  $: filteredProducts =
    products.filter((item) => {
      const matchesType = (item.product_type_key || DEFAULT_PRODUCT_TYPE_KEY) === selectedProductTypeKey;
      const matchesSeries =
        imageTargetKind !== 'product' || !selectedImageSeriesFilterId || String(item.series_id || '') === selectedImageSeriesFilterId;
      return matchesType && matchesSeries;
    });
  $: {
    selectedProductTypeKey;
    series;
    // Keep one remembered series filter per product type, but don't fight user input.
    const nextSeriesFilterId = resolveImageSeriesFilterId();
    if (imageSeriesFilterSelections[selectedProductTypeKey] !== nextSeriesFilterId) {
      imageSeriesFilterSelections = {
        ...imageSeriesFilterSelections,
        [selectedProductTypeKey]: nextSeriesFilterId
      };
    }
    selectedImageSeriesFilterId = nextSeriesFilterId;
  }
  $: targetOptions =
    imageTargetKind === 'series'
      ? filteredSeries.map((item) => ({
          value: String(item.id),
          label: `Series: ${item.name} (${item.series_images?.length || 0} images)`
        }))
      : filteredProducts.map((item) => ({
          value: String(item.id),
          label: `Product: ${item.model}${item.series_name ? ` · ${item.series_name}` : ''} (${item.product_images?.length || 0} images)`
        }));
  $: {
    targetOptions;
    ensureImageTargetSelection();
  }
  $: imageTargetDestinationText = imageTargetId
    ? imageTargetKind === 'series'
      ? `Destination: data/series_images/series_${imageTargetId}`
      : `Destination: data/product_images/product_${imageTargetId}`
    : 'Select a target to see the destination folder.';
  $: {
    productTypes;
    selectedProductTypeKey;
    syncSelectedProductType();
  }
  afterNavigate(() => {
    if ($auth.ready && $auth.authenticated) {
      void refreshProductTypes();
      void refreshTargetLists();
    }
  });
</script>

<svelte:head>
  <title>Bulk Import | Internal Facing</title>
</svelte:head>

{#if successMessage}
  <div class="success-toast shadow-lg" role="status" aria-live="polite" aria-atomic="true">
    <div class="alert alert-success mb-0 success-toast-alert">
      <div>{successMessage}</div>
      {#key successToastKey}
        <div class="success-toast-progress"></div>
      {/key}
    </div>
  </div>
{/if}

<div class="bulk-shell">
  <section class="hero-panel card shadow-sm mb-4">
    <div class="card-body p-4 p-lg-5">
      <p class="eyebrow mb-2">Maintenance</p>
      <h1 class="display-title mb-2">Bulk Import</h1>
      <p class="lead text-body-secondary mb-0">
        Use the workbook importer for graph points and the image importer for product or series media. If a workbook sheet is named after a product that does not yet exist, importing it will create that product automatically and load the map points into it.
      </p>
    </div>
  </section>

  <div class="card shadow-sm mb-4">
    <div class="card-body p-3 p-lg-3">
      <h2 class="h5 mb-2">Import Contract</h2>
      <ul class="text-body-secondary mb-0 ps-3">
        <li>The workbook flow only handles graph data files and keeps the sheet-to-product mapping inline on the page.</li>
        <li>The image flow targets exactly one product or one series at a time.</li>
        <li>Image uploads overwrite any existing file with the same name in that target folder.</li>
        <li>Files are stored in dedicated `product_&lt;id&gt;` and `series_&lt;id&gt;` subfolders.</li>
      </ul>
    </div>
  </div>

  <div class="row g-4">
    <div class="col-12 col-xl-7">
      <div class="card shadow-sm mb-4">
        <div class="card-body p-2 p-lg-2">
          <div
            class={`dropzone rounded-4 p-4 p-lg-5 ${workbookDragActive ? 'dropzone-active' : ''}`}
            role="button"
            tabindex="0"
            aria-label="Workbook import file drop zone"
            on:dragenter={() => (workbookDragActive = true)}
            on:dragover|preventDefault={() => (workbookDragActive = true)}
            on:dragleave={() => (workbookDragActive = false)}
            on:drop|preventDefault={handleWorkbookDrop}
          >
            <div class="dropzone-inner text-center">
              <p class="section-label mb-2">Graph Data Import</p>
              <h2 class="h4 mb-2">Drop workbook or CSV files here</h2>
              <p class="text-body-secondary mb-4">
                Upload `.xlsx`, `.xlsm`, or `.csv` files. Click Analyze to build an inline sheet-to-product mapping panel before you import.
              </p>
              <div class="d-flex justify-content-center flex-wrap gap-2">
                <label class="btn btn-primary" for="bulk-workbook-files">Choose Files</label>
                <button class="btn btn-outline-secondary" type="button" on:click={clearWorkbookFiles} disabled={workbookFiles.length === 0}>
                  Clear Selection
                </button>
              </div>
              <input
                id="bulk-workbook-files"
                class="visually-hidden"
                type="file"
                multiple
                accept=".xlsx,.xlsm,.csv"
                on:change={handleWorkbookInput}
              />
              <div class="row g-3 mt-3 text-start">
                <div class="col-12 col-lg-6">
                  <div class="form-check form-switch">
                    <input class="form-check-input" id="bulk-downsample" type="checkbox" bind:checked={downsampleImportedCurves} />
                    <label class="form-check-label" for="bulk-downsample">Downsample imported curves</label>
                  </div>
                </div>
                <div class="col-12 col-lg-6">
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      id="bulk-scale-overlay"
                      type="checkbox"
                      bind:checked={scaleEfficiencyPermissibleAgainstHighestRpm}
                    />
                    <label class="form-check-label" for="bulk-scale-overlay">
                      Scale imported efficiency/permissible lines against the highest RPM line
                      </label>
                  </div>
                </div>
              </div>
              <div class="row g-3 mt-2 text-start">
                <div class="col-12 col-lg-4">
                  <label class="form-label form-label-sm" for="bulk-downsample-count">Points per curve</label>
                  <input
                    id="bulk-downsample-count"
                    class="form-control"
                    type="number"
                    min="1"
                    step="1"
                    bind:value={downsamplePointCount}
                    disabled={!downsampleImportedCurves}
                  />
                </div>
                <div class="col-12 col-lg-4">
                  <label class="form-label form-label-sm" for="bulk-overlay-tuning">Overlay scale tweak</label>
                  <input
                    id="bulk-overlay-tuning"
                    class="form-control"
                    type="number"
                    min="0.5"
                    max="1.5"
                    step="0.01"
                    bind:value={overlayScaleTuningFactor}
                  />
                  <div class="form-text">Use values below 1.00 to pull the imported efficiency lines down slightly.</div>
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex flex-wrap gap-2 mt-3">
            <button class="btn btn-outline-secondary" type="button" on:click={() => runWorkbookImport(true)} disabled={workbookBusy || workbookFiles.length === 0}>
              {workbookBusy ? 'Working...' : 'Analyze Workbook'}
            </button>
            <button class="btn btn-primary" type="button" on:click={() => runWorkbookImport(false)} disabled={workbookBusy || workbookFiles.length === 0}>
              {workbookBusy ? 'Working...' : 'Run Import'}
            </button>
          </div>

          {#if workbookError}
            <div class="alert alert-danger mt-2 mb-0">{workbookError}</div>
          {/if}
        </div>
      </div>

      {#if workbookReport}
        <div class="card shadow-sm mt-3">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-2">
              <div>
                <h2 class="h5 mb-1">{workbookReport.dry_run ? 'Analysis Summary' : 'Import Summary'}</h2>
                <p class="text-body-secondary mb-0">Workbook sheets detected from the uploaded files.</p>
              </div>
              <span class="badge text-bg-primary">{workbookReport.dry_run ? 'Dry Run' : 'Imported'}</span>
            </div>

            <div class="row g-3">
              <div class="col-12 col-xl-5">
                <div class="section-card h-100">
                  <div class="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-3">
                    <div>
                      <h3 class="h6 mb-1">Analysis Summary</h3>
                      <p class="text-body-secondary mb-0">Workbook sheets detected from the uploaded files.</p>
                    </div>
                    <span class="badge text-bg-secondary">{workbookSheetCount} sheets</span>
                  </div>

                  <div class="row g-2 mb-3">
                    <div class="col-12">
                      <div class="metric-box rounded-3">
                        <div class="metric-label">Sheets</div>
                        <div class="metric-value">{workbookSheetCount} detected</div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="metric-box rounded-3">
                        <div class="metric-label">Series</div>
                        <div class="metric-value">{workbookReport.created_series} created, {workbookReport.updated_series} updated</div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="metric-box rounded-3">
                        <div class="metric-label">Products</div>
                        <div class="metric-value">{workbookReport.created_products} created, {workbookReport.updated_products} updated</div>
                      </div>
                    </div>
                  </div>

                  {#if workbookReport.tables?.length}
                    <div class="list-group">
                      {#each workbookReport.tables as table}
                        <div class="list-group-item d-flex justify-content-between align-items-center gap-3">
                          <div>
                            <div class="fw-semibold">{table.name}</div>
                            <div class="small text-body-secondary">{table.kind}</div>
                          </div>
                          <span class="badge text-bg-secondary">{table.row_count} rows</span>
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
              </div>

              <div class="col-12 col-xl-7">
                <div class="section-card h-100">
                  <div class="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-3">
                    <div>
                      <h3 class="h6 mb-1">Inline Mapping Panel</h3>
                      <p class="text-body-secondary mb-0">Rename each sheet to the product it should create or update. Uncheck any sheet you want to refuse from import.</p>
                    </div>
                    <span class="badge text-bg-secondary">{workbookMappings.length} mappings</span>
                  </div>

                  {#if workbookMappings.length}
                    <div class="mapping-list">
                      {#each workbookMappings as item, index}
                        <div class="mapping-row">
                          <div class="mapping-sheet">
                            <div class="d-flex align-items-center gap-2 flex-wrap">
                              <div class="small text-body-secondary">Sheet</div>
                              <span class={`badge ${item.include_in_import ? 'text-bg-success' : 'text-bg-secondary'}`}>{item.include_in_import ? 'Included' : 'Excluded'}</span>
                            </div>
                            <div class="fw-semibold">{item.sheet_name}</div>
                            <div class="small text-body-secondary">{item.row_count} rows</div>
                          </div>
                          <div class="mapping-arrow">→</div>
                          <div class="mapping-product">
                            <label class="form-label form-label-sm" for={`mapping-${index}`}>Product name</label>
                            <input
                              id={`mapping-${index}`}
                              class="form-control"
                              type="text"
                              bind:value={item.product_model}
                              placeholder={item.sheet_name}
                            />
                            <div class="form-check mt-2">
                              <input
                                id={`mapping-include-${index}`}
                                class="form-check-input"
                                type="checkbox"
                                bind:checked={item.include_in_import}
                              />
                              <label class="form-check-label small" for={`mapping-include-${index}`}>Include sheet in import</label>
                            </div>
                          </div>
                        </div>
                        {#if item.normalization}
                          <details class="normalization-panel">
                            <summary class="small text-body-secondary">Normalization breakdown</summary>
                            <div class="mt-2">
                              <div class="row g-2 mb-2">
                                <div class="col-12 col-md-4">
                                  <div class="metric-box rounded-3">
                                    <div class="metric-label">RPM lines</div>
                                    <div class="metric-value">{item.normalization.rpm_line_count || 0}</div>
                                  </div>
                                </div>
                                <div class="col-12 col-md-4">
                                  <div class="metric-box rounded-3">
                                    <div class="metric-label">RPM points</div>
                                    <div class="metric-value">{item.normalization.rpm_point_count || 0}</div>
                                  </div>
                                </div>
                                <div class="col-12 col-md-4">
                                  <div class="metric-box rounded-3">
                                    <div class="metric-label">Efficiency points</div>
                                    <div class="metric-value">{item.normalization.efficiency_point_count || 0}</div>
                                  </div>
                                </div>
                              </div>
                              <div class="table-responsive">
                                <table class="table table-sm align-middle mb-2">
                                  <thead>
                                    <tr>
                                      <th>Raw header</th>
                                      <th>Normalized</th>
                                      <th>Role</th>
                                      <th>RPM</th>
                                      <th>Reason</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {#each item.normalization.columns as column}
                                      <tr>
                                        <td>{column.raw_header || '—'}</td>
                                        <td>
                                          <div class="d-flex align-items-center gap-2 flex-wrap">
                                            <span>{column.normalized_header || '—'}</span>
                                            {#if column.raw_header && column.normalized_header && column.raw_header !== column.normalized_header}
                                              <span class="badge text-bg-warning">Alias</span>
                                            {/if}
                                          </div>
                                        </td>
                                        <td>
                                          <span class={`badge text-bg-${column.role === 'rpm_line' ? 'primary' : column.role === 'overlay' ? 'info' : column.role === 'airflow' ? 'success' : 'secondary'}`}>{column.role}</span>
                                        </td>
                                        <td>{column.rpm != null ? column.rpm : '—'}</td>
                                        <td class="small text-body-secondary">{column.reason || '—'}</td>
                                      </tr>
                                    {/each}
                                  </tbody>
                                </table>
                              </div>
                              {#if item.normalization.error}
                                <div class="alert alert-warning mb-0">{item.normalization.error}</div>
                              {/if}
                            </div>
                          </details>
                        {/if}
                      {/each}
                    </div>
                  {:else}
                    <div class="text-body-secondary">No sheet mappings available yet. Run Analyze Workbook first.</div>
                  {/if}

                  {#if workbookReport.skipped_sheets?.length}
                    <div class="alert alert-secondary mt-3 mb-0">
                      <div class="fw-semibold mb-1">Skipped sheets</div>
                      <div class="small">{workbookReport.skipped_sheets.join(', ')}</div>
                    </div>
                  {/if}

                  {#if workbookReport.warnings?.length}
                    <div class="alert alert-warning mt-3 mb-0">
                      <div class="fw-semibold mb-2">Warnings</div>
                      <ul class="mb-0 ps-3">
                        {#each workbookReport.warnings as message}
                          <li>{message}</li>
                        {/each}
                      </ul>
                    </div>
                  {/if}

                  {#if workbookReport.errors?.length}
                    <div class="alert alert-danger mt-3 mb-0">
                      <div class="fw-semibold mb-2">Errors</div>
                      <ul class="mb-0 ps-3">
                        {#each workbookReport.errors as message}
                          <li>{message}</li>
                        {/each}
                      </ul>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}

      {#if workbookFiles.length}
        <div class="card shadow-sm mt-3">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
              <h3 class="h6 mb-0">Selected Files</h3>
              <span class="text-body-secondary small">{workbookFiles.length} files queued</span>
            </div>
            <div class="list-group">
              {#each workbookFiles as file, index}
                <div class="list-group-item d-flex justify-content-between align-items-center gap-3">
                  <div class="min-w-0">
                    <div class="d-flex flex-wrap gap-2 align-items-center">
                      <strong class="text-truncate">{file.webkitRelativePath || file.name}</strong>
                      <span class="badge text-bg-secondary">{summarizeKind(file)}</span>
                    </div>
                    <div class="small text-body-secondary">{formatBytes(file.size)}</div>
                  </div>
                  <button class="btn btn-outline-danger btn-sm" type="button" on:click={() => removeWorkbookFile(index)}>Remove</button>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {:else}
        <p class="text-body-secondary mt-4 mb-0">No workbook files selected yet.</p>
      {/if}
    </div>

    <div class="col-12 col-xl-5">
      <div class="card shadow-sm mb-4">
        <div class="card-body p-4">
          <p class="section-label mb-2">Image Import</p>
          <h2 class="h5 mb-2">Bulk upload product or series images</h2>
          <p class="text-body-secondary mb-3">
            Drop images here, choose a single product or series target, and the files will overwrite any existing image with the same file name.
          </p>

          <div class="row g-2 align-items-end">
            <div class="col-12 col-md-4">
              <label class="form-label form-label-sm" for="image-product-type">Product type</label>
              <select id="image-product-type" class="form-select" bind:value={selectedProductTypeKey}>
                {#if !productTypes.length}
                  <option value={DEFAULT_PRODUCT_TYPE_KEY}>Fan</option>
                {/if}
                {#each productTypes as productType}
                  <option value={productType.key}>{productType.label}</option>
                {/each}
              </select>
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label form-label-sm" for="image-target-kind">Target type</label>
              <select id="image-target-kind" class="form-select" bind:value={imageTargetKind}>
                <option value="product">Product</option>
                <option value="series">Series</option>
              </select>
            </div>
            
            {#if imageTargetKind === 'product'}
              <div class="col-12 col-md-4">
                <label class="form-label form-label-sm" for="image-series-filter">Series filter</label>
                <select id="image-series-filter" class="form-select" bind:value={selectedImageSeriesFilterId} on:change={handleImageSeriesFilterChange}>
                  {#if !filteredSeries.length}
                    <option value="">No series loaded</option>
                  {/if}
                  {#each filteredSeries as seriesItem}
                    <option value={String(seriesItem.id)}>
                      {seriesItem.name} ({seriesItem.product_count || 0} products)
                    </option>
                  {/each}
                </select>
              </div>
            {/if}

            <div class="col-12">
              <label class="form-label form-label-sm mb-1" for="image-target-id">Target</label>
              <select id="image-target-id" class="form-select" bind:value={imageTargetId}>
                {#if !targetOptions.length}
                  <option value="">No targets loaded</option>
                {/if}
                {#each targetOptions as option}
                  <option value={option.value}>{option.label}</option>
                {/each}
              </select>
              <div class="form-text" aria-live="polite">{imageTargetDestinationText}</div>
            </div>

          </div>

          <div
            class={`dropzone dropzone-image rounded-4 p-4 mt-4 ${imageDragActive ? 'dropzone-active' : ''}`}
            role="button"
            tabindex="0"
            aria-label="Image bulk upload drop zone"
            on:dragenter={() => (imageDragActive = true)}
            on:dragover|preventDefault={() => (imageDragActive = true)}
            on:dragleave={() => (imageDragActive = false)}
            on:drop|preventDefault={handleImageDrop}
          >
            <div class="dropzone-inner text-center">
              <h3 class="h6 mb-2">Drop image files here</h3>
              <p class="text-body-secondary mb-0">PNG, JPG, GIF, WebP, BMP, and TIFF files are supported.</p>
              <div class="d-flex justify-content-center flex-wrap gap-2 mt-3">
                <label class="btn btn-outline-primary" for="bulk-image-files">Choose Images</label>
                <button class="btn btn-outline-secondary" type="button" on:click={clearImageFiles} disabled={imageFiles.length === 0}>
                  Clear Selection
                </button>
              </div>
              <input
                id="bulk-image-files"
                class="visually-hidden"
                type="file"
                multiple
                accept="image/*"
                on:change={handleImageInput}
              />
            </div>
          </div>

          {#if imageFiles.length}
            <div class="mt-4">
              <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                <h3 class="h6 mb-0">Selected Images</h3>
                <span class="text-body-secondary small">{imageFiles.length} files queued</span>
              </div>
              <div class="list-group">
                {#each imageFiles as file, index}
                  <div class="list-group-item d-flex justify-content-between align-items-center gap-3">
                    <div class="min-w-0">
                      <div class="d-flex flex-wrap gap-2 align-items-center">
                        <strong class="text-truncate">{file.name}</strong>
                        <span class="badge text-bg-secondary">{summarizeKind(file)}</span>
                      </div>
                      <div class="small text-body-secondary">{formatBytes(file.size)}</div>
                    </div>
                    <button class="btn btn-outline-danger btn-sm" type="button" on:click={() => removeImageFile(index)}>Remove</button>
                  </div>
                {/each}
              </div>
            </div>
          {:else}
            <p class="text-body-secondary mt-4 mb-0">No image files selected yet.</p>
          {/if}

          <div class="d-flex flex-wrap gap-2 mt-4">
            <button class="btn btn-primary" type="button" on:click={runImageImport} disabled={imageBusy || imageFiles.length === 0 || !imageTargetId || !targetOptions.length}>
              {imageBusy ? 'Working...' : 'Upload Images'}
            </button>
          </div>

          {#if imageError}
            <div class="alert alert-danger mt-3 mb-0">{imageError}</div>
          {/if}
        </div>
      </div>

    </div>
  </div>
</div>

<style>
  .bulk-shell {
    width: 100%;
    max-width: none;
    margin: 0 auto;
    padding: 1.5rem 0 3rem;
  }

  .hero-panel {
    overflow: hidden;
    background:
      radial-gradient(circle at top right, rgba(56, 189, 248, 0.18), transparent 32%),
      radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.14), transparent 28%),
      linear-gradient(180deg, var(--app-surface), var(--app-surface-soft));
    border: 1px solid var(--bs-border-color-translucent);
    box-shadow: var(--app-shadow-sm);
  }

  .eyebrow,
  .section-label {
    color: var(--bs-secondary-color);
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

  .success-toast {
    position: fixed;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    width: min(42rem, calc(100vw - 2rem));
    z-index: 1080;
    pointer-events: none;
  }

  .success-toast-alert {
    position: relative;
    overflow: hidden;
    padding-bottom: 1rem;
    pointer-events: auto;
  }

  .success-toast-progress {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 0.25rem;
    background: rgba(25, 135, 84, 0.55);
    transform-origin: left center;
    animation: success-toast-countdown 3s linear forwards;
  }

  @keyframes success-toast-countdown {
    from {
      transform: scaleX(1);
    }

    to {
      transform: scaleX(0);
    }
  }

  .dropzone {
    border: 2px dashed var(--bs-border-color-translucent);
    background: linear-gradient(180deg, var(--app-surface-soft), var(--app-surface));
    transition:
      border-color 160ms ease,
      transform 160ms ease,
      box-shadow 160ms ease;
  }

  .dropzone-image {
    background: linear-gradient(180deg, var(--app-surface-soft), var(--app-surface));
  }

  .dropzone-active {
    border-color: rgba(59, 130, 246, 0.8);
    box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.14), var(--app-shadow-sm);
    transform: translateY(-1px);
  }

  .metric-box {
    background: var(--app-surface-soft);
    border: 1px solid var(--bs-border-color-translucent);
    padding: 1rem;
    box-shadow: var(--app-shadow-xs);
  }

  .metric-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--bs-secondary-color);
    margin-bottom: 0.25rem;
  }

  .metric-value {
    font-weight: 600;
  }

  .section-card {
    border: 1px solid var(--bs-border-color-translucent);
    border-radius: 1rem;
    background: var(--app-surface-soft);
    padding: 1rem;
    box-shadow: var(--app-shadow-xs);
  }

  .mapping-list {
    display: grid;
    gap: 0.75rem;
  }

  .mapping-row {
    display: grid;
    grid-template-columns: minmax(140px, 0.9fr) auto minmax(240px, 1.6fr);
    gap: 0.75rem;
    align-items: center;
    padding: 0.85rem 0.9rem;
    border-radius: 0.9rem;
    border: 1px solid var(--bs-border-color-translucent);
    background: var(--app-surface);
    box-shadow: var(--app-shadow-xs);
  }

  .mapping-sheet {
    min-width: 0;
  }

  .mapping-arrow {
    color: var(--bs-secondary-color);
    font-size: 1.4rem;
    font-weight: 700;
  }

  .card.shadow-sm {
    box-shadow: var(--app-shadow-sm);
  }

  .card.shadow-sm:hover {
    box-shadow: var(--app-shadow-md);
  }

  :global([data-theme='dark']) .hero-panel {
    background:
      radial-gradient(circle at top right, rgba(56, 189, 248, 0.2), transparent 34%),
      radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.16), transparent 26%),
      linear-gradient(180deg, var(--app-surface), var(--app-surface-soft));
  }

  :global([data-theme='dark']) .section-card,
  :global([data-theme='dark']) .metric-box,
  :global([data-theme='dark']) .mapping-row {
    box-shadow: var(--app-shadow-sm);
  }

  @media (max-width: 992px) {
    .mapping-row {
      grid-template-columns: 1fr;
    }

    .mapping-arrow {
      display: none;
    }
  }
</style>
