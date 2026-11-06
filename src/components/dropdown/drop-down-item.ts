import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';

/** The item shape that a drop-down reads by default. Any shape works with `textField` / `valueField`. */
export interface DropDownItem<V = unknown> {
  value: V;
  text: Bind<string>;
  icon?: Bind<IconSource>;
  group?: Bind<string>;
  enabled?: Bind<boolean>;
}
