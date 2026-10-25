import type { MaskSlot } from './mask-slot';

type Place = Extract<MaskSlot, { test: RegExp }>;

function accepts(place: Place, ch: string): boolean {
  place.test.lastIndex = 0;
  return place.test.test(ch);
}

function cased(ch: string, transform: Place['transform']): string {
  if (transform === 'upper') return ch.toLocaleUpperCase();
  if (transform === 'lower') return ch.toLocaleLowerCase();
  return ch;
}

/**
 * The characters typed into a mask, and the edits on them. Positions are positions in the shown
 * text, where every place of the mask is one character.
 */
export class MaskedText {
  private chars: string[] = [];
  /** Where each place to fill is shown. */
  private readonly places: number[];

  constructor(
    readonly slots: readonly MaskSlot[],
    readonly placeholder = '_',
  ) {
    this.places = slots.flatMap((slot, i) => ('test' in slot ? [i] : []));
  }

  get raw(): string {
    return this.chars.join('');
  }

  get empty(): boolean {
    return !this.chars.length;
  }

  /** Every place that may not stay empty is filled. */
  get complete(): boolean {
    return this.places.slice(this.chars.length).every((i) => (this.slots[i] as Place).optional);
  }

  /** The whole mask: typed characters, fixed ones and placeholders. */
  get text(): string {
    let k = 0;
    return this.slots.map((slot) => ('literal' in slot ? slot.literal : (this.chars[k++] ?? this.placeholder))).join('');
  }

  /** The typed characters with the fixed ones between them, without trailing placeholders. */
  get formatted(): string {
    return this.chars.length ? this.text.slice(0, this.places[this.chars.length - 1] + 1) : '';
  }

  setRaw(raw: string): void {
    this.chars = this.fit(0, raw, false);
  }

  /** Takes text that may hold the fixed characters too, e.g. a pasted `(532) 123 45 67`. */
  setText(text: string): void {
    this.chars = this.fit(0, text, true);
  }

  /** Where the k-th typed character is shown; past the last place, the end. */
  positionOf(k: number): number {
    return k < this.places.length ? this.places[k] : this.slots.length;
  }

  /** The caret stops at the first empty place. */
  clamp(position: number): number {
    return Math.min(position, this.positionOf(this.chars.length));
  }

  /** Replaces the selection with typed or pasted text and returns the new caret position. */
  insert(from: number, to: number, text: string): number {
    const start = this.countBefore(from);
    const end = Math.max(start, this.countBefore(to));
    const typed = this.fit(from, text, true);
    this.refit([...this.chars.slice(0, start), ...typed, ...this.chars.slice(end)]);
    return this.positionOf(Math.min(start + typed.length, this.chars.length));
  }

  deleteBackward(from: number, to: number): number {
    if (from !== to) return this.remove(from, to);
    const at = Math.min(this.countBefore(from), this.chars.length);
    if (!at) return from;
    this.refit(this.chars.filter((_, i) => i !== at - 1));
    return this.positionOf(at - 1);
  }

  deleteForward(from: number, to: number): number {
    if (from !== to) return this.remove(from, to);
    const at = this.countBefore(from);
    if (at < this.chars.length) this.refit(this.chars.filter((_, i) => i !== at));
    return from;
  }

  private remove(from: number, to: number): number {
    const start = this.countBefore(from);
    const end = this.countBefore(to);
    this.refit([...this.chars.slice(0, start), ...this.chars.slice(end)]);
    return this.clamp(from);
  }

  private countBefore(position: number): number {
    let n = 0;
    while (n < this.places.length && this.places[n] < position) n++;
    return n;
  }

  /** Characters that moved to a place they do not fit are dropped. */
  private refit(chars: string[]): void {
    this.chars = this.fit(0, chars.join(''), false);
  }

  /** Places `text` from position `from` on, skipping what does not fit; `literals` lets it hold the fixed characters. */
  private fit(from: number, text: string, literals: boolean): string[] {
    const placed: string[] = [];
    let j = 0;
    for (let i = from; i < this.slots.length && j < text.length; i++) {
      const slot = this.slots[i];
      if ('literal' in slot) {
        if (literals && text[j] === slot.literal) j++;
        continue;
      }
      while (j < text.length) {
        const ch = text[j++];
        if (accepts(slot, ch)) {
          placed.push(cased(ch, slot.transform));
          break;
        }
      }
    }
    return placed;
  }
}
