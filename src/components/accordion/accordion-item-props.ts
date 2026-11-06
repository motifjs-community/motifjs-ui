import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { IconSource } from '../../core/icon-source';
import type { ContentFactory } from '../tabs/PanelContent';

/**
 * Props of `AccordionItem`: a header and the section it opens, with the JSX children as the section.
 * Each prop is also a settable, reactive property. `lazy` and `keepAlive` inherit from the `Accordion`
 * when they are omitted.
 */
export interface AccordionItemProps extends ControlProps {
  /** The header text. `&Shipping` makes Alt+S toggle the item. This is the same property as `text`. */
  title?: Bind<string>;
  /** Identifies the item in `Accordion.value`. If omitted, the item's index is used. */
  key?: Bind<string>;
  expanded?: Bind<boolean>;
  icon?: Bind<IconSource | null | undefined>;
  /** A tooltip on the header. */
  hint?: Bind<string>;
  /** Creates the section when it is first opened. */
  lazy?: Bind<boolean | undefined>;
  /** With `false`, what `content` created is disposed when the item closes and recreated when it opens. */
  keepAlive?: Bind<boolean | undefined>;
  /** Creates the section content, either instead of or after the JSX children. */
  content?: ContentFactory;
}
