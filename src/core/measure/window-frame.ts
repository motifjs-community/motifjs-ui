import type { ComponentBase } from '@motifx/core';
import type { Job } from './job';
import type { View } from './view';

/** The measuring work of one window. */
export interface WindowFrame {
  readonly view: View;
  /** For the next round. */
  jobs: Job[];
  /** What onLayout was told, for the next round: one per watch, the last one told wins. */
  notices: Map<object, { component: ComponentBase; notice: () => void }>;
  /** Stops the frame or the timer waited for. */
  waiting: (() => void) | null;
  running: boolean;
  run: number;
  rounds: number;
  /** Reads after writes in this run (`readAgain`). */
  tries: number;
  /** What development already heard of in this run. */
  warned: Set<string>;
  /** Told when the run is over. */
  done: (() => void)[];
}
