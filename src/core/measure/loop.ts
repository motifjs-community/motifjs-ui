import type { ComponentBase } from '@motifx/core';
import type { Job } from './job';
import type { View } from './view';

/** Work for every frame of the window its owner is in. */
export interface Loop {
  readonly owner: ComponentBase;
  readonly job: Job;
  /** The window it runs in now; none while its owner is out of the page. */
  view: View | null;
}
