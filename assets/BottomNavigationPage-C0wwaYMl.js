import{$n as e,Qn as t,Wn as n,n as r,tr as i}from"./next-id-IxLtiCRk.js";import{t as a}from"./Switch-sEMiCfKG.js";import{t as o}from"./ButtonGroup-ou16VbS4.js";import{t as s}from"./AppBar-FsdU4jrQ.js";import{t as c}from"./BottomNavigation-D9eyj5E-.js";import{t as l}from"./Stack-DTHjt5Ku.js";import{a as u,i as d,n as f,r as p,t as m}from"./docs-DpibOHDk.js";import{t as h}from"./sources-BXVvOiIY.js";var g=`import { reactive } from '@motifx/core';\r
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
`;function x(){let e=i({page:`home`,unread:3});return t(l,{gap:`md`,style:`inline-size: 100%; max-inline-size: 420px`,runover:{},childs:[t(c,{class:`bn-basic`,position:`static`,items:[{value:`home`,text:`Home`,glyph:`star`,activeGlyph:`star-filled`},{value:`inbox`,text:`Inbox`,glyph:`file`,badge:()=>e.unread},{value:`calendar`,text:`Calendar`,glyph:`calendar`},{value:`profile`,text:`Profile`,glyph:`person`,dot:!0}],runover:{initializeComponent:t=>{t.bindings.model(()=>e.page,t=>{let n=e;n!=null&&typeof n.page!=`function`&&(n.page=t)})}},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`bn-told`),t.bindings.method(()=>`Page: ${e.page}`)}},1)]})}function S(){let e=i({page:`edit`,dirty:!0,told:``});return t(l,{gap:`md`,style:`inline-size: 100%; max-inline-size: 420px`,runover:{},childs:[t(a,{label:`Unsaved changes`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.dirty,t=>{let n=e;n!=null&&typeof n.dirty!=`function`&&(n.dirty=t)})}},childs:[]}),t(c,{class:`bn-guarded`,label:`Document`,position:`static`,onSelecting:t=>{t.cancel=e.dirty,e.told=e.dirty?`Save your changes first.`:``},items:[{value:`edit`,text:`Edit`,glyph:`pencil`},{value:`files`,text:`Files`,glyph:`file`},{value:`share`,text:`Share`,glyph:`upload`}],runover:{initializeComponent:t=>{t.bindings.model(()=>e.page,t=>{let n=e;n!=null&&typeof n.page!=`function`&&(n.page=t)})}},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`bn-guard-told`),t.bindings.method(()=>e.told)}},1)]})}var C=[{value:`home`,text:`Home`,glyph:`star`},{value:`search`,text:`Search`,glyph:`search`},{value:`alarms`,text:`Alarms`,glyph:`clock`},{value:`locked`,text:`Locked`,glyph:`lock`,enabled:!1}];function w(){let e=i({mode:`active`,page:`home`});return t(l,{gap:`md`,style:`inline-size: 100%; max-inline-size: 420px`,runover:{},childs:[t(o,{label:`Label mode`,items:[{value:`always`,text:`Always`},{value:`active`,text:`Active`},{value:`never`,text:`Never`}],runover:{initializeComponent:t=>{t.bindings.model(()=>e.mode,t=>{let n=e;n!=null&&typeof n.mode!=`function`&&(n.mode=t)})}},childs:[]}),t(c,{class:`bn-labels`,label:`Sections`,position:`static`,labelMode:()=>e.mode,items:C,runover:{initializeComponent:t=>{t.bindings.model(()=>e.page,t=>{let n=e;n!=null&&typeof n.page!=`function`&&(n.page=t)})}},childs:[]})]})}var T=class extends n{constructor(){super(`div`);let e=new c({label:`Search pages`,position:`static`,value:`home`,items:[{value:`home`,text:`Home`,glyph:`star`},{value:`search`,text:`Search`,glyph:`search`}]}),t=new r({text:`Go to Search`,variant:`outline`,onclick:()=>e.value=`search`}),n=new l({gap:`md`});n.controls.add(e,t),this.controls.add(n)}};T.elementTag=`div`;var E=Array.from({length:30},(e,t)=>`Message ${t+1}`);function D(){let e=i({page:`mail`});return t(`div`,{initializeComponent:n=>{n.style(`position: relative; inline-size: min(100%, 390px); block-size: 420px; overflow: auto; border: 1px solid var(--mx-color-stroke-divider)`),n.attr.add({tabindex:`0`}),n.class.add(`bn-screen`);let r=t(s,{title:`Messages`,navigation:`menu`,runover:{},childs:[]});n.controls.add(r);let i=t({initializeComponent:e=>{e.bindings.list(()=>E??[],e=>t(`p`,{indexkey:()=>e,initializeComponent:n=>{n.style(`margin: 0; padding: 12px 16px`);let r=t(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,()=>{if(e!=null)return typeof e==`function`?e():()=>e})},__childExpr:()=>e});n.controls.add(r)}}))}});n.controls.add(i);let a=t(c,{class:`bn-scroll`,label:`Screens`,position:`sticky`,hideOnScroll:!0,items:[{value:`mail`,text:`Messages`,glyph:`file`},{value:`calendar`,text:`Calendar`,glyph:`calendar`},{value:`profile`,text:`Profile`,glyph:`person`}],runover:{initializeComponent:t=>{t.bindings.model(()=>e.page,t=>{let n=e;n!=null&&typeof n.page!=`function`&&(n.page=t)})}},childs:[]});n.controls.add(a)}},1)}var O=h(Object.assign({"./examples/Basic.tsx":g,"./examples/Guarded.tsx":_,"./examples/Labels.tsx":v,"./examples/Programmatic.tsx":y,"./examples/Screen.tsx":b})),k=[[`items`,"`Bind<readonly BottomNavigationItem[]>`","`[]`","The destinations. The bar is designed for three to five; use a `Drawer` for more."],[`value`,"`Bind<string | number | null>`","`null`","The `value` of the selected item. `x-model` provides two-way binding."],[`label`,"`Bind<string>`",`The kit string “Navigation”`,`The accessible name of the bar.`],[`labelMode`,"`Bind<'always' | 'active' | 'never'>`","`'always'`",`When items show their labels. A label out of view stays as the accessible name of the item.`],[`position`,"`Bind<'fixed' | 'sticky' | 'static'>`","`'fixed'`",`How the bar stays on the page.`],[`hideOnScroll`,"`Bind<boolean>`","`false`",`Moves the bar away while scrolling down, and brings it back while scrolling up.`],[`scrollTarget`,"`Bind<ComponentBase | null>`",`The nearest ancestor that scrolls`,"What `hideOnScroll` watches. Without a scrolling ancestor, it is the page."]],A=[[`value`,"`string | number`",`Its position`,"What `value` is when this item is selected."],[`text`,"`Bind<string>`",`—`,`The label, which is also the accessible name.`],[`glyph, activeGlyph`,"`Bind<string>`","`''`",`The glyph, and the glyph while selected.`],[`icon, activeIcon`,"`Bind<IconSource | null>`","`null`",`An image address or a component, used instead of a glyph.`],[`href, rel, target`,"`Bind<string>`","`''`","Make the item a link. Use `rel: 'router'` for routed pages."],[`badge`,"`Bind<number | null>`","`null`",`A count in a badge on the icon.`],[`dot`,"`Bind<boolean>`","`false`",`A dot on the icon instead of a count.`],[`enabled, visible`,"`Bind<boolean>`","`true`",`A disabled item is dimmed and cannot be selected. A hidden item is removed.`],[`click`,"`(e) => void`",`—`,`Occurs when the item is pressed.`],[`data`,"`unknown`",`—`,`A custom application value for the item.`]],j=[[`selectedItem`,"`BottomNavigationItem | null`",`The selected item.`],[`focus()`,"`boolean`",`Moves focus to the item Tab reaches.`]],M=[[`onSelecting`,"`{ value, previous, item, previousItem, originalEvent, source, cancel }`","Occurs before the selection changes. Setting `cancel` keeps the current item, and a link is not followed."],[`onSelectionChanged`,"`{ value, previous, item, previousItem, originalEvent, source }`",`Occurs after the selection changes.`],[`onItemClick`,"`{ item, value, originalEvent, source }`","Occurs when an item is pressed, after its own `click`."]],N=[[`Tab`,`Moves focus into the bar, to the selected item, and out of it.`],[`Left, Right`,`Moves between the items, wrapping around at the ends. The direction follows the page.`],[`Home, End`,`Moves to the first or the last item.`],[`Enter, Space`,`Selects the focused item.`]],P=[[`Landmark`,"The bar is a `<nav>` with an accessible name."],[`Selected item`,'`aria-current="page"` marks it for screen readers.'],[`Disabled item`,'`aria-disabled="true"`; the arrow keys pass over it.'],[`Focus`,"A bar moved away by `hideOnScroll` comes back when focus enters it."]],F=[[`.mx-bottom-navigation`,"The bar. `data-label-mode`, `data-position` and `data-hidden` describe its state."],[`.mx-bottom-navigation__list, .mx-bottom-navigation__item`,"The row and an item. `data-selected` and `aria-disabled` describe an item."],[`.mx-bottom-navigation__indicator, .mx-bottom-navigation__icon-host, .mx-bottom-navigation__glyph, .mx-bottom-navigation__icon, .mx-bottom-navigation__label, .mx-bottom-navigation__badge`,`The mark of the selected item, the box of the icon, its glyph or icon, the label and the badge.`]],I=[[`bottom-navigation.bar, .list, .item, .indicator, .icon-host, .label`,"Units: the bar, the row, an item (`hover`, `pressed`, `focus`, `selected`, `disabled`), the mark (`selected`), the box of the icon and the label (`selected`)."]];function L(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(p,{text:`The destinations of an application at the bottom of the screen, each an icon with a label. The bar is one Tab stop, marks the selected item for screen readers and keeps clear of the home indicator of a phone.`,runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(d,{anchor:`import`,title:`Import`,runover:{},childs:[t(u,{code:`
import { BottomNavigation } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(d,{anchor:`basic`,title:`Destinations`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(p,{text:"`items` defines the destinations, and `x-model` binds the selected one. `badge` shows a count on the icon, `dot` shows a dot, and `activeGlyph` changes the glyph while the item is selected.",runover:{},childs:[]});e.controls.add(n)}},1),t(f,{stack:!0,files:O(`Basic.tsx`),runover:{},childs:[t(x,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(d,{anchor:`labels`,title:`Labels`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(p,{text:"`labelMode` shows the labels always, only on the selected item, or never. A label out of view stays as the accessible name of the item.",runover:{},childs:[]});e.controls.add(n)}},1),t(f,{stack:!0,files:O(`Labels.tsx`),runover:{},childs:[t(w,{runover:{},childs:[]})]})]});e.controls.add(a);let o=t(d,{anchor:`selecting`,title:`Refusing a change`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(p,{text:"`onSelecting` occurs before the selection changes, and setting `cancel` keeps the current item.",runover:{},childs:[]});e.controls.add(n)}},1),t(f,{stack:!0,files:O(`Guarded.tsx`),runover:{},childs:[t(S,{runover:{},childs:[]})]})]});e.controls.add(o);let s=t(d,{anchor:`screen`,title:`In a screen`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(p,{text:"By default, the bar is fixed to the bottom of the viewport. In a box that scrolls, use `position='sticky'`. `hideOnScroll` moves it away while scrolling down.",runover:{},childs:[]});e.controls.add(n)}},1),t(f,{stack:!0,files:O(`Screen.tsx`),runover:{},childs:[t(D,{runover:{},childs:[]})]})]});e.controls.add(s);let c=t(d,{anchor:`programmatic`,title:`Programmatic use`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(p,{text:"`new BottomNavigation(props)` creates the bar without JSX. Each prop is also a property.",runover:{},childs:[]});e.controls.add(n)}},1),t(f,{stack:!0,files:O(`Programmatic.tsx`),runover:{},childs:[t(T,{runover:{},childs:[]})]})]});e.controls.add(c);let l=t(d,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(p,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(m,{head:[`Prop`,`Type`,`Default`,`Description`],rows:k,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(p,{text:`Item fields`,runover:{},childs:[]});e.controls.add(n)}},1),t(m,{head:[`Prop`,`Type`,`Default`,`Description`],rows:A,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(p,{text:`Properties and methods`,runover:{},childs:[]});e.controls.add(n)}},1),t(m,{head:[`Member`,`Type`,`Description`],rows:j,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(p,{text:`Events`,runover:{},childs:[]});e.controls.add(n)}},1),t(m,{head:[`Event`,`Type`,`Description`],rows:M,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(p,{text:`Keyboard`,runover:{},childs:[]});e.controls.add(n)}},1),t(m,{head:[`Key`,`Description`],rows:N,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(p,{text:`Accessibility`,runover:{},childs:[]});e.controls.add(n)}},1),t(m,{head:[`Topic`,`Details`],rows:P,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(p,{text:`Styling hooks`,runover:{},childs:[]});e.controls.add(n)}},1),t(m,{head:[`Hook`,`Description`],rows:F,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(p,{text:`Design tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(m,{head:[`Token`,`Description`],rows:I,runover:{},childs:[]})]});e.controls.add(l)}}})}export{L as default};