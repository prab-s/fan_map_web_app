import { build } from 'esbuild';

await build({
  entryPoints: ['src/lib/publicProductGraphRenderer.js'],
  bundle: true,
  format: 'iife',
  globalName: 'PublicProductGraphRenderer',
  outfile: '../customer_facing/app/static/js/product-graph.js',
  platform: 'browser',
  target: ['es2020'],
  minify: true,
  sourcemap: false
});
