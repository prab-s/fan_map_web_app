import * as universal from '../entries/pages/products/_page.js';

export const index = 18;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/products/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/products/+page.js";
export const imports = ["_app/immutable/nodes/18.CaiKPpuC.js","_app/immutable/chunks/pfMRWl6z.js","_app/immutable/chunks/BUApaBEI.js","_app/immutable/chunks/LmnDc7il.js","_app/immutable/chunks/CwDMihiN.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/D8PSzG8n.js","_app/immutable/chunks/DFxhhO-P.js","_app/immutable/chunks/Di5nucek.js","_app/immutable/chunks/Cb-BRqwR.js","_app/immutable/chunks/CJkDel_M.js","_app/immutable/chunks/C5otqFfd.js","_app/immutable/chunks/LNRkU0hI.js"];
export const stylesheets = ["_app/immutable/assets/18.Bfs23XLE.css"];
export const fonts = [];
