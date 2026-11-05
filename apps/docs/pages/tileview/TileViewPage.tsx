import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import Content from './examples/Content';
import Reorder from './examples/Reorder';
import Selection from './examples/Selection';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['items', '`Bind<readonly (TileViewItem | string)[]>`', '`[]`', 'The tiles in order: `TileViewItem`s (`text`, `widthRatio`, `heightRatio`, `key`, `content`, `enabled`, `data`) or plain texts.'],
    ['baseItemWidth, baseItemHeight', '`Bind<number>`', '`100`', 'A base cell in pixels; a tile is `widthRatio` × `heightRatio` of them.'],
    ['direction', '`Bind<TileViewDirection>`', "`'horizontal'`", '`horizontal`: the tiles fill the height in columns and the view scrolls sideways (give it a `height`); `vertical`: they fill the width in rows.'],
    ['selectionMode', '`Bind<TileViewSelectionMode>`', "`'none'`", '`none`, `single` or `multiple`.'],
    ['value', '`Bind<string | number | null | (string | number)[]>`', '`null`', 'The chosen tile (`single`): its `key`, else its index; the chosen tiles (`multiple`) as a list. `x-model` binds it two-way.'],
    ['allowReorder', '`Bind<boolean>`', '`false`', 'The tiles can be put in another order by dragging, or with Ctrl and an arrow key.'],
    ['height', '`Bind<string | number | null>`', '`null`', 'A CSS length or pixels.'],
    ['label', '`Bind<string>`', 'the kit’s “Tiles”', 'What screen readers call it.']
];

const MEMBERS = [
    ['onItemClick', 'event', 'A press on a tile that was not a drag (`index`, `item`, `event`); Enter on a focused tile too.'],
    ['onSelectionChanged', 'event', 'The chosen tiles changed (`indexes`, `items`, `byUser`).'],
    ['onReordering', 'event', 'A tile is about to be dragged or moved with the keys (`fromIndex`, `toIndex`); `cancel = true` keeps it.'],
    ['onReordered', 'event', 'A tile was dropped or moved to a new place (`item`, `fromIndex`, `toIndex`): your data is yours to reorder.'],
    ['selectedIndexes', 'read-only', 'The chosen tiles’ indexes, in tile order.'],
    ['count', 'read-only', 'How many tiles there are.'],
    ['isDragging', 'read-only', 'A tile is being dragged.'],
    ['select(index)', '`void`', 'Chooses a tile programmatically: the only one (`single`), or one more (`multiple`).'],
    ['indexOf(value), valueAt(index)', '`number`, `string | number`', 'Between a value (a key or an index) and a tile’s index.'],
    ['refresh()', '`void`', 'Reads the items again after they were changed in place.']
];

const KEYS = [
    ['Tab', 'One stop: the tile focused last, else the first chosen, else the first.'],
    ['Arrow keys', 'The nearest tile that way, by where the tiles lie; Home and End the first and the last.'],
    ['Space', 'Chooses the tile (`single`), or chooses it or lets it go (`multiple`).'],
    ['Enter', 'A press on the tile: `onItemClick`, and the choice as a press makes it.'],
    ['Ctrl + Arrow keys', 'With `allowReorder`: moves the tile a place back or on; Ctrl + Home and End to the ends. The move is read out.']
];

const A11Y = [
    ['Roles', 'A `list` of `listitem`s without selection; a `listbox` of `option`s with it (`aria-multiselectable` for `multiple`), each `aria-selected`.'],
    ['Disabled tiles', '`aria-disabled`, skipped by the keys, not chosen by a press.'],
    ['Dragging', 'A copy of the tile follows the pointer; the tile where the drop would land is marked; Escape lets go. On a touch screen a long press lifts the tile.']
];

const HOOKS = [
    ['.mx-tile-view', 'The view. `data-direction`, `data-reorder`, `data-dragging` while a tile is dragged.'],
    ['.mx-tile-view__tile', 'A tile. `aria-selected`, `aria-disabled`, `data-dragging` (left faint in its place), `data-drop="before|after"` where the drop would land.'],
    ['.mx-tile-view__text, .mx-tile-view__ghost', 'A tile’s text; the copy after the pointer.']
];

const TOKENS = [
    ['tile-view.tile, .text, .ghost, .view', 'Units: a tile (`hover`, `pressed`, `focus`, `selected`, `disabled`, `dragging`, `target`), its text, the copy after the pointer, the view.'],
    ['tile-view.gap', 'Between the tiles.']
];

export default function TileViewPage() {
    return (
        <>
            <p class="lead">
                Tiles of different sizes packed on a grid of base cells: a tile is so many cells wide and tall. They fill the height in
                columns and scroll sideways, or fill the width in rows; they can be chosen, and put in another order by dragging.
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { TileView } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Tiles on a grid">
                <p>
                    <Rich text="`baseItemWidth` and `baseItemHeight` are one cell; a tile’s `widthRatio` and `heightRatio` say how many it takes. Down the columns (`horizontal`, the default) the view needs a `height` and scrolls sideways; the tiles are packed so no cell stays empty where a later tile fits." />
                </p>
                <Example stack files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>

            <Section anchor="selection" title="Choosing tiles">
                <p>
                    <Rich text="`selectionMode` makes the tiles options: `single` keeps one, `multiple` any number (Ctrl and a press, or Space, adds and takes away). `value` is the chosen tile’s `key`, else its index, or a list of them; `x-model` binds it two-way. The arrow keys walk the grid by where the tiles lie." />
                </p>
                <Example stack files={code('Selection.tsx')}>
                    <Selection />
                </Example>
            </Section>

            <Section anchor="reorder" title="Another order">
                <p>
                    <Rich text="With `allowReorder` a tile is dragged to its new place (a long press on a touch screen) or moved with Ctrl and an arrow key. The tile moves and `onReordered` tells the indexes: reorder your data there, as the example does, so the next draw agrees." />
                </p>
                <Example stack files={code('Reorder.tsx')}>
                    <Reorder />
                </Example>
            </Section>

            <Section anchor="content" title="Any content">
                <p>
                    <Rich text="An item’s `content` makes the tile’s content when the tile is made; what is in it works as anywhere else, and a press on a button inside is that button’s. `onItemClick` tells a press on the tile itself." />
                </p>
                <Example stack files={code('Content.tsx')}>
                    <Content />
                </Example>
            </Section>

            <Section anchor="keyboard" title="Keyboard">
                <ApiTable head={['Key', 'What it does']} rows={KEYS} />
            </Section>

            <Section anchor="a11y" title="Accessibility">
                <ApiTable head={['Topic', 'How']} rows={A11Y} />
            </Section>

            <Section anchor="styling" title="Styling">
                <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
                <h3>Component tokens</h3>
                <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
            </Section>

            <Section anchor="api" title="API reference">
                <h3>Props</h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>Events, properties and methods</h3>
                <ApiTable head={['Member', 'Kind', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
