/**
 * What a drop does. `strip` places the document among a group's tabs, `group` places it in a group or
 * a new group beside it, and `edge` places it in a new group along an edge of the document area.
 * `dock-guide` is a guide over a group, which does the same as `group`. `dock-area` is a guide at the
 * manager's edge or a collapsed area's strip, which places it in that dock area. `float` is a floating
 * window at that point, or for a window being moved, where it is released. `new-window` is past the
 * edge of the browser window, which opens a new window there. `main-window` is past the edge of a new
 * window, which returns it to the main window. `outside` is beyond every manager where nothing can
 * float, and is refused. A custom drop target can name its own kinds.
 */
export type TabDropTargetKind = 'strip' | 'group' | 'edge' | 'dock-guide' | 'dock-area' | 'float' | 'new-window' | 'main-window' | 'outside' | (string & {});
