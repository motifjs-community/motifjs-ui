import type { EventArgs } from '@motifx/core';
import type { Accordion } from './Accordion';
import type { AccordionItem } from './AccordionItem';

/** Provides data for the events before the user opens or closes an item. Set `cancel = true` to keep its state. */
export interface AccordionExpandingEventArgs extends EventArgs {
  item: AccordionItem;
  index: number;
  source: Accordion;
  event?: Event;
}
