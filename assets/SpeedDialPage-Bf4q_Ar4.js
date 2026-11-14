import{Qn as e,Zn as t,er as n,n as r}from"./next-id-CtzpBrBT.js";import{t as i}from"./SpeedDial-CIMDSjPR.js";import{t as a}from"./Stack-wRt1e9tO.js";import{a as o,i as s,n as c,r as l,t as u}from"./docs-B_LZlyP5.js";import{t as d}from"./sources-BXVvOiIY.js";var f=`import { reactive } from '@motifx/core';\r
import { Button, SpeedDial, Stack } from '@motifx-community/ui';\r
\r
/** The actions on a whole circle around the button, in the centre of a box; by default just far enough out to keep them apart. */\r
export default function Circle() {\r
    const s = reactive({ radius: null as number | null, told: '' });\r
    const actions = [\r
        { text: 'Edit', glyph: 'pencil', click: () => (s.told = 'edit') },\r
        { text: 'Refresh', glyph: 'repeat', click: () => (s.told = 'refresh') },\r
        { text: 'Delete', glyph: 'trash', click: () => (s.told = 'delete') },\r
        { text: 'Upload', glyph: 'upload', click: () => (s.told = 'upload') },\r
        { text: 'Download', glyph: 'download', click: () => (s.told = 'download') }\r
    ];\r
    return (\r
        <Stack gap="sm" style="inline-size: 100%">\r
            <Stack orientation="horizontal" wrap align="center">\r
                <Button text="Radius by itself" variant="outline" onclick={() => (s.radius = null)} />\r
                <Button text="Radius 120" variant="outline" onclick={() => (s.radius = 120)} />\r
                <output class="sd-circle-told">{() => s.told}</output>\r
            </Stack>\r
            <div style="position: relative; inline-size: 100%; block-size: 22rem">\r
                <SpeedDial class="sd-circle" layout="circle" position="center" relativeTo="parent" radius={() => s.radius} text="Tools" actions={actions} />\r
            </div>\r
        </Stack>\r
    );\r
}\r
`,p=`import { reactive } from '@motifx/core';\r
import { Button, SpeedDial, Stack } from '@motifx-community/ui';\r
\r
/** A speed dial fixed to a corner of the viewport, shown while the switch is on; the corner and the fan's way can change. */\r
export default function Corner() {\r
    const s = reactive({ on: false, position: 'bottom-end' as 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start', told: '' });\r
    return (\r
        <Stack gap="sm" style="inline-size: 100%">\r
            <Stack orientation="horizontal" wrap align="center">\r
                <Button class="sd-corner-toggle" text="In the corner" variant="outline" toggle x-model={() => s.on} />\r
                <Button text="Bottom end" variant="outline" onclick={() => (s.position = 'bottom-end')} />\r
                <Button text="Bottom start" variant="outline" onclick={() => (s.position = 'bottom-start')} />\r
                <Button text="Top end" variant="outline" onclick={() => (s.position = 'top-end')} />\r
                <output class="sd-corner-told">{() => s.told}</output>\r
            </Stack>\r
            <SpeedDial\r
                class="sd-corner"\r
                visible={() => s.on}\r
                position={() => s.position}\r
                text="Create"\r
                actions={[\r
                    { text: 'Document', glyph: 'file', click: () => (s.told = 'a document') },\r
                    { text: 'Folder', glyph: 'columns', click: () => (s.told = 'a folder') },\r
                    { text: 'Upload', glyph: 'upload', click: () => (s.told = 'an upload') }\r
                ]}\r
            />\r
        </Stack>\r
    );\r
}\r
`,m=`import { reactive } from '@motifx/core';\r
import { SpeedDial, Stack } from '@motifx-community/ui';\r
\r
/** Two speed dials in the page flow: one opens upward and one toward the end. Clicking an action reports it. */\r
export default function Inline() {\r
    const s = reactive({ told: '', open: false });\r
    const actions = [\r
        { key: 'note', text: 'New note', glyph: 'pencil', click: () => (s.told = 'a new note') },\r
        { key: 'event', text: 'New event', glyph: 'calendar', click: () => (s.told = 'a new event') },\r
        { key: 'file', text: 'Upload a file', glyph: 'upload', click: () => (s.told = 'a file to upload') },\r
        { key: 'locked', text: 'Not yet', glyph: 'lock', enabled: false }\r
    ];\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <div class="sd-row" style="display: flex; align-items: flex-end; gap: 48px; min-block-size: 260px; padding-inline-start: 140px">\r
                <SpeedDial class="sd-up" position="inline" direction="up" text="New" actions={actions} x-model={() => s.open} />\r
                <SpeedDial class="sd-end" position="inline" direction="end" text="Share" glyph="person" actions={[{ text: 'Mail', glyph: 'file', click: () => (s.told = 'shared by mail') }, { text: 'Link', glyph: 'pin', click: () => (s.told = 'a link to share') }]} />\r
            </div>\r
            <output class="sd-told">{() => \`\${s.told || 'nothing yet'}\${s.open ? ' (open)' : ''}\`}</output>\r
        </Stack>\r
    );\r
}\r
`,h=`import { SpeedDial } from '@motifx-community/ui';\r
\r
const ACTIONS = [\r
    { text: 'Edit', glyph: 'pencil' },\r
    { text: 'Refresh', glyph: 'repeat' },\r
    { text: 'Delete', glyph: 'trash' },\r
    { text: 'Upload', glyph: 'upload' },\r
    { text: 'Download', glyph: 'download' }\r
];\r
\r
/** A quarter circle in each corner of a box: \`direction\` follows from \`position\`, into the box. */\r
export default function QuarterCircle() {\r
    return (\r
        <div class="sd-quarter" style="position: relative; inline-size: 100%; block-size: 26rem">\r
            <SpeedDial class="sd-quarter-top-start" layout="quarter-circle" position="top-start" relativeTo="parent" text="Tools, top start" actions={ACTIONS} />\r
            <SpeedDial class="sd-quarter-top-end" layout="quarter-circle" position="top-end" relativeTo="parent" text="Tools, top end" actions={ACTIONS} />\r
            <SpeedDial class="sd-quarter-bottom-start" layout="quarter-circle" position="bottom-start" relativeTo="parent" text="Tools, bottom start" actions={ACTIONS} />\r
            <SpeedDial class="sd-quarter-bottom-end" layout="quarter-circle" position="bottom-end" relativeTo="parent" text="Tools, bottom end" actions={ACTIONS} />\r
        </div>\r
    );\r
}\r
`,g=`import { SpeedDial } from '@motifx-community/ui';\r
\r
const ACTIONS = [\r
    { text: 'Edit', glyph: 'pencil' },\r
    { text: 'Refresh', glyph: 'repeat' },\r
    { text: 'Delete', glyph: 'trash' },\r
    { text: 'Upload', glyph: 'upload' },\r
    { text: 'Download', glyph: 'download' }\r
];\r
\r
/** A half circle on the middle of each edge of a box: \`direction\` follows from \`position\`, into the box. */\r
export default function SemiCircle() {\r
    return (\r
        <div class="sd-semi" style="position: relative; inline-size: 100%; block-size: 26rem">\r
            <SpeedDial class="sd-semi-top" layout="semi-circle" position="top" relativeTo="parent" text="Tools at the top" actions={ACTIONS} />\r
            <SpeedDial class="sd-semi-start" layout="semi-circle" position="start" relativeTo="parent" text="Tools at the start" actions={ACTIONS} />\r
            <SpeedDial class="sd-semi-end" layout="semi-circle" position="end" relativeTo="parent" text="Tools at the end" actions={ACTIONS} />\r
            <SpeedDial class="sd-semi-bottom" layout="semi-circle" position="bottom" relativeTo="parent" text="Tools at the bottom" actions={ACTIONS} />\r
        </div>\r
    );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { SpeedDial, Stack } from '@motifx-community/ui';\r
\r
/** With one action shown, the main button does it itself and takes its glyph and name; \`extended\` shows the name beside the glyph. */\r
export default function Single() {\r
    const s = reactive({ saved: 0 });\r
    return (\r
        <Stack gap="sm" style="inline-size: 100%">\r
            <Stack orientation="horizontal" gap="lg" align="center">\r
                <SpeedDial class="sd-single" position="inline" actions={[{ text: 'Save', glyph: 'save', click: () => s.saved++ }]} />\r
                <SpeedDial class="sd-extended" position="inline" extended actions={[{ text: 'Save a copy', glyph: 'save', click: () => s.saved++ }]} />\r
            </Stack>\r
            <output class="sd-single-told">{() => \`saved \${s.saved} times\`}</output>\r
        </Stack>\r
    );\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { Button, SpeedDial, Stack } from '@motifx-community/ui';\r
\r
/** Tooltips on the actions: the speed dial's options for all, a text or options of an action's own, none on one. */\r
export default function Tooltips() {\r
    const s = reactive({ on: true });\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <Button class="sd-tips-toggle" text="Tooltips" variant="outline" toggle x-model={() => s.on} />\r
            <div style="min-block-size: 5rem; padding-block-start: 2rem">\r
                <SpeedDial\r
                    class="sd-tips"\r
                    position="inline"\r
                    direction="end"\r
                    text="Edit"\r
                    closeOnAction={false}\r
                    showLabels={false}\r
                    tooltip={() => (s.on ? { placement: 'top', delay: 100 } : false)}\r
                    actions={[\r
                        { text: 'Edit', glyph: 'pencil' },\r
                        { text: 'Upload', glyph: 'upload', tooltip: 'Upload a new version, up to 20 MB' },\r
                        { text: 'Delete', glyph: 'trash', tooltip: { text: 'Kept in the bin for 30 days', placement: 'bottom' } },\r
                        { text: 'Save', glyph: 'save', tooltip: false }\r
                    ]}\r
                />\r
            </div>\r
        </Stack>\r
    );\r
}\r
`;function y(){let e=n({radius:null,told:``}),o=[{text:`Edit`,glyph:`pencil`,click:()=>e.told=`edit`},{text:`Refresh`,glyph:`repeat`,click:()=>e.told=`refresh`},{text:`Delete`,glyph:`trash`,click:()=>e.told=`delete`},{text:`Upload`,glyph:`upload`,click:()=>e.told=`upload`},{text:`Download`,glyph:`download`,click:()=>e.told=`download`}];return t(a,{gap:`sm`,style:`inline-size: 100%`,runover:{},childs:[t(a,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(r,{text:`Radius by itself`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.radius=null)}},childs:[]}),t(r,{text:`Radius 120`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.radius=120)}},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`sd-circle-told`),t.bindings.method(()=>e.told)}},1)]}),t(`div`,{initializeComponent:n=>{n.style(`position: relative; inline-size: 100%; block-size: 22rem`);let r=t(i,{class:`sd-circle`,layout:`circle`,position:`center`,relativeTo:`parent`,radius:()=>e.radius,text:`Tools`,actions:o,runover:{},childs:[]});n.controls.add(r)}},1)]})}function b(){let e=n({on:!1,position:`bottom-end`,told:``});return t(a,{gap:`sm`,style:`inline-size: 100%`,runover:{},childs:[t(a,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(r,{class:`sd-corner-toggle`,text:`In the corner`,variant:`outline`,toggle:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.on,t=>{let n=e;n!=null&&typeof n.on!=`function`&&(n.on=t)})}},childs:[]}),t(r,{text:`Bottom end`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.position=`bottom-end`)}},childs:[]}),t(r,{text:`Bottom start`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.position=`bottom-start`)}},childs:[]}),t(r,{text:`Top end`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.position=`top-end`)}},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`sd-corner-told`),t.bindings.method(()=>e.told)}},1)]}),t(i,{class:`sd-corner`,visible:()=>e.on,position:()=>e.position,text:`Create`,actions:[{text:`Document`,glyph:`file`,click:()=>e.told=`a document`},{text:`Folder`,glyph:`columns`,click:()=>e.told=`a folder`},{text:`Upload`,glyph:`upload`,click:()=>e.told=`an upload`}],runover:{},childs:[]})]})}function x(){let e=n({told:``,open:!1}),r=[{key:`note`,text:`New note`,glyph:`pencil`,click:()=>e.told=`a new note`},{key:`event`,text:`New event`,glyph:`calendar`,click:()=>e.told=`a new event`},{key:`file`,text:`Upload a file`,glyph:`upload`,click:()=>e.told=`a file to upload`},{key:`locked`,text:`Not yet`,glyph:`lock`,enabled:!1}];return t(a,{gap:`md`,style:`inline-size: 100%`,runover:{},childs:[t(`div`,{initializeComponent:n=>{n.style(`display: flex; align-items: flex-end; gap: 48px; min-block-size: 260px; padding-inline-start: 140px`),n.class.add(`sd-row`);let a=t(i,{class:`sd-up`,position:`inline`,direction:`up`,text:`New`,actions:r,runover:{initializeComponent:t=>{t.bindings.model(()=>e.open,t=>{let n=e;n!=null&&typeof n.open!=`function`&&(n.open=t)})}},childs:[]});n.controls.add(a);let o=t(i,{class:`sd-end`,position:`inline`,direction:`end`,text:`Share`,glyph:`person`,actions:[{text:`Mail`,glyph:`file`,click:()=>e.told=`shared by mail`},{text:`Link`,glyph:`pin`,click:()=>e.told=`a link to share`}],runover:{},childs:[]});n.controls.add(o)}},1),t(`output`,{initializeComponent:t=>{t.class.add(`sd-told`),t.bindings.method(()=>`${e.told||`nothing yet`}${e.open?` (open)`:``}`)}},1)]})}var S=[{text:`Edit`,glyph:`pencil`},{text:`Refresh`,glyph:`repeat`},{text:`Delete`,glyph:`trash`},{text:`Upload`,glyph:`upload`},{text:`Download`,glyph:`download`}];function C(){return t(`div`,{initializeComponent:e=>{e.style(`position: relative; inline-size: 100%; block-size: 26rem`),e.class.add(`sd-quarter`);let n=t(i,{class:`sd-quarter-top-start`,layout:`quarter-circle`,position:`top-start`,relativeTo:`parent`,text:`Tools, top start`,actions:S,runover:{},childs:[]});e.controls.add(n);let r=t(i,{class:`sd-quarter-top-end`,layout:`quarter-circle`,position:`top-end`,relativeTo:`parent`,text:`Tools, top end`,actions:S,runover:{},childs:[]});e.controls.add(r);let a=t(i,{class:`sd-quarter-bottom-start`,layout:`quarter-circle`,position:`bottom-start`,relativeTo:`parent`,text:`Tools, bottom start`,actions:S,runover:{},childs:[]});e.controls.add(a);let o=t(i,{class:`sd-quarter-bottom-end`,layout:`quarter-circle`,position:`bottom-end`,relativeTo:`parent`,text:`Tools, bottom end`,actions:S,runover:{},childs:[]});e.controls.add(o)}},1)}var w=[{text:`Edit`,glyph:`pencil`},{text:`Refresh`,glyph:`repeat`},{text:`Delete`,glyph:`trash`},{text:`Upload`,glyph:`upload`},{text:`Download`,glyph:`download`}];function T(){return t(`div`,{initializeComponent:e=>{e.style(`position: relative; inline-size: 100%; block-size: 26rem`),e.class.add(`sd-semi`);let n=t(i,{class:`sd-semi-top`,layout:`semi-circle`,position:`top`,relativeTo:`parent`,text:`Tools at the top`,actions:w,runover:{},childs:[]});e.controls.add(n);let r=t(i,{class:`sd-semi-start`,layout:`semi-circle`,position:`start`,relativeTo:`parent`,text:`Tools at the start`,actions:w,runover:{},childs:[]});e.controls.add(r);let a=t(i,{class:`sd-semi-end`,layout:`semi-circle`,position:`end`,relativeTo:`parent`,text:`Tools at the end`,actions:w,runover:{},childs:[]});e.controls.add(a);let o=t(i,{class:`sd-semi-bottom`,layout:`semi-circle`,position:`bottom`,relativeTo:`parent`,text:`Tools at the bottom`,actions:w,runover:{},childs:[]});e.controls.add(o)}},1)}function E(){let e=n({saved:0});return t(a,{gap:`sm`,style:`inline-size: 100%`,runover:{},childs:[t(a,{orientation:`horizontal`,gap:`lg`,align:`center`,runover:{},childs:[t(i,{class:`sd-single`,position:`inline`,actions:[{text:`Save`,glyph:`save`,click:()=>e.saved++}],runover:{},childs:[]}),t(i,{class:`sd-extended`,position:`inline`,extended:!0,actions:[{text:`Save a copy`,glyph:`save`,click:()=>e.saved++}],runover:{},childs:[]})]}),t(`output`,{initializeComponent:t=>{t.class.add(`sd-single-told`),t.bindings.method(()=>`saved ${e.saved} times`)}},1)]})}function D(){let e=n({on:!0});return t(a,{gap:`md`,style:`inline-size: 100%`,runover:{},childs:[t(r,{class:`sd-tips-toggle`,text:`Tooltips`,variant:`outline`,toggle:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.on,t=>{let n=e;n!=null&&typeof n.on!=`function`&&(n.on=t)})}},childs:[]}),t(`div`,{initializeComponent:n=>{n.style(`min-block-size: 5rem; padding-block-start: 2rem`);let r=t(i,{class:`sd-tips`,position:`inline`,direction:`end`,text:`Edit`,closeOnAction:!1,showLabels:!1,tooltip:()=>e.on?{placement:`top`,delay:100}:!1,actions:[{text:`Edit`,glyph:`pencil`},{text:`Upload`,glyph:`upload`,tooltip:`Upload a new version, up to 20 MB`},{text:`Delete`,glyph:`trash`,tooltip:{text:`Kept in the bin for 30 days`,placement:`bottom`}},{text:`Save`,glyph:`save`,tooltip:!1}],runover:{},childs:[]});n.controls.add(r)}},1)]})}var O=d(Object.assign({"./examples/Circle.tsx":f,"./examples/Corner.tsx":p,"./examples/Inline.tsx":m,"./examples/QuarterCircle.tsx":h,"./examples/SemiCircle.tsx":g,"./examples/Single.tsx":_,"./examples/Tooltips.tsx":v})),k=[[`actions`,"`Bind<readonly SpeedDialAction[]>`","`[]`","The actions, in order: `text`, `glyph` (from the kit's set) or `icon` (custom), `tooltip`, `enabled`, `visible`, `click`, `key` and `data`. If one action is visible, the main button performs it directly."],[`glyph, openGlyph`,"`Bind<string>`","`'plus'`, `'dismiss'`",`The glyph of the main button, and its glyph while the actions are open.`],[`text`,"`Bind<string>`",`The kit string “Actions”`,"The accessible name of the main button, and its text when `extended` is set."],[`extended`,"`Bind<boolean>`","`false`","Shows `text` next to the glyph on the main button."],[`layout`,"`Bind<SpeedDialLayout>`","`'linear'`","`linear`, `circle`, `semi-circle` or `quarter-circle`: a line from the main button, or a circular layout around it."],[`radius`,"`Bind<number | null>`",`Calculated`,"In circular layouts, the distance in pixels from the center of the main button to the center of each action. By default, it is just large enough to keep the actions apart. An `extended` button is wider than this calculation assumes, so set a value in that case."],[`direction`,"`Bind<SpeedDialDirection>`",`Into the page`,"`up`, `down`, `start`, `end` or a diagonal such as `up-start`. This is the direction the actions open in, and the middle of the arc in circular layouts. A linear layout uses the first part of a diagonal. By default, the actions open away from the edges named by `position`, or `up` when centered or inline."],[`position`,"`Bind<SpeedDialPosition>`","`'bottom-end'`","A corner (`bottom-end`, `bottom-start`, `top-end`, `top-start`), the middle of an edge (`top`, `bottom`, `start`, `end`), `center`, or `inline` to stay in the page flow."],[`relativeTo`,"`Bind<SpeedDialRelativeTo>`","`'viewport'`","The reference for `position`: `viewport`, or `parent` for the nearest positioned ancestor."],[`open`,"`Bind<boolean>`","`false`","Indicates whether the actions are open. `x-model` provides two-way binding."],[`closeOnAction`,"`Bind<boolean>`","`true`",`Closes the actions when one is selected.`],[`showLabels`,"`Bind<boolean>`",`On for linear, off for circular`,`Shows labels next to the actions while they are open.`],[`tooltip`,"`Bind<boolean | SpeedDialTooltip>`",`On when labels are off`,"Shows tooltips on the actions, using their `text`. Options are passed to each `Tooltip` (`placement`, `delay`, `hideDelay`, `showOn`, `content`…). By default, they open on the outer side after 200 ms. An action's own `tooltip` takes precedence and can be text, options, or `false` to disable it."]],A=[[`onOpened, onClosed`,`event`,"Occurs when the actions open or close (`byUser`)."],[`onActionClick`,`event`,"Occurs when an action is selected (`index`, `action`). The action's own `click` runs first."],[`isOpen`,`read-only`,`Indicates whether the actions are open.`],[`single`,`read-only`,"The single visible action, or `null` if there is more than one."],[`main`,`read-only`,`The main button.`],[`show(), close(), toggle()`,"`void`",`Opens or closes the actions.`],[`refresh()`,"`void`",`Re-reads the actions after they have been changed in place.`]],j=[[`Tab`,`The main button is the only Tab stop. Use the arrow keys to reach the actions.`],[`Arrow keys`,`On the main button, the arrow key that points along the actions opens them on the first action, and the opposite key opens them on the last. On the actions, the arrow keys move between them and wrap at the ends. A vertical line uses Up and Down, and a horizontal line uses Left and Right. In circular layouts both pairs work, with Down and Right moving forward around the circle.`],[`Home, End`,`Moves to the first or last action.`],[`Enter, Space`,`Presses the main button or the focused action.`],[`Escape`,`Closes the actions and returns focus to the main button. Clicking outside and pressing Tab also close them. If a tooltip is visible, the first Escape dismisses the tooltip.`]],M=[[`The main button`,'A button named by `text` (“Actions” in the kit language), with `aria-haspopup="menu"` and `aria-expanded`. With one action, it represents that action and takes its name.'],[`The actions`,"A `menu` of `menuitem` elements named by their labels. When closed, they are hidden from assistive technology and from the keyboard (`inert`)."],[`Labels and glyphs`,`Labels appear next to the actions while they are open, and each action carries its accessible name in either case. Glyphs are decorative.`],[`Tooltips`,"The kit's `Tooltip`. It also appears on keyboard focus, closes with Escape and is exposed through `aria-describedby`. Tooltips do not appear on touch, so keep the labels on if a glyph alone is not clear on a touch screen."]],N=[[`.mx-speed-dial`,"The speed dial. `data-layout`, `data-position`, `data-relative`, `data-direction`, `data-open`, `data-labels`, `data-extended`, `data-single`."],[`.mx-speed-dial__main, .mx-speed-dial__main-glyph, .mx-speed-dial__main-text`,`The main button, its glyph and its text.`],[`.mx-speed-dial__fan, .mx-speed-dial__action, .mx-speed-dial__action-icon, .mx-speed-dial__label`,"The action container, an action (`aria-disabled`, `data-side`: where its label and tooltip appear), its glyph or icon, and its label."]],P=[[`speed-dial.main, .main-glyph, .main-text, .action, .action-icon, .label, .fan`,"Units: the main button (`hover`, `pressed`, `focus`, `open`, `extended`, `disabled`), its glyph (`open`) and text, an action (`hover`, `pressed`, `focus`, `disabled`), its glyph, the label and the action container."],[`speed-dial.inset, .gap, .label-gap`,`Distance from the edges, gap between buttons (the radius preserves this gap in circular layouts), and gap between an action and its label.`]];function F(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(l,{text:`A floating action button that opens a set of related actions. Place it in a corner, on an edge or inline. Actions appear in a line with labels, or on a full, half or quarter circle around the button with tooltips. If there is only one action, the main button performs it directly.`,runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(s,{anchor:`import`,title:`Import`,runover:{},childs:[t(o,{code:`
import { SpeedDial } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(s,{anchor:`ways`,title:`Linear layout`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"`actions` defines the buttons, which open in the given `direction`. Each action has a `glyph` from the kit's icon set or a custom `icon`, a `text` shown as its label, and a `click` handler. `open` and `x-model` control whether the actions are visible. This example uses `position='inline'` to keep the button in the page flow.",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{stack:!0,files:O(`Inline.tsx`),runover:{},childs:[t(x,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(s,{anchor:`circle`,title:`Circle layout`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"`layout='circle'` places the actions evenly around the main button, starting from `direction`. They animate out from under the button and return there when closed. `radius` sets the distance. By default, it is calculated to keep the actions `gap` apart and clear of the button. Labels are off in circular layouts because they would overlap, so the actions show tooltips instead. You can change this with `showLabels` and `tooltip`. In this example, `relativeTo='parent'` centers the button in its box by measuring `position` against the nearest positioned ancestor.",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{stack:!0,files:O(`Circle.tsx`),runover:{},childs:[t(y,{runover:{},childs:[]})]})]});e.controls.add(a);let d=t(s,{anchor:`semi-circle`,title:`Semi-circle layout`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"`layout='semi-circle'` places the actions on a half circle centered on `direction`, which works well in the middle of an edge. `position` accepts `top`, `bottom`, `start` and `end`, and `direction` defaults to pointing into the page.",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{stack:!0,files:O(`SemiCircle.tsx`),runover:{},childs:[t(T,{runover:{},childs:[]})]})]});e.controls.add(d);let f=t(s,{anchor:`quarter-circle`,title:`Quarter-circle layout`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"`layout='quarter-circle'` places the actions on a quarter circle, which works well in a corner. `direction` is again derived from `position`. If you set it yourself, use a diagonal value such as `up-start`.",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{stack:!0,files:O(`QuarterCircle.tsx`),runover:{},childs:[t(C,{runover:{},childs:[]})]})]});e.controls.add(f);let p=t(s,{anchor:`tooltips`,title:`Tooltips`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"Use `tooltip` on the speed dial to turn tooltips on or off for all actions and to pass options to each one. `tooltip` on an action takes precedence and accepts text, options or `false`. Each tooltip is a kit `Tooltip` that opens on the outer side of the action unless `placement` specifies otherwise. With one action, the main button shows its tooltip.",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{stack:!0,files:O(`Tooltips.tsx`),runover:{},childs:[t(D,{runover:{},childs:[]})]})]});e.controls.add(p);let m=t(s,{anchor:`corner`,title:`Fixed to the viewport`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"By default, the button is fixed to the bottom end corner of the viewport, `inset` from the edges. Use `position` to choose another location. Turn it on here to see it over the page.",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{stack:!0,files:O(`Corner.tsx`),runover:{},childs:[t(b,{runover:{},childs:[]})]})]});e.controls.add(m);let h=t(s,{anchor:`single`,title:`Single action`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"When exactly one action is visible, there is nothing to expand. The main button takes the action's glyph and name, and runs the action directly. `extended` shows the name next to the glyph.",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{stack:!0,files:O(`Single.tsx`),runover:{},childs:[t(E,{runover:{},childs:[]})]})]});e.controls.add(h);let g=t(s,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[t(u,{head:[`Key`,`Description`],rows:j,runover:{},childs:[]})]});e.controls.add(g);let _=t(s,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(u,{head:[`Topic`,`Details`],rows:M,runover:{},childs:[]})]});e.controls.add(_);let v=t(s,{anchor:`styling`,title:`Styling`,runover:{},childs:[t(u,{head:[`Hook`,`Description`],rows:N,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(l,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(u,{head:[`Token`,`Description`],rows:P,runover:{},childs:[]})]});e.controls.add(v);let S=t(s,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(l,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(u,{head:[`Prop`,`Type`,`Default`,`Description`],rows:k,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(l,{text:`Events, properties and methods`,runover:{},childs:[]});e.controls.add(n)}},1),t(u,{head:[`Member`,`Type`,`Description`],rows:A,runover:{},childs:[]})]});e.controls.add(S)}}})}export{F as default};