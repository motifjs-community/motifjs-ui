import{Qn as e,Zn as t,er as n,n as r}from"./next-id-CtzpBrBT.js";import{t as i}from"./NumberBox-8iuCS9_o.js";import{t as a}from"./Switch-CESerSF7.js";import{t as o}from"./Badge-MzWiulll.js";import{t as s}from"./Stack-wRt1e9tO.js";import{a as c,i as l,n as u,r as d,t as f}from"./docs-B_LZlyP5.js";import{t as p}from"./sources-BXVvOiIY.js";var m=`import { reactive } from '@motifx/core';\r
import { Badge, NumberBox, Stack, Switch } from '@motifx-community/ui';\r
\r
/** A count up to \`max\`, and \`max+\` beyond it. At 0 it is hidden unless \`showZero\` is set, and a dot indicates only that something is present. */\r
export default function Counts() {\r
  const s = reactive({ count: 120, max: 99, showZero: false });\r
\r
  return (\r
    <>\r
      <NumberBox label="Count" min={0} x-model={() => s.count} />\r
      <NumberBox label="Max" min={1} x-model={() => s.max} />\r
      <Switch label="Show zero" x-model={() => s.showZero} />\r
      <Stack orientation="horizontal" align="center">\r
        <Badge count={() => s.count} max={() => s.max} showZero={() => s.showZero} />\r
        <Badge count={() => s.count} max={() => s.max} showZero={() => s.showZero} variant="subtle" />\r
        <Badge count={() => s.count} dot label="Something new" />\r
      </Stack>\r
    </>\r
  );\r
}\r
`,h=`import { Badge, Button, Stack, type BadgePosition } from '@motifx-community/ui';\r
\r
const CORNERS: BadgePosition[] = ['top-end', 'top-start', 'bottom-end', 'bottom-start'];\r
\r
/** On a corner of what it is in: \`position\` inside a button, or \`Badge.attach\` on any component (here a \`<span>\`). */\r
export default function OnCorner() {\r
  return (\r
    <Stack orientation="horizontal" wrap align="center" gap="xl">\r
      {CORNERS.map((corner) => (\r
        <Button key={corner} text={corner} variant="outline">\r
          <Badge count={7} position={corner} />\r
        </Button>\r
      ))}\r
      <span ref={(bell) => Badge.attach(bell, { dot: true, tone: 'danger', label: 'New notifications' })}>Notifications</span>\r
    </Stack>\r
  );\r
}\r
`,g=`import { reactive } from '@motifx/core';\r
import { Badge, Button } from '@motifx-community/ui';\r
\r
/** A badge in JSX tracks its functions, and one created with \`new\` accepts the same properties programmatically. */\r
export default function Programmatic() {\r
  const s = reactive({ unread: 4 });\r
  const coded = new Badge({ text: 'Beta', tone: 'info', variant: 'subtle' });\r
\r
  return (\r
    <>\r
      <span>\r
        Inbox <Badge count={() => s.unread} label={() => \`\${s.unread} unread\`} />\r
      </span>\r
      <Button text="Add one" variant="outline" onclick={() => s.unread++} />\r
      <Button text="Read all" variant="outline" onclick={() => (s.unread = 0)} />\r
      <span onConfig={(c) => c.controls.add(coded)}>Search </span>\r
    </>\r
  );\r
}\r
`,_=`import { Badge, Stack, type ControlSize } from '@motifx-community/ui';\r
\r
const SIZES: ControlSize[] = ['sm', 'md', 'lg'];\r
\r
/** A badge and a dot in each size. */\r
export default function Sizes() {\r
  return (\r
    <>\r
      {SIZES.map((size) => (\r
        <Stack key={size} orientation="horizontal" align="center">\r
          <Badge text={size} size={size} />\r
          <Badge count={42} size={size} variant="subtle" />\r
          <Badge dot size={size} />\r
        </Stack>\r
      ))}\r
    </>\r
  );\r
}\r
`,v=`import { Badge, Stack, type BadgeTone, type BadgeVariant } from '@motifx-community/ui';\r
\r
const TONES: BadgeTone[] = ['standard', 'accent', 'info', 'success', 'caution', 'danger'];\r
const VARIANTS: BadgeVariant[] = ['solid', 'subtle', 'outline'];\r
\r
/** Every tone in each appearance. */\r
export default function Tones() {\r
  return (\r
    <Stack>\r
      {VARIANTS.map((variant) => (\r
        <Stack key={variant} orientation="horizontal" wrap align="center">\r
          {TONES.map((tone) => (\r
            <Badge key={tone} text={tone} tone={tone} variant={variant} />\r
          ))}\r
        </Stack>\r
      ))}\r
    </Stack>\r
  );\r
}\r
`;function y(){let r=n({count:120,max:99,showZero:!1});return e({initializeComponent:e=>{{let n=t(i,{label:`Count`,min:0,runover:{initializeComponent:e=>{e.bindings.model(()=>r.count,e=>{let t=r;t!=null&&typeof t.count!=`function`&&(t.count=e)})}},childs:[]});e.controls.add(n);let c=t(i,{label:`Max`,min:1,runover:{initializeComponent:e=>{e.bindings.model(()=>r.max,e=>{let t=r;t!=null&&typeof t.max!=`function`&&(t.max=e)})}},childs:[]});e.controls.add(c);let l=t(a,{label:`Show zero`,runover:{initializeComponent:e=>{e.bindings.model(()=>r.showZero,e=>{let t=r;t!=null&&typeof t.showZero!=`function`&&(t.showZero=e)})}},childs:[]});e.controls.add(l);let u=t(s,{orientation:`horizontal`,align:`center`,runover:{},childs:[t(o,{count:()=>r.count,max:()=>r.max,showZero:()=>r.showZero,runover:{},childs:[]}),t(o,{count:()=>r.count,max:()=>r.max,showZero:()=>r.showZero,variant:`subtle`,runover:{},childs:[]}),t(o,{count:()=>r.count,dot:!0,label:`Something new`,runover:{},childs:[]})]});e.controls.add(u)}}})}function b(){let i=n({unread:4}),a=new o({text:`Beta`,tone:`info`,variant:`subtle`});return e({initializeComponent:e=>{{let n=t(`span`,{initializeComponent:e=>{let n=t(`text`,{initializeComponent:e=>{e.setText(`Inbox `)}},1);e.controls.add(n);let r=t(o,{count:()=>i.unread,label:()=>`${i.unread} unread`,runover:{},childs:[]});e.controls.add(r)}},1);e.controls.add(n);let s=t(r,{text:`Add one`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>i.unread++)}},childs:[]});e.controls.add(s);let c=t(r,{text:`Read all`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>i.unread=0)}},childs:[]});e.controls.add(c);let l=t(`span`,{onConfig:e=>e.controls.add(a),initializeComponent:e=>{let n=t(`text`,{initializeComponent:e=>{e.setText(`Search `)}},1);e.controls.add(n)}});e.controls.add(l)}}})}var x=[`top-end`,`top-start`,`bottom-end`,`bottom-start`];function S(){return t(s,{orientation:`horizontal`,wrap:!0,align:`center`,gap:`xl`,runover:{},childs:[t({initializeComponent:e=>{e.bindings.list(()=>x??[],e=>t(r,{indexkey:()=>e,text:e,variant:`outline`,runover:{},childs:[t(o,{count:7,position:e,runover:{},childs:[]})]}))}}),t(`span`,{ref:e=>o.attach(e,{dot:!0,tone:`danger`,label:`New notifications`}),initializeComponent:e=>{let n=t(`text`,{initializeComponent:e=>{e.setText(`Notifications`)}},1);e.controls.add(n)}})]})}var C=[`sm`,`md`,`lg`];function w(){return e({initializeComponent:e=>{e.bindings.list(()=>C??[],e=>t(s,{indexkey:()=>e,orientation:`horizontal`,align:`center`,runover:{},childs:[t(o,{text:e,size:e,runover:{},childs:[]}),t(o,{count:42,size:e,variant:`subtle`,runover:{},childs:[]}),t(o,{dot:!0,size:e,runover:{},childs:[]})]}))}})}var T=[`standard`,`accent`,`info`,`success`,`caution`,`danger`],E=[`solid`,`subtle`,`outline`];function D(){return t(s,{runover:{},childs:[t({initializeComponent:e=>{e.bindings.list(()=>E??[],e=>t(s,{indexkey:()=>e,orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t({initializeComponent:n=>{n.bindings.list(()=>T??[],n=>t(o,{indexkey:()=>n,text:n,tone:n,variant:e,runover:{},childs:[]}))}})]}))}})]})}var O=p(Object.assign({"./examples/Counts.tsx":m,"./examples/OnCorner.tsx":h,"./examples/Programmatic.tsx":g,"./examples/Sizes.tsx":_,"./examples/Tones.tsx":v})),k=[[`text`,"`Bind<string>`","`''`","Short text, shown when there is no `count`."],[`count`,"`Bind<number | null>`","`null`","A count formatted in the kit language. Above `max`, it shows `max+`."],[`max`,"`Bind<number>`","`99`",`The highest count shown in full.`],[`showZero`,"`Bind<boolean>`","`false`",`Shows a count of 0. Without it, the badge hides at 0.`],[`dot`,"`Bind<boolean>`","`false`",`Shows a dot only, indicating that something is present.`],[`tone`,"`Bind<BadgeTone>`",`Set by the design language`,"`standard`, `accent`, `info`, `success`, `caution` or `danger`. Material uses `danger` for counts, and the other design languages use `accent`."],[`variant`,"`Bind<BadgeVariant>`","Set by the design language (`solid`)","`solid`, `subtle`, `outline`."],[`size`,"`Bind<ControlSize>`","`'md'`","`sm`, `md`, `lg`."],[`position`,"`Bind<BadgePosition | null>`","`null`","`top-end`, `top-start`, `bottom-end` or `bottom-start`: the corner of the container, which becomes its anchor. `start` and `end` follow the writing direction."],[`label`,"`Bind<string>`","`''`",`The text announced by screen readers (“3 unread messages”). Without it, they read the badge text.`],[`visible, tabStop`,`see Control`,``,`Properties shared by all controls.`]],A=[[`every prop above`,`read/write`,`Accepts a value or a function, the same as the prop.`],[`shownText`,`read-only`,"The current display text: the formatted count (`99+`), otherwise the text, or `''` for a dot."]],j=[[`Badge.attach(target, props?)`,"`Badge`","Places a badge on a corner of a component (`top-end` unless `props` specifies otherwise). The badge becomes a child of the component and is disposed with it."]],M=[[`Text`,`A badge is read in place, as part of its container.`],[`label`,'With a label, the badge is an image with that name (`role="img"`), so a count can describe what it counts.'],[`Dot`,"Without a label, a dot is hidden from screen readers (`aria-hidden`). Give it a label when it conveys information."],[`Colour`,`Do not rely on tone alone to convey meaning. Pair it with text or a label.`]],N=[[`.mx-badge`,"The badge. `data-tone`, `data-variant`, `data-size`, `data-position`, `data-dot`, `data-empty`."],[`.mx-badge-anchor`,"The element a corner badge is attached to (`position: relative`)."]],P=[[`badge.badge`,"Unit: the badge at rest (solid, standard), in each appearance and tone (`accent` … `danger`, `subtle-*`, `outline-*`) and as a `dot`."],[`badge.height.*, badge.dot-size.*, badge.font-size.*, badge.padding.*`,`The badge and the dot, per size.`],[`badge.offset`,`The offset of a corner badge from the corner.`],[`badge.tone, badge.variant`,`The default tone and appearance.`]];function F(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(d,{text:`A short text, count or dot, shown inline or on the corner of a button, avatar or icon. A count above its maximum displays as “99+”, and a count of zero is hidden.`,runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(l,{anchor:`import`,title:`Import`,runover:{},childs:[t(c,{code:`
import { Badge } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(l,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(d,{text:"Every prop accepts a value or a function. When you create the component with `new`, set the same properties programmatically.",runover:{},childs:[]});e.controls.add(n)}},1),t(u,{files:O(`Programmatic.tsx`),runover:{},childs:[t(b,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(l,{anchor:`tones`,title:`Tones and appearance`,runover:{},childs:[t(u,{files:O(`Tones.tsx`),runover:{},childs:[t(D,{runover:{},childs:[]})]})]});e.controls.add(a);let o=t(l,{anchor:`counts`,title:`Counts and dots`,runover:{},childs:[t(u,{files:O(`Counts.tsx`),runover:{},childs:[t(y,{runover:{},childs:[]})]})]});e.controls.add(o);let s=t(l,{anchor:`corner`,title:`Corner placement`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(d,{text:"`position` places the badge on a corner of its container. `Badge.attach` does the same programmatically on any component.",runover:{},childs:[]});e.controls.add(n)}},1),t(u,{files:O(`OnCorner.tsx`),runover:{},childs:[t(S,{runover:{},childs:[]})]})]});e.controls.add(s);let p=t(l,{anchor:`sizes`,title:`Sizes`,runover:{},childs:[t(u,{files:O(`Sizes.tsx`),runover:{},childs:[t(w,{runover:{},childs:[]})]})]});e.controls.add(p);let m=t(l,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(f,{head:[`Topic`,`Details`],rows:M,runover:{},childs:[]})]});e.controls.add(m);let h=t(l,{anchor:`i18n`,title:`Localization`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(d,{text:"A count is formatted in the kit language (`uiLocale`) and updates when the language changes: “1,234” in English and “1.234” in Turkish.",runover:{},childs:[]});e.controls.add(n)}},1)]});e.controls.add(h);let g=t(l,{anchor:`styling`,title:`Styling`,runover:{},childs:[t(f,{head:[`Hook`,`Description`],rows:N,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(d,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(f,{head:[`Token`,`Description`],rows:P,runover:{},childs:[]})]});e.controls.add(g);let _=t(l,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(d,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(f,{head:[`Prop`,`Type`,`Default`,`Description`],rows:k,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(d,{text:`Properties`,runover:{},childs:[]});e.controls.add(n)}},1),t(f,{head:[`Property`,`Access`,`Description`],rows:A,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(d,{text:`Methods`,runover:{},childs:[]});e.controls.add(n)}},1),t(f,{head:[`Method`,`Returns`,`Description`],rows:j,runover:{},childs:[]})]});e.controls.add(_)}}})}export{F as default};