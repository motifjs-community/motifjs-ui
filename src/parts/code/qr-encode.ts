/** How much of a QR code can be restored when it is damaged: about 7, 15, 25 or 30 percent. */
export type QrLevel = 'L' | 'M' | 'Q' | 'H';

/** A QR code: `modules[y][x]` is `true` for a dark module. */
export interface QrMatrix {
    version: number;
    size: number;
    modules: boolean[][];
}

// Per version 1 to 40: the error correction codewords of a block, and the number of blocks (ISO/IEC 18004).
const ECC_PER_BLOCK: Record<QrLevel, number[]> = {
    L: [7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    M: [10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    Q: [13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    H: [17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
};
const BLOCKS: Record<QrLevel, number[]> = {
    L: [1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    M: [1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    Q: [1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    H: [1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
};
const LEVEL_BITS: Record<QrLevel, number> = { L: 1, M: 0, Q: 3, H: 2 };
const ALPHANUMERIC = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

interface Mode {
    indicator: number;
    /** The width of the character count: versions 1 to 9, 10 to 26 and 27 to 40. */
    countBits: [number, number, number];
}

const MODES: Record<'numeric' | 'alphanumeric' | 'byte', Mode> = {
    numeric: { indicator: 1, countBits: [10, 12, 14] },
    alphanumeric: { indicator: 2, countBits: [9, 11, 13] },
    byte: { indicator: 4, countBits: [8, 16, 16] }
};

class Bits {
    bits: number[] = [];

    add(value: number, width: number): void {
        for (let i = width - 1; i >= 0; i--) this.bits.push((value >>> i) & 1);
    }
}

// The field of 256 elements the error correction works in, as tables of powers.
const EXP = new Uint8Array(510);
const LOG = new Uint8Array(256);
for (let i = 0, x = 1; i < 255; i++) {
    EXP[i] = EXP[i + 255] = x;
    LOG[x] = i;
    x = x & 0x80 ? ((x << 1) ^ 0x11d) & 0xff : x << 1;
}

const times = (a: number, b: number) => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]);

function generator(degree: number): number[] {
    let poly = [1];
    for (let i = 0; i < degree; i++) {
        const next = new Array<number>(poly.length + 1).fill(0);
        poly.forEach((c, j) => {
            next[j] ^= c;
            next[j + 1] ^= times(c, EXP[i]);
        });
        poly = next;
    }
    return poly.slice(1);
}

function remainder(data: readonly number[], divisor: readonly number[]): number[] {
    const rest = new Array<number>(divisor.length).fill(0);
    for (const byte of data) {
        const factor = byte ^ (rest.shift() as number);
        rest.push(0);
        divisor.forEach((c, i) => (rest[i] ^= times(c, factor)));
    }
    return rest;
}

function rawModules(version: number): number {
    let count = (16 * version + 128) * version + 64;
    if (version >= 2) {
        const aligns = Math.floor(version / 7) + 2;
        count -= (25 * aligns - 10) * aligns - 55;
        if (version >= 7) count -= 36;
    }
    return count;
}

const dataCodewords = (version: number, level: QrLevel) => Math.floor(rawModules(version) / 8) - ECC_PER_BLOCK[level][version - 1] * BLOCKS[level][version - 1];

function modeOf(text: string): Mode {
    if (/^\d+$/.test(text)) return MODES.numeric;
    if ([...text].every(c => ALPHANUMERIC.includes(c))) return MODES.alphanumeric;
    return MODES.byte;
}

function payload(text: string, mode: Mode): { bits: Bits; count: number } {
    const bits = new Bits();
    if (mode === MODES.numeric) {
        for (let i = 0; i < text.length; i += 3) {
            const group = text.slice(i, i + 3);
            bits.add(Number(group), group.length * 3 + 1);
        }
        return { bits, count: text.length };
    }
    if (mode === MODES.alphanumeric) {
        for (let i = 0; i < text.length; i += 2) {
            const a = ALPHANUMERIC.indexOf(text[i]);
            if (i + 1 < text.length) bits.add(a * 45 + ALPHANUMERIC.indexOf(text[i + 1]), 11);
            else bits.add(a, 6);
        }
        return { bits, count: text.length };
    }
    const bytes = new TextEncoder().encode(text);
    for (const byte of bytes) bits.add(byte, 8);
    return { bits, count: bytes.length };
}

const countWidth = (mode: Mode, version: number) => mode.countBits[version <= 9 ? 0 : version <= 26 ? 1 : 2];

function pickVersion(mode: Mode, used: number, count: number, level: QrLevel): number {
    for (let version = 1; version <= 40; version++) {
        const width = countWidth(mode, version);
        if (count < 2 ** width && 4 + width + used <= dataCodewords(version, level) * 8) return version;
    }
    throw new RangeError('The text is too long for a QR code.');
}

function codewords(text: string, level: QrLevel): { version: number; bytes: number[] } {
    const mode = modeOf(text);
    const { bits: body, count } = payload(text, mode);
    const version = pickVersion(mode, body.bits.length, count, level);
    const capacity = dataCodewords(version, level) * 8;
    const out = new Bits();
    out.add(mode.indicator, 4);
    out.add(count, countWidth(mode, version));
    out.bits.push(...body.bits);
    out.add(0, Math.min(4, capacity - out.bits.length));
    out.add(0, (8 - (out.bits.length % 8)) % 8);
    for (let pad = 0xec; out.bits.length < capacity; pad ^= 0xec ^ 0x11) out.add(pad, 8);
    const bytes: number[] = [];
    for (let i = 0; i < out.bits.length; i += 8) bytes.push(out.bits.slice(i, i + 8).reduce((byte, bit) => (byte << 1) | bit, 0));
    return { version, bytes };
}

// The data split into blocks, each with its error correction, and read across the blocks.
function withCorrection(data: readonly number[], version: number, level: QrLevel): number[] {
    const count = BLOCKS[level][version - 1];
    const eccLength = ECC_PER_BLOCK[level][version - 1];
    const total = Math.floor(rawModules(version) / 8);
    const shortBlocks = count - (total % count);
    const shortLength = Math.floor(total / count) - eccLength;
    const divisor = generator(eccLength);
    const blocks: number[][] = [];
    const corrections: number[][] = [];
    for (let i = 0, at = 0; i < count; i++) {
        const length = shortLength + (i < shortBlocks ? 0 : 1);
        const block = data.slice(at, at + length);
        at += length;
        blocks.push(block);
        corrections.push(remainder(block, divisor));
    }
    const out: number[] = [];
    for (let i = 0; i <= shortLength; i++) {
        blocks.forEach(block => {
            if (i < block.length) out.push(block[i]);
        });
    }
    for (let i = 0; i < eccLength; i++) corrections.forEach(block => out.push(block[i]));
    return out;
}

function alignmentCenters(version: number): number[] {
    if (version === 1) return [];
    const count = Math.floor(version / 7) + 2;
    const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (count * 2 - 2)) * 2;
    const centers = [6];
    for (let at = version * 4 + 10; centers.length < count; at -= step) centers.splice(1, 0, at);
    return centers;
}

/** The grid of a code: the drawn modules, and which of them may not be masked. */
class Grid {
    version: number;
    size: number;
    dark: boolean[][];
    fixed: boolean[][];

    constructor(version: number) {
        this.version = version;
        this.size = version * 4 + 17;
        this.dark = Array.from({ length: this.size }, () => new Array<boolean>(this.size).fill(false));
        this.fixed = Array.from({ length: this.size }, () => new Array<boolean>(this.size).fill(false));
        this.drawPatterns();
    }

    set(x: number, y: number, on: boolean): void {
        this.dark[y][x] = on;
        this.fixed[y][x] = true;
    }

    drawPatterns(): void {
        const { size, version } = this;
        for (let i = 0; i < size; i++) {
            this.set(6, i, i % 2 === 0);
            this.set(i, 6, i % 2 === 0);
        }
        this.drawFinder(3, 3);
        this.drawFinder(size - 4, 3);
        this.drawFinder(3, size - 4);
        const centers = alignmentCenters(version);
        const last = centers.length - 1;
        centers.forEach((y, i) => {
            centers.forEach((x, j) => {
                const onFinder = (i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0);
                if (!onFinder) this.drawAlignment(x, y);
            });
        });
        this.drawFormat(LEVEL_BITS.L, 0);
        this.drawVersion();
    }

    drawFinder(cx: number, cy: number): void {
        for (let dy = -4; dy <= 4; dy++) {
            for (let dx = -4; dx <= 4; dx++) {
                const x = cx + dx;
                const y = cy + dy;
                if (x < 0 || y < 0 || x >= this.size || y >= this.size) continue;
                const ring = Math.max(Math.abs(dx), Math.abs(dy));
                this.set(x, y, ring !== 2 && ring !== 4);
            }
        }
    }

    drawAlignment(cx: number, cy: number): void {
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) this.set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
    }

    drawFormat(levelBits: number, mask: number): void {
        const data = (levelBits << 3) | mask;
        let rest = data;
        for (let i = 0; i < 10; i++) rest = (rest << 1) ^ ((rest >>> 9) * 0x537);
        const bits = ((data << 10) | rest) ^ 0x5412;
        const bit = (i: number) => ((bits >>> i) & 1) === 1;
        const { size } = this;
        for (let i = 0; i <= 5; i++) this.set(8, i, bit(i));
        this.set(8, 7, bit(6));
        this.set(8, 8, bit(7));
        this.set(7, 8, bit(8));
        for (let i = 9; i < 15; i++) this.set(14 - i, 8, bit(i));
        for (let i = 0; i < 8; i++) this.set(size - 1 - i, 8, bit(i));
        for (let i = 8; i < 15; i++) this.set(8, size - 15 + i, bit(i));
        this.set(8, size - 8, true);
    }

    drawVersion(): void {
        const { version, size } = this;
        if (version < 7) return;
        let rest = version;
        for (let i = 0; i < 12; i++) rest = (rest << 1) ^ ((rest >>> 11) * 0x1f25);
        const bits = version * 4096 + rest;
        for (let i = 0; i < 18; i++) {
            const on = ((bits >>> i) & 1) === 1;
            const a = size - 11 + (i % 3);
            const b = Math.floor(i / 3);
            this.set(a, b, on);
            this.set(b, a, on);
        }
    }

    // The bits run up and down in columns two wide, from the bottom right.
    place(bytes: readonly number[]): void {
        const { size } = this;
        let at = 0;
        for (let right = size - 1; right >= 1; right -= 2) {
            if (right === 6) right = 5;
            for (let step = 0; step < size; step++) {
                for (const offset of [0, 1]) {
                    const x = right - offset;
                    const up = ((right + 1) & 2) === 0;
                    const y = up ? size - 1 - step : step;
                    if (this.fixed[y][x]) continue;
                    if (at < bytes.length * 8) this.dark[y][x] = ((bytes[at >>> 3] >>> (7 - (at & 7))) & 1) === 1;
                    at++;
                }
            }
        }
    }

    applyMask(mask: number): void {
        const test = MASKS[mask];
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) if (!this.fixed[y][x] && test(x, y)) this.dark[y][x] = !this.dark[y][x];
        }
    }

    penalty(): number {
        const { size, dark } = this;
        let total = 0;
        const line = (read: (i: number) => boolean) => {
            let run = 0;
            let last = false;
            let window = 0;
            for (let i = 0; i < size; i++) {
                const on = read(i);
                if (i > 0 && on === last) {
                    run++;
                    if (run === 5) total += 3;
                    else if (run > 5) total++;
                } else {
                    run = 1;
                    last = on;
                }
                window = ((window << 1) | (on ? 1 : 0)) & 0x7ff;
                if (i >= 10 && (window === 0b10111010000 || window === 0b00001011101)) total += 40;
            }
        };
        for (let i = 0; i < size; i++) {
            line(x => dark[i][x]);
            line(y => dark[y][i]);
        }
        let black = 0;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (dark[y][x]) black++;
                if (x + 1 < size && y + 1 < size && dark[y][x] === dark[y][x + 1] && dark[y][x] === dark[y + 1][x] && dark[y][x] === dark[y + 1][x + 1]) total += 3;
            }
        }
        const percent = (black * 100) / (size * size);
        return total + Math.floor(Math.abs(percent - 50) / 5) * 10;
    }
}

const MASKS: readonly ((x: number, y: number) => boolean)[] = [
    (x, y) => (x + y) % 2 === 0,
    (_x, y) => y % 2 === 0,
    (x, _y) => x % 3 === 0,
    (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
    (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
    (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
    (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0
];

/** The modules of `text`, in the smallest version that holds it. Throws a `RangeError` when it does not fit in any. */
export function encodeQr(text: string, level: QrLevel = 'M'): QrMatrix {
    const { version, bytes } = codewords(text, level);
    const stream = withCorrection(bytes, version, level);
    const grid = new Grid(version);
    grid.place(stream);
    let best = 0;
    let least = Infinity;
    for (let mask = 0; mask < 8; mask++) {
        grid.applyMask(mask);
        grid.drawFormat(LEVEL_BITS[level], mask);
        const score = grid.penalty();
        if (score < least) {
            least = score;
            best = mask;
        }
        grid.applyMask(mask);
    }
    grid.applyMask(best);
    grid.drawFormat(LEVEL_BITS[level], best);
    return { version, size: grid.size, modules: grid.dark };
}
