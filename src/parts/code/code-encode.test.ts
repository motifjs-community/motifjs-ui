import { describe, expect, it } from 'vitest';
import { BarcodeValueError, encodeBarcode } from './barcode-encode';
import { rectsPath } from './code-image';
import { encodeQr } from './qr-encode';

// Output read back by an independent decoder, in every version and level, so that a change in the encoder shows here.
const HELLO_WORLD_Q = [
    '111111100001001111111', '100000101100101000001', '101110100101101011101', '101110101111101011101',
    '101110101101001011101', '100000100100101000001', '111111101010101111111', '000000001101100000000',
    '010111101100111011010', '101111010000111101110', '001010110001001100000', '101101000101100011000',
    '110111111110111011111', '000000001000100101000', '111111100110011001111', '100000101010010010111',
    '101110101101001000111', '101110101011100010100', '101110100100001000011', '100000101110011100110',
    '111111100101000000010'
];

const rows = (modules: boolean[][]) => modules.map(row => row.map(on => (on ? '1' : '0')).join(''));

describe('encodeQr', () => {
    it('gives the verified modules of a known text', () => {
        const code = encodeQr('HELLO WORLD', 'Q');
        expect(code.version).toBe(1);
        expect(rows(code.modules)).toEqual(HELLO_WORLD_Q);
    });

    it('takes the smallest version that holds the text, at each level', () => {
        expect(encodeQr('1'.repeat(41), 'L').version).toBe(1);
        expect(encodeQr('1'.repeat(42), 'L').version).toBe(2);
        expect(encodeQr('1'.repeat(17), 'H').version).toBe(1);
        expect(encodeQr('1'.repeat(18), 'H').version).toBe(2);
    });

    it('grows four modules with each version', () => {
        const code = encodeQr('x'.repeat(500), 'M');
        expect(code.size).toBe(code.version * 4 + 17);
        expect(code.modules).toHaveLength(code.size);
    });

    it('draws the three finder patterns and the dark module', () => {
        const { modules, size } = encodeQr('https://ui.motifjs.com', 'M');
        const finder = [[0, 0], [size - 7, 0], [0, size - 7]];
        for (const [x, y] of finder) {
            expect(modules[y].slice(x, x + 7).every(Boolean)).toBe(true);
            expect(modules[y + 6].slice(x, x + 7).every(Boolean)).toBe(true);
            expect(modules[y + 3].slice(x + 2, x + 5).every(Boolean)).toBe(true);
        }
        expect(modules[size - 8][8]).toBe(true);
    });

    it('takes any character, as UTF-8', () => {
        expect(encodeQr('Türkçe ğüşiöç 日本語 😀').size).toBeGreaterThan(21);
    });

    it('refuses what fits in no version', () => {
        expect(encodeQr('9'.repeat(7089), 'L').version).toBe(40);
        expect(() => encodeQr('9'.repeat(7090), 'L')).toThrow(RangeError);
        expect(() => encodeQr('a'.repeat(1274), 'H')).toThrow(RangeError);
    });
});

describe('encodeBarcode', () => {
    const module = (format: Parameters<typeof encodeBarcode>[1], value: string) => encodeBarcode(value, format);

    it('gives the verified bars of a known EAN-13', () => {
        const code = module('ean13', '4006381333931');
        expect(code.width).toBe(95);
        expect(code.bars).toHaveLength(30);
        expect(code.bars.slice(0, 3).map(b => [b.x, b.width])).toEqual([[0, 1], [2, 1], [6, 2]]);
    });

    it('works out the check digit, and refuses a wrong one', () => {
        expect(module('ean13', '400638133393').text).toBe('4006381333931');
        expect(module('ean8', '9638507').text).toBe('96385074');
        expect(module('upca', '03600029145').text).toBe('036000291452');
        expect(() => module('ean13', '4006381333930')).toThrow(BarcodeValueError);
        expect(() => module('ean8', '96385075')).toThrow(BarcodeValueError);
    });

    it('marks the guard bars of an EAN and a UPC', () => {
        const guards = (code: ReturnType<typeof encodeBarcode>) => code.bars.filter(b => b.guard).length;
        expect(guards(module('ean13', '4006381333931'))).toBe(6);
        expect(guards(module('upca', '036000291452'))).toBeGreaterThan(6);
    });

    it('packs digits in pairs in Code 128', () => {
        expect(module('code128', '123456').width).toBeLessThan(module('code128', 'ABCDEF').width);
        expect(module('code128', '1234').text).toBe('1234');
    });

    it('takes control characters in Code 128, and refuses what is not ASCII', () => {
        expect(module('code128', 'a\tb').bars.length).toBeGreaterThan(0);
        expect(() => module('code128', 'ğ')).toThrow(BarcodeValueError);
    });

    it('turns Code 39 into capitals, adds the check character when asked and refuses other characters', () => {
        expect(module('code39', 'ab-1').text).toBe('AB-1');
        expect(encodeBarcode('ABC', 'code39', true).text).toBe('ABCX');
        expect(() => module('code39', 'a_b')).toThrow(BarcodeValueError);
    });

    it('fills an odd value with a zero in Interleaved 2 of 5, and refuses letters', () => {
        expect(module('itf', '12345').text).toBe('012345');
        expect(() => module('itf', '12a4')).toThrow(BarcodeValueError);
    });

    it('refuses an empty value', () => {
        expect(() => module('code128', '')).toThrow(BarcodeValueError);
        expect(() => module('ean13', '')).toThrow(BarcodeValueError);
    });
});

describe('rectsPath', () => {
    it('writes each rectangle as a closed path', () => {
        expect(rectsPath([{ x: 1, y: 2, width: 3, height: 4 }])).toBe('M1 2h3v4h-3z');
    });
});
