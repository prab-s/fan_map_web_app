<script>
  import 'bootstrap/dist/css/bootstrap.min.css';
  import '../app.css';
  import { afterNavigate } from '$app/navigation';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { onMount, tick } from 'svelte';
  import { page } from '$app/stores';
  import { auth } from '$lib/auth.js';
  import { initTheme, theme, toggleTheme } from '$lib/config.js';
  import { getPublicProducts } from '$lib/api.js';

  let username = '';
  let password = '';
  let isPublicRoute = false;
  let currentPath = '';
  let homeActive = false;
  let editorActive = false;
  let viewerActive = false;
  let templateBuilderActive = false;
  let bulkImportActive = false;
  let setupActive = false;
  let enquiriesActive = false;
  let searchOpen = false;
  let searchQuery = '';
  let searchResults = [];
  let searchBusy = false;
  let searchError = '';
  let searchInput;
  let telemetrySentForPath = '';
  let authReady = false;
  const PUBLIC_ROUTE_PREFIXES = ['/series', '/products'];
  const TELEMETRY_ENDPOINT = '/api/client-telemetry';

  $: currentPath = $page.url.pathname;
  $: isPublicRoute = PUBLIC_ROUTE_PREFIXES.some((prefix) => currentPath === prefix || currentPath.startsWith(`${prefix}/`));
  $: homeActive = currentPath === '/';
  $: editorActive = currentPath === '/editor' || currentPath.startsWith('/editor/');
  $: viewerActive = currentPath === '/viewer' || currentPath.startsWith('/viewer/');
  $: templateBuilderActive = currentPath === '/template-builder' || currentPath.startsWith('/template-builder/');
  $: bulkImportActive = currentPath === '/bulk-import' || currentPath.startsWith('/bulk-import/');
  $: setupActive = currentPath === '/setup' || currentPath.startsWith('/setup/');
  $: enquiriesActive = currentPath === '/enquiries' || currentPath.startsWith('/enquiries/');

  onMount(async () => {
    initTheme();
    await auth.refresh();
    authReady = true;
    sendBrowserTelemetry();
  });

  afterNavigate(() => {
    sendBrowserTelemetry();
  });

  async function openPublicSearch() {
    searchOpen = true;
    searchError = '';
    await tick();
    searchInput?.focus();
  }

  function closePublicSearch() {
    searchOpen = false;
    searchBusy = false;
  }

  async function submitPublicSearch() {
    const query = searchQuery.trim();
    if (!query) {
      searchResults = [];
      return;
    }
    searchBusy = true;
    searchError = '';
    try {
      searchResults = await getPublicProducts({ search: query });
    } catch (err) {
      searchError = err?.message || 'Search is unavailable right now.';
    } finally {
      searchBusy = false;
    }
  }

  function handlePublicSearchKeydown(event) {
    if (event.key === 'Escape' && searchOpen) closePublicSearch();
  }

  function handleSearchBackdropClick(event) {
    if (event.target === event.currentTarget) closePublicSearch();
  }

  function getDeviceType() {
    if (!browser) return 'desktop';
    const ua = navigator.userAgent.toLowerCase();
    if (navigator.userAgentData?.mobile) return 'mobile';
    if (ua.includes('ipad') || ua.includes('tablet')) return 'tablet';
    if (ua.includes('mobile')) return 'mobile';
    return 'desktop';
  }

  function buildTelemetryPayload() {
    if (!browser) return null;
    return {
      page_url: window.location.href,
      referrer: document.referrer || '',
      screen_width: window.screen?.width ?? null,
      screen_height: window.screen?.height ?? null,
      viewport_width: window.innerWidth ?? null,
      viewport_height: window.innerHeight ?? null,
      device_pixel_ratio: window.devicePixelRatio ?? null,
      color_depth: window.screen?.colorDepth ?? null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      timezone_offset: new Date().getTimezoneOffset(),
      language: navigator.language || '',
      languages: Array.isArray(navigator.languages) ? navigator.languages : [],
      platform: navigator.userAgentData?.platform || navigator.platform || '',
      user_agent: navigator.userAgent || '',
      device_type: getDeviceType(),
      touch_points: navigator.maxTouchPoints ?? 0
    };
  }

  function sendBrowserTelemetry() {
    if (!browser) return;
    if (!authReady) return;
    if (telemetrySentForPath === currentPath) return;
    telemetrySentForPath = currentPath;

    const payload = buildTelemetryPayload();
    if (!payload) return;

    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(TELEMETRY_ENDPOINT, new Blob([body], { type: 'application/json' }));
      return;
    }

    fetch(TELEMETRY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      credentials: 'include',
      keepalive: true
    }).catch(() => {});
  }

  async function submitLogin() {
    const ok = await auth.login(username, password);
    if (ok) {
      username = '';
      password = '';
      telemetrySentForPath = '';
      sendBrowserTelemetry();
    }
  }
