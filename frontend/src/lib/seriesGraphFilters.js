function numericValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function graphPoints(payload) {
  if (Array.isArray(payload?.rpmPoints) && payload.rpmPoints.length) return payload.rpmPoints;
  return (payload?.rpmLines || []).flatMap((line) =>
    (line?.points || []).map((point) => ({
      ...point,
      rpm_line_id: point?.rpm_line_id ?? line?.id,
      rpm: point?.rpm ?? line?.rpm
    }))
  );
}

export function seriesGraphFilterValues(payload) {
  const airflow = new Set();
  const pressure = new Set();

  for (const point of graphPoints(payload)) {
    const pointAirflow = numericValue(point?.airflow);
    const pointPressure = numericValue(point?.pressure);
    if (pointAirflow != null) airflow.add(pointAirflow);
    if (pointPressure != null) pressure.add(pointPressure);
  }

  return {
    airflow: [...airflow].sort((a, b) => a - b),
    pressure: [...pressure].sort((a, b) => a - b)
  };
}

export function seriesGraphFilterRanges(payload) {
  const values = seriesGraphFilterValues(payload);
  return {
    airflow: {
      min: values.airflow[0] ?? null,
      max: values.airflow.at(-1) ?? null
    },
    pressure: {
      min: values.pressure[0] ?? null,
      max: values.pressure.at(-1) ?? null
    }
  };
}

export function filterSeriesGraphPayload(payload, lineMode = 'both', airflow = '', pressure = '') {
  if (!payload) return null;

  const normalizedMode = ['high', 'low', 'both'].includes(lineMode) ? lineMode : 'both';
  const selectedAirflow = airflow === '' || airflow == null ? null : numericValue(airflow);
  const selectedPressure = pressure === '' || pressure == null ? null : numericValue(pressure);
  const pointsByLineId = new Map();

  for (const point of graphPoints(payload)) {
    const lineId = String(point?.rpm_line_id ?? '');
    if (!pointsByLineId.has(lineId)) pointsByLineId.set(lineId, []);
    pointsByLineId.get(lineId).push(point);
  }

  const lines = (payload.rpmLines || []).filter((line) => {
    const role = String(line?.line_role || 'high').toLowerCase();
    if (normalizedMode !== 'both' && role !== normalizedMode) return false;

    const points = pointsByLineId.get(String(line?.id ?? line?.rpm ?? '')) || [];
    if (selectedAirflow == null && selectedPressure == null) return true;

    // Match the product chooser's graph filter logic: a product qualifies
    // when the requested target lies within its available graph range.
    const airflowValues = points.map((point) => numericValue(point?.airflow)).filter((value) => value != null);
    const pressureValues = points.map((point) => numericValue(point?.pressure)).filter((value) => value != null);
    const airflowMatches = selectedAirflow == null || (
      airflowValues.length > 0 && selectedAirflow >= Math.min(...airflowValues) && selectedAirflow <= Math.max(...airflowValues)
    );
    const pressureMatches = selectedPressure == null || (
      pressureValues.length > 0 && selectedPressure >= Math.min(...pressureValues) && selectedPressure <= Math.max(...pressureValues)
    );
    return airflowMatches && pressureMatches;
  });

  const lineIds = new Set(lines.map((line) => String(line?.id ?? line?.rpm ?? '')));
  return {
    ...payload,
    rpmLines: lines,
    rpmPoints: Array.isArray(payload.rpmPoints)
      ? payload.rpmPoints.filter((point) => lineIds.has(String(point?.rpm_line_id ?? point?.rpm ?? '')))
      : undefined
  };
}
