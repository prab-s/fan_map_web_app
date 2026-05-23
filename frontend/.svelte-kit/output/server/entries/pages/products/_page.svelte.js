import { h as head, f as ensure_array_like, e as escape_html, b as attr, d as bind_props } from "../../../chunks/index2.js";
import { f as fallback } from "../../../chunks/equality.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let productTypes;
    let data = fallback($$props["data"], () => ({}), true);
    productTypes = data?.productTypes ?? [];
    head("1dj9mz1", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Products | Customer Facing</title>`);
      });
    });
    $$renderer2.push(`<div class="catalog-shell svelte-1dj9mz1"><section class="hero-panel card shadow-sm border-0 mb-4 svelte-1dj9mz1"><div class="card-body p-4 p-lg-5"><p class="eyebrow mb-2 svelte-1dj9mz1">Customer Facing</p> <h1 class="display-title mb-2 svelte-1dj9mz1">Products</h1> <p class="lead text-body-secondary mb-0">Browse product types, then open a product page for the live graph, images, PDFs, and specs.</p></div></section> <section class="row g-4"><!--[-->`);
    const each_array = ensure_array_like(productTypes);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let productType = each_array[$$index];
      $$renderer2.push(`<div class="col-12 col-md-6 col-xl-4"><div class="card shadow-sm h-100 border-0 type-card svelte-1dj9mz1"><div class="card-body p-4 d-flex flex-column gap-3"><div><p class="section-label mb-2 svelte-1dj9mz1">${escape_html(productType.key)}</p> <h2 class="h4 mb-2">${escape_html(productType.label)}</h2> <p class="text-body-secondary mb-0">${escape_html(productType.series_names?.length || 0)} linked series</p></div> <div class="d-flex flex-wrap gap-2 mt-auto"><a class="btn btn-primary"${attr("href", `/products/type/${encodeURIComponent(productType.key)}`)}>Open Type</a></div></div></div></div>`);
    }
    $$renderer2.push(`<!--]--></section></div>`);
    bind_props($$props, { data });
  });
}
export {
  _page as default
};
