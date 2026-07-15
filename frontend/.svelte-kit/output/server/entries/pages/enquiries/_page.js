import { error } from "@sveltejs/kit";
async function load({ fetch }) {
  const response = await fetch("/api/quote-requests?limit=200");
  if (!response.ok) {
    throw error(response.status, "Unable to load enquiries.");
  }
  const quoteRequests = await response.json();
  return {
    quoteRequests
  };
}
export {
  load
};
