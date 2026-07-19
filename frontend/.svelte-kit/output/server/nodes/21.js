import * as universal from '../entries/pages/products/_page.js';

export const index = 21;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/products/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/products/+page.js";
export const imports = ["_app/immutable/nodes/21.C7y-Kc_T.js","_app/immutable/chunks/pfMRWl6z.js","_app/immutable/chunks/BUApaBEI.js","_app/immutable/chunks/J-lLnens.js","_app/immutable/chunks/C9wobsQu.js","_app/immutable/chunks/CgWJJcYV.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/Bto-MJ2D.js","_app/immutable/chunks/CTAYhzIN.js","_app/immutable/chunks/D1rClthp.js","_app/immutable/chunks/BXqy1y7j.js","_app/immutable/chunks/DxIVqtFp.js","_app/immutable/chunks/DCoqoqnl.js","_app/immutable/chunks/CAHx5Urj.js"];
export const stylesheets = ["_app/immutable/assets/21.Bfs23XLE.css"];
export const fonts = [];
