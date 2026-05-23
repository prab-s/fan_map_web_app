import { redirect } from "@sveltejs/kit";
function seriesEditPath(series = "") {
  return series ? `/editor/series/edit/${encodeURIComponent(String(series))}` : "/editor/series/edit";
}
async function load({ fetch, url }) {
  const series = url.searchParams.get("series") || "";
  if (series) {
    throw redirect(307, seriesEditPath(series));
  }
  return {
    series: ""
  };
}
export {
  load
};
