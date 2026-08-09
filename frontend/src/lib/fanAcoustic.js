export const FAN_ACOUSTIC_VARIANT_MODES = [
  { value: 'default', label: 'Default' },
  { value: 'override_1ph', label: 'Override 1ph' },
  { value: 'override_3ph', label: 'Override 3ph' },
];

export function fanPowerSupplyValue(parameterGroups = []) {
  for (const group of parameterGroups ?? []) {
    if (String(group?.group_name ?? '').trim().toLowerCase() !== 'motor') continue;
    for (const parameter of group.parameters ?? []) {
      if (String(parameter?.parameter_name ?? '').trim().toLowerCase() !== 'power supply') continue;
      return String(parameter?.value_string ?? '').trim();
    }
  }
  return '';
}

export function isSinglePhasePowerSupply(value) {
  return /(?:^|[^a-z0-9])(?:1\s*[-/]?\s*(?:ph|phase)|single\s*[- ]?\s*phase)(?:[^a-z0-9]|$)/i.test(String(value ?? '').trim());
}

export function fanAcousticVariant(table = {}, parameterGroups = []) {
  const mode = String(table?.variant_mode ?? 'default').toLowerCase();
  if (mode === 'override_1ph') return '1ph';
  if (mode === 'override_3ph') return '3ph';
  return isSinglePhasePowerSupply(fanPowerSupplyValue(parameterGroups)) ? '1ph' : '3ph';
}
