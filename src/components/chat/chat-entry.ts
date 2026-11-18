import type { Component, ComponentBase } from '@motifx/core';
import { loose, part } from '../../core/draw-parts';
import { put } from '../../core/part-writes';

/** The row of one part in a turn's flow: a dot at its start, then what the part draws. */
export interface ChatEntry {
  readonly row: Component<HTMLDivElement>;
  /** Text arrived for the part (markdown, thinking, a tool's output). */
  append(delta: string): void;
  /** The part changed: its state is drawn again. */
  update(): void;
  /** The kit language changed. */
  drawTexts(): void;
  /** What shows the character at `index` of the part's text, for a search: the block of its markdown. */
  found?(index: number): ComponentBase | null;
  /** Its markdown, a long one, is still drawn a piece a frame. */
  drawing?(): boolean;
}

/** The frame every entry shares: the row (`data-kind`), its dot and the column beside it. */
export function entryFrame(kind: string): { row: Component<HTMLDivElement>; main: Component<HTMLDivElement> } {
  const row = loose<HTMLDivElement>('div', 'mx-chat__entry');
  put(row, 'data-kind', kind);
  part<HTMLSpanElement>(row, 'span', 'mx-chat__dot');
  const main = part<HTMLDivElement>(row, 'div', 'mx-chat__entry-main');
  return { row, main };
}
