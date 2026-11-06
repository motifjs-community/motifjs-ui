import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { TabCloseEventArgs } from './tab-close-event-args';
import type { TabSelectingEventArgs } from './tab-selecting-event-args';
import type { TabSelectionChangedEventArgs } from './tab-selection-changed-event-args';
import type { TabsActivation } from './tabs-activation';
import type { TabsPlacement } from './tabs-placement';
import type { TabsVariant } from './tabs-variant';

/** Props of `Tabs`: the shared `ControlProps` plus its own. Each prop is also a settable, reactive property. */
export interface TabsProps extends ControlProps {
  /** Names the tab list for screen readers. The same property as `text`. */
  label?: Bind<string>;
  /** The selected tab's `key`, else its index. `x-model` binds it two-way. */
  value?: Bind<string | number | null | undefined>;
  /** The selected tab's index in `tabs`; -1 when there is none. */
  selectedIndex?: Bind<number>;
  /** Default `'auto'`. */
  activation?: Bind<TabsActivation>;
  /** Default `'top'`. */
  placement?: Bind<TabsPlacement>;
  /** Default `'line'`. */
  variant?: Bind<TabsVariant>;
  /** Default `'md'`. */
  size?: Bind<ControlSize>;
  /** The tabs share the whole width. */
  stretch?: Bind<boolean>;
  /** Arrow buttons at the ends of the strip when the tabs do not fit. Default `true`. */
  scrollButtons?: Bind<boolean>;
  /** Every tab gets a close button (a tab's own `closable` wins). Default `false`. */
  closable?: Bind<boolean>;
  /** A panel is built when first shown, then kept (a tab's own `lazy` wins). Default `true`. */
  lazy?: Bind<boolean>;
  /** `false`: content made by a tab's `content` is disposed while hidden (a tab's own `keepAlive` wins). Default `true`. */
  keepAlive?: Bind<boolean>;
  /** The user is about to select a tab; cancelable. */
  onSelecting?: (e: TabSelectingEventArgs) => void;
  onSelectionChanged?: (e: TabSelectionChangedEventArgs) => void;
  /** A tab is about to close; cancelable. */
  onClose?: (e: TabCloseEventArgs) => void;
}
