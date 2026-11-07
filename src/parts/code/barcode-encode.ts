/** The kinds of barcode. */
export type BarcodeFormat = 'code128' | 'code39' | 'ean13' | 'ean8' | 'upca' | 'itf';

/** One bar, in modules from the start of the code. A guard bar runs lower than the others. */
export interface BarcodeBar {
    x: number;
    width: number;
    guard: boolean;
}

export interface BarcodeModel {
    bars: BarcodeBar[];
    /** The width of the code in modules. */
    width: number;
    /** The text under the bars, with the check digit where a format has one. */
    text: string;
}

/** A value a format cannot hold. */
export class BarcodeValueError extends RangeError {}

const CODE128 = '212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 114131 311141 411131 211412 211214 211232 2331112'.split(' ');
const START_A = 103;
const START_B = 104;
const START_C = 105;
const STOP = 106;
const TO_A = 101;
const TO_B = 100;
const TO_C = 99;

const CODE39: Record<string, string> = {
    '0': 'nnnwwnwnn', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnnn', '4': 'nnnwwnnnw', '5': 'wnnwwnnnn', '6': 'nnwwwnnnn', '7': 'nnnwnnwnw', '8': 'wnnwnnwnn', '9': 'nnwwnnwnn',
    A: 'wnnnnwnnw', B: 'nnwnnwnnw', C: 'wnwnnwnnn', D: 'nnnnwwnnw', E: 'wnnnwwnnn', F: 'nnwnwwnnn', G: 'nnnnnwwnw', H: 'wnnnnwwnn', I: 'nnwnnwwnn', J: 'nnnnwwwnn',
    K: 'wnnnnnnww', L: 'nnwnnnnww', M: 'wnwnnnnwn', N: 'nnnnwnnww', O: 'wnnnwnnwn', P: 'nnwnwnnwn', Q: 'nnnnnnwww', R: 'wnnnnnwwn', S: 'nnwnnnwwn', T: 'nnnnwnwwn',
    U: 'wwnnnnnnw', V: 'nwwnnnnnw', W: 'wwwnnnnnn', X: 'nwnnwnnnw', Y: 'wwnnwnnnn', Z: 'nwwnwnnnn', '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn', $: 'nwnwnwnnn',
    '/': 'nwnwnnnwn', '+': 'nwnnnwnwn', '%': 'nnnwnwnwn', '*': 'nwnnwnwnn'
};
const CODE39_ORDER = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%';

const ITF = ['nnwwn', 'wnnnw', 'nwnnw', 'wwnnn', 'nnwnw', 'wnwnn', 'nwwnn', 'nnnww', 'wnnwn', 'nwnwn'];

const EAN_L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const EAN_R = EAN_L.map(code => [...code].map(bit => (bit === '0' ? '1' : '0')).join(''));
const EAN_G = EAN_R.map(code => [...code].reverse().join(''));
const EAN_PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];

const WIDE = 3;

/** Bars from the widths of alternating bars and spaces, starting with a bar. */
function fromWidths(widths: readonly number[]): { bars: BarcodeBar[]; width: number } {
    const bars: BarcodeBar[] = [];
    let x = 0;
    widths.forEach((width, i) => {
        if (i % 2 === 0) bars.push({ x, width, guard: false });
        x += width;
    });
    return { bars, width: x };
}

/** Bars from a pattern of ones and zeros, with the guards marked. */
function fromPattern(pattern: string, isGuard: (at: number) => boolean): { bars: BarcodeBar[]; width: number } {
    const bars: BarcodeBar[] = [];
    for (let at = 0; at < pattern.length; at++) {
        if (pattern[at] !== '1') continue;
        let end = at;
        while (pattern[end + 1] === '1') end++;
        bars.push({ x: at, width: end - at + 1, guard: isGuard(at) });
        at = end;
    }
    return { bars, width: pattern.length };
}

const widthsOf = (code: string) => [...code].map(c => (c === 'w' ? WIDE : 1));

const digitRun = (text: string, from: number) => {
    let end = from;
    while (end < text.length && text[end] >= '0' && text[end] <= '9') end++;
    return end - from;
};

function code128Values(text: string): number[] {
    const out: number[] = [];
    const wantsA = (c: number) => c < 32;
    const firstRun = digitRun(text, 0);
    let set: 'A' | 'B' | 'C';
    if (firstRun === text.length && firstRun % 2 === 0 ? firstRun >= 2 : firstRun >= 4) set = 'C';
    else if ([...text].some(c => wantsA(c.charCodeAt(0)))) set = 'A';
    else set = 'B';
    out.push(set === 'A' ? START_A : set === 'B' ? START_B : START_C);
    let at = 0;
    if (set === 'C' && firstRun % 2 === 1) {
        // An odd run cannot start in pairs, so its first digit goes before them.
        out.length = 0;
        out.push(START_B, text.charCodeAt(0) - 32, TO_C);
        at = 1;
    }
    while (at < text.length) {
        const run = digitRun(text, at);
        if (set === 'C') {
            if (run >= 2) {
                out.push(Number(text.slice(at, at + 2)));
                at += 2;
                continue;
            }
            const code = text.charCodeAt(at);
            set = wantsA(code) ? 'A' : 'B';
            out.push(set === 'A' ? TO_A : TO_B);
            continue;
        }
        const pairs = at + run === text.length ? run >= 4 && run % 2 === 0 : run >= 6;
        if (pairs) {
            if (run % 2 === 1) {
                out.push(text.charCodeAt(at) - 32);
                at++;
            }
            out.push(TO_C);
            set = 'C';
            continue;
        }
        const code = text.charCodeAt(at);
        if (set === 'B' && wantsA(code)) {
            out.push(TO_A);
            set = 'A';
        } else if (set === 'A' && code >= 96) {
            out.push(TO_B);
            set = 'B';
        }
        out.push(code < 32 ? code + 64 : code - 32);
        at++;
    }
    return out;
}

