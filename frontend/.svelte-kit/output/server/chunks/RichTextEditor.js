import { d as ensure_array_like, e as escape_html, b as attr, c as attr_class, f as bind_props } from "./index2.js";
import { f as fallback } from "./equality.js";
function RichTextEditor($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let value = fallback($$props["value"], "");
    let id = fallback($$props["id"], "");
    let rows = fallback($$props["rows"], 4);
    let color = "#732323";
    const fontOptions = [
      { value: "Arial", label: "Arial" },
      { value: "Georgia", label: "Georgia" },
      { value: "Helvetica", label: "Helvetica" },
      { value: "Tahoma", label: "Tahoma" },
      { value: "Times New Roman", label: "Times New Roman" },
      { value: "Verdana", label: "Verdana" }
    ];
    $$renderer2.push(`<div class="rich-text-editor"><div class="rich-text-editor__toolbar svelte-1s8pqmd" role="toolbar" aria-label="Text formatting"><div class="btn-group btn-group-sm" role="group" aria-label="Text style"><button class="btn btn-outline-secondary" type="button" title="Bold" aria-label="Bold"><strong>B</strong></button> <button class="btn btn-outline-secondary" type="button" title="Italic" aria-label="Italic"><em>I</em></button> <button class="btn btn-outline-secondary" type="button" title="Underline" aria-label="Underline"><u>U</u></button> <button class="btn btn-outline-secondary" type="button" title="Strikethrough" aria-label="Strikethrough">S̶</button></div> <select class="form-select form-select-sm rich-text-editor__font svelte-1s8pqmd" aria-label="Font" title="Font">`);
    $$renderer2.option({ value: "" }, ($$renderer3) => {
      $$renderer3.push(`Font`);
    });
    $$renderer2.push(`<!--[-->`);
    const each_array = ensure_array_like(fontOptions);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let font = each_array[$$index];
      $$renderer2.option({ value: font.value, style: `font-family: ${font.value}` }, ($$renderer3) => {
        $$renderer3.push(`${escape_html(font.label)}`);
      });
    }
    $$renderer2.push(`<!--]--></select> <div class="btn-group btn-group-sm" role="group" aria-label="Paragraph formatting"><button class="btn btn-outline-secondary" type="button" title="Decrease indent" aria-label="Decrease indent">⇤</button> <button class="btn btn-outline-secondary" type="button" title="Increase indent" aria-label="Increase indent">⇥</button> <button class="btn btn-outline-secondary" type="button" title="Bulleted list" aria-label="Bulleted list">•</button> <button class="btn btn-outline-secondary" type="button" title="Numbered list" aria-label="Numbered list">1.</button></div> <label class="btn btn-sm btn-outline-secondary mb-0" title="Text colour" aria-label="Text colour"><span aria-hidden="true">A</span> <input class="rich-text-editor__color svelte-1s8pqmd" type="color"${attr("value", color)}/></label> <button class="btn btn-sm btn-outline-secondary" type="button" title="Remove formatting" aria-label="Remove formatting">Clear</button></div> <div${attr_class("form-control rich-text-editor__surface svelte-1s8pqmd", void 0, { "rich-text-editor__surface--short": rows <= 3 })}${attr("id", id)} contenteditable="true" role="textbox" aria-multiline="true" aria-label="Rich text"></div></div>`);
    bind_props($$props, { value, id, rows });
  });
}
export {
  RichTextEditor as R
};
