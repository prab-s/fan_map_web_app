import { h as head, b as attr, e as escape_html, d as ensure_array_like, c as attr_class } from "../../../chunks/index2.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let filteredPages, wordCount;
    const starterPages = [
      {
        id: "about",
        label: "About us",
        path: "/about-us",
        type: "Page",
        status: "Published",
        updated: "Today, 9:42 AM",
        headline: "Engineering better air movement",
        intro: "We design and supply ventilation products that make buildings healthier, quieter, and more efficient.",
        body: "Fan Graphs brings practical engineering experience and dependable products together. Our team works with consultants, contractors, and building owners to find the right solution for every project.",
        cta: "Meet the team"
      },
      {
        id: "contact",
        label: "Contact",
        path: "/contact",
        type: "Page",
        status: "Published",
        updated: "Yesterday, 3:18 PM",
        headline: "Let’s talk about your project",
        intro: "Tell us what you are working on and our team will help you find the right next step.",
        body: "For product guidance, project support, or general questions, send us a message. We aim to respond within one business day.",
        cta: "Send an enquiry"
      },
      {
        id: "engineering",
        label: "Engineering services",
        path: "/engineering-services",
        type: "Page",
        status: "Draft",
        updated: "28 Aug 2026",
        headline: "Engineering support that moves projects forward",
        intro: "From early-stage selection to final documentation, we help teams make confident ventilation decisions.",
        body: "Our engineering services include product selection, performance review, application advice, and project-specific documentation. Bring us the constraints and we will help work through the options.",
        cta: "Explore our services"
      },
      {
        id: "projects",
        label: "Past projects",
        path: "/past-projects",
        type: "Page",
        status: "Published",
        updated: "26 Aug 2026",
        headline: "Solutions in the real world",
        intro: "A selection of projects where careful product choices made a measurable difference.",
        body: "Browse examples of our work across commercial, industrial, and specialist environments. Each project reflects close collaboration, considered design, and reliable delivery.",
        cta: "View project stories"
      },
      {
        id: "enquiries-modal",
        label: "Enquiries modal",
        path: "Global component",
        type: "Modal",
        status: "Published",
        updated: "22 Aug 2026",
        headline: "How can we help?",
        intro: "Choose the option that best describes what you need and we’ll route your enquiry to the right person.",
        body: "Keep this message short and welcoming. The form collects the customer’s contact details and any project context they can share.",
        cta: "Continue"
      }
    ];
    let pages = starterPages.map((page) => ({ ...page }));
    let selectedId = "about";
    let draft = { ...pages[0] };
    let saved = true;
    let previewMode = "desktop";
    let search = "";
    let assets = [];
    let uploading = false;
    const aboutProcessDefaults = [
      {
        title: "Listen",
        text: "Understand the application, constraints, and desired outcome."
      },
      {
        title: "Recommend",
        text: "Point customers toward suitable products or services."
      },
      {
        title: "Support",
        text: "Provide documentation, technical context, and practical guidance."
      },
      {
        title: "Follow through",
        text: "Keep communication clear from enquiry through delivery."
      }
    ];
    pages.find((page) => page.id === selectedId) || pages[0];
    pages.find((page) => page.id === "enquiries-modal") || {};
    filteredPages = pages.filter((page) => page.label.toLowerCase().includes(search.trim().toLowerCase()));
    wordCount = (draft.body || "").trim() ? draft.body.trim().split(/\s+/).length : 0;
    head("17dfpeu", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>CMS — Internal Facing</title>`);
      });
    });
    $$renderer2.push(`<div class="cms-page svelte-17dfpeu"><div class="cms-heading svelte-17dfpeu"><div><p class="eyebrow mb-2 svelte-17dfpeu">Content management</p> <div class="d-flex flex-wrap align-items-center gap-3 svelte-17dfpeu"><h1 class="mb-0 svelte-17dfpeu">CMS</h1> <span class="cms-status svelte-17dfpeu"><span class="status-dot svelte-17dfpeu"></span>Site content</span></div> <p class="text-body-secondary mb-0 mt-2">Manage the content that appears across your public-facing pages.</p></div> <div class="d-flex align-items-center gap-2 svelte-17dfpeu">`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <a class="btn btn-outline-primary svelte-17dfpeu" href="/cms-experimental">Try page builder</a> <button class="btn btn-outline-secondary svelte-17dfpeu" type="button"${attr("disabled", saved, true)}>Discard</button> <button class="btn btn-primary svelte-17dfpeu" type="button"${attr("disabled", saved, true)}>${escape_html("Save changes")}</button></div></div> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="alert alert-info">Loading CMS content…</div>`);
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="cms-layout svelte-17dfpeu"><aside class="cms-sidebar card svelte-17dfpeu"><div class="sidebar-top svelte-17dfpeu"><div class="d-flex justify-content-between align-items-center mb-3"><h2 class="h6 mb-0">Site pages</h2> <button class="btn btn-sm btn-outline-primary" type="button">+ New page</button></div> <input class="form-control form-control-sm" type="search"${attr("value", search)} placeholder="Search pages" aria-label="Search pages"/></div> <div class="page-list svelte-17dfpeu"><!--[-->`);
    const each_array = ensure_array_like(filteredPages);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let page = each_array[$$index];
      $$renderer2.push(`<button${attr_class("page-list-item svelte-17dfpeu", void 0, { "active": page.id === selectedId })} type="button"><span class="page-icon svelte-17dfpeu">${escape_html(page.type === "Modal" ? "✦" : "□")}</span> <span class="page-list-copy svelte-17dfpeu"><span class="page-list-label svelte-17dfpeu">${escape_html(page.label)}</span> <span class="page-list-meta svelte-17dfpeu">${escape_html(page.path)}</span></span> <span${attr_class("page-state svelte-17dfpeu", void 0, { "published": page.status === "Published" })}>${escape_html(page.id === "enquiries-modal" ? "Protected" : page.status === "Published" ? "Live" : "Draft")}</span></button>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="sidebar-bottom svelte-17dfpeu"><div class="small text-body-secondary mb-2">Publishing checklist</div> <div class="check-row svelte-17dfpeu"><span class="check-icon svelte-17dfpeu">✓</span> Content is reviewed</div> <div class="check-row svelte-17dfpeu"><span class="check-icon svelte-17dfpeu">✓</span> Preview is available</div></div></aside> <section class="cms-editor"><div class="editor-toolbar svelte-17dfpeu"><div><div class="small text-body-secondary mb-1">Editing ${escape_html(draft.type.toLowerCase())}</div> <h2 class="h4 mb-0">${escape_html(draft.label)}</h2></div> <div class="d-flex align-items-center gap-2 svelte-17dfpeu"><span${attr_class("status-pill svelte-17dfpeu", void 0, { "published": draft.status === "Published" })}>${escape_html(draft.status)}</span> <button class="btn btn-outline-primary btn-sm svelte-17dfpeu" type="button">Preview</button> `);
    if (draft.status !== "Published") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<button class="btn btn-primary btn-sm" type="button">Publish</button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (draft.id !== "enquiries-modal") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<button class="btn btn-outline-danger btn-sm" type="button">Delete</button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> <div class="row g-4 editor-content svelte-17dfpeu"><div class="col-12 col-xl-7"><div class="card editor-card svelte-17dfpeu"><div class="card-body"><div class="d-flex justify-content-between align-items-start mb-4"><div><h3 class="h6 mb-1">Page content</h3><p class="small text-body-secondary mb-0">Update the copy shown on this page.</p></div> <span class="content-badge svelte-17dfpeu">${escape_html(draft.type)}</span></div> <div class="mb-3"><label class="form-label" for="cms-headline">Headline</label> <input id="cms-headline" class="form-control form-control-lg"${attr("value", draft.headline)}/></div> <div class="mb-3"><label class="form-label" for="cms-intro">Introductory copy</label> <textarea id="cms-intro" class="form-control svelte-17dfpeu" rows="3">`);
    const $$body = escape_html(draft.intro);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea> <div class="form-text">The short summary used near the top of the page.</div></div> <div class="mb-3"><div class="d-flex justify-content-between"><label class="form-label" for="cms-body">Body copy</label><span class="small text-body-secondary">${escape_html(wordCount)} words</span></div> <textarea id="cms-body" class="form-control svelte-17dfpeu" rows="9">`);
    const $$body_1 = escape_html(draft.body);
    if ($$body_1) {
      $$renderer2.push(`${$$body_1}`);
    }
    $$renderer2.push(`</textarea></div> <div><label class="form-label" for="cms-cta">Primary button label</label> <input id="cms-cta" class="form-control"${attr("value", draft.cta)}/></div> `);
    if (draft.id === "about-us") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="structured-fields mt-4 svelte-17dfpeu"><h4 class="small text-uppercase text-body-secondary fw-semibold">About Us sections</h4> <div class="row g-3 mb-3"><div class="col-md-6"><label class="form-label" for="cms-about-kicker">Hero label</label><input id="cms-about-kicker" class="form-control"${attr("value", draft.draft_content?.hero_kicker || "")}/></div> <div class="col-md-6"><label class="form-label" for="cms-about-callout-label">Hero callout label</label><input id="cms-about-callout-label" class="form-control"${attr("value", draft.draft_content?.hero_callout_label || "")}/></div></div> <label class="form-label" for="cms-about-callout-text">Hero callout</label> <textarea id="cms-about-callout-text" class="form-control mb-3 svelte-17dfpeu" rows="2">`);
      const $$body_2 = escape_html(draft.draft_content?.hero_callout_text || "");
      if ($$body_2) {
        $$renderer2.push(`${$$body_2}`);
      }
      $$renderer2.push(`</textarea> <label class="form-label" for="cms-about-story-kicker">Story label</label> <input id="cms-about-story-kicker" class="form-control mb-3"${attr("value", draft.draft_content?.story_kicker || "")}/> <label class="form-label" for="cms-about-story-heading">Story heading</label> <input id="cms-about-story-heading" class="form-control mb-3"${attr("value", draft.draft_content?.story_heading || "")}/> <label class="form-label" for="cms-about-story">Story paragraphs</label> <textarea id="cms-about-story" class="form-control mb-3 svelte-17dfpeu" rows="7">`);
      const $$body_3 = escape_html((draft.draft_content?.story_paragraphs || []).join("\n\n"));
      if ($$body_3) {
        $$renderer2.push(`${$$body_3}`);
      }
      $$renderer2.push(`</textarea> <div class="small text-body-secondary mb-2">Stats</div> <!--[-->`);
      const each_array_1 = ensure_array_like(draft.draft_content?.stats || []);
      for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
        let stat = each_array_1[index];
        $$renderer2.push(`<div class="structured-row svelte-17dfpeu"><input class="form-control"${attr("value", stat.value)} aria-label="Stat value"/><input class="form-control"${attr("value", stat.label)} aria-label="Stat label"/></div>`);
      }
      $$renderer2.push(`<!--]--> <div class="small text-body-secondary mt-3 mb-2">Values</div> <!--[-->`);
      const each_array_2 = ensure_array_like(draft.draft_content?.values || []);
      for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
        let item = each_array_2[index];
        $$renderer2.push(`<div class="structured-row structured-row-wide svelte-17dfpeu"><input class="form-control"${attr("value", item.title)} aria-label="Value title"/><textarea class="form-control svelte-17dfpeu" rows="2" aria-label="Value text">`);
        const $$body_4 = escape_html(item.text);
        if ($$body_4) {
          $$renderer2.push(`${$$body_4}`);
        }
        $$renderer2.push(`</textarea></div>`);
      }
      $$renderer2.push(`<!--]--> <div class="small text-body-secondary mt-3 mb-2">Team</div> <input class="form-control mb-2"${attr("value", draft.draft_content?.team_heading || "")} aria-label="Team heading"/> <textarea class="form-control mb-2 svelte-17dfpeu" rows="2" aria-label="Team introduction">`);
      const $$body_5 = escape_html(draft.draft_content?.team_intro || "");
      if ($$body_5) {
        $$renderer2.push(`${$$body_5}`);
      }
      $$renderer2.push(`</textarea> <textarea class="form-control svelte-17dfpeu" rows="3" aria-label="Team members, one per line">`);
      const $$body_6 = escape_html((draft.draft_content?.team_members || []).join("\n"));
      if ($$body_6) {
        $$renderer2.push(`${$$body_6}`);
      }
      $$renderer2.push(`</textarea> <div class="small text-body-secondary mt-3 mb-2">How we help</div> <!--[-->`);
      const each_array_3 = ensure_array_like(draft.draft_content?.process_steps || aboutProcessDefaults);
      for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
        let item = each_array_3[index];
        $$renderer2.push(`<div class="structured-row structured-row-wide svelte-17dfpeu"><input class="form-control"${attr("value", item.title)} aria-label="Process step title"/><textarea class="form-control svelte-17dfpeu" rows="2" aria-label="Process step text">`);
        const $$body_7 = escape_html(item.text);
        if ($$body_7) {
          $$renderer2.push(`${$$body_7}`);
        }
        $$renderer2.push(`</textarea></div>`);
      }
      $$renderer2.push(`<!--]--> <div class="small text-body-secondary mt-3 mb-2">Enquiry CTA</div> <input class="form-control mb-2"${attr("value", draft.draft_content?.cta_heading || "")} aria-label="CTA heading"/> <textarea class="form-control mb-2 svelte-17dfpeu" rows="2" aria-label="CTA text">`);
      const $$body_8 = escape_html(draft.draft_content?.cta_text || "");
      if ($$body_8) {
        $$renderer2.push(`${$$body_8}`);
      }
      $$renderer2.push(`</textarea> <div class="form-text">The CTA opens the independently editable Enquiries modal on the public page.</div></div>`);
    } else if (draft.id === "contact") {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="structured-fields mt-4 svelte-17dfpeu"><h4 class="small text-uppercase text-body-secondary fw-semibold">Contact page sections</h4><div class="row g-3 mb-3"><div class="col-md-6"><label class="form-label">Quote label</label><input class="form-control"${attr("value", draft.draft_content?.quote_label || "")}/></div><div class="col-md-6"><label class="form-label">Contacts label</label><input class="form-control"${attr("value", draft.draft_content?.direct_contacts_label || "")}/></div></div><label class="form-label">Quote description</label><textarea class="form-control mb-3 svelte-17dfpeu" rows="2">`);
      const $$body_9 = escape_html(draft.draft_content?.quote_text || "");
      if ($$body_9) {
        $$renderer2.push(`${$$body_9}`);
      }
      $$renderer2.push(`</textarea><label class="form-label" for="cms-address">Address heading</label><input id="cms-address" class="form-control mb-2"${attr("value", draft.draft_content?.address_heading || "")}/><label class="form-label">Address</label><input class="form-control mb-3"${attr("value", draft.draft_content?.address || "")}/><label class="form-label" for="cms-shopfront">Shop front image</label><input id="cms-shopfront" class="form-control mb-3"${attr("value", draft.draft_content?.shopfront_image || "")}/><div class="small text-body-secondary mb-2">Direct contacts</div><!--[-->`);
      const each_array_4 = ensure_array_like(draft.draft_content?.contacts || []);
      for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
        let contact = each_array_4[index];
        $$renderer2.push(`<div class="structured-row svelte-17dfpeu"><input class="form-control"${attr("value", contact.name)} aria-label="Contact name"/><input class="form-control"${attr("value", contact.role)} aria-label="Contact role"/><input class="form-control"${attr("value", contact.email)} aria-label="Contact email"/><input class="form-control"${attr("value", contact.phone)} aria-label="Contact phone"/></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else if (draft.id === "engineering-services") {
      $$renderer2.push("<!--[2-->");
      $$renderer2.push(`<div class="structured-fields mt-4 svelte-17dfpeu"><h4 class="small text-uppercase text-body-secondary fw-semibold">Engineering sections</h4><label class="form-label">Capabilities label</label><input class="form-control mb-2"${attr("value", draft.draft_content?.capabilities_label || "")}/><label class="form-label">Workshop capabilities, one per line</label><textarea class="form-control mb-3 svelte-17dfpeu" rows="4">`);
      const $$body_10 = escape_html((draft.draft_content?.capabilities || []).join("\n"));
      if ($$body_10) {
        $$renderer2.push(`${$$body_10}`);
      }
      $$renderer2.push(`</textarea><label class="form-label">What we do heading</label><input class="form-control mb-2"${attr("value", draft.draft_content?.what_we_do_heading || "")}/><label class="form-label">What we do paragraphs</label><textarea class="form-control mb-3 svelte-17dfpeu" rows="5">`);
      const $$body_11 = escape_html((draft.draft_content?.what_we_do_paragraphs || []).join("\n\n"));
      if ($$body_11) {
        $$renderer2.push(`${$$body_11}`);
      }
      $$renderer2.push(`</textarea><label class="form-label">Best fit items, one per line</label><textarea class="form-control mb-3 svelte-17dfpeu" rows="3">`);
      const $$body_12 = escape_html((draft.draft_content?.best_fit || []).join("\n"));
      if ($$body_12) {
        $$renderer2.push(`${$$body_12}`);
      }
      $$renderer2.push(`</textarea><h4 class="small text-uppercase text-body-secondary fw-semibold">Service images</h4><!--[-->`);
      const each_array_5 = ensure_array_like(draft.draft_content?.services || []);
      for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
        let service = each_array_5[index];
        $$renderer2.push(`<div class="structured-row svelte-17dfpeu"><span class="small fw-semibold align-self-center svelte-17dfpeu">${escape_html(service.title)}</span><input class="form-control"${attr("value", service.image)}${attr("aria-label", `${service.title} image URL`)}/></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else if (draft.id === "past-projects") {
      $$renderer2.push("<!--[3-->");
      $$renderer2.push(`<div class="structured-fields mt-4 svelte-17dfpeu"><h4 class="small text-uppercase text-body-secondary fw-semibold">Project page sections</h4><div class="row g-3 mb-3"><div class="col-md-6"><label class="form-label">Carousel label</label><input class="form-control"${attr("value", draft.draft_content?.carousel_label || "")}/></div><div class="col-md-6"><label class="form-label">Carousel heading</label><input class="form-control"${attr("value", draft.draft_content?.carousel_heading || "")}/></div></div><label class="form-label">Carousel intro</label><textarea class="form-control mb-3 svelte-17dfpeu" rows="2">`);
      const $$body_13 = escape_html(draft.draft_content?.carousel_intro || "");
      if ($$body_13) {
        $$renderer2.push(`${$$body_13}`);
      }
      $$renderer2.push(`</textarea><div class="row g-3"><div class="col-md-4"><label class="form-label">Snapshots</label><textarea class="form-control svelte-17dfpeu" rows="4">`);
      const $$body_14 = escape_html(`${draft.draft_content?.snapshot_heading || ""}
${draft.draft_content?.snapshot_text || ""}`);
      if ($$body_14) {
        $$renderer2.push(`${$$body_14}`);
      }
      $$renderer2.push(`</textarea></div><div class="col-md-4"><label class="form-label">Industries</label><textarea class="form-control svelte-17dfpeu" rows="4">`);
      const $$body_15 = escape_html(`${draft.draft_content?.industries_heading || ""}
${draft.draft_content?.industries_text || ""}`);
      if ($$body_15) {
        $$renderer2.push(`${$$body_15}`);
      }
      $$renderer2.push(`</textarea></div><div class="col-md-4"><label class="form-label">Details</label><textarea class="form-control svelte-17dfpeu" rows="4">`);
      const $$body_16 = escape_html(`${draft.draft_content?.details_heading || ""}
${draft.draft_content?.details_text || ""}`);
      if ($$body_16) {
        $$renderer2.push(`${$$body_16}`);
      }
      $$renderer2.push(`</textarea></div></div><h4 class="small text-uppercase text-body-secondary fw-semibold mt-3">Project images</h4><!--[-->`);
      const each_array_6 = ensure_array_like(draft.draft_content?.projects || []);
      for (let index = 0, $$length = each_array_6.length; index < $$length; index++) {
        let project = each_array_6[index];
        $$renderer2.push(`<div class="structured-row svelte-17dfpeu"><span class="small fw-semibold align-self-center svelte-17dfpeu">${escape_html(project.label)}</span><input class="form-control"${attr("value", project.image)}${attr("aria-label", `${project.label} image URL`)}/></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else if (draft.id === "enquiries-modal") {
      $$renderer2.push("<!--[4-->");
      $$renderer2.push(`<div class="structured-fields mt-4 svelte-17dfpeu"><h4 class="small text-uppercase text-body-secondary fw-semibold">Modal fields</h4><div class="row g-3 mb-3"><div class="col-md-6"><label class="form-label">Kicker</label><input class="form-control"${attr("value", draft.draft_content?.kicker || "")}/></div><div class="col-md-6"><label class="form-label">Request heading</label><input class="form-control"${attr("value", draft.draft_content?.request_heading || "")}/></div></div><label class="form-label">Request help</label><textarea class="form-control mb-3 svelte-17dfpeu" rows="2">`);
      const $$body_17 = escape_html(draft.draft_content?.request_help || "");
      if ($$body_17) {
        $$renderer2.push(`${$$body_17}`);
      }
      $$renderer2.push(`</textarea><div class="row g-3 mb-3"><!--[-->`);
      const each_array_7 = ensure_array_like([
        ["name_label", "Name label"],
        ["company_label", "Company label"],
        ["email_label", "Email label"],
        ["phone_label", "Phone label"]
      ]);
      for (let $$index_7 = 0, $$length = each_array_7.length; $$index_7 < $$length; $$index_7++) {
        let field = each_array_7[$$index_7];
        $$renderer2.push(`<div class="col-md-6"><label class="form-label">${escape_html(field[1])}</label><input class="form-control"${attr("value", draft.draft_content?.[field[0]] || "")}/></div>`);
      }
      $$renderer2.push(`<!--]--></div><h4 class="small text-uppercase text-body-secondary fw-semibold">Enquiry options</h4><!--[-->`);
      const each_array_8 = ensure_array_like(draft.draft_content?.request_options || []);
      for (let index = 0, $$length = each_array_8.length; index < $$length; index++) {
        let option = each_array_8[index];
        $$renderer2.push(`<div class="structured-row svelte-17dfpeu"><input class="form-control"${attr("value", option.title)}${attr("aria-label", `${option.value} option title`)}/><textarea class="form-control svelte-17dfpeu" rows="2"${attr("aria-label", `${option.value} option description`)}>`);
        const $$body_18 = escape_html(option.text);
        if ($$body_18) {
          $$renderer2.push(`${$$body_18}`);
        }
        $$renderer2.push(`</textarea></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> <div class="card editor-card mt-3 svelte-17dfpeu"><div class="card-body"><h3 class="h6 mb-1">Page settings</h3> <p class="small text-body-secondary mb-3">These settings help keep the page discoverable and consistent.</p> <div class="row g-3"><div class="col-md-7"><label class="form-label" for="cms-path">Page path</label><input id="cms-path" class="form-control"${attr("value", draft.path)} disabled=""/></div> <div class="col-md-5"><label class="form-label" for="cms-type">Content type</label><input id="cms-type" class="form-control"${attr("value", draft.type)} disabled=""/></div></div></div></div> <div class="card editor-card mt-3 svelte-17dfpeu"><div class="card-body"><div class="d-flex justify-content-between align-items-start gap-3 mb-3"><div><h3 class="h6 mb-1">SEO</h3><p class="small text-body-secondary mb-0">Shown in search results and browser tabs.</p></div><span class="content-badge svelte-17dfpeu">Metadata</span></div> <div class="mb-3"><label class="form-label" for="cms-seo-title">SEO title</label><input id="cms-seo-title" class="form-control"${attr("value", draft.draft_seo?.title || "")}/></div> <div><label class="form-label" for="cms-seo-description">Meta description</label><textarea id="cms-seo-description" class="form-control svelte-17dfpeu" rows="3">`);
    const $$body_19 = escape_html(draft.draft_seo?.description || "");
    if ($$body_19) {
      $$renderer2.push(`${$$body_19}`);
    }
    $$renderer2.push(`</textarea></div></div></div> <div class="card editor-card mt-3 svelte-17dfpeu"><div class="card-body"><div class="d-flex justify-content-between align-items-start gap-3 mb-3"><div><h3 class="h6 mb-1">Media library</h3><p class="small text-body-secondary mb-0">Uploaded CMS images are marked by where they are used.</p></div><label class="btn btn-outline-primary btn-sm mb-0">${escape_html("Upload image")}<input class="visually-hidden" type="file" accept="image/*"${attr("disabled", uploading, true)}/></label></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (assets.length) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="asset-list svelte-17dfpeu"><!--[-->`);
      const each_array_9 = ensure_array_like(assets);
      for (let $$index_9 = 0, $$length = each_array_9.length; $$index_9 < $$length; $$index_9++) {
        let asset = each_array_9[$$index_9];
        $$renderer2.push(`<div class="asset-row svelte-17dfpeu"><img${attr("src", asset.url)} alt="" class="svelte-17dfpeu"/><div class="asset-copy svelte-17dfpeu"><strong class="svelte-17dfpeu">${escape_html(asset.original_file_name)}</strong><span class="svelte-17dfpeu">${escape_html(asset.used_by?.length ? `In use · ${asset.used_by.join(", ")}` : "Unused")}</span></div>`);
        {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]-->`);
        if (!asset.used_by?.length) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<button class="btn btn-outline-danger btn-sm" type="button">Delete</button>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<p class="small text-body-secondary mb-0">No CMS images uploaded yet.</p>`);
    }
    $$renderer2.push(`<!--]--></div></div></div> <div class="col-12 col-xl-5"><div class="preview-panel svelte-17dfpeu"><div class="preview-header svelte-17dfpeu"><div><span class="small text-body-secondary d-block mb-1">Live preview</span><strong>${escape_html(draft.path)}</strong></div> <div class="preview-switcher svelte-17dfpeu" role="group" aria-label="Preview size"><button type="button" aria-label="Desktop preview"${attr_class("svelte-17dfpeu", void 0, { "active": previewMode === "desktop" })}>▭</button> <button type="button" aria-label="Mobile preview"${attr_class("svelte-17dfpeu", void 0, { "active": previewMode === "mobile" })}>▯</button></div></div> <div${attr_class("preview-stage svelte-17dfpeu", void 0, { "mobile-preview": previewMode === "mobile" })}><div${attr_class("site-preview svelte-17dfpeu", void 0, { "about-preview": draft.id === "about-us" })}><div class="site-preview-nav svelte-17dfpeu"><span class="preview-logo svelte-17dfpeu">Fan Graphs</span><span>Products</span><span>Services</span><span>About</span><span class="preview-nav-cta svelte-17dfpeu">Contact</span></div> `);
    if (draft.id === "about-us") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="about-preview-hero svelte-17dfpeu"><div><span class="preview-kicker svelte-17dfpeu">${escape_html(draft.draft_content?.hero_kicker || draft.label)}</span><h3 class="svelte-17dfpeu">${escape_html(draft.headline)}</h3><p class="svelte-17dfpeu">${escape_html(draft.intro)}</p></div><div class="about-preview-callout svelte-17dfpeu"><strong class="svelte-17dfpeu">${escape_html(draft.draft_content?.hero_callout_label || "Placeholder note")}</strong><span class="svelte-17dfpeu">${escape_html(draft.draft_content?.hero_callout_text || "")}</span></div></div> <div class="about-preview-section about-preview-split svelte-17dfpeu"><div><span class="preview-section-kicker svelte-17dfpeu">${escape_html(draft.draft_content?.story_kicker || "Our story")}</span><h4 class="svelte-17dfpeu">${escape_html(draft.draft_content?.story_heading || "")}</h4><!--[-->`);
      const each_array_10 = ensure_array_like(draft.draft_content?.story_paragraphs || []);
      for (let $$index_10 = 0, $$length = each_array_10.length; $$index_10 < $$length; $$index_10++) {
        let paragraph = each_array_10[$$index_10];
        $$renderer2.push(`<p class="svelte-17dfpeu">${escape_html(paragraph)}</p>`);
      }
      $$renderer2.push(`<!--]--></div><div class="about-preview-stats svelte-17dfpeu"><span class="preview-section-kicker svelte-17dfpeu">At a glance</span><div class="svelte-17dfpeu"><!--[-->`);
      const each_array_11 = ensure_array_like(draft.draft_content?.stats || []);
      for (let $$index_11 = 0, $$length = each_array_11.length; $$index_11 < $$length; $$index_11++) {
        let stat = each_array_11[$$index_11];
        $$renderer2.push(`<strong class="svelte-17dfpeu">${escape_html(stat.value)}<small class="svelte-17dfpeu">${escape_html(stat.label)}</small></strong>`);
      }
      $$renderer2.push(`<!--]--></div></div></div> <div class="about-preview-section svelte-17dfpeu"><span class="preview-section-kicker svelte-17dfpeu">What matters to us</span><h4 class="svelte-17dfpeu">${escape_html(draft.draft_content?.values_heading || "Placeholder values for the team")}</h4><div class="about-preview-cards svelte-17dfpeu"><!--[-->`);
      const each_array_12 = ensure_array_like(draft.draft_content?.values || []);
      for (let index = 0, $$length = each_array_12.length; index < $$length; index++) {
        let item = each_array_12[index];
        $$renderer2.push(`<article class="svelte-17dfpeu"><b class="svelte-17dfpeu">${escape_html(String(index + 1).padStart(2, "0"))}</b><strong class="svelte-17dfpeu">${escape_html(item.title)}</strong><span class="svelte-17dfpeu">${escape_html(item.text)}</span></article>`);
      }
      $$renderer2.push(`<!--]--></div></div> <div class="about-preview-section about-preview-split svelte-17dfpeu"><div><span class="preview-section-kicker svelte-17dfpeu">Our team</span><h4 class="svelte-17dfpeu">${escape_html(draft.draft_content?.team_heading || "")}</h4><p class="svelte-17dfpeu">${escape_html(draft.draft_content?.team_intro || "")}</p><!--[-->`);
      const each_array_13 = ensure_array_like(draft.draft_content?.team_members || []);
      for (let $$index_13 = 0, $$length = each_array_13.length; $$index_13 < $$length; $$index_13++) {
        let member = each_array_13[$$index_13];
        $$renderer2.push(`<span class="about-preview-member svelte-17dfpeu">${escape_html(member)}</span>`);
      }
      $$renderer2.push(`<!--]--></div><div><span class="preview-section-kicker svelte-17dfpeu">How we help</span><h4 class="svelte-17dfpeu">From the first question to the finished solution</h4><div class="about-preview-process svelte-17dfpeu"><!--[-->`);
      const each_array_14 = ensure_array_like(draft.draft_content?.process_steps || aboutProcessDefaults);
      for (let index = 0, $$length = each_array_14.length; index < $$length; index++) {
        let item = each_array_14[index];
        $$renderer2.push(`<article class="svelte-17dfpeu"><b class="svelte-17dfpeu">${escape_html(String(index + 1).padStart(2, "0"))}</b><span><strong class="svelte-17dfpeu">${escape_html(item.title)}</strong>${escape_html(item.text)}</span></article>`);
      }
      $$renderer2.push(`<!--]--></div></div></div> <div class="about-preview-cta svelte-17dfpeu"><div><span class="preview-section-kicker svelte-17dfpeu">Start a conversation</span><h4>${escape_html(draft.draft_content?.cta_heading || "Have a question about a product, project, or custom requirement?")}</h4><p class="svelte-17dfpeu">${escape_html(draft.draft_content?.cta_text || "")}</p></div><button type="button" class="svelte-17dfpeu">${escape_html(draft.cta || "Contact us")} <span class="svelte-17dfpeu">→</span></button></div>`);
    } else if (draft.id === "contact") {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="preview-plain-section preview-contact-hero svelte-17dfpeu"><div><span class="preview-section-kicker svelte-17dfpeu">${escape_html(draft.draft_content?.hero_kicker || draft.label)}</span><h3 class="svelte-17dfpeu">${escape_html(draft.headline)}</h3><p class="svelte-17dfpeu">${escape_html(draft.intro)}</p></div><div class="preview-light-callout svelte-17dfpeu"><span class="svelte-17dfpeu">${escape_html(draft.draft_content?.quote_label || "Request a quote")}</span><p class="svelte-17dfpeu">${escape_html(draft.draft_content?.quote_text || "")}</p><button type="button" class="svelte-17dfpeu">${escape_html(draft.cta || "Enquire")}</button></div></div> <div class="preview-card-grid preview-contact-grid svelte-17dfpeu"><article class="svelte-17dfpeu"><span class="preview-section-kicker svelte-17dfpeu">Address</span><strong class="svelte-17dfpeu">${escape_html(draft.draft_content?.address_heading || "Vent-Tech 2018 Ltd.")}</strong><span class="svelte-17dfpeu">${escape_html(draft.draft_content?.address || "")}</span>`);
      if (draft.draft_content?.shopfront_image) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<img${attr("src", draft.draft_content.shopfront_image)} alt="Shop front" class="svelte-17dfpeu"/>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></article><article class="svelte-17dfpeu"><span class="preview-section-kicker svelte-17dfpeu">${escape_html(draft.draft_content?.direct_contacts_label || "Direct contacts")}</span><div class="preview-contact-list svelte-17dfpeu"><!--[-->`);
      const each_array_15 = ensure_array_like(draft.draft_content?.contacts || []);
      for (let $$index_15 = 0, $$length = each_array_15.length; $$index_15 < $$length; $$index_15++) {
        let contact = each_array_15[$$index_15];
        $$renderer2.push(`<div class="svelte-17dfpeu"><strong class="svelte-17dfpeu">${escape_html(contact.name)}</strong><small class="svelte-17dfpeu">${escape_html(contact.role)}</small><span class="svelte-17dfpeu">${escape_html(contact.email)}</span><span class="svelte-17dfpeu">${escape_html(contact.phone)}</span></div>`);
      }
      $$renderer2.push(`<!--]--></div></article></div>`);
    } else if (draft.id === "engineering-services") {
      $$renderer2.push("<!--[2-->");
      $$renderer2.push(`<div class="preview-plain-section preview-contact-hero svelte-17dfpeu"><div><span class="preview-section-kicker svelte-17dfpeu">${escape_html(draft.draft_content?.hero_kicker || draft.label)}</span><h3 class="svelte-17dfpeu">${escape_html(draft.headline)}</h3><p class="svelte-17dfpeu">${escape_html(draft.intro)}</p></div><div class="preview-light-callout svelte-17dfpeu"><span class="svelte-17dfpeu">${escape_html(draft.draft_content?.capabilities_label || "Workshop capabilities")}</span><!--[-->`);
      const each_array_16 = ensure_array_like(draft.draft_content?.capabilities || []);
      for (let index = 0, $$length = each_array_16.length; index < $$length; index++) {
        let item = each_array_16[index];
        $$renderer2.push(`<small class="svelte-17dfpeu"><b class="svelte-17dfpeu">${escape_html(String(index + 1).padStart(2, "0"))}</b>${escape_html(item)}</small>`);
      }
      $$renderer2.push(`<!--]--><button type="button" class="svelte-17dfpeu">Enquire</button></div></div> <div class="preview-plain-section preview-engineering-intro svelte-17dfpeu"><article class="svelte-17dfpeu"><span class="preview-section-kicker svelte-17dfpeu">What we do</span><h4 class="svelte-17dfpeu">${escape_html(draft.draft_content?.what_we_do_heading || "")}</h4><!--[-->`);
      const each_array_17 = ensure_array_like(draft.draft_content?.what_we_do_paragraphs || []);
      for (let $$index_17 = 0, $$length = each_array_17.length; $$index_17 < $$length; $$index_17++) {
        let paragraph = each_array_17[$$index_17];
        $$renderer2.push(`<p class="svelte-17dfpeu">${escape_html(paragraph)}</p>`);
      }
      $$renderer2.push(`<!--]--></article><article class="svelte-17dfpeu"><span class="preview-section-kicker svelte-17dfpeu">Best fit for</span><!--[-->`);
      const each_array_18 = ensure_array_like(draft.draft_content?.best_fit || []);
      for (let $$index_18 = 0, $$length = each_array_18.length; $$index_18 < $$length; $$index_18++) {
        let item = each_array_18[$$index_18];
        $$renderer2.push(`<span class="preview-list-item svelte-17dfpeu">${escape_html(item)}</span>`);
      }
      $$renderer2.push(`<!--]--></article></div> <div class="preview-service-grid svelte-17dfpeu"><!--[-->`);
      const each_array_19 = ensure_array_like(draft.draft_content?.services || []);
      for (let $$index_19 = 0, $$length = each_array_19.length; $$index_19 < $$length; $$index_19++) {
        let service = each_array_19[$$index_19];
        $$renderer2.push(`<article class="svelte-17dfpeu">`);
        if (service.image) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<img${attr("src", service.image)} alt="" class="svelte-17dfpeu"/>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--><span class="preview-section-kicker svelte-17dfpeu">${escape_html(service.title)}</span><strong class="svelte-17dfpeu">${escape_html(service.title)}</strong><p class="svelte-17dfpeu">${escape_html(service.summary)}</p><small class="svelte-17dfpeu">${escape_html((service.points || []).join(" · "))}</small></article>`);
      }
      $$renderer2.push(`<!--]--></div> <div class="preview-plain-section preview-contact-hero preview-custom svelte-17dfpeu"><div><span class="preview-section-kicker svelte-17dfpeu">Custom design</span><h4>${escape_html(draft.draft_content?.custom_heading || "")}</h4><!--[-->`);
      const each_array_20 = ensure_array_like(draft.draft_content?.custom_paragraphs || []);
      for (let $$index_20 = 0, $$length = each_array_20.length; $$index_20 < $$length; $$index_20++) {
        let paragraph = each_array_20[$$index_20];
        $$renderer2.push(`<p class="svelte-17dfpeu">${escape_html(paragraph)}</p>`);
      }
      $$renderer2.push(`<!--]--></div><div class="preview-light-callout svelte-17dfpeu"><span class="svelte-17dfpeu">Start a tailored enquiry</span><p class="svelte-17dfpeu">Use the enquiry form to send through your custom design or fabrication brief.</p><button type="button" class="svelte-17dfpeu">${escape_html(draft.cta || "Tell us about your project")}</button></div></div>`);
    } else if (draft.id === "past-projects") {
      $$renderer2.push("<!--[3-->");
      $$renderer2.push(`<div class="preview-plain-section preview-contact-hero svelte-17dfpeu"><div><span class="preview-section-kicker svelte-17dfpeu">${escape_html(draft.draft_content?.hero_kicker || draft.label)}</span><h3 class="svelte-17dfpeu">${escape_html(draft.headline)}</h3><p class="svelte-17dfpeu">${escape_html(draft.intro)}</p></div><div class="preview-light-callout svelte-17dfpeu"><span class="svelte-17dfpeu">${escape_html(draft.draft_content?.hero_callout_label || "Coming soon")}</span><p class="svelte-17dfpeu">${escape_html(draft.draft_content?.hero_callout_text || "")}</p></div></div> <div class="preview-projects svelte-17dfpeu"><div class="preview-projects-heading svelte-17dfpeu"><div><span class="preview-section-kicker svelte-17dfpeu">${escape_html(draft.draft_content?.carousel_label || "Project collage")}</span><h4 class="svelte-17dfpeu">${escape_html(draft.draft_content?.carousel_heading || "")}</h4></div><small class="svelte-17dfpeu">${escape_html(draft.draft_content?.carousel_intro || "")}</small></div><div class="preview-project-grid svelte-17dfpeu"><!--[-->`);
      const each_array_21 = ensure_array_like(draft.draft_content?.projects || []);
      for (let $$index_21 = 0, $$length = each_array_21.length; $$index_21 < $$length; $$index_21++) {
        let project = each_array_21[$$index_21];
        $$renderer2.push(`<article class="svelte-17dfpeu"><img${attr("src", project.image)} alt="" class="svelte-17dfpeu"/><strong class="svelte-17dfpeu">${escape_html(project.label)}</strong><span class="svelte-17dfpeu">${escape_html(project.text)}</span></article>`);
      }
      $$renderer2.push(`<!--]--></div></div> <div class="preview-card-grid preview-project-summaries svelte-17dfpeu"><!--[-->`);
      const each_array_22 = ensure_array_like([
        {
          kicker: "Project snapshots",
          heading: draft.draft_content?.snapshot_heading,
          text: draft.draft_content?.snapshot_text
        },
        {
          kicker: "Industries served",
          heading: draft.draft_content?.industries_heading,
          text: draft.draft_content?.industries_text
        },
        {
          kicker: "What to show",
          heading: draft.draft_content?.details_heading,
          text: draft.draft_content?.details_text
        }
      ]);
      for (let $$index_22 = 0, $$length = each_array_22.length; $$index_22 < $$length; $$index_22++) {
        let item = each_array_22[$$index_22];
        $$renderer2.push(`<article class="svelte-17dfpeu"><span class="preview-section-kicker svelte-17dfpeu">${escape_html(item.kicker)}</span><strong class="svelte-17dfpeu">${escape_html(item.heading || "")}</strong><span class="svelte-17dfpeu">${escape_html(item.text || "")}</span></article>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else if (draft.id === "enquiries-modal") {
      $$renderer2.push("<!--[4-->");
      $$renderer2.push(`<div class="preview-enquiry-modal svelte-17dfpeu"><span class="preview-section-kicker svelte-17dfpeu">${escape_html(draft.draft_content?.kicker || "Enquiries")}</span><h3>${escape_html(draft.headline)}</h3><p class="svelte-17dfpeu">${escape_html(draft.intro)}</p><div class="preview-form-grid svelte-17dfpeu"><span class="svelte-17dfpeu">${escape_html(draft.draft_content?.name_label || "Name")}</span><span class="svelte-17dfpeu">${escape_html(draft.draft_content?.company_label || "Company")}</span><span class="svelte-17dfpeu">${escape_html(draft.draft_content?.email_label || "Email")}</span><span class="svelte-17dfpeu">${escape_html(draft.draft_content?.phone_label || "Phone number")}</span></div><h4 class="svelte-17dfpeu">${escape_html(draft.draft_content?.request_heading || "How should we quote this?")}</h4><p class="svelte-17dfpeu">${escape_html(draft.draft_content?.request_help || "")}</p><div class="preview-enquiry-options svelte-17dfpeu"><!--[-->`);
      const each_array_23 = ensure_array_like(draft.draft_content?.request_options || []);
      for (let $$index_23 = 0, $$length = each_array_23.length; $$index_23 < $$length; $$index_23++) {
        let option = each_array_23[$$index_23];
        $$renderer2.push(`<article class="svelte-17dfpeu"><strong class="svelte-17dfpeu">${escape_html(option.title)}</strong><span class="svelte-17dfpeu">${escape_html(option.text)}</span></article>`);
      }
      $$renderer2.push(`<!--]--></div><button type="button" class="svelte-17dfpeu">${escape_html(draft.cta || "Send enquiry")}</button></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="preview-hero svelte-17dfpeu"><span class="preview-kicker svelte-17dfpeu">${escape_html(draft.label)}</span><h3 class="svelte-17dfpeu">${escape_html(draft.headline)}</h3><p class="svelte-17dfpeu">${escape_html(draft.intro)}</p><button type="button" class="svelte-17dfpeu">${escape_html(draft.cta)} <span class="svelte-17dfpeu">→</span></button></div><div class="preview-body svelte-17dfpeu"><p>${escape_html(draft.body)}</p><div class="preview-lines svelte-17dfpeu"><span class="svelte-17dfpeu"></span><span class="svelte-17dfpeu"></span><span class="svelte-17dfpeu"></span></div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="preview-footer svelte-17dfpeu"><span>Preview updates as you type</span><span class="preview-secure svelte-17dfpeu">⌁ Public site</span></div></div></div></div></section></div></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
