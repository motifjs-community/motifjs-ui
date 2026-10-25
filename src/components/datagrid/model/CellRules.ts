import { read } from '@motifx/core';
import { data } from '@motifx-community/data';
import type { UiStrings } from '../../../core/ui-strings';
import { checkRules } from '../../../parts/validation/check-rules';
import type { ValidationRule } from '../../../parts/validation/validation-rule';
import type { GridColumn } from '../grid-column';
import type { GridValidationRule } from '../grid-validation-rule';
import { sameValue } from './same-value';

/** Rules an empty value passes unless they say otherwise. */
const PASS_EMPTY = new Set<string>(['numeric', 'range', 'pattern', 'email']);

const COMPARE: Record<string, (a: any, b: any) => boolean> = {
  '==': (a, b) => a == b,
  '!=': (a, b) => a != b,
  '===': (a, b) => a === b,
  '!==': (a, b) => a !== b,
  '<': (a, b) => a < b,
  '<=': (a, b) => a <= b,
  '>': (a, b) => a > b,
  '>=': (a, b) => a >= b,
};

interface Checked {
  value: unknown;
  round: number;
  message: string;
  /** A rule of the column runs on every round, not only for a new value. */
  always: boolean;
}

const textOf = (v: unknown) => (v === null || v === undefined ? '' : String(v));

function isNumeric(v: unknown): boolean {
  if (typeof v === 'number') return Number.isFinite(v);
  return typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v));
}

/**
 * The columns' `validationRules`, checked with the kit's `checkRules`. A result is kept per row and
 * field with the value it was found for: the same value is not checked again, except by a rule that
 * asks for it (`reevaluate`, `compare`), which runs once per check of the row (`round`).
 */
export class CellRules<T> {
  /** Grows with each check of a row the user or the code starts. */
  round = 0;
  private readonly results = new Map<string, Map<string, Checked>>();
  /** Checks still running, so the same value is not checked twice at once. */
  private readonly running = new Map<string, Map<string, { value: unknown; round: number; done: Promise<string> }>>();

  constructor(private readonly text: (key: keyof UiStrings) => string) {}

  has(col: GridColumn<T>): boolean {
    return !!col.validationRules?.length;
  }

  /** A rule waits for a promise: the cell shows that it is busy meanwhile. */
  waits(col: GridColumn<T>): boolean {
    return !!col.validationRules?.some((r) => r.type === 'async');
  }

  /** A column that must be filled in: a `required` rule. */
  requires(col: GridColumn<T>): boolean {
    return !!col.validationRules?.some((r) => r.type === 'required');
  }

  /** The message found for this value (`''`: it passed), or `undefined` when it has to be checked. */
  known(rowId: string, col: GridColumn<T>, value: unknown): string | undefined {
    const found = this.results.get(rowId)?.get(col.field);
    if (!found || !sameValue(found.value, value) || (found.always && found.round !== this.round)) return undefined;
    return found.message;
  }

  /** Checks the value against the column's rules: the ones in order, then the `async` ones together. A check of the same value still running is shared. */
  check(rowId: string, col: GridColumn<T>, value: unknown, row: T): Promise<string> {
    let byField = this.running.get(rowId);
    const same = byField?.get(col.field);
    if (same && sameValue(same.value, value)) {
      same.round = this.round;
      return same.done;
    }
    if (!byField) this.running.set(rowId, (byField = new Map()));
    const run = { value, round: this.round, done: Promise.resolve('') };
    run.done = this.checkNow(col, value, row).then((message) => {
      if (byField.get(col.field) === run) byField.delete(col.field);
      this.keep(rowId, col, value, run.round, message);
      return message;
    });
    byField.set(col.field, run);
    return run.done;
  }

  /** Drops what was found for a row, or for every row. */
  forget(rowId?: string) {
    if (rowId === undefined) {
      this.results.clear();
      this.running.clear();
    } else {
      this.results.delete(rowId);
      this.running.delete(rowId);
    }
  }

