import { getChartTheme } from './chartTheme.js';
import { buildFullChartOption } from './fullChart.js';

const PUBLIC_BROWSER_GRAPH_RENDER_OPTIONS = {
  labelTextScale: 0.8,
  permissibleLabelOffset: { x: 0, y: 0 },
  grid: {
    left: '10%',
    right: '8%',
    top: '12%',
    bottom: '12%'
  }
};

function flattenRpmPoints(rpmLines) {
  return (rpmLines || []).flatMap((line) =>
    (line.points || []).map((point) => ({
      id: point.id,
      airflow: point.airflow,
      pressure: point.pressure,
      rpm: line.rpm,
      rpm_line_id: line.id
    }))
  );
}

export function buildPublicProductGraphOption(payload, themeName) {
  const rpmLines = Array.isArray(payload?.rpmLines) ? payload.rpmLines : [];
  const efficiencyPoints = Array.isArray(payload?.efficiencyPoints) ? payload.efficiencyPoints : [];
  const rpmPoints = Array.isArray(payload?.rpmPoints) && payload.rpmPoints.length
    ? payload.rpmPoints
    : flattenRpmPoints(rpmLines);
  const chartTheme = getChartTheme(themeName);
  const graphMode = String(payload?.graphMode || '').trim().toLowerCase();
  const showRpmBandShading =
    graphMode === 'series'
      ? false
      : graphMode === 'product'
        ? true
        : payload?.showRpmBandShading !== false;

  return buildFullChartOption({
    rpmLines,
    rpmPoints,
    efficiencyPoints,
    chartTheme,
    title: String(payload?.graphTitle || payload?.productModel || 'Performance graph').trim(),
    graphConfig: payload?.graphConfig || null,
    graphMode,
    showRpmBandShading,
    clipRpmAreaToPermissibleUse: true,
    graphStyle: payload?.graphStyle ?? payload?.graphConfig ?? null,
    adaptGraphBackgroundToTheme: true,
    ...PUBLIC_BROWSER_GRAPH_RENDER_OPTIONS
  });
}

function raiseSolidLinesAboveDashedLines(option) {
  const series = Array.isArray(option?.series) ? option.series : [];
  for (const entry of series) {
    if (!entry || entry.type !== 'line') continue;
    const lineType = String(entry?.lineStyle?.type || '').trim().toLowerCase();
    const currentZ = Number.isFinite(Number(entry.z)) ? Number(entry.z) : 0;
    if (lineType === 'dashed') {
      entry.z = currentZ - 20;
    } else {
      entry.z = currentZ + 20;
    }
  }
}

export function renderPublicProductGraph({ host, payload, echarts, themeName }) {
  if (!host || !payload || !echarts) return null;

  const option = buildPublicProductGraphOption(payload, themeName);
  raiseSolidLinesAboveDashedLines(option);
  option.animation = false;
  option.grid = {
    ...(option.grid || {}),
    ...(PUBLIC_BROWSER_GRAPH_RENDER_OPTIONS.grid || {})
  };

  const chart = echarts.init(host, null, { renderer: 'canvas' });
  chart.setOption(option, { notMerge: true, lazyUpdate: false });
  return chart;
}

function bootstrapPublicProductGraph() {
  const host = document.querySelector('[data-product-graph-host]');
  const payload = window.__PRODUCT_GRAPH_DATA__ || null;
  if (!host || !payload || !window.echarts) return;

  const themeName = document.documentElement.dataset.bsTheme === 'dark' ? 'dark' : 'light';
  renderPublicProductGraph({
    host,
    payload,
    echarts: window.echarts,
    themeName
  });
}

bootstrapPublicProductGraph();
