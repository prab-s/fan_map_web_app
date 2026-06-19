import * as universal from '../entries/pages/products/_product_/_page.js';

export const index = 20;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/products/_product_/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/products/[product]/+page.js";
export const imports = ["_app/immutable/nodes/20.BrFkNRoP.js","_app/immutable/chunks/pfMRWl6z.js","_app/immutable/chunks/BUApaBEI.js","_app/immutable/chunks/lObAfXLR.js","_app/immutable/chunks/D4GndEBo.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/B8AtQkhI.js","_app/immutable/chunks/SjmN_6cJ.js","_app/immutable/chunks/FGsG58rJ.js","_app/immutable/chunks/ClmL_HNB.js","_app/immutable/chunks/1fAUmMee.js","_app/immutable/chunks/D5GhMCzy.js","_app/immutable/chunks/CCJ1WhI2.js","_app/immutable/chunks/XhnPXEtc.js","_app/immutable/chunks/DvJSfkeM.js","_app/immutable/chunks/C1FmrZbK.js","_app/immutable/chunks/B4CsTNPU.js","_app/immutable/chunks/Bt-iu9NP.js","_app/immutable/chunks/C7YJlRmi.js","_app/immutable/chunks/DhJhfQAU.js"];
export const stylesheets = ["_app/immutable/assets/20.ByKUvYLX.css"];
export const fonts = [];
