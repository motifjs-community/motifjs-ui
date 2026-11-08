# TileView

> Display · @motifx-community/ui 0.1.0-beta.8

Arranges tiles of different sizes on a grid of base cells, where each tile spans a set number of cells. Tiles fill the height in columns and scroll horizontally, or fill the width in rows. They can be selected and reordered by dragging.

## Import

```tsx
import { TileView } from '@motifx-community/ui';
```

## Tile grid

`baseItemWidth` and `baseItemHeight` define one cell, and a tile's `widthRatio` and `heightRatio` set how many cells it spans. In the default `horizontal` direction, the view needs a `height` and scrolls horizontally. Tiles are packed so that no cell stays empty where a later tile fits.

```tsx
import { TileView } from '@motifx-community/ui';

/** Tiles of one, two and four base cells packed down the columns; the view scrolls sideways when they do not fit. */
export default function Basic() {
    return (
        <TileView
            class="tv-board"
            label="Board"
            height={330}
            baseItemWidth={120}
            baseItemHeight={100}
            items={[
                { text: 'Sales today', widthRatio: 2 },
                { text: 'Orders' },
                { text: 'Returns' },
                { text: 'Visitors this week', widthRatio: 2, heightRatio: 2 },
                { text: 'Stock' },
                { text: 'Staff on duty', heightRatio: 2 },
                { text: 'Tickets' },
                { text: 'Deliveries', widthRatio: 2 },
                { text: 'Reviews' },
                { text: 'Costs' }
            ]}
        />
    );
}
```

## Selecting tiles

`selectionMode` makes tiles selectable. `single` keeps one selected, and `multiple` allows any number (Ctrl + click or Space adds and removes). `value` is the `key` or index of the selected tile, or a list of them, and `x-model` provides two-way binding. The arrow keys move through the grid based on tile positions.

```tsx
import { reactive } from '@motifx/core';
import { Stack, TileView } from '@motifx-community/ui';

/** Tiles along the rows with any number selected: click, Ctrl + click or Space, and the arrow keys move through the grid. */
export default function Selection() {
    const s = reactive({ chosen: ['tea'] as string | number | null | readonly (string | number)[] });
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <TileView
                class="tv-pick"
                label="Snacks"
                direction="vertical"
                selectionMode="multiple"
                baseItemWidth={110}
                baseItemHeight={70}
                x-model={() => s.chosen}
                items={[
                    { key: 'tea', text: 'Tea' },
                    { key: 'coffee', text: 'Coffee' },
                    { key: 'water', text: 'Water', enabled: false },
                    { key: 'cake', text: 'Cake', widthRatio: 2 },
                    { key: 'fruit', text: 'Fruit' },
                    { key: 'nuts', text: 'Nuts' }
                ]}
            />
            <output class="tv-pick-told">{() => `chosen: ${JSON.stringify(s.chosen)}`}</output>
        </Stack>
    );
}
```

## Reordering

With `allowReorder`, users can drag a tile to a new position (a long press on a touch screen) or move it with Ctrl and an arrow key. The tile moves and `onReordered` reports the indexes. Reorder your data there, as the example does, so the next render matches.

```tsx
import { reactive } from '@motifx/core';
import { Stack, TileView } from '@motifx-community/ui';

/** Drag a tile to another place, or move it with Ctrl and an arrow key; the data is reordered in `onReordered`. */
export default function Reorder() {
    const s = reactive({ tiles: [{ text: 'Plan' }, { text: 'Design', widthRatio: 2 }, { text: 'Build' }, { text: 'Test' }, { text: 'Ship', heightRatio: 2 }, { text: 'Rest' }] });
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <TileView
                class="tv-order"
                label="Steps"
                direction="vertical"
                allowReorder
                baseItemWidth={100}
                baseItemHeight={70}
                items={() => s.tiles}
                onReordered={e => s.tiles.splice(e.toIndex, 0, ...s.tiles.splice(e.fromIndex, 1))}
            />
            <output class="tv-order-told">{() => s.tiles.map(t => t.text).join(', ')}</output>
        </Stack>
    );
}
```

## Any content

An item's `content` creates the tile content when the tile is created, and it behaves the same as anywhere else. A click on a button inside goes to that button. `onItemClick` reports a click on the tile itself.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TileView } from '@motifx-community/ui';

const ROOMS = [
    { name: 'Kitchen', temp: 21 },
    { name: 'Lounge', temp: 23 },
    { name: 'Study', temp: 19 },
    { name: 'Bedroom', temp: 18 }
];

