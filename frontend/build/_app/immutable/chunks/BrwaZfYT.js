function b(t){return String(t||"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function q(){var t;return(t=[...document.querySelectorAll(".gjs-sm-sector")].find(e=>e.textContent.includes("HTML Attributes")))==null?void 0:t.querySelector(".gjs-sm-properties")}function u(t,e,l){const a=t.querySelector(`[data-html-attr-field="${e}"]`);a&&l!==void 0&&l!==null&&(a.value=l)}function v(t){const e=t.querySelector('[data-sm-property="data-gjs-attr-editor-placeholder"]');e&&(e.style.display="none")}function h(t,e){var d;const l=e.getSelected();if(!l)return;const a=l.getAttributes(),r=l.get("tagName")||"",m=String(r||"").toLowerCase()==="img"||((d=l.is)==null?void 0:d.call(l,"image"));u(t,"tag",r),u(t,"src",a.src||""),u(t,"href",a.href||""),u(t,"alt",a.alt||""),u(t,"title",a.title||""),u(t,"target",a.target||"");const i=t.querySelector("[data-html-attr-upload-image]");i&&(i.hidden=!m)}function L(t="image/*"){return new Promise(e=>{const l=document.createElement("input");l.type="file",l.accept=t,l.addEventListener("change",()=>{var m;const a=(m=l.files)==null?void 0:m[0];if(!a){e(null);return}const r=new FileReader;r.onload=()=>{e({file:a,dataUrl:r.result})},r.readAsDataURL(a)}),l.click()})}function T(t,e,l={}){var S,A;const a=typeof l.uploadImageAsset=="function"?l.uploadImageAsset:null,r=e.getSelected();if(!r)return;if(t.querySelector("[data-html-attribute-builder]")){v(t),h(t,e);return}const i=r.getAttributes(),d=r.get("tagName")||"",w=String(d||"").toLowerCase()==="img"||((S=r.is)==null?void 0:S.call(r,"image"));v(t);const n=document.createElement("div");n.setAttribute("data-html-attribute-builder","true"),n.style.padding="8px",n.style.width="100%",n.style.boxSizing="border-box",n.innerHTML=`
    <div class="vstack gap-2">
      <div class="small text-body-secondary">
        Edit the selected component's HTML attributes without leaving the canvas.
      </div>

      <label class="form-label mb-0">Tag</label>
      <input class="form-control form-control-sm" data-html-attr-field="tag" readonly value="${b(d)}">

      <label class="form-label mb-0">src</label>
      <input class="form-control form-control-sm" data-html-attr-field="src" value="${b(i.src||"")}">
      <button type="button" class="btn btn-sm btn-outline-secondary" data-html-attr-upload-image>
        Choose Image File
      </button>

      <label class="form-label mb-0">href</label>
      <input class="form-control form-control-sm" data-html-attr-field="href" value="${b(i.href||"")}">

      <label class="form-label mb-0">alt</label>
      <input class="form-control form-control-sm" data-html-attr-field="alt" value="${b(i.alt||"")}">

      <label class="form-label mb-0">title</label>
      <input class="form-control form-control-sm" data-html-attr-field="title" value="${b(i.title||"")}">

      <label class="form-label mb-0">target</label>
      <select class="form-select form-select-sm" data-html-attr-field="target">
        <option value="">Same tab</option>
        <option value="_blank">New tab</option>
      </select>

      <button type="button" class="btn btn-sm btn-outline-primary" data-html-attr-apply>
        Apply HTML Attributes
      </button>
    </div>
  `,t.appendChild(n);const f=n.querySelector("[data-html-attr-upload-image]");f&&(f.hidden=!w||!a);const y=n.querySelector('[data-html-attr-field="target"]');y&&(y.value=i.target||""),(A=n.querySelector("[data-html-attr-apply]"))==null||A.addEventListener("click",()=>{const c=e.getSelected();if(!c)return;const p={...c.getAttributes()};n.querySelectorAll("[data-html-attr-field]").forEach(o=>{const s=o.getAttribute("data-html-attr-field");if(!s||s==="tag")return;const g=o.value.trim();g?p[s]=g:delete p[s]}),c.setAttributes(p),e.StyleManager.render(),e.refresh(),h(t,e)}),f==null||f.addEventListener("click",async()=>{if(!a)return;const c=e.getSelected();if(!c){alert("Select an image first.");return}if(String(c.get("tagName")||"").toLowerCase()!=="img"){alert("Select an image element first.");return}const o=await L("image/*");if(!o)return;const s=await a(o.file,o.dataUrl);if(!(s!=null&&s.file_url)){alert("Image upload failed");return}const g=n.querySelector('[data-html-attr-field="src"]');g&&(g.value=s.file_url),c.setAttributes({...c.getAttributes(),src:s.file_url}),e.StyleManager.render(),e.refresh(),h(t,e)})}function x(t,e={}){const l=()=>{window.setTimeout(()=>{const a=q();a&&T(a,t,e)},100)};t.StyleManager.addSector("html-attributes",{name:"HTML Attributes",open:!0,properties:[{name:"Selected element",property:"data-gjs-attr-editor-placeholder",type:"text",defaults:"",full:!0}]}),t.StyleManager.render(),t.on("component:selected",l),t.on("style:target",l),t.on("load",l),l()}export{x as installHtmlAttributeControls};
