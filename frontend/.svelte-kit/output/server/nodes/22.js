import * as universal from '../entries/pages/products/_page.js';

export const index = 22;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/products/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/products/+page.js";
export const imports = ["_app/immutable/nodes/22.BT64FBHx.js","_app/immutable/chunks/pfMRWl6z.js","_app/immutable/chunks/BUApaBEI.js","_app/immutable/chunks/RgtspmOC.js","_app/immutable/chunks/Dks1g1x5.js","_app/immutable/chunks/CzwjxviM.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/DyTZ4wJ-.js","_app/immutable/chunks/DQSWdVF-.js","_app/immutable/chunks/Ci80-ZQr.js","_app/immutable/chunks/CTHzR-yQ.js","_app/immutable/chunks/BL-QYQqR.js","_app/immutable/chunks/9OcqGCMa.js"];
export const stylesheets = ["_app/immutable/assets/22.Ba9XkRvu.css"];
export const fonts = [];
