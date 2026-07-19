<script>
  import AssociatedDocumentsPanel from '$lib/editor/AssociatedDocumentsPanel.svelte';
  export let seriesForm;
  export let seriesImages = [];
  export let pendingImageFiles = [];
  export let uploadImages = () => {};
  export let moveSeriesImage = () => {};
  export let removeSeriesImage = () => {};
</script>

<div class="vstack gap-3">
  {#if seriesForm?.id}
    <AssociatedDocumentsPanel ownerType="series" ownerId={seriesForm.id} />
  {/if}
  <div class="card shadow-sm h-100">
    <div class="card-body">
      <h3 class="h6">Series images</h3>
      <p class="text-body-secondary">Upload multiple images, reorder them, and the first two become the primary and secondary series images.</p>
      <div class="mb-3">
        <label class="form-label" for="edit-series-images">Select image files</label>
        <input
          class="form-control"
          id="edit-series-images"
          type="file"
          accept="image/*"
          multiple
          on:change={(event) => {
            pendingImageFiles = Array.from(event.currentTarget.files || []);
          }}
        />
      </div>
      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-primary" on:click={uploadImages} disabled={pendingImageFiles.length === 0}>Upload Selected Images</button>
      </div>
      {#if seriesImages.length > 0}
        <div class="row g-3 mt-1">
          {#each seriesImages as image, index}
            <div class="col-12 col-sm-6">
              <div class="card shadow-sm h-100">
                <div class="card-body">
                  <img
                    class="img-fluid rounded border mb-2"
                    style="width: 100%; height: 150px; object-fit: cover;"
                    src={image.url}
                    alt={`${seriesForm.name} series image ${index + 1}`}
                  />
                  <p class="text-body-secondary">
                    {index === 0 ? 'Primary image' : index === 1 ? 'Secondary image' : `Image ${index + 1}`}
                  </p>
                  <div class="d-flex flex-wrap gap-2">
                    <button class="btn btn-outline-secondary btn-sm" on:click={() => moveSeriesImage(index, -1)} disabled={index === 0}>Move Up</button>
                    <button class="btn btn-outline-secondary btn-sm" on:click={() => moveSeriesImage(index, 1)} disabled={index === seriesImages.length - 1}>Move Down</button>
                    <button class="btn btn-danger btn-sm" on:click={() => removeSeriesImage(image)}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-body-secondary mt-3 mb-0">No series images uploaded yet.</p>
      {/if}
    </div>
  </div>
</div>
