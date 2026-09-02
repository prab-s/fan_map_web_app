const DESCRIPTION_FIELD_PATTERN = /^description(\d+)_html$/i;
const MAX_DESCRIPTION_SECTIONS = 10;
function normalizeSectionHtml(value) {
  return value == null ? "" : String(value);
}
function extractNumberedSections(record = {}) {
  const fieldCount = Math.min(MAX_DESCRIPTION_SECTIONS, Math.max(Number(record.description_field_count) || 0, 0));
  return Object.entries(record).map(([key, value]) => {
    const match = key.match(DESCRIPTION_FIELD_PATTERN);
    if (!match) return null;
    const index = Number(match[1]);
    if (index < 1 || index > MAX_DESCRIPTION_SECTIONS) return null;
    return {
      index,
      key,
      title: `Description ${Number(match[1])}`,
      html: normalizeSectionHtml(value)
    };
  }).filter((section) => section && (section.html.trim() || section.index <= fieldCount)).sort((left, right) => left.index - right.index).map(({ key, title, html }) => ({ key, title, html }));
}
function getDescriptionSections(record = {}) {
  if (Array.isArray(record.description_sections) && record.description_sections.length > 0) {
    return record.description_sections.slice(0, MAX_DESCRIPTION_SECTIONS).map((section, index) => ({
      key: section?.key || `description${index + 1}_html`,
      title: `Description ${index + 1}`,
      html: normalizeSectionHtml(section?.html ?? section?.content ?? section?.body)
    }));
  }
  const sections = extractNumberedSections(record);
  const hasDescriptionFour = sections.some((section) => section.key === "description4_html" && section.html.trim());
  const legacyDescription4Html = normalizeSectionHtml(record.comments_html).trim();
  if (!hasDescriptionFour && legacyDescription4Html) {
    sections.push({
      index: 4,
      key: "description4_html",
      title: "Description 4",
      html: legacyDescription4Html
    });
  }
  return sections.sort((left, right) => {
    const leftMatch = String(left.key).match(/^description(\d+)_html$/i);
    const rightMatch = String(right.key).match(/^description(\d+)_html$/i);
    const leftIndex = leftMatch ? Number(leftMatch[1]) : 0;
    const rightIndex = rightMatch ? Number(rightMatch[1]) : 0;
    return leftIndex - rightIndex;
  });
}
function getDescriptionFieldCount(record = {}) {
  return Math.min(
    MAX_DESCRIPTION_SECTIONS,
    Math.max(Number(record.description_field_count) || 0, getDescriptionSections(record).length)
  );
}
function createDescriptionSectionDrafts(record = {}) {
  const sections = getDescriptionSections(record);
  const fieldCount = getDescriptionFieldCount(record);
  const drafts = sections.length > 0 ? sections : [{ key: "description1_html", title: "Description 1", html: "" }];
  while (drafts.length < fieldCount) {
    drafts.push({ key: `description${drafts.length + 1}_html`, title: `Description ${drafts.length + 1}`, html: "" });
  }
  return drafts;
}
export {
  MAX_DESCRIPTION_SECTIONS as M,
  getDescriptionSections as a,
  createDescriptionSectionDrafts as c,
  getDescriptionFieldCount as g
};
