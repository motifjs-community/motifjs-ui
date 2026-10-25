import { data } from '@motifx-community/data';
import { parseNumber } from '../../numberbox/number-text';
import type { GridColumn } from '../grid-column';
import type { ListOption } from '../list-option';
import type { EditorValue } from '../view/editor-value';
import { dateLike } from './date-like';
import { optionOf } from './option-of';
import { parseDateText } from './parse-date-text';
import { sameValue } from './same-value';

const pad = (n: number) => String(n).padStart(2, '0');

const TRUE_TEXTS = new Set(['true', '1', 'x', '✓', '✔']);
const FALSE_TEXTS = new Set(['false', '0', '']);

/** Cell values as text and back, by column type, with `Intl` in one locale; also the record counts. */
export class CellFormatter {
  readonly collator: Intl.Collator;
  private readonly number: Intl.NumberFormat;
  private readonly date: Intl.DateTimeFormat;

  constructor(
    readonly locale: string,
    private readonly yesNo: () => [string, string],
    private readonly messages: () => { number: string; date: string; other: string } = () => ({ number: '', date: '', other: '' }),
  ) {
    this.number = new Intl.NumberFormat(locale);
    this.date = new Intl.DateTimeFormat(locale, { dateStyle: 'short' });
    this.collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' });
  }

  /** A plain number: record counts, page numbers. */
  count(n: number): string {
    return this.number.format(n);
  }

  /** Display text of a cell; `v` is the value to show (the unsaved edit, when there is one). */
  text<T>(col: GridColumn<T>, row: T | undefined, v: unknown): string {
    if (row === undefined || row === null) return '';
    if (col.format) return col.format(v, row);
    if (data.isEmpty(v)) return '';
    switch (col.type) {
      case 'number':
        return typeof v === 'number' ? this.number.format(v) : String(v);
      case 'date': {
        const d = data.toDate(v);
        return d ? this.date.format(d) : String(v);
      }
      case 'boolean':
        return this.yesNo()[v ? 0 : 1];
      case 'list':
        return this.optionLabel(col, v) ?? String(v);
      default:
        return String(v);
    }
  }

  /** A value as plain text in no locale's format: numbers as written in code, dates as `yyyy-mm-dd` (with the time when it has one), `true` / `false`. */
  raw<T>(col: GridColumn<T>, v: unknown): string {
    if (data.isEmpty(v)) return '';
    if (v instanceof Date || (col.type === 'date' && typeof v === 'number')) {
      const d = data.toDate(v)!;
      const day = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      return d.getHours() || d.getMinutes() || d.getSeconds() ? `${day}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` : day;
    }
    return typeof v === 'object' ? JSON.stringify(v) : String(v);
  }

  /**
   * Text typed or pasted into a cell, read as the column's value: a number in the locale (or as
   * written in code), a date in the locale's order or ISO (kept in the kind of value `like` is), yes
   * or no, a list option by its text or value. Empty text is no value.
   */
  parse<T>(col: GridColumn<T>, text: string, like: unknown): EditorValue {
    const plain = text.trim();
    if (plain === '' && col.type !== 'boolean') return { ok: true, value: null };
    switch (col.type) {
      case 'number': {
        const n = parseNumber(plain, this.locale);
        return n === null || Number.isNaN(n) ? { ok: false, message: this.messages().number } : { ok: true, value: n };
      }
      case 'date': {
        const d = parseDateText(plain, this.locale);
        return d ? { ok: true, value: dateLike(d, like) } : { ok: false, message: this.messages().date };
      }
      case 'boolean': {
        const lower = plain.toLocaleLowerCase(this.locale);
        const [yes, no] = this.yesNo().map((t) => t.toLocaleLowerCase(this.locale));
        if (lower === yes || TRUE_TEXTS.has(lower)) return { ok: true, value: true };
        if (lower === no || FALSE_TEXTS.has(lower)) return { ok: true, value: false };
        return { ok: false, message: this.messages().other };
      }
      case 'list': {
        if (!Array.isArray(col.options)) return { ok: true, value: plain };
        for (const o of col.options as readonly ListOption[]) {
          const opt = optionOf(o);
          if (this.collator.compare(opt.label, plain) === 0 || String(opt.value) === plain) return { ok: true, value: opt.value };
        }
        return { ok: false, message: this.messages().other };
      }
      default:
        return { ok: true, value: text };
    }
  }

  private optionLabel<T>(col: GridColumn<T>, v: unknown): string | undefined {
    if (!Array.isArray(col.options)) return undefined;
    for (const o of col.options as readonly ListOption[]) {
      const opt = optionOf(o);
      if (sameValue(opt.value, v)) return opt.label;
    }
    return undefined;
  }
}
