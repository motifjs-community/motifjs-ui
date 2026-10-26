/**
 * What a drop does: `strip` puts the document among a group's tabs, `group` into a group or a new
 * group beside it, `edge` into a new group along an edge of the documents' area. `dock-guide` is a
 * guide over a group (it does what `group` does), `dock-area` a guide at the manager's edge or a
 * folded area's strip (into that dock area), `float` a floating window there (for a window being
 * moved, where it is let go). `new-window` is past the edge of the browser window (into a new
 * window there), `main-window` past the edge of a new window (back to the main window). `outside`
 * is beyond every manager where nothing may float, and is refused. A drop target of the app may name kinds of its own.
 */
export type TabDropTargetKind = 'strip' | 'group' | 'edge' | 'dock-guide' | 'dock-area' | 'float' | 'new-window' | 'main-window' | 'outside' | (string & {});
