/** What the header and the column menu ask the grid to do; the grid owns menus, focus and measuring. */
export interface HeaderHost {
  /** Whether the column has a menu (the feature is on and the menu would not be empty). */
  hasMenu(field: string): boolean;
  openMenu(field: string, anchor: HTMLElement): void;
  autoSize(field: string): void;
  autoSizeAll(): void;
  startAdjust(kind: 'move' | 'resize', field: string): void;
  isRtl(): boolean;
  /** Opens the column's header filter next to `anchor`. */
  openHeaderFilter(field: string, anchor: HTMLElement): void;
  /** The header check box: select every row, or none. */
  toggleAll(): void;
  /** The state of the header check box. */
  allState(): boolean | 'mixed';
}
