# Sortable

> Navigation · @motifx-community/ui 0.1.0-beta.8

Lets users reorder items by dragging them with the pointer or a finger, or with the keyboard. Lists in the same group can exchange items. A drop moves the element and reports the indexes, while your data stays under your control.

## Import

```tsx
import { Sortable } from '@motifx-community/ui';
```

## Using children as items

JSX children are the items. Drag one, or focus it and press Ctrl + Down. `onReorder` reports the old and new positions, and the application reorders its own data.

```tsx
import { reactive } from '@motifx/core';
import { Panel, Sortable, Stack } from '@motifx-community/ui';

/** Rows reordered by dragging, or with Ctrl + arrow key on the focused row. The application reorders its data in the event. */
export default function Basic() {
    const s = reactive({ steps: ['Collect the order', 'Pack it', 'Print the label', 'Hand it over'], told: '' });
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Sortable
                label="Steps"
                class="so-steps"
                onReorder={e => {
                    const next = s.steps.slice();
                    next.splice(e.toIndex, 0, ...next.splice(e.fromIndex, 1));
                    s.steps = next;
                    s.told = `"${next[e.toIndex]}" is step ${e.toIndex + 1} now`;
                }}
            >
                <Panel variant="outline" padding="sm">
                    Collect the order
                </Panel>
                <Panel variant="outline" padding="sm">
                    Pack it
                </Panel>
                <Panel variant="outline" padding="sm">
                    Print the label
                </Panel>
                <Panel variant="outline" padding="sm">
                    Hand it over
                </Panel>
            </Sortable>
            <output class="so-told">{() => s.told || `Order: ${s.steps.join(' → ')}`}</output>
        </Stack>
    );
}
```

## Binding to data and moving between lists

`items` with an `itemTemplate` renders rows from your data and keeps each row when the order changes. Two sortables in the same `group` can exchange items. `onRemove` and `onAdd` notify both sides, and each list redraws its array.

```tsx
import { reactive } from '@motifx/core';
import { Panel, Sortable, Stack } from '@motifx-community/ui';

interface Task {
    id: number;
    title: string;
}

// A task as a row.
const row = (task: Task) => {
    const panel = new Panel({ variant: 'outline', padding: 'sm' });
    panel.element.textContent = task.title;
    return panel;
};

/** Two lists in one group exchange items. Each list draws its own data, and the application moves the task between arrays in the events. */
export default function Groups() {
    const s = reactive({
        todo: [{ id: 1, title: 'Write the brief' }, { id: 2, title: 'Book the room' }, { id: 3, title: 'Send the invites' }] as Task[],
        done: [{ id: 4, title: 'Pick the date' }] as Task[]
    });
    const reorder = (key: 'todo' | 'done') => (e: { fromIndex: number; toIndex: number }) => {
        const next = s[key].slice();
        next.splice(e.toIndex, 0, ...next.splice(e.fromIndex, 1));
        s[key] = next;
    };
    // The item leaves one array when removed and joins the other when added, and the lists redraw.
    const remove = (key: 'todo' | 'done') => (e: { fromIndex: number }) => (s[key] = s[key].filter((_, i) => i !== e.fromIndex));
    const add = (key: 'todo' | 'done') => (e: { item: Task; toIndex: number }) => {
        const next = s[key].slice();
        next.splice(e.toIndex, 0, e.item);
        s[key] = next;
    };
    return (
        <Stack orientation="horizontal" gap="lg" style="inline-size: 100%">
            <Stack gap="sm" grow>
                <strong>To do</strong>
                <Sortable<Task> label="To do" class="so-todo" group="tasks" items={() => s.todo} itemTemplate={row} onReorder={reorder('todo')} onRemove={remove('todo')} onAdd={add('todo')} style="min-block-size: 8rem" />
            </Stack>
            <Stack gap="sm" grow>
                <strong>Done</strong>
                <Sortable<Task> label="Done" class="so-done" group="tasks" items={() => s.done} itemTemplate={row} onReorder={reorder('done')} onRemove={remove('done')} onAdd={add('done')} style="min-block-size: 8rem" />
            </Stack>
        </Stack>
    );
}
```

## Drag handles, horizontal lists and canceling a drag

