# Sortable

> Navigation · @motifx-community/ui 0.1.0-beta.3

Items the user puts in order by dragging them, with the pointer or a finger, or with the keys; lists of one group take each other’s items. A drop moves the element and tells you the indexes: your data stays yours.

## Import

```tsx
import { Sortable } from '@motifx-community/ui';
```

## Children as items

The JSX children are the items. Drag one, or focus it and press Ctrl + Down; `onReorder` says from where to where, and the app reorders its own data.

```tsx
import { reactive } from '@motifx/core';
import { Panel, Sortable, Stack } from '@motifx-community/ui';

/** Rows put in order by dragging, or with Ctrl + an arrow on the focused row; the app reorders its data when told. */
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

## Items from data, across lists

`items` with an `itemTemplate` draws the rows from your data and keeps each row as the order changes. Two sortables of one `group` take each other’s items: `onRemove` and `onAdd` tell both sides, and each list draws its array again.

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

/** Two lists of one group take each other's items; each list draws its own data and the app moves the task between arrays when told. */
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
    // The item leaves one array when removed and joins the other when added: the lists draw themselves again.
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

## A handle, side by side, a refused drag

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

## Behaviour

| Topic | How |
| --- | --- |
| `Dragging` | With the pointer after a few pixels; with a finger after a long press (a finger that moves before that scrolls). A copy follows the pointer, the item stays faint in its place, a line shows where it would land; the list scrolls near its edges. |
| `Dropping` | The item’s element moves there at once and `onReorder` says from where to where: your data is yours to reorder. Across sortables of a group, `onRemove` and `onAdd` say the same on both sides. |
| `Items from data` | With `items`, each item keeps its component as the order changes (the rows are keyed by item): reordering your array moves the rows, no row is made again. |
| `Keys` | The focused item (its handle when there is one) takes Ctrl + Up / Down (Left / Right side by side), Ctrl + Home / End; each move is told to `onReorder` and read out. |
| `Escape` | Cancels a drag; nothing moves. |

## Accessibility

| Topic | How |
| --- | --- |
| `List` | A `group` named by `label`; the items are whatever you put in it. |
| `Items` | One Tab stop that moves between the items with the keys; an item with a focusable part of its own keeps that. A handle is a button named by you. |
| `Moves` | Each move by the keys is read out: “Moved to 2 of 5”. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-sortable` | The list. `data-orientation`, `data-sortable`, `data-drop-target` while a dragged item may land here. |
| `.mx-sortable__item` | Each item. `data-dragging` on the one being dragged. |
| `.mx-sortable__line` | The line where a drop would land. |
| `.mx-sortable__ghost` | The copy after the pointer. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `sortable.container, .item, .line, .ghost` | Units: the list (`target`), an item (`sortable`, `dragging`, `focus`), the line (its thickness and colour; standing in a horizontal list), the copy. |
| `sortable.gap` | Between the items. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly T[]>` | — | The items, each drawn with `itemTemplate`; without them the JSX children are the items. |
| `itemTemplate` | `(item, index) => ComponentBase` | the item’s text | Makes an item’s component. A function, so it is not bound like the other props. |
| `handle` | `Bind<string \| null>` | `null` | A selector inside an item that takes the drag and the keys; without one the whole item does. |
| `group` | `Bind<string \| null>` | `null` | Sortables of one group take each other’s items. |
| `allowReordering` | `Bind<boolean>` | `true` | The items can be moved; `false` leaves them as they are. |
| `orientation` | `Bind<SortableOrientation>` | `'vertical'` | `vertical` or `horizontal`: the drop line and the move keys follow. |
| `label` | `Bind<string>` | `''` | What screen readers call the list. |

### Events, properties and methods

| Member | Kind | Description |
| --- | --- | --- |
| `onDragStarting` | event | A drag (or a move by the keys) is about to start (`item`, `fromIndex`); `cancel = true` refuses. |
| `onDragChanging` | event | The place it would land changed (`to`, `toIndex`); `cancel = true` refuses that place. |
| `onDragEnding` | event | About to drop; `cancel = true` leaves everything as it was. |
| `onReorder` | event | An item moved within this sortable (`fromIndex`, `toIndex`, `item`), by a drop or the keys. Reorder your data here. |
| `onRemove, onAdd` | event | An item went to another sortable of the group, and came into one: `from`, `to`, the indexes and the item. Move the data between your arrays here. |
| `move(fromIndex, toIndex)` | `boolean` | Moves an item programmatically as a drop would, telling `onReorder`. |
| `elements` | read-only | The items’ elements, in order. |
| `isDragging` | read-only | An item is being dragged. |
| `refresh()` | `void` | Reads the items again after they were changed in place. |
