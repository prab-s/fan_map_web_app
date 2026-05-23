import { error, redirect } from '@sveltejs/kit';

function normalizeTab(value) {
  return value === 'series' || value === 'product-type' ? value : 'product';
}

function viewerPath(tab, record = '') {
  const nextRecord = record == null || record === '' ? '' : `/${encodeURIComponent(String(record))}`;
  return `/viewer/${tab}${nextRecord}`;
}

export async function load({ fetch, params }) {
  const tab = normalizeTab(params.tab);
  const record = params.record || '';

  if (tab === 'product' && record) {
    const response = await fetch(`/api/products/${encodeURIComponent(record)}`);
    if (!response.ok) {
      throw error(response.status === 404 ? 404 : response.status, 'Product not found.');
    }
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
    const response = await fetch('/api/series');
    if (!response.ok) {
      throw error(response.status, 'Unable to load series.');
    }

    const seriesRecords = await response.json();
    if (!seriesRecords.some((seriesRecord) => String(seriesRecord.id) === String(record))) {
      throw error(404, 'Series not found.');
    }

    return {
      tab,
      record,
      product: '',
      product_type: '',
      product_type_id: '',
      product_type_key: '',
      product_type_context: null,
      series: record,
      series_product_type_key: seriesRecords.find((seriesRecord) => String(seriesRecord.id) === String(record))?.product_type_key || ''
    };
  }

  if (tab === 'product-type' && record) {
    const response = await fetch('/api/product-types');
    if (!response.ok) {
      throw error(response.status, 'Unable to load product types.');
    }

    const productTypes = await response.json();
    const resolvedProductType = productTypes.find(
      (productType) => String(productType.id) === String(record) || String(productType.key) === String(record)
    );
    if (!resolvedProductType) {
      throw error(404, 'Product type not found.');
    }

    const canonicalRecord = String(resolvedProductType.id);
    if (canonicalRecord !== String(record)) {
      throw redirect(307, viewerPath(tab, canonicalRecord));
    }

    let productTypeContext = null;
    try {
      const contextResponse = await fetch(`/api/product-types/${encodeURIComponent(resolvedProductType.id)}/pdf-context`);
      if (contextResponse.ok) {
        productTypeContext = await contextResponse.json();
      }
    } catch {
      productTypeContext = null;
    }

    return {
      tab,
      record: canonicalRecord,
      product: '',
      product_type: canonicalRecord,
      product_type_id: canonicalRecord,
      product_type_key: resolvedProductType.key,
      product_type_context: productTypeContext,
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
