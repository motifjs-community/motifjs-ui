import type { ComponentBase } from '@motifx/core';

/** What may lie over the candidates of a hit test in one window: the kit's surfaces there, front first, and the modal one. */
export interface HitCover {
  /** Windows, popups and other surfaces that may stand over candidates, front first. */
  readonly surfaces: readonly ComponentBase[];
  /** The modal surface among them: nothing outside it and the surfaces in front of it can be hit, not even under its backdrop. */
  readonly modal?: ComponentBase | null;
}
