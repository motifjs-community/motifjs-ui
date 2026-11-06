import type { ICalendar } from './icalendar';
import type { ICalendarComponent } from './icalendar-component';
import { readComponents } from './read-components';
import { readEvent } from './read-event';
import { readTimeZone } from './read-time-zone';
import { unescapeText } from './unescape-text';

/**
 * Reads an iCalendar file (RFC 5545): its events, the time zones it writes and its name. Several
 * calendars in one file are merged; to-dos, journals, free/busy times and the blocks inside an
 * event (alarms) are omitted, and so are lines it cannot read. It never throws on a bad file.
 *
 * @example
 * const calendar = parseICalendar(text);
 * calendar.events[0].summary;
 */
export function parseICalendar(text: string): ICalendar {
  const calendar: ICalendar = { events: [], timeZones: [], name: '', timeZone: '', prodId: '', method: '' };
  const read = (component: ICalendarComponent) => {
    if (component.name === 'VEVENT') {
      const event = readEvent(component);
      if (event) calendar.events.push(event);
    } else if (component.name === 'VTIMEZONE') {
      const zone = readTimeZone(component);
      if (zone) calendar.timeZones.push(zone);
    }
  };
  for (const root of readComponents(text)) {
    if (root.name !== 'VCALENDAR') {
      read(root);
      continue;
    }
    const value = (name: string) => root.properties.find((property) => property.name === name)?.value.trim() ?? '';
    calendar.name ||= unescapeText(value('X-WR-CALNAME'));
    calendar.timeZone ||= value('X-WR-TIMEZONE');
    calendar.prodId ||= unescapeText(value('PRODID'));
    calendar.method ||= value('METHOD').toUpperCase();
    root.children.forEach(read);
  }
  return calendar;
}
