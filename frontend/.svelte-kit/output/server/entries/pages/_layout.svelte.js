import { g as getContext, s as store_get, a as slot, b as attr, e as escape_html, c as attr_class, u as unsubscribe_stores } from "../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/root.js";
import "../../chunks/state.svelte.js";
import "clsx";
import { a as auth } from "../../chunks/auth.js";
import { t as theme } from "../../chunks/config.js";
const getStores = () => {
  const stores$1 = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores$1.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let username = "";
    let password = "";
    let isPublicRoute = false;
    let currentPath = "";
    let homeActive = false;
    let editorActive = false;
    let viewerActive = false;
    let templateBuilderActive = false;
    let bulkImportActive = false;
    let setupActive = false;
    let enquiriesActive = false;
    const PUBLIC_ROUTE_PREFIXES = ["/series", "/products"];
    currentPath = store_get($$store_subs ??= {}, "$page", page).url.pathname;
    isPublicRoute = PUBLIC_ROUTE_PREFIXES.some((prefix) => currentPath === prefix || currentPath.startsWith(`${prefix}/`));
    homeActive = currentPath === "/";
    editorActive = currentPath === "/editor" || currentPath.startsWith("/editor/");
    viewerActive = currentPath === "/viewer" || currentPath.startsWith("/viewer/");
    templateBuilderActive = currentPath === "/template-builder" || currentPath.startsWith("/template-builder/");
    bulkImportActive = currentPath === "/bulk-actions" || currentPath.startsWith("/bulk-actions/");
    setupActive = currentPath === "/setup" || currentPath.startsWith("/setup/");
    enquiriesActive = currentPath === "/enquiries" || currentPath.startsWith("/enquiries/");
    $$renderer2.push(`<div class="app-shell">`);
    if (isPublicRoute) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<header class="public-topbar"><div class="public-nav app-frame"><a class="public-brand" href="/products" aria-label="Products home">Fan Graphs</a> <nav class="public-links" aria-label="Customer-facing navigation"><a href="/products">Products</a></nav> <button class="public-search-trigger" type="button" aria-label="Search products"><span aria-hidden="true">⌕</span> Search</button></div></header> <main class="app-frame py-0"><!--[-->`);
      slot($$renderer2, $$props, "default", {});
      $$renderer2.push(`<!--]--></main> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else if (!store_get($$store_subs ??= {}, "$auth", auth).ready) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<main class="app-frame py-5"><div class="d-flex justify-content-center"><div class="card shadow-sm" style="max-width: 420px; width: 100%;"><div class="card-body p-4 text-center"><h1 class="h4 mb-2">Internal Facing</h1> <p class="text-body-secondary mb-0">Checking your session...</p></div></div></div></main>`);
    } else if (!store_get($$store_subs ??= {}, "$auth", auth).authenticated) {
      $$renderer2.push("<!--[2-->");
      $$renderer2.push(`<main class="app-frame py-5"><div class="d-flex justify-content-center"><div class="card shadow-sm" style="max-width: 420px; width: 100%;"><div class="card-body p-4"><div class="text-center mb-4"><h1 class="h4 mb-2">Internal Facing</h1> <p class="text-body-secondary mb-0">Enter the application password to continue.</p></div> <form class="vstack gap-3"><div><label class="form-label" for="app-username">Username</label> <input id="app-username" class="form-control" type="text"${attr("value", username)} autocomplete="username"/></div> <div><label class="form-label" for="app-password">Password</label> <input id="app-password" class="form-control" type="password"${attr("value", password)} autocomplete="current-password"/></div> `);
      if (store_get($$store_subs ??= {}, "$auth", auth).error) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="alert alert-danger py-2 mb-0">${escape_html(store_get($$store_subs ??= {}, "$auth", auth).error)}</div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="d-flex justify-content-between align-items-center gap-2"><button class="btn btn-outline-primary btn-sm" type="button">${escape_html(store_get($$store_subs ??= {}, "$theme", theme) === "dark" ? "Switch to Light" : "Switch to Dark")}</button> <button class="btn btn-primary" type="submit"${attr("disabled", store_get($$store_subs ??= {}, "$auth", auth).busy || !username, true)}>${escape_html(store_get($$store_subs ??= {}, "$auth", auth).busy ? "Signing In..." : "Sign In")}</button></div></form></div></div></div></main>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<header class="topbar navbar navbar-expand-lg"><div class="container-fluid app-frame px-0 d-flex align-items-center gap-3 flex-wrap justify-content-center"><div class="topbar-brand navbar-brand mb-0 text-center text-lg-start"><div><p class="small text-uppercase text-body-secondary fw-semibold mb-1"><strong>Internal Facing</strong></p></div> <span class="small text-body-secondary">`);
      if (enquiriesActive) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`Enquiries`);
      } else if (editorActive) {
        $$renderer2.push("<!--[1-->");
        $$renderer2.push(`Editor`);
      } else if (viewerActive) {
        $$renderer2.push("<!--[2-->");
        $$renderer2.push(`Viewer`);
      } else if (currentPath.startsWith("/template-builder-v2")) {
        $$renderer2.push("<!--[3-->");
        $$renderer2.push(`Template Builder V2`);
      } else if (templateBuilderActive) {
        $$renderer2.push("<!--[4-->");
        $$renderer2.push(`Template Builder`);
      } else if (setupActive) {
        $$renderer2.push("<!--[5-->");
        $$renderer2.push(`Setup`);
      } else if (bulkImportActive) {
        $$renderer2.push("<!--[6-->");
        $$renderer2.push(`Bulk Actions`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`Overview`);
      }
      $$renderer2.push(`<!--]--></span></div> <nav class="nav nav-underline justify-content-center mx-auto" aria-label="Primary"><a${attr_class(`nav-link ${homeActive ? "active text-body fw-medium" : "text-body-secondary"}`)} href="/"${attr("aria-current", homeActive ? "page" : void 0)}>Home</a> <a${attr_class(`nav-link ${enquiriesActive ? "active text-body fw-medium" : "text-body-secondary"}`)} href="/enquiries"${attr("aria-current", enquiriesActive ? "page" : void 0)}>Enquiries</a> <a${attr_class(`nav-link ${editorActive ? "active text-body fw-medium" : "text-body-secondary"}`)} href="/editor"${attr("aria-current", editorActive ? "page" : void 0)}>Editor</a> <a${attr_class(`nav-link ${viewerActive ? "active text-body fw-medium" : "text-body-secondary"}`)} href="/viewer"${attr("aria-current", viewerActive ? "page" : void 0)}>Viewer</a> <a${attr_class(`nav-link ${templateBuilderActive ? "active text-body fw-medium" : "text-body-secondary"}`)} href="/template-builder"${attr("aria-current", templateBuilderActive ? "page" : void 0)}>Template Builder</a> `);
      if (store_get($$store_subs ??= {}, "$auth", auth).authenticated) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<a${attr_class(`nav-link ${bulkImportActive ? "active text-body fw-medium" : "text-body-secondary"}`)} href="/bulk-actions"${attr("aria-current", bulkImportActive ? "page" : void 0)}>Bulk Actions</a>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <a${attr_class(`nav-link ${setupActive ? "active text-body fw-medium" : "text-body-secondary"}`)} href="/setup"${attr("aria-current", setupActive ? "page" : void 0)}>Setup</a></nav> <div class="d-flex align-items-center gap-2"><span class="small text-body-secondary d-none d-lg-inline">Signed in as ${escape_html(store_get($$store_subs ??= {}, "$auth", auth).username)}</span> <button class="btn btn-outline-primary btn-sm" type="button">${escape_html(store_get($$store_subs ??= {}, "$theme", theme) === "dark" ? "Switch to Light" : "Switch to Dark")}</button> <button class="btn btn-outline-secondary btn-sm" type="button">Sign Out</button></div></div></header> <main class="app-frame py-3"><!--[-->`);
      slot($$renderer2, $$props, "default", {});
      $$renderer2.push(`<!--]--></main>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
