import * as universal from '../entries/pages/products/_page.js';

export const index = 21;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/products/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/products/+page.js";
export const imports = ["_app/immutable/nodes/21.BkR_zfWp.js","_app/immutable/chunks/pfMRWl6z.js","_app/immutable/chunks/BUApaBEI.js","_app/immutable/chunks/C2lbEcjv.js","_app/immutable/chunks/Bg_I6oEs.js","_app/immutable/chunks/BwKtEPYy.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/CPZoAzom.js","_app/immutable/chunks/ghHN6Zjl.js","_app/immutable/chunks/Ba14pz6o.js","_app/immutable/chunks/MJvokQ6W.js","_app/immutable/chunks/COW419Hb.js","_app/immutable/chunks/CH9oVkyW.js"];
export const stylesheets = ["_app/immutable/assets/21.Ba9XkRvu.css"];
export const fonts = [];
