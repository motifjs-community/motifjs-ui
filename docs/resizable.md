# Resizable

> Navigation · @motifx-community/ui 0.1.0-beta.7

A box that users can resize from its edges and corners with the pointer, or with the arrow keys on the grip in its end corner. It respects minimum and maximum sizes, can stay within an area, and can preserve its aspect ratio.

## Import

```tsx
import { Resizable } from '@motifx-community/ui';
```

## Edges, corners and the grip

JSX children are the content. `handles` sets which edges and corners respond to the pointer (`all` by default). The grip in the end corner is the Tab stop, and the arrow keys change the size by `step`. `minWidth`, `minHeight`, `maxWidth` and `maxHeight` set the limits. A box positioned with `absolute` or `fixed` also moves when its start or top edge is dragged, so the opposite edge stays in place. A box in the normal flow only changes size.

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

## Staying within an area and keeping the aspect ratio

`area` keeps the box inside its parent or a specified element, and `keepAspectRatio` adjusts the other dimension. In this example, only the end edge, the bottom edge and the corner between them resize the image.

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

`size` sets the size in pixels, and `x-model` receives it after every resize (`onResized` also reports it). Use this to save and restore a layout, or to set the size from a button.

```tsx
import { reactive } from '@motifx/core';
import { Button, Panel, Resizable, Stack } from '@motifx-community/ui';

/** The size is written to x-model after every resize and can be set back: set, saved and restored programmatically. */
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

| Key | Description |
| --- | --- |
| `Tab` | The grip in the end corner is the only Tab stop. |
| `Arrow keys` | On the grip, Left and Right change the width by `step` (reversed on right-to-left pages), and Up and Down change the height, within the limits, the area and the aspect ratio. |

## Accessibility

| Topic | Details |
| --- | --- |
| `The grip` | A button named “Resize” in the kit language. The new size is announced after every change (“Width 320, height 200”). |
| `The handles` | Strips along the edges and corners for pointer use only, hidden from screen readers. The grip provides the same function for the keyboard. |
| `Content` | JSX children are the content and are left unchanged, such as a panel, an image or a form. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-resizable` | The box. `data-resizing` and `data-edge` while a handle is dragged, and `data-disabled`. |
| `.mx-resizable__frame, .mx-resizable__handle` | The frame over the box and its eight handles (`data-edge`, `data-active` during a drag, and `hidden` when not enabled). |
| `.mx-resizable__grip, .mx-resizable__grip-glyph` | The grip in the end corner and its glyph. |

### Component tokens

| Token | Description |
| --- | --- |
| `resizable.box, .handle, .grip, .grip-glyph` | Units: the box (`resizing`), a handle (`hover`, `active`, `corner`), the grip (`hover`, `pressed`, `focus`) and its glyph (`icon`). |
| `resizable.edge` | The width of the pointer target along an edge. A corner is twice that in each direction. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `handles` | `Bind<ResizeHandles>` | `'all'` | `all`, `edges`, `corners`, or a list of `top`, `bottom`, `start`, `end`, `top-start`, `top-end`, `bottom-start` and `bottom-end`. |
| `minWidth, minHeight` | `Bind<number>` | `30` | The minimum width and height, in pixels. |
| `maxWidth, maxHeight` | `Bind<number \| null>` | `null` | The maximum width and height, in pixels. `null` means no limit. |
| `area` | `Bind<'parent' \| HTMLElement \| null>` | `null` | The area the box stays inside: its parent, or an element that contains it. |
| `keepAspectRatio` | `Bind<boolean>` | `false` | Preserves the ratio of width to height. |
| `step` | `Bind<number>` | `10` | The number of pixels an arrow key changes an edge. |
| `width, height` | `Bind<number \| string \| null>` | `null` | The initial size, as a CSS length or in pixels. Without it, the content determines the size. |
| `size` | `Bind<ResizeSize \| null>` | `null` | The size in pixels. When set, it is applied, and after every resize the new size is written to `x-model`. |

### Events, properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `onResizeStarting` | event | Occurs before a resize starts from a handle (`edge`, `width`, `height`). Set `cancel = true` to keep the size. |
| `onResizing` | event | Occurs while the box is being resized (`edge`, and the current `width` and `height`). |
| `onResized` | event | Occurs when a resize ends, either when the pointer is released or when a key moves an edge. |
| `currentSize` | read-only | The current size in pixels. |
| `gripElement` | read-only | The grip in the end corner, which is the Tab stop for keyboard resizing. |

## Feedback

Loading issues…
