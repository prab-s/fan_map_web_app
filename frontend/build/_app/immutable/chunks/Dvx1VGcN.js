function C(e,r,a,t){const l=Number(e);return Number.isNaN(l)?t:Math.max(r,Math.min(a,l))}function G(e,r){const a=String(e||"").replace("#",""),t=a.length===3?a.split("").map(d=>d+d).join(""):a.padEnd(6,"0"),l=C(r,0,100,100)/100,o=Number.parseInt(t,16),n=o>>16&255,c=o>>8&255,i=o&255;return`rgba(${n}, ${c}, ${i}, ${l})`}function N(e,r,a){return`#${[e,r,a].map(t=>Number(t).toString(16).padStart(2,"0")).join("")}`}function M(e){var b,v,y,S,h,x,$,q,w,A,E;const r=((b=e.querySelector('[data-gradient-field="type"]'))==null?void 0:b.value)||"linear",a=((v=e.querySelector('[data-gradient-field="angle"]'))==null?void 0:v.value)||"135",t=((y=e.querySelector('[data-gradient-field="direction"]'))==null?void 0:y.value)||"",l=((S=e.querySelector('[data-gradient-field="radialShape"]'))==null?void 0:S.value)||"circle",o=((h=e.querySelector('[data-gradient-field="radialPosition"]'))==null?void 0:h.value)||"center",n=((x=e.querySelector('[data-gradient-field="colour1"]'))==null?void 0:x.value)||"#ffffff",c=(($=e.querySelector('[data-gradient-field="opacity1"]'))==null?void 0:$.value)||"100",i=((q=e.querySelector('[data-gradient-field="stop1"]'))==null?void 0:q.value)||"0",d=((w=e.querySelector('[data-gradient-field="colour2"]'))==null?void 0:w.value)||"#000000",m=((A=e.querySelector('[data-gradient-field="opacity2"]'))==null?void 0:A.value)||"100",u=((E=e.querySelector('[data-gradient-field="stop2"]'))==null?void 0:E.value)||"100",f=G(n,c),g=G(d,m);return r==="radial"?`radial-gradient(${l} at ${o}, ${f} ${i}%, ${g} ${u}%)`:`linear-gradient(${t||`${a}deg`}, ${f} ${i}%, ${g} ${u}%)`}function s(e,r,a){const t=e.querySelector(`[data-gradient-field="${r}"]`);t&&a!==void 0&&a!==null&&(t.value=a)}function p(e,r,a,t,l,o){const n=String(e||"").match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([0-9.]+))?\s*\)/);if(n){const i=n[1],d=n[2],m=n[3],u=n[4]!==void 0?Number(n[4]):1;s(a,t,N(i,d,m)),s(a,l,Math.round(u*100)),s(a,o,r);return}const c=String(e||"").match(/#[0-9a-fA-F]{3,8}/);c&&(s(a,t,c[0]),s(a,l,100),s(a,o,r))}function R(e,r){if(!r)return;const a="(rgba?\\([^)]*\\)|#[0-9a-fA-F]{3,8})\\s+(\\d+)%",t=new RegExp(`linear-gradient\\((.*?),\\s*${a}\\s*,\\s*${a}\\s*\\)`),l=String(r).match(t);if(l){const c=l[1];s(e,"type","linear"),c.endsWith("deg")?(s(e,"direction",""),s(e,"angle",c.replace("deg",""))):s(e,"direction",c),p(l[2],l[3],e,"colour1","opacity1","stop1"),p(l[4],l[5],e,"colour2","opacity2","stop2");return}const o=new RegExp(`radial-gradient\\((circle|ellipse)\\s+at\\s+(.*?),\\s*${a}\\s*,\\s*${a}\\s*\\)`),n=String(r).match(o);n&&(s(e,"type","radial"),s(e,"radialShape",n[1]),s(e,"radialPosition",n[2]),p(n[3],n[4],e,"colour1","opacity1","stop1"),p(n[5],n[6],e,"colour2","opacity2","stop2"))}function H(e){const r=()=>{var n,c;const a=(n=[...document.querySelectorAll(".gjs-sm-sector")].find(i=>i.textContent.includes("Advanced Gradient")))==null?void 0:n.querySelector(".gjs-sm-properties");if(!a||a.querySelector("[data-gradient-builder]"))return;const t=document.createElement("div");t.setAttribute("data-gradient-builder","true"),t.style.padding="8px",t.style.width="100%",t.style.boxSizing="border-box",t.innerHTML=`
      <div class="vstack gap-2">
        <label class="form-label mb-0">Gradient type</label>
        <select class="form-select form-select-sm" data-gradient-field="type">
          <option value="linear">Linear</option>
          <option value="radial">Radial</option>
        </select>
        <div class="row g-2">
          <div class="col-6">
            <label class="form-label mb-0">Angle</label>
            <input class="form-control form-control-sm" type="number" data-gradient-field="angle" value="135" />
          </div>
          <div class="col-6">
            <label class="form-label mb-0">Direction</label>
            <input class="form-control form-control-sm" data-gradient-field="direction" />
          </div>
        </div>
        <div class="row g-2">
          <div class="col-6">
            <label class="form-label mb-0">Radial shape</label>
            <select class="form-select form-select-sm" data-gradient-field="radialShape">
              <option value="circle">Circle</option>
              <option value="ellipse">Ellipse</option>
            </select>
          </div>
          <div class="col-6">
            <label class="form-label mb-0">Radial position</label>
            <input class="form-control form-control-sm" data-gradient-field="radialPosition" value="center" />
          </div>
        </div>
        <div class="row g-2">
          <div class="col-4">
            <label class="form-label mb-0">Colour 1</label>
            <input class="form-control form-control-color w-100" type="color" data-gradient-field="colour1" value="#ffffff" />
          </div>
          <div class="col-4">
            <label class="form-label mb-0">Opacity 1</label>
            <input class="form-control form-control-sm" type="number" min="0" max="100" step="1" data-gradient-field="opacity1" value="100" />
          </div>
          <div class="col-4">
            <label class="form-label mb-0">Stop 1</label>
            <input class="form-control form-control-sm" type="number" min="0" max="100" step="1" data-gradient-field="stop1" value="0" />
          </div>
        </div>
        <div class="row g-2">
          <div class="col-4">
            <label class="form-label mb-0">Colour 2</label>
            <input class="form-control form-control-color w-100" type="color" data-gradient-field="colour2" value="#000000" />
          </div>
          <div class="col-4">
            <label class="form-label mb-0">Opacity 2</label>
            <input class="form-control form-control-sm" type="number" min="0" max="100" step="1" data-gradient-field="opacity2" value="100" />
          </div>
          <div class="col-4">
            <label class="form-label mb-0">Stop 2</label>
            <input class="form-control form-control-sm" type="number" min="0" max="100" step="1" data-gradient-field="stop2" value="100" />
          </div>
        </div>
        <label class="form-label mb-0">Generated CSS</label>
        <input class="form-control form-control-sm" data-gradient-output readonly />
        <button type="button" class="btn btn-sm btn-outline-primary" data-gradient-apply>Apply Gradient</button>
      </div>
    `,a.appendChild(t);const l=()=>{const i=t.querySelector("[data-gradient-output]");i&&(i.value=M(t))};t.querySelectorAll("input, select").forEach(i=>{i.addEventListener("input",l),i.addEventListener("change",l)}),(c=t.querySelector("[data-gradient-apply]"))==null||c.addEventListener("click",()=>{const i=e.getSelected();if(!i){window.alert("Select an element first.");return}const d=M(t);i.addStyle({"background-image":d}),e.refresh(),l()});const o=e.getSelected();if(o){const d=o.getStyle()["background-image"]||"";d&&R(t,d)}l()};e.StyleManager.addSector("advanced-gradient",{name:"Advanced Gradient",open:!0,properties:[{name:"Background image",property:"background-image",type:"text",full:!0,defaults:""}]}),e.on("style:target",()=>{window.setTimeout(r,100)}),e.on("component:selected",()=>{window.setTimeout(r,100)}),e.on("load",()=>{window.setTimeout(r,300)})}export{H as installAdvancedGradientControls};
