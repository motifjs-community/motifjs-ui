import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import Content from './examples/Content';
import Reorder from './examples/Reorder';
import Selection from './examples/Selection';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['items', '`Bind<readonly (TileViewItem | string)[]>`', '`[]`', 'The tiles in order: `TileViewItem` objects (`text`, `widthRatio`, `heightRatio`, `key`, `content`, `enabled`, `data`) or plain text.'],
    ['baseItemWidth, baseItemHeight', '`Bind<number>`', '`100`', 'The size of a base cell in pixels. A tile spans `widthRatio` × `heightRatio` cells.'],
    ['direction', '`Bind<TileViewDirection>`', "`'horizontal'`", '`horizontal` fills the height in columns and scrolls horizontally (set a `height`). `vertical` fills the width in rows.'],
    ['selectionMode', '`Bind<TileViewSelectionMode>`', "`'none'`", '`none`, `single` or `multiple`.'],
    ['value', '`Bind<string | number | null | (string | number)[]>`', '`null`', 'The selected tile (`single`), identified by its `key` or index, or a list of selected tiles (`multiple`). `x-model` provides two-way binding.'],
    ['allowReorder', '`Bind<boolean>`', '`false`', 'Lets users reorder tiles by dragging or with Ctrl and an arrow key.'],
    ['height', '`Bind<string | number | null>`', '`null`', 'A CSS length or pixels.'],
    ['label', '`Bind<string>`', 'The kit string “Tiles”', 'The accessible name.']
];

const MEMBERS = [
    ['onItemClick', 'event', 'Occurs when a tile is clicked without dragging (`index`, `item`, `event`), or when Enter is pressed on a focused tile.'],
    ['onSelectionChanged', 'event', 'Occurs when the selected tiles change (`indexes`, `items`, `byUser`).'],
    ['onReordering', 'event', 'Occurs before a tile is dragged or moved with the keyboard (`fromIndex`, `toIndex`). Set `cancel = true` to keep it in place.'],
    ['onReordered', 'event', 'Occurs after a tile is dropped or moved to a new position (`item`, `fromIndex`, `toIndex`). Your code reorders the data.'],
    ['selectedIndexes', 'read-only', 'The indexes of the selected tiles, in tile order.'],
    ['count', 'read-only', 'The number of tiles.'],
    ['isDragging', 'read-only', 'Indicates that a tile is being dragged.'],
    ['select(index)', '`void`', 'Selects a tile programmatically, as the only one (`single`) or in addition to others (`multiple`).'],
    ['indexOf(value), valueAt(index)', '`number`, `string | number`', 'Converts between a value (a key or an index) and a tile index.'],
    ['refresh()', '`void`', 'Re-reads the items after they have been changed in place.']
];

const KEYS = [
    ['Tab', 'One Tab stop: the tile focused last, otherwise the first selected tile, otherwise the first tile.'],
    ['Arrow keys', 'Moves to the nearest tile in that direction, based on tile positions. Home and End move to the first and last tile.'],
    ['Space', 'Selects the tile (`single`), or toggles it (`multiple`).'],
    ['Enter', 'Acts as a click on the tile: raises `onItemClick` and applies the selection.'],
    ['Ctrl + Arrow keys', 'With `allowReorder`, moves the tile one position back or forward. Ctrl + Home and End move it to the ends, and each move is announced.']
];

const A11Y = [
    ['Roles', 'A `list` of `listitem` elements without selection, or a `listbox` of `option` elements with it (`aria-multiselectable` for `multiple`), each with `aria-selected`.'],
    ['Disabled tiles', '`aria-disabled`. The tile is skipped by the keyboard and cannot be selected with a click.'],
    ['Dragging', 'A copy of the tile follows the pointer, the tile at the drop position is marked, and Escape cancels. On a touch screen, a long press lifts the tile.']
];

const HOOKS = [
    ['.mx-tile-view', 'The view. `data-direction`, `data-reorder`, and `data-dragging` while a tile is dragged.'],
    ['.mx-tile-view__tile', 'A tile. `aria-selected`, `aria-disabled`, `data-dragging` (shown faded in place), and `data-drop="before|after"` at the drop position.'],
    ['.mx-tile-view__text, .mx-tile-view__ghost', 'The tile text, and the copy that follows the pointer.']
];

const TOKENS = [
    ['tile-view.tile, .text, .ghost, .view', 'Units: a tile (`hover`, `pressed`, `focus`, `selected`, `disabled`, `dragging`, `target`), its text, the drag copy and the view.'],
    ['tile-view.gap', 'The gap between tiles.']
];

export default function TileViewPage() {
    return (
        <>
            <p class="lead">
              <Rich text="Arranges tiles of different sizes on a grid of base cells, where each tile spans a set number of cells. Tiles fill the height in columns and scroll horizontally, or fill the width in rows. They can be selected and reordered by dragging." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { TileView } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Tile grid">
                <p>
                    <Rich text="`baseItemWidth` and `baseItemHeight` define one cell, and a tile's `widthRatio` and `heightRatio` set how many cells it spans. In the default `horizontal` direction, the view needs a `height` and scrolls horizontally. Tiles are packed so that no cell stays empty where a later tile fits." />
                </p>
                <Example stack files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>

            <Section anchor="selection" title="Selecting tiles">
                <p>
                    <Rich text="`selectionMode` makes tiles selectable. `single` keeps one selected, and `multiple` allows any number (Ctrl + click or Space adds and removes). `value` is the `key` or index of the selected tile, or a list of them, and `x-model` provides two-way binding. The arrow keys move through the grid based on tile positions." />
                </p>
                <Example stack files={code('Selection.tsx')}>
                    <Selection />
                </Example>
            </Section>

            <Section anchor="reorder" title="Reordering">
                <p>
                    <Rich text="With `allowReorder`, users can drag a tile to a new position (a long press on a touch screen) or move it with Ctrl and an arrow key. The tile moves and `onReordered` reports the indexes. Reorder your data there, as the example does, so the next render matches." />
                </p>
                <Example stack files={code('Reorder.tsx')}>
                    <Reorder />
                </Example>
            </Section>

            <Section anchor="content" title="Any content">
                <p>
                    <Rich text="An item's `content` creates the tile content when the tile is created, and it behaves the same as anywhere else. A click on a button inside goes to that button. `onItemClick` reports a click on the tile itself." />
                </p>
                <Example stack files={code('Content.tsx')}>
                    <Content />
                </Example>
            </Section>

            <Section anchor="keyboard" title="Keyboard">
                <ApiTable head={['Key', 'Description']} rows={KEYS} />
            </Section>

            <Section anchor="a11y" title="Accessibility">
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>

            <Section anchor="styling" title="Styling">
                <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
                <h3>
                  <Rich text="Component tokens" />
                </h3>
                <ApiTable head={['Token', 'Description']} rows={TOKENS} />
            </Section>

            <Section anchor="api" title="API reference">
                <h3>
                  <Rich text="Props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                  <Rich text="Events, properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Type', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
