import { afterEach, describe, expect, it } from 'vitest';
import { enStrings, trStrings, uiLocale } from '../../core/ui-locale';
import { checkRules } from './check-rules';
import type { ValidationRule } from './validation-rule';

afterEach(() => {
  uiLocale.strings = enStrings;
});

async function messageOf<T>(value: T, rules: ValidationRule<T>[], empty = value === '' || value == null) {
  const failed = await checkRules(value, rules, empty);
  return failed ? failed() : null;
}

describe('checkRules', () => {
  it('passes an empty value for every rule but required', async () => {
    expect(await messageOf('', [{ type: 'email' }, { type: 'length', min: 3 }])).toBeNull();
    expect(await messageOf('', [{ type: 'required' }])).toBe('This field is required.');
  });

  it('checks the built-in kinds and fills in the bounds', async () => {
    expect(await messageOf('a@b', [{ type: 'email' }])).toBe('Enter a valid email address.');
    expect(await messageOf('a@b.co', [{ type: 'email' }])).toBeNull();
    expect(await messageOf('ftp://x', [{ type: 'url' }])).toBe('Enter a valid web address.');
    expect(await messageOf('ab', [{ type: 'length', min: 3 }])).toBe('Enter at least 3 characters.');
    expect(await messageOf('abcd', [{ type: 'length', max: 3 }])).toBe('Enter at most 3 characters.');
    expect(await messageOf('12a', [{ type: 'pattern', pattern: '\\d+' }])).toBe('The value is not in the expected format.');
    expect(await messageOf('123', [{ type: 'pattern', pattern: /^\d+$/g }])).toBeNull();
    expect(await messageOf(5, [{ type: 'range', min: 1, max: 3 }], false)).toBe('Enter a value from 1 to 3.');
    expect(await messageOf(0, [{ type: 'range', min: 1 }], false)).toBe('Enter 1 or more.');
  });

  it('compares with another value, and its own message wins', async () => {
    let other = 'secret';
    const rule: ValidationRule<string> = { type: 'compare', with: () => other, message: 'Passwords differ' };
    expect(await messageOf('secret', [rule])).toBeNull();
    expect(await messageOf('', [rule])).toBe('Passwords differ');
    other = '';
    expect(await messageOf('', [rule])).toBeNull();
  });

  it('runs custom checks, async ones too, and skips disabled rules', async () => {
    const taken: ValidationRule<string> = { type: 'custom', check: async (v) => (v === 'ada' ? 'Taken' : true) };
    expect(await messageOf('ada', [taken])).toBe('Taken');
    expect(await messageOf('bob', [taken])).toBeNull();
    expect(await messageOf('x', [{ type: 'custom', check: () => false }])).toBe('The value is not valid.');
    expect(await messageOf('', [{ type: 'required', enabled: () => false }])).toBeNull();
  });

  it('gives messages that follow uiLocale', async () => {
    const failed = await checkRules('', [{ type: 'required' }], true);
    expect(failed!()).toBe('This field is required.');
    uiLocale.strings = trStrings;
    expect(failed!()).toBe('Bu alan zorunludur.');
  });
});
