import * as universal from '../entries/pages/editor/series/_page.js';

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/editor/series/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/editor/series/+page.js";
export const imports = ["_app/immutable/nodes/12.C2GTsy4C.js","_app/immutable/chunks/pfMRWl6z.js","_app/immutable/chunks/BUApaBEI.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/BE3Ymb6W.js","_app/immutable/chunks/DjM084lz.js","_app/immutable/chunks/C2YU_FUt.js","_app/immutable/chunks/DY04Idsx.js","_app/immutable/chunks/DKEnfhXw.js","_app/immutable/chunks/DiYEdbsh.js","_app/immutable/chunks/BrX_bT4t.js","_app/immutable/chunks/vAmBirHz.js"];
export const stylesheets = [];
export const fonts = [];
