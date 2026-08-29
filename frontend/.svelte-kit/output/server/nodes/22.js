import * as universal from '../entries/pages/products/_page.js';

export const index = 22;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/products/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/products/+page.js";
export const imports = ["_app/immutable/nodes/22.eX3kWqeq.js","_app/immutable/chunks/pfMRWl6z.js","_app/immutable/chunks/BUApaBEI.js","_app/immutable/chunks/KGoJZu61.js","_app/immutable/chunks/CpJ0sHe5.js","_app/immutable/chunks/CYX31sZj.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/CZRN545d.js","_app/immutable/chunks/K8-Dw00Z.js","_app/immutable/chunks/FMlNJFAl.js","_app/immutable/chunks/CQkbKTgW.js","_app/immutable/chunks/BdwUhJh3.js","_app/immutable/chunks/Cw7TctR3.js"];
export const stylesheets = ["_app/immutable/assets/22.Ba9XkRvu.css"];
export const fonts = [];
