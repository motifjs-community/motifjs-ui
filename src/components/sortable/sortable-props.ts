import type { Bind, ComponentBase } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { SortableDragEventArgs } from './sortable-drag-event-args';
import type { SortableDropEventArgs } from './sortable-drop-event-args';
import type { SortableOrientation } from './sortable-orientation';

/** Props of `Sortable`. Each prop is also a settable property, and a function is tracked. */
export interface SortableProps<T = unknown> extends ControlProps {
    /** The items, drawn with `itemTemplate`; without them the JSX children are the items. */
    items?: Bind<readonly T[]>;
    /** Makes the component of an item. A function, so it is not bound like the other props. Default: the item's text. */
    itemTemplate?: (item: T, index: number) => ComponentBase;
    /** A selector inside an item that takes the drag (and the keys); without one the whole item does. */
    handle?: Bind<string | null>;
    /** Sortables of one group take each other's items. */
    group?: Bind<string | null>;
    /** The items can be moved. Default `true`. */
    allowReordering?: Bind<boolean>;
    /** Default `'vertical'`. */
    orientation?: Bind<SortableOrientation>;
    /** What screen readers call the list. */
    label?: Bind<string>;
    /** A drag is about to start; cancelable. */
    onDragStarting?: (e: SortableDragEventArgs<T>) => void;
    /** The place it would land changed; cancelable (the place is refused). */
    onDragChanging?: (e: SortableDragEventArgs<T>) => void;
    /** The drag is about to end; cancelable. */
    onDragEnding?: (e: SortableDragEventArgs<T>) => void;
    /** An item moved within this sortable (by a drop or the keys). */
    onReorder?: (e: SortableDropEventArgs<T>) => void;
    /** An item came in from another sortable of the group. */
    onAdd?: (e: SortableDropEventArgs<T>) => void;
    /** An item went to another sortable of the group. */
    onRemove?: (e: SortableDropEventArgs<T>) => void;
}