  private keep(rowId: string, col: GridColumn<T>, value: unknown, round: number, message: string) {
    const rules = col.validationRules ?? [];
    let byField = this.results.get(rowId);
    if (!byField) this.results.set(rowId, (byField = new Map()));
    const always = rules.some((r) => r.type === 'compare' || (r.type === 'async' ? r.reevaluate !== false : 'reevaluate' in r && !!r.reevaluate));
    byField.set(col.field, { value, round, message, always });
  }

  private async checkNow(col: GridColumn<T>, value: unknown, row: T): Promise<string> {
    const rules = col.validationRules ?? [];
    let message = '';
    for (const rule of rules) {
      if (rule.type === 'async') continue;
      message = await this.one(rule, value, row, col);
      if (message) break;
    }
    if (!message) {
      const found = await Promise.all(rules.filter((r) => r.type === 'async').map((r) => this.one(r, value, row, col)));
      message = found.find(Boolean) ?? '';
    }
    return message;
  }

  private async one(rule: GridValidationRule<T>, value: unknown, row: T, col: GridColumn<T>): Promise<string> {
    const trims = (rule.type === 'required' || rule.type === 'stringLength') && rule.trim !== false;
    const shown = trims && typeof value === 'string' ? value.trim() : value;
    const empty = data.isEmpty(shown);
    if (rule.type === 'required') return this.run(shown, { type: 'required', message: this.message(rule, 'required') }, empty);
    if (empty && (rule.ignoreEmptyValue ?? PASS_EMPTY.has(rule.type))) return '';
    switch (rule.type) {
      case 'numeric':
        return this.run(value, { type: 'custom', ignoreEmpty: false, check: isNumeric, message: this.message(rule, 'gridInvalidNumber') }, false);
      case 'range':
        if (empty) return read(rule.message) ?? this.text('invalid');
        return this.run(value, { type: 'range', min: rule.min, max: rule.max, message: rule.message }, false);
      case 'stringLength':
        return this.run(textOf(shown), { type: 'length', min: rule.min, max: rule.max, message: rule.message }, false);
      case 'pattern': {
        const pattern = () => {
          const p = read(rule.pattern);
          return typeof p === 'string' ? new RegExp(p) : p;
        };
        return this.run(textOf(value), { type: 'pattern', pattern, message: this.message(rule, 'invalidFormat') }, false);
      }
      case 'email':
        return this.run(textOf(value), { type: 'email', message: this.message(rule, 'invalidEmail') }, false);
      case 'compare': {
        const same = COMPARE[rule.comparisonType ?? '=='] ?? COMPARE['=='];
        return this.run(value, { type: 'custom', ignoreEmpty: false, check: (v) => same(v, rule.comparisonTarget(row)), message: this.message(rule, 'noMatch') }, false);
      }
      case 'custom':
        return this.run(value, { type: 'custom', ignoreEmpty: false, check: (v) => rule.validationCallback({ value: v, row, column: col, rule }), message: this.message(rule, 'invalid') }, false);
      case 'async': {
        const check = async (v: unknown) => {
          try {
            const result = await rule.validationCallback({ value: v, row, column: col, rule });
            if (result && typeof result === 'object') return result.isValid ? true : result.message || false;
            return result;
          } catch (error) {
            return typeof error === 'string' ? error || false : (error as Error | undefined)?.message || false;
          }
        };
        return this.run(value, { type: 'custom', ignoreEmpty: false, check, message: this.message(rule, 'invalid') }, false);
      }
    }
  }

  /** The rule's own message, else the grid's text (its `texts`, then `uiLocale`). */
  private message(rule: GridValidationRule<T>, key: keyof UiStrings): () => string {
    return () => read(rule.message) ?? this.text(key);
  }

  private async run(value: unknown, rule: ValidationRule<any>, empty: boolean): Promise<string> {
    const failed = await checkRules(value, [rule], empty);
    return failed ? failed() : '';
  }
}
