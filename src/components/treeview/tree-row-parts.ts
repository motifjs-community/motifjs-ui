import type { Component } from '@motifx/core';

/** The parts of a drawn row: the item, its line with the expander and check box, the group of its open children and its load error. */
export interface TreeRowParts {
  item: Component<HTMLDivElement>;
  line: Component<HTMLDivElement>;
  expander: Component<HTMLSpanElement>;
  /** Drawn while check boxes show. */
  check: Component<HTMLSpanElement> | null;
  group: Component<HTMLDivElement> | null;
  error: Component<HTMLSpanElement> | null;
  /** The load error's retry button. */
  retry: Component<HTMLButtonElement> | null;
}
