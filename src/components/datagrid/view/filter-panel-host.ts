/** What the filter panel asks the grid. */
export interface FilterPanelHost {
  /** The filter value as one line of text; `''` without one. Reactive. */
  text(): string;
  openBuilder(): void;
  clear(): void;
  setEnabled(on: boolean): void;
}
