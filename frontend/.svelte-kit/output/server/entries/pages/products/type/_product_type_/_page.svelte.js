import { h as head, e as escape_html, f as ensure_array_like, b as attr, d as bind_props } from "../../../../../chunks/index2.js";
import { f as fallback } from "../../../../../chunks/equality.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let productTypeKey, productTypes, products, productType, pageTitle;
    let data = fallback($$props["data"], () => ({}), true);
    productTypeKey = data?.productTypeKey ?? "";
    productTypes = data?.productTypes ?? [];
    products = data?.products ?? [];
    productType = productTypes.find((item) => String(item.key) === String(productTypeKey)) || null;
    pageTitle = `${productType?.label || productTypeKey || "Product Type"} | Products`;
    head("1djfovf", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(pageTitle)}</title>`);
      });
    });
    $$renderer2.push(`<div class="catalog-shell svelte-1djfovf"><section class="hero-panel card shadow-sm border-0 mb-4 svelte-1djfovf"><div class="card-body p-4 p-lg-5"><p class="eyebrow mb-2 svelte-1djfovf">Customer Facing</p> <h1 class="display-title mb-2 svelte-1djfovf">${escape_html(productType?.label || productTypeKey)}</h1> <p class="lead text-body-secondary mb-0">${escape_html(products.length)} products in this type</p></div></section> <section class="row g-4"><!--[-->`);
    const each_array = ensure_array_like(products);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let product = each_array[$$index];
      $$renderer2.push(`<div class="col-12 col-lg-6 col-xxl-4"><article class="card shadow-sm h-100 border-0 product-card svelte-1djfovf">`);
      if (product.primary_product_image_url) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<img class="card-img-top product-image svelte-1djfovf"${attr("src", product.primary_product_image_url)}${attr("alt", `${product.model} product image`)}/>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="card-body p-4 d-flex flex-column gap-3"><div><p class="section-label mb-2 svelte-1djfovf">${escape_html(product.product_type_label || product.product_type_key)}</p> <h2 class="h4 mb-2">${escape_html(product.model)}</h2> <p class="text-body-secondary mb-0">${escape_html(product.series_name || "No series")}`);
      if (product.series_name && product.product_type_label) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`•`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->${escape_html(product.product_type_label || product.product_type_key || "")}</p></div> <div class="d-flex flex-wrap gap-2 mt-auto"><a class="btn btn-primary"${attr("href", `/products/${encodeURIComponent(product.id)}`)}>Open Product</a> `);
      if (product.product_pdf_url) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<a class="btn btn-outline-secondary"${attr("href", product.product_pdf_url)} target="_blank" rel="noreferrer">PDF</a>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div></article></div>`);
    }
    $$renderer2.push(`<!--]--></section></div>`);
    bind_props($$props, { data });
  });
}
export {
  _page as default
};
