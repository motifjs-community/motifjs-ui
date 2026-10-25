import type { Bind } from '@motifx/core';
import type { ItemField } from '../../parts/list/item-field';

/** One column of a lookup's list. */
export interface LookupColumn<T> {
  field: ItemField<T>;
  caption?: Bind<string>;
  /** A CSS grid track: `8rem`, `2fr`. Default `1fr`. */
  width?: Bind<string>;
  /** Default `'start'`. */
  align?: Bind<'start' | 'center' | 'end'>;
}