function code128(text: string): BarcodeModel {
    if (!text || [...text].some(c => c.charCodeAt(0) > 127)) throw new BarcodeValueError('code128');
    const values = code128Values(text);
    const check = values.reduce((sum, value, i) => sum + value * Math.max(1, i), 0) % 103;
    const widths = [...values, check, STOP].flatMap(value => [...CODE128[value]].map(Number));
    return { ...fromWidths(widths), text };
}

function code39(value: string, checkDigit: boolean): BarcodeModel {
    const text = value.toUpperCase();
    if (!text || [...text].some(c => !CODE39_ORDER.includes(c))) throw new BarcodeValueError('code39');
    const check = checkDigit ? CODE39_ORDER[[...text].reduce((sum, c) => sum + CODE39_ORDER.indexOf(c), 0) % 43] : '';
    const widths: number[] = [];
    [...`*${text}${check}*`].forEach((c, i, all) => {
        widths.push(...widthsOf(CODE39[c]));
        if (i < all.length - 1) widths.push(1);
    });
    return { ...fromWidths(widths), text: text + check };
}

function itf(value: string): BarcodeModel {
    if (!/^\d+$/.test(value)) throw new BarcodeValueError('itf');
    const text = value.length % 2 === 0 ? value : `0${value}`;
    const widths = [1, 1, 1, 1];
    for (let i = 0; i < text.length; i += 2) {
        const bars = widthsOf(ITF[Number(text[i])]);
        const spaces = widthsOf(ITF[Number(text[i + 1])]);
        bars.forEach((bar, j) => widths.push(bar, spaces[j]));
    }
    widths.push(WIDE, 1, 1);
    return { ...fromWidths(widths), text };
}

/** The check digit of the digits of an EAN or a UPC. */
function eanCheck(digits: string): number {
    const sum = [...digits].reverse().reduce((total, digit, i) => total + Number(digit) * (i % 2 === 0 ? 3 : 1), 0);
    return (10 - (sum % 10)) % 10;
}

function completed(value: string, length: number, format: BarcodeFormat): string {
    if (!/^\d+$/.test(value) || (value.length !== length && value.length !== length - 1)) throw new BarcodeValueError(format);
    const body = value.slice(0, length - 1);
    const check = String(eanCheck(body));
    if (value.length === length && value[length - 1] !== check) throw new BarcodeValueError(format);
    return body + check;
}

function ean13Pattern(code: string): string {
    const parity = EAN_PARITY[Number(code[0])];
    const left = [...code.slice(1, 7)].map((digit, i) => (parity[i] === 'L' ? EAN_L : EAN_G)[Number(digit)]).join('');
    const right = [...code.slice(7)].map(digit => EAN_R[Number(digit)]).join('');
    return `101${left}01010${right}101`;
}

const middleGuard = (center: number) => (at: number) => at < 3 || (at >= center && at < center + 5);

function ean13(value: string): BarcodeModel {
    const code = completed(value, 13, 'ean13');
    const pattern = ean13Pattern(code);
    const guard = middleGuard(45);
    return { ...fromPattern(pattern, at => guard(at) || at >= 92), text: code };
}

function upca(value: string): BarcodeModel {
    const code = completed(value, 12, 'upca');
    const pattern = ean13Pattern(`0${code}`);
    const guard = middleGuard(45);
    return { ...fromPattern(pattern, at => guard(at) || at >= 92 || at < 10 || at >= 85), text: code };
}

function ean8(value: string): BarcodeModel {
    const code = completed(value, 8, 'ean8');
    const left = [...code.slice(0, 4)].map(digit => EAN_L[Number(digit)]).join('');
    const right = [...code.slice(4)].map(digit => EAN_R[Number(digit)]).join('');
    const guard = middleGuard(31);
    return { ...fromPattern(`101${left}01010${right}101`, at => guard(at) || at >= 64), text: code };
}

/**
 * The bars of `value` in `format`. EAN and UPC values may leave out the check digit. `checkDigit` adds the optional one
 * of Code 39. Throws a `BarcodeValueError` when the format cannot hold the value.
 */
export function encodeBarcode(value: string, format: BarcodeFormat = 'code128', checkDigit = false): BarcodeModel {
    switch (format) {
        case 'code39':
            return code39(value, checkDigit);
        case 'ean13':
            return ean13(value);
        case 'ean8':
            return ean8(value);
        case 'upca':
            return upca(value);
        case 'itf':
            return itf(value);
        default:
            return code128(value);
    }
}
