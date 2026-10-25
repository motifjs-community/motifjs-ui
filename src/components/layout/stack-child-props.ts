import type { Bind } from '@motifx/core';

/** What a child of a `Stack` may say about its place, in its own props: `<TextBox grow />`. */
export interface StackChildProps {
  /** Takes the free space along the direction; a number shares it in proportion. */
  grow?: Bind<boolean | number>;
}
