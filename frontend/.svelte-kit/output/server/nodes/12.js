import * as universal from '../entries/pages/editor/series/_page.js';

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/editor/series/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/editor/series/+page.js";
export const imports = ["_app/immutable/nodes/12.BFqnA3QD.js","_app/immutable/chunks/pfMRWl6z.js","_app/immutable/chunks/BUApaBEI.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/DFzR8caL.js","_app/immutable/chunks/bopv7RXo.js","_app/immutable/chunks/BBQcLBo9.js","_app/immutable/chunks/DhZUfZlc.js","_app/immutable/chunks/Ctlj2boL.js","_app/immutable/chunks/CeyxxxIj.js","_app/immutable/chunks/CbaID5D2.js","_app/immutable/chunks/D8h75jP6.js","_app/immutable/chunks/DVcBOjDy.js"];
export const stylesheets = [];
export const fonts = [];
