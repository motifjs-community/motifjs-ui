import type { Bind } from '@motifx/core';
import type { DropDownProps } from '../dropdown/drop-down-props';
import type { LookupColumn } from './lookup-column';

/** Props of `Lookup`: the drop-down props plus its columns. */
export interface LookupProps<T, V> extends DropDownProps<T, V> {
  /** The columns of the list, under a header. Without them it lists the text. */
  columns?: Bind<readonly LookupColumn<T>[]>;
  /** Default `true`. */
  showColumnHeaders?: Bind<boolean>;
  /** The least width of the list, a CSS length. Default from the `lookup.popup-width` token. */
  popupWidth?: Bind<string>;
}
