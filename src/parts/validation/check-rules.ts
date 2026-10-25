import { read } from '@motifx/core';
import { fillTemplate } from '../../core/fill-template';
import { uiLocale } from '../../core/ui-locale';
import type { UiStrings } from '../../core/ui-strings';
import type { ValidationMessage } from './validation-message';
import type { ValidationRule } from './validation-rule';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isUrl(text: string): boolean {
  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function matches(pattern: RegExp | string, text: string): boolean {
  if (typeof pattern === 'string') return new RegExp(`^(?:${pattern})$`, 'u').test(text);
  pattern.lastIndex = 0;
  return pattern.test(text);
}

function show(bound: number | Date): string {
  return bound instanceof Date ? bound.toLocaleDateString() : bound.toLocaleString();
}

function sizeOf(value: unknown): number {
  return typeof value === 'string' || Array.isArray(value) ? value.length : String(value).length;
}

function emptyLike(value: unknown): boolean {
  return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
}

function message(rule: ValidationRule<never>, key: keyof UiStrings, values: Record<string, unknown> = {}): ValidationMessage {
  return () => fillTemplate(read(rule.message) ?? uiLocale.strings[key], values);
}

async function failure<T>(rule: ValidationRule<T>, value: T, empty: boolean): Promise<ValidationMessage | null> {
  const r = rule as ValidationRule<never>;
  if (rule.type === 'required') return empty ? message(r, 'required') : null;
  if (rule.type === 'compare') {
    const other = rule.with();
    const same = Object.is(value, other) || (empty && emptyLike(other));
    return same === !!read(rule.not) ? message(r, 'noMatch') : null;
  }
  if (rule.type === 'custom') {
    if (empty && read(rule.ignoreEmpty) !== false) return null;
    const result = await rule.check(value);
    if (typeof result === 'string' && result) return () => result;
    return result === false ? message(r, 'invalid') : null;
  }
  if (empty) return null;
  const text = String(value);
  switch (rule.type) {
    case 'email':
      return EMAIL.test(text) ? null : message(r, 'invalidEmail');
    case 'url':
      return isUrl(text) ? null : message(r, 'invalidUrl');
    case 'pattern':
      return matches(read(rule.pattern), text) ? null : message(r, 'invalidFormat');
    case 'length': {
      const min = read(rule.min);
      const max = read(rule.max);
      const size = sizeOf(value);
      if (min !== undefined && size < min) return message(r, 'tooShort', { min, max });
      if (max !== undefined && size > max) return message(r, 'tooLong', { min, max });
      return null;
    }
    case 'range': {
      const min = read(rule.min);
      const max = read(rule.max);
      const at = value instanceof Date ? value.getTime() : Number(value);
      const low = min !== undefined && at < +min;
      const high = max !== undefined && at > +max;
      if (!low && !high) return null;
      const bounds = { min: min === undefined ? '' : show(min), max: max === undefined ? '' : show(max) };
      if (min !== undefined && max !== undefined) return message(r, 'outOfRange', bounds);
      return message(r, low ? 'tooSmall' : 'tooLarge', bounds);
    }
  }
}

/** The message of the first rule that fails, or `null`. */
export async function checkRules<T>(value: T, rules: readonly ValidationRule<T>[], empty: boolean): Promise<ValidationMessage | null> {
  for (const rule of rules) {
    if (read(rule.enabled) === false) continue;
    const failed = await failure(rule, value, empty);
    if (failed) return failed;
  }
  return null;
}
