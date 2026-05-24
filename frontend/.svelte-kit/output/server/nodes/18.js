import * as universal from '../entries/pages/products/_page.js';

export const index = 18;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/products/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/products/+page.js";
export const imports = ["_app/immutable/nodes/18.DrHKgGrY.js","_app/immutable/chunks/pfMRWl6z.js","_app/immutable/chunks/BUApaBEI.js","_app/immutable/chunks/Cn321wFf.js","_app/immutable/chunks/bopv7RXo.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/DFzR8caL.js","_app/immutable/chunks/DzE9GDi8.js","_app/immutable/chunks/BBQcLBo9.js","_app/immutable/chunks/CbaID5D2.js","_app/immutable/chunks/Pm6m9bH9.js","_app/immutable/chunks/D8h75jP6.js","_app/immutable/chunks/DVcBOjDy.js"];
export const stylesheets = ["_app/immutable/assets/18.Bfs23XLE.css"];
export const fonts = [];
