<script>
  import { onMount } from 'svelte';
  import { getCmsPages, createCmsPage, updateCmsPage, publishCmsPage, deleteCmsPage, getCmsAssets, uploadCmsAsset, deleteCmsAsset } from '$lib/api.js';

  const starterPages = [
    {
      id: 'about',
      label: 'About us',
      path: '/about-us',
      type: 'Page',
      status: 'Published',
      updated: 'Today, 9:42 AM',
      headline: 'Engineering better air movement',
      intro: 'We design and supply ventilation products that make buildings healthier, quieter, and more efficient.',
      body: 'Fan Graphs brings practical engineering experience and dependable products together. Our team works with consultants, contractors, and building owners to find the right solution for every project.',
      cta: 'Meet the team'
    },
    {
      id: 'contact',
      label: 'Contact',
      path: '/contact',
      type: 'Page',
      status: 'Published',
      updated: 'Yesterday, 3:18 PM',
      headline: 'Let’s talk about your project',
      intro: 'Tell us what you are working on and our team will help you find the right next step.',
      body: 'For product guidance, project support, or general questions, send us a message. We aim to respond within one business day.',
      cta: 'Send an enquiry'
    },
    {
      id: 'engineering',
      label: 'Engineering services',
      path: '/engineering-services',
      type: 'Page',
      status: 'Draft',
      updated: '28 Aug 2026',
      headline: 'Engineering support that moves projects forward',
      intro: 'From early-stage selection to final documentation, we help teams make confident ventilation decisions.',
      body: 'Our engineering services include product selection, performance review, application advice, and project-specific documentation. Bring us the constraints and we will help work through the options.',
      cta: 'Explore our services'
    },
    {
      id: 'projects',
      label: 'Past projects',
      path: '/past-projects',
      type: 'Page',
      status: 'Published',
      updated: '26 Aug 2026',
      headline: 'Solutions in the real world',
      intro: 'A selection of projects where careful product choices made a measurable difference.',
      body: 'Browse examples of our work across commercial, industrial, and specialist environments. Each project reflects close collaboration, considered design, and reliable delivery.',
      cta: 'View project stories'
    },
    {
      id: 'enquiries-modal',
      label: 'Enquiries modal',
      path: 'Global component',
      type: 'Modal',
      status: 'Published',
      updated: '22 Aug 2026',
      headline: 'How can we help?',
      intro: 'Choose the option that best describes what you need and we’ll route your enquiry to the right person.',
      body: 'Keep this message short and welcoming. The form collects the customer’s contact details and any project context they can share.',
      cta: 'Continue'
    }
  ];

  let pages = starterPages.map((page) => ({ ...page }));
  let selectedId = 'about';
  let draft = { ...pages[0] };
  let saved = true;
  let saveMessage = '';
  let previewMode = 'desktop';
  let search = '';
  let modalOpen = false;
  let loading = true;
  let loadError = '';
  let saving = false;
  let assets = [];
  let assetError = '';
  let uploading = false;
  let assetTarget = null;
  let enquiryPreviewOpen = false;
  let createOpen = false;
  let newLabel = '';
  let newSlug = '';
  let slugEdited = false;
  let newTemplate = 'standard';
  let creating = false;
  const aboutProcessDefaults = [
    { title: 'Listen', text: 'Understand the application, constraints, and desired outcome.' },
    { title: 'Recommend', text: 'Point customers toward suitable products or services.' },
    { title: 'Support', text: 'Provide documentation, technical context, and practical guidance.' },
    { title: 'Follow through', text: 'Keep communication clear from enquiry through delivery.' }
  ];

  $: selectedPage = pages.find((page) => page.id === selectedId) || pages[0];
  $: enquiryPage = pages.find((page) => page.id === 'enquiries-modal') || {};
  $: filteredPages = pages.filter((page) => page.label.toLowerCase().includes(search.trim().toLowerCase()));
  $: wordCount = (draft.body || '').trim() ? draft.body.trim().split(/\s+/).length : 0;

  onMount(() => {
    loadPages();
  });

  function normalizePage(page) {
    const content = page.draft_content || {};
    return {
      ...page,
      id: page.slug,
      path: page.content_type === 'modal' ? 'Global component' : `/${page.slug}`,
      type: page.content_type === 'modal' ? 'Modal' : 'Page',
      status: page.status === 'published' ? 'Published' : 'Draft',
      updated: page.updated_at ? new Date(page.updated_at).toLocaleString() : '—',
      headline: content.hero_heading || content.heading || '',
      intro: content.hero_intro || content.request_help || '',
      body: (content.story_paragraphs || content.what_we_do_paragraphs || [content.hero_callout_text || '']).join('\n\n'),
      cta: content.cta_label || content.quote_button || content.submit_label || content.custom_button || ''
    };
  }

  async function loadPages() {
    loading = true;
    loadError = '';
    try {
      const response = await getCmsPages();
      pages = response.map(normalizePage);
      const page = pages.find((item) => item.id === selectedId) || pages[0];
      if (page) {
        selectedId = page.id;
        draft = { ...page };
      }
      assets = await getCmsAssets();
    } catch (error) {
      loadError = error?.message || 'Unable to load CMS pages.';
    } finally {
      loading = false;
    }
  }

  function updateSeo(field, value) {
    draft = { ...draft, draft_seo: { ...(draft.draft_seo || {}), [field]: value } };
    saved = false;
    saveMessage = '';
  }

  async function handleAssetUpload(event) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    uploading = true;
    assetError = '';
    try {
      const asset = await uploadCmsAsset(file);
      assets = [asset, ...assets];
    } catch (error) {
      assetError = error?.message || 'Unable to upload asset.';
    } finally {
      uploading = false;
      event.currentTarget.value = '';
    }
  }

  async function removeAsset(asset) {
    if (asset.used_by?.length || !window.confirm(`Delete ${asset.original_file_name}?`)) return;
    try {
      await deleteCmsAsset(asset.file_name);
      assets = assets.filter((item) => item.file_name !== asset.file_name);
    } catch (error) {
      assetError = error?.message || 'Unable to delete asset.';
    }
  }

  function contentFromDraft() {
    const current = pages.find((page) => page.id === draft.id);
    const content = { ...(draft.draft_content || current?.draft_content || {}) };
    if (content.hero_heading !== undefined || draft.type === 'Page') content.hero_heading = draft.headline;
    if (content.hero_intro !== undefined || draft.type === 'Page') content.hero_intro = draft.intro;
    if (content.heading !== undefined) content.heading = draft.headline;
    if (content.request_help !== undefined) content.request_help = draft.intro;
    if (content.cta_label !== undefined) content.cta_label = draft.cta;
    if (content.quote_button !== undefined) content.quote_button = draft.cta;
    if (content.submit_label !== undefined) content.submit_label = draft.cta;
    if (content.custom_button !== undefined) content.custom_button = draft.cta;
    if (content.story_paragraphs !== undefined) content.story_paragraphs = draft.body.split(/\n\s*\n/).filter(Boolean);
    if (content.what_we_do_paragraphs !== undefined) content.what_we_do_paragraphs = draft.body.split(/\n\s*\n/).filter(Boolean);
    return content;
  }

  function updateStructured(field, index, key, value) {
    const items = Array.isArray(draft.draft_content?.[field])
      ? [...draft.draft_content[field]]
      : field === 'process_steps' ? aboutProcessDefaults.map((item) => ({ ...item })) : [];
    items[index] = { ...items[index], [key]: value };
    draft = { ...draft, draft_content: { ...(draft.draft_content || {}), [field]: items } };
    saved = false;
  }

  function updateContent(field, value) {
    draft = { ...draft, draft_content: { ...(draft.draft_content || {}), [field]: value } };
    saved = false;
  }

  function useAsset(asset) {
    if (!assetTarget) return;
    if (assetTarget.field === 'contact') updateContent('shopfront_image', asset.url);
    else updateStructured(assetTarget.field, assetTarget.index, 'image', asset.url);
    assetTarget = null;
  }

  function selectPage(page) {
    selectedId = page.id;
    draft = { ...page };
    saved = true;
    saveMessage = '';
  }

  function updateDraft(field, value) {
    draft = { ...draft, [field]: value };
    saved = false;
    saveMessage = '';
  }

  async function saveDraft() {
    saving = true;
    try {
      const updated = await updateCmsPage(draft.id, { content: contentFromDraft(), seo: draft.draft_seo || {} });
      const normalized = normalizePage(updated);
      pages = pages.map((page) => page.id === draft.id ? normalized : page);
      draft = { ...normalized };
      saved = true;
      saveMessage = 'Changes saved';
    } catch (error) {
      saveMessage = error?.message || 'Unable to save changes';
    } finally {
      saving = false;
      window.setTimeout(() => (saveMessage = ''), 2400);
    }
  }

  async function publishDraft() {
    saving = true;
    try {
      if (!saved) await saveDraft();
      const updated = await publishCmsPage(draft.id);
      const normalized = normalizePage(updated);
      pages = pages.map((page) => page.id === draft.id ? normalized : page);
      draft = { ...normalized };
      saved = true;
      saveMessage = 'Page published';
    } catch (error) {
      saveMessage = error?.message || 'Unable to publish page';
    } finally {
      saving = false;
      window.setTimeout(() => (saveMessage = ''), 2400);
    }
  }

  function resetDraft() {
    const current = pages.find((page) => page.id === draft.id);
    draft = { ...current };
    saved = true;
  }

  function slugify(value) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function updateNewLabel(value) { newLabel = value; if (!slugEdited) newSlug = slugify(value); }
  async function createPage() {
    creating = true;
    try {
      const created = normalizePage(await createCmsPage({ label: newLabel, slug: newSlug, template: newTemplate }));
      pages = [...pages, created];
      selectPage(created);
      createOpen = false;
      newLabel = ''; newSlug = ''; slugEdited = false; newTemplate = 'standard';
      saveMessage = 'Page created as draft';
    } catch (error) { saveMessage = error?.message || 'Unable to create page'; }
    finally { creating = false; }
  }
  async function deletePage() {
    if (draft.id === 'enquiries-modal' || !window.confirm(`Permanently delete “${draft.label}”? This cannot be undone.`)) return;
    try {
      await deleteCmsPage(draft.id);
      pages = pages.filter((page) => page.id !== draft.id);
      const next = pages[0];
      if (next) selectPage(next);
      saveMessage = 'Page permanently deleted';
    } catch (error) { saveMessage = error?.message || 'Unable to delete page'; }
  }
