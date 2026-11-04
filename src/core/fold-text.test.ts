import { describe, expect, it } from 'vitest';
import { foldText } from './fold-text';

describe('foldText', () => {
  it('lowers the case and takes accents and dots off, whatever the machine locale is', () => {
    expect(foldText('İzmir')).toBe('izmir');
    expect(foldText('ÇAĞRI Şen')).toBe('cagri sen');
    expect(foldText('École')).toBe('ecole');
    expect(foldText('Ankara')).toBe('ankara');
  });

  it('leaves plain text alone', () => {
    expect(foldText('customer 012')).toBe('customer 012');
    expect(foldText('')).toBe('');
  });
});
