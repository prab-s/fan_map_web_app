const form = document.querySelector("#finder-form");
const results = document.querySelector("#finder-results");
const seriesHost = document.querySelector("#series-filter");
const mainHost = document.querySelector("#main-filters");
const advancedHost = document.querySelector("#advanced-filters");
const advancedToggle = document.querySelector("#advanced-toggle");
const resetButton = document.querySelector("#reset-filters");
const loading = document.querySelector("#finder-loading");
const typeSelect = form?.querySelector('[name="product_type_key"]');

let metadata = { groups: [], series: [] };
let requestId = 0;

function setLoading(value) {
  loading?.classList.toggle("d-none", !value);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function labelFor(parameter) {
  const unit = parameter.unit ? ` (${parameter.unit})` : "";
  return `${parameter.parameter_name}${unit}`;
}

function filterMarkup(group, parameter) {
  const key = `${group.group_name}::${parameter.parameter_name}`;
  const values = parameter.string_values || [];
  if (parameter.kind === "select") {
    return `<div class="mb-3"><label class="form-label">${escapeHtml(labelFor(parameter))}</label>` +
      `<select class="form-select finder-filter-input" data-group="${escapeHtml(group.group_name)}" data-parameter="${escapeHtml(parameter.parameter_name)}" data-kind="select" data-filter-key="${escapeHtml(key)}">` +
      `<option value="">-- select option --</option>` +
      values.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("") +
      `</select></div>`;
  }

  const bounds = parameter.range_min != null && parameter.range_max != null
    ? ` placeholder="${escapeHtml(parameter.range_min)}–${escapeHtml(parameter.range_max)}"`
    : "";
  return `<div class="mb-3"><label class="form-label">${escapeHtml(labelFor(parameter))}</label>` +
    `<input class="form-control finder-filter-value" type="number" step="any" inputmode="decimal" data-group="${escapeHtml(group.group_name)}" data-parameter="${escapeHtml(parameter.parameter_name)}" data-kind="range" data-filter-key="${escapeHtml(key)}"${bounds}>` +
    `</div>`;
}

function renderMetadata() {
  if (!mainHost || !advancedHost || !seriesHost) return;
  const groups = (metadata.groups || []).filter(group => group.group_name !== "__graph__");
  const graph = (metadata.groups || []).find(group => group.group_name === "__graph__");

  // Keep complete specification groups together so their headings remain
  // meaningful and a group is never split between the two filter sections.
  const mainGroups = [];
  const advancedGroups = [];
  let mainParameterCount = 0;
  for (const group of groups) {
    if (mainParameterCount < 6 || mainGroups.length === 0) {
      mainGroups.push(group);
      mainParameterCount += (group.parameters || []).length;
    } else {
      advancedGroups.push(group);
    }
  }
  // Performance filters are core fan-selection inputs, so keep RPM, Airflow,
  // and Pressure visible without requiring the user to open Advanced.
  if (graph) mainGroups.unshift(graph);

  const renderGroup = group => {
    const heading = group.group_name === "__graph__" ? "Performance" : group.group_name;
    return `<section class="finder-filter-group mb-4"><h3 class="h6 text-uppercase text-muted fw-semibold border-bottom pb-2 mb-3">${escapeHtml(heading)}</h3>` +
    (group.parameters || []).map(parameter => filterMarkup(group, parameter)).join("") +
    `</section>`;
  };

  mainHost.innerHTML = mainGroups.map(renderGroup).join("");
  advancedHost.innerHTML = advancedGroups.map(renderGroup).join("");
  advancedToggle?.classList.toggle("d-none", advancedHost.children.length === 0);
  if (advancedHost.children.length === 0) advancedHost.classList.add("d-none");

  if ((metadata.series || []).length) {
    seriesHost.classList.remove("d-none");
    seriesHost.innerHTML = `<div class="mb-3"><label class="form-label">Series</label><select class="form-select finder-filter-series" name="series_id"><option value="">-- select option --</option>${metadata.series.map(series => `<option value="${escapeHtml(series.id)}">${escapeHtml(series.name)} (${series.product_count})</option>`).join("")}</select></div>`;
  } else {
    seriesHost.classList.add("d-none");
    seriesHost.innerHTML = "";
  }
}

function selectedFilters() {
  const byKey = new Map();
  form?.querySelectorAll("[data-filter-key]").forEach(input => {
    const key = input.dataset.filterKey;
    const item = byKey.get(key) || { group_name: input.dataset.group, parameter_name: input.dataset.parameter };
    if (input.dataset.kind === "select" && input.value) item.value_string = input.value;
    if (input.classList.contains("finder-filter-value") && input.value) {
      const value = Number(input.value);
      item.min_number = value;
      item.max_number = value;
    }
    byKey.set(key, item);
  });
  return [...byKey.values()].filter(item => item.value_string || item.min_number != null || item.max_number != null);
}

function queryParams() {
  const params = new URLSearchParams();
  const type = typeSelect?.value || "";
  const search = form?.querySelector('[name="search"]')?.value || "";
  const series = form?.querySelector('[name="series_id"]')?.value || "";
  if (type) params.set("product_type_key", type);
  if (search) params.set("search", search);
  if (series) params.set("series_id", series);
  const filters = selectedFilters();
  if (filters.length) params.set("parameter_filters", JSON.stringify(filters));
  return params;
}

async function updateResults() {
  if (!form || !results) return;
  const current = ++requestId;
  setLoading(true);
  try {
    const response = await fetch(`/finder/results?${queryParams()}`);
    if (!response.ok) throw new Error("Results request failed");
    if (current === requestId) results.innerHTML = await response.text();
  } catch (_error) {
    if (current === requestId) results.innerHTML = '<div class="alert alert-warning border mb-0">Unable to load matching products right now.</div>';
  } finally {
    if (current === requestId) setLoading(false);
  }
}

async function loadMetadata() {
  if (!typeSelect?.value) {
    metadata = { groups: [], series: [] };
    renderMetadata();
    return;
  }
  setLoading(true);
  try {
    const response = await fetch(`/finder/metadata?product_type_key=${encodeURIComponent(typeSelect.value)}`);
    if (!response.ok) throw new Error("Metadata request failed");
    metadata = await response.json();
    renderMetadata();
  } catch (_error) {
    metadata = { groups: [], series: [] };
    renderMetadata();
  } finally {
    setLoading(false);
  }
}

typeSelect?.addEventListener("change", async () => { await loadMetadata(); await updateResults(); });
form?.addEventListener("change", event => { if (event.target !== typeSelect) updateResults(); });
form?.addEventListener("input", () => { clearTimeout(window.finderTimer); window.finderTimer = setTimeout(updateResults, 250); });
advancedToggle?.addEventListener("click", () => {
  advancedHost?.classList.toggle("d-none");
  advancedToggle.textContent = advancedHost?.classList.contains("d-none") ? "Advanced" : "Hide advanced";
});
resetButton?.addEventListener("click", async () => {
  form?.reset();
  metadata = { groups: [], series: [] };
  renderMetadata();
  await updateResults();
});

loadMetadata().then(updateResults);
