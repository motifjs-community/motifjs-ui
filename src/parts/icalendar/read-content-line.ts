import type { ICalendarProperty } from './icalendar-property';

const NAME = /^[A-Za-z0-9-]+$/;

/** A content line (`NAME;PARAM="a:b";OTHER=c:value`) split into its parts; `null` when it is not one. */
export function readContentLine(line: string): ICalendarProperty | null {
  const nameEnd = line.search(/[;:]/);
  if (nameEnd < 1) return null;
  const name = line.slice(0, nameEnd);
  if (!NAME.test(name)) return null;
  const params: Record<string, string> = {};
  let at = nameEnd;
  while (line[at] === ';') {
    const equals = line.indexOf('=', at);
    if (equals < 0) return null;
    const key = line.slice(at + 1, equals);
    if (!NAME.test(key)) return null;
    let quoted = false;
    let end = equals + 1;
    for (; end < line.length; end++) {
      const char = line[end];
      if (char === '"') quoted = !quoted;
      else if (!quoted && (char === ';' || char === ':')) break;
    }
    if (end >= line.length) return null;
    const value = line.slice(equals + 1, end);
    params[key.toUpperCase()] = /^"[^"]*"$/.test(value) ? value.slice(1, -1) : value;
    at = end;
  }
  if (line[at] !== ':') return null;
  return { name: name.toUpperCase(), params, value: line.slice(at + 1) };
}
