import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { IconSource } from '../../core/icon-source';
import type { ContentFactory } from './PanelContent';

/**
 * Props of `Tab`, one tab of `Tabs`, with the JSX children as the panel. Each prop is also a
 * settable, reactive property. `closable`, `lazy` and `keepAlive` inherit from the `Tabs` when they are omitted.
 */
export interface TabProps extends ControlProps {
  /** The caption. `&General` makes Alt+G select the tab. This is the same property as `text`. */
  title?: Bind<string>;
  /** Identifies the tab in `Tabs.value`. If omitted, the tab's index is used. */
  key?: Bind<string>;
  icon?: Bind<IconSource | null | undefined>;
  /** Short text after the title, such as a count. An empty value or `null` hides it. */
  badge?: Bind<string | number | null | undefined>;
  /** The tooltip text. */
  hint?: Bind<string>;
  /** Shows a close button on the tab. Delete also closes it. */
  closable?: Bind<boolean | undefined>;
  /** Creates the panel when it is first shown. */
  lazy?: Bind<boolean | undefined>;
  /** With `false`, what `content` created is disposed while the tab is hidden and recreated when it is shown. */
  keepAlive?: Bind<boolean | undefined>;
  /** Creates the panel content, either instead of or after the JSX children. */
  content?: ContentFactory;
}
