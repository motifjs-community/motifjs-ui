/**
 * What a drop does: `strip` puts the document among a group's tabs, `group` into a group or a new
 * group beside it, `edge` into a new group along an edge of the whole layout. `outside` is beyond
 * every manager, and is refused. A drop target of the app may name kinds of its own.
 */
export type TabDropTargetKind = 'strip' | 'group' | 'edge' | 'outside' | (string & {});
