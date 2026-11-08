# Draggable and DropTarget

> Navigation · @motifx-community/ui 0.1.0-beta.7

Makes any content movable with the pointer, touch or the arrow keys, optionally along one axis, inside a boundary, by a handle or as a copy. `DropTarget` defines areas that accept it. To reorder items in a list, see [Sortable](sortable.md).

## Import

```tsx
import { Draggable, DropTarget } from '@motifx-community/ui';
```

## Moving content

JSX children are the movable content. `boundary` keeps it inside its parent or an element, `axis` limits it to one direction, and `handle` sets the only part that responds to the pointer and keyboard. A drag writes the position to `x-model`, `onDragEnded` reports it, and Escape returns the content to its start.

```tsx
import { reactive } from '@motifx/core';
import { Draggable, Panel, Stack } from '@motifx-community/ui';

/** Three notes in a room: one moves anywhere inside it, one only sideways, one only by its grip; the keys move the focused one. */
export default function Free() {
    const s = reactive({ told: '' });
    const note = (text: string, grip = false) => (
        <Panel padding="sm" variant="outline" style="inline-size: 150px">
            {grip && <span class="dg-grip">⋮⋮ </span>}
            <span>{text}</span>
        </Panel>
    );
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <div class="dg-room" style="position: relative; block-size: 220px; outline: 2px dashed var(--mx-color-stroke-control-strong); outline-offset: -2px">
                <Draggable class="dg-free" boundary="parent" style="position: absolute; left: 16px; top: 16px" onDragEnded={e => (s.told = `free: ${e.x}, ${e.y}`)}>
                    {note('Anywhere in the room')}
                </Draggable>
                <Draggable class="dg-axis" axis="x" boundary="parent" style="position: absolute; left: 16px; top: 100px" onDragEnded={e => (s.told = `sideways: ${e.x}, ${e.y}`)}>
                    {note('Only sideways')}
                </Draggable>
                <Draggable class="dg-handle" handle=".dg-grip" boundary="parent" style="position: absolute; left: 300px; top: 16px" onDragEnded={e => (s.told = `by the grip: ${e.x}, ${e.y}`)}>
                    {note('Only by the grip', true)}
                </Draggable>
            </div>
            <output class="dg-free-told">{() => s.told}</output>
        </Stack>
    );
}
```

## Drop targets

A `DropTarget` in the same `group` accepts a draggable dropped on it and receives the draggable's `data` in `onDropped`. `onDragEntering` can reject it. With `clone`, a copy follows the pointer and the original stays, so one item can be dropped many times. Your code decides what a drop does to your data.

```tsx
import { reactive } from '@motifx/core';
import { Draggable, DropTarget, Stack } from '@motifx-community/ui';

const FRUIT = ['Apple', 'Pear', 'Plum'];

/** Copies of the chips go to the bowls of their group; the small bowl refuses a third, and the data moves in `onDropped`. */
export default function Targets() {
    const s = reactive({ big: [] as string[], small: [] as string[], told: '' });
    const bowl = (name: 'big' | 'small', limit: number) => (
        <DropTarget
            class={`dg-bowl dg-bowl-${name}`}
            group="fruit"
            grow
            style="flex-basis: 0; min-block-size: 96px; padding: 12px; border: 1px solid var(--mx-color-stroke-divider); border-radius: var(--mx-radius-md)"
            onDragEntering={e => (e.cancel = s[name].length >= limit)}
            onDropped={e => {
                s[name].push(e.data as string);
                s.told = `${e.data} went to the ${name} bowl`;
            }}
        >
            <strong>{name === 'big' ? 'Big bowl' : 'Small bowl, two at most'}</strong>
            <div class="dg-bowl-list">{() => s[name].join(', ') || 'empty'}</div>
        </DropTarget>
    );
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Stack orientation="horizontal" gap="sm" wrap>
                {FRUIT.map(fruit => (
                    <Draggable class="dg-chip" clone group="fruit" data={fruit} style="padding: 6px 12px; border-radius: var(--mx-radius-full); border: 1px solid var(--mx-color-stroke-control-strong)">
                        {fruit}
                    </Draggable>
                ))}
            </Stack>
            <Stack orientation="horizontal" gap="md">
                {bowl('big', 99)}
                {bowl('small', 2)}
            </Stack>
            <output class="dg-bowls-told">{() => s.told}</output>
        </Stack>
    );
}
```

## Programmatic use

`position` sets the location in pixels from the element's layout position, and `x-model` receives it after every drag or key press, so you can save and restore it.