</script>

<svelte:head>
  <title>CMS — Internal Facing</title>
</svelte:head>

<div class="cms-page">
  <div class="cms-heading">
    <div>
      <p class="eyebrow mb-2">Content management</p>
      <div class="d-flex flex-wrap align-items-center gap-3">
        <h1 class="mb-0">CMS</h1>
        <span class="cms-status"><span class="status-dot"></span>Site content</span>
      </div>
      <p class="text-body-secondary mb-0 mt-2">Manage the content that appears across your public-facing pages.</p>
    </div>
    <div class="d-flex align-items-center gap-2">
      {#if saveMessage}<span class="save-message">✓ {saveMessage}</span>{/if}
      <a class="btn btn-outline-primary" href="/cms-experimental">Try page builder</a>
      <button class="btn btn-outline-secondary" type="button" on:click={resetDraft} disabled={saved}>Discard</button>
      <button class="btn btn-primary" type="button" on:click={saveDraft} disabled={saved || saving}>{saving ? 'Saving…' : 'Save changes'}</button>
    </div>
  </div>

  {#if loading}<div class="alert alert-info">Loading CMS content…</div>{/if}
  {#if loadError}<div class="alert alert-danger">{loadError}</div>{/if}
  <div class="cms-layout">
    <aside class="cms-sidebar card">
      <div class="sidebar-top">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="h6 mb-0">Site pages</h2>
          <button class="btn btn-sm btn-outline-primary" type="button" on:click={() => (createOpen = true)}>+ New page</button>
        </div>
        <input class="form-control form-control-sm" type="search" bind:value={search} placeholder="Search pages" aria-label="Search pages" />
      </div>
      <div class="page-list">
        {#each filteredPages as page}
          <button class:active={page.id === selectedId} class="page-list-item" type="button" on:click={() => selectPage(page)}>
            <span class="page-icon">{page.type === 'Modal' ? '✦' : '□'}</span>
            <span class="page-list-copy">
              <span class="page-list-label">{page.label}</span>
              <span class="page-list-meta">{page.path}</span>
            </span>
            <span class:published={page.status === 'Published'} class="page-state">{page.id === 'enquiries-modal' ? 'Protected' : page.status === 'Published' ? 'Live' : 'Draft'}</span>
          </button>
        {/each}
      </div>
      <div class="sidebar-bottom">
        <div class="small text-body-secondary mb-2">Publishing checklist</div>
        <div class="check-row"><span class="check-icon">✓</span> Content is reviewed</div>
        <div class="check-row"><span class="check-icon">✓</span> Preview is available</div>
      </div>
    </aside>

    <section class="cms-editor">
      <div class="editor-toolbar">
        <div>
          <div class="small text-body-secondary mb-1">Editing {draft.type.toLowerCase()}</div>
          <h2 class="h4 mb-0">{draft.label}</h2>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class:published={draft.status === 'Published'} class="status-pill">{draft.status}</span>
          <button class="btn btn-outline-primary btn-sm" type="button" on:click={() => (modalOpen = true)}>Preview</button>
          {#if draft.status !== 'Published'}<button class="btn btn-primary btn-sm" type="button" on:click={publishDraft}>Publish</button>{/if}
          {#if draft.id !== 'enquiries-modal'}<button class="btn btn-outline-danger btn-sm" type="button" on:click={deletePage}>Delete</button>{/if}
        </div>
      </div>

      <div class="row g-4 editor-content">
        <div class="col-12 col-xl-7">
          <div class="card editor-card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-4">
                <div><h3 class="h6 mb-1">Page content</h3><p class="small text-body-secondary mb-0">Update the copy shown on this page.</p></div>
                <span class="content-badge">{draft.type}</span>
              </div>

              <div class="mb-3">
                <label class="form-label" for="cms-headline">Headline</label>
                <input id="cms-headline" class="form-control form-control-lg" value={draft.headline} on:input={(event) => updateDraft('headline', event.currentTarget.value)} />
              </div>
              <div class="mb-3">
                <label class="form-label" for="cms-intro">Introductory copy</label>
                <textarea id="cms-intro" class="form-control" rows="3" on:input={(event) => updateDraft('intro', event.currentTarget.value)}>{draft.intro}</textarea>
                <div class="form-text">The short summary used near the top of the page.</div>
              </div>
              <div class="mb-3">
                <div class="d-flex justify-content-between"><label class="form-label" for="cms-body">Body copy</label><span class="small text-body-secondary">{wordCount} words</span></div>
                <textarea id="cms-body" class="form-control" rows="9" on:input={(event) => updateDraft('body', event.currentTarget.value)}>{draft.body}</textarea>
              </div>
              <div>
                <label class="form-label" for="cms-cta">Primary button label</label>
                <input id="cms-cta" class="form-control" value={draft.cta} on:input={(event) => updateDraft('cta', event.currentTarget.value)} />
              </div>

              {#if draft.id === 'about-us'}
                <div class="structured-fields mt-4">
                  <h4 class="small text-uppercase text-body-secondary fw-semibold">About Us sections</h4>
                  <div class="row g-3 mb-3">
                    <div class="col-md-6"><label class="form-label" for="cms-about-kicker">Hero label</label><input id="cms-about-kicker" class="form-control" value={draft.draft_content?.hero_kicker || ''} on:input={(event) => updateContent('hero_kicker', event.currentTarget.value)} /></div>
                    <div class="col-md-6"><label class="form-label" for="cms-about-callout-label">Hero callout label</label><input id="cms-about-callout-label" class="form-control" value={draft.draft_content?.hero_callout_label || ''} on:input={(event) => updateContent('hero_callout_label', event.currentTarget.value)} /></div>
                  </div>
                  <label class="form-label" for="cms-about-callout-text">Hero callout</label>
                  <textarea id="cms-about-callout-text" class="form-control mb-3" rows="2" on:input={(event) => updateContent('hero_callout_text', event.currentTarget.value)}>{draft.draft_content?.hero_callout_text || ''}</textarea>
                  <label class="form-label" for="cms-about-story-kicker">Story label</label>
                  <input id="cms-about-story-kicker" class="form-control mb-3" value={draft.draft_content?.story_kicker || ''} on:input={(event) => updateContent('story_kicker', event.currentTarget.value)} />
                  <label class="form-label" for="cms-about-story-heading">Story heading</label>
                  <input id="cms-about-story-heading" class="form-control mb-3" value={draft.draft_content?.story_heading || ''} on:input={(event) => updateContent('story_heading', event.currentTarget.value)} />
                  <label class="form-label" for="cms-about-story">Story paragraphs</label>
                  <textarea id="cms-about-story" class="form-control mb-3" rows="7" value={(draft.draft_content?.story_paragraphs || []).join('\n\n')} on:input={(event) => updateContent('story_paragraphs', event.currentTarget.value.split(/\n\s*\n/).filter(Boolean))}></textarea>
                  <div class="small text-body-secondary mb-2">Stats</div>
                  {#each draft.draft_content?.stats || [] as stat, index}<div class="structured-row"><input class="form-control" value={stat.value} aria-label="Stat value" on:input={(event) => updateStructured('stats', index, 'value', event.currentTarget.value)} /><input class="form-control" value={stat.label} aria-label="Stat label" on:input={(event) => updateStructured('stats', index, 'label', event.currentTarget.value)} /></div>{/each}
                  <div class="small text-body-secondary mt-3 mb-2">Values</div>
                  {#each draft.draft_content?.values || [] as item, index}<div class="structured-row structured-row-wide"><input class="form-control" value={item.title} aria-label="Value title" on:input={(event) => updateStructured('values', index, 'title', event.currentTarget.value)} /><textarea class="form-control" rows="2" aria-label="Value text" on:input={(event) => updateStructured('values', index, 'text', event.currentTarget.value)}>{item.text}</textarea></div>{/each}
                  <div class="small text-body-secondary mt-3 mb-2">Team</div>
                  <input class="form-control mb-2" value={draft.draft_content?.team_heading || ''} aria-label="Team heading" on:input={(event) => updateContent('team_heading', event.currentTarget.value)} />
                  <textarea class="form-control mb-2" rows="2" aria-label="Team introduction" on:input={(event) => updateContent('team_intro', event.currentTarget.value)}>{draft.draft_content?.team_intro || ''}</textarea>
                  <textarea class="form-control" rows="3" aria-label="Team members, one per line" value={(draft.draft_content?.team_members || []).join('\n')} on:input={(event) => updateContent('team_members', event.currentTarget.value.split('\n').filter(Boolean))}></textarea>
                  <div class="small text-body-secondary mt-3 mb-2">How we help</div>
                  {#each draft.draft_content?.process_steps || aboutProcessDefaults as item, index}<div class="structured-row structured-row-wide"><input class="form-control" value={item.title} aria-label="Process step title" on:input={(event) => updateStructured('process_steps', index, 'title', event.currentTarget.value)} /><textarea class="form-control" rows="2" aria-label="Process step text" on:input={(event) => updateStructured('process_steps', index, 'text', event.currentTarget.value)}>{item.text}</textarea></div>{/each}
                  <div class="small text-body-secondary mt-3 mb-2">Enquiry CTA</div>
                  <input class="form-control mb-2" value={draft.draft_content?.cta_heading || ''} aria-label="CTA heading" on:input={(event) => updateContent('cta_heading', event.currentTarget.value)} />
                  <textarea class="form-control mb-2" rows="2" aria-label="CTA text" on:input={(event) => updateContent('cta_text', event.currentTarget.value)}>{draft.draft_content?.cta_text || ''}</textarea>
                  <div class="form-text">The CTA opens the independently editable Enquiries modal on the public page.</div>
                </div>
              {:else if draft.id === 'contact'}
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <div class="structured-fields mt-4"><h4 class="small text-uppercase text-body-secondary fw-semibold">Contact page sections</h4><div class="row g-3 mb-3"><div class="col-md-6"><label class="form-label">Quote label</label><input class="form-control" value={draft.draft_content?.quote_label || ''} on:input={(event) => updateContent('quote_label', event.currentTarget.value)} /></div><div class="col-md-6"><label class="form-label">Contacts label</label><input class="form-control" value={draft.draft_content?.direct_contacts_label || ''} on:input={(event) => updateContent('direct_contacts_label', event.currentTarget.value)} /></div></div><label class="form-label">Quote description</label><textarea class="form-control mb-3" rows="2" on:input={(event) => updateContent('quote_text', event.currentTarget.value)}>{draft.draft_content?.quote_text || ''}</textarea><label class="form-label" for="cms-address">Address heading</label><input id="cms-address" class="form-control mb-2" value={draft.draft_content?.address_heading || ''} on:input={(event) => updateContent('address_heading', event.currentTarget.value)} /><label class="form-label">Address</label><input class="form-control mb-3" value={draft.draft_content?.address || ''} on:input={(event) => updateContent('address', event.currentTarget.value)} /><label class="form-label" for="cms-shopfront">Shop front image</label><input id="cms-shopfront" class="form-control mb-3" value={draft.draft_content?.shopfront_image || ''} on:focus={() => (assetTarget = { field: 'contact', index: 0 })} on:input={(event) => updateContent('shopfront_image', event.currentTarget.value)} /><div class="small text-body-secondary mb-2">Direct contacts</div>{#each draft.draft_content?.contacts || [] as contact, index}<div class="structured-row"><input class="form-control" value={contact.name} aria-label="Contact name" on:input={(event) => updateStructured('contacts', index, 'name', event.currentTarget.value)} /><input class="form-control" value={contact.role} aria-label="Contact role" on:input={(event) => updateStructured('contacts', index, 'role', event.currentTarget.value)} /><input class="form-control" value={contact.email} aria-label="Contact email" on:input={(event) => updateStructured('contacts', index, 'email', event.currentTarget.value)} /><input class="form-control" value={contact.phone} aria-label="Contact phone" on:input={(event) => updateStructured('contacts', index, 'phone', event.currentTarget.value)} /></div>{/each}</div>
              {:else if draft.id === 'engineering-services'}
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <div class="structured-fields mt-4"><h4 class="small text-uppercase text-body-secondary fw-semibold">Engineering sections</h4><label class="form-label">Capabilities label</label><input class="form-control mb-2" value={draft.draft_content?.capabilities_label || ''} on:input={(event) => updateContent('capabilities_label', event.currentTarget.value)} /><label class="form-label">Workshop capabilities, one per line</label><textarea class="form-control mb-3" rows="4" value={(draft.draft_content?.capabilities || []).join('\n')} on:input={(event) => updateContent('capabilities', event.currentTarget.value.split('\n').filter(Boolean))}></textarea><label class="form-label">What we do heading</label><input class="form-control mb-2" value={draft.draft_content?.what_we_do_heading || ''} on:input={(event) => updateContent('what_we_do_heading', event.currentTarget.value)} /><label class="form-label">What we do paragraphs</label><textarea class="form-control mb-3" rows="5" value={(draft.draft_content?.what_we_do_paragraphs || []).join('\n\n')} on:input={(event) => updateContent('what_we_do_paragraphs', event.currentTarget.value.split(/\n\s*\n/).filter(Boolean))}></textarea><label class="form-label">Best fit items, one per line</label><textarea class="form-control mb-3" rows="3" value={(draft.draft_content?.best_fit || []).join('\n')} on:input={(event) => updateContent('best_fit', event.currentTarget.value.split('\n').filter(Boolean))}></textarea><h4 class="small text-uppercase text-body-secondary fw-semibold">Service images</h4>{#each draft.draft_content?.services || [] as service, index}<div class="structured-row"><span class="small fw-semibold align-self-center">{service.title}</span><input class="form-control" value={service.image} aria-label={`${service.title} image URL`} on:focus={() => (assetTarget = { field: 'services', index })} on:input={(event) => updateStructured('services', index, 'image', event.currentTarget.value)} /></div>{/each}</div>
              {:else if draft.id === 'past-projects'}
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <div class="structured-fields mt-4"><h4 class="small text-uppercase text-body-secondary fw-semibold">Project page sections</h4><div class="row g-3 mb-3"><div class="col-md-6"><label class="form-label">Carousel label</label><input class="form-control" value={draft.draft_content?.carousel_label || ''} on:input={(event) => updateContent('carousel_label', event.currentTarget.value)} /></div><div class="col-md-6"><label class="form-label">Carousel heading</label><input class="form-control" value={draft.draft_content?.carousel_heading || ''} on:input={(event) => updateContent('carousel_heading', event.currentTarget.value)} /></div></div><label class="form-label">Carousel intro</label><textarea class="form-control mb-3" rows="2" on:input={(event) => updateContent('carousel_intro', event.currentTarget.value)}>{draft.draft_content?.carousel_intro || ''}</textarea><div class="row g-3"><div class="col-md-4"><label class="form-label">Snapshots</label><textarea class="form-control" rows="4" value={`${draft.draft_content?.snapshot_heading || ''}\n${draft.draft_content?.snapshot_text || ''}`} on:input={(event) => { const [heading, ...text] = event.currentTarget.value.split('\n'); updateContent('snapshot_heading', heading); updateContent('snapshot_text', text.join('\n')); }}></textarea></div><div class="col-md-4"><label class="form-label">Industries</label><textarea class="form-control" rows="4" value={`${draft.draft_content?.industries_heading || ''}\n${draft.draft_content?.industries_text || ''}`} on:input={(event) => { const [heading, ...text] = event.currentTarget.value.split('\n'); updateContent('industries_heading', heading); updateContent('industries_text', text.join('\n')); }}></textarea></div><div class="col-md-4"><label class="form-label">Details</label><textarea class="form-control" rows="4" value={`${draft.draft_content?.details_heading || ''}\n${draft.draft_content?.details_text || ''}`} on:input={(event) => { const [heading, ...text] = event.currentTarget.value.split('\n'); updateContent('details_heading', heading); updateContent('details_text', text.join('\n')); }}></textarea></div></div><h4 class="small text-uppercase text-body-secondary fw-semibold mt-3">Project images</h4>{#each draft.draft_content?.projects || [] as project, index}<div class="structured-row"><span class="small fw-semibold align-self-center">{project.label}</span><input class="form-control" value={project.image} aria-label={`${project.label} image URL`} on:focus={() => (assetTarget = { field: 'projects', index })} on:input={(event) => updateStructured('projects', index, 'image', event.currentTarget.value)} /></div>{/each}</div>
              {:else if draft.id === 'enquiries-modal'}
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <div class="structured-fields mt-4"><h4 class="small text-uppercase text-body-secondary fw-semibold">Modal fields</h4><div class="row g-3 mb-3"><div class="col-md-6"><label class="form-label">Kicker</label><input class="form-control" value={draft.draft_content?.kicker || ''} on:input={(event) => updateContent('kicker', event.currentTarget.value)} /></div><div class="col-md-6"><label class="form-label">Request heading</label><input class="form-control" value={draft.draft_content?.request_heading || ''} on:input={(event) => updateContent('request_heading', event.currentTarget.value)} /></div></div><label class="form-label">Request help</label><textarea class="form-control mb-3" rows="2" on:input={(event) => updateContent('request_help', event.currentTarget.value)}>{draft.draft_content?.request_help || ''}</textarea><div class="row g-3 mb-3">{#each [['name_label','Name label'],['company_label','Company label'],['email_label','Email label'],['phone_label','Phone label']] as field}<div class="col-md-6"><label class="form-label">{field[1]}</label><input class="form-control" value={draft.draft_content?.[field[0]] || ''} on:input={(event) => updateContent(field[0], event.currentTarget.value)} /></div>{/each}</div><h4 class="small text-uppercase text-body-secondary fw-semibold">Enquiry options</h4>{#each draft.draft_content?.request_options || [] as option, index}<div class="structured-row"><input class="form-control" value={option.title} aria-label={`${option.value} option title`} on:input={(event) => updateStructured('request_options', index, 'title', event.currentTarget.value)} /><textarea class="form-control" rows="2" value={option.text} aria-label={`${option.value} option description`} on:input={(event) => updateStructured('request_options', index, 'text', event.currentTarget.value)}></textarea></div>{/each}</div>
              {/if}
            </div>
          </div>

          <div class="card editor-card mt-3">
            <div class="card-body">
              <h3 class="h6 mb-1">Page settings</h3>
              <p class="small text-body-secondary mb-3">These settings help keep the page discoverable and consistent.</p>
              <div class="row g-3">
                <div class="col-md-7"><label class="form-label" for="cms-path">Page path</label><input id="cms-path" class="form-control" value={draft.path} disabled /></div>
                <div class="col-md-5"><label class="form-label" for="cms-type">Content type</label><input id="cms-type" class="form-control" value={draft.type} disabled /></div>
              </div>
            </div>
          </div>

          <div class="card editor-card mt-3">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start gap-3 mb-3"><div><h3 class="h6 mb-1">SEO</h3><p class="small text-body-secondary mb-0">Shown in search results and browser tabs.</p></div><span class="content-badge">Metadata</span></div>
              <div class="mb-3"><label class="form-label" for="cms-seo-title">SEO title</label><input id="cms-seo-title" class="form-control" value={draft.draft_seo?.title || ''} on:input={(event) => updateSeo('title', event.currentTarget.value)} /></div>
              <div><label class="form-label" for="cms-seo-description">Meta description</label><textarea id="cms-seo-description" class="form-control" rows="3" on:input={(event) => updateSeo('description', event.currentTarget.value)}>{draft.draft_seo?.description || ''}</textarea></div>
            </div>
          </div>

          <div class="card editor-card mt-3">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start gap-3 mb-3"><div><h3 class="h6 mb-1">Media library</h3><p class="small text-body-secondary mb-0">Uploaded CMS images are marked by where they are used.</p></div><label class="btn btn-outline-primary btn-sm mb-0">{uploading ? 'Uploading…' : 'Upload image'}<input class="visually-hidden" type="file" accept="image/*" on:change={handleAssetUpload} disabled={uploading} /></label></div>
              {#if assetError}<div class="alert alert-danger py-2 small">{assetError}</div>{/if}
              {#if assets.length}<div class="asset-list">{#each assets as asset}<div class="asset-row"><img src={asset.url} alt="" /><div class="asset-copy"><strong>{asset.original_file_name}</strong><span>{asset.used_by?.length ? `In use · ${asset.used_by.join(', ')}` : 'Unused'}</span></div>{#if assetTarget}<button class="btn btn-outline-primary btn-sm" type="button" on:click={() => useAsset(asset)}>Use</button>{/if}{#if !asset.used_by?.length}<button class="btn btn-outline-danger btn-sm" type="button" on:click={() => removeAsset(asset)}>Delete</button>{/if}</div>{/each}</div>{:else}<p class="small text-body-secondary mb-0">No CMS images uploaded yet.</p>{/if}
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-5">
          <div class="preview-panel">
            <div class="preview-header">
              <div><span class="small text-body-secondary d-block mb-1">Live preview</span><strong>{draft.path}</strong></div>
              <div class="preview-switcher" role="group" aria-label="Preview size">
                <button class:active={previewMode === 'desktop'} type="button" on:click={() => (previewMode = 'desktop')} aria-label="Desktop preview">▭</button>
                <button class:active={previewMode === 'mobile'} type="button" on:click={() => (previewMode = 'mobile')} aria-label="Mobile preview">▯</button>
              </div>
            </div>
            <div class:mobile-preview={previewMode === 'mobile'} class="preview-stage">
              <div class:about-preview={draft.id === 'about-us'} class="site-preview">
                <div class="site-preview-nav"><span class="preview-logo">Fan Graphs</span><span>Products</span><span>Services</span><span>About</span><span class="preview-nav-cta">Contact</span></div>
                {#if draft.id === 'about-us'}
                  <div class="about-preview-hero"><div><span class="preview-kicker">{draft.draft_content?.hero_kicker || draft.label}</span><h3>{draft.headline}</h3><p>{draft.intro}</p></div><div class="about-preview-callout"><strong>{draft.draft_content?.hero_callout_label || 'Placeholder note'}</strong><span>{draft.draft_content?.hero_callout_text || ''}</span></div></div>
                  <div class="about-preview-section about-preview-split"><div><span class="preview-section-kicker">{draft.draft_content?.story_kicker || 'Our story'}</span><h4>{draft.draft_content?.story_heading || ''}</h4>{#each draft.draft_content?.story_paragraphs || [] as paragraph}<p>{paragraph}</p>{/each}</div><div class="about-preview-stats"><span class="preview-section-kicker">At a glance</span><div>{#each draft.draft_content?.stats || [] as stat}<strong>{stat.value}<small>{stat.label}</small></strong>{/each}</div></div></div>
                  <div class="about-preview-section"><span class="preview-section-kicker">What matters to us</span><h4>{draft.draft_content?.values_heading || 'Placeholder values for the team'}</h4><div class="about-preview-cards">{#each draft.draft_content?.values || [] as item, index}<article><b>{String(index + 1).padStart(2, '0')}</b><strong>{item.title}</strong><span>{item.text}</span></article>{/each}</div></div>
                  <div class="about-preview-section about-preview-split"><div><span class="preview-section-kicker">Our team</span><h4>{draft.draft_content?.team_heading || ''}</h4><p>{draft.draft_content?.team_intro || ''}</p>{#each draft.draft_content?.team_members || [] as member}<span class="about-preview-member">{member}</span>{/each}</div><div><span class="preview-section-kicker">How we help</span><h4>From the first question to the finished solution</h4><div class="about-preview-process">{#each draft.draft_content?.process_steps || aboutProcessDefaults as item, index}<article><b>{String(index + 1).padStart(2, '0')}</b><span><strong>{item.title}</strong>{item.text}</span></article>{/each}</div></div></div>
                  <div class="about-preview-cta"><div><span class="preview-section-kicker">Start a conversation</span><h4>{draft.draft_content?.cta_heading || 'Have a question about a product, project, or custom requirement?'}</h4><p>{draft.draft_content?.cta_text || ''}</p></div><button type="button" on:click={() => (enquiryPreviewOpen = true)}>{draft.cta || 'Contact us'} <span>→</span></button></div>
                {:else if draft.id === 'contact'}
                  <div class="preview-plain-section preview-contact-hero"><div><span class="preview-section-kicker">{draft.draft_content?.hero_kicker || draft.label}</span><h3>{draft.headline}</h3><p>{draft.intro}</p></div><div class="preview-light-callout"><span>{draft.draft_content?.quote_label || 'Request a quote'}</span><p>{draft.draft_content?.quote_text || ''}</p><button type="button" on:click={() => (enquiryPreviewOpen = true)}>{draft.cta || 'Enquire'}</button></div></div>
                  <div class="preview-card-grid preview-contact-grid"><article><span class="preview-section-kicker">Address</span><strong>{draft.draft_content?.address_heading || 'Vent-Tech 2018 Ltd.'}</strong><span>{draft.draft_content?.address || ''}</span>{#if draft.draft_content?.shopfront_image}<img src={draft.draft_content.shopfront_image} alt="Shop front" />{/if}</article><article><span class="preview-section-kicker">{draft.draft_content?.direct_contacts_label || 'Direct contacts'}</span><div class="preview-contact-list">{#each draft.draft_content?.contacts || [] as contact}<div><strong>{contact.name}</strong><small>{contact.role}</small><span>{contact.email}</span><span>{contact.phone}</span></div>{/each}</div></article></div>
                {:else if draft.id === 'engineering-services'}
                  <div class="preview-plain-section preview-contact-hero"><div><span class="preview-section-kicker">{draft.draft_content?.hero_kicker || draft.label}</span><h3>{draft.headline}</h3><p>{draft.intro}</p></div><div class="preview-light-callout"><span>{draft.draft_content?.capabilities_label || 'Workshop capabilities'}</span>{#each draft.draft_content?.capabilities || [] as item, index}<small><b>{String(index + 1).padStart(2, '0')}</b>{item}</small>{/each}<button type="button" on:click={() => (enquiryPreviewOpen = true)}>Enquire</button></div></div>
                  <div class="preview-plain-section preview-engineering-intro"><article><span class="preview-section-kicker">What we do</span><h4>{draft.draft_content?.what_we_do_heading || ''}</h4>{#each draft.draft_content?.what_we_do_paragraphs || [] as paragraph}<p>{paragraph}</p>{/each}</article><article><span class="preview-section-kicker">Best fit for</span>{#each draft.draft_content?.best_fit || [] as item}<span class="preview-list-item">{item}</span>{/each}</article></div>
                  <div class="preview-service-grid">{#each draft.draft_content?.services || [] as service}<article>{#if service.image}<img src={service.image} alt="" />{/if}<span class="preview-section-kicker">{service.title}</span><strong>{service.title}</strong><p>{service.summary}</p><small>{(service.points || []).join(' · ')}</small></article>{/each}</div>
                  <div class="preview-plain-section preview-contact-hero preview-custom"><div><span class="preview-section-kicker">Custom design</span><h4>{draft.draft_content?.custom_heading || ''}</h4>{#each draft.draft_content?.custom_paragraphs || [] as paragraph}<p>{paragraph}</p>{/each}</div><div class="preview-light-callout"><span>Start a tailored enquiry</span><p>Use the enquiry form to send through your custom design or fabrication brief.</p><button type="button" on:click={() => (enquiryPreviewOpen = true)}>{draft.cta || 'Tell us about your project'}</button></div></div>
                {:else if draft.id === 'past-projects'}
                  <div class="preview-plain-section preview-contact-hero"><div><span class="preview-section-kicker">{draft.draft_content?.hero_kicker || draft.label}</span><h3>{draft.headline}</h3><p>{draft.intro}</p></div><div class="preview-light-callout"><span>{draft.draft_content?.hero_callout_label || 'Coming soon'}</span><p>{draft.draft_content?.hero_callout_text || ''}</p></div></div>
                  <div class="preview-projects"><div class="preview-projects-heading"><div><span class="preview-section-kicker">{draft.draft_content?.carousel_label || 'Project collage'}</span><h4>{draft.draft_content?.carousel_heading || ''}</h4></div><small>{draft.draft_content?.carousel_intro || ''}</small></div><div class="preview-project-grid">{#each draft.draft_content?.projects || [] as project}<article><img src={project.image} alt="" /><strong>{project.label}</strong><span>{project.text}</span></article>{/each}</div></div>
                  <div class="preview-card-grid preview-project-summaries">{#each [{ kicker: 'Project snapshots', heading: draft.draft_content?.snapshot_heading, text: draft.draft_content?.snapshot_text }, { kicker: 'Industries served', heading: draft.draft_content?.industries_heading, text: draft.draft_content?.industries_text }, { kicker: 'What to show', heading: draft.draft_content?.details_heading, text: draft.draft_content?.details_text }] as item}<article><span class="preview-section-kicker">{item.kicker}</span><strong>{item.heading || ''}</strong><span>{item.text || ''}</span></article>{/each}</div>
                {:else if draft.id === 'enquiries-modal'}
                  <div class="preview-enquiry-modal"><span class="preview-section-kicker">{draft.draft_content?.kicker || 'Enquiries'}</span><h3>{draft.headline}</h3><p>{draft.intro}</p><div class="preview-form-grid"><span>{draft.draft_content?.name_label || 'Name'}</span><span>{draft.draft_content?.company_label || 'Company'}</span><span>{draft.draft_content?.email_label || 'Email'}</span><span>{draft.draft_content?.phone_label || 'Phone number'}</span></div><h4>{draft.draft_content?.request_heading || 'How should we quote this?'}</h4><p>{draft.draft_content?.request_help || ''}</p><div class="preview-enquiry-options">{#each draft.draft_content?.request_options || [] as option}<article><strong>{option.title}</strong><span>{option.text}</span></article>{/each}</div><button type="button">{draft.cta || 'Send enquiry'}</button></div>
                {:else}
                  <div class="preview-hero"><span class="preview-kicker">{draft.label}</span><h3>{draft.headline}</h3><p>{draft.intro}</p><button type="button">{draft.cta} <span>→</span></button></div><div class="preview-body"><p>{draft.body}</p><div class="preview-lines"><span></span><span></span><span></span></div></div>
                {/if}
              </div>
            </div>
            <div class="preview-footer"><span>Preview updates as you type</span><span class="preview-secure">⌁ Public site</span></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</div>

{#if modalOpen}
  <div class="cms-modal-backdrop" role="presentation" on:click={(event) => event.target === event.currentTarget && (modalOpen = false)}>
    <div class="cms-modal" role="dialog" aria-modal="true" aria-labelledby="cms-preview-title">
      <div class="d-flex justify-content-between align-items-start gap-3 mb-4"><div><p class="eyebrow mb-1">Customer-facing preview</p><h2 id="cms-preview-title" class="h4 mb-0">{draft.label}</h2></div><button class="btn-close" type="button" aria-label="Close preview" on:click={() => (modalOpen = false)}></button></div>
      <div class="modal-preview-copy"><span class="preview-kicker">{draft.label}</span><h3>{draft.headline}</h3><p>{draft.intro}</p><hr /><p>{draft.body}</p><button class="btn btn-primary" type="button">{draft.cta}</button></div>
      <div class="d-flex justify-content-end mt-4"><button class="btn btn-outline-secondary" type="button" on:click={() => (modalOpen = false)}>Close preview</button></div>
    </div>
  </div>
{/if}

{#if createOpen}
  <div class="cms-modal-backdrop" role="presentation" on:click={(event) => event.target === event.currentTarget && (createOpen = false)}>
    <div class="cms-modal" role="dialog" aria-modal="true" aria-labelledby="new-page-title">
      <div class="d-flex justify-content-between align-items-start gap-3 mb-4"><div><p class="eyebrow mb-1">CMS page</p><h2 id="new-page-title" class="h4 mb-0">Create a new page</h2></div><button class="btn-close" type="button" aria-label="Close" on:click={() => (createOpen = false)}></button></div>
      <div class="mb-3"><label class="form-label" for="new-page-label">Page name</label><input id="new-page-label" class="form-control" value={newLabel} on:input={(event) => updateNewLabel(event.currentTarget.value)} placeholder="e.g. Our approach" /></div>
      <div class="mb-3"><label class="form-label" for="new-page-slug">URL slug</label><input id="new-page-slug" class="form-control" value={newSlug} on:input={(event) => { newSlug = slugify(event.currentTarget.value); slugEdited = true; }} placeholder="our-approach" /><div class="form-text">The page will not be public until it is published.</div></div>
      <div class="mb-4"><label class="form-label" for="new-page-template">Starter template</label><select id="new-page-template" class="form-select" bind:value={newTemplate}><option value="standard">Standard page</option><option value="cards">Cards and grid</option><option value="image-text">Image and text</option></select></div>
      <div class="d-flex justify-content-end gap-2"><button class="btn btn-outline-secondary" type="button" on:click={() => (createOpen = false)}>Cancel</button><button class="btn btn-primary" type="button" on:click={createPage} disabled={creating || !newLabel.trim() || !newSlug}>{creating ? 'Creating…' : 'Create draft'}</button></div>
    </div>
  </div>
{/if}

{#if enquiryPreviewOpen}
  <div class="enquiry-preview" role="presentation" on:click={(event) => event.target === event.currentTarget && (enquiryPreviewOpen = false)}>
    <div class="enquiry-preview-card" role="dialog" aria-modal="true" aria-labelledby="enquiry-preview-title">
      <div class="d-flex justify-content-between align-items-start gap-3"><div><span class="preview-section-kicker">{enquiryPage.draft_content?.kicker || 'Enquiries'}</span><h3 id="enquiry-preview-title" class="h4 mb-0">{enquiryPage.draft_content?.heading || 'Tell us what you need'}</h3></div><button class="btn-close" type="button" aria-label="Close enquiry preview" on:click={() => (enquiryPreviewOpen = false)}></button></div>
      <p class="text-body-secondary mt-3">{enquiryPage.draft_content?.request_help || 'Choose the route that best matches what you need.'}</p>
      <div class="enquiry-preview-options">{#each enquiryPage.draft_content?.request_options || [] as option}<div class="enquiry-preview-option"><strong>{option.title}</strong><span>{option.text}</span></div>{/each}</div>
      <div class="d-flex justify-content-between align-items-center gap-3"><span class="small text-body-secondary">{enquiryPage.draft_content?.footer_text || ''}</span><button class="btn btn-primary" type="button" on:click={() => (enquiryPreviewOpen = false)}>{enquiryPage.draft_content?.submit_label || 'Send enquiry'}</button></div>
    </div>
  </div>
{/if}

<style>
  .cms-page { padding: 1rem 0 3rem; }
  .cms-heading { display:flex; justify-content:space-between; align-items:flex-end; gap:1.5rem; margin-bottom:1.5rem; }
  .cms-heading h1 { font-size: clamp(2rem, 4vw, 2.8rem); letter-spacing:-.04em; }
  .eyebrow { color:#4d7ee8; font-size:.72rem; font-weight:800; letter-spacing:.14em; text-transform:uppercase; }
  .cms-status { border:1px solid var(--app-border); border-radius:999px; color:var(--app-muted); font-size:.78rem; padding:.38rem .7rem; }
  .status-dot { display:inline-block; width:.45rem; height:.45rem; margin-right:.35rem; border-radius:50%; background:#43c98b; }
  .save-message { color:#43c98b; font-size:.82rem; }
  .cms-layout { display:grid; grid-template-columns:270px minmax(0,1fr); gap:1.25rem; align-items:start; }
  .cms-sidebar { overflow:hidden; min-height:640px; }
  .sidebar-top,.sidebar-bottom { padding:1rem; }
  .sidebar-bottom { border-top:1px solid var(--app-border); margin-top:auto; }
  .page-list { padding:.25rem .65rem 1rem; }
  .page-list-item { width:100%; display:flex; align-items:center; gap:.65rem; border:0; border-radius:.65rem; background:transparent; color:var(--app-text); padding:.75rem .55rem; text-align:left; }
  .page-list-item:hover,.page-list-item.active { background:rgba(77,126,232,.13); }
  .page-list-item.active { box-shadow:inset 3px 0 #4d7ee8; }
  .page-icon { color:#7890b4; width:1rem; text-align:center; }
  .page-list-copy { min-width:0; flex:1; }
  .page-list-label,.page-list-meta { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .page-list-label { font-size:.88rem; font-weight:650; }
  .page-list-meta { color:var(--app-muted); font-size:.7rem; margin-top:.15rem; }
  .page-state { color:var(--app-muted); font-size:.64rem; text-transform:uppercase; letter-spacing:.05em; }
  .page-state.published,.status-pill.published { color:#43c98b; }
  .check-row { color:var(--app-muted); font-size:.76rem; margin-top:.55rem; }
  .check-icon { color:#43c98b; margin-right:.35rem; }
  .editor-toolbar { display:flex; justify-content:space-between; align-items:center; gap:1rem; padding:0 0 1.1rem; border-bottom:1px solid var(--app-border); }
  .status-pill,.content-badge { border:1px solid var(--app-border); border-radius:999px; color:var(--app-muted); font-size:.68rem; font-weight:700; padding:.3rem .55rem; text-transform:uppercase; letter-spacing:.05em; }
  .content-badge { color:#799af1; }
  .editor-content { padding-top:1.25rem; }
  .editor-card { box-shadow:var(--app-shadow-xs); }
  .editor-card textarea { resize:vertical; }
  .asset-list { display:grid; gap:.65rem; }.asset-row { display:flex; align-items:center; gap:.7rem; border-top:1px solid var(--app-border); padding-top:.65rem; }.asset-row img { width:42px; height:42px; border-radius:.35rem; object-fit:cover; background:var(--app-surface-soft); }.asset-copy { min-width:0; flex:1; }.asset-copy strong,.asset-copy span { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }.asset-copy strong { font-size:.8rem; }.asset-copy span { color:var(--app-muted); font-size:.7rem; margin-top:.12rem; }
  .structured-fields { border-top:1px solid var(--app-border); padding-top:1rem; }.structured-row { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.5rem; margin-bottom:.55rem; }.structured-row:has(span) { grid-template-columns:150px minmax(0,1fr); }.structured-row-wide { grid-template-columns:180px minmax(0,1fr); }
  .preview-panel { border:1px solid var(--app-border); border-radius:.75rem; overflow:hidden; background:var(--app-surface); box-shadow:var(--app-shadow-xs); position:sticky; top:5.8rem; }
  .preview-header,.preview-footer { display:flex; justify-content:space-between; align-items:center; gap:1rem; padding:.85rem 1rem; border-bottom:1px solid var(--app-border); font-size:.78rem; }
  .preview-footer { border-bottom:0; color:var(--app-muted); font-size:.7rem; }
  .preview-secure { color:#43c98b; }
  .preview-switcher { display:flex; border:1px solid var(--app-border); border-radius:.4rem; overflow:hidden; }
  .preview-switcher button { border:0; border-right:1px solid var(--app-border); background:transparent; color:var(--app-muted); padding:.25rem .5rem; }
  .preview-switcher button:last-child { border-right:0; }
  .preview-switcher button.active { background:rgba(77,126,232,.18); color:#799af1; }
  .preview-stage { background:#e8edf5; padding:1.25rem; min-height:470px; display:flex; justify-content:center; }
  .site-preview { width:100%; background:#fff; color:#1c2c3e; box-shadow:0 .5rem 1.3rem rgba(26,44,72,.15); overflow:hidden; }
  .mobile-preview .site-preview { width:230px; }
  .site-preview-nav { align-items:center; display:flex; gap:.65rem; padding:.75rem .85rem; font-size:.45rem; color:#65748a; }
  .preview-logo { color:#1c2c3e; font-size:.6rem; font-weight:800; margin-right:auto; }
  .preview-nav-cta { border:1px solid #d8e0eb; border-radius:999px; padding:.25rem .45rem; }
  .preview-hero { background:linear-gradient(135deg,#cc1024,#8f0f1d); color:#fff; padding:3.5rem 1.5rem 2.5rem; }
  .preview-kicker { color:#fca5a5; font-size:.52rem; font-weight:800; letter-spacing:.12em; text-transform:uppercase; }
  .preview-hero h3 { font-size:1.5rem; letter-spacing:-.04em; line-height:1.05; margin:.65rem 0 .8rem; max-width:270px; }
  .preview-hero p { color:#fee2e2; font-size:.65rem; line-height:1.55; max-width:290px; }
  .preview-hero button { background:#fff; border:0; border-radius:999px; color:#991b1b; font-size:.58rem; font-weight:700; padding:.55rem .75rem; margin-top:.4rem; }
  .preview-hero button span { margin-left:.35rem; }
  .preview-body { padding:1.4rem 1.5rem; font-size:.65rem; line-height:1.6; }
  .preview-lines { display:grid; gap:.45rem; margin-top:1.3rem; }
  .preview-lines span { background:#e8edf2; border-radius:99px; display:block; height:.3rem; width:80%; }
  .preview-lines span:nth-child(2) { width:92%; }.preview-lines span:nth-child(3) { width:62%; }
  .cms-modal-backdrop { position:fixed; inset:0; z-index:2000; background:rgba(7,17,31,.7); display:flex; align-items:center; justify-content:center; padding:1rem; }
  .cms-modal { width:min(100%,650px); max-height:90vh; overflow:auto; background:var(--app-surface); border:1px solid var(--app-border); border-radius:1rem; padding:clamp(1.25rem,4vw,2rem); box-shadow:var(--app-shadow-md); }
  .about-preview { background:#fff; color:#18212f; box-shadow:none; }.about-preview-hero,.about-preview-section,.about-preview-cta { padding:1.35rem 1.5rem; }.about-preview-hero { display:grid; grid-template-columns:minmax(0,1.5fr) minmax(100px,.75fr); gap:1rem; align-items:center; }.about-preview-hero h3 { font-size:1.35rem; line-height:1.08; letter-spacing:-.04em; margin:.5rem 0 .6rem; }.about-preview-hero p,.about-preview-section p,.about-preview-cta p { color:#666; font-size:.62rem; line-height:1.55; margin:.35rem 0 0; }.about-preview-callout { border:1px solid #c6cfda; border-radius:.35rem; padding:.8rem; display:grid; gap:.35rem; font-size:.56rem; }.about-preview-callout strong,.about-preview-section h4 { font-size:.72rem; }.about-preview-callout span { color:#666; line-height:1.45; }.about-preview-section { border-top:1px solid #e3e7ec; }.about-preview-split { display:grid; grid-template-columns:1.35fr .85fr; gap:1rem; }.preview-section-kicker { color:#b91c1c; display:block; font-size:.46rem; font-weight:800; letter-spacing:.12em; text-transform:uppercase; }.about-preview-section h4 { margin:.35rem 0 .45rem; }.about-preview-stats > div { display:grid; grid-template-columns:1fr 1fr; gap:.45rem; margin-top:.55rem; }.about-preview-stats strong { color:#b91c1c; font-size:.8rem; }.about-preview-stats small { color:#666; display:block; font-size:.45rem; font-weight:400; margin-top:.1rem; }.about-preview-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:.45rem; margin-top:.6rem; }.about-preview-cards article { background:#f4f7fa; border-top:2px solid #b91c1c; padding:.55rem; }.about-preview-cards b { color:#b91c1c; display:block; font-size:.48rem; }.about-preview-cards strong,.about-preview-cards span { display:block; font-size:.55rem; line-height:1.4; margin-top:.2rem; }.about-preview-cards span { color:#666; font-size:.48rem; }.about-preview-member { border-top:1px solid #e3e7ec; display:block; font-size:.52rem; padding:.3rem 0; }.about-preview-process { display:grid; gap:.4rem; }.about-preview-process article { display:grid; grid-template-columns:1.2rem 1fr; gap:.35rem; font-size:.5rem; line-height:1.4; }.about-preview-process b { color:#b91c1c; }.about-preview-process strong { display:block; font-size:.55rem; }.about-preview-cta { align-items:center; background:linear-gradient(90deg,#fff,#fff5f5); border-top:1px solid #e3e7ec; display:grid; grid-template-columns:1fr auto; gap:1rem; }.about-preview-cta button { background:linear-gradient(135deg,#b91c1c,#991b1b); border:0; border-radius:.25rem; color:#fff; font-size:.56rem; font-weight:700; padding:.55rem .7rem; }.about-preview-cta button span { margin-left:.3rem; }.modal-preview-copy { background:linear-gradient(145deg,#cc1024,#8f0f1d); color:#fff; border-radius:.7rem; padding:2rem; }
  .preview-plain-section,.preview-card-grid,.preview-projects,.preview-service-grid,.preview-enquiry-modal { padding:1.2rem 1.5rem; }.preview-plain-section { display:grid; grid-template-columns:minmax(0,1.4fr) minmax(120px,.8fr); gap:1rem; align-items:center; border-bottom:1px solid #e3e7ec; }.preview-contact-hero h3 { font-size:1.25rem; line-height:1.08; letter-spacing:-.04em; margin:.5rem 0 .55rem; }.preview-contact-hero p,.preview-plain-section p,.preview-card-grid span,.preview-service-grid p,.preview-projects-heading small,.preview-enquiry-modal p { color:#666; font-size:.57rem; line-height:1.5; margin:.3rem 0 0; }.preview-light-callout { border:1px solid #c6cfda; padding:.7rem; border-radius:.3rem; }.preview-light-callout > span { display:block; font-size:.62rem; font-weight:700; }.preview-light-callout small { display:flex; gap:.3rem; font-size:.5rem; line-height:1.4; margin-top:.3rem; }.preview-light-callout small b { color:#b91c1c; }.preview-light-callout button,.preview-enquiry-modal button { background:linear-gradient(135deg,#b91c1c,#991b1b); border:0; border-radius:.25rem; color:#fff; font-size:.55rem; font-weight:700; margin-top:.6rem; padding:.45rem .65rem; }.preview-contact-grid,.preview-project-summaries { align-items:stretch; display:grid; grid-template-columns:.8fr 1.2fr; gap:.7rem; }.preview-card-grid article,.preview-engineering-intro article { border:1px solid #e3e7ec; border-radius:.3rem; padding:.8rem; }.preview-card-grid article > strong,.preview-card-grid article > span:not(.preview-section-kicker) { display:block; font-size:.58rem; margin-top:.3rem; }.preview-card-grid img { display:block; height:70px; margin-top:.55rem; object-fit:cover; width:100%; }.preview-contact-list { display:grid; grid-template-columns:repeat(2,1fr); gap:.5rem; margin-top:.55rem; }.preview-contact-list div { border-top:1px solid #e3e7ec; padding-top:.35rem; }.preview-contact-list strong,.preview-contact-list small,.preview-contact-list span { display:block; font-size:.5rem; line-height:1.35; }.preview-contact-list small,.preview-contact-list span { color:#666; }.preview-engineering-intro { align-items:start; grid-template-columns:1.35fr .65fr; }.preview-engineering-intro h4,.preview-projects-heading h4,.preview-enquiry-modal h4 { font-size:.72rem; margin:.35rem 0; }.preview-list-item { border-top:1px solid #e3e7ec; display:block; font-size:.52rem; padding:.35rem 0; }.preview-service-grid { display:grid; grid-template-columns:1fr 1fr; gap:.65rem; }.preview-service-grid article { border:1px solid #e3e7ec; border-radius:.3rem; overflow:hidden; padding-bottom:.65rem; }.preview-service-grid img { background:#f4f7fa; display:block; height:70px; object-fit:contain; padding:.5rem; width:100%; }.preview-service-grid .preview-section-kicker,.preview-service-grid strong,.preview-service-grid p,.preview-service-grid small { display:block; margin-left:.65rem; margin-right:.65rem; }.preview-service-grid .preview-section-kicker { margin-top:.55rem; }.preview-service-grid strong { font-size:.62rem; }.preview-service-grid small { color:#666; font-size:.48rem; line-height:1.4; }.preview-custom { background:#fff5f5; }.preview-projects { border-bottom:1px solid #e3e7ec; }.preview-projects-heading { align-items:end; display:flex; justify-content:space-between; gap:1rem; }.preview-project-grid { display:grid; grid-template-columns:1.3fr 1fr 1fr 1fr; gap:.45rem; margin-top:.65rem; }.preview-project-grid article { min-width:0; }.preview-project-grid img { background:#f4f7fa; display:block; height:65px; object-fit:contain; width:100%; }.preview-project-grid strong,.preview-project-grid span { display:block; font-size:.5rem; line-height:1.35; margin-top:.25rem; }.preview-project-grid span { color:#666; font-size:.46rem; }.preview-project-summaries { grid-template-columns:repeat(3,1fr); }.preview-project-summaries article > strong { font-size:.6rem; }.preview-enquiry-modal { margin:1rem; border:1px solid #c6cfda; border-radius:.35rem; box-shadow:0 .4rem 1rem rgba(26,44,72,.12); }.preview-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:.45rem; margin:1rem 0; }.preview-form-grid span { border:1px solid #c6cfda; border-radius:.25rem; color:#777; font-size:.52rem; padding:.5rem; }.preview-enquiry-options { display:grid; grid-template-columns:repeat(3,1fr); gap:.45rem; }.preview-enquiry-options article { border:1px solid #c6cfda; border-left:2px solid #b91c1c; border-radius:.25rem; padding:.5rem; }.preview-enquiry-options strong,.preview-enquiry-options span { display:block; font-size:.52rem; line-height:1.35; }.preview-enquiry-options span { color:#666; font-size:.47rem; margin-top:.2rem; }.modal-preview-copy h3 { font-size:clamp(1.7rem,4vw,2.6rem); letter-spacing:-.04em; margin:.65rem 0 .8rem; }.modal-preview-copy p { color:#fee2e2; line-height:1.6; }.modal-preview-copy hr { border-color:rgba(255,255,255,.2); }.enquiry-preview { position:fixed; inset:0; z-index:2100; background:rgba(7,17,31,.7); display:flex; align-items:center; justify-content:center; padding:1rem; }.enquiry-preview-card { background:#fff; border-radius:.7rem; box-shadow:var(--app-shadow-md); max-width:560px; padding:1.5rem; width:100%; }.enquiry-preview-options { display:grid; gap:.5rem; margin:1rem 0; }.enquiry-preview-option { border:1px solid #c6cfda; border-left:3px solid #b91c1c; border-radius:.3rem; padding:.7rem; }.enquiry-preview-option strong,.enquiry-preview-option span { display:block; font-size:.7rem; }.enquiry-preview-option span { color:#666; font-size:.6rem; margin-top:.2rem; }
  @media (max-width:900px) { .cms-layout { grid-template-columns:1fr; }.cms-sidebar { min-height:0; }.page-list { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); }.sidebar-bottom { display:none; }.preview-panel { position:static; } }
  @media (max-width:600px) { .cms-heading,.editor-toolbar { align-items:flex-start; flex-direction:column; }.cms-heading .d-flex { width:100%; }.cms-heading .btn { flex:1; }.page-list { grid-template-columns:1fr; }.editor-toolbar > .d-flex { width:100%; }.editor-toolbar .btn-outline-primary { margin-left:auto; } }
</style>
