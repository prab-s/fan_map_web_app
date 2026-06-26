<script>
  import { onDestroy, onMount } from 'svelte';
  import { getPublicAccessLogsRecent } from '$lib/api.js';

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

  function summarizePayload(entry) {
    const payload = entry?.payload || {};
    const telemetry = payload.telemetry || {};
    return {
      path: payload.path || telemetry.page_url || '',
      method: payload.method || '—',
      status: payload.status ?? '—',
      duration_ms: payload.duration_ms ?? '—',
      referer: payload.referer || telemetry.referrer || '',
      user_agent: payload.user_agent || telemetry.user_agent || '',
      device_type: payload.device_type || telemetry.device_type || '',
      accept_language: payload.accept_language || telemetry.language || '',
      screen: telemetry.screen_width && telemetry.screen_height ? `${telemetry.screen_width}x${telemetry.screen_height}` : '—',
      viewport: telemetry.viewport_width && telemetry.viewport_height ? `${telemetry.viewport_width}x${telemetry.viewport_height}` : '—',
      device_pixel_ratio: telemetry.device_pixel_ratio ?? '—',
      color_depth: telemetry.color_depth ?? '—',
      timezone: telemetry.timezone || '—',
      languages: Array.isArray(telemetry.languages) ? telemetry.languages : [],
      platform: telemetry.platform || payload.sec_ch_ua_platform || '—',
      host: payload.host || '—',
      public_host: payload.public_host || '',
      public_port: payload.public_port ?? '',
      public_ipv4: payload.public_ipv4 || '',
      public_ipv6: payload.public_ipv6 || '',
      public_source: payload.public_source || '',
      username: payload.username || '',
      peer_host: payload.peer_host || '',
      route_group: payload.route_group || '',
      page_route_group: payload.page_route_group || '',
      event: payload.event || 'request'
    };
  }

  function fingerprintFor(entry) {
    const t = summarizePayload(entry);
    return JSON.stringify({
      user_agent: t.user_agent,
      device_type: t.device_type,
      accept_language: t.accept_language,
      platform: t.platform
    });
  }

  function buildDeviceSummaries(entries) {
    const map = new Map();
    for (const entry of entries) {
      const payload = entry?.payload || {};
      if (!payload.event) continue;

      const summary = summarizePayload(entry);
      const key = fingerprintFor(entry);
      const seenAt = parseTimestamp(entry.timestamp)?.getTime() ?? 0;
      const current = map.get(key);

      if (!current || seenAt > current.seenAt) {
        map.set(key, {
          key,
          seenAt,
          timestamp: entry.timestamp,
          route_group: summary.route_group || summary.page_route_group || 'other',
          path: summary.path,
          method: summary.method,
          status: summary.status,
          duration_ms: summary.duration_ms,
          referer: summary.referer,
          user_agent: summary.user_agent,
          device_type: summary.device_type || '—',
          accept_language: summary.accept_language || '—',
          languages: summary.languages,
          platform: summary.platform,
          screen: summary.screen,
          viewport: summary.viewport,
          device_pixel_ratio: summary.device_pixel_ratio,
          color_depth: summary.color_depth,
          timezone: summary.timezone,
          host: summary.host,
          public_host: summary.public_host,
          public_port: summary.public_port,
          public_ipv4: summary.public_ipv4,
          public_ipv6: summary.public_ipv6,
          public_source: summary.public_source,
          username: summary.username,
          peer_host: summary.peer_host,
          event: summary.event
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

  function applyFilters(entries) {
    const needle = searchQuery.trim().toLowerCase();
    return entries.filter((entry) => {
      if (!isWithinWindow(entry, timeWindow)) return false;
      const routeGroup = entry.route_group || '';
      const pageRouteGroup = entry.page_route_group || '';
      if (deviceFilter !== 'all' && entry.device_type !== deviceFilter) return false;
      if (routeFilter !== 'all' && routeGroup !== routeFilter && pageRouteGroup !== routeFilter) return false;
      if (needle) {
        const haystack = [
          entry.path,
          entry.method,
          entry.referer,
          entry.user_agent,
          entry.platform,
          entry.accept_language,
          entry.languages.join(' '),
          entry.host,
          entry.public_host,
          entry.public_ipv4,
          entry.public_ipv6,
          entry.username,
          entry.public_source,
          entry.peer_host,
          routeGroup,
          pageRouteGroup
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }

  function formatSourceLabel(device) {
    const source = device.public_source || '—';
    if (device.username) {
      return `${source} · ${device.username}`;
    }
    return source;
  }

  $: filteredEntries = applyFilters(rawEntries);
  $: devices = buildDeviceSummaries(filteredEntries);
  $: visibleDeviceCount = devices.length;
  $: totalEventCount = rawEntries.length;

  async function loadLogs() {
    loading = true;
    error = '';
    try {
      rawEntries = await getPublicAccessLogsRecent(MAX_ENTRIES, 'internal');
      lastUpdatedAt = new Date().toLocaleString();
    } catch (err) {
      error = err?.message || 'Unable to load internal-facing logs.';
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

<div class="internal-device-console">
  <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
    <div>
      <p class="small text-uppercase text-body-secondary fw-semibold mb-1">Internal Facing</p>
      <h2 class="h5 mb-0">Unique Devices</h2>
      <div class="small text-body-secondary mt-1">
        {visibleDeviceCount} unique device{visibleDeviceCount === 1 ? '' : 's'}
        {#if totalEventCount && totalEventCount !== visibleDeviceCount}
          from {totalEventCount} log event{totalEventCount === 1 ? '' : 's'}
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
    Deduped from recent `public-access` logs. This keeps the terminal quiet while preserving the same events in the API.
  </p>

  <div class="filters d-flex flex-wrap gap-2 mb-3">
    <label class="form-label small text-body-secondary mb-0 flex-grow-1" style="min-width: 220px;">
      Search
      <input
        bind:value={searchQuery}
        class="form-control form-control-sm mt-1"
        type="search"
        placeholder="Path, user agent, host, referrer..."
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
      Route group
      <select bind:value={routeFilter} class="form-select form-select-sm mt-1">
        <option value="all">All routes</option>
        <option value="health">Health</option>
        <option value="telemetry">Telemetry</option>
        <option value="cache-refresh">Cache refresh</option>
        <option value="internal-api">Internal API</option>
        <option value="public-api">Public API</option>
        <option value="internal-browser-telemetry">Internal telemetry</option>
        <option value="public-browser-telemetry">Public telemetry</option>
        <option value="public-page">Public pages</option>
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
            <th>Request</th>
            <th>User Agent</th>
            <th>Device</th>
            <th>Host</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {#each devices as device (device.key)}
            <tr>
              <td>
                <div class="fw-semibold">{formatTimestamp(device.timestamp)}</div>
                <div class="small text-body-secondary">{device.route_group || 'other'}</div>
                <div class="small text-body-secondary text-capitalize">{device.event}</div>
              </td>
              <td>
                <div class="fw-semibold text-break">{device.method} {device.path || '—'}</div>
                {#if device.referer}
                  <div class="small text-body-secondary text-break">Referrer: {device.referer}</div>
                {/if}
                <div class="small text-body-secondary">
                  Status {device.status} · {device.duration_ms} ms
                </div>
              </td>
              <td class="text-break">
                <div>{device.user_agent}</div>
              </td>
              <td>
                <div>{device.device_type}</div>
                <div class="small text-body-secondary">
                  DPR {device.device_pixel_ratio} · depth {device.color_depth}
                </div>
                <div class="small text-body-secondary">
                  {device.screen} · {device.viewport}
                </div>
                <div class="small text-body-secondary">{device.accept_language}</div>
                <div class="small text-body-secondary text-break">{device.languages.join(', ')}</div>
              </td>
              <td>
                <div>{device.host}</div>
                <div class="small text-body-secondary">{device.peer_host || '—'}</div>
              </td>
              <td>
                <div>{formatSourceLabel(device)}</div>
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
    <div class="text-body-secondary">No internal-facing logs match the current filters yet.</div>
  {/if}
</div>

<style>
  .internal-device-console {
    color: var(--bs-body-color);
  }
</style>
