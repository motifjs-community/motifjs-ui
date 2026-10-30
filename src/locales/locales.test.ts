import { format } from '@motifx-community/i18n';
import { describe, expect, it } from 'vitest';
import en from './en.json';

const packs = import.meta.glob<Record<string, string>>('./*.json', { eager: true, import: 'default' });
const argsOf = (message: string) => [...new Set([...message.matchAll(/\{\s*(\w+)/g)].map((m) => m[1]))].sort();

describe('language packs', () => {
  for (const [file, pack] of Object.entries(packs)) {
    it(`${file} has every text of the built-in language, with its values, in ICU`, () => {
      expect(Object.keys(pack).sort()).toEqual(Object.keys(en).sort());
      for (const [key, message] of Object.entries(pack)) {
        const english = (en as Record<string, string>)[key];
        expect(argsOf(message), `${file} ${key}`).toEqual(argsOf(english));
        const values = Object.fromEntries(argsOf(message).map((arg) => [arg, 2]));
        expect(() => format(message, 'en', values), `${file} ${key}`).not.toThrow();
      }
    });
  }
});
