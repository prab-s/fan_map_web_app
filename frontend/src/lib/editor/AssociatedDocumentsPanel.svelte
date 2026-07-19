<script>
  import { deleteAssociatedDocument, getAssociatedDocuments, uploadAssociatedDocuments } from '$lib/api.js';

  export let ownerType;
  export let ownerId;
  export let editable = true;
  export let title = 'Associated documents';

  let documents = [];
  let pendingFiles = [];
  let loading = false;
  let saving = false;
  let error = '';

  async function loadDocuments() {
    if (!ownerId) {
      documents = [];
      return;
    }
    loading = true;
    error = '';
    try {
      documents = await getAssociatedDocuments(ownerType, ownerId);
    } catch (e) {
      error = e.message || 'Unable to load associated documents.';
    } finally {
      loading = false;
    }
  }

  async function uploadDocuments() {
    if (!ownerId || pendingFiles.length === 0) return;
    saving = true;
    error = '';
    try {
      documents = await uploadAssociatedDocuments(ownerType, ownerId, pendingFiles);
      pendingFiles = [];
    } catch (e) {
      error = e.message || 'Unable to upload associated documents.';
    } finally {
      saving = false;
    }
  }

  async function removeDocument(document) {
    if (!window.confirm(`Delete ${document.original_file_name || 'this document'}?`)) return;
    saving = true;
    error = '';
    try {
      await deleteAssociatedDocument(ownerType, ownerId, document.id);
      documents = documents.filter((item) => item.id !== document.id);
    } catch (e) {
      error = e.message || 'Unable to delete associated document.';
    } finally {
      saving = false;
    }
  }

  $: if (ownerType && ownerId) loadDocuments();
</script>

<div class="card shadow-sm">
  <div class="card-body">
    <h3 class="h6">{title}</h3>
    {#if editable}
      <p class="text-body-secondary">Upload PDFs and other supporting files such as wiring diagrams.</p>
      <input class="form-control mb-2" type="file" multiple on:change={(event) => (pendingFiles = Array.from(event.currentTarget.files || []))} />
      <button class="btn btn-primary btn-sm" type="button" on:click={uploadDocuments} disabled={saving || !ownerId || pendingFiles.length === 0}>
        {saving ? 'Saving...' : 'Upload documents'}
      </button>
    {/if}
    {#if error}<div class="alert alert-danger mt-3 mb-0">{error}</div>{/if}
    {#if loading}
      <p class="text-body-secondary mt-3 mb-0">Loading documents...</p>
    {:else if documents.length > 0}
      <div class="list-group mt-3">
        {#each documents as document}
          <div class="list-group-item d-flex align-items-center gap-2">
            <a class="text-decoration-none flex-grow-1" href={document.download_url} target="_blank" rel="noreferrer">
              <span class="fw-semibold d-block">{document.original_file_name}</span>
              <span class="small text-body-secondary">Open or download</span>
            </a>
            {#if editable}
              <button class="btn btn-outline-danger btn-sm" type="button" on:click={() => removeDocument(document)} disabled={saving}>Delete</button>
            {/if}
          </div>
        {/each}
      </div>
    {:else}
      <p class="text-body-secondary mt-3 mb-0">No associated documents yet.</p>
    {/if}
  </div>
</div>
