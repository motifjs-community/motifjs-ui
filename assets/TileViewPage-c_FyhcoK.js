import{Qn as e,Zn as t,er as n,n as r}from"./next-id-CtzpBrBT.js";import{t as i}from"./TileView-Cgx8bixt.js";import{t as a}from"./Stack-wRt1e9tO.js";import{a as o,i as s,n as c,r as l,t as u}from"./docs-B_LZlyP5.js";import{t as d}from"./sources-BXVvOiIY.js";var f=`import { TileView } from '@motifx-community/ui';\r
\r
/** Tiles of one, two and four base cells packed down the columns; the view scrolls sideways when they do not fit. */\r
export default function Basic() {\r
    return (\r
        <TileView\r
            class="tv-board"\r
            label="Board"\r
            height={330}\r
            baseItemWidth={120}\r
            baseItemHeight={100}\r
            items={[\r
                { text: 'Sales today', widthRatio: 2 },\r
                { text: 'Orders' },\r
                { text: 'Returns' },\r
                { text: 'Visitors this week', widthRatio: 2, heightRatio: 2 },\r
                { text: 'Stock' },\r
                { text: 'Staff on duty', heightRatio: 2 },\r
                { text: 'Tickets' },\r
                { text: 'Deliveries', widthRatio: 2 },\r
                { text: 'Reviews' },\r
                { text: 'Costs' }\r
            ]}\r
        />\r
    );\r
}\r
`,p=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TileView } from '@motifx-community/ui';\r
\r
const ROOMS = [\r
    { name: 'Kitchen', temp: 21 },\r
    { name: 'Lounge', temp: 23 },\r
    { name: 'Study', temp: 19 },\r
    { name: 'Bedroom', temp: 18 }\r
];\r
\r
/** Any content on a tile: a room each, with its own button. A click on the tile itself is also reported. */\r
export default function Content() {\r
    const s = reactive({ told: '' });\r
    const room = (r: (typeof ROOMS)[number]) => (\r
        <Stack class="tv-room" gap="xs" justify="center" style="block-size: 100%">\r
            <strong>{r.name}</strong>\r
            <span class="tv-room-temp">{r.temp} °C</span>\r
            <Button text="Warmer" variant="outline" size="sm" onclick={() => (s.told = \`\${r.name}: warmer\`)} />\r
        </Stack>\r
    );\r
    return (\r
        <Stack gap="sm" style="inline-size: 100%">\r
            <TileView class="tv-rooms" label="Rooms" direction="vertical" baseItemWidth={150} baseItemHeight={120} items={ROOMS.map(r => ({ key: r.name, content: () => room(r) }))} onItemClick={e => (s.told = \`\${(e.item as { key: string }).key} pressed\`)} />\r
            <output class="tv-rooms-told">{() => s.told}</output>\r
        </Stack>\r
    );\r
}\r
`,m=`import { reactive } from '@motifx/core';\r
import { Stack, TileView } from '@motifx-community/ui';\r
\r
/** Drag a tile to another place, or move it with Ctrl and an arrow key; the data is reordered in \`onReordered\`. */\r
export default function Reorder() {\r
    const s = reactive({ tiles: [{ text: 'Plan' }, { text: 'Design', widthRatio: 2 }, { text: 'Build' }, { text: 'Test' }, { text: 'Ship', heightRatio: 2 }, { text: 'Rest' }] });\r
    return (\r
        <Stack gap="sm" style="inline-size: 100%">\r
            <TileView\r
                class="tv-order"\r
                label="Steps"\r
                direction="vertical"\r
                allowReorder\r
                baseItemWidth={100}\r
                baseItemHeight={70}\r
                items={() => s.tiles}\r
                onReordered={e => s.tiles.splice(e.toIndex, 0, ...s.tiles.splice(e.fromIndex, 1))}\r
            />\r
            <output class="tv-order-told">{() => s.tiles.map(t => t.text).join(', ')}</output>\r
        </Stack>\r
    );\r
}\r
`,h=`import { reactive } from '@motifx/core';\r
import { Stack, TileView } from '@motifx-community/ui';\r
\r
/** Tiles along the rows with any number selected: click, Ctrl + click or Space, and the arrow keys move through the grid. */\r
export default function Selection() {\r
    const s = reactive({ chosen: ['tea'] as string | number | null | readonly (string | number)[] });\r
    return (\r
        <Stack gap="sm" style="inline-size: 100%">\r
            <TileView\r
                class="tv-pick"\r
                label="Snacks"\r
                direction="vertical"\r
                selectionMode="multiple"\r
                baseItemWidth={110}\r
                baseItemHeight={70}\r
                x-model={() => s.chosen}\r
                items={[\r
                    { key: 'tea', text: 'Tea' },\r
                    { key: 'coffee', text: 'Coffee' },\r
                    { key: 'water', text: 'Water', enabled: false },\r
                    { key: 'cake', text: 'Cake', widthRatio: 2 },\r
                    { key: 'fruit', text: 'Fruit' },\r
                    { key: 'nuts', text: 'Nuts' }\r
                ]}\r
            />\r
            <output class="tv-pick-told">{() => \`chosen: \${JSON.stringify(s.chosen)}\`}</output>\r
        </Stack>\r
    );\r
}\r
`;function g(){return t(i,{class:`tv-board`,label:`Board`,height:330,baseItemWidth:120,baseItemHeight:100,items:[{text:`Sales today`,widthRatio:2},{text:`Orders`},{text:`Returns`},{text:`Visitors this week`,widthRatio:2,heightRatio:2},{text:`Stock`},{text:`Staff on duty`,heightRatio:2},{text:`Tickets`},{text:`Deliveries`,widthRatio:2},{text:`Reviews`},{text:`Costs`}],runover:{},childs:[]})}var _=[{name:`Kitchen`,temp:21},{name:`Lounge`,temp:23},{name:`Study`,temp:19},{name:`Bedroom`,temp:18}];function v(){let e=n({told:``}),o=n=>t(a,{class:`tv-room`,gap:`xs`,justify:`center`,style:`block-size: 100%`,runover:{},childs:[t(`strong`,{initializeComponent:e=>{let r=t(`text`,{initializeComponent:e=>{e.bindings.add(`textContent`,n,`name`)},__childExpr:()=>n.name});e.controls.add(r)}},1),t(`span`,{initializeComponent:e=>{e.class.add(`tv-room-temp`);let r=t(`text`,{initializeComponent:e=>{e.bindings.add(`textContent`,n,`temp`)},__childExpr:()=>n.temp});e.controls.add(r);let i=t(`text`,{initializeComponent:e=>{e.setText(` °C`)}},1);e.controls.add(i)}},1),t(r,{text:`Warmer`,variant:`outline`,size:`sm`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.told=`${n.name}: warmer`)}},childs:[]})]});return t(a,{gap:`sm`,style:`inline-size: 100%`,runover:{},childs:[t(i,{class:`tv-rooms`,label:`Rooms`,direction:`vertical`,baseItemWidth:150,baseItemHeight:120,items:_.map(e=>({key:e.name,content:()=>o(e)})),onItemClick:t=>e.told=`${t.item.key} pressed`,runover:{},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`tv-rooms-told`),t.bindings.method(()=>e.told)}},1)]})}function y(){let e=n({tiles:[{text:`Plan`},{text:`Design`,widthRatio:2},{text:`Build`},{text:`Test`},{text:`Ship`,heightRatio:2},{text:`Rest`}]});return t(a,{gap:`sm`,style:`inline-size: 100%`,runover:{},childs:[t(i,{class:`tv-order`,label:`Steps`,direction:`vertical`,allowReorder:!0,baseItemWidth:100,baseItemHeight:70,items:()=>e.tiles,onReordered:t=>e.tiles.splice(t.toIndex,0,...e.tiles.splice(t.fromIndex,1)),runover:{},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`tv-order-told`),t.bindings.method(()=>e.tiles.map(e=>e.text).join(`, `))}},1)]})}function b(){let e=n({chosen:[`tea`]});return t(a,{gap:`sm`,style:`inline-size: 100%`,runover:{},childs:[t(i,{class:`tv-pick`,label:`Snacks`,direction:`vertical`,selectionMode:`multiple`,baseItemWidth:110,baseItemHeight:70,items:[{key:`tea`,text:`Tea`},{key:`coffee`,text:`Coffee`},{key:`water`,text:`Water`,enabled:!1},{key:`cake`,text:`Cake`,widthRatio:2},{key:`fruit`,text:`Fruit`},{key:`nuts`,text:`Nuts`}],runover:{initializeComponent:t=>{t.bindings.model(()=>e.chosen,t=>{let n=e;n!=null&&typeof n.chosen!=`function`&&(n.chosen=t)})}},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`tv-pick-told`),t.bindings.method(()=>`chosen: ${JSON.stringify(e.chosen)}`)}},1)]})}var x=d(Object.assign({"./examples/Basic.tsx":f,"./examples/Content.tsx":p,"./examples/Reorder.tsx":m,"./examples/Selection.tsx":h})),S=[[`items`,"`Bind<readonly (TileViewItem | string)[]>`","`[]`","The tiles in order: `TileViewItem` objects (`text`, `widthRatio`, `heightRatio`, `key`, `content`, `enabled`, `data`) or plain text."],[`baseItemWidth, baseItemHeight`,"`Bind<number>`","`100`","The size of a base cell in pixels. A tile spans `widthRatio` × `heightRatio` cells."],[`direction`,"`Bind<TileViewDirection>`","`'horizontal'`","`horizontal` fills the height in columns and scrolls horizontally (set a `height`). `vertical` fills the width in rows."],[`selectionMode`,"`Bind<TileViewSelectionMode>`","`'none'`","`none`, `single` or `multiple`."],[`value`,"`Bind<string | number | null | (string | number)[]>`","`null`","The selected tile (`single`), identified by its `key` or index, or a list of selected tiles (`multiple`). `x-model` provides two-way binding."],[`allowReorder`,"`Bind<boolean>`","`false`",`Lets users reorder tiles by dragging or with Ctrl and an arrow key.`],[`height`,"`Bind<string | number | null>`","`null`",`A CSS length or pixels.`],[`label`,"`Bind<string>`",`The kit string “Tiles”`,`The accessible name.`]],C=[[`onItemClick`,`event`,"Occurs when a tile is clicked without dragging (`index`, `item`, `event`), or when Enter is pressed on a focused tile."],[`onSelectionChanged`,`event`,"Occurs when the selected tiles change (`indexes`, `items`, `byUser`)."],[`onReordering`,`event`,"Occurs before a tile is dragged or moved with the keyboard (`fromIndex`, `toIndex`). Set `cancel = true` to keep it in place."],[`onReordered`,`event`,"Occurs after a tile is dropped or moved to a new position (`item`, `fromIndex`, `toIndex`). Your code reorders the data."],[`selectedIndexes`,`read-only`,`The indexes of the selected tiles, in tile order.`],[`count`,`read-only`,`The number of tiles.`],[`isDragging`,`read-only`,`Indicates that a tile is being dragged.`],[`select(index)`,"`void`","Selects a tile programmatically, as the only one (`single`) or in addition to others (`multiple`)."],[`indexOf(value), valueAt(index)`,"`number`, `string | number`",`Converts between a value (a key or an index) and a tile index.`],[`refresh()`,"`void`",`Re-reads the items after they have been changed in place.`]],w=[[`Tab`,`One Tab stop: the tile focused last, otherwise the first selected tile, otherwise the first tile.`],[`Arrow keys`,`Moves to the nearest tile in that direction, based on tile positions. Home and End move to the first and last tile.`],[`Space`,"Selects the tile (`single`), or toggles it (`multiple`)."],[`Enter`,"Acts as a click on the tile: raises `onItemClick` and applies the selection."],[`Ctrl + Arrow keys`,"With `allowReorder`, moves the tile one position back or forward. Ctrl + Home and End move it to the ends, and each move is announced."]],T=[[`Roles`,"A `list` of `listitem` elements without selection, or a `listbox` of `option` elements with it (`aria-multiselectable` for `multiple`), each with `aria-selected`."],[`Disabled tiles`,"`aria-disabled`. The tile is skipped by the keyboard and cannot be selected with a click."],[`Dragging`,`A copy of the tile follows the pointer, the tile at the drop position is marked, and Escape cancels. On a touch screen, a long press lifts the tile.`]],E=[[`.mx-tile-view`,"The view. `data-direction`, `data-reorder`, and `data-dragging` while a tile is dragged."],[`.mx-tile-view__tile`,'A tile. `aria-selected`, `aria-disabled`, `data-dragging` (shown faded in place), and `data-drop="before|after"` at the drop position.'],[`.mx-tile-view__text, .mx-tile-view__ghost`,`The tile text, and the copy that follows the pointer.`]],D=[[`tile-view.tile, .text, .ghost, .view`,"Units: a tile (`hover`, `pressed`, `focus`, `selected`, `disabled`, `dragging`, `target`), its text, the drag copy and the view."],[`tile-view.gap`,`The gap between tiles.`]];function O(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(l,{text:`Arranges tiles of different sizes on a grid of base cells, where each tile spans a set number of cells. Tiles fill the height in columns and scroll horizontally, or fill the width in rows. They can be selected and reordered by dragging.`,runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(s,{anchor:`import`,title:`Import`,runover:{},childs:[t(o,{code:`
import { TileView } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(s,{anchor:`ways`,title:`Tile grid`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"`baseItemWidth` and `baseItemHeight` define one cell, and a tile's `widthRatio` and `heightRatio` set how many cells it spans. In the default `horizontal` direction, the view needs a `height` and scrolls horizontally. Tiles are packed so that no cell stays empty where a later tile fits.",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{stack:!0,files:x(`Basic.tsx`),runover:{},childs:[t(g,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(s,{anchor:`selection`,title:`Selecting tiles`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"`selectionMode` makes tiles selectable. `single` keeps one selected, and `multiple` allows any number (Ctrl + click or Space adds and removes). `value` is the `key` or index of the selected tile, or a list of them, and `x-model` provides two-way binding. The arrow keys move through the grid based on tile positions.",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{stack:!0,files:x(`Selection.tsx`),runover:{},childs:[t(b,{runover:{},childs:[]})]})]});e.controls.add(a);let d=t(s,{anchor:`reorder`,title:`Reordering`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"With `allowReorder`, users can drag a tile to a new position (a long press on a touch screen) or move it with Ctrl and an arrow key. The tile moves and `onReordered` reports the indexes. Reorder your data there, as the example does, so the next render matches.",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{stack:!0,files:x(`Reorder.tsx`),runover:{},childs:[t(y,{runover:{},childs:[]})]})]});e.controls.add(d);let f=t(s,{anchor:`content`,title:`Any content`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"An item's `content` creates the tile content when the tile is created, and it behaves the same as anywhere else. A click on a button inside goes to that button. `onItemClick` reports a click on the tile itself.",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{stack:!0,files:x(`Content.tsx`),runover:{},childs:[t(v,{runover:{},childs:[]})]})]});e.controls.add(f);let p=t(s,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[t(u,{head:[`Key`,`Description`],rows:w,runover:{},childs:[]})]});e.controls.add(p);let m=t(s,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(u,{head:[`Topic`,`Details`],rows:T,runover:{},childs:[]})]});e.controls.add(m);let h=t(s,{anchor:`styling`,title:`Styling`,runover:{},childs:[t(u,{head:[`Hook`,`Description`],rows:E,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(l,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(u,{head:[`Token`,`Description`],rows:D,runover:{},childs:[]})]});e.controls.add(h);let _=t(s,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(l,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(u,{head:[`Prop`,`Type`,`Default`,`Description`],rows:S,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(l,{text:`Events, properties and methods`,runover:{},childs:[]});e.controls.add(n)}},1),t(u,{head:[`Member`,`Type`,`Description`],rows:C,runover:{},childs:[]})]});e.controls.add(_)}}})}export{O as default};