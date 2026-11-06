import type { Bind } from '@motifx/core';
import type { ItemField } from '../../parts/list/item-field';

/** One column of a lookup's list. */
export interface LookupColumn<T> {
  field: ItemField<T>;
  caption?: Bind<string>;
  /** A CSS grid track, such as `8rem` or `2fr`. The default is `1fr`. */
  width?: Bind<string>;
  /** The default is `'start'`. */
  align?: Bind<'start' | 'center' | 'end'>;
}
