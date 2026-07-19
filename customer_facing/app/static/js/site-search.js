(() => {
  const dialog = document.querySelector("[data-site-search-dialog]");
  const openButton = document.querySelector("[data-site-search-open]");
  const closeButton = dialog?.querySelector("[data-site-search-close]");
  const form = dialog?.querySelector("[data-site-search-form]");
  const input = dialog?.querySelector("[data-site-search-input]");
  const status = dialog?.querySelector("[data-site-search-status]");
  const results = dialog?.querySelector("[data-site-search-results]");
  if (!dialog || !openButton || !form || !input || !status || !results) return;

  const setOpen = (open) => {
    dialog.classList.toggle("d-none", !open);
    openButton.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("site-search-open", open);
    if (open) window.setTimeout(() => input.focus(), 0);
  };

  openButton.addEventListener("click", () => setOpen(true));
  closeButton?.addEventListener("click", () => setOpen(false));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dialog.classList.contains("d-none")) setOpen(false);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const query = input.value.trim();
    if (!query) {
      results.innerHTML = "";
      status.textContent = "Enter a model, series, or product type.";
      return;
    }

    status.textContent = "Searching…";
    results.innerHTML = "";
    try {
      const response = await fetch(`/finder/results?search=${encodeURIComponent(query)}`, {
        headers: { Accept: "text/html" },
      });
      if (!response.ok) throw new Error("Search failed");
      results.innerHTML = await response.text();
      status.textContent = "Search results";
    } catch (_error) {
      status.textContent = "Search is unavailable right now. Please try again.";
    }
  });
})();
