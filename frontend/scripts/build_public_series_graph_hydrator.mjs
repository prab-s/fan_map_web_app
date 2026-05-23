import { build } from 'esbuild';

await build({
  entryPoints: ['src/lib/publicSeriesGraphHydrator.js'],
  bundle: true,
  format: 'iife',
  globalName: 'PublicSeriesGraphHydrator',
  outfile: 'static/series-graph-hydrator.js',
  platform: 'browser',
  target: ['es2020'],
  minify: true,
  sourcemap: false
});
