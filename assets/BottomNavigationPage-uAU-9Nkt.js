import{Qn as e,Un as t,Zn as n,er as r,n as i}from"./next-id-CtzpBrBT.js";import{t as a}from"./Switch-CESerSF7.js";import{t as o}from"./ButtonGroup-D5Vn22Ds.js";import{t as s}from"./AppBar-ByA-B6r_.js";import{t as c}from"./BottomNavigation-BpArIxho.js";import{t as l}from"./Stack-wRt1e9tO.js";import{a as u,i as d,n as f,r as p,t as m}from"./docs-B_LZlyP5.js";import{t as h}from"./sources-BXVvOiIY.js";var g=`import { reactive } from '@motifx/core';\r
import { BottomNavigation, Stack } from '@motifx-community/ui';\r
\r
/** Three destinations bound to a value, with a count on one of them. */\r
export default function Basic() {\r
    const s = reactive({ page: 'home', unread: 3 });\r
    return (\r
        <Stack gap="md" style="inline-size: 100%; max-inline-size: 420px">\r
            <BottomNavigation\r
                class="bn-basic"\r
                position="static"\r
                x-model={() => s.page}\r
                items={[\r
                    { value: 'home', text: 'Home', glyph: 'star', activeGlyph: 'star-filled' },\r
                    { value: 'inbox', text: 'Inbox', glyph: 'file', badge: () => s.unread },\r
                    { value: 'calendar', text: 'Calendar', glyph: 'calendar' },\r
                    { value: 'profile', text: 'Profile', glyph: 'person', dot: true }\r
                ]}\r
            />\r
            <output class="bn-told">{() => \`Page: \${s.page}\`}</output>\r
        </Stack>\r
    );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { BottomNavigation, Stack, Switch } from '@motifx-community/ui';\r
\r
/** \`onSelecting\` keeps the page while there are unsaved changes. */\r
export default function Guarded() {\r
    const s = reactive({ page: 'edit', dirty: true, told: '' });\r
    return (\r
        <Stack gap="md" style="inline-size: 100%; max-inline-size: 420px">\r
            <Switch label="Unsaved changes" x-model={() => s.dirty} />\r
            <BottomNavigation\r
                class="bn-guarded"\r
                label="Document"\r
                position="static"\r
                x-model={() => s.page}\r
                onSelecting={e => {\r
                    e.cancel = s.dirty;\r
                    s.told = s.dirty ? 'Save your changes first.' : '';\r
                }}\r
                items={[\r
                    { value: 'edit', text: 'Edit', glyph: 'pencil' },\r
                    { value: 'files', text: 'Files', glyph: 'file' },\r
                    { value: 'share', text: 'Share', glyph: 'upload' }\r
                ]}\r
            />\r
            <output class="bn-guard-told">{() => s.told}</output>\r
        </Stack>\r
    );\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { BottomNavigation, ButtonGroup, Stack } from '@motifx-community/ui';\r
\r
const ITEMS = [\r
    { value: 'home', text: 'Home', glyph: 'star' },\r
    { value: 'search', text: 'Search', glyph: 'search' },\r
    { value: 'alarms', text: 'Alarms', glyph: 'clock' },\r
    { value: 'locked', text: 'Locked', glyph: 'lock', enabled: false }\r
];\r
\r
/** \`labelMode\`: a label out of view stays as the accessible name of the item. */\r
export default function Labels() {\r
    const s = reactive({ mode: 'active' as 'always' | 'active' | 'never', page: 'home' });\r
    return (\r
        <Stack gap="md" style="inline-size: 100%; max-inline-size: 420px">\r
            <ButtonGroup\r
                label="Label mode"\r
                x-model={() => s.mode}\r
                items={[\r
                    { value: 'always', text: 'Always' },\r
                    { value: 'active', text: 'Active' },\r
                    { value: 'never', text: 'Never' }\r
                ]}\r
            />\r
            <BottomNavigation class="bn-labels" label="Sections" position="static" labelMode={() => s.mode} x-model={() => s.page} items={ITEMS} />\r
        </Stack>\r
    );\r
}\r
`,y=`import { Component } from '@motifx/core';\r
import { BottomNavigation, Button, Stack } from '@motifx-community/ui';\r
\r
/** A bar created programmatically. Each prop is also a property that can be set later. */\r
export default class Programmatic extends Component<HTMLDivElement> {\r
    constructor() {\r
        super('div');\r
        const bar = new BottomNavigation({\r
            label: 'Search pages',\r
            position: 'static',\r
            value: 'home',\r
            items: [\r
                { value: 'home', text: 'Home', glyph: 'star' },\r
                { value: 'search', text: 'Search', glyph: 'search' }\r
            ]\r
        });\r
        const go = new Button({ text: 'Go to Search', variant: 'outline', onclick: () => (bar.value = 'search') });\r
        const stack = new Stack({ gap: 'md' });\r
        stack.controls.add(bar, go);\r
        this.controls.add(stack);\r
    }\r
}\r
`,b=`import { reactive } from '@motifx/core';\r
import { AppBar, BottomNavigation } from '@motifx-community/ui';\r
\r
const ROWS = Array.from({ length: 30 }, (_, i) => \`Message \${i + 1}\`);\r
\r
/** A phone screen: the two bars around a box that scrolls. Scrolling down moves the bottom bar away. */\r
export default function Screen() {\r
    const s = reactive({ page: 'mail' });\r
    return (\r
        <div class="bn-screen" tabindex="0" style="position: relative; inline-size: min(100%, 390px); block-size: 420px; overflow: auto; border: 1px solid var(--mx-color-stroke-divider)">\r
            <AppBar title="Messages" navigation="menu" />\r
            {ROWS.map(row => (\r
                <p key={row} style="margin: 0; padding: 12px 16px">\r
                    {row}\r
                </p>\r
            ))}\r
            <BottomNavigation\r
                class="bn-scroll"\r
                label="Screens"\r
                position="sticky"\r
                hideOnScroll\r
                x-model={() => s.page}\r
                items={[\r
                    { value: 'mail', text: 'Messages', glyph: 'file' },\r
                    { value: 'calendar', text: 'Calendar', glyph: 'calendar' },\r
                    { value: 'profile', text: 'Profile', glyph: 'person' }\r
                ]}\r
            />\r
        </div>\r
    );\r
}\r
`;function x(){let e=r({page:`home`,unread:3});return n(l,{gap:`md`,style:`inline-size: 100%; max-inline-size: 420px`,runover:{},childs:[n(c,{class:`bn-basic`,position:`static`,items:[{value:`home`,text:`Home`,glyph:`star`,activeGlyph:`star-filled`},{value:`inbox`,text:`Inbox`,glyph:`file`,badge:()=>e.unread},{value:`calendar`,text:`Calendar`,glyph:`calendar`},{value:`profile`,text:`Profile`,glyph:`person`,dot:!0}],runover:{initializeComponent:t=>{t.bindings.model(()=>e.page,t=>{let n=e;n!=null&&typeof n.page!=`function`&&(n.page=t)})}},childs:[]}),n(`output`,{initializeComponent:t=>{t.class.add(`bn-told`),t.bindings.method(()=>`Page: ${e.page}`)}},1)]})}function S(){let e=r({page:`edit`,dirty:!0,told:``});return n(l,{gap:`md`,style:`inline-size: 100%; max-inline-size: 420px`,runover:{},childs:[n(a,{label:`Unsaved changes`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.dirty,t=>{let n=e;n!=null&&typeof n.dirty!=`function`&&(n.dirty=t)})}},childs:[]}),n(c,{class:`bn-guarded`,label:`Document`,position:`static`,onSelecting:t=>{t.cancel=e.dirty,e.told=e.dirty?`Save your changes first.`:``},items:[{value:`edit`,text:`Edit`,glyph:`pencil`},{value:`files`,text:`Files`,glyph:`file`},{value:`share`,text:`Share`,glyph:`upload`}],runover:{initializeComponent:t=>{t.bindings.model(()=>e.page,t=>{let n=e;n!=null&&typeof n.page!=`function`&&(n.page=t)})}},childs:[]}),n(`output`,{initializeComponent:t=>{t.class.add(`bn-guard-told`),t.bindings.method(()=>e.told)}},1)]})}var C=[{value:`home`,text:`Home`,glyph:`star`},{value:`search`,text:`Search`,glyph:`search`},{value:`alarms`,text:`Alarms`,glyph:`clock`},{value:`locked`,text:`Locked`,glyph:`lock`,enabled:!1}];function w(){let e=r({mode:`active`,page:`home`});return n(l,{gap:`md`,style:`inline-size: 100%; max-inline-size: 420px`,runover:{},childs:[n(o,{label:`Label mode`,items:[{value:`always`,text:`Always`},{value:`active`,text:`Active`},{value:`never`,text:`Never`}],runover:{initializeComponent:t=>{t.bindings.model(()=>e.mode,t=>{let n=e;n!=null&&typeof n.mode!=`function`&&(n.mode=t)})}},childs:[]}),n(c,{class:`bn-labels`,label:`Sections`,position:`static`,labelMode:()=>e.mode,items:C,runover:{initializeComponent:t=>{t.bindings.model(()=>e.page,t=>{let n=e;n!=null&&typeof n.page!=`function`&&(n.page=t)})}},childs:[]})]})}var T=class extends t{constructor(){super(`div`);let e=new c({label:`Search pages`,position:`static`,value:`home`,items:[{value:`home`,text:`Home`,glyph:`star`},{value:`search`,text:`Search`,glyph:`search`}]}),t=new i({text:`Go to Search`,variant:`outline`,onclick:()=>e.value=`search`}),n=new l({gap:`md`});n.controls.add(e,t),this.controls.add(n)}};T.elementTag=`div`;var E=Array.from({length:30},(e,t)=>`Message ${t+1}`);function D(){let e=r({page:`mail`});return n(`div`,{initializeComponent:t=>{t.style(`position: relative; inline-size: min(100%, 390px); block-size: 420px; overflow: auto; border: 1px solid var(--mx-color-stroke-divider)`),t.attr.add({tabindex:`0`}),t.class.add(`bn-screen`);let r=n(s,{title:`Messages`,navigation:`menu`,runover:{},childs:[]});t.controls.add(r);let i=n({initializeComponent:e=>{e.bindings.list(()=>E??[],e=>n(`p`,{indexkey:()=>e,initializeComponent:t=>{t.style(`margin: 0; padding: 12px 16px`);let r=n(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,()=>{if(e!=null)return typeof e==`function`?e():()=>e})},__childExpr:()=>e});t.controls.add(r)}}))}});t.controls.add(i);let a=n(c,{class:`bn-scroll`,label:`Screens`,position:`sticky`,hideOnScroll:!0,items:[{value:`mail`,text:`Messages`,glyph:`file`},{value:`calendar`,text:`Calendar`,glyph:`calendar`},{value:`profile`,text:`Profile`,glyph:`person`}],runover:{initializeComponent:t=>{t.bindings.model(()=>e.page,t=>{let n=e;n!=null&&typeof n.page!=`function`&&(n.page=t)})}},childs:[]});t.controls.add(a)}},1)}var O=h(Object.assign({"./examples/Basic.tsx":g,"./examples/Guarded.tsx":_,"./examples/Labels.tsx":v,"./examples/Programmatic.tsx":y,"./examples/Screen.tsx":b})),k=[[`items`,"`Bind<readonly BottomNavigationItem[]>`","`[]`","The destinations. The bar is designed for three to five; use a `Drawer` for more."],[`value`,"`Bind<string | number | null>`","`null`","The `value` of the selected item. `x-model` provides two-way binding."],[`label`,"`Bind<string>`",`The kit string “Navigation”`,`The accessible name of the bar.`],[`labelMode`,"`Bind<'always' | 'active' | 'never'>`","`'always'`",`When items show their labels. A label out of view stays as the accessible name of the item.`],[`position`,"`Bind<'fixed' | 'sticky' | 'static'>`","`'fixed'`",`How the bar stays on the page.`],[`hideOnScroll`,"`Bind<boolean>`","`false`",`Moves the bar away while scrolling down, and brings it back while scrolling up.`],[`scrollTarget`,"`Bind<ComponentBase | null>`",`The nearest ancestor that scrolls`,"What `hideOnScroll` watches. Without a scrolling ancestor, it is the page."]],A=[[`value`,"`string | number`",`Its position`,"What `value` is when this item is selected."],[`text`,"`Bind<string>`",`—`,`The label, which is also the accessible name.`],[`glyph, activeGlyph`,"`Bind<string>`","`''`",`The glyph, and the glyph while selected.`],[`icon, activeIcon`,"`Bind<IconSource | null>`","`null`",`An image address or a component, used instead of a glyph.`],[`href, rel, target`,"`Bind<string>`","`''`","Make the item a link. Use `rel: 'router'` for routed pages."],[`badge`,"`Bind<number | null>`","`null`",`A count in a badge on the icon.`],[`dot`,"`Bind<boolean>`","`false`",`A dot on the icon instead of a count.`],[`enabled, visible`,"`Bind<boolean>`","`true`",`A disabled item is dimmed and cannot be selected. A hidden item is removed.`],[`click`,"`(e) => void`",`—`,`Occurs when the item is pressed.`],[`data`,"`unknown`",`—`,`A custom application value for the item.`]],j=[[`selectedItem`,"`BottomNavigationItem | null`",`The selected item.`],[`focus()`,"`boolean`",`Moves focus to the item Tab reaches.`]],M=[[`onSelecting`,"`{ value, previous, item, previousItem, originalEvent, source, cancel }`","Occurs before the selection changes. Setting `cancel` keeps the current item, and a link is not followed."],[`onSelectionChanged`,"`{ value, previous, item, previousItem, originalEvent, source }`",`Occurs after the selection changes.`],[`onItemClick`,"`{ item, value, originalEvent, source }`","Occurs when an item is pressed, after its own `click`."]],N=[[`Tab`,`Moves focus into the bar, to the selected item, and out of it.`],[`Left, Right`,`Moves between the items, wrapping around at the ends. The direction follows the page.`],[`Home, End`,`Moves to the first or the last item.`],[`Enter, Space`,`Selects the focused item.`]],P=[[`Landmark`,"The bar is a `<nav>` with an accessible name."],[`Selected item`,'`aria-current="page"` marks it for screen readers.'],[`Disabled item`,'`aria-disabled="true"`; the arrow keys pass over it.'],[`Focus`,"A bar moved away by `hideOnScroll` comes back when focus enters it."]],F=[[`.mx-bottom-navigation`,"The bar. `data-label-mode`, `data-position` and `data-hidden` describe its state."],[`.mx-bottom-navigation__list, .mx-bottom-navigation__item`,"The row and an item. `data-selected` and `aria-disabled` describe an item."],[`.mx-bottom-navigation__indicator, .mx-bottom-navigation__icon-host, .mx-bottom-navigation__glyph, .mx-bottom-navigation__icon, .mx-bottom-navigation__label, .mx-bottom-navigation__badge`,`The mark of the selected item, the box of the icon, its glyph or icon, the label and the badge.`]],I=[[`bottom-navigation.bar, .list, .item, .indicator, .icon-host, .label`,"Units: the bar, the row, an item (`hover`, `pressed`, `focus`, `selected`, `disabled`), the mark (`selected`), the box of the icon and the label (`selected`)."]];function L(){return e({initializeComponent:e=>{{let t=n(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=n(p,{text:`The destinations of an application at the bottom of the screen, each an icon with a label. The bar is one Tab stop, marks the selected item for screen readers and keeps clear of the home indicator of a phone.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let r=n(d,{anchor:`import`,title:`Import`,runover:{},childs:[n(u,{code:`
import { BottomNavigation } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=n(d,{anchor:`basic`,title:`Destinations`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(p,{text:"`items` defines the destinations, and `x-model` binds the selected one. `badge` shows a count on the icon, `dot` shows a dot, and `activeGlyph` changes the glyph while the item is selected.",runover:{},childs:[]});e.controls.add(t)}},1),n(f,{stack:!0,files:O(`Basic.tsx`),runover:{},childs:[n(x,{runover:{},childs:[]})]})]});e.controls.add(i);let a=n(d,{anchor:`labels`,title:`Labels`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(p,{text:"`labelMode` shows the labels always, only on the selected item, or never. A label out of view stays as the accessible name of the item.",runover:{},childs:[]});e.controls.add(t)}},1),n(f,{stack:!0,files:O(`Labels.tsx`),runover:{},childs:[n(w,{runover:{},childs:[]})]})]});e.controls.add(a);let o=n(d,{anchor:`selecting`,title:`Refusing a change`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(p,{text:"`onSelecting` occurs before the selection changes, and setting `cancel` keeps the current item.",runover:{},childs:[]});e.controls.add(t)}},1),n(f,{stack:!0,files:O(`Guarded.tsx`),runover:{},childs:[n(S,{runover:{},childs:[]})]})]});e.controls.add(o);let s=n(d,{anchor:`screen`,title:`In a screen`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(p,{text:"By default, the bar is fixed to the bottom of the viewport. In a box that scrolls, use `position='sticky'`. `hideOnScroll` moves it away while scrolling down.",runover:{},childs:[]});e.controls.add(t)}},1),n(f,{stack:!0,files:O(`Screen.tsx`),runover:{},childs:[n(D,{runover:{},childs:[]})]})]});e.controls.add(s);let c=n(d,{anchor:`programmatic`,title:`Programmatic use`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(p,{text:"`new BottomNavigation(props)` creates the bar without JSX. Each prop is also a property.",runover:{},childs:[]});e.controls.add(t)}},1),n(f,{stack:!0,files:O(`Programmatic.tsx`),runover:{},childs:[n(T,{runover:{},childs:[]})]})]});e.controls.add(c);let l=n(d,{anchor:`api`,title:`API reference`,runover:{},childs:[n(`h3`,{initializeComponent:e=>{let t=n(p,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),n(m,{head:[`Prop`,`Type`,`Default`,`Description`],rows:k,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(p,{text:`Item fields`,runover:{},childs:[]});e.controls.add(t)}},1),n(m,{head:[`Prop`,`Type`,`Default`,`Description`],rows:A,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(p,{text:`Properties and methods`,runover:{},childs:[]});e.controls.add(t)}},1),n(m,{head:[`Member`,`Type`,`Description`],rows:j,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(p,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),n(m,{head:[`Event`,`Type`,`Description`],rows:M,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(p,{text:`Keyboard`,runover:{},childs:[]});e.controls.add(t)}},1),n(m,{head:[`Key`,`Description`],rows:N,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(p,{text:`Accessibility`,runover:{},childs:[]});e.controls.add(t)}},1),n(m,{head:[`Topic`,`Details`],rows:P,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(p,{text:`Styling hooks`,runover:{},childs:[]});e.controls.add(t)}},1),n(m,{head:[`Hook`,`Description`],rows:F,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(p,{text:`Design tokens`,runover:{},childs:[]});e.controls.add(t)}},1),n(m,{head:[`Token`,`Description`],rows:I,runover:{},childs:[]})]});e.controls.add(l)}}})}export{L as default};