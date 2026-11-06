import type { Accordion } from './Accordion';
import type { AccordionItem } from './AccordionItem';

export interface AccordionExpandedEventArgs {
  item: AccordionItem;
  index: number;
  /** `true` when the user opened or closed the item, and `false` when it changed programmatically. */
  byUser: boolean;
  source: Accordion;
}