```tsx
import { reactive } from '@motifx/core';
import { Button, Draggable, Panel, Stack } from '@motifx-community/ui';

/** The position is written to x-model after every drag or key press and can be set back: moved, saved and restored programmatically. */
export default function Programmatic() {
    const s = reactive({ at: { x: 0, y: 0 } as { x: number; y: number } | null, kept: null as { x: number; y: number } | null });
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <div style="position: relative; block-size: 160px">
                <Draggable class="dg-coded" boundary="parent" step={20} x-model={() => s.at} style="position: absolute; left: 0; top: 0">
                    <Panel padding="sm" variant="outline" style="inline-size: 140px">
                        Moved by the model
                    </Panel>
                </Draggable>
            </div>
            <Stack orientation="horizontal" wrap align="center">
                <Button text="Right by 40" variant="outline" onclick={() => (s.at = { x: (s.at?.x ?? 0) + 40, y: s.at?.y ?? 0 })} />
                <Button text="Keep this place" variant="outline" onclick={() => (s.kept = s.at ? { ...s.at } : null)} />
                <Button text="Restore it" variant="outline" enabled={() => !!s.kept} onclick={() => (s.at = s.kept ? { ...s.kept } : null)} />
                <Button text="Back to the start" variant="outline" onclick={() => (s.at = { x: 0, y: 0 })} />
                <output class="dg-coded-told">{() => `at: ${JSON.stringify(s.at)}`}</output>
            </Stack>
        </Stack>
    );
}
```

## Keyboard

| Key | Description |
| --- | --- |
| `Tab` | The draggable, or its handle, is one Tab stop. |
| `Arrow keys` | Moves it by `step` pixels along its axis and inside its boundary, and the new position is announced. |
| `Escape` | During a drag, cancels it and returns the item to where it started. |

## Accessibility

| Topic | Details |
| --- | --- |
| `The draggable` | A `group` with `aria-roledescription="draggable"`, named “Move” in the kit language. With a `handle`, that element is a button with this name instead. |
| `Dragging` | A long press lifts it on a touch screen. During a drag, it lets pointer events pass through so the target underneath can be detected, and a `clone` copy follows the pointer. |
| `Targets` | Marked while a drag from their group is active, while the draggable is over them, and when they reject it. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-draggable` | The draggable. `data-dragging`, `data-handle`, `data-clone`, `data-axis`. |
| `.mx-draggable__handle, .mx-draggable__ghost` | The handle specified by `handle`, and the copy that follows the pointer. |
| `.mx-drop-target` | A target. `data-drop-active` during a drag from its group, `data-drop-over`, `data-drop-refused`. |

### Component tokens

| Token | Description |
| --- | --- |
| `draggable.box, .handle, .ghost` | Units: the draggable (`draggable`, `dragging`, `focus`), its handle (`hover`, `focus`) and the copy. |
| `drop-target.target` | Unit: a target (`active`, `over`, `refused`). |

## API reference

### Draggable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `axis` | `Bind<DragAxis>` | `'both'` | `both`, `x` or `y`. |
| `boundary` | `Bind<'parent' \| HTMLElement \| null>` | `null` | The area it stays inside: its parent, or an element that contains it. |
| `handle` | `Bind<string \| null>` | `null` | A selector inside the draggable. Only this part starts a drag, and it receives the Tab stop and keyboard input. |
| `clone` | `Bind<boolean>` | `false` | A copy follows the pointer and the draggable stays in place, ready to be dropped on a target. |
| `group` | `Bind<string \| null>` | `null` | Drop targets in the same group accept it. |
| `data` | `unknown` | — | Custom data passed to the drop target on drop. |
| `step` | `Bind<number>` | `10` | The number of pixels an arrow key moves it. |
| `position` | `Bind<DragPosition \| null>` | `null` | The position in pixels from its layout position. When set, it is applied, and after every drag or key press the new position is written to `x-model`. |

### DropTarget props and events

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `group` | `Bind<string \| null>` | `null` | Accepts draggables in this group. `null` accepts those without a group. |
| `onDragEntering` | event | Occurs when a draggable enters (`draggable`, `data`). Set `cancel = true` to reject it. |
| `onDragLeaving` | event | Occurs when the draggable leaves. |
| `onDropped` | event | Occurs when a draggable is dropped on it. Your code moves the data. |

### Events, properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `onDragStarting` | event | Occurs before a drag starts. Set `cancel = true` to keep it in place. |
| `onDragging` | event | Occurs during a drag (`x`, `y`, and the `target` under the pointer). |
| `onDragEnding` | event | Occurs when the pointer is released. Set `cancel = true` to return it to where it started. |
| `onDragEnded` | event | Occurs when the drag ends (`x`, `y`, `target`, `dropped`). |
| `currentPosition` | read-only | The current position. |
| `isDragging` | read-only | Indicates that a drag is in progress. |
| `handleElement` | read-only | The element that handles the pointer and keyboard: the handle, or the draggable itself. |

## Feedback

Loading issues…
