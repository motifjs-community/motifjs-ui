import { describe, expect, it } from 'vitest';
import { formatColor, hsvaToRgba, parseColor, rgbaToHsva } from './colors';

describe('colors', () => {
  it('reads hex and rgb forms, and writes hex', () => {
    expect(parseColor('#f80')).toEqual({ r: 255, g: 136, b: 0, a: 1 });
    expect(parseColor('3b5bdb')).toEqual({ r: 59, g: 91, b: 219, a: 1 });
    expect(parseColor('#3b5bdb80')?.a).toBe(0.5);
    expect(parseColor('rgb(10, 20, 30)')).toEqual({ r: 10, g: 20, b: 30, a: 1 });
    expect(parseColor('rgba(10 20 30 / 50%)')?.a).toBe(0.5);
    expect(parseColor('blue-ish')).toBe(null);
    expect(formatColor({ r: 59, g: 91, b: 219, a: 1 })).toBe('#3b5bdb');
    expect(formatColor({ r: 59, g: 91, b: 219, a: 0.5 })).toBe('#3b5bdb80');
  });

  it('turns rgb into hsv and back unchanged', () => {
    for (const hex of ['#3b5bdb', '#ff0000', '#00ff00', '#123456', '#ffffff', '#000000', '#808080']) {
      const rgba = parseColor(hex)!;
      expect(formatColor(hsvaToRgba(rgbaToHsva(rgba)))).toBe(hex);
    }
    expect(rgbaToHsva({ r: 255, g: 0, b: 0, a: 1 })).toEqual({ h: 0, s: 1, v: 1, a: 1 });
  });
});
