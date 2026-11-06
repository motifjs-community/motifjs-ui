import type { Bind } from '@motifx/core';

/** The prop a child of a `Stack` sets for its position: `<TextBox grow />`. */
export interface StackChildProps {
  /** Takes the free space along the direction. Numbers share it proportionally. */
  grow?: Bind<boolean | number>;
}
