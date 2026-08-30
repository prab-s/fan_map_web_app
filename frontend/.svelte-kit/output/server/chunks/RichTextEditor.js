import { d as ensure_array_like, e as escape_html, b as attr, a as slot, c as attr_class, i as bind_props } from "./index2.js";
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
    $$renderer2.push(`<!--]--></select> <div class="btn-group btn-group-sm" role="group" aria-label="Paragraph formatting"><select class="form-select form-select-sm rich-text-editor__format svelte-1s8pqmd" aria-label="Text style">`);
    $$renderer2.option({ value: "" }, ($$renderer3) => {
      $$renderer3.push(`Style`);
    });
    $$renderer2.option({ value: "p" }, ($$renderer3) => {
      $$renderer3.push(`Paragraph`);
    });
    $$renderer2.option({ value: "h2" }, ($$renderer3) => {
      $$renderer3.push(`Heading 2`);
    });
    $$renderer2.option({ value: "h3" }, ($$renderer3) => {
      $$renderer3.push(`Heading 3`);
    });
    $$renderer2.option({ value: "h4" }, ($$renderer3) => {
      $$renderer3.push(`Heading 4`);
    });
    $$renderer2.push(`</select> <button class="btn btn-outline-secondary" type="button" title="Decrease indent" aria-label="Decrease indent">⇤</button> <button class="btn btn-outline-secondary" type="button" title="Increase indent" aria-label="Increase indent">⇥</button> <button class="btn btn-outline-secondary" type="button" title="Bulleted list" aria-label="Bulleted list">•</button> <button class="btn btn-outline-secondary" type="button" title="Numbered list" aria-label="Numbered list">1.</button></div> <select class="form-select form-select-sm rich-text-editor__compact svelte-1s8pqmd" aria-label="Font size" title="Font size">`);
    $$renderer2.option({ value: "" }, ($$renderer3) => {
      $$renderer3.push(`Size`);
    });
    $$renderer2.option({ value: "0.75rem" }, ($$renderer3) => {
      $$renderer3.push(`Small`);
    });
    $$renderer2.option({ value: "1rem" }, ($$renderer3) => {
      $$renderer3.push(`Normal`);
    });
    $$renderer2.option({ value: "1.25rem" }, ($$renderer3) => {
      $$renderer3.push(`Large`);
    });
    $$renderer2.option({ value: "1.75rem" }, ($$renderer3) => {
      $$renderer3.push(`Display`);
    });
    $$renderer2.push(`</select> <select class="form-select form-select-sm rich-text-editor__compact svelte-1s8pqmd" aria-label="Line spacing" title="Line spacing">`);
    $$renderer2.option({ value: "" }, ($$renderer3) => {
      $$renderer3.push(`Spacing`);
    });
    $$renderer2.option({ value: "1" }, ($$renderer3) => {
      $$renderer3.push(`Tight`);
    });
    $$renderer2.option({ value: "1.5" }, ($$renderer3) => {
      $$renderer3.push(`Normal`);
    });
    $$renderer2.option({ value: "2" }, ($$renderer3) => {
      $$renderer3.push(`Loose`);
    });
    $$renderer2.push(`</select> <button class="btn btn-sm btn-outline-secondary" type="button" title="Add link" aria-label="Add link">Link</button> <button class="btn btn-sm btn-outline-secondary" type="button" title="Insert image" aria-label="Insert image">Image</button> <label class="btn btn-sm btn-outline-secondary mb-0" title="Text colour" aria-label="Text colour"><span aria-hidden="true">A</span> <input class="rich-text-editor__color svelte-1s8pqmd" type="color"${attr("value", color)}/></label> <button class="btn btn-sm btn-outline-secondary" type="button" title="Remove formatting" aria-label="Remove formatting">Clear</button> <!--[-->`);
    slot($$renderer2, $$props, "toolbar-end", {});
    $$renderer2.push(`<!--]--></div> <div${attr_class("form-control rich-text-editor__surface svelte-1s8pqmd", void 0, { "rich-text-editor__surface--short": rows <= 3 })}${attr("id", id)} contenteditable="true" role="textbox" aria-multiline="true" aria-label="Rich text"></div></div>`);
    bind_props($$props, { value, id, rows });
  });
}
export {
  RichTextEditor as R
};
