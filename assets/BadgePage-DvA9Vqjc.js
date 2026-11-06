import{Lt as e,Mt as t,a as n,an as r,g as i,h as a,i as o,n as s,nn as c,r as l,rn as u,st as d,t as f}from"./doc-B1CtlCkV.js";import{t as p}from"./NumberBox-CQk52Tmu.js";import{t as m}from"./Switch-B8uj57cD.js";import{t as h}from"./Stack-AS0iyAxC.js";import{t as g}from"./sources-BXVvOiIY.js";var _=[`count`,`max`,`showZero`,`dot`,`tone`,`variant`,`size`,`position`,`label`],v=[`count`,`max`,`showZero`,`dot`,`label`],y=[`tone`,`variant`,`size`,`position`],b=class n extends d{static attach(e,t={}){let r=new n({position:`top-end`,...t});return e.element.classList.add(`mx-badge-anchor`),e.controls.add(r),r}look=new e(this.element,{tone:`--_badge-tone`,variant:`--_badge-variant`},()=>this.renderLook());constructor(e){super(e);let t=this.props??{};this.element.classList.add(`mx-badge`);for(let e of _)t[e]!==void 0&&this.bindProperty(e,t[e]);this.observeProperty(`text`,()=>this.renderShown());for(let e of v)this.observeProperty(e,()=>this.renderShown());for(let e of y)this.observeProperty(e,()=>this.renderLook());i(this,()=>this.renderShown()),this.motif.setDisposable(this.look.watch())}get count(){let e=this.getProperty(`count`);return typeof e==`number`&&Number.isFinite(e)?e:null}set count(e){this.assignProperty(`count`,e)}get max(){let e=Number(this.getProperty(`max`));return Number.isFinite(e)&&e>0?Math.floor(e):99}set max(e){this.assignProperty(`max`,e)}get showZero(){return!!this.getProperty(`showZero`)}set showZero(e){this.assignProperty(`showZero`,e,Boolean)}get dot(){return!!this.getProperty(`dot`)}set dot(e){this.assignProperty(`dot`,e,Boolean)}get tone(){return this.getProperty(`tone`)??this.look.get(`tone`)??`accent`}set tone(e){this.assignProperty(`tone`,e)}get variant(){return this.getProperty(`variant`)??this.look.get(`variant`)??`solid`}set variant(e){this.assignProperty(`variant`,e)}get size(){return this.getProperty(`size`)??`md`}set size(e){this.assignProperty(`size`,e)}get position(){return this.getProperty(`position`)??null}set position(e){this.assignProperty(`position`,e)}get label(){return this.getProperty(`label`)??``}set label(e){this.assignProperty(`label`,e)}get shownText(){if(this.peekProperty(`dot`))return``;let e=this.peekCount();if(e===null)return this.peekProperty(`text`)??``;let n=this.peekMax(),r=new Intl.NumberFormat(t.locale);return e>n?`${r.format(n)}+`:r.format(e)}onMounted(){this.look.read(),this.renderLook()}peekCount(){let e=this.peekProperty(`count`);return typeof e==`number`&&Number.isFinite(e)?e:null}peekMax(){let e=Number(this.peekProperty(`max`));return Number.isFinite(e)&&e>0?Math.floor(e):99}renderShown(){let e=this.element,t=!!this.peekProperty(`dot`),n=this.peekCount(),r=this.shownText;e.textContent!==r&&(e.textContent=r),e.toggleAttribute(`data-dot`,t);let i=t?n===0&&!this.peekProperty(`showZero`):n===null?!r:n===0&&!this.peekProperty(`showZero`);e.toggleAttribute(`data-empty`,i);let a=this.peekProperty(`label`)??``;a?(e.setAttribute(`role`,`img`),e.setAttribute(`aria-label`,a),e.removeAttribute(`aria-hidden`)):(e.removeAttribute(`role`),e.removeAttribute(`aria-label`),e.toggleAttribute(`aria-hidden`,t))}renderLook(){let e=this.element.dataset;e.tone=this.peekProperty(`tone`)??this.look.get(`tone`)??`accent`,e.variant=this.peekProperty(`variant`)??this.look.get(`variant`)??`solid`,e.size=this.peekProperty(`size`)??`md`;let t=this.peekProperty(`position`)??null;t?e.position=t:delete e.position;let n=this.element.parentElement;n&&t&&(n.classList.add(`mx-badge-anchor`),this.measureAnchor(n))}measureAnchor(e){if(typeof getComputedStyle!=`function`)return;let t=getComputedStyle(e),n=t.direction===`rtl`,r=[[`--_edge-top`,t.borderTopWidth],[`--_edge-bottom`,t.borderBottomWidth],[`--_edge-start`,n?t.borderRightWidth:t.borderLeftWidth],[`--_edge-end`,n?t.borderLeftWidth:t.borderRightWidth]];for(let[e,t]of r){let n=t||`0px`;this.element.style.getPropertyValue(e)!==n&&this.element.style.setProperty(e,n)}}},x=`import { reactive } from '@motifx/core';\r
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
`,S=`import { Badge, Button, Stack, type BadgePosition } from '@motifx-community/ui';\r
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
`,C=`import { reactive } from '@motifx/core';\r
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
`,w=`import { Badge, Stack, type ControlSize } from '@motifx-community/ui';\r
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
`,T=`import { Badge, Stack, type BadgeTone, type BadgeVariant } from '@motifx-community/ui';\r
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
`;function E(){let e=r({count:120,max:99,showZero:!1});return u({initializeComponent:t=>{{let n=c(p,{label:`Count`,min:0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.count,t=>{let n=e;n!=null&&typeof n.count!=`function`&&(n.count=t)})}},childs:[]});t.controls.add(n);let r=c(p,{label:`Max`,min:1,runover:{initializeComponent:t=>{t.bindings.model(()=>e.max,t=>{let n=e;n!=null&&typeof n.max!=`function`&&(n.max=t)})}},childs:[]});t.controls.add(r);let i=c(m,{label:`Show zero`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.showZero,t=>{let n=e;n!=null&&typeof n.showZero!=`function`&&(n.showZero=t)})}},childs:[]});t.controls.add(i);let a=c(h,{orientation:`horizontal`,align:`center`,runover:{},childs:[c(b,{count:()=>e.count,max:()=>e.max,showZero:()=>e.showZero,runover:{},childs:[]}),c(b,{count:()=>e.count,max:()=>e.max,showZero:()=>e.showZero,variant:`subtle`,runover:{},childs:[]}),c(b,{count:()=>e.count,dot:!0,label:`Something new`,runover:{},childs:[]})]});t.controls.add(a)}}})}function D(){let e=r({unread:4}),t=new b({text:`Beta`,tone:`info`,variant:`subtle`});return u({initializeComponent:n=>{{let r=c(`span`,{initializeComponent:t=>{let n=c(`text`,{initializeComponent:e=>{e.setText(`Inbox `)}},1);t.controls.add(n);let r=c(b,{count:()=>e.unread,label:()=>`${e.unread} unread`,runover:{},childs:[]});t.controls.add(r)}},1);n.controls.add(r);let i=c(a,{text:`Add one`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.unread++)}},childs:[]});n.controls.add(i);let o=c(a,{text:`Read all`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.unread=0)}},childs:[]});n.controls.add(o);let s=c(`span`,{onConfig:e=>e.controls.add(t),initializeComponent:e=>{let t=c(`text`,{initializeComponent:e=>{e.setText(`Search `)}},1);e.controls.add(t)}});n.controls.add(s)}}})}var O=[`top-end`,`top-start`,`bottom-end`,`bottom-start`];function k(){return c(h,{orientation:`horizontal`,wrap:!0,align:`center`,gap:`xl`,runover:{},childs:[c({initializeComponent:e=>{e.bindings.list(()=>O??[],e=>c(a,{indexkey:()=>e,text:e,variant:`outline`,runover:{},childs:[c(b,{count:7,position:e,runover:{},childs:[]})]}))}}),c(`span`,{ref:e=>b.attach(e,{dot:!0,tone:`danger`,label:`New notifications`}),initializeComponent:e=>{let t=c(`text`,{initializeComponent:e=>{e.setText(`Notifications`)}},1);e.controls.add(t)}})]})}var A=[`sm`,`md`,`lg`];function j(){return u({initializeComponent:e=>{e.bindings.list(()=>A??[],e=>c(h,{indexkey:()=>e,orientation:`horizontal`,align:`center`,runover:{},childs:[c(b,{text:e,size:e,runover:{},childs:[]}),c(b,{count:42,size:e,variant:`subtle`,runover:{},childs:[]}),c(b,{dot:!0,size:e,runover:{},childs:[]})]}))}})}var M=[`standard`,`accent`,`info`,`success`,`caution`,`danger`],N=[`solid`,`subtle`,`outline`];function P(){return c(h,{runover:{},childs:[c({initializeComponent:e=>{e.bindings.list(()=>N??[],e=>c(h,{indexkey:()=>e,orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[c({initializeComponent:t=>{t.bindings.list(()=>M??[],t=>c(b,{indexkey:()=>t,text:t,tone:t,variant:e,runover:{},childs:[]}))}})]}))}})]})}var F=g(Object.assign({"./examples/Counts.tsx":x,"./examples/OnCorner.tsx":S,"./examples/Programmatic.tsx":C,"./examples/Sizes.tsx":w,"./examples/Tones.tsx":T})),I=[[`text`,"`Bind<string>`","`''`","Short text, shown when there is no `count`."],[`count`,"`Bind<number | null>`","`null`","A count formatted in the kit language. Above `max`, it shows `max+`."],[`max`,"`Bind<number>`","`99`",`The highest count shown in full.`],[`showZero`,"`Bind<boolean>`","`false`",`Shows a count of 0. Without it, the badge hides at 0.`],[`dot`,"`Bind<boolean>`","`false`",`Shows a dot only, indicating that something is present.`],[`tone`,"`Bind<BadgeTone>`",`Set by the design language`,"`standard`, `accent`, `info`, `success`, `caution` or `danger`. Material uses `danger` for counts, and the other design languages use `accent`."],[`variant`,"`Bind<BadgeVariant>`","Set by the design language (`solid`)","`solid`, `subtle`, `outline`."],[`size`,"`Bind<ControlSize>`","`'md'`","`sm`, `md`, `lg`."],[`position`,"`Bind<BadgePosition | null>`","`null`","`top-end`, `top-start`, `bottom-end` or `bottom-start`: the corner of the container, which becomes its anchor. `start` and `end` follow the writing direction."],[`label`,"`Bind<string>`","`''`",`The text announced by screen readers (“3 unread messages”). Without it, they read the badge text.`],[`visible, tabStop`,`see Control`,``,`Properties shared by all controls.`]],L=[[`every prop above`,`read/write`,`Accepts a value or a function, the same as the prop.`],[`shownText`,`read-only`,"The current display text: the formatted count (`99+`), otherwise the text, or `''` for a dot."]],R=[[`Badge.attach(target, props?)`,"`Badge`","Places a badge on a corner of a component (`top-end` unless `props` specifies otherwise). The badge becomes a child of the component and is disposed with it."]],z=[[`Text`,`A badge is read in place, as part of its container.`],[`label`,'With a label, the badge is an image with that name (`role="img"`), so a count can describe what it counts.'],[`Dot`,"Without a label, a dot is hidden from screen readers (`aria-hidden`). Give it a label when it conveys information."],[`Colour`,`Do not rely on tone alone to convey meaning. Pair it with text or a label.`]],B=[[`.mx-badge`,"The badge. `data-tone`, `data-variant`, `data-size`, `data-position`, `data-dot`, `data-empty`."],[`.mx-badge-anchor`,"The element a corner badge is attached to (`position: relative`)."]],V=[[`badge.badge`,"Unit: the badge at rest (solid, standard), in each appearance and tone (`accent` … `danger`, `subtle-*`, `outline-*`) and as a `dot`."],[`badge.height.*, badge.dot-size.*, badge.font-size.*, badge.padding.*`,`The badge and the dot, per size.`],[`badge.offset`,`The offset of a corner badge from the corner.`],[`badge.tone, badge.variant`,`The default tone and appearance.`]];function H(){return u({initializeComponent:e=>{{let t=c(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=c(l,{text:`A short text, count or dot, shown inline or on the corner of a button, avatar or icon. A count above its maximum displays as “99+”, and a count of zero is hidden.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let r=c(o,{anchor:`import`,title:`Import`,runover:{},childs:[c(n,{code:`
import { Badge } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=c(o,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[c(`p`,{initializeComponent:e=>{let t=c(l,{text:"Every prop accepts a value or a function. When you create the component with `new`, set the same properties programmatically.",runover:{},childs:[]});e.controls.add(t)}},1),c(s,{files:F(`Programmatic.tsx`),runover:{},childs:[c(D,{runover:{},childs:[]})]})]});e.controls.add(i);let a=c(o,{anchor:`tones`,title:`Tones and appearance`,runover:{},childs:[c(s,{files:F(`Tones.tsx`),runover:{},childs:[c(P,{runover:{},childs:[]})]})]});e.controls.add(a);let u=c(o,{anchor:`counts`,title:`Counts and dots`,runover:{},childs:[c(s,{files:F(`Counts.tsx`),runover:{},childs:[c(E,{runover:{},childs:[]})]})]});e.controls.add(u);let d=c(o,{anchor:`corner`,title:`Corner placement`,runover:{},childs:[c(`p`,{initializeComponent:e=>{let t=c(l,{text:"`position` places the badge on a corner of its container. `Badge.attach` does the same programmatically on any component.",runover:{},childs:[]});e.controls.add(t)}},1),c(s,{files:F(`OnCorner.tsx`),runover:{},childs:[c(k,{runover:{},childs:[]})]})]});e.controls.add(d);let p=c(o,{anchor:`sizes`,title:`Sizes`,runover:{},childs:[c(s,{files:F(`Sizes.tsx`),runover:{},childs:[c(j,{runover:{},childs:[]})]})]});e.controls.add(p);let m=c(o,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[c(f,{head:[`Topic`,`Details`],rows:z,runover:{},childs:[]})]});e.controls.add(m);let h=c(o,{anchor:`i18n`,title:`Localization`,runover:{},childs:[c(`p`,{initializeComponent:e=>{let t=c(l,{text:"A count is formatted in the kit language (`uiLocale`) and updates when the language changes: “1,234” in English and “1.234” in Turkish.",runover:{},childs:[]});e.controls.add(t)}},1)]});e.controls.add(h);let g=c(o,{anchor:`styling`,title:`Styling`,runover:{},childs:[c(f,{head:[`Hook`,`Description`],rows:B,runover:{},childs:[]}),c(`h3`,{initializeComponent:e=>{let t=c(l,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),c(f,{head:[`Token`,`Description`],rows:V,runover:{},childs:[]})]});e.controls.add(g);let _=c(o,{anchor:`api`,title:`API reference`,runover:{},childs:[c(`h3`,{initializeComponent:e=>{let t=c(l,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),c(f,{head:[`Prop`,`Type`,`Default`,`Description`],rows:I,runover:{},childs:[]}),c(`h3`,{initializeComponent:e=>{let t=c(l,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),c(f,{head:[`Property`,`Access`,`Description`],rows:L,runover:{},childs:[]}),c(`h3`,{initializeComponent:e=>{let t=c(l,{text:`Methods`,runover:{},childs:[]});e.controls.add(t)}},1),c(f,{head:[`Method`,`Returns`,`Description`],rows:R,runover:{},childs:[]})]});e.controls.add(_)}}})}export{H as default};