/** Any content on a tile: a room each, with its own button. A click on the tile itself is also reported. */
export default function Content() {
    const s = reactive({ told: '' });
    const room = (r: (typeof ROOMS)[number]) => (
        <Stack class="tv-room" gap="xs" justify="center" style="block-size: 100%">
            <strong>{r.name}</strong>
            <span class="tv-room-temp">{r.temp} °C</span>
            <Button text="Warmer" variant="outline" size="sm" onclick={() => (s.told = `${r.name}: warmer`)} />
        </Stack>
    );
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <TileView class="tv-rooms" label="Rooms" direction="vertical" baseItemWidth={150} baseItemHeight={120} items={ROOMS.map(r => ({ key: r.name, content: () => room(r) }))} onItemClick={e => (s.told = `${(e.item as { key: string }).key} pressed`)} />
            <output class="tv-rooms-told">{() => s.told}</output>
        </Stack>
    );
}
```

## Keyboard

| Key | Description |
| --- | --- |
| `Tab` | One Tab stop: the tile focused last, otherwise the first selected tile, otherwise the first tile. |
| `Arrow keys` | Moves to the nearest tile in that direction, based on tile positions. Home and End move to the first and last tile. |
| `Space` | Selects the tile (`single`), or toggles it (`multiple`). |
| `Enter` | Acts as a click on the tile: raises `onItemClick` and applies the selection. |
| `Ctrl + Arrow keys` | With `allowReorder`, moves the tile one position back or forward. Ctrl + Home and End move it to the ends, and each move is announced. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Roles` | A `list` of `listitem` elements without selection, or a `listbox` of `option` elements with it (`aria-multiselectable` for `multiple`), each with `aria-selected`. |
| `Disabled tiles` | `aria-disabled`. The tile is skipped by the keyboard and cannot be selected with a click. |
| `Dragging` | A copy of the tile follows the pointer, the tile at the drop position is marked, and Escape cancels. On a touch screen, a long press lifts the tile. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-tile-view` | The view. `data-direction`, `data-reorder`, and `data-dragging` while a tile is dragged. |
| `.mx-tile-view__tile` | A tile. `aria-selected`, `aria-disabled`, `data-dragging` (shown faded in place), and `data-drop="before\|after"` at the drop position. |
| `.mx-tile-view__text, .mx-tile-view__ghost` | The tile text, and the copy that follows the pointer. |

### Component tokens

| Token | Description |
| --- | --- |
| `tile-view.tile, .text, .ghost, .view` | Units: a tile (`hover`, `pressed`, `focus`, `selected`, `disabled`, `dragging`, `target`), its text, the drag copy and the view. |
| `tile-view.gap` | The gap between tiles. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly (TileViewItem \| string)[]>` | `[]` | The tiles in order: `TileViewItem` objects (`text`, `widthRatio`, `heightRatio`, `key`, `content`, `enabled`, `data`) or plain text. |
| `baseItemWidth, baseItemHeight` | `Bind<number>` | `100` | The size of a base cell in pixels. A tile spans `widthRatio` × `heightRatio` cells. |
| `direction` | `Bind<TileViewDirection>` | `'horizontal'` | `horizontal` fills the height in columns and scrolls horizontally (set a `height`). `vertical` fills the width in rows. |
| `selectionMode` | `Bind<TileViewSelectionMode>` | `'none'` | `none`, `single` or `multiple`. |
| `value` | `Bind<string \| number \| null \| (string \| number)[]>` | `null` | The selected tile (`single`), identified by its `key` or index, or a list of selected tiles (`multiple`). `x-model` provides two-way binding. |
| `allowReorder` | `Bind<boolean>` | `false` | Lets users reorder tiles by dragging or with Ctrl and an arrow key. |
| `height` | `Bind<string \| number \| null>` | `null` | A CSS length or pixels. |
| `label` | `Bind<string>` | The kit string “Tiles” | The accessible name. |

### Events, properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `onItemClick` | event | Occurs when a tile is clicked without dragging (`index`, `item`, `event`), or when Enter is pressed on a focused tile. |
| `onSelectionChanged` | event | Occurs when the selected tiles change (`indexes`, `items`, `byUser`). |
| `onReordering` | event | Occurs before a tile is dragged or moved with the keyboard (`fromIndex`, `toIndex`). Set `cancel = true` to keep it in place. |
| `onReordered` | event | Occurs after a tile is dropped or moved to a new position (`item`, `fromIndex`, `toIndex`). Your code reorders the data. |
| `selectedIndexes` | read-only | The indexes of the selected tiles, in tile order. |
| `count` | read-only | The number of tiles. |
| `isDragging` | read-only | Indicates that a tile is being dragged. |
| `select(index)` | `void` | Selects a tile programmatically, as the only one (`single`) or in addition to others (`multiple`). |
| `indexOf(value), valueAt(index)` | `number`, `string \| number` | Converts between a value (a key or an index) and a tile index. |
| `refresh()` | `void` | Re-reads the items after they have been changed in place. |

## Feedback

Loading issues…
