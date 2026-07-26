<script>
  import { onDestroy, onMount } from 'svelte';
  import { getCustomerFacingLogsRecent } from '$lib/api.js';

  const MAX_ENTRIES = 500;
  const REFRESH_INTERVAL_MS = 30000;

  let loading = false;
  let error = '';
  let rawEntries = [];
  let devices = [];
  let refreshTimer = null;
  let lastUpdatedAt = '';
  let timeWindow = '24h';
  let deviceFilter = 'all';
  let routeFilter = 'all';
  let searchQuery = '';

  function parseTimestamp(value) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function formatTimestamp(value) {
    const parsed = parseTimestamp(value);
    return parsed ? parsed.toLocaleString() : String(value || '—');
  }

  function normalizeDeviceType(value, userAgent = '') {
    const candidate = String(value || '').trim().toLowerCase();
    if (candidate.includes('mobile')) return 'mobile';
    if (candidate.includes('tablet') || candidate.includes('ipad')) return 'tablet';
    if (candidate.includes('desktop')) return 'desktop';

    const ua = String(userAgent || '').toLowerCase();
    if (ua.includes('ipad') || ua.includes('tablet')) return 'tablet';
    if (ua.includes('mobile')) return 'mobile';
    if (ua) return 'desktop';
    return '';
  }

  function summarizeTelemetry(entry) {
    const telemetry = entry?.payload?.telemetry || {};
    return {
      page_url: telemetry.page_url || '',
      referrer: telemetry.referrer || '',
      screen_width: telemetry.screen_width ?? null,
      screen_height: telemetry.screen_height ?? null,
      viewport_width: telemetry.viewport_width ?? null,
      viewport_height: telemetry.viewport_height ?? null,
      device_pixel_ratio: telemetry.device_pixel_ratio ?? null,
      color_depth: telemetry.color_depth ?? null,
      timezone: telemetry.timezone || '',
      timezone_offset: telemetry.timezone_offset ?? null,
      language: telemetry.language || '',
      languages: Array.isArray(telemetry.languages) ? telemetry.languages : [],
      platform: telemetry.platform || '',
      user_agent: telemetry.user_agent || '',
      device_type: normalizeDeviceType(telemetry.device_type, telemetry.user_agent),
      touch_points: telemetry.touch_points ?? null
    };
  }

  function fingerprintFor(entry) {
    const t = summarizeTelemetry(entry);
    return JSON.stringify({
      user_agent: t.user_agent,
      screen_width: t.screen_width,
      screen_height: t.screen_height,
      viewport_width: t.viewport_width,
      viewport_height: t.viewport_height,
      device_pixel_ratio: t.device_pixel_ratio,
      color_depth: t.color_depth,
      timezone: t.timezone,
      language: t.language,
      platform: t.platform,
      device_type: t.device_type,
      touch_points: t.touch_points
    });
  }

  function buildDeviceSummaries(entries) {
    const map = new Map();
    for (const entry of entries) {
      if (entry?.payload?.event !== 'browser-telemetry') continue;
      const telemetry = summarizeTelemetry(entry);
      const key = fingerprintFor(entry);
      const seenAt = parseTimestamp(entry.timestamp)?.getTime() ?? 0;
      const current = map.get(key);
      if (!current || seenAt > current.seenAt) {
        map.set(key, {
          key,
          seenAt,
          timestamp: entry.timestamp,
          route_group: entry.payload?.page_route_group || entry.payload?.route_group || '',
          page_url: telemetry.page_url,
          referrer: telemetry.referrer,
          screen: telemetry.screen_width && telemetry.screen_height ? `${telemetry.screen_width}x${telemetry.screen_height}` : '—',
          viewport: telemetry.viewport_width && telemetry.viewport_height ? `${telemetry.viewport_width}x${telemetry.viewport_height}` : '—',
          device_pixel_ratio: telemetry.device_pixel_ratio ?? '—',
          color_depth: telemetry.color_depth ?? '—',
          timezone: telemetry.timezone || '—',
          language: telemetry.language || '—',
          languages: telemetry.languages,
          platform: telemetry.platform || '—',
          user_agent: telemetry.user_agent || '—',
          device_type: telemetry.device_type || '—',
          touch_points: telemetry.touch_points ?? '—',
          public_host: entry.payload?.public_host || '',
          public_port: entry.payload?.public_port ?? '',
          public_ipv4: entry.payload?.public_ipv4 || '',
          public_ipv6: entry.payload?.public_ipv6 || '',
          public_source: entry.payload?.public_source || ''
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.seenAt - a.seenAt);
  }

  function isWithinWindow(entry, windowKey) {
    const timestamp = parseTimestamp(entry?.timestamp);
    if (!timestamp) return false;
    const ageMs = Date.now() - timestamp.getTime();
    if (windowKey === '24h') return ageMs <= 24 * 60 * 60 * 1000;
    if (windowKey === '7d') return ageMs <= 7 * 24 * 60 * 60 * 1000;
    return true;
  }

  function applyFilters(entries, currentSearchQuery, currentTimeWindow, currentDeviceFilter, currentRouteFilter) {
    const needle = currentSearchQuery.trim().toLowerCase();
    return entries.filter((entry) => {
      if (!isWithinWindow(entry, currentTimeWindow)) return false;
      const routeGroup = entry.route_group || '';
      if (currentDeviceFilter !== 'all' && entry.device_type !== currentDeviceFilter) return false;
      if (currentRouteFilter !== 'all' && routeGroup !== currentRouteFilter) return false;
      if (needle) {
        const haystack = [
          entry.page_url,
          entry.referrer,
          entry.user_agent,
          entry.platform,
          entry.language,
          entry.languages.join(' '),
          entry.public_host,
          entry.public_ipv4,
          entry.public_ipv6,
          entry.public_source,
          routeGroup
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }

  $: devices = applyFilters(buildDeviceSummaries(rawEntries), searchQuery, timeWindow, deviceFilter, routeFilter);
  $: visibleDeviceCount = devices.length;
  $: totalTelemetryCount = rawEntries.filter((entry) => entry?.payload?.event === 'browser-telemetry').length;

  async function loadLogs() {
    loading = true;
    error = '';
    try {
      rawEntries = await getCustomerFacingLogsRecent(MAX_ENTRIES, true);
      lastUpdatedAt = new Date().toLocaleString();
    } catch (err) {
      error = err?.message || 'Unable to load customer-facing logs.';
    } finally {
      loading = false;
    }
  }

  function startPolling() {
    stopPolling();
    refreshTimer = setInterval(() => {
      void loadLogs();
    }, REFRESH_INTERVAL_MS);
  }

  function stopPolling() {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  }

  onMount(() => {
    void loadLogs();
    startPolling();
  });

  onDestroy(() => {
    stopPolling();
  });
</script>

<div class="customer-device-console">
  <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
    <div>
      <p class="small text-uppercase text-body-secondary fw-semibold mb-1">Customer Facing</p>
      <h2 class="h5 mb-0">Unique Devices</h2>
      <div class="small text-body-secondary mt-1">
        {visibleDeviceCount} unique device{visibleDeviceCount === 1 ? '' : 's'}
        {#if totalTelemetryCount && totalTelemetryCount !== visibleDeviceCount}
          from {totalTelemetryCount} telemetry event{totalTelemetryCount === 1 ? '' : 's'}
        {/if}
      </div>
    </div>
    <div class="text-end">
      <div class={`badge ${loading ? 'text-bg-secondary' : 'text-bg-success'}`}>{loading ? 'loading' : 'ready'}</div>
      {#if lastUpdatedAt}
        <div class="small text-body-secondary mt-1">Updated {lastUpdatedAt}</div>
      {/if}
    </div>
  </div>

  <p class="text-body-secondary small mb-2">
    Deduped from recent browser telemetry. Each row shows the latest view for one device fingerprint.
  </p>

  <div class="filters d-flex flex-wrap gap-2 mb-3">
    <label class="form-label small text-body-secondary mb-0 flex-grow-1" style="min-width: 220px;">
      Search
      <input
        bind:value={searchQuery}
        class="form-control form-control-sm mt-1"
        type="search"
        placeholder="User agent, URL, referrer, IP..."
      />
    </label>
    <label class="form-label small text-body-secondary mb-0">
      Time window
      <select bind:value={timeWindow} class="form-select form-select-sm mt-1">
        <option value="24h">Last 24 hours</option>
        <option value="7d">Last 7 days</option>
        <option value="all">All loaded</option>
      </select>
    </label>
    <label class="form-label small text-body-secondary mb-0">
      Device type
      <select bind:value={deviceFilter} class="form-select form-select-sm mt-1">
        <option value="all">All devices</option>
        <option value="desktop">Desktop</option>
        <option value="mobile">Mobile</option>
        <option value="tablet">Tablet</option>
      </select>
    </label>
    <label class="form-label small text-body-secondary mb-0">
      Page group
      <select bind:value={routeFilter} class="form-select form-select-sm mt-1">
        <option value="all">All pages</option>
        <option value="home">Home</option>
        <option value="series-page">Series</option>
        <option value="product-page">Product</option>
        <option value="public-page">Other public pages</option>
        <option value="other">Other</option>
      </select>
    </label>
  </div>

  {#if error}
    <div class="alert alert-warning py-2 mb-3">{error}</div>
  {/if}

  {#if devices.length}
    <div class="table-responsive">
      <table class="table table-sm align-middle mb-0">
        <thead>
          <tr>
            <th>Last Seen</th>
            <th>Page</th>
            <th>User Agent</th>
            <th>Screen</th>
            <th>Viewport</th>
            <th>Device</th>
            <th>Locale</th>
            <th>Platform</th>
          </tr>
        </thead>
        <tbody>
          {#each devices as device (device.key)}
            <tr>
              <td>
                <div class="fw-semibold">{formatTimestamp(device.timestamp)}</div>
                <div class="small text-body-secondary">{device.route_group || 'other'}</div>
              </td>
              <td>
                <div class="text-break">{device.page_url || '—'}</div>
                {#if device.referrer}
                  <div class="small text-body-secondary text-break">Referrer: {device.referrer}</div>
                {/if}
              </td>
              <td class="text-break">
                <div>{device.user_agent}</div>
              </td>
              <td>{device.screen}</td>
              <td>{device.viewport}</td>
              <td>
                <div>{device.device_type}</div>
                <div class="small text-body-secondary">
                  DPR {device.device_pixel_ratio} · depth {device.color_depth} · touch {device.touch_points}
                </div>
              </td>
              <td>
                <div>{device.language}</div>
                <div class="small text-body-secondary text-break">{device.languages.join(', ')}</div>
              </td>
              <td>
                <div>{device.platform}</div>
                <div class="small text-body-secondary">
                  {#if device.public_ipv4 || device.public_ipv6}
                    IPv4 {device.public_ipv4 || '—'} · IPv6 {device.public_ipv6 || '—'}
                  {:else if device.public_host}
                    {device.public_host}{device.public_port ? `:${device.public_port}` : ''}
                  {:else}
                    —
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <div class="text-body-secondary">No browser telemetry matches the current filters yet.</div>
  {/if}
</div>

<style>
  .customer-device-console {
    color: var(--bs-body-color);
  }
</style>
