import type { Toolbar } from './Toolbar';

/** Whether a toolbar shows a command now (`'shown'`), can take it (`'absent'`), or cannot (`'none'`). */
export type ToolbarTargetState = 'shown' | 'absent' | 'none';

/** A toolbar of the page as a place menus send commands to; the toolbar keeps it up to date. */
export interface ToolbarTarget {
  toolbar: Toolbar;
  /** The toolbar's name, as the menus write it. */
  name(): string;
  state(command: string): ToolbarTargetState;
  /** Shows the command on the toolbar: its item shown again, else a new item the user added. */
  add(command: string): boolean;
  /** Takes the command away: an item the user added is removed, an item of the app hidden. */
  remove(command: string): boolean;
}

// The toolbars that take commands from the menus (`customizable` and `acceptCommands`), in the order they came.
const targets: ToolbarTarget[] = [];

export const toolbarTargets = {
  add(target: ToolbarTarget): void {
    if (!targets.includes(target)) targets.push(target);
  },

  remove(target: ToolbarTarget): void {
    const at = targets.indexOf(target);
    if (at >= 0) targets.splice(at, 1);
  },

  list(): readonly ToolbarTarget[] {
    return targets.filter((target) => !target.toolbar.isDisposed);
  },
};
