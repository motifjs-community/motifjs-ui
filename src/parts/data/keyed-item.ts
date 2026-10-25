/** What `KeyedItems` knows of one key: still asked for, found (with its item, or a text an editor chose), or not in the source. */
export interface KeyedItem<T> {
  state: 'loading' | 'found' | 'missing';
  item?: T;
  /** A text remembered for the key without its item. */
  text?: string;
  /** `missing` because the request failed, not because the source said so. */
  failed?: boolean;
}
