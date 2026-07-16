const DESCRIPTION_FIELD_PATTERN = /^description(\d+)_html$/i;

function normalizeSectionHtml(value) {
  return value == null ? '' : String(value);
}

function extractNumberedSections(record = {}) {
  return Object.entries(record)
    .map(([key, value]) => {
      const match = key.match(DESCRIPTION_FIELD_PATTERN);
      if (!match) return null;
      return {
        index: Number(match[1]),
        key,
        title: `Description ${Number(match[1])}`,
        html: normalizeSectionHtml(value)
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.index - right.index)
    .map(({ key, title, html }) => ({ key, title, html }));
}

export function getDescriptionSections(record = {}) {
  if (Array.isArray(record.description_sections) && record.description_sections.length > 0) {
    return record.description_sections.map((section, index) => ({
      key: section?.key || `description${index + 1}_html`,
      title: section?.title || section?.label || `Description ${index + 1}`,
      html: normalizeSectionHtml(section?.html ?? section?.content ?? section?.body)
    }));
  }

  const sections = extractNumberedSections(record);
  const hasDescriptionFour = sections.some((section) => section.key === 'description4_html');
  const legacyDescription4Html = normalizeSectionHtml(record.comments_html).trim();
  if (!hasDescriptionFour && legacyDescription4Html) {
    sections.push({
      index: 4,
      key: 'description4_html',
      title: 'Description 4',
      html: legacyDescription4Html
    });
  }

  const hasDescriptionFiveOrHigher = sections.some((section) => {
    const match = String(section.key).match(/^description(\d+)_html$/i);
    return match ? Number(match[1]) >= 5 : false;
  });

  return sections.sort((left, right) => {
    const leftMatch = String(left.key).match(/^description(\d+)_html$/i);
    const rightMatch = String(right.key).match(/^description(\d+)_html$/i);
    const leftIndex = leftMatch ? Number(leftMatch[1]) : 0;
    const rightIndex = rightMatch ? Number(rightMatch[1]) : 0;
    return leftIndex - rightIndex;
  }).filter((section) => {
    const match = String(section.key).match(/^description(\d+)_html$/i);
    return !match || Number(match[1]) <= 4 || hasDescriptionFiveOrHigher;
  });
}

export function getDescriptionFieldCount(record = {}) {
  return getDescriptionSections(record).length;
}

export function createDescriptionSectionDrafts(record = {}) {
  const sections = getDescriptionSections(record);
  return sections.length > 0 ? sections : [{ key: 'description1_html', title: 'Description 1', html: '' }];
}

export function createDescriptionFieldPayload(sections = [], previousFieldCount = 0) {
  const payload = {};
  const normalizedSections = Array.isArray(sections) ? sections : [];

  normalizedSections.forEach((section, index) => {
    const key = `description${index + 1}_html`;
    payload[key] = normalizeSectionHtml(section?.html).trim() || null;
  });

  const nextFieldCount = Math.max(previousFieldCount || 0, normalizedSections.length);
  for (let index = normalizedSections.length + 1; index <= nextFieldCount; index += 1) {
    payload[`description${index}_html`] = null;
  }

  return payload;
}
