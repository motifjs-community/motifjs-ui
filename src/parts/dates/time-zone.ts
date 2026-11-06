const MINUTE = 60_000;
const DAY = 86_400_000;
/** Offsets kept per zone before the cache starts again. */
const KEEP = 20_000;

/** A date of the browser's own clock with these fields (any year). */
function localDate(year: number, month: number, day: number, hours: number, minutes: number, seconds: number, ms: number): Date {
  const date = new Date(2000, 0, 1);
  date.setFullYear(year, month, day);
  date.setHours(hours, minutes, seconds, ms);
  return date;
}

/** Milliseconds of UTC with these fields (any year). */
function utcTime(year: number, month: number, day: number, hours: number, minutes: number, seconds: number, ms: number): number {
  const date = new Date(0);
  date.setUTCFullYear(year, month, day);
  date.setUTCHours(hours, minutes, seconds, ms);
  return date.getTime();
}

/**
 * A time zone: an IANA name (`Europe/Istanbul`), or the browser's own. It converts moments to wall
 * clock times and back using `Intl` only. A wall clock time is milliseconds of UTC with the clock's
 * fields (`Date.UTC(2026, 9, 25, 2, 30)` is half past two on the clock), so days and hours can be
 * counted on it without daylight saving time interfering. A time the clock skips (the hour moved
 * forward) is shifted by the gap, and a time it shows twice (the hour moved back) is the first one,
 * unless the later one is requested.
 *
 * @example
 * const berlin = TimeZone.of('Europe/Berlin');
 * berlin.moment(Date.UTC(2026, 2, 29, 2, 30)); // 01:30 UTC: 02:30 does not happen that night
 */
export class TimeZone {
  private static readonly made = new Map<string, TimeZone>();
  private static warned = new Set<string>();
  /** The browser's own zone. */
  static readonly local = new TimeZone('');

  /** A zone by its IANA name, or the browser's own for no name or for a name `Intl` does not recognize. */
  static of(name?: string | null): TimeZone {
    if (!name) return TimeZone.local;
    let zone = TimeZone.made.get(name);
    if (zone) return zone;
    if (!TimeZone.isValid(name)) {
      if (!TimeZone.warned.has(name)) console.warn(`TimeZone: "${name}" is not a time zone this browser knows; its own is used.`);
      TimeZone.warned.add(name);
      return TimeZone.local;
    }
    zone = new TimeZone(name);
    TimeZone.made.set(name, zone);
    return zone;
  }

  /** Indicates whether `Intl` recognizes a zone by this name. */
  static isValid(name: string): boolean {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: name });
      return true;
    } catch {
      return false;
    }
  }

  /** The IANA names the browser recognizes, with `UTC`. */
  static names(): string[] {
    const list = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [];
    return list.includes('UTC') ? [...list] : ['UTC', ...list];
  }

  /** The IANA name of the browser's own zone. */
  static localName(): string {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  private readonly offsets = new Map<number, number>();
  private format: Intl.DateTimeFormat | null = null;

  private constructor(
    /** The IANA name, or an empty string for the browser's own zone. */
    readonly name: string,
  ) {}

  /** Minutes the clock is ahead of UTC at a moment (east positive). */
  offset(moment: number | Date): number {
    const time = typeof moment === 'number' ? moment : moment.getTime();
    if (!this.name) return 0 - new Date(time).getTimezoneOffset();
    const at = Math.floor(time / MINUTE);
    let offset = this.offsets.get(at);
    if (offset !== undefined) return offset;
    this.format ??= new Intl.DateTimeFormat('en-US', {
      timeZone: this.name,
      hourCycle: 'h23',
      era: 'short',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    const fields: Record<string, number> = {};
    let bc = false;
    for (const part of this.format.formatToParts(at * MINUTE)) {
      if (part.type === 'era') bc = /^B/i.test(part.value);
      else if (part.type !== 'literal') fields[part.type] = Number(part.value);
    }
    const year = bc ? 1 - fields.year : fields.year;
    const wall = utcTime(year, fields.month - 1, fields.day, fields.hour % 24, fields.minute, fields.second, 0);
    offset = Math.round((wall - at * MINUTE) / MINUTE);
    if (this.offsets.size > KEEP) this.offsets.clear();
    this.offsets.set(at, offset);
    return offset;
  }

  /** The wall clock time of a moment. */
  wall(moment: number | Date): number {
    const time = typeof moment === 'number' ? moment : moment.getTime();
    return time + this.offset(time) * MINUTE;
  }

  /**
   * The moment the clock shows `wall`. Skipped times shift by the gap, and a time shown twice is the first,
   * or the later one with `later`.
   */
  moment(wall: number, later = false): number {
    const before = wall - this.offset(wall - DAY) * MINUTE;
    const after = wall - this.offset(wall + DAY) * MINUTE;
    const beforeFits = this.wall(before) === wall;
    const afterFits = this.wall(after) === wall;
    if (beforeFits && afterFits) return later ? Math.max(before, after) : Math.min(before, after);
    if (afterFits) return after;
    // It fits the offset before the change, or it is skipped: the old offset puts it after the gap.
    return before;
  }

  /** The moment as a `Date`. */
  date(wall: number, later = false): Date {
    return new Date(this.moment(wall, later));
  }

  /** The start of the day a moment is in, on this clock. */
  dayStart(moment: number | Date): Date {
    const wall = this.wall(moment);
    return this.date(Math.floor(wall / DAY) * DAY);
  }

  /** The same clock time `days` later or earlier. */
  addDays(moment: number | Date, days: number): Date {
    return this.date(this.wall(moment) + days * DAY);
  }

  /** Indicates whether two moments are on the same day of this clock. */
  sameDay(a: number | Date, b: number | Date): boolean {
    return Math.floor(this.wall(a) / DAY) === Math.floor(this.wall(b) / DAY);
  }

  /** A date of the browser's clock with this clock's fields at a moment, for editors and calendars, which show the browser's. */
  toLocal(moment: number | Date): Date {
    if (!this.name) return new Date(typeof moment === 'number' ? moment : moment.getTime());
    const d = new Date(this.wall(moment));
    return localDate(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
  }

  /** The moment this clock shows the fields of a date of the browser's clock (the result of `toLocal`, or an editor's value). */
  fromLocal(local: Date): Date {
    if (!this.name) return new Date(local.getTime());
    return this.date(utcTime(local.getFullYear(), local.getMonth(), local.getDate(), local.getHours(), local.getMinutes(), local.getSeconds(), local.getMilliseconds()));
  }

  /** The wall clock time of a date of the browser's clock, by its fields. */
  static wallOfLocal(local: Date): number {
    return utcTime(local.getFullYear(), local.getMonth(), local.getDate(), local.getHours(), local.getMinutes(), local.getSeconds(), local.getMilliseconds());
  }

  /** A date of the browser's clock with the fields of a wall clock time. */
  static localOfWall(wall: number): Date {
    const d = new Date(wall);
    return localDate(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
  }
}
