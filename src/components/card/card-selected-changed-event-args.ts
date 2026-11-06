import type { Card } from './Card';

export interface CardSelectedChangedEventArgs {
  selected: boolean;
  /** `true` when the user clicked the card or its check box, and `false` when it was set programmatically. */
  byUser: boolean;
  source: Card;
}
