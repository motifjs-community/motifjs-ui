import type { Bind } from '@motifx/core';
import type { FormItem } from './form-item';

/** A tab of a form item's `tabs`: its caption and its own items, laid out on `columns` of its own. */
export interface FormTab {
  title: Bind<string>;
  items: readonly FormItem[];
  columns?: number;
  visible?: Bind<boolean>;
}
