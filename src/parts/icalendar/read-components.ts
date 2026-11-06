import type { ICalendarComponent } from './icalendar-component';
import { readContentLine } from './read-content-line';
import { unfoldLines } from './unfold-lines';

/** The blocks of a file as a tree; lines that are not content lines, and properties outside any block, are omitted. */
export function readComponents(text: string): ICalendarComponent[] {
  const roots: ICalendarComponent[] = [];
  const open: ICalendarComponent[] = [];
  for (const line of unfoldLines(text)) {
    const property = readContentLine(line);
    if (!property) continue;
    const name = property.value.trim().toUpperCase();
    if (property.name === 'BEGIN' && name) {
      const component: ICalendarComponent = { name, properties: [], children: [] };
      (open.length ? open[open.length - 1].children : roots).push(component);
      open.push(component);
    } else if (property.name === 'END') {
      const at = open.map((component) => component.name).lastIndexOf(name);
      if (at >= 0) open.length = at;
    } else if (open.length) {
      open[open.length - 1].properties.push(property);
    }
  }
  return roots;
}
