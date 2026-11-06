import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { IconSource } from '../../core/icon-source';
import type { ContentFactory } from '../tabs/PanelContent';

/**
 * Props of `AccordionItem`: a header and the section it opens; the JSX children are the
 * section. Each prop is also a settable, reactive property. `lazy` and `keepAlive` left unset
 * follow the `Accordion`.
 */
export interface AccordionItemProps extends ControlProps {
  /** The header text; `&Shipping` makes Alt+S open or close it. The same property as `text`. */
  title?: Bind<string>;
  /** Names the item in `Accordion.value`; without it the item's index does. */
  key?: Bind<string>;
  expanded?: Bind<boolean>;
  icon?: Bind<IconSource | null | undefined>;
  /** Shown as a tooltip on the header. */
  hint?: Bind<string>;
  /** Builds the section when it is first opened. */
  lazy?: Bind<boolean | undefined>;
  /** `false`: what `content` made is disposed when the item closes and recreated when it opens. */
  keepAlive?: Bind<boolean | undefined>;
  /** Makes the section content, called when the section is built (instead of, or after, the JSX children). */
  content?: ContentFactory;
}
