import * as universal from '../entries/pages/products/_page.js';

export const index = 21;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/products/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/products/+page.js";
export const imports = ["_app/immutable/nodes/21.Cvq3txUl.js","_app/immutable/chunks/pfMRWl6z.js","_app/immutable/chunks/BUApaBEI.js","_app/immutable/chunks/6p1-UacL.js","_app/immutable/chunks/CsU8Fmeh.js","_app/immutable/chunks/DTLrqHZe.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/BhuivEhF.js","_app/immutable/chunks/DYcssAYg.js","_app/immutable/chunks/Casnbp_7.js","_app/immutable/chunks/aMAoNkCF.js","_app/immutable/chunks/CnsGVSIn.js","_app/immutable/chunks/nH76e4p5.js","_app/immutable/chunks/CFqP_YE-.js"];
export const stylesheets = ["_app/immutable/assets/21.Bfs23XLE.css"];
export const fonts = [];
