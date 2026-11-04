import type { Card } from './Card';

export interface CardSelectedChangedEventArgs {
  selected: boolean;
  /** `true` when the user pressed it or its check box, `false` when code set it. */
  byUser: boolean;
  source: Card;
}
