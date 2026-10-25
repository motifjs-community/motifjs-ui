/** What a lookup cell shows: its text, and whether the key is found, still loading, not in the source, or empty. */
export interface LookupCell {
  text: string;
  state: 'found' | 'loading' | 'missing' | 'none';
  /** The tooltip of a key the source does not have. */
  hint?: string;
}
