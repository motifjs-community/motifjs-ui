import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { AccordionChevron } from './accordion-chevron';
import type { AccordionExpandedEventArgs } from './accordion-expanded-event-args';
import type { AccordionExpandingEventArgs } from './accordion-expanding-event-args';
import type { AccordionVariant } from './accordion-variant';

/** Props of `Accordion`: the shared `ControlProps` plus its own. Each one is also a settable, reactive property. */
export interface AccordionProps extends ControlProps {
  /** The open items' keys (an item without a key: its index). `x-model` binds it two-way. */
  value?: Bind<readonly (string | number)[] | null | undefined>;
  /** Several items can be open at once. Default `false`: opening one closes the other. */
  multiple?: Bind<boolean>;
  /** The open item can be closed. Default `true`; `false` keeps one item open. */
  collapsible?: Bind<boolean>;
  /** The `aria-level` of the headers, 1 to 6. Default 3. */
  headingLevel?: Bind<number>;
  /** Up, Down, Home and End move between the headers. Default `true`. */
  arrowKeys?: Bind<boolean>;
  /** Sections are `role="region"` landmarks: `'auto'` (default) while there are six items or fewer. */
  regions?: Bind<boolean | 'auto'>;
  /** Default `'list'`. */
  variant?: Bind<AccordionVariant>;
  /** Default `'md'`. */
  size?: Bind<ControlSize>;
  /** Default `'end'`. */
  chevron?: Bind<AccordionChevron>;
  /** A section is built when first opened, then kept (an item's own `lazy` wins). Default `true`. */
  lazy?: Bind<boolean>;
  /** `false`: content made by an item's `content` is disposed when it closes (an item's own `keepAlive` wins). Default `true`. */
  keepAlive?: Bind<boolean>;
  /** The user is about to open an item; cancelable. */
  onExpanding?: (e: AccordionExpandingEventArgs) => void;
  /** The user is about to close an item; cancelable. */
  onCollapsing?: (e: AccordionExpandingEventArgs) => void;
  onExpanded?: (e: AccordionExpandedEventArgs) => void;
  onCollapsed?: (e: AccordionExpandedEventArgs) => void;
}