```tsx
import { reactive } from '@motifx/core';
import { Chip, Sortable, Stack } from '@motifx-community/ui';

/** Chips side by side, moved by their handle only (the dots), with Ctrl + Left / Right on the handle; a drag may be refused. */
export default function Handle() {
    const s = reactive({ tags: ['Design', 'Build', 'Test', 'Ship', 'Locked'], told: '' });
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Sortable
                label="Tags"
                class="so-tags"
                orientation="horizontal"
                handle=".so-grip"
                items={() => s.tags}
                itemTemplate={tag => {
                    const chip = new Chip({ text: tag });
                    const grip = document.createElement('span');
                    grip.className = 'mx-glyph so-grip';
                    grip.dataset.icon = 'drag-dots';
                    grip.setAttribute('aria-label', `Move ${tag}`);
                    chip.element.prepend(grip);
                    return chip;
                }}
                onDragStarting={e => {
                    if (e.item === 'Locked') {
                        e.cancel = true;
                        s.told = 'Locked stays where it is.';
                    }
                }}
                onReorder={e => {
                    const next = s.tags.slice();
                    next.splice(e.toIndex, 0, ...next.splice(e.fromIndex, 1));
                    s.tags = next;
                    s.told = next.join(', ');
                }}
            />
            <output class="so-tags-told">{() => s.told}</output>
        </Stack>
    );
}
```

## Behavior

| Topic | Details |
| --- | --- |
| `Dragging` | A drag starts after a few pixels with the pointer, or after a long press with a finger (a finger that moves first scrolls). A copy follows the pointer, the item stays faded in place, and a line shows the drop position. The list scrolls near its edges. |
| `Dropping` | The item's element moves there immediately, and `onReorder` reports the old and new positions. Your code reorders the data. Between sortables in a group, `onRemove` and `onAdd` report the same to both sides. |
| `Binding to data` | With `items`, each item keeps its component when the order changes, because rows are keyed by item. Reordering your array moves the rows without recreating them. |
| `Keys` | The focused item, or its handle if it has one, responds to Ctrl + Up and Down (Left and Right when horizontal) and Ctrl + Home and End. Each move is reported to `onReorder` and announced. |
| `Escape` | Cancels a drag, and nothing moves. |

## Accessibility

| Topic | Details |
| --- | --- |
| `List` | A `group` named by `label`. The items are whatever you put in it. |
| `Items` | One Tab stop that moves between items with the keyboard. An item with its own focusable element keeps it. A handle is a button that you name. |
| `Moves` | Each keyboard move is announced: “Moved to 2 of 5”. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-sortable` | The list. `data-orientation`, `data-sortable`, and `data-drop-target` while a dragged item can land here. |
| `.mx-sortable__item` | Each item. `data-dragging` on the item being dragged. |
| `.mx-sortable__line` | The drop indicator line. |
| `.mx-sortable__ghost` | The copy that follows the pointer. |

### Component tokens

| Token | Description |
| --- | --- |
| `sortable.container, .item, .line, .ghost` | Units: the list (`target`), an item (`sortable`, `dragging`, `focus`), the line (its thickness and color, vertical in a horizontal list), and the copy. |
| `sortable.gap` | The gap between items. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly T[]>` | — | The items, each drawn with `itemTemplate`. Without them, the JSX children are the items. |
| `itemTemplate` | `(item, index) => ComponentBase` | The item text | Creates the component for an item. Because it is a function, it is not bound like the other props. |
| `handle` | `Bind<string \| null>` | `null` | A selector inside an item for the part that handles dragging and the keyboard. Without it, the whole item does. |
| `group` | `Bind<string \| null>` | `null` | Sortables in the same group can exchange items. |
| `allowReordering` | `Bind<boolean>` | `true` | Allows items to be moved. `false` keeps them in place. |
| `orientation` | `Bind<SortableOrientation>` | `'vertical'` | `vertical` or `horizontal`. The drop line and the move keys follow it. |
| `label` | `Bind<string>` | `''` | The accessible name of the list. |

### Events, properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `onDragStarting` | event | Occurs before a drag or keyboard move starts (`item`, `fromIndex`). Set `cancel = true` to prevent it. |
| `onDragChanging` | event | Occurs when the drop position changes (`to`, `toIndex`). Set `cancel = true` to reject that position. |
| `onDragEnding` | event | Occurs before the drop. Set `cancel = true` to leave everything unchanged. |
| `onReorder` | event | Occurs when an item moves within this sortable (`fromIndex`, `toIndex`, `item`), by a drop or the keyboard. Reorder your data here. |
| `onRemove, onAdd` | event | Occur when an item leaves for another sortable in the group and when it arrives, with `from`, `to`, the indexes and the item. Move the data between your arrays here. |
| `move(fromIndex, toIndex)` | `boolean` | Moves an item programmatically as a drop would, and raises `onReorder`. |
| `itemParts()` | `ComponentBase[]` | The components of the items, in order: the rows of `items`, or the children. |
| `isDragging` | read-only | Indicates that an item is being dragged. |
| `refresh()` | `void` | Re-reads the items after they have been changed in place. |

## Feedback

Loading issues…
