import { h as head, e as escape_html, d as ensure_array_like, b as attr, i as bind_props } from "../../../chunks/index2.js";
import { f as fallback } from "../../../chunks/equality.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let productTypes, products, search;
    let data = fallback($$props["data"], () => ({}), true);
    productTypes = data?.productTypes ?? [];
    products = data?.products ?? [];
    search = data?.search ?? "";
    head("1dj9mz1", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Products | Customer Facing</title>`);
      });
    });
    $$renderer2.push(`<div class="catalog-shell svelte-1dj9mz1"><section class="hero-panel card shadow-sm border-0 mb-4 svelte-1dj9mz1"><div class="card-body p-4 p-lg-5"><p class="eyebrow mb-2 svelte-1dj9mz1">Customer Facing</p> <h1 class="display-title mb-2 svelte-1dj9mz1">Products</h1> <p class="lead text-body-secondary mb-0">Browse product types, then open a product page for the live graph, images, PDFs, and specs.</p></div></section> `);
    if (search) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<section class="search-results-panel card shadow-sm border-0 mb-4 svelte-1dj9mz1"><div class="card-body p-4"><p class="eyebrow mb-2 svelte-1dj9mz1">Search results</p> <h2 class="h3 mb-1">Results for “${escape_html(search)}”</h2> <p class="text-body-secondary mb-4">${escape_html(products.length)} matching product${escape_html(products.length === 1 ? "" : "s")} across the catalogue.</p> `);
      if (products.length) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="row g-3"><!--[-->`);
        const each_array = ensure_array_like(products);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let product = each_array[$$index];
          $$renderer2.push(`<div class="col-12 col-md-6 col-xl-4"><a class="search-result-card svelte-1dj9mz1"${attr("href", `/products/${encodeURIComponent(product.id)}`)}><strong>${escape_html(product.model)}</strong> <span class="svelte-1dj9mz1">${escape_html(product.product_type_label || product.product_type_key)}`);
          if (product.series_name) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`· ${escape_html(product.series_name)}`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--></span></a></div>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<p class="text-body-secondary mb-0">No products matched this search.</p>`);
      }
      $$renderer2.push(`<!--]--></div></section>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <section class="row g-4"><!--[-->`);
    const each_array_1 = ensure_array_like(productTypes);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let productType = each_array_1[$$index_1];
      $$renderer2.push(`<div class="col-12 col-md-6 col-xl-4"><div class="card shadow-sm h-100 border-0 type-card svelte-1dj9mz1"><div class="card-body p-4 d-flex flex-column gap-3"><div><p class="section-label mb-2 svelte-1dj9mz1">${escape_html(productType.key)}</p> <h2 class="h4 mb-2">${escape_html(productType.label)}</h2> <p class="text-body-secondary mb-0">${escape_html(productType.series_names?.length || 0)} linked series</p></div> <div class="d-flex flex-wrap gap-2 mt-auto"><a class="btn btn-primary"${attr("href", `/products/type/${encodeURIComponent(productType.key)}`)}>Open Type</a></div></div></div></div>`);
    }
    $$renderer2.push(`<!--]--></section></div>`);
    bind_props($$props, { data });
  });
}
export {
  _page as default
};
