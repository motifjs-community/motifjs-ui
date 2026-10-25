import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { IconSource } from '../../core/icon-source';
import type { ContentFactory } from './PanelContent';

/**
 * Props of `Tab`: one tab of `Tabs`, its JSX children are the panel. Each one is also a
 * settable, reactive property. `closable`, `lazy` and `keepAlive` left unset follow the `Tabs`.
 */
export interface TabProps extends ControlProps {
  /** The caption; `&General` makes Alt+G select the tab. The same property as `text`. */
  title?: Bind<string>;
  /** Names the tab in `Tabs.value`; without it the tab's index does. */
  key?: Bind<string>;
  icon?: Bind<IconSource | null | undefined>;
  /** A short text or number after the title (a count). Empty or `null` shows none. */
  badge?: Bind<string | number | null | undefined>;
  /** Shown as a tooltip. */
  hint?: Bind<string>;
  /** A close button on the tab; Delete closes it too. */
  closable?: Bind<boolean | undefined>;
  /** Builds the panel when it is first shown. */
  lazy?: Bind<boolean | undefined>;
  /** `false`: what `content` made is disposed while the tab is hidden and made again when it shows. */
  keepAlive?: Bind<boolean | undefined>;
  /** Makes the panel content, called when the panel is built (instead of, or after, the JSX children). */
  content?: ContentFactory;
}
