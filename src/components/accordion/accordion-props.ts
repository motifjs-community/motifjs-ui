import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { AccordionChevron } from './accordion-chevron';
import type { AccordionExpandedEventArgs } from './accordion-expanded-event-args';
import type { AccordionExpandingEventArgs } from './accordion-expanding-event-args';
import type { AccordionVariant } from './accordion-variant';

/** Props of `Accordion`, in addition to the shared `ControlProps`. Each prop is also a settable, reactive property. */
export interface AccordionProps extends ControlProps {
  /** The keys of the open items (an item without a key uses its index). `x-model` provides two-way binding. */
  value?: Bind<readonly (string | number)[] | null | undefined>;
  /** Allows several items to be open. The default is `false`, so opening one closes the other. */
  multiple?: Bind<boolean>;
  /** Allows the open item to be closed. The default is `true`. With `false`, one item stays open. */
  collapsible?: Bind<boolean>;
  /** The `aria-level` of the headers, 1 to 6. The default is 3. */
  headingLevel?: Bind<number>;
  /** Up, Down, Home and End move between the headers. The default is `true`. */
  arrowKeys?: Bind<boolean>;
  /** Makes sections `role="region"` landmarks. The default, `'auto'`, applies when there are six items or fewer. */
  regions?: Bind<boolean | 'auto'>;
  /** The default is `'list'`. */
  variant?: Bind<AccordionVariant>;
  /** The default is `'md'`. */
  size?: Bind<ControlSize>;
  /** The default is `'end'`. */
  chevron?: Bind<AccordionChevron>;
  /** Creates a section when first opened and then keeps it. An item's own `lazy` takes precedence. The default is `true`. */
  lazy?: Bind<boolean>;
  /**
   * With `false`, content created by an item's `content` is disposed when it closes. An item's own `keepAlive`
   * takes precedence. The default is `true`.
   */
  keepAlive?: Bind<boolean>;
  /** Occurs before the user opens an item. This event is cancelable. */
  onExpanding?: (e: AccordionExpandingEventArgs) => void;
  /** Occurs before the user closes an item. This event is cancelable. */
  onCollapsing?: (e: AccordionExpandingEventArgs) => void;
  onExpanded?: (e: AccordionExpandedEventArgs) => void;
  onCollapsed?: (e: AccordionExpandedEventArgs) => void;
}
