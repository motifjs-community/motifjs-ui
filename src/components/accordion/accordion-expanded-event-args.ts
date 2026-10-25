import type { Accordion } from './Accordion';
import type { AccordionItem } from './AccordionItem';

export interface AccordionExpandedEventArgs {
  item: AccordionItem;
  index: number;
  /** `true` when the user opened or closed it, `false` when code did. */
  byUser: boolean;
  source: Accordion;
}
