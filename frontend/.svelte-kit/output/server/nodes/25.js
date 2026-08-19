import * as universal from '../entries/pages/quotes/_page.js';

export const index = 25;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/quotes/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/quotes/+page.js";
export const imports = ["_app/immutable/nodes/25.CV-T0MyK.js","_app/immutable/chunks/pfMRWl6z.js","_app/immutable/chunks/BUApaBEI.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/CZRN545d.js","_app/immutable/chunks/CpJ0sHe5.js","_app/immutable/chunks/FMlNJFAl.js"];
export const stylesheets = [];
export const fonts = [];
