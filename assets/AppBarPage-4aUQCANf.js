import{$n as e,Qn as t,Wn as n,n as r,tr as i}from"./next-id-IxLtiCRk.js";import{t as a}from"./TextBox-BCxx9tPF.js";import{t as o}from"./ButtonGroup-ou16VbS4.js";import{t as s}from"./AppBar-FsdU4jrQ.js";import{t as c}from"./Stack-DTHjt5Ku.js";import{a as l,i as u,n as d,r as f,t as p}from"./docs-DpibOHDk.js";import{t as m}from"./sources-BXVvOiIY.js";var h=`import { reactive } from '@motifx/core';\r
import { AppBar, Stack } from '@motifx-community/ui';\r
\r
const icon = (name: string) => () => <span class="mx-glyph" data-icon={name} />;\r
\r
/** A title, a menu button and commands. Commands that do not fit move into the "more" menu. */\r
export default function Basic() {\r
    const s = reactive({ told: 'nothing yet' });\r
    const actions = [\r
        { icon: icon('search'), hint: 'Search', click: () => (s.told = 'search') },\r
        { icon: icon('download'), hint: 'Download', click: () => (s.told = 'download') },\r
        { icon: icon('trash'), hint: 'Delete', click: () => (s.told = 'delete') }\r
    ];\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <AppBar class="ab-basic" position="static" title="Orders" subtitle="This week" navigation="menu" actions={actions} onNavigationClick={() => (s.told = 'the menu')} />\r
            <output class="ab-told">{() => \`Pressed: \${s.told}\`}</output>\r
        </Stack>\r
    );\r
}\r
`,g=`import { AppBar, Stack } from '@motifx-community/ui';\r
\r
const icon = (name: string) => () => <span class="mx-glyph" data-icon={name} />;\r
\r
/** A centered title, the accent tone, and a prominent title on a row of its own. */\r
export default function Looks() {\r
    const actions = [{ icon: icon('search'), hint: 'Search' }];\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <AppBar class="ab-center" position="static" title="Invoice" navigation="back" titleAlign="center" actions={actions} />\r
            <AppBar class="ab-accent" position="static" title="Inbox" tone="accent" navigation="menu" actions={actions} />\r
            <AppBar class="ab-prominent" position="static" title="Reports" prominent navigation="back" actions={actions} />\r
        </Stack>\r
    );\r
}\r
`,_=`import { Component } from '@motifx/core';\r
import { AppBar, Button, Stack } from '@motifx-community/ui';\r
\r
/** A bar created programmatically. Each prop is also a property that can be set later. */\r
export default class Programmatic extends Component<HTMLDivElement> {\r
    constructor() {\r
        super('div');\r
        const bar = new AppBar({ title: 'Draft', position: 'static', navigation: 'back' });\r
        const rename = new Button({ text: 'Rename', variant: 'outline', onclick: () => (bar.title = 'Final') });\r
        const stack = new Stack({ gap: 'md' });\r
        stack.controls.add(bar, rename);\r
        this.controls.add(stack);\r
    }\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { AppBar, ButtonGroup, Stack } from '@motifx-community/ui';\r
\r
const ROWS = Array.from({ length: 30 }, (_, i) => \`Order \${i + 1}\`);\r
\r
/** The bar sticks to the top of the box that scrolls. \`lift\` raises it over the content, \`hide\` moves it away. */\r
export default function Scrolling() {\r
    const s = reactive({ behavior: 'lift' as 'none' | 'lift' | 'hide' });\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <ButtonGroup\r
                label="Scroll behavior"\r
                x-model={() => s.behavior}\r
                items={[\r
                    { value: 'none', text: 'None' },\r
                    { value: 'lift', text: 'Lift' },\r
                    { value: 'hide', text: 'Hide' }\r
                ]}\r
            />\r
            <div class="ab-scroll" tabindex="0" style="block-size: 260px; overflow: auto; border: 1px solid var(--mx-color-stroke-divider)">\r
                <AppBar class="ab-scrolling" title="Orders" navigation="menu" scrollBehavior={() => s.behavior} />\r
                {ROWS.map(row => (\r
                    <p key={row} style="margin: 0; padding: 12px 16px">\r
                        {row}\r
                    </p>\r
                ))}\r
            </div>\r
        </Stack>\r
    );\r
}\r
`,y=`import { AppBar, TextBox } from '@motifx-community/ui';\r
\r
/** A control between the title and the commands, written as a JSX child. */\r
export default function WithContent() {\r
    return (\r
        <AppBar class="ab-content" position="static" title="Customers" style="inline-size: 100%">\r
            <TextBox label="Search" labelMode="hidden" placeholder="Search customers" />\r
        </AppBar>\r
    );\r
}\r
`,b=e=>()=>t(`span`,{initializeComponent:t=>{t.attr.add({"data-icon":e}),t.class.add(`mx-glyph`)}},1);function x(){let e=i({told:`nothing yet`}),n=[{icon:b(`search`),hint:`Search`,click:()=>e.told=`search`},{icon:b(`download`),hint:`Download`,click:()=>e.told=`download`},{icon:b(`trash`),hint:`Delete`,click:()=>e.told=`delete`}];return t(c,{gap:`md`,style:`inline-size: 100%`,runover:{},childs:[t(s,{class:`ab-basic`,position:`static`,title:`Orders`,subtitle:`This week`,navigation:`menu`,actions:n,onNavigationClick:()=>e.told=`the menu`,runover:{},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`ab-told`),t.bindings.method(()=>`Pressed: ${e.told}`)}},1)]})}var S=e=>()=>t(`span`,{initializeComponent:t=>{t.attr.add({"data-icon":e}),t.class.add(`mx-glyph`)}},1);function C(){let e=[{icon:S(`search`),hint:`Search`}];return t(c,{gap:`md`,style:`inline-size: 100%`,runover:{},childs:[t(s,{class:`ab-center`,position:`static`,title:`Invoice`,navigation:`back`,titleAlign:`center`,actions:e,runover:{},childs:[]}),t(s,{class:`ab-accent`,position:`static`,title:`Inbox`,tone:`accent`,navigation:`menu`,actions:e,runover:{},childs:[]}),t(s,{class:`ab-prominent`,position:`static`,title:`Reports`,prominent:!0,navigation:`back`,actions:e,runover:{},childs:[]})]})}var w=class extends n{constructor(){super(`div`);let e=new s({title:`Draft`,position:`static`,navigation:`back`}),t=new r({text:`Rename`,variant:`outline`,onclick:()=>e.title=`Final`}),n=new c({gap:`md`});n.controls.add(e,t),this.controls.add(n)}};w.elementTag=`div`;var T=Array.from({length:30},(e,t)=>`Order ${t+1}`);function E(){let e=i({behavior:`lift`});return t(c,{gap:`md`,style:`inline-size: 100%`,runover:{},childs:[t(o,{label:`Scroll behavior`,items:[{value:`none`,text:`None`},{value:`lift`,text:`Lift`},{value:`hide`,text:`Hide`}],runover:{initializeComponent:t=>{t.bindings.model(()=>e.behavior,t=>{let n=e;n!=null&&typeof n.behavior!=`function`&&(n.behavior=t)})}},childs:[]}),t(`div`,{initializeComponent:n=>{n.style(`block-size: 260px; overflow: auto; border: 1px solid var(--mx-color-stroke-divider)`),n.attr.add({tabindex:`0`}),n.class.add(`ab-scroll`);let r=t(s,{class:`ab-scrolling`,title:`Orders`,navigation:`menu`,scrollBehavior:()=>e.behavior,runover:{},childs:[]});n.controls.add(r);let i=t({initializeComponent:e=>{e.bindings.list(()=>T??[],e=>t(`p`,{indexkey:()=>e,initializeComponent:n=>{n.style(`margin: 0; padding: 12px 16px`);let r=t(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,()=>{if(e!=null)return typeof e==`function`?e():()=>e})},__childExpr:()=>e});n.controls.add(r)}}))}});n.controls.add(i)}},1)]})}function D(){return t(s,{class:`ab-content`,position:`static`,title:`Customers`,style:`inline-size: 100%`,runover:{},childs:[t(a,{label:`Search`,labelMode:`hidden`,placeholder:`Search customers`,runover:{},childs:[]})]})}var O=m(Object.assign({"./examples/Basic.tsx":h,"./examples/Looks.tsx":g,"./examples/Programmatic.tsx":_,"./examples/Scrolling.tsx":v,"./examples/WithContent.tsx":y})),k=[[`title, subtitle`,"`Bind<string>`","`''`",`The title, and a smaller line under it.`],[`titleAlign`,"`Bind<'start' | 'center'>`","`'start'`",`A centered title stays in the middle of the bar whatever lies beside it.`],[`headingLevel`,"`Bind<number | null>`","`null`",`Makes the title a heading of this level.`],[`logo`,"`Bind<IconSource | null>`","`null`",`An image address or a component before the title.`],[`navigation`,"`Bind<'none' | 'menu' | 'back'>`","`'none'`",`The button at the start of the bar.`],[`navigationGlyph`,"`Bind<string>`","`'menu'`, `'arrow-start'`",`The glyph of that button. The back arrow is mirrored in a right-to-left page.`],[`navigationLabel`,"`Bind<string>`",`A kit string`,`The accessible name of that button.`],[`actions`,"`Bind<readonly ToolbarItem[]>`","`[]`","The commands at the end of the bar, the same items as `Toolbar.items`."],[`actionsLabel`,"`Bind<string>`",`The kit string “Actions”`,`The accessible name of the commands.`],[`overflow`,"`Bind<ToolbarOverflow>`","`'menu'`",`How commands that do not fit are handled.`],[`content`,"`Bind<ComponentBase | null>`","`null`",`A control between the title and the commands, the same as JSX children.`],[`tone`,"`Bind<'surface' | 'accent'>`","`'surface'`",`The color of the bar.`],[`prominent`,"`Bind<boolean>`","`false`",`Puts a larger title on a row of its own under the buttons.`],[`position`,"`Bind<'static' | 'sticky' | 'fixed'>`","`'sticky'`",`How the bar stays on the page.`],[`scrollBehavior`,"`Bind<'none' | 'lift' | 'hide'>`","`'none'`","`lift` raises the bar over the content that scrolls under it. `hide` also moves it away while scrolling down, and brings it back while scrolling up."],[`scrollTarget`,"`Bind<ComponentBase | null>`",`The nearest ancestor that scrolls`,"What `scrollBehavior` watches. Without a scrolling ancestor, it is the page."]],A=[[`onNavigationClick`,"`{ navigation, originalEvent, source }`",`Occurs when the button at the start of the bar is pressed.`]],j=[[`Landmark`,"The bar is a `<header>`, which is a banner landmark when it is not inside a sectioning element."],[`Heading`,"Use `headingLevel` when the title is the heading of the page."],[`Commands`,"The commands are a `Toolbar` with an accessible name: one Tab stop, with the arrow keys, Home and End inside it."],[`Focus`,"A bar moved away by `hide` comes back when focus enters it."]],M=[[`.mx-app-bar`,"The bar. `data-tone`, `data-position`, `data-title-align`, `data-prominent`, `data-lifted` and `data-hidden` describe its state."],[`.mx-app-bar__row, .mx-app-bar__start, .mx-app-bar__navigation, .mx-app-bar__logo`,`The row, the start of the bar, the navigation button and the logo.`],[`.mx-app-bar__titles, .mx-app-bar__title, .mx-app-bar__subtitle`,`The titles.`],[`.mx-app-bar__content, .mx-app-bar__actions`,`The control and the commands.`]],N=[[`app-bar.bar, .row, .start, .logo, .titles, .title, .subtitle, .content`,"Units: the bar (`lifted`, `accent`), the row (`prominent`), the title (`prominent`, `accent`) and the subtitle (`accent`)."],[`app-bar.title-least`,`The room the titles keep before commands move into the menu.`],[`app-bar.toolbar, .button`,`Places: the commands, and a button of an accent bar.`]];function P(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(f,{text:"The top bar of an application, with a navigation button, a logo, a title, a control and commands. The commands are a `Toolbar`, so those that do not fit move into a menu.",runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(u,{anchor:`import`,title:`Import`,runover:{},childs:[t(l,{code:`
import { AppBar } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(u,{anchor:`basic`,title:`Title and commands`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(f,{text:"`navigation` adds a button at the start of the bar, and `onNavigationClick` reports it. `actions` takes the same items as `Toolbar.items`. Make the window narrower to see commands move into the menu.",runover:{},childs:[]});e.controls.add(n)}},1),t(d,{stack:!0,files:O(`Basic.tsx`),runover:{},childs:[t(x,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(u,{anchor:`looks`,title:`Title and tone`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(f,{text:"`titleAlign` centers the title, `tone` gives the bar the accent color, and `prominent` puts a larger title on a row of its own.",runover:{},childs:[]});e.controls.add(n)}},1),t(d,{stack:!0,files:O(`Looks.tsx`),runover:{},childs:[t(C,{runover:{},childs:[]})]})]});e.controls.add(a);let o=t(u,{anchor:`content`,title:`A control in the bar`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(f,{text:`JSX children lie between the title and the commands. This is the place for a search box.`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{stack:!0,files:O(`WithContent.tsx`),runover:{},childs:[t(D,{runover:{},childs:[]})]})]});e.controls.add(o);let s=t(u,{anchor:`scrolling`,title:`Scrolling`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(f,{text:"By default, the bar sticks to the top of what scrolls. `scrollBehavior` raises it over the content or moves it away while scrolling down. Scroll the box to compare them.",runover:{},childs:[]});e.controls.add(n)}},1),t(d,{stack:!0,files:O(`Scrolling.tsx`),runover:{},childs:[t(E,{runover:{},childs:[]})]})]});e.controls.add(s);let c=t(u,{anchor:`programmatic`,title:`Programmatic use`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(f,{text:"`new AppBar(props)` creates the bar without JSX. Each prop is also a property.",runover:{},childs:[]});e.controls.add(n)}},1),t(d,{stack:!0,files:O(`Programmatic.tsx`),runover:{},childs:[t(w,{runover:{},childs:[]})]})]});e.controls.add(c);let m=t(u,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(f,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(p,{head:[`Prop`,`Type`,`Default`,`Description`],rows:k,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(f,{text:`Events`,runover:{},childs:[]});e.controls.add(n)}},1),t(p,{head:[`Event`,`Type`,`Description`],rows:A,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(f,{text:`Accessibility`,runover:{},childs:[]});e.controls.add(n)}},1),t(p,{head:[`Topic`,`Details`],rows:j,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(f,{text:`Styling hooks`,runover:{},childs:[]});e.controls.add(n)}},1),t(p,{head:[`Hook`,`Description`],rows:M,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(f,{text:`Design tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(p,{head:[`Token`,`Description`],rows:N,runover:{},childs:[]})]});e.controls.add(m)}}})}export{P as default};