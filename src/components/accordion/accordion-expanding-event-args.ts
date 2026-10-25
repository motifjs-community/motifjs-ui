import type { EventArgs } from '@motifx/core';
import type { Accordion } from './Accordion';
import type { AccordionItem } from './AccordionItem';

/** The user is about to open (or close) an item; `cancel = true` leaves it as it is. */
export interface AccordionExpandingEventArgs extends EventArgs {
  item: AccordionItem;
  index: number;
  source: Accordion;
  event?: Event;
}
