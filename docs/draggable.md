# Draggable and DropTarget

> Navigation · @motifx-community/ui 0.1.0-beta.3

Anything the user moves with the pointer, a finger or the arrow keys, along an axis or inside a boundary, by a handle or as a copy; and the targets that take it. For items that change places in a list, see [Sortable](sortable.md).

## Import

```tsx
import { Draggable, DropTarget } from '@motifx-community/ui';
```

## Moving things

The JSX children are what moves. `boundary` keeps it inside its parent or an element, `axis` keeps it on a line, `handle` names the only part that takes the press and the keys. A drag writes the place to `x-model` and `onDragEnded` tells it; Escape brings it back.

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

A `DropTarget` of the same `group` takes a draggable dropped on it and is told in `onDropped` with the draggable’s `data`; `onDragEntering` may refuse. With `clone` a copy follows the pointer and the draggable stays, so one thing can be dropped many times. What a drop does to your data is yours.

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

`position` puts it where you say, in pixels from where it was laid out, and `x-model` takes the place back after every drag or key: kept and restored.

```tsx
import { reactive } from '@motifx/core';
import { Button, Draggable, Panel, Stack } from '@motifx-community/ui';

/** The place goes out to x-model after every drag or key and comes back: moved, kept and restored programmatically. */
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

| Key | What it does |
| --- | --- |
| `Tab` | The draggable (or its handle) is one stop. |
| `Arrow keys` | Move it by `step` pixels along its axis, inside its boundary; the new place is read out. |
| `Escape` | While dragging: lets go and brings it back where it started. |

## Accessibility

| Topic | How |
| --- | --- |
| `The draggable` | A `group` with `aria-roledescription="draggable"` named “Move” in the kit language; with a `handle`, that element is a button of that name instead. |
| `Dragging` | A long press lifts it on a touch screen. While it is dragged it lets the pointer through, so the target under it is found; the copy of a `clone` follows the pointer. |
| `Targets` | Marked while a drag of their group is under way, while the draggable is over them, and when they refuse it. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-draggable` | The draggable. `data-dragging`, `data-handle`, `data-clone`, `data-axis`. |
| `.mx-draggable__handle, .mx-draggable__ghost` | The handle named by `handle`; the copy after the pointer. |
| `.mx-drop-target` | A target. `data-drop-active` during a drag of its group, `data-drop-over`, `data-drop-refused`. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `draggable.box, .handle, .ghost` | Units: the draggable (`draggable`, `dragging`, `focus`), its handle (`hover`, `focus`), the copy. |
| `drop-target.target` | Unit: a target (`active`, `over`, `refused`). |

## API reference

### Draggable props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `axis` | `Bind<DragAxis>` | `'both'` | `both`, `x` or `y`. |
| `boundary` | `Bind<'parent' \| HTMLElement \| null>` | `null` | The draggable stays inside this: its parent, or an element it lies in. |
| `handle` | `Bind<string \| null>` | `null` | A selector inside the draggable: only a press there drags it, and it takes the Tab stop and the keys. |
| `clone` | `Bind<boolean>` | `false` | A copy follows the pointer and the draggable stays where it is; for a drop target to take. |
| `group` | `Bind<string \| null>` | `null` | Drop targets of the same group take it. |
| `data` | `unknown` | — | Anything of your own, given to the drop target with the drop. |
| `step` | `Bind<number>` | `10` | Pixels an arrow key moves it by. |
| `position` | `Bind<DragPosition \| null>` | `null` | Where it stands, in pixels from where it was laid out: given, it is applied; after every drag or key the new place is written to `x-model`. |

### DropTarget props and events

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `group` | `Bind<string \| null>` | `null` | Takes the draggables of this group; `null` takes those without one. |
| `onDragEntering` | event | A draggable came over it (`draggable`, `data`); `cancel = true` refuses it. |
| `onDragLeaving` | event | The draggable left it. |
| `onDropped` | event | A draggable was dropped on it: your data is yours to move. |

### Events, properties and methods

| Member | Kind | Description |
| --- | --- | --- |
| `onDragStarting` | event | A drag is about to begin; `cancel = true` keeps it in place. |
| `onDragging` | event | It is being dragged (`x`, `y`, the `target` under the pointer). |
| `onDragEnding` | event | The pointer let go; `cancel = true` brings it back where it started. |
| `onDragEnded` | event | The drag ended (`x`, `y`, `target`, `dropped`). |
| `currentPosition` | read-only | Where it stands now. |
| `isDragging` | read-only | A drag is under way. |
| `handleElement` | read-only | What takes the press and the keys: the handle, else the draggable itself. |
