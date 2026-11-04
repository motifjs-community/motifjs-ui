import { describe, expect, it } from 'vitest';
import { foldText } from './fold-text';

describe('foldText', () => {
  it('lowers the case and takes accents and dots off, whatever the machine locale is', () => {
    expect(foldText('İzmir')).toBe('izmir');
    expect(foldText('ÇAĞRI Şen')).toBe('cagri sen');
    expect(foldText('École')).toBe('ecole');
    expect(foldText('Ankara')).toBe('ankara');
  });

  it('takes the locale a search gives: Turkish lowers I to ı', () => {
    expect(foldText('ISPARTA', 'tr')).toBe('ısparta');
    expect(foldText('ISPARTA', 'en')).toBe('isparta');
  });

  it('leaves plain text alone', () => {
    expect(foldText('customer 012')).toBe('customer 012');
    expect(foldText('')).toBe('');
  });
});
