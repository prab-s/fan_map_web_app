function normalizeTab(value) {
  return value === 'series' || value === 'product-type' ? value : 'product';
}

function viewerPath(tab, record = '') {
  const nextRecord = record == null || record === '' ? '' : `/${encodeURIComponent(String(record))}`;
  return `/viewer/${tab}${nextRecord}`;
}

export function load({ params }) {
  const tab = normalizeTab(params.tab);
  const record = params.record || '';

  if (tab === 'product' && record) {
    return {
      tab,
      record,
      product: record,
      product_type: '',
      product_type_id: '',
      product_type_key: '',
      product_type_context: null,
      series: ''
    };
  }

  if (tab === 'series' && record) {
    return {
      tab,
      record,
      product: '',
      product_type: '',
      product_type_id: '',
      product_type_key: '',
      product_type_context: null,
      series: record,
      series_product_type_key: ''
    };
  }

  if (tab === 'product-type' && record) {
    return {
      tab,
      record,
      product: '',
      product_type: record,
      product_type_id: record,
      product_type_key: '',
      product_type_context: null,
      series: ''
    };
  }

  return {
    tab,
    record: '',
    product: '',
    product_type: '',
    product_type_id: '',
    product_type_key: '',
    product_type_context: null,
    series: ''
  };
}