</script>

<svelte:window on:keydown={handlePublicSearchKeydown} />

<div class="app-shell">
  {#if isPublicRoute}
    <header class="public-topbar">
      <div class="public-nav app-frame">
        <a class="public-brand" href="/products" aria-label="Products home">Fan Graphs</a>
        <nav class="public-links" aria-label="Customer-facing navigation">
          <a href="/products">Products</a>
        </nav>
        <button class="public-search-trigger" type="button" on:click={openPublicSearch} aria-label="Search products">
          <span aria-hidden="true">⌕</span> Search
        </button>
      </div>
    </header>
    <main class="app-frame py-0">
      <slot />
    </main>
    {#if searchOpen}
      <div class="public-search-backdrop" role="presentation" on:click={handleSearchBackdropClick}>
        <div class="public-search-dialog" role="dialog" aria-modal="true" aria-labelledby="public-search-title">
          <div class="d-flex align-items-center justify-content-between gap-3 mb-3">
            <div>
              <p class="eyebrow mb-1">Customer Facing</p>
              <h2 id="public-search-title" class="h3 mb-0">Search the catalogue</h2>
            </div>
            <button class="btn-close" type="button" on:click={closePublicSearch} aria-label="Close search"></button>
          </div>
          <form class="public-search-form" on:submit|preventDefault={submitPublicSearch}>
            <input bind:this={searchInput} bind:value={searchQuery} class="form-control form-control-lg" type="search" placeholder="Search models, series, or product types" aria-label="Search models, series, or product types" />
            <button class="btn btn-primary btn-lg" type="submit" disabled={searchBusy || !searchQuery.trim()}>{searchBusy ? 'Searching…' : 'Search'}</button>
          </form>
          {#if searchError}<p class="text-danger small mt-3 mb-0">{searchError}</p>{/if}
          {#if searchResults.length}
            <div class="public-search-results mt-4">
              <p class="small text-body-secondary mb-2">{searchResults.length} result{searchResults.length === 1 ? '' : 's'}</p>
              {#each searchResults.slice(0, 8) as result}
                <a class="public-search-result" href={`/products/${encodeURIComponent(result.id)}`} on:click={closePublicSearch}>
                  <span><strong>{result.model}</strong><small>{result.product_type_label || result.product_type_key}{#if result.series_name} · {result.series_name}{/if}</small></span>
                  <span aria-hidden="true">→</span>
                </a>
              {/each}
              {#if searchResults.length > 8}
                <button class="btn btn-link px-0 mt-2" type="button" on:click={() => goto(`/products?search=${encodeURIComponent(searchQuery.trim())}`)}>View all results</button>
              {/if}
            </div>
          {:else if searchQuery.trim() && !searchBusy && !searchError}
            <p class="text-body-secondary mt-4 mb-0">No products matched that search.</p>
          {/if}
        </div>
      </div>
    {/if}
  {:else if !$auth.ready}
    <main class="app-frame py-5">
      <div class="d-flex justify-content-center">
        <div class="card shadow-sm" style="max-width: 420px; width: 100%;">
          <div class="card-body p-4 text-center">
            <h1 class="h4 mb-2">Internal Facing</h1>
            <p class="text-body-secondary mb-0">Checking your session...</p>
          </div>
        </div>
      </div>
    </main>
  {:else if !$auth.authenticated}
    <main class="app-frame py-5">
      <div class="d-flex justify-content-center">
        <div class="card shadow-sm" style="max-width: 420px; width: 100%;">
          <div class="card-body p-4">
            <div class="text-center mb-4">
              <h1 class="h4 mb-2">Internal Facing</h1>
              <p class="text-body-secondary mb-0">Enter the application password to continue.</p>
            </div>

            <form on:submit|preventDefault={submitLogin} class="vstack gap-3">
              <div>
                <label class="form-label" for="app-username">Username</label>
                <input
                  id="app-username"
                  class="form-control"
                  type="text"
                  bind:value={username}
                  autocomplete="username"
                />
              </div>

              <div>
                <label class="form-label" for="app-password">Password</label>
                <input
                  id="app-password"
                  class="form-control"
                  type="password"
                  bind:value={password}
                  autocomplete="current-password"
                />
              </div>

              {#if $auth.error}
                <div class="alert alert-danger py-2 mb-0">{$auth.error}</div>
              {/if}

              <div class="d-flex justify-content-between align-items-center gap-2">
                <button class="btn btn-outline-primary btn-sm" type="button" on:click={() => toggleTheme($theme)}>
                  {$theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                </button>
                <button class="btn btn-primary" type="submit" disabled={$auth.busy || !username || !password}>
                  {$auth.busy ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  {:else}
    <header class="topbar navbar navbar-expand-lg">
      <div class="container-fluid app-frame px-0 d-flex align-items-center gap-3 flex-wrap justify-content-center">
        <div class="topbar-brand navbar-brand mb-0 text-center text-lg-start">
          <div>
            <p class="small text-uppercase text-body-secondary fw-semibold mb-1"><strong>Internal Facing</strong></p>
          </div>
          <span class="small text-body-secondary">{#if enquiriesActive}Enquiries{:else if editorActive}Editor{:else if viewerActive}Viewer{:else if currentPath.startsWith('/template-builder-v2')}Template Builder V2{:else if templateBuilderActive}Template Builder{:else if setupActive}Setup{:else if bulkImportActive}Bulk Import{:else}Overview{/if}</span>
        </div>

        <nav class="nav nav-underline justify-content-center mx-auto" aria-label="Primary">
          <a class={`nav-link ${homeActive ? 'active text-body fw-medium' : 'text-body-secondary'}`} href="/" aria-current={homeActive ? 'page' : undefined}>Home</a>
          <a class={`nav-link ${enquiriesActive ? 'active text-body fw-medium' : 'text-body-secondary'}`} href="/enquiries" aria-current={enquiriesActive ? 'page' : undefined}>Enquiries</a>
          <a class={`nav-link ${editorActive ? 'active text-body fw-medium' : 'text-body-secondary'}`} href="/editor" aria-current={editorActive ? 'page' : undefined}>Editor</a>
          <a class={`nav-link ${viewerActive ? 'active text-body fw-medium' : 'text-body-secondary'}`} href="/viewer" aria-current={viewerActive ? 'page' : undefined}>Viewer</a>
          <a class={`nav-link ${templateBuilderActive ? 'active text-body fw-medium' : 'text-body-secondary'}`} href="/template-builder" aria-current={templateBuilderActive ? 'page' : undefined}>Template Builder</a>
          {#if $auth.authenticated}
            <a class={`nav-link ${bulkImportActive ? 'active text-body fw-medium' : 'text-body-secondary'}`} href="/bulk-import" aria-current={bulkImportActive ? 'page' : undefined}>Bulk Import</a>
          {/if}
          <a class={`nav-link ${setupActive ? 'active text-body fw-medium' : 'text-body-secondary'}`} href="/setup" aria-current={setupActive ? 'page' : undefined}>Setup</a>
        </nav>

        <div class="d-flex align-items-center gap-2">
          <span class="small text-body-secondary d-none d-lg-inline">Signed in as {$auth.username}</span>
          <button class="btn btn-outline-primary btn-sm" type="button" on:click={() => toggleTheme($theme)}>
            {$theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </button>
          <button class="btn btn-outline-secondary btn-sm" type="button" on:click={() => auth.logout()}>
            Sign Out
          </button>
        </div>
      </div>
    </header>

    <main class="app-frame py-3">
      <slot />
    </main>
  {/if}
</div>
