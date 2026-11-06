import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { TabCloseEventArgs } from './tab-close-event-args';
import type { TabSelectingEventArgs } from './tab-selecting-event-args';
import type { TabSelectionChangedEventArgs } from './tab-selection-changed-event-args';
import type { TabsActivation } from './tabs-activation';
import type { TabsPlacement } from './tabs-placement';
import type { TabsVariant } from './tabs-variant';

/** Props of `Tabs`, in addition to the shared `ControlProps`. Each prop is also a settable, reactive property. */
export interface TabsProps extends ControlProps {
  /** The accessible name of the tab list. This is the same property as `text`. */
  label?: Bind<string>;
  /** The `key` of the selected tab, or its index. `x-model` provides two-way binding. */
  value?: Bind<string | number | null | undefined>;
  /** The index of the selected tab in `tabs`, or -1 if there is none. */
  selectedIndex?: Bind<number>;
  /** The default is `'auto'`. */
  activation?: Bind<TabsActivation>;
  /** The default is `'top'`. */
  placement?: Bind<TabsPlacement>;
  /** The default is `'line'`. */
  variant?: Bind<TabsVariant>;
  /** The default is `'md'`. */
  size?: Bind<ControlSize>;
  /** Makes the tabs share the full width. */
  stretch?: Bind<boolean>;
  /** Shows arrow buttons at the ends of the strip when tabs do not fit. The default is `true`. */
  scrollButtons?: Bind<boolean>;
  /** Adds a close button to every tab. A tab's own `closable` takes precedence. The default is `false`. */
  closable?: Bind<boolean>;
  /**
   * Creates a panel the first time it is shown and then keeps it. A tab's own `lazy` takes precedence.
   * The default is `true`.
   */
  lazy?: Bind<boolean>;
  /**
   * With `false`, content created by a tab's `content` is disposed while hidden. A tab's own `keepAlive` takes
   * precedence. The default is `true`.
   */
  keepAlive?: Bind<boolean>;
  /** Occurs before the user selects a tab. This event is cancelable. */
  onSelecting?: (e: TabSelectingEventArgs) => void;
  onSelectionChanged?: (e: TabSelectionChangedEventArgs) => void;
  /** Occurs before a tab closes. This event is cancelable. */
  onClose?: (e: TabCloseEventArgs) => void;
}
