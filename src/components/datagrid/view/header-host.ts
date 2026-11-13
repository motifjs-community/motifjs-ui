import type { ComponentBase } from '@motifx/core';
import type { DragGhost } from '../../../parts/drag/DragGhost';
import type { GroupPanel } from './GroupPanel';

/** What the header and the column menu ask the grid to do; the grid owns menus, focus and measuring. */
export interface HeaderHost {
  /** Whether the column has a menu (the feature is on and the menu would not be empty). */
  hasMenu(field: string): boolean;
  openMenu(field: string, anchor: ComponentBase): void;
  autoSize(field: string): void;
  autoSizeAll(): void;
  startAdjust(kind: 'move' | 'resize', field: string): void;
  isRtl(): boolean;
  /** Opens the column's header filter next to `anchor`. */
  openHeaderFilter(field: string, anchor: ComponentBase): void;
  /** The header check box: select every row, or none. */
  toggleAll(): void;
  /** The state of the header check box. */
  allState(): boolean | 'mixed';
  /** The picture that follows a dragged header. */
  readonly ghost: DragGhost;
  /** The group panel while headers can be dropped on it, else `null`. */
  groupTarget(): GroupPanel<any> | null;
  /** Focus back to the active cell (after a menu changed which columns show). */
  focusActive(): void;
}
