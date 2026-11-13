import type { ComponentBase } from '@motifx/core';
import { afterReads, measure } from './rounds';
import type { Size } from './size';
import { TextProbes } from './text-probes';

/** The text probes of each host, one set per class: a text has another width in another font. */
const sets = new WeakMap<ComponentBase, Map<string, TextProbes>>();

/**
 * Measures how wide `texts` come out in `host`'s font (an HTML part whose children are its own parts): writes the ones
 * not known yet into hidden probes of `host`, reads them all with the next reads of its window, and hands the widths to
 * `write` in the same order. `className`: a class for the probes' box, for kit CSS that gives it the font of the texts
 * (a chart's labels). A width is kept per text until the look changes. Returns what takes it back.
 */
export function textWidths(host: ComponentBase, texts: readonly string[], write: (widths: number[]) => void, className = ''): () => void {
  return textSizes(host, texts, (sizes) => write(sizes.map((size) => size.width)), className);
}

/**
 * `textWidths` with the height of each text too: the height of a line of the font it comes out in, as a drawing that
 * writes the texts itself (an SVG label) lays them out with.
 */
export function textSizes(host: ComponentBase, texts: readonly string[], write: (sizes: Size[]) => void, className = ''): () => void {
  if (host.isDisposed) return () => {};
  let byClass = sets.get(host);
  if (!byClass) sets.set(host, (byClass = new Map()));
  let probes = byClass.get(className);
  if (!probes) byClass.set(className, (probes = new TextProbes(host, className)));
  const list = [...texts];
  const own = probes;
  afterReads(() => own.write(list));
  return measure(
    host,
    () => own.read(list),
    (sizes) => {
      own.keep(list, sizes);
      write(sizes);
    },
  );
}
