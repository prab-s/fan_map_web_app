import { error } from "@sveltejs/kit";
import { f as getPublicSeries } from "../../../../chunks/api.js";
async function load({ fetch, params }) {
  const seriesIdentifier = params.series;
  try {
    const series = await getPublicSeries(seriesIdentifier, fetch);
    return {
      seriesIdentifier,
      series
    };
  } catch (err) {
    if (err?.status === 404) {
      throw error(404, "Series not found.");
    }
    throw error(err?.status || 500, err?.message || "Unable to load the series.");
  }
}
export {
  load
};
