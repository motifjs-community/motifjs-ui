# Resizable

> Navigation · @motifx-community/ui 0.1.0-beta.3

A box the user resizes from its sides and corners with the pointer, or with the arrow keys on the grip in its end corner. It keeps to its least and most sizes, stays inside an area when told, and can keep its shape.

## Import

```tsx
import { Resizable } from '@motifx-community/ui';
```

## Sides, corners and the grip

The JSX children are the content. `handles` says which sides and corners take the pointer (`all` by default); the grip in the end corner is the Tab stop, and the arrow keys change the size by `step`. `minWidth`, `minHeight`, `maxWidth` and `maxHeight` hold it. A box laid out by its position (`absolute`, `fixed`) also moves when a start or top side is dragged, so the far side stays; one in the flow only changes size.

```tsx
import { reactive } from '@motifx/core';
import { Panel, Resizable, Stack } from '@motifx-community/ui';

/** A box resized from any side or corner, never under 160 × 80 or over 480 × 240; the grip in the corner takes the keys. */
export default function Basic() {
    const s = reactive({ told: '' });
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Resizable class="rs-box" width={280} height={140} minWidth={160} minHeight={80} maxWidth={480} maxHeight={240} onResized={e => (s.told = `${e.width} × ${e.height}, from the ${e.edge}`)}>
                <Panel padding="md" variant="outline" text="A note" style="block-size: 100%">
                    <p class="rs-note">Drag a side or a corner, or focus the grip and use the arrow keys.</p>
                </Panel>
            </Resizable>
            <output class="rs-box-told">{() => s.told}</output>
        </Stack>
    );
}
```

## Inside an area, keeping its shape

`area` keeps the box inside its parent, or inside an element given; `keepAspectRatio` changes the other side along. Here only the end side, the bottom and the corner between them resize the picture.

```tsx
import { Resizable } from '@motifx-community/ui';
import { scene } from '../../gallery/examples/scenes';

/** A picture that keeps its shape and stays inside the dashed area; only the end side, the bottom and the corner resize it. */
export default function Area() {
    return (
        <div class="rs-area" style="position: relative; inline-size: 100%; block-size: 260px; outline: 2px dashed var(--mx-color-stroke-control-strong); outline-offset: -2px">
            <Resizable class="rs-picture" width={240} height={135} minWidth={120} minHeight={68} area="parent" keepAspectRatio handles={['end', 'bottom', 'bottom-end']} style="position: absolute; left: 16px; top: 16px">
                <img src={scene(200)} alt="A harbour at dawn" style="display: block; inline-size: 100%; block-size: 100%; object-fit: cover" />
            </Resizable>
        </div>
    );
}
```

## Programmatic use

`size` gives the size in pixels and `x-model` takes it back after every resize (`onResized` tells too): a layout kept and restored, or set by a button.

```tsx
import { reactive } from '@motifx/core';
import { Button, Panel, Resizable, Stack } from '@motifx-community/ui';

/** The size goes out to x-model after every resize and comes back: set, kept and restored programmatically. */
export default function Programmatic() {
    const s = reactive({ size: { width: 240, height: 120 } as { width: number; height: number } | null, kept: null as { width: number; height: number } | null });
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Resizable class="rs-coded" minWidth={120} minHeight={60} x-model={() => s.size}>
                <Panel padding="md" variant="outline" style="block-size: 100%">
                    <p class="rs-note">Sized by the model.</p>
                </Panel>
            </Resizable>
            <Stack orientation="horizontal" wrap align="center">
                <Button text="Wider" variant="outline" onclick={() => (s.size = { width: (s.size?.width ?? 240) + 40, height: s.size?.height ?? 120 })} />
                <Button text="Keep this size" variant="outline" onclick={() => (s.kept = s.size ? { ...s.size } : null)} />
                <Button text="Restore it" variant="outline" enabled={() => !!s.kept} onclick={() => (s.size = s.kept ? { ...s.kept } : null)} />
                <output class="rs-coded-told">{() => `size: ${JSON.stringify(s.size)}`}</output>
            </Stack>
        </Stack>
    );
}
```

## Keyboard

| Key | What it does |
| --- | --- |
| `Tab` | The grip in the end corner is the one stop. |
| `Arrow keys` | On the grip: Left and Right change the width by `step` (the other way round in a right-to-left page), Up and Down the height; within the limits, the area and the ratio. |

## Accessibility

| Topic | How |
| --- | --- |
| `The grip` | A button named “Resize” in the kit language; the new size is read out after every change (“Width 320, height 200”). |
| `The handles` | Strips along the sides and corners for the pointer only, hidden from readers; the grip gives the keys the same. |
| `Content` | The JSX children are the content, untouched: a panel, a picture, a form. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-resizable` | The box. `data-resizing` and `data-edge` while a handle is dragged; `data-disabled`. |
| `.mx-resizable__frame, .mx-resizable__handle` | The frame over the box and its eight handles (`data-edge`, `data-active` while dragged, `hidden` when not asked for). |
| `.mx-resizable__grip, .mx-resizable__grip-glyph` | The grip in the end corner and its glyph. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `resizable.box, .handle, .grip, .grip-glyph` | Units: the box (`resizing`), a handle (`hover`, `active`, `corner`), the grip (`hover`, `pressed`, `focus`) and its glyph (`icon`). |
| `resizable.edge` | How wide a strip along a side takes the pointer; a corner takes twice that each way. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `handles` | `Bind<ResizeHandles>` | `'all'` | `all`, `edges`, `corners`, or a list of `top`, `bottom`, `start`, `end`, `top-start`, `top-end`, `bottom-start`, `bottom-end`. |
| `minWidth, minHeight` | `Bind<number>` | `30` | The least width and height, in pixels. |
| `maxWidth, maxHeight` | `Bind<number \| null>` | `null` | The most width and height, in pixels; `null` for no limit. |
| `area` | `Bind<'parent' \| HTMLElement \| null>` | `null` | The box stays inside this: its parent, or an element it lies in. |
| `keepAspectRatio` | `Bind<boolean>` | `false` | The width and the height keep their ratio. |
| `step` | `Bind<number>` | `10` | Pixels an arrow key changes a side by. |
| `width, height` | `Bind<number \| string \| null>` | `null` | The size to start with, a CSS length or pixels; without one the content decides. |
| `size` | `Bind<ResizeSize \| null>` | `null` | The size in pixels: given, it is applied; after every resize the new one is written to `x-model`. |

### Events, properties and methods

| Member | Kind | Description |
| --- | --- | --- |
| `onResizeStarting` | event | A resize is about to begin from a handle (`edge`, `width`, `height`); `cancel = true` keeps the size. |
| `onResizing` | event | The box is being resized (`edge`, `width`, `height` so far). |
| `onResized` | event | A resize ended: the pointer let go, or a key moved a side. |
| `currentSize` | read-only | The size in pixels now. |
| `gripElement` | read-only | The grip in the end corner, the Tab stop that takes the keys. |
