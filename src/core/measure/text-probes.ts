import type { Component, ComponentBase } from '@motifx/core';
import { part, removePart } from '../draw-parts';
import { css, put, text } from '../part-writes';
import { lookVersion } from './look';
import { rectOf } from './read';
import type { Size } from './size';

// The probes stand in a box of no size that clips them and is never seen; each text takes its font from the host.
const BOX: readonly [string, string][] = [
  ['position', 'absolute'],
  ['inset-block-start', '0'],
  ['inset-inline-start', '0'],
  ['inline-size', '0'],
  ['block-size', '0'],
  ['overflow', 'hidden'],
  ['visibility', 'hidden'],
  ['pointer-events', 'none'],
];

const NO_SIZE: Size = { width: 0, height: 0 };

/** The hidden text probes of one part: a text written once and read once, its size kept until the look changes. */
export class TextProbes {
  private readonly sizes = new Map<string, Size>();
  private readonly probes = new Map<string, Component<HTMLSpanElement>>();
  private box: Component<HTMLSpanElement> | null = null;
  private version = lookVersion();

  constructor(
    private readonly host: ComponentBase,
    private readonly className: string,
  ) {}

  /** Writes the texts not known yet into probes, read in the next read phase. */
  write(texts: readonly string[]): void {
    if (this.version !== lookVersion()) {
      this.version = lookVersion();
      this.sizes.clear();
    }
    if (this.host.isDisposed) return;
    for (const value of texts) {
      const written = this.probes.get(value);
      if (this.sizes.has(value) || (written && !written.isDisposed)) continue;
      // The host may have cleared its parts, the box with them: a new one takes its place.
      const box = this.box && !this.box.isDisposed ? this.box : this.makeBox();
      const probe = part<HTMLSpanElement>(box, 'span', 'mx-measure-text');
      css(probe, 'position', 'absolute');
      css(probe, 'white-space', 'pre');
      text(probe, value);
      this.probes.set(value, probe);
    }
  }

  /** The sizes of `texts` (the height of a line of the font): the known ones as kept, the others read from their probes. */
  read(texts: readonly string[]): Size[] {
    return texts.map((value) => {
      const known = this.sizes.get(value);
      if (known !== undefined) return known;
      const probe = this.probes.get(value);
      if (!probe) return NO_SIZE;
      const { width, height } = rectOf(probe);
      return { width, height };
    });
  }

  /** Keeps the sizes read (a text that came out at no width is read again next time) and takes the probes away. */
  keep(texts: readonly string[], sizes: readonly Size[]): void {
    texts.forEach((value, i) => {
      if (sizes[i].width > 0) this.sizes.set(value, sizes[i]);
      removePart(this.probes.get(value));
      this.probes.delete(value);
    });
  }

  private makeBox(): Component<HTMLSpanElement> {
    const box = part<HTMLSpanElement>(this.host, 'span', this.className ? `mx-measure-texts ${this.className}` : 'mx-measure-texts');
    put(box, 'aria-hidden', 'true');
    for (const [name, value] of BOX) css(box, name, value);
    this.box = box;
    return box;
  }
}
