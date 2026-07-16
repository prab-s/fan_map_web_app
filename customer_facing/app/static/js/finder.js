const form = document.querySelector("#finder-form");
const results = document.querySelector("#finder-results");
const loading = document.querySelector("#finder-loading");

function setLoading(isLoading) {
  if (!loading) return;
  loading.classList.toggle("d-none", !isLoading);
}

async function updateResults() {
  if (!form || !results) return;

  const params = new URLSearchParams(new FormData(form));

  setLoading(true);
  try {
    const response = await fetch(`/finder/results?${params.toString()}`);
    const html = await response.text();
    results.innerHTML = html;
  } catch (_error) {
    results.innerHTML = '<div class="alert alert-warning border mb-0">Unable to load matching products right now.</div>';
  } finally {
    setLoading(false);
  }
}

if (form) {
  form.addEventListener("change", updateResults);
  form.addEventListener("input", () => {
    clearTimeout(window.finderTimer);
    window.finderTimer = setTimeout(updateResults, 250);
  });
  setLoading(false);
}
