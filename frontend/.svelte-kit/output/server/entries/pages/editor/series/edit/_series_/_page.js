async function load({ fetch, params }) {
  const series = params.series || "";
  return {
    series
  };
}
export {
  load
};
