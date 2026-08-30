import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import * as echarts from 'echarts';
import sharp from 'sharp';

import { LIGHT_CHART_THEME } from '../src/lib/chartTheme.js';
import { buildFullChartOption } from '../src/lib/fullChart.js';

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function main() {
  const outputPath = process.argv[2];
  if (!outputPath) {
    throw new Error('Output path argument is required');
  }

  const input = await readStdin();
  const payload = JSON.parse(input);

  const option = buildFullChartOption({
    rpmLines: payload.rpmLines ?? [],
    rpmPoints: payload.rpmPoints ?? [],
    efficiencyPoints: payload.efficiencyPoints ?? [],
    chartTheme: LIGHT_CHART_THEME,
    title: payload.title ?? 'Product Graph',
    graphConfig: payload.graphConfig ?? null,
    graphMode: payload.graphMode ?? 'product',
    showRpmBandShading: payload.showRpmBandShading ?? true,
    clipRpmAreaToPermissibleUse: true,
    showSecondaryAxis: false,
    tooltip: { show: false },
    graphStyle: payload.graphStyle ?? null,
    labelTextScale: 1.25,
    permissibleLabelOffset: { x: 20, y: -15 },
    textSizeOffset: 10,
    showSeriesGraphLineLabels: payload.graphMode !== 'series',
    showSeriesGraphLegend: payload.graphMode === 'series',
    seriesGraphLegendX: 1300,
    seriesGraphGridRight: '20%'
  });

  option.animation = false;
  const outputBackground = option.backgroundColor || LIGHT_CHART_THEME.background;

  const width = 1600;
  const legendLabels = payload.graphMode === 'series'
    ? (payload.rpmLines ?? [])
      .filter((line) => line?.display_label || line?.rpm != null)
      .map((line) => String(line.display_label ?? line.rpm ?? ''))
    : [];
  const longestLegendLabelLength = legendLabels.reduce(
    (longest, label) => Math.max(longest, label.length),
    0
  );
  // The legend text is rendered at 26px in PNGs (16px + 10px), so reserve
  // enough width for it without adding unnecessary space at the image edge.
  const legendWidth = Math.max(260, longestLegendLabelLength * 14 + 30);
  const legendRightMargin = 5;
  const legendX = width - legendRightMargin - legendWidth;
  const graphRightEdge = Math.max(720, legendX - 10);
  const seriesGraphGridRight = `${((width - graphRightEdge) / width) * 100}%`;
  option.grid.right = payload.graphMode === 'series' ? seriesGraphGridRight : option.grid.right;
  if (payload.graphMode === 'series' && Array.isArray(option.graphic)) {
    const legendGraphics = option.graphic.slice(1);
    const legendDelta = legendX - 1300;
    legendGraphics.forEach((graphic) => {
      if (graphic.type === 'line' || graphic.type === 'text') {
        graphic.left += legendDelta;
      }
    });
  }
  const legendEntryCount = payload.graphMode === 'series'
    ? (payload.rpmLines ?? []).filter((line) => line?.display_label || line?.rpm != null).length
    : 0;
  const legendRowHeight = 22;
  const legendReservedHeight = 136;
  const height = Math.max(960, legendReservedHeight + legendEntryCount * legendRowHeight);
  const chart = echarts.init(null, null, {
    renderer: 'svg',
    ssr: true,
    width,
    height,
  });

  chart.setOption(option, { notMerge: true, lazyUpdate: false });
  const svg = chart.renderToSVGString();
  chart.dispose();

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await sharp(Buffer.from(svg))
    .flatten({ background: outputBackground })
    .png()
    .toFile(outputPath);
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exit(1);
});
