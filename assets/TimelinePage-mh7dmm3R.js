import{Qn as e,Zn as t,er as n,n as r}from"./next-id-CtzpBrBT.js";import{t as i}from"./Timeline-Dnmh9NF-.js";import{t as a}from"./Stack-wRt1e9tO.js";import{a as o,i as s,n as c,r as l,t as u}from"./docs-B_LZlyP5.js";import{t as d}from"./sources-BXVvOiIY.js";var f=`import { reactive } from '@motifx/core';\r
import { Button, Stack, Timeline } from '@motifx-community/ui';\r
\r
/** Any content in a card: a button that acts on the event, and a custom icon in the marker. */\r
export default function Content() {\r
    const s = reactive({ told: '' });\r
    const act = (what: string) => (\r
        <Stack orientation="horizontal" gap="sm">\r
            <Button text={what} variant="outline" size="sm" onclick={() => (s.told = \`\${what} pressed\`)} />\r
        </Stack>\r
    );\r
    return (\r
        <Stack gap="sm" style="inline-size: 100%">\r
            <Timeline\r
                class="tl-orders"\r
                label="An order"\r
                items={[\r
                    { date: '2026-11-02T09:15:00', title: 'Order placed', description: 'Three items, paid by card.', tone: 'info', content: () => act('See the invoice') },\r
                    { date: '2026-11-03T14:40:00', title: 'Packed', tone: 'accent', glyph: 'columns' },\r
                    { date: '2026-11-04T08:00:00', title: 'On its way', description: 'Handed to the courier.', content: () => act('Track it') },\r
                    { date: '2026-11-05T16:25:00', title: 'Delivered', tone: 'success', glyph: 'check', content: () => act('Rate it') }\r
                ]}\r
                dateFormat={{ dateStyle: 'medium', timeStyle: 'short' }}\r
            />\r
            <output class="tl-orders-told">{() => s.told}</output>\r
        </Stack>\r
    );\r
}\r
`,p=`import { reactive } from '@motifx/core';\r
import { Stack, Timeline } from '@motifx-community/ui';\r
\r
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];\r
\r
/** Releases along a line of dates. Clicking a date, or using the arrow keys, shows that release below the line, and the buttons scroll the track. */\r
export default function Horizontal() {\r
    const s = reactive({ shown: 'r3' as string | number | null });\r
    const releases = MONTHS.map((month, i) => ({\r
        key: \`r\${i + 1}\`,\r
        date: new Date(2026, i, 15),\r
        title: \`Release \${i + 1}\`,\r
        description: \`What \${month} brought: \${i % 3 === 0 ? 'new components' : i % 3 === 1 ? 'fixes and speed' : 'the docs and the languages'}.\`,\r
        tone: i % 3 === 0 ? ('accent' as const) : ('default' as const),\r
        glyph: i % 3 === 0 ? 'star' : ''\r
    }));\r
    return (\r
        <Stack gap="sm" style="inline-size: 100%">\r
            <Timeline class="tl-releases" label="Releases" orientation="horizontal" dateFormat={{ month: 'short', year: 'numeric' }} items={releases} x-model={() => s.shown} />\r
            <output class="tl-releases-told">{() => \`shown: \${s.shown}\`}</output>\r
        </Stack>\r
    );\r
}\r
`,m=`import { reactive } from '@motifx/core';\r
import { Button, Stack, Timeline } from '@motifx-community/ui';\r
\r
/** A project shown vertically, with a marker per event colored by its tone. Cards can alternate sides or collapse. */\r
export default function Vertical() {\r
    const s = reactive({ alternate: false, collapsible: false, told: '' });\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <Stack orientation="horizontal" wrap align="center">\r
                <Button text="Take turns" variant="outline" toggle x-model={() => s.alternate} />\r
                <Button text="Fold the cards" variant="outline" toggle x-model={() => s.collapsible} />\r
                <output class="tl-told">{() => s.told}</output>\r
            </Stack>\r
            <Timeline\r
                class="tl-project"\r
                label="The project"\r
                alternate={() => s.alternate}\r
                collapsible={() => s.collapsible}\r
                onItemClick={e => (s.told = \`pressed: \${(e.item as { title: string }).title}\`)}\r
                items={[\r
                    { date: '2026-01-12', title: 'Kick-off', description: 'The team met and the scope was agreed.', glyph: 'calendar' },\r
                    { date: '2026-02-20', title: 'Design signed off', description: 'Five languages, every state measured.', tone: 'info', glyph: 'pencil' },\r
                    { date: '2026-04-03', title: 'Beta', description: 'The first users came in; two slow screens were found.', tone: 'accent', glyph: 'person' },\r
                    { date: '2026-05-15', title: 'Slow screens fixed', description: 'The grid draws only what is in view.', tone: 'caution' },\r
                    { date: '2026-06-30', title: 'Shipped', description: 'Version one, on time.', tone: 'success', glyph: 'check' }\r
                ]}\r
            />\r
        </Stack>\r
    );\r
}\r
`;function h(){let e=n({told:``}),o=n=>t(a,{orientation:`horizontal`,gap:`sm`,runover:{},childs:[t(r,{text:n,variant:`outline`,size:`sm`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.told=`${n} pressed`)}},childs:[]})]});return t(a,{gap:`sm`,style:`inline-size: 100%`,runover:{},childs:[t(i,{class:`tl-orders`,label:`An order`,items:[{date:`2026-11-02T09:15:00`,title:`Order placed`,description:`Three items, paid by card.`,tone:`info`,content:()=>o(`See the invoice`)},{date:`2026-11-03T14:40:00`,title:`Packed`,tone:`accent`,glyph:`columns`},{date:`2026-11-04T08:00:00`,title:`On its way`,description:`Handed to the courier.`,content:()=>o(`Track it`)},{date:`2026-11-05T16:25:00`,title:`Delivered`,tone:`success`,glyph:`check`,content:()=>o(`Rate it`)}],dateFormat:{dateStyle:`medium`,timeStyle:`short`},runover:{},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`tl-orders-told`),t.bindings.method(()=>e.told)}},1)]})}var g=[`January`,`February`,`March`,`April`,`May`,`June`,`July`,`August`,`September`,`October`,`November`,`December`];function _(){let e=n({shown:`r3`}),r=g.map((e,t)=>({key:`r${t+1}`,date:new Date(2026,t,15),title:`Release ${t+1}`,description:`What ${e} brought: ${t%3==0?`new components`:t%3==1?`fixes and speed`:`the docs and the languages`}.`,tone:t%3==0?`accent`:`default`,glyph:t%3==0?`star`:``}));return t(a,{gap:`sm`,style:`inline-size: 100%`,runover:{},childs:[t(i,{class:`tl-releases`,label:`Releases`,orientation:`horizontal`,dateFormat:{month:`short`,year:`numeric`},items:r,runover:{initializeComponent:t=>{t.bindings.model(()=>e.shown,t=>{let n=e;n!=null&&typeof n.shown!=`function`&&(n.shown=t)})}},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`tl-releases-told`),t.bindings.method(()=>`shown: ${e.shown}`)}},1)]})}function v(){let e=n({alternate:!1,collapsible:!1,told:``});return t(a,{gap:`md`,style:`inline-size: 100%`,runover:{},childs:[t(a,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(r,{text:`Take turns`,variant:`outline`,toggle:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.alternate,t=>{let n=e;n!=null&&typeof n.alternate!=`function`&&(n.alternate=t)})}},childs:[]}),t(r,{text:`Fold the cards`,variant:`outline`,toggle:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.collapsible,t=>{let n=e;n!=null&&typeof n.collapsible!=`function`&&(n.collapsible=t)})}},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`tl-told`),t.bindings.method(()=>e.told)}},1)]}),t(i,{class:`tl-project`,label:`The project`,alternate:()=>e.alternate,collapsible:()=>e.collapsible,onItemClick:t=>e.told=`pressed: ${t.item.title}`,items:[{date:`2026-01-12`,title:`Kick-off`,description:`The team met and the scope was agreed.`,glyph:`calendar`},{date:`2026-02-20`,title:`Design signed off`,description:`Five languages, every state measured.`,tone:`info`,glyph:`pencil`},{date:`2026-04-03`,title:`Beta`,description:`The first users came in; two slow screens were found.`,tone:`accent`,glyph:`person`},{date:`2026-05-15`,title:`Slow screens fixed`,description:`The grid draws only what is in view.`,tone:`caution`},{date:`2026-06-30`,title:`Shipped`,description:`Version one, on time.`,tone:`success`,glyph:`check`}],runover:{},childs:[]})]})}var y=d(Object.assign({"./examples/Content.tsx":f,"./examples/Horizontal.tsx":p,"./examples/Vertical.tsx":m})),b=[[`items`,"`Bind<readonly TimelineItem[]>`","`[]`","The events in order: `date` (a `Date`, an ISO string or milliseconds), `title`, `description`, `glyph` or `icon`, `tone`, `content`, `key` and `data`."],[`orientation`,"`Bind<TimelineOrientation>`","`'vertical'`","`vertical` shows a card per event down the page. `horizontal` shows a line of dates with the selected event's card below it."],[`alternate`,"`Bind<boolean>`","`false`",`In the vertical layout, places cards on alternating sides of the line.`],[`collapsible`,"`Bind<boolean>`","`false`",`In the vertical layout, shows a card's description only when clicked.`],[`dateFormat`,"`Bind<TimelineDateFormat>`","`'medium'`","`short`, `medium`, `long` or `Intl.DateTimeFormat` options. Dates use the kit language."],[`value`,"`Bind<string | number | null>`","`0`","In the horizontal layout, the event whose card is shown, identified by its `key` or index. `x-model` provides two-way binding."],[`label`,"`Bind<string>`",`The kit string “Timeline”`,`The accessible name.`]],x=[[`onItemClick`,`event`,"Occurs when an event's card or date is clicked (`index`, `item`)."],[`onSelectionChanged`,`event`,"In the horizontal layout, occurs when the selected event changes (`index`, `item`, `previous`, `byUser`)."],[`selectedIndex`,`read-only`,`In the horizontal layout, the index of the selected event, or -1 if there is none.`],[`count`,`read-only`,`The number of events.`],[`goTo(event)`,"`boolean`",`In the horizontal layout, shows an event by index or key. In the vertical layout, expands its card.`],[`unfold(event, on), isUnfolded(event)`,"`void`, `boolean`","In the vertical layout with `collapsible`, expands or collapses a card, or reports whether it is expanded."],[`formatDate(date)`,"`string`",`Formats a date the same way the timeline does.`],[`refresh()`,"`void`",`Re-reads the items after they have been changed in place.`]],S=[[`Tab`,`In the vertical layout, each collapsible card is a Tab stop. In the horizontal layout, the selected date is one Tab stop, and the track buttons are also Tab stops.`],[`Arrow keys`,`In the horizontal layout, Left and Right show the previous or next event (reversed on right-to-left pages), and Home and End show the first and last.`],[`Enter, Space`,`On a collapsible card, expands or collapses it. On a date, shows it.`]],C=[[`Vertical layout`,"A `list` named by `label`, with one item per event. A date is a `time` element with its ISO value, and a collapsible card is a button with `aria-expanded` that controls its description."],[`Along the line`,"The dates are tabs (`tablist`, `tab`, `aria-selected`), and the card below them is the `tabpanel` they control. The buttons at the ends are named “Earlier” and “Later”."],[`Dots and glyphs`,`Decorative. The tone is conveyed only by color, so put important information in the title.`]],w=[[`.mx-timeline`,"The timeline. `data-orientation`, `data-alternate`."],[`.mx-timeline__list, .mx-timeline__item`,"The list (the line is its `::before`) and an event (`data-tone`, `data-side`, `data-expanded`, `data-selected`)."],[`.mx-timeline__dot, .mx-timeline__dot-glyph, .mx-timeline__dot-icon`,`The marker and its content.`],[`.mx-timeline__card, .mx-timeline__flag, .mx-timeline__detail`,`A card in the vertical layout, a date in the horizontal layout, and the card below the line.`],[`.mx-timeline__date, .mx-timeline__title, .mx-timeline__description, .mx-timeline__content`,`The text and custom content.`],[`.mx-timeline__track, .mx-timeline__nav, .mx-timeline__nav-glyph`,`The scrolling track, its buttons and their arrows.`]],T=[[`timeline.line, .dot, .dot-glyph, .card, .flag, .date, .title, .description, .detail, .nav, .nav-glyph`,"Units: the line, a marker and its glyph (by tone), a card (`pressable`, `hover`, `pressed`, `focus`, `expanded`), a date item (`hover`, `pressed`, `focus`, `selected`), the text, the detail card and the track buttons."],[`timeline.gap, .dot-gap, .track-gap, .row-gap, .mark-size, .line-thickness`,`The gap between events, between a marker and its card, between dates, and between the track and the detail card, plus the marker size and line thickness.`]];function E(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(l,{text:`Displays events in chronological order. In the vertical layout, each event is a card next to a line with a marker. In the horizontal layout, events appear along a line of dates, and selecting a date shows that event's card below the line. Dates are formatted in the kit language. For scheduling by the hour, see [Scheduler](/scheduler).`,runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(s,{anchor:`import`,title:`Import`,runover:{},childs:[t(o,{code:`
import { Timeline } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(s,{anchor:`ways`,title:`Vertical layout`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"`items` defines the events, each with a `date`, a `title`, a `description`, a `tone` for the marker and a `glyph` inside it. `alternate` places the cards on alternating sides of the line, and `collapsible` hides descriptions until a card is clicked. `onItemClick` reports the click.",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{stack:!0,files:y(`Vertical.tsx`),runover:{},childs:[t(v,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(s,{anchor:`horizontal`,title:`Horizontal layout`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"`orientation='horizontal'` places the dates on a scrollable line with buttons at each end. The selected event (`value`, `x-model`) shows its card below the line. The arrow keys move between dates, and `dateFormat` accepts `Intl.DateTimeFormat` options.",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{stack:!0,files:y(`Horizontal.tsx`),runover:{},childs:[t(_,{runover:{},childs:[]})]})]});e.controls.add(a);let d=t(s,{anchor:`content`,title:`Any content`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"An item's `content` adds custom content to its card, in addition to the text. `icon` places a custom icon in the marker. A date includes the time when `dateFormat` specifies it.",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{stack:!0,files:y(`Content.tsx`),runover:{},childs:[t(h,{runover:{},childs:[]})]})]});e.controls.add(d);let f=t(s,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[t(u,{head:[`Key`,`Description`],rows:S,runover:{},childs:[]})]});e.controls.add(f);let p=t(s,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(u,{head:[`Topic`,`Details`],rows:C,runover:{},childs:[]})]});e.controls.add(p);let m=t(s,{anchor:`styling`,title:`Styling`,runover:{},childs:[t(u,{head:[`Hook`,`Description`],rows:w,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(l,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(u,{head:[`Token`,`Description`],rows:T,runover:{},childs:[]})]});e.controls.add(m);let g=t(s,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(l,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(u,{head:[`Prop`,`Type`,`Default`,`Description`],rows:b,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(l,{text:`Events, properties and methods`,runover:{},childs:[]});e.controls.add(n)}},1),t(u,{head:[`Member`,`Type`,`Description`],rows:x,runover:{},childs:[]})]});e.controls.add(g)}}})}export{E as default};