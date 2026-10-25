/** What an editor reports back to the grid. */
export interface EditorHost {
  /** Keep the value and close (a custom editor's `commit()`). */
  commit(): void;
  /** Close without keeping the value (a custom editor's `cancel()`). */
  cancel(): void;
}
