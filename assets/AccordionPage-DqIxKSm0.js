import{Qn as e,Zn as t,er as n,n as r}from"./next-id-CtzpBrBT.js";import{t as i}from"./TextBox-iHQY3j6o.js";import{n as a,t as o}from"./Accordion-ByD6GsJR.js";import{t as s}from"./Stack-wRt1e9tO.js";import{a as c,i as l,n as u,r as d,t as f}from"./docs-B_LZlyP5.js";import{t as p}from"./sources-BXVvOiIY.js";var m=`import { reactive } from '@motifx/core';\r
import { Accordion, AccordionItem, TextBox } from '@motifx-community/ui';\r
\r
/** Sections created when first opened: one is kept, and one is recreated each time it opens. */\r
export default function LazySections() {\r
  const s = reactive({ builds: 0 });\r
  return (\r
    <>\r
      <Accordion class="acc-lazy" multiple>\r
        <AccordionItem\r
          title="Kept"\r
          content={() => {\r
            s.builds++;\r
            return <TextBox label="Type, close, open again" />;\r
          }}\r
        />\r
        <AccordionItem\r
          title="Made each time"\r
          keepAlive={false}\r
          content={() => {\r
            s.builds++;\r
            return <TextBox label="Starts empty each time" />;\r
          }}\r
        />\r
      </Accordion>\r
      <output class="acc-builds">{() => \`Sections built: \${s.builds}\`}</output>\r
    </>\r
  );\r
}\r
`,h=`import { reactive } from '@motifx/core';\r
import { Accordion, AccordionItem, Button, Stack } from '@motifx-community/ui';\r
\r
/** One item open at a time or several, kept open or not, with a disabled item. */\r
export default function OneOrSeveral() {\r
  const s = reactive({ multiple: false, collapsible: true });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Multiple" size="sm" variant="outline" toggle x-model={() => s.multiple} />\r
        <Button text="Collapsible" size="sm" variant="outline" toggle x-model={() => s.collapsible} />\r
      </Stack>\r
      <Accordion class="acc-multiple" multiple={() => s.multiple} collapsible={() => s.collapsible}>\r
        <AccordionItem title="Monday">\r
          <p>Monday.</p>\r
        </AccordionItem>\r
        <AccordionItem title="Tuesday">\r
          <p>Tuesday.</p>\r
        </AccordionItem>\r
        <AccordionItem title="Wednesday" enabled={false}>\r
          <p>Wednesday.</p>\r
        </AccordionItem>\r
        <AccordionItem title="Thursday">\r
          <p>Thursday.</p>\r
        </AccordionItem>\r
      </Accordion>\r
    </>\r
  );\r
}\r
`,g=`import { reactive } from '@motifx/core';\r
import { Accordion, AccordionItem, Button, Stack, TextBox } from '@motifx-community/ui';\r
\r
const TruckIcon = () => (\r
  <svg viewBox="0 0 16 16" aria-hidden="true">\r
    <path d="M1.5 4.5h8v6h-8zM9.5 6.5h3l2 2v2h-5M4 12.5a1 1 0 1 0 0-.01M12 12.5a1 1 0 1 0 0-.01" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />\r
  </svg>\r
);\r
\r
const FAQ = [\r
  { q: 'Can I pay later?', a: 'Yes, within 30 days of the invoice.' },\r
  { q: 'Do you ship abroad?', a: 'To most countries in Europe.' },\r
  { q: 'How do I return an item?', a: 'Send it back within 14 days with the slip in the box.' },\r
];\r
\r
/** An accordion from JSX bound with x-model, and one created with \`new\` that gets items programmatically. */\r
export default function Programmatic() {\r
  const s = reactive({ open: ['shipping'] as (string | number)[], address: '', log: '' });\r
  let added = 0;\r
\r
  const faq = new Accordion({ variant: 'separated', multiple: true });\r
  for (const entry of FAQ) faq.add(new AccordionItem({ title: entry.q, content: () => <p>{entry.a}</p> }));\r
  faq.onExpanded((e) => (s.log = \`Opened “\${e.item.title}”\${e.byUser ? ' by the user' : ' programmatically'}.\`));\r
\r
  const addQuestion = () => {\r
    const n = ++added;\r
    const item = faq.add(new AccordionItem({ title: \`Question \${n}\`, content: () => <p>Answer {n}.</p> }));\r
    item.expanded = true;\r
  };\r
\r
  return (\r
    <>\r
      <Accordion class="acc-ways" x-model={() => s.open}>\r
        <AccordionItem key="shipping" title="&Shipping" icon={() => <TruckIcon />}>\r
          <TextBox label="Address" x-model={() => s.address} />\r
        </AccordionItem>\r
        <AccordionItem key="payment" title="&Payment">\r
          <p>Card or bank transfer.</p>\r
        </AccordionItem>\r
        <AccordionItem key="review" title="&Review">\r
          <p>{() => \`Ship to: \${s.address || '—'}\`}</p>\r
        </AccordionItem>\r
      </Accordion>\r
      <output class="acc-value">{() => \`value: [\${s.open.map((k) => JSON.stringify(k)).join(', ')}]\`}</output>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Add a question programmatically" variant="outline" onclick={addQuestion} />\r
        <output class="acc-log">{() => s.log}</output>\r
      </Stack>\r
      <Stack style="inline-size: 100%" onBuilt={(c) => c.controls.add(faq)} />\r
    </>\r
  );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { Accordion, AccordionItem, Button, Stack, type AccordionChevron, type AccordionVariant } from '@motifx-community/ui';\r
\r
const VARIANTS: AccordionVariant[] = ['list', 'separated', 'flush'];\r
const CHEVRONS: AccordionChevron[] = ['end', 'start', 'none'];\r
\r
/** The three variants in the three sizes, with the chevron at either side or none. */\r
export default function VariantsAndSizes() {\r
  const s = reactive({ variant: 'list' as AccordionVariant, chevron: 'end' as AccordionChevron });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Variant">\r
        {VARIANTS.map((variant) => (\r
          <Button\r
            key={variant}\r
            text={variant}\r
            size="sm"\r
            variant={() => (s.variant === variant ? 'solid' : 'ghost')}\r
            aria-pressed={() => s.variant === variant}\r
            onclick={() => (s.variant = variant)}\r
          />\r
        ))}\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Chevron">\r
        {CHEVRONS.map((chevron) => (\r
          <Button\r
            key={chevron}\r
            text={\`chevron \${chevron}\`}\r
            size="sm"\r
            variant={() => (s.chevron === chevron ? 'solid' : 'ghost')}\r
            aria-pressed={() => s.chevron === chevron}\r
            onclick={() => (s.chevron = chevron)}\r
          />\r
        ))}\r
      </Stack>\r
      {(['sm', 'md', 'lg'] as const).map((size) => (\r
        <Accordion key={size} class="acc-look" size={size} variant={() => s.variant} chevron={() => s.chevron}>\r
          <AccordionItem title={\`Size \${size}\`} expanded>\r
            <p>The section of a {size} accordion.</p>\r
          </AccordionItem>\r
          <AccordionItem title="Another">\r
            <p>Another section.</p>\r
          </AccordionItem>\r
        </Accordion>\r
      ))}\r
    </>\r
  );\r
}\r
`,v=()=>t(`svg`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({viewBox:`0 0 16 16`,"aria-hidden":`true`});let n=t(`path`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({d:`M1.5 4.5h8v6h-8zM9.5 6.5h3l2 2v2h-5M4 12.5a1 1 0 1 0 0-.01M12 12.5a1 1 0 1 0 0-.01`,fill:`none`,stroke:`currentColor`,"stroke-width":`1.2`,"stroke-linejoin":`round`})}});e.controls.add(n)}}),y=[{q:`Can I pay later?`,a:`Yes, within 30 days of the invoice.`},{q:`Do you ship abroad?`,a:`To most countries in Europe.`},{q:`How do I return an item?`,a:`Send it back within 14 days with the slip in the box.`}];function b(){let c=n({open:[`shipping`],address:``,log:``}),l=0,u=new o({variant:`separated`,multiple:!0});for(let e of y)u.add(new a({title:e.q,content:()=>t(`p`,{initializeComponent:n=>{let r=t(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,e,`a`)},__childExpr:()=>e.a});n.controls.add(r)}},1)}));u.onExpanded(e=>c.log=`Opened “${e.item.title}”${e.byUser?` by the user`:` programmatically`}.`);let d=()=>{let e=++l,n=u.add(new a({title:`Question ${e}`,content:()=>t(`p`,{initializeComponent:n=>{let r=t(`text`,{initializeComponent:e=>{e.setText(`Answer `)}},1);n.controls.add(r);let i=t(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,()=>{if(e!=null)return typeof e==`function`?e():()=>e})},__childExpr:()=>e});n.controls.add(i);let a=t(`text`,{initializeComponent:e=>{e.setText(`.`)}},1);n.controls.add(a)}},1)}));n.expanded=!0};return e({initializeComponent:e=>{{let n=t(o,{class:`acc-ways`,runover:{initializeComponent:e=>{e.bindings.model(()=>c.open,e=>{let t=c;t!=null&&typeof t.open!=`function`&&(t.open=e)})}},childs:[t(a,{indexkey:()=>`shipping`,title:`&Shipping`,icon:()=>t(v,{runover:{},childs:[]}),runover:{},childs:[t(i,{label:`Address`,runover:{initializeComponent:e=>{e.bindings.model(()=>c.address,e=>{let t=c;t!=null&&typeof t.address!=`function`&&(t.address=e)})}},childs:[]})]}),t(a,{indexkey:()=>`payment`,title:`&Payment`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(`text`,{initializeComponent:e=>{e.setText(`Card or bank transfer.`)}},1);e.controls.add(n)}},1)]}),t(a,{indexkey:()=>`review`,title:`&Review`,runover:{},childs:[t(`p`,{initializeComponent:e=>{e.bindings.method(()=>`Ship to: ${c.address||`—`}`)}},1)]})]});e.controls.add(n);let l=t(`output`,{initializeComponent:e=>{e.class.add(`acc-value`),e.bindings.method(()=>`value: [${c.open.map(e=>JSON.stringify(e)).join(`, `)}]`)}},1);e.controls.add(l);let f=t(s,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(r,{text:`Add a question programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,d)}},childs:[]}),t(`output`,{initializeComponent:e=>{e.class.add(`acc-log`),e.bindings.method(()=>c.log)}},1)]});e.controls.add(f);let p=t(s,{style:`inline-size: 100%`,runover:{onBuilt:e=>e.controls.add(u)},childs:[]});e.controls.add(p)}}})}function x(){let r=n({builds:0});return e({initializeComponent:e=>{{let n=t(o,{class:`acc-lazy`,multiple:!0,runover:{},childs:[t(a,{title:`Kept`,content:()=>(r.builds++,t(i,{label:`Type, close, open again`,runover:{},childs:[]})),runover:{},childs:[]}),t(a,{title:`Made each time`,keepAlive:!1,content:()=>(r.builds++,t(i,{label:`Starts empty each time`,runover:{},childs:[]})),runover:{},childs:[]})]});e.controls.add(n);let s=t(`output`,{initializeComponent:e=>{e.class.add(`acc-builds`),e.bindings.method(()=>`Sections built: ${r.builds}`)}},1);e.controls.add(s)}}})}function S(){let i=n({multiple:!1,collapsible:!0});return e({initializeComponent:e=>{{let n=t(s,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(r,{text:`Multiple`,size:`sm`,variant:`outline`,toggle:!0,runover:{initializeComponent:e=>{e.bindings.model(()=>i.multiple,e=>{let t=i;t!=null&&typeof t.multiple!=`function`&&(t.multiple=e)})}},childs:[]}),t(r,{text:`Collapsible`,size:`sm`,variant:`outline`,toggle:!0,runover:{initializeComponent:e=>{e.bindings.model(()=>i.collapsible,e=>{let t=i;t!=null&&typeof t.collapsible!=`function`&&(t.collapsible=e)})}},childs:[]})]});e.controls.add(n);let c=t(o,{class:`acc-multiple`,multiple:()=>i.multiple,collapsible:()=>i.collapsible,runover:{},childs:[t(a,{title:`Monday`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(`text`,{initializeComponent:e=>{e.setText(`Monday.`)}},1);e.controls.add(n)}},1)]}),t(a,{title:`Tuesday`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(`text`,{initializeComponent:e=>{e.setText(`Tuesday.`)}},1);e.controls.add(n)}},1)]}),t(a,{title:`Wednesday`,enabled:!1,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(`text`,{initializeComponent:e=>{e.setText(`Wednesday.`)}},1);e.controls.add(n)}},1)]}),t(a,{title:`Thursday`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(`text`,{initializeComponent:e=>{e.setText(`Thursday.`)}},1);e.controls.add(n)}},1)]})]});e.controls.add(c)}}})}var C=[`list`,`separated`,`flush`],w=[`end`,`start`,`none`];function T(){let i=n({variant:`list`,chevron:`end`});return e({initializeComponent:e=>{{let n=t(s,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Variant`,runover:{},childs:[t({initializeComponent:e=>{e.bindings.list(()=>C??[],e=>t(r,{indexkey:()=>e,text:e,size:`sm`,variant:()=>i.variant===e?`solid`:`ghost`,"aria-pressed":()=>i.variant===e,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>i.variant=e)}},childs:[]}))}})]});e.controls.add(n);let c=t(s,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Chevron`,runover:{},childs:[t({initializeComponent:e=>{e.bindings.list(()=>w??[],e=>t(r,{indexkey:()=>e,text:`chevron ${e}`,size:`sm`,variant:()=>i.chevron===e?`solid`:`ghost`,"aria-pressed":()=>i.chevron===e,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>i.chevron=e)}},childs:[]}))}})]});e.controls.add(c),e.bindings.list(()=>[`sm`,`md`,`lg`],e=>t(o,{indexkey:()=>e,class:`acc-look`,size:e,variant:()=>i.variant,chevron:()=>i.chevron,runover:{},childs:[t(a,{title:`Size ${e}`,expanded:!0,runover:{},childs:[t(`p`,{initializeComponent:n=>{let r=t(`text`,{initializeComponent:e=>{e.setText(`The section of a `)}},1);n.controls.add(r);let i=t(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,()=>{if(e!=null)return typeof e==`function`?e():()=>e})},__childExpr:()=>e});n.controls.add(i);let a=t(`text`,{initializeComponent:e=>{e.setText(` accordion.`)}},1);n.controls.add(a)}},1)]}),t(a,{title:`Another`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(`text`,{initializeComponent:e=>{e.setText(`Another section.`)}},1);e.controls.add(n)}},1)]})]}))}}})}var E=p(Object.assign({"./examples/LazySections.tsx":m,"./examples/OneOrSeveral.tsx":h,"./examples/Programmatic.tsx":g,"./examples/VariantsAndSizes.tsx":_})),D=[[`value`,"`Bind<(string | number)[]>`","`[]`","The keys of the open items (an item without a key uses its index). `x-model` provides two-way binding."],[`multiple`,"`Bind<boolean>`","`false`",`Allows several items to be open. Otherwise, opening one closes the other.`],[`collapsible`,"`Bind<boolean>`","`true`","With `false`, one item stays open, and its header has `aria-disabled` while it cannot close."],[`headingLevel`,"`Bind<number>`","`3`","The `aria-level` of the headers (1 to 6). Match it to the surrounding headings."],[`arrowKeys`,"`Bind<boolean>`","`true`",`Up, Down, Home and End move between headers.`],[`regions`,"`Bind<boolean | 'auto'>`","`'auto'`",'Makes sections `role="region"` landmarks. `auto` applies when there are six items or fewer.'],[`variant`,"`Bind<AccordionVariant>`","`'list'`","`list` (one bordered box), `separated` (a card per item) or `flush` (dividers only)."],[`size`,"`Bind<ControlSize>`","`'md'`","`sm`, `md`, `lg`, from the density tokens."],[`chevron`,"`Bind<AccordionChevron>`","`'end'`","The position of the chevron: `end`, `start` or `none`."],[`lazy`,"`Bind<boolean>`","`true`","Creates a section when first opened and then keeps it. An item's own `lazy` takes precedence."],[`keepAlive`,"`Bind<boolean>`","`true`","With `false`, content created by an item's `content` is disposed when it closes and recreated when it opens. An item's own `keepAlive` takes precedence."],[`enabled / disabled, visible, tabStop, tabIndex`,`see Control`,``,`Properties shared by all controls.`]],O=[[`title`,"`Bind<string>`","`''`","The header text. `&Shipping` makes Alt+S toggle the item. This is the same property as `text`."],[`key`,"`Bind<string>`","`''`","Identifies the item in `value`. The JSX `key` also works."],[`expanded`,"`Bind<boolean>`","`false`",`Indicates whether the section is open.`],[`icon`,"`Bind<IconSource | null>`",`—`,`An icon before the title.`],[`hint`,"`Bind<string>`","`''`",`A tooltip on the header.`],[`lazy, keepAlive`,"`Bind<boolean | undefined>`",`From Accordion`,`This item's own setting.`],[`content`,"`() => ComponentBase | ComponentBase[]`",`—`,`Creates the section content when it is created, either instead of or after the JSX children.`],[`enabled, visible`,"`Bind<boolean>`","`true`",`A disabled item cannot be opened or closed, and a hidden item is removed.`]],k=[[`every prop above`,`read/write, reactive`,`Accepts a value or a function, the same as the prop.`],[`items`,`read-only, reactive`,`The items in order.`],[`expandedItems`,`read-only, reactive`,`The open items.`],[`AccordionItem.contentBuilt`,`read-only`,`Indicates whether its section has been created.`],[`AccordionItem.owner, headerPart, regionPart`,`read-only`,"Its `Accordion`, its header button and its region."]],A=[[`add(item), insert(index, item)`,"`AccordionItem`","Adds an item. An item from another `Accordion` moves here."],[`remove(item)`,"`boolean`",`Removes the item and disposes it. Focus inside moves to an adjacent item.`],[`expandAll(), collapseAll()`,"`void`","Programmatic control. `expandAll` requires `multiple`, and with `collapsible` off one item stays open."],[`AccordionItem.expand(), collapse()`,"`boolean`","Toggles as a click would, so the cancelable events run. `item.expanded = true` sets the state programmatically."],[`focus()`,"`boolean`",`Sets focus on the item's header.`]],j=[[`onExpanding(e), onCollapsing(e)`,"Occurs before the user opens or closes an item. `e`: `{ item, index, cancel, source, event? }`. Set `e.cancel = true` to keep the current state."],[`onExpanded(e), onCollapsed(e)`,"Occurs after an item opens or closes. `e`: `{ item, index, byUser, source }`."]],M=[[`Tab`,`Moves from header to header, and into an open section.`],[`Enter / Space`,`Expands or collapses the focused item.`],[`Down / Up`,"Moves to the next or previous header, wrapping at the ends (with `arrowKeys`)."],[`Home / End`,"Moves to the first or last header (with `arrowKeys`)."],["Alt + key (`&Shipping`)",`Moves focus to that header and toggles it (Control + Option + key on Apple platforms).`]],N=[[`Header`,'A `<button>` with `aria-expanded` and `aria-controls`, inside an element with `role="heading"` and `aria-level` (`headingLevel`).'],[`Section`,'`role="region"` named by its header (`aria-labelledby`) when there are six items or fewer, as the APG recommends. `regions` controls this.'],[`Closed sections`,"`visibility: hidden` once closed, which removes it from the Tab order and the accessibility tree."],[`Kept open`,'With `collapsible` off, the header of an item that cannot close has `aria-disabled="true"`.'],[`Motion`,`The height animates using the motion tokens, and reduced motion turns it off.`]],P=[[`.mx-accordion`,"The root. `data-variant`, `data-size`, `data-chevron`, `data-disabled`."],[`.mx-accordion__item`,"An item: `data-expanded`, `data-disabled`."],[`.mx-accordion__heading, .mx-accordion__header`,`The heading and its button.`],[`.mx-accordion__icon, .mx-accordion__label, .mx-accordion__chevron`,`The parts of a header.`],[`.mx-accordion__region, .mx-accordion__body`,`The section (animated) and its content.`]],F=[[`accordion.height.*, accordion.padding.*, accordion.font-size.*`,`Header sizes, from the density tokens.`],[`accordion.container, accordion.item`,"Units: the accordion and its items per variant (`list`, `list-next`, `separated`, `flush`; `expanded`)."],[`accordion.header, accordion.icon, accordion.chevron, accordion.plate, accordion.body`,"Units: a header (`expanded`, `hover`, `pressed`, `disabled`, `focus`), its icon, the chevron (`open`) and the plate behind it, and the open section."],[`accordion.chevron-size, accordion.chevron-plate-size, accordion.content-padding`,`The sizes of the chevron and plate, and the spacing above and below the section content.`]];function I(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(d,{text:`An accordion expands and collapses sections under their headers. It supports one or several open sections, sections that stay open, icons, three appearances and sections that are created when first opened.`,runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(l,{anchor:`import`,title:`Import`,runover:{},childs:[t(c,{code:`
import { Accordion, AccordionItem } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(l,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(d,{text:"The children of an `<AccordionItem>` are its section. `value` lists the keys of the open items, and `x-model` provides two-way binding. When you create the component with `new`, add and remove items programmatically.",runover:{},childs:[]});e.controls.add(n)}},1),t(u,{files:E(`Programmatic.tsx`),stack:!0,runover:{},childs:[t(b,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(l,{anchor:`multiple`,title:`Single and multiple expansion`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(d,{text:"By default, one item is open at a time. With `multiple`, several can be open. `collapsible={false}` keeps one open, so its header cannot close it.",runover:{},childs:[]});e.controls.add(n)}},1),t(u,{files:E(`OneOrSeveral.tsx`),stack:!0,runover:{},childs:[t(S,{runover:{},childs:[]})]})]});e.controls.add(a);let o=t(l,{anchor:`lazy`,title:`Lazy sections`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(d,{text:"A section is created when first opened and then kept (`lazy`, on by default). An item with a `content` factory and `keepAlive={false}` has its content disposed when it closes and recreated when it opens.",runover:{},childs:[]});e.controls.add(n)}},1),t(u,{files:E(`LazySections.tsx`),stack:!0,runover:{},childs:[t(x,{runover:{},childs:[]})]})]});e.controls.add(o);let s=t(l,{anchor:`look`,title:`Variants and sizes`,runover:{},childs:[t(u,{files:E(`VariantsAndSizes.tsx`),stack:!0,runover:{},childs:[t(T,{runover:{},childs:[]})]})]});e.controls.add(s);let p=t(l,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[t(f,{head:[`Key`,`Description`],rows:M,runover:{},childs:[]})]});e.controls.add(p);let m=t(l,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(f,{head:[`Topic`,`Details`],rows:N,runover:{},childs:[]})]});e.controls.add(m);let h=t(l,{anchor:`styling`,title:`Styling`,runover:{},childs:[t(f,{head:[`Hook`,`Description`],rows:P,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(d,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(f,{head:[`Token`,`Description`],rows:F,runover:{},childs:[]})]});e.controls.add(h);let g=t(l,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(d,{text:`Accordion props`,runover:{},childs:[]});e.controls.add(n)}},1),t(f,{head:[`Prop`,`Type`,`Default`,`Description`],rows:D,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(d,{text:`AccordionItem props`,runover:{},childs:[]});e.controls.add(n)}},1),t(f,{head:[`Prop`,`Type`,`Default`,`Description`],rows:O,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(d,{text:`Properties`,runover:{},childs:[]});e.controls.add(n)}},1),t(f,{head:[`Property`,`Access`,`Description`],rows:k,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(d,{text:`Methods`,runover:{},childs:[]});e.controls.add(n)}},1),t(f,{head:[`Method`,`Returns`,`Description`],rows:A,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(d,{text:`Events`,runover:{},childs:[]});e.controls.add(n)}},1),t(f,{head:[`Event`,`When`],rows:j,runover:{},childs:[]}),t(`p`,{initializeComponent:e=>{let n=t(d,{text:"The accordion has no strings of its own, so it adds nothing to `uiLocale`.",runover:{},childs:[]});e.controls.add(n)}},1)]});e.controls.add(g)}}})}export{I as default};