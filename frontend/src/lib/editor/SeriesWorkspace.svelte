<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import {
    createSeries,
    deleteSeries,
    deleteSeriesImage,
    getProductTypes,
    getSeries,
    getTemplates,
    reorderSeriesImages,
    updateSeries,
    uploadSeriesImages
  } from '$lib/api.js';
  import SeriesMediaPanel from '$lib/editor/SeriesMediaPanel.svelte';

  export let initialMode = 'create';
  export let initialSeriesId = '';

  let productTypes = [];
  let seriesRecords = [];
  let templateRegistry = { product_templates: [], series_templates: [] };
  let selectedSeriesId = '';
  let seriesProductTypeFilter = '';
  let saving = false;
  let error = '';
  let success = '';
  let mode = initialMode;
  let seriesImages = [];
  let pendingImageFiles = [];
  let appliedInitialSeriesId = null;
  let appliedSeriesEditorUrlId = '';
  let hydratedSeriesId = '';

  function resetDraft(series = null) {
    return {
      id: series?.id ?? null,
      name: series?.name ?? '',
      product_type_key: series?.product_type_key ?? '',
      printed_template_id: series?.printed_template_id || series?.template_id || '',
      online_template_id: series?.online_template_id || series?.template_id || '',
      description1_html: series?.description1_html ?? '',
      description2_html: series?.description2_html ?? '',
      description3_html: series?.description3_html ?? '',
      comments_html: series?.description4_html ?? series?.comments_html ?? ''
    };
  }

  let seriesDraft = resetDraft();
  $: filteredSeriesRecords = seriesProductTypeFilter
    ? seriesRecords.filter((item) => String(item.product_type_key || '') === String(seriesProductTypeFilter))
    : seriesRecords;

  function hydrateSelectedSeries(seriesId = selectedSeriesId) {
    const normalizedSeriesId = seriesId == null || seriesId === '' ? '' : String(seriesId);
    if (!normalizedSeriesId) {
      hydratedSeriesId = '';
      if (seriesDraft.id) {
        seriesDraft = resetDraft();
        seriesImages = [];
      }
      return;
    }

    const selected = seriesRecords.find((item) => String(item.id) === normalizedSeriesId);
    if (!selected) {
      return;
    }

    if (hydratedSeriesId === normalizedSeriesId && String(seriesDraft.id || '') === normalizedSeriesId) {
      return;
    }

    hydratedSeriesId = normalizedSeriesId;
    seriesDraft = resetDraft(selected);
    seriesImages = selected.series_images || [];
    if (!seriesProductTypeFilter) {
      seriesProductTypeFilter = selected.product_type_key || '';
    }
  }

  function syncSeriesEditorUrl(seriesId) {
    if (typeof window === 'undefined') return;
    const nextSeriesId = seriesId == null || seriesId === '' ? '' : String(seriesId);
    const nextUrl = nextSeriesId ? `/editor/series/edit/${encodeURIComponent(nextSeriesId)}` : '/editor/series/edit';
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` === nextUrl) return;
    void goto(nextUrl, { replaceState: true, noScroll: true, keepFocus: true });
  }

  function clearSeriesSelection() {
    selectedSeriesId = '';
    seriesDraft = resetDraft();
    seriesImages = [];
    hydratedSeriesId = '';
    performanceColumnGroups = [];
    pendingImageFiles = [];
    syncSeriesEditorUrl('');
  }

  $: if (mode === 'edit' && String(selectedSeriesId) !== String(appliedSeriesEditorUrlId)) {
    appliedSeriesEditorUrlId = String(selectedSeriesId || '');
    syncSeriesEditorUrl(selectedSeriesId);
  }

  $: if (mode === 'edit' && selectedSeriesId) {
    hydrateSelectedSeries();
  }

  function seriesViewerUrl(seriesId = seriesDraft.id) {
    const nextSeriesId = seriesId == null || seriesId === '' ? '' : String(seriesId);
    return nextSeriesId ? `/viewer/series/${encodeURIComponent(nextSeriesId)}` : '/viewer/series';
  }

  $: {
    const nextInitialSeriesId = initialSeriesId !== '' && initialSeriesId != null ? String(initialSeriesId) : '';
    if (nextInitialSeriesId !== appliedInitialSeriesId) {
      appliedInitialSeriesId = nextInitialSeriesId;
      selectedSeriesId = nextInitialSeriesId;
      pendingImageFiles = [];

      if (nextInitialSeriesId) {
        if (mode !== 'create') {
          mode = 'edit';
        }
        hydrateSelectedSeries(nextInitialSeriesId);
      } else if (mode !== 'create' || seriesDraft.id) {
        seriesDraft = resetDraft();
        seriesImages = [];
        hydratedSeriesId = '';
      }
    }
  }

  function startCreate() {
    mode = 'create';
    selectedSeriesId = '';
    seriesProductTypeFilter = '';
    seriesDraft = resetDraft();
    seriesImages = [];
    pendingImageFiles = [];
    hydratedSeriesId = '';
    error = '';
    success = '';
  }

  function startEdit() {
    mode = 'edit';
    selectedSeriesId = '';
    seriesProductTypeFilter = '';
    seriesDraft = resetDraft();
    seriesImages = [];
    pendingImageFiles = [];
    hydratedSeriesId = '';
    error = '';
    success = '';
  }

  function cancelEditing() {
    mode = initialMode;
    selectedSeriesId = '';
    seriesProductTypeFilter = '';
    seriesDraft = resetDraft();
    seriesImages = [];
    pendingImageFiles = [];
    hydratedSeriesId = '';
    syncSeriesEditorUrl('');
    error = '';
    success = '';
  }

  async function loadData() {
    try {
      [productTypes, seriesRecords, templateRegistry] = await Promise.all([getProductTypes(), getSeries(), getTemplates()]);
      if (mode === 'edit' && selectedSeriesId) {
        hydrateSelectedSeries();
      } else if (!selectedSeriesId && !initialSeriesId) {
        seriesDraft = resetDraft();
        seriesImages = [];
      }
    } catch (e) {
      error = e.message;
    }
  }

  async function saveSeries() {
    error = '';
    success = '';
    saving = true;
    try {
      const body = {
        name: seriesDraft.name,
        product_type_key: seriesDraft.product_type_key,
        printed_template_id: seriesDraft.printed_template_id || null,
        online_template_id: seriesDraft.online_template_id || null,
        description1_html: seriesDraft.description1_html || null,
        description2_html: seriesDraft.description2_html || null,
        description3_html: seriesDraft.description3_html || null,
        comments_html: seriesDraft.comments_html || null
      };

      if (!body.product_type_key) {
        error = 'Choose a product type for the series.';
        return;
      }

      if (seriesDraft.id) {
        await updateSeries(seriesDraft.id, body);
        success = 'Series updated.';
      } else {
        await createSeries(body);
        success = 'Series created.';
      }

      await loadData();
      cancelEditing();
    } catch (e) {
      error = e.message;
    } finally {
      saving = false;
    }
  }

  async function deleteCurrentSeries() {
    if (!seriesDraft.id) return;
    const confirmed = window.confirm(`Delete series "${seriesDraft.name || seriesDraft.id}"? This cannot be undone.`);
    if (!confirmed) return;

    error = '';
    success = '';
    saving = true;
    try {
      await deleteSeries(seriesDraft.id);
      await loadData();
      mode = initialMode;
      selectedSeriesId = '';
      seriesDraft = resetDraft();
      seriesImages = [];
      pendingImageFiles = [];
      syncSeriesEditorUrl('');
      success = 'Series deleted.';
    } catch (e) {
      error = e.message;
    } finally {
      saving = false;
    }
  }

  onMount(async () => {
    await loadData();
    if (selectedSeriesId) {
      mode = 'edit';
      hydrateSelectedSeries();
    }
  });

  async function uploadImages() {
    if (!seriesDraft.id) {
      error = 'Save the series before uploading series images.';
      return;
    }
    if (!pendingImageFiles.length) {
      return;
    }
    error = '';
    success = '';
    saving = true;
    try {
      seriesImages = await uploadSeriesImages(seriesDraft.id, pendingImageFiles);
      pendingImageFiles = [];
      success = 'Series images uploaded.';
    } catch (e) {
      error = e.message;
    } finally {
      saving = false;
    }
  }

  async function moveSeriesImage(index, direction) {
    if (!seriesDraft.id) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= seriesImages.length) return;
    const reordered = [...seriesImages];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    seriesImages = await reorderSeriesImages(seriesDraft.id, reordered.map((image) => image.id));
  }

  async function removeSeriesImage(image) {
    if (!seriesDraft.id) return;
    if (!window.confirm('Delete this series image?')) return;
    seriesImages = await deleteSeriesImage(seriesDraft.id, image.id);
  }
</script>

<svelte:head>
  <title>Series — Editor</title>
</svelte:head>

<div class="row justify-content-center">
  <div class="col-12 col-xxl-12">
    {#if error}
      <div class="alert alert-danger">{error}</div>
    {/if}
    {#if success}
      <div class="alert alert-success">{success}</div>
    {/if}

    <div class="card shadow-sm">
      <div class="card-body">
        {#if mode === 'edit'}
          <div class="series-picker-panel border rounded-3 p-3 mb-3">
            <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-2 mb-3">
              <div>
                <h3 class="h6 mb-1">Choose series</h3>
                <p class="text-body-secondary small mb-0">
                  Use the filter to narrow the list, then pick the series you want to edit.
                  The series' own product type is still edited in the form below.
                </p>
              </div>
            </div>
            <div class="row g-3">
              <div class="col-12 col-md-4">
                <label class="form-label" for="series-product-type-filter">Filter by product type</label>
                <select
                  class="form-select"
                  id="series-product-type-filter"
                  bind:value={seriesProductTypeFilter}
                  on:change={(event) => {
                    seriesProductTypeFilter = event.currentTarget.value;
                    clearSeriesSelection();
                  }}
                >
                  <option value="">All product types</option>
                  {#each productTypes as productType}
                    <option value={productType.key}>{productType.label}</option>
                  {/each}
                </select>
              </div>
              <div class="col-12 col-md-8">
                <label class="form-label" for="series-select">Select series</label>
                <select
                  class="form-select"
                  id="series-select"
                  bind:value={selectedSeriesId}
                  on:change={(event) => {
                    mode = 'edit';
                    hydrateSelectedSeries(event.currentTarget.value);
                    performanceColumnGroups = [];
                    pendingImageFiles = [];
                    syncSeriesEditorUrl(event.currentTarget.value);
                    if (event.currentTarget.value) {
                      void loadPerformanceColumns(event.currentTarget.value).catch((e) => {
                        error = e.message;
                      });
                    }
                  }}
                >
                  <option value="">-- Choose option --</option>
                  {#each filteredSeriesRecords as series}
                    <option value={series.id}>{series.name}</option>
                  {/each}
                </select>
              </div>
          </div>
          </div>
        {/if}

        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label" for="series-name">Series name</label>
            <input class="form-control" id="series-name" bind:value={seriesDraft.name} />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label" for="series-type">Product type</label>
            <select class="form-select" id="series-type" bind:value={seriesDraft.product_type_key}>
              <option value="">-- Choose option --</option>
              {#each productTypes as productType}
                <option value={productType.key}>{productType.label}</option>
              {/each}
            </select>
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label" for="series-printed-template">Printed PDF template</label>
            <select class="form-select" id="series-printed-template" bind:value={seriesDraft.printed_template_id}>
              <option value="">No template</option>
              {#each templateRegistry.series_templates ?? [] as template}
                <option value={template.id}>{template.label}</option>
              {/each}
            </select>
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label" for="series-online-template">Online PDF template</label>
            <select class="form-select" id="series-online-template" bind:value={seriesDraft.online_template_id}>
              <option value="">No template</option>
              {#each templateRegistry.series_templates ?? [] as template}
                <option value={template.id}>{template.label}</option>
              {/each}
            </select>
          </div>
          <div class="col-12">
            <label class="form-label" for="series-description1">Description1 (HTML)</label>
            <textarea class="form-control" id="series-description1" rows="3" bind:value={seriesDraft.description1_html}></textarea>
          </div>
          <div class="col-12 col-lg-6">
            <label class="form-label" for="series-description2">Description2 (HTML)</label>
            <textarea class="form-control" id="series-description2" rows="3" bind:value={seriesDraft.description2_html}></textarea>
          </div>
          <div class="col-12 col-lg-6">
            <label class="form-label" for="series-description3">Description3 (HTML)</label>
            <textarea class="form-control" id="series-description3" rows="3" bind:value={seriesDraft.description3_html}></textarea>
          </div>
          <div class="col-12">
            <label class="form-label" for="series-comments">Comments (HTML)</label>
            <textarea class="form-control" id="series-comments" rows="3" bind:value={seriesDraft.comments_html}></textarea>
          </div>
        </div>

        <div class="d-flex flex-wrap gap-2 mt-3">
          <button class="btn btn-primary" on:click={saveSeries} disabled={saving}>{saving ? 'Saving...' : 'Save Series'}</button>
          {#if seriesDraft.id}
            <a class="btn btn-outline-primary" href={seriesViewerUrl(seriesDraft.id)}>
              View in Viewer
            </a>
          {/if}
          {#if mode === 'edit' && seriesDraft.id}
            <button class="btn btn-outline-danger" on:click={deleteCurrentSeries} disabled={saving}>Delete Series</button>
          {/if}
          <button class="btn btn-outline-secondary" on:click={cancelEditing}>Cancel</button>
        </div>

        {#if mode === 'edit' && seriesDraft.id}
          <div class="mt-3">
            <SeriesMediaPanel
              seriesForm={seriesDraft}
              bind:pendingImageFiles
              {seriesImages}
              {uploadImages}
              {moveSeriesImage}
              {removeSeriesImage}
            />
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
