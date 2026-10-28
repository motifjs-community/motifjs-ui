import type { ICalendarProperty } from './icalendar-property';

/** A parameter value as written: in quotes when it holds `:`, `;` or `,` (and none yet). */
function paramValue(value: string): string {
  return /[:;,]/.test(value) && !value.includes('"') ? `"${value}"` : value;
}

/** A property as one content line, not folded yet. */
export function formatContentLine(property: ICalendarProperty): string {
  const params = Object.entries(property.params).map(([key, value]) => `;${key}=${paramValue(value)}`);
  return `${property.name}${params.join('')}:${property.value}`;
}
