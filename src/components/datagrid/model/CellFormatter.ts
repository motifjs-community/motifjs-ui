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

/** Cell values as text and back, by column type, with `Intl` in one locale; also the record counts. */
export class CellFormatter {
  readonly collator: Intl.Collator;
  private readonly number: Intl.NumberFormat;
  private readonly date: Intl.DateTimeFormat;
  /** Formatters of the columns' own `Intl` options. */
  private readonly own = new WeakMap<object, Intl.NumberFormat | Intl.DateTimeFormat>();

  constructor(
    readonly locale: string,
    private readonly yesNo: () => [string, string],
    private readonly messages: () => { number: string; date: string; other: string } = () => ({ number: '', date: '', other: '' }),
    /** Texts read as yes and as no, besides the yes / no words. */
    private readonly boolTexts: () => [readonly string[], readonly string[]] = () => [['true', '1', 'x', '✓', '✔'], ['false', '0', '']],
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
    if (typeof col.format === 'function') return col.format(v, row);
    if (data.isEmpty(v)) return '';
    switch (col.type) {
      case 'number':
        return typeof v === 'number' ? this.numberFormat(col).format(v) : String(v);
      case 'date': {
        const d = data.toDate(v);
        return d ? this.dateFormat(col).format(d) : String(v);
      }
      case 'boolean':
        return this.yesNo()[v ? 0 : 1];
      case 'list':
        return this.optionLabel(col, v) ?? String(v);
      default:
        return String(v);
    }
  }

  /** The `Intl` options a number column shows its values with; `undefined` when its `format` is a function. */
  numberOptions<T>(col: GridColumn<T>): Intl.NumberFormatOptions | undefined {
    if (typeof col.format === 'function') return undefined;
    return (col.format as Intl.NumberFormatOptions | undefined) ?? {};
  }

  /** The `Intl` options a date column shows its values with; `undefined` when its `format` is a function. */
  dateOptions<T>(col: GridColumn<T>): Intl.DateTimeFormatOptions | undefined {
    if (typeof col.format === 'function') return undefined;
    return (col.format as Intl.DateTimeFormatOptions | undefined) ?? { dateStyle: 'short' };
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
        const [ownTrue, ownFalse] = this.boolTexts();
        const trueTexts = col.trueTexts ?? ownTrue;
        const falseTexts = col.falseTexts ?? ownFalse;
        const has = (list: readonly string[]) => list.some((t) => t.toLocaleLowerCase(this.locale) === lower);
        if (lower === yes || has(trueTexts)) return { ok: true, value: true };
        if (lower === no || has(falseTexts)) return { ok: true, value: false };
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

  private numberFormat<T>(col: GridColumn<T>): Intl.NumberFormat {
    const options = col.format;
    if (!options || typeof options !== 'object') return this.number;
    let f = this.own.get(options);
    if (!f) this.own.set(options, (f = new Intl.NumberFormat(this.locale, options as Intl.NumberFormatOptions)));
    return f as Intl.NumberFormat;
  }

  private dateFormat<T>(col: GridColumn<T>): Intl.DateTimeFormat {
    const options = col.format;
    if (!options || typeof options !== 'object') return this.date;
    let f = this.own.get(options);
    if (!f) this.own.set(options, (f = new Intl.DateTimeFormat(this.locale, options as Intl.DateTimeFormatOptions)));
    return f as Intl.DateTimeFormat;
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
