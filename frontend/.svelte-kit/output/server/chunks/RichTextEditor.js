import { b as attr, c as attr_class, f as bind_props } from "./index2.js";
import { f as fallback } from "./equality.js";
function RichTextEditor($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let value = fallback($$props["value"], "");
    let id = fallback($$props["id"], "");
    let rows = fallback($$props["rows"], 4);
    let color = "#732323";
    $$renderer2.push(`<div class="rich-text-editor"><div class="btn-toolbar gap-1 mb-2" role="toolbar" aria-label="Text formatting"><button class="btn btn-sm btn-outline-secondary" type="button" title="Bold" aria-label="Bold"><strong>B</strong></button> <button class="btn btn-sm btn-outline-secondary" type="button" title="Italic" aria-label="Italic"><em>I</em></button> <button class="btn btn-sm btn-outline-secondary" type="button" title="Underline" aria-label="Underline"><u>U</u></button> <button class="btn btn-sm btn-outline-secondary" type="button" title="Strikethrough" aria-label="Strikethrough">S̶</button> <button class="btn btn-sm btn-outline-secondary" type="button" title="Bulleted list" aria-label="Bulleted list">• List</button> <button class="btn btn-sm btn-outline-secondary" type="button" title="Numbered list" aria-label="Numbered list">1. List</button> <label class="btn btn-sm btn-outline-secondary mb-0" title="Text colour" aria-label="Text colour"><span aria-hidden="true">A</span> <input class="rich-text-editor__color svelte-1s8pqmd" type="color"${attr("value", color)}/></label> <button class="btn btn-sm btn-outline-secondary" type="button" title="Remove formatting" aria-label="Remove formatting">Clear</button></div> <div${attr_class("form-control rich-text-editor__surface svelte-1s8pqmd", void 0, { "rich-text-editor__surface--short": rows <= 3 })}${attr("id", id)} contenteditable="true" role="textbox" aria-multiline="true" aria-label="Rich text"></div></div>`);
    bind_props($$props, { value, id, rows });
  });
}
export {
  RichTextEditor as R
};
