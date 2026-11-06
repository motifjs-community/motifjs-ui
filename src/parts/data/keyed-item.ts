/** What `KeyedItems` knows of one key: loading, found (with its item, or a text an editor selected), or not in the source. */
export interface KeyedItem<T> {
  state: 'loading' | 'found' | 'missing';
  item?: T;
  /** A text stored for the key without its item. */
  text?: string;
  /** Indicates that the key is `missing` because the request failed, not because the source reported it. */
  failed?: boolean;
}
