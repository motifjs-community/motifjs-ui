# TileView

> Display · @motifx-community/ui 0.1.0-beta.3

Tiles of different sizes packed on a grid of base cells: a tile is so many cells wide and tall. They fill the height in columns and scroll sideways, or fill the width in rows; they can be chosen, and put in another order by dragging.

## Import

```tsx
import { TileView } from '@motifx-community/ui';
```

## Tiles on a grid

`baseItemWidth` and `baseItemHeight` are one cell; a tile’s `widthRatio` and `heightRatio` say how many it takes. Down the columns (`horizontal`, the default) the view needs a `height` and scrolls sideways; the tiles are packed so no cell stays empty where a later tile fits.

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

## Choosing tiles

`selectionMode` makes the tiles options: `single` keeps one, `multiple` any number (Ctrl and a press, or Space, adds and takes away). `value` is the chosen tile’s `key`, else its index, or a list of them; `x-model` binds it two-way. The arrow keys walk the grid by where the tiles lie.

```tsx
import { reactive } from '@motifx/core';
import { Stack, TileView } from '@motifx-community/ui';

/** Tiles along the rows, any number of them chosen: a press, Ctrl and a press, Space; the keys walk the grid. */
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

## Another order

With `allowReorder` a tile is dragged to its new place (a long press on a touch screen) or moved with Ctrl and an arrow key. The tile moves and `onReordered` tells the indexes: reorder your data there, as the example does, so the next draw agrees.

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

An item’s `content` makes the tile’s content when the tile is made; what is in it works as anywhere else, and a press on a button inside is that button’s. `onItemClick` tells a press on the tile itself.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TileView } from '@motifx-community/ui';

const ROOMS = [
    { name: 'Kitchen', temp: 21 },
    { name: 'Lounge', temp: 23 },
    { name: 'Study', temp: 19 },
    { name: 'Bedroom', temp: 18 }
];

/** Any content on a tile: a room each, with its own button; a press on the tile itself is told too. */
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

| Key | What it does |
| --- | --- |
| `Tab` | One stop: the tile focused last, else the first chosen, else the first. |
| `Arrow keys` | The nearest tile that way, by where the tiles lie; Home and End the first and the last. |
| `Space` | Chooses the tile (`single`), or chooses it or lets it go (`multiple`). |
| `Enter` | A press on the tile: `onItemClick`, and the choice as a press makes it. |
| `Ctrl + Arrow keys` | With `allowReorder`: moves the tile a place back or on; Ctrl + Home and End to the ends. The move is read out. |

## Accessibility

| Topic | How |
| --- | --- |
| `Roles` | A `list` of `listitem`s without selection; a `listbox` of `option`s with it (`aria-multiselectable` for `multiple`), each `aria-selected`. |
| `Disabled tiles` | `aria-disabled`, skipped by the keys, not chosen by a press. |
| `Dragging` | A copy of the tile follows the pointer; the tile where the drop would land is marked; Escape lets go. On a touch screen a long press lifts the tile. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-tile-view` | The view. `data-direction`, `data-reorder`, `data-dragging` while a tile is dragged. |
| `.mx-tile-view__tile` | A tile. `aria-selected`, `aria-disabled`, `data-dragging` (left faint in its place), `data-drop="before\|after"` where the drop would land. |
| `.mx-tile-view__text, .mx-tile-view__ghost` | A tile’s text; the copy after the pointer. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `tile-view.tile, .text, .ghost, .view` | Units: a tile (`hover`, `pressed`, `focus`, `selected`, `disabled`, `dragging`, `target`), its text, the copy after the pointer, the view. |
| `tile-view.gap` | Between the tiles. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly (TileViewItem \| string)[]>` | `[]` | The tiles in order: `TileViewItem`s (`text`, `widthRatio`, `heightRatio`, `key`, `content`, `enabled`, `data`) or plain texts. |
| `baseItemWidth, baseItemHeight` | `Bind<number>` | `100` | A base cell in pixels; a tile is `widthRatio` × `heightRatio` of them. |
| `direction` | `Bind<TileViewDirection>` | `'horizontal'` | `horizontal`: the tiles fill the height in columns and the view scrolls sideways (give it a `height`); `vertical`: they fill the width in rows. |
| `selectionMode` | `Bind<TileViewSelectionMode>` | `'none'` | `none`, `single` or `multiple`. |
| `value` | `Bind<string \| number \| null \| (string \| number)[]>` | `null` | The chosen tile (`single`): its `key`, else its index; the chosen tiles (`multiple`) as a list. `x-model` binds it two-way. |
| `allowReorder` | `Bind<boolean>` | `false` | The tiles can be put in another order by dragging, or with Ctrl and an arrow key. |
| `height` | `Bind<string \| number \| null>` | `null` | A CSS length or pixels. |
| `label` | `Bind<string>` | the kit’s “Tiles” | What screen readers call it. |

### Events, properties and methods

| Member | Kind | Description |
| --- | --- | --- |
| `onItemClick` | event | A press on a tile that was not a drag (`index`, `item`, `event`); Enter on a focused tile too. |
| `onSelectionChanged` | event | The chosen tiles changed (`indexes`, `items`, `byUser`). |
| `onReordering` | event | A tile is about to be dragged or moved with the keys (`fromIndex`, `toIndex`); `cancel = true` keeps it. |
| `onReordered` | event | A tile was dropped or moved to a new place (`item`, `fromIndex`, `toIndex`): your data is yours to reorder. |
| `selectedIndexes` | read-only | The chosen tiles’ indexes, in tile order. |
| `count` | read-only | How many tiles there are. |
| `isDragging` | read-only | A tile is being dragged. |
| `select(index)` | `void` | Chooses a tile programmatically: the only one (`single`), or one more (`multiple`). |
| `indexOf(value), valueAt(index)` | `number`, `string \| number` | Between a value (a key or an index) and a tile’s index. |
| `refresh()` | `void` | Reads the items again after they were changed in place. |
