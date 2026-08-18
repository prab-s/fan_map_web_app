import * as universal from '../entries/pages/quotes/_page.js';

export const index = 25;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/quotes/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/quotes/+page.js";
export const imports = ["_app/immutable/nodes/25.CPqCJ_3R.js","_app/immutable/chunks/pfMRWl6z.js","_app/immutable/chunks/BUApaBEI.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/DyTZ4wJ-.js","_app/immutable/chunks/Dks1g1x5.js","_app/immutable/chunks/Ci80-ZQr.js"];
export const stylesheets = [];
export const fonts = [];
