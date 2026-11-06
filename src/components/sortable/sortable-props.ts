import type { Bind, ComponentBase } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { SortableDragEventArgs } from './sortable-drag-event-args';
import type { SortableDropEventArgs } from './sortable-drop-event-args';
import type { SortableOrientation } from './sortable-orientation';

/** Props of `Sortable`. Each prop is also a settable property, and a function is tracked. */
export interface SortableProps<T = unknown> extends ControlProps {
    /** The items, each drawn with `itemTemplate`. Without them, the JSX children are the items. */
    items?: Bind<readonly T[]>;
    /** Creates the component for an item. It is not bound like the other props. The default is the item's text. */
    itemTemplate?: (item: T, index: number) => ComponentBase;
    /** A selector inside an item for the part that handles dragging and the keyboard. Without it, the whole item does. */
    handle?: Bind<string | null>;
    /** Sortables in the same group can exchange items. */
    group?: Bind<string | null>;
    /** Allows items to be moved. The default is `true`. */
    allowReordering?: Bind<boolean>;
    /** The direction of the items. The default is `'vertical'`. */
    orientation?: Bind<SortableOrientation>;
    /** The accessible name of the list. */
    label?: Bind<string>;
    /** Occurs before a drag starts. Set `cancel = true` to prevent it. */
    onDragStarting?: (e: SortableDragEventArgs<T>) => void;
    /** Occurs when the drop position changes. Set `cancel = true` to reject that position. */
    onDragChanging?: (e: SortableDragEventArgs<T>) => void;
    /** Occurs before the drop. Set `cancel = true` to leave everything unchanged. */
    onDragEnding?: (e: SortableDragEventArgs<T>) => void;
    /** Occurs when an item moves within this sortable, by a drop or the keyboard. */
    onReorder?: (e: SortableDropEventArgs<T>) => void;
    /** Occurs when an item arrives from another sortable in the group. */
    onAdd?: (e: SortableDropEventArgs<T>) => void;
    /** Occurs when an item leaves for another sortable in the group. */
    onRemove?: (e: SortableDropEventArgs<T>) => void;
}
