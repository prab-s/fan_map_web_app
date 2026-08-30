import { e as escape_html, d as ensure_array_like, i as bind_props } from "./index2.js";
import { f as fallback } from "./equality.js";
function SeriesNamesBadgeList($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let seriesNames = fallback($$props["seriesNames"], () => [], true);
    let title = fallback($$props["title"], "Series names");
    let emptyLabel = fallback($$props["emptyLabel"], "No series names available.");
    $$renderer2.push(`<div class="card shadow-sm"><div class="card-body"><h3 class="h6 mb-3">${escape_html(title)}</h3> `);
    if (seriesNames?.length) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="d-flex flex-wrap gap-2"><!--[-->`);
      const each_array = ensure_array_like(seriesNames);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let seriesName = each_array[$$index];
        $$renderer2.push(`<span class="badge text-bg-light border">${escape_html(seriesName)}</span>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<p class="text-body-secondary mb-0">${escape_html(emptyLabel)}</p>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    bind_props($$props, { seriesNames, title, emptyLabel });
  });
}
const FAN_ACOUSTIC_VARIANT_MODES = [
  { value: "default", label: "Default" },
  { value: "override_1ph", label: "Override 1ph" },
  { value: "override_3ph", label: "Override 3ph" }
];
function fanPowerSupplyValue(parameterGroups = []) {
  for (const group of parameterGroups ?? []) {
    if (String(group?.group_name ?? "").trim().toLowerCase() !== "motor") continue;
    for (const parameter of group.parameters ?? []) {
      if (String(parameter?.parameter_name ?? "").trim().toLowerCase() !== "power supply") continue;
      return String(parameter?.value_string ?? "").trim();
    }
  }
  return "";
}
function isSinglePhasePowerSupply(value) {
  return /(?:^|[^a-z0-9])(?:1\s*[-/]?\s*(?:ph|phase)|single\s*[- ]?\s*phase)(?:[^a-z0-9]|$)/i.test(String(value ?? "").trim());
}
function fanAcousticVariant(table = {}, parameterGroups = []) {
  const mode = String(table?.variant_mode ?? "default").toLowerCase();
  if (mode === "override_1ph") return "1ph";
  if (mode === "override_3ph") return "3ph";
  return isSinglePhasePowerSupply(fanPowerSupplyValue(parameterGroups)) ? "1ph" : "3ph";
}
export {
  FAN_ACOUSTIC_VARIANT_MODES as F,
  SeriesNamesBadgeList as S,
  fanAcousticVariant as f
};
