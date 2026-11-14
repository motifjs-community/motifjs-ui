import{At as e,Bt as t,C as n,Et as r,F as i,Fn as a,H as o,M as s,N as c,Ot as l,Pt as u,Q as d,Qn as f,Rt as p,Zn as m,at as h,er as g,kt as _,n as v,nt as ee,or as y,ot as b,q as x,qn as te,rt as S,zt as ne}from"./next-id-CtzpBrBT.js";import{t as C}from"./TextBox-iHQY3j6o.js";import{n as w,t as T}from"./set-padding-FGJ9Ptsy.js";import{t as E}from"./Panel-D_MXZsSp.js";import{n as D,r as O,t as k}from"./Stack-wRt1e9tO.js";import{t as A}from"./SplitContainer-DGxLmdD6.js";import{a as j,i as M,n as N,r as P,t as F}from"./docs-B_LZlyP5.js";import{t as re}from"./sources-BXVvOiIY.js";import{t as ie}from"./kit-texts-BMQUznlf.js";function ae(e){let t=[],n=0,r=``;for(let i of e)i===`(`?n++:i===`)`&&n--,/\s/.test(i)&&n===0?(r&&t.push(r),r=``):r+=i;return r&&t.push(r),t}function oe(e){if(typeof e==`number`||/^-?\d*\.?\d+$/.test(e))return`${e}px`;let t=/^(\d*\.?\d*)\*$/.exec(e);return t?`${t[1]||`1`}fr`:e}function I(e){return e==null?``:typeof e==`number`?e>0?`repeat(${Math.floor(e)}, minmax(0, 1fr))`:``:(typeof e==`string`?ae(e.trim()):e).map(oe).join(` `)}var se=[`rows`,`columns`,`gap`,`rowGap`,`columnGap`,`padding`,`autoRows`,`autoColumns`,`flow`,`align`,`justify`,`inline`],L=[`row`,`column`,`rowSpan`,`columnSpan`],ce=[`grid-row-start`,`grid-row-end`,`grid-column-start`,`grid-column-end`],R=Symbol(`mx.grid`);function z(e){return typeof e==`number`||typeof e==`string`?String(e):``}function B(e){let t=Number(e);return t>1?`span ${Math.floor(t)}`:``}var V=class extends n{constructor(t){super(`div`,t);let n=this.props??{};this.class.add(`mx-grid`),this.observeProperty(`rows`,e=>this.writeStyle(`grid-template-rows`,I(e))),this.observeProperty(`columns`,e=>this.writeStyle(`grid-template-columns`,I(e))),this.observeProperty(`autoRows`,e=>this.writeStyle(`grid-auto-rows`,I(typeof e==`number`?[e]:e))),this.observeProperty(`autoColumns`,e=>this.writeStyle(`grid-auto-columns`,I(typeof e==`number`?[e]:e))),this.observeProperty(`gap`,e=>D(this,`--_gap`,e)),this.observeProperty(`rowGap`,e=>D(this,`--_row-gap`,e)),this.observeProperty(`columnGap`,e=>D(this,`--_column-gap`,e)),this.observeProperty(`padding`,e=>T(this,e)),this.observeProperty(`flow`,e=>this.writeStyle(`grid-auto-flow`,e??``)),this.observeProperty(`align`,t=>e(this,`data-align`,t??`stretch`)),this.observeProperty(`justify`,t=>e(this,`data-justify`,t??`stretch`)),this.observeProperty(`inline`,e=>_(this,`data-inline`,!!e));for(let e of se)n[e]!==void 0&&this.bindProperty(e,n[e]);this.settings,this.childs?.length&&this.controls.add(...this.childs)}get rows(){return this.getProperty(`rows`)}set rows(e){this.assignProperty(`rows`,e)}get columns(){return this.getProperty(`columns`)}set columns(e){this.assignProperty(`columns`,e)}get gap(){return this.getProperty(`gap`)}set gap(e){this.assignProperty(`gap`,e)}get rowGap(){return this.getProperty(`rowGap`)}set rowGap(e){this.assignProperty(`rowGap`,e)}get columnGap(){return this.getProperty(`columnGap`)}set columnGap(e){this.assignProperty(`columnGap`,e)}get padding(){return this.getProperty(`padding`)}set padding(e){this.assignProperty(`padding`,e)}get autoRows(){return this.getProperty(`autoRows`)}set autoRows(e){this.assignProperty(`autoRows`,e)}get autoColumns(){return this.getProperty(`autoColumns`)}set autoColumns(e){this.assignProperty(`autoColumns`,e)}get flow(){return this.getProperty(`flow`)??`row`}set flow(e){this.assignProperty(`flow`,e)}get align(){return this.getProperty(`align`)??`stretch`}set align(e){this.assignProperty(`align`,e)}get justify(){return this.getProperty(`justify`)??`stretch`}set justify(e){this.assignProperty(`justify`,e)}get inline(){return!!this.getProperty(`inline`)}set inline(e){this.assignProperty(`inline`,e,Boolean)}cellOf(e){let t={};for(let n of L){let r=this.settings.get(e,n);r!==void 0&&(t[n]=r)}return t}setCell(e,t){for(let n of L)t[n]!==void 0&&this.settings.set(e,n,t[n])}get settings(){let e=this;return e[R]?e[R]:(e[R]=new O(this,L,{changed:e=>{let t=t=>this.settings.get(e,t);this.place(e,`grid-row-start`,z(t(`row`))),this.place(e,`grid-row-end`,B(t(`rowSpan`))),this.place(e,`grid-column-start`,z(t(`column`))),this.place(e,`grid-column-end`,B(t(`columnSpan`)))},left:e=>{for(let t of ce)r(e,t,``)}}),e[R].addPresent())}place(e,t,n){r(e,t,n)}writeStyle(e,t){this.place(this,e,t)}},H=[`collapsible`,`collapsed`,`padding`,`gap`,`variant`],U=Symbol(`mx.group-box`),W=class extends n{constructor(t){super(`fieldset`,t);let n=this.props??{},r=this.parts;n.text===void 0&&n.title!==void 0&&this.bindProperty(`text`,n.title),this.observeProperty(`text`,e=>this.renderTitle(e)),this.observeProperty(`padding`,e=>T(this,e)),this.observeProperty(`gap`,e=>D(this,`--_gap`,e)),this.observeProperty(`variant`,t=>e(this,`data-variant`,t??`outline`)),this.observeProperty(`collapsible`,()=>this.renderToggle()),this.observeProperty(`collapsed`,e=>{this.renderCollapsed(),r.ready&&this.peekProperty(`collapsible`)&&r.toggled.fire({collapsed:!!e,byUser:r.byUser,source:this})});for(let e of H)n[e]!==void 0&&this.bindProperty(e,n[e]);n.onToggled&&this.onToggled(n.onToggled),r.ready=!0,this.childs?.length&&this.controls.add(...this.childs),this.motif.setDisposable(()=>r.toggled.dispose())}get title(){return this.text}set title(e){this.text=e}get collapsible(){return!!this.getProperty(`collapsible`)}set collapsible(e){this.assignProperty(`collapsible`,e,Boolean)}get collapsed(){return!!this.getProperty(`collapsed`)}set collapsed(e){this.assignProperty(`collapsed`,e,Boolean)}get padding(){return this.getProperty(`padding`)}set padding(e){this.assignProperty(`padding`,e)}get gap(){return this.getProperty(`gap`)}set gap(e){this.assignProperty(`gap`,e)}get variant(){return this.getProperty(`variant`)??`outline`}set variant(e){this.assignProperty(`variant`,e)}get onToggled(){return this.parts.toggled.event}get legendPart(){return this.parts.legend}get canFocus(){return this.isEnabled&&b(this)&&(!!this.parts.toggle||ee(this))}focus(){if(!this.isEnabled)return!1;this.isCollapsed&&this.change(!1);let e=this.parts;return this.focusFirstStop(this.controls.items)?!0:e.toggle?(d(e.toggle),h(e.toggle)):!1}onAccessKey(){return this.focus()}get isCollapsed(){return!!this.peekProperty(`collapsible`)&&!!this.peekProperty(`collapsed`)}get parts(){let e=this;return e[U]??=this.createParts()}createParts(){this.class.add(`mx-group-box`);let e=ne(this,this.controls.items[0]??null,`legend`,`mx-group-box__legend`);return{legend:e,title:p(e,`span`,`mx-group-box__title`),toggle:null,byUser:!1,ready:!1,toggled:new te}}focusFirstStop(e){for(let t of e)if(!(t===this.parts.legend||t instanceof n&&t.isWindow)&&(a(t.element)?this.focusStop(t):this.focusFirstStop(t.controls.items)))return!0;return!1}focusStop(e){return(!(e instanceof n)||y(()=>e.tabStop))&&o(e)&&(d(e),h(e))?!0:x(e,`stop`)}change(e){let t=this.parts;t.byUser=!0;try{this.changeProperty(`collapsed`,e)}finally{t.byUser=!1}}renderTitle(e){let t=s(e??``);this.setAccessKey(t.key),c(this.parts.title,t),l(this.parts.legend,!!t.text)}renderToggle(){let e=this.parts,n=!!this.peekProperty(`collapsible`);if(_(this,`data-collapsible`,n),n&&!e.toggle){let t=p(e.legend,`button`,`mx-group-box__toggle`);t.attr.add({type:`button`}),u(t,`chevron-down`,`mx-group-box__chevron`),t.controls.add(e.title),t.motif.on(`click`,()=>this.change(!this.peekProperty(`collapsed`))),e.toggle=t}else!n&&e.toggle&&(e.legend.controls.add(e.title),t(e.toggle),e.toggle=null);this.renderCollapsed()}renderCollapsed(){let t=this.parts,n=this.isCollapsed;n&&t.toggle&&S(this)&&!S(t.legend)&&d(t.toggle),_(this,`data-collapsed`,n),t.toggle&&e(t.toggle,`aria-expanded`,String(!n))}},G=[`gap`,`padding`],le=[`dock`,`left`,`top`,`right`,`bottom`],ue=new Set([`top`,`bottom`,`start`,`end`,`fill`,`float`]),K=[[`left`,`left`],[`top`,`inset-block-start`],[`right`,`right`],[`bottom`,`inset-block-end`]],q={top:`margin-block-end`,bottom:`margin-block-start`,start:`margin-inline-end`,end:`margin-inline-start`},J=Symbol(`mx.dock-panel`);function de(e){return typeof e==`number`?`${e}px`:typeof e==`string`?e:``}var fe=class extends n{constructor(e){super(`div`,e);let t=this.props??{};this.class.add(`mx-dock-panel`),this.observeProperty(`gap`,()=>this.arrange()),this.observeProperty(`padding`,e=>T(this,e));for(let e of G)t[e]!==void 0&&this.bindProperty(e,t[e]);this.settings,this.childs?.length&&this.controls.add(...this.childs)}get gap(){return this.getProperty(`gap`)}set gap(e){this.assignProperty(`gap`,e)}get padding(){return this.getProperty(`padding`)}set padding(e){this.assignProperty(`padding`,e)}dockOf(e){let t=this.settings.get(e,`dock`);return t&&ue.has(t)?t:`fill`}setDock(e,t){this.settings.set(e,`dock`,t)}setAnchors(e,t){for(let[n]of K)t[n]!==void 0&&this.settings.set(e,n,t[n])}get settings(){let e=this;return e[J]?e[J]:(e[J]=new O(this,le,{changed:()=>this.arrange(),left:e=>{this.clear(e),this.arrange()}}),e[J].addPresent())}arrange(){let t=this.settings.children,n=t.map(e=>this.dockOf(e)),i=e=>n.filter(t=>t===e).length,[a,o,s,c]=[i(`top`),i(`bottom`),i(`start`),i(`end`)],l=(e,t)=>[...Array(e).fill(`auto`),`minmax(0, 1fr)`,...Array(t).fill(`auto`)].join(` `);r(this,`grid-template-rows`,l(a,o)),r(this,`grid-template-columns`,l(s,c));let u=w(this.peekProperty(`gap`)),[d,f,p,m]=[0,0,0,0];t.forEach((t,r)=>{let i=n[r],l=(e,t)=>`${e+1} / ${-(t+1)}`,h=``,g=``;i===`top`?[h,g]=[`${d+1} / ${++d+1}`,l(p,m)]:i===`bottom`?[h,g]=[`${-(f+2)} / ${-++f}`,l(p,m)]:i===`start`?[h,g]=[l(d,f),`${p+1} / ${++p+1}`]:i===`end`?[h,g]=[l(d,f),`${-(m+2)} / ${-++m}`]:i===`fill`&&([h,g]=[l(a,o),l(s,c)]),e(t,`data-mx-dock`,i),this.write(t,`grid-row`,h),this.write(t,`grid-column`,g);for(let[e,n]of Object.entries(q))this.write(t,n,e===i?u:``);for(let[e,n]of K)this.write(t,n,i===`float`?de(this.settings.get(t,e)):``)})}clear(t){e(t,`data-mx-dock`,null);for(let e of[`grid-row`,`grid-column`,...Object.values(q),...K.map(([,e])=>e)])this.write(t,e,``)}write(e,t,n){r(e,t,n)}},pe=`import { reactive } from '@motifx/core';\r
import { Button, DockPanel, Panel, Stack, TextBox, type Dock } from '@motifx-community/ui';\r
\r
const FOLDERS = ['Inbox', 'Drafts', 'Sent', 'Archive', 'Spam', 'Trash'];\r
const FRAME = 'border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg);';\r
const BAR = 'background: var(--mx-color-bg-bar);';\r
const LAYER = 'background: var(--mx-color-bg-layer);';\r
\r
/** A mail app laid out with DockPanel: a header, a sidebar that changes sides, a status bar, a float button and a panel added programmatically. */\r
export default function AppShell() {\r
  const s = reactive({ side: 'start' as Dock, messages: 3 });\r
  let shell: DockPanel | null = null;\r
  let notes: Panel | null = null;\r
\r
  const toggleNotes = () => {\r
    if (notes) {\r
      shell?.controls.remove(notes);\r
      notes = null;\r
      return;\r
    }\r
    notes = new Panel({ dock: 'end', padding: 'sm' });\r
    notes.element.setAttribute('style', \`inline-size: 9rem; \${LAYER}\`);\r
    notes.element.classList.add('layout-notes');\r
    notes.controls.add(<span>Notes, added programmatically.</span>);\r
    shell?.controls.add(notes);\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text={() => \`Sidebar: \${s.side}\`} size="sm" variant="outline" onclick={() => (s.side = s.side === 'start' ? 'end' : 'start')} />\r
        <Button text="Notes panel programmatically" size="sm" variant="outline" onclick={toggleNotes} />\r
      </Stack>\r
      <DockPanel class="layout-shell" ref={(c: DockPanel) => (shell = c)} style={\`block-size: 22rem; inline-size: 100%; overflow: hidden; \${FRAME}\`}>\r
        <Stack dock="top" orientation="horizontal" align="center" gap="sm" padding="xs sm" style={BAR}>\r
          <strong>Mail</strong>\r
          <TextBox label="Search mail" labelMode="hidden" placeholder="Search" grow />\r
          <Button text="New" tone="accent" onclick={() => s.messages++} />\r
        </Stack>\r
        <Panel class="layout-side" dock={() => s.side} scrollable="vertical" padding="xs" text="Mailboxes" style={\`inline-size: 11rem; \${LAYER}\`}>\r
          <Stack gap="xxs">\r
            {FOLDERS.map((f) => (\r
              <Button key={f} text={f} variant="ghost" stretch />\r
            ))}\r
          </Stack>\r
        </Panel>\r
        <Stack class="layout-status" dock="bottom" orientation="horizontal" justify="space-between" padding="xxs sm" style={BAR}>\r
          <span>Ready</span>\r
          <span>{() => \`\${s.messages} messages\`}</span>\r
        </Stack>\r
        <Panel class="layout-content" text="Message" scrollable padding="md">\r
          <h3 style="margin-block-start: 0">Welcome</h3>\r
          <p>The header, the folders and the status bar are docked; this panel fills the rest and scrolls on its own.</p>\r
          <p>Switch the sidebar to the other side, or add a panel programmatically: the layout follows at once.</p>\r
        </Panel>\r
        <Button class="layout-help" dock="float" right={16} bottom={48} text="Help" variant="outline" />\r
      </DockPanel>\r
    </>\r
  );\r
}\r
`,me=`import { reactive } from '@motifx/core';\r
import { Button, Grid, Stack, TextBox } from '@motifx-community/ui';\r
\r
/** A form on a Grid whose column count follows state; Street and the buttons span columns. */\r
export default function GridForm() {\r
  const s = reactive({ columns: 2 });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Columns">\r
        {[1, 2, 3].map((n) => (\r
          <Button key={n} text={\`\${n} column\${n > 1 ? 's' : ''}\`} size="sm" variant={() => (s.columns === n ? 'solid' : 'ghost')} aria-pressed={() => s.columns === n} onclick={() => (s.columns = n)} />\r
        ))}\r
      </Stack>\r
      <Grid class="layout-form" columns={() => s.columns} gap="sm" align="end" style="inline-size: 100%">\r
        <TextBox label="First name" stretch />\r
        <TextBox label="Last name" stretch />\r
        <TextBox label="Street" stretch column={1} columnSpan={() => Math.min(2, s.columns)} />\r
        <TextBox label="City" stretch />\r
        <TextBox label="Postal code" stretch />\r
        <Stack orientation="horizontal" justify="end" gap="xs" column="1" columnSpan={() => s.columns}>\r
          <Button text="Cancel" variant="ghost" />\r
          <Button text="Save" tone="accent" />\r
        </Stack>\r
      </Grid>\r
    </>\r
  );\r
}\r
`,he=`import { Grid, Panel } from '@motifx-community/ui';\r
\r
/** A fixed column and two flexible ones, a fixed row, and a child placed by row and column. */\r
export default function GridTracks() {\r
  return (\r
    <Grid class="layout-tracks" columns="120 * 2*" rows="auto 4rem" gap="xs" style="inline-size: 100%">\r
      <Panel variant="card" padding="xs">120px</Panel>\r
      <Panel variant="card" padding="xs">1fr</Panel>\r
      <Panel variant="card" padding="xs">2fr</Panel>\r
      <Panel variant="card" padding="xs" column={2} columnSpan={2}>\r
        row 2, columns 2–3\r
      </Panel>\r
    </Grid>\r
  );\r
}\r
`,ge=`import { reactive } from '@motifx/core';\r
import { Button, Grid, GroupBox, TextBox } from '@motifx-community/ui';\r
\r
/** A group with an access key that is enabled from state, and one that opens and closes. */\r
export default function GroupBoxes() {\r
  const s = reactive({ editing: true });\r
  return (\r
    <>\r
      <Button text="Enabled" size="sm" variant="outline" toggle x-model={() => s.editing} />\r
      <Grid columns="* *" gap="md" style="inline-size: 100%" align="start">\r
        <GroupBox title="&Address" enabled={() => s.editing}>\r
          <TextBox label="Street" stretch />\r
          <TextBox label="City" stretch />\r
        </GroupBox>\r
        <GroupBox title="More &options" collapsible collapsed>\r
          <TextBox label="Coupon" stretch />\r
          <TextBox label="Gift note" stretch />\r
        </GroupBox>\r
      </Grid>\r
    </>\r
  );\r
}\r
`,_e=`import { reactive } from '@motifx/core';\r
import { Button, uiLocale } from '@motifx-community/ui';\r
import { kitTexts } from '../../../shared/kit-texts';\r
\r
/** Switches the texts of the kit; the splitters on the page take the new name at once. */\r
export default function Localization() {\r
  const s = reactive({ lang: 'en' });\r
  const toggle = () => {\r
    s.lang = s.lang === 'en' ? 'tr' : 'en';\r
    void uiLocale.use(s.lang);\r
  };\r
  return (\r
    <>\r
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />\r
      <span>\r
        The splitter is named <output class="layout-resize">{() => kitTexts.strings.resize}</output>\r
      </span>\r
    </>\r
  );\r
}\r
`,ve=`import { reactive } from '@motifx/core';\r
import { Button, Panel, SplitContainer, Stack, type SplitPanel, type SplitPosition } from '@motifx-community/ui';\r
\r
const FOLDERS = ['Inbox', 'Drafts', 'Sent', 'Archive', 'Spam', 'Trash'];\r
const FRAME = 'border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg);';\r
const LAYER = 'background: var(--mx-color-bg-layer);';\r
\r
/** A split container inside another: a position bound with x-model, minimum sizes, a fixed pane, and hiding a pane programmatically. */\r
export default function NestedSplit() {\r
  const s = reactive({ tree: 180 as SplitPosition, fixed: 'first' as SplitPanel, log: '' });\r
  let outer: SplitContainer | null = null;\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Hide folders" size="sm" variant="outline" onclick={() => outer?.collapse('first')} />\r
        <Button text="Restore" size="sm" variant="outline" onclick={() => outer?.restore()} />\r
        <Button text={() => \`fixedPanel: \${s.fixed}\`} size="sm" variant="outline" onclick={() => (s.fixed = s.fixed === 'first' ? 'none' : 'first')} />\r
        <output class="layout-split-out">{() => \`position: \${s.tree}\`}</output>\r
        <output class="layout-split-log">{() => s.log}</output>\r
      </Stack>\r
      <SplitContainer\r
        class="layout-split"\r
        ref={(c: SplitContainer) => (outer = c)}\r
        position={180}\r
        fixedPanel={() => s.fixed}\r
        firstMinSize={120}\r
        secondMinSize={200}\r
        x-model={() => s.tree}\r
        onSplitterMoved={(e: { position: SplitPosition; byUser: boolean; collapsed: SplitPanel }) => (s.log = \`moved\${e.byUser ? ' by you' : ''}\${e.collapsed !== 'none' ? \`, \${e.collapsed} hidden\` : ''}\`)}\r
        style={\`block-size: 20rem; inline-size: 100%; \${FRAME}\`}\r
      >\r
        <Panel text="Folders" scrollable padding="sm" style={LAYER}>\r
          <Stack gap="xxs">\r
            {FOLDERS.map((f) => (\r
              <Button key={f} text={f} variant="ghost" stretch />\r
            ))}\r
          </Stack>\r
        </Panel>\r
        <SplitContainer orientation="vertical" position="65%" secondMinSize={48}>\r
          <Panel text="Editor" scrollable padding="sm">\r
            <p>Drag the splitters, or Tab to one and use the arrow keys, Home, End and Enter.</p>\r
          </Panel>\r
          <Panel text="Output" scrollable padding="sm" style={LAYER}>\r
            <code>Build finished in 1.2 s.</code>\r
          </Panel>\r
        </SplitContainer>\r
      </SplitContainer>\r
    </>\r
  );\r
}\r
`,ye=`import { Panel } from '@motifx-community/ui';\r
\r
/** A named panel that scrolls, a card and an outline. */\r
export default function Panels() {\r
  return (\r
    <>\r
      <Panel class="layout-scroll" text="Terms" scrollable="vertical" padding="md" variant="outline" style="block-size: 8rem; inline-size: 18rem">\r
        <p>1. The service is offered as it is.</p>\r
        <p>2. You keep the rights to what you upload.</p>\r
        <p>3. We may change these terms with a notice of 30 days.</p>\r
        <p>4. Either side may end the agreement at any time.</p>\r
        <p>5. The law of the place you live in applies.</p>\r
      </Panel>\r
      <Panel variant="card" padding="md">\r
        A card\r
      </Panel>\r
      <Panel variant="outline" padding="md">\r
        An outline\r
      </Panel>\r
    </>\r
  );\r
}\r
`,be=`import type { Component } from '@motifx/core';\r
import { Button, Grid, Stack, TextBox } from '@motifx-community/ui';\r
\r
/** Buttons added to a Stack with \`controls.add\`, and a Grid built with \`new\`. */\r
export default function Programmatic() {\r
  let added = 0;\r
  let bar: Stack | null = null;\r
\r
  const addButton = () => bar?.controls.add(new Button({ text: \`Button \${++added}\`, variant: 'outline', grow: added % 3 === 0 }));\r
\r
  const buildProgrammatic = (host: Component<HTMLDivElement>) => {\r
    const grid = new Grid({ columns: '* *', gap: 'xs' });\r
    grid.element.classList.add('layout-coded');\r
    grid.controls.add(\r
      new TextBox({ label: 'From', stretch: true }),\r
      new TextBox({ label: 'To', stretch: true }),\r
      new TextBox({ label: 'Subject', stretch: true, columnSpan: 2 }),\r
    );\r
    host.controls.add(grid);\r
  };\r
\r
  return (\r
    <>\r
      <Stack ref={(c: Stack) => (bar = c)} orientation="horizontal" gap="sm" wrap align="center" style="inline-size: 100%">\r
        <Button text="Add a button" tone="accent" onclick={addButton} />\r
      </Stack>\r
      <div style="inline-size: 100%" ref={(c: Component<HTMLDivElement>) => buildProgrammatic(c)} />\r
    </>\r
  );\r
}\r
`,xe=`import { reactive } from '@motifx/core';\r
import { Button, Grid, Panel, Stack } from '@motifx-community/ui';\r
\r
const STEPS = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;\r
const FRAME = 'border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg);';\r
\r
/** A gap from the spacing steps, a gap in pixels with a two-value padding, and a gap as a CSS length. */\r
export default function Spacing() {\r
  const s = reactive({ gap: 'sm' as string });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Gap">\r
        {STEPS.map((step) => (\r
          <Button key={step} text={step} size="sm" variant={() => (s.gap === step ? 'solid' : 'ghost')} aria-pressed={() => s.gap === step} onclick={() => (s.gap = step)} />\r
        ))}\r
      </Stack>\r
      <Stack class="layout-gap-demo" orientation="horizontal" gap={() => s.gap} padding="xs">\r
        <Panel variant="card" padding="sm">A</Panel>\r
        <Panel variant="card" padding="sm">B</Panel>\r
        <Panel variant="card" padding="sm">C</Panel>\r
      </Stack>\r
      <Stack orientation="horizontal" gap={12} padding="xs md" style={FRAME}>\r
        <Panel variant="card" padding="sm">12 pixels apart</Panel>\r
        <Panel variant="card" padding="sm">padding xs md</Panel>\r
      </Stack>\r
      <Grid columns="* *" gap="1.5rem" style="inline-size: 100%">\r
        <Panel variant="card" padding="sm">1.5rem apart</Panel>\r
        <Panel variant="card" padding="sm">in a Grid</Panel>\r
      </Grid>\r
    </>\r
  );\r
}\r
`,Se=`import { reactive } from '@motifx/core';\r
import { Button, Panel, Stack, TextBox, type LayoutAlign, type StackJustify } from '@motifx-community/ui';\r
\r
const ALIGNS: LayoutAlign[] = ['start', 'center', 'end', 'stretch', 'baseline'];\r
const JUSTIFIES: StackJustify[] = ['start', 'center', 'end', 'space-between', 'space-evenly'];\r
const FRAME = 'border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg);';\r
\r
/** A Stack's orientation, align, justify, wrap and reverse, and a child that grows. */\r
export default function StackOptions() {\r
  const s = reactive({\r
    orientation: 'horizontal' as 'horizontal' | 'vertical',\r
    align: 'center' as LayoutAlign,\r
    justify: 'start' as StackJustify,\r
    wrap: false,\r
    reverse: false,\r
  });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Orientation">\r
        {(['horizontal', 'vertical'] as const).map((o) => (\r
          <Button key={o} text={o} size="sm" variant={() => (s.orientation === o ? 'solid' : 'ghost')} aria-pressed={() => s.orientation === o} onclick={() => (s.orientation = o)} />\r
        ))}\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Align">\r
        {ALIGNS.map((a) => (\r
          <Button key={a} text={a} size="sm" variant={() => (s.align === a ? 'solid' : 'ghost')} aria-pressed={() => s.align === a} onclick={() => (s.align = a)} />\r
        ))}\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Justify">\r
        {JUSTIFIES.map((j) => (\r
          <Button key={j} text={j} size="sm" variant={() => (s.justify === j ? 'solid' : 'ghost')} aria-pressed={() => s.justify === j} onclick={() => (s.justify = j)} />\r
        ))}\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="wrap" size="sm" toggle x-model={() => s.wrap} variant="outline" />\r
        <Button text="reverse" size="sm" toggle x-model={() => s.reverse} variant="outline" />\r
      </Stack>\r
      <Stack\r
        class="layout-stack-demo"\r
        orientation={() => s.orientation}\r
        align={() => s.align}\r
        justify={() => s.justify}\r
        wrap={() => s.wrap}\r
        reverse={() => s.reverse}\r
        gap="sm"\r
        padding="sm"\r
        style={\`inline-size: 100%; min-block-size: 10rem; \${FRAME}\`}\r
      >\r
        <Panel variant="card" padding="sm">One</Panel>\r
        <Panel variant="card" padding="md">Two, taller</Panel>\r
        <Panel variant="card" padding="sm">Three</Panel>\r
        <TextBox label="Grows" labelMode="hidden" placeholder="I grow" grow />\r
      </Stack>\r
    </>\r
  );\r
}\r
`,Ce=[`Inbox`,`Drafts`,`Sent`,`Archive`,`Spam`,`Trash`],we=`border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg);`,Y=`background: var(--mx-color-bg-bar);`,X=`background: var(--mx-color-bg-layer);`;function Te(){let e=g({side:`start`,messages:3}),t=null,n=null,r=()=>{if(n){t?.controls.remove(n),n=null;return}n=new E({dock:`end`,padding:`sm`}),n.element.setAttribute(`style`,`inline-size: 9rem; ${X}`),n.element.classList.add(`layout-notes`),n.controls.add(m(`span`,{initializeComponent:e=>{let t=m(`text`,{initializeComponent:e=>{e.setText(`Notes, added programmatically.`)}},1);e.controls.add(t)}},1)),t?.controls.add(n)};return f({initializeComponent:n=>{{let i=m(k,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[m(v,{text:()=>`Sidebar: ${e.side}`,size:`sm`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.side=e.side===`start`?`end`:`start`)}},childs:[]}),m(v,{text:`Notes panel programmatically`,size:`sm`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,r)}},childs:[]})]});n.controls.add(i);let a=m(fe,{class:`layout-shell`,style:`block-size: 22rem; inline-size: 100%; overflow: hidden; ${we}`,ref:e=>t=e,runover:{},childs:[m(k,{dock:`top`,orientation:`horizontal`,align:`center`,gap:`sm`,padding:`xs sm`,style:Y,runover:{},childs:[m(`strong`,{initializeComponent:e=>{let t=m(`text`,{initializeComponent:e=>{e.setText(`Mail`)}},1);e.controls.add(t)}},1),m(C,{label:`Search mail`,labelMode:`hidden`,placeholder:`Search`,grow:!0,runover:{},childs:[]}),m(v,{text:`New`,tone:`accent`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.messages++)}},childs:[]})]}),m(E,{class:`layout-side`,dock:()=>e.side,scrollable:`vertical`,padding:`xs`,text:`Mailboxes`,style:`inline-size: 11rem; ${X}`,runover:{},childs:[m(k,{gap:`xxs`,runover:{},childs:[m({initializeComponent:e=>{e.bindings.list(()=>Ce??[],e=>m(v,{indexkey:()=>e,text:e,variant:`ghost`,stretch:!0,runover:{},childs:[]}))}})]})]}),m(k,{class:`layout-status`,dock:`bottom`,orientation:`horizontal`,justify:`space-between`,padding:`xxs sm`,style:Y,runover:{},childs:[m(`span`,{initializeComponent:e=>{let t=m(`text`,{initializeComponent:e=>{e.setText(`Ready`)}},1);e.controls.add(t)}},1),m(`span`,{initializeComponent:t=>{t.bindings.method(()=>`${e.messages} messages`)}},1)]}),m(E,{class:`layout-content`,text:`Message`,scrollable:!0,padding:`md`,runover:{},childs:[m(`h3`,{initializeComponent:e=>{e.style(`margin-block-start: 0`);let t=m(`text`,{initializeComponent:e=>{e.setText(`Welcome`)}},1);e.controls.add(t)}},1),m(`p`,{initializeComponent:e=>{let t=m(`text`,{initializeComponent:e=>{e.setText(`The header, the folders and the status bar are docked; this panel fills the rest and scrolls on its own.`)}},1);e.controls.add(t)}},1),m(`p`,{initializeComponent:e=>{let t=m(`text`,{initializeComponent:e=>{e.setText(`Switch the sidebar to the other side, or add a panel programmatically: the layout follows at once.`)}},1);e.controls.add(t)}},1)]}),m(v,{class:`layout-help`,dock:`float`,right:16,bottom:48,text:`Help`,variant:`outline`,runover:{},childs:[]})]});n.controls.add(a)}}})}function Ee(){let e=0,t=null,n=()=>t?.controls.add(new v({text:`Button ${++e}`,variant:`outline`,grow:e%3==0})),r=e=>{let t=new V({columns:`* *`,gap:`xs`});t.element.classList.add(`layout-coded`),t.controls.add(new C({label:`From`,stretch:!0}),new C({label:`To`,stretch:!0}),new C({label:`Subject`,stretch:!0,columnSpan:2})),e.controls.add(t)};return f({initializeComponent:e=>{{let i=m(k,{orientation:`horizontal`,gap:`sm`,wrap:!0,align:`center`,style:`inline-size: 100%`,ref:e=>t=e,runover:{},childs:[m(v,{text:`Add a button`,tone:`accent`,runover:{initializeComponent:e=>{e.motif.on(`click`,n)}},childs:[]})]});e.controls.add(i);let a=m(`div`,{ref:e=>r(e),initializeComponent:e=>{e.style(`inline-size: 100%`)}});e.controls.add(a)}}})}function De(){let e=g({columns:2});return f({initializeComponent:t=>{{let n=m(k,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Columns`,runover:{},childs:[m({initializeComponent:t=>{t.bindings.list(()=>[1,2,3],t=>m(v,{indexkey:()=>t,text:`${t} column${t>1?`s`:``}`,size:`sm`,variant:()=>e.columns===t?`solid`:`ghost`,"aria-pressed":()=>e.columns===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.columns=t)}},childs:[]}))}})]});t.controls.add(n);let r=m(V,{class:`layout-form`,columns:()=>e.columns,gap:`sm`,align:`end`,style:`inline-size: 100%`,runover:{},childs:[m(C,{label:`First name`,stretch:!0,runover:{},childs:[]}),m(C,{label:`Last name`,stretch:!0,runover:{},childs:[]}),m(C,{label:`Street`,stretch:!0,column:1,columnSpan:()=>Math.min(2,e.columns),runover:{},childs:[]}),m(C,{label:`City`,stretch:!0,runover:{},childs:[]}),m(C,{label:`Postal code`,stretch:!0,runover:{},childs:[]}),m(k,{orientation:`horizontal`,justify:`end`,gap:`xs`,column:`1`,columnSpan:()=>e.columns,runover:{},childs:[m(v,{text:`Cancel`,variant:`ghost`,runover:{},childs:[]}),m(v,{text:`Save`,tone:`accent`,runover:{},childs:[]})]})]});t.controls.add(r)}}})}function Oe(){return m(V,{class:`layout-tracks`,columns:`120 * 2*`,rows:`auto 4rem`,gap:`xs`,style:`inline-size: 100%`,runover:{},childs:[m(E,{variant:`card`,padding:`xs`,runover:{},childs:[m(`text`,{initializeComponent:e=>{e.setText(`120px`)}},1)]}),m(E,{variant:`card`,padding:`xs`,runover:{},childs:[m(`text`,{initializeComponent:e=>{e.setText(`1fr`)}},1)]}),m(E,{variant:`card`,padding:`xs`,runover:{},childs:[m(`text`,{initializeComponent:e=>{e.setText(`2fr`)}},1)]}),m(E,{variant:`card`,padding:`xs`,column:2,columnSpan:2,runover:{},childs:[m(`text`,{initializeComponent:e=>{e.setText(`row 2, columns 2–3`)}},1)]})]})}function ke(){let e=g({editing:!0});return f({initializeComponent:t=>{{let n=m(v,{text:`Enabled`,size:`sm`,variant:`outline`,toggle:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.editing,t=>{let n=e;n!=null&&typeof n.editing!=`function`&&(n.editing=t)})}},childs:[]});t.controls.add(n);let r=m(V,{columns:`* *`,gap:`md`,style:`inline-size: 100%`,align:`start`,runover:{},childs:[m(W,{title:`&Address`,enabled:()=>e.editing,runover:{},childs:[m(C,{label:`Street`,stretch:!0,runover:{},childs:[]}),m(C,{label:`City`,stretch:!0,runover:{},childs:[]})]}),m(W,{title:`More &options`,collapsible:!0,collapsed:!0,runover:{},childs:[m(C,{label:`Coupon`,stretch:!0,runover:{},childs:[]}),m(C,{label:`Gift note`,stretch:!0,runover:{},childs:[]})]})]});t.controls.add(r)}}})}function Ae(){let e=g({lang:`en`}),t=()=>{e.lang=e.lang===`en`?`tr`:`en`,i.use(e.lang)};return f({initializeComponent:n=>{{let r=m(v,{text:()=>e.lang===`en`?`Language: English`:`Dil: Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,t)}},childs:[]});n.controls.add(r);let i=m(`span`,{initializeComponent:e=>{let t=m(`text`,{initializeComponent:e=>{e.setText(`The splitter is named `)}},1);e.controls.add(t);let n=m(`output`,{initializeComponent:e=>{e.class.add(`layout-resize`),e.bindings.method(()=>ie.strings.resize)}},1);e.controls.add(n)}},1);n.controls.add(i)}}})}var je=[`Inbox`,`Drafts`,`Sent`,`Archive`,`Spam`,`Trash`],Me=`border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg);`,Z=`background: var(--mx-color-bg-layer);`;function Ne(){let e=g({tree:180,fixed:`first`,log:``}),t=null;return f({initializeComponent:n=>{{let r=m(k,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[m(v,{text:`Hide folders`,size:`sm`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>t?.collapse(`first`))}},childs:[]}),m(v,{text:`Restore`,size:`sm`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>t?.restore())}},childs:[]}),m(v,{text:()=>`fixedPanel: ${e.fixed}`,size:`sm`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.fixed=e.fixed===`first`?`none`:`first`)}},childs:[]}),m(`output`,{initializeComponent:t=>{t.class.add(`layout-split-out`),t.bindings.method(()=>`position: ${e.tree}`)}},1),m(`output`,{initializeComponent:t=>{t.class.add(`layout-split-log`),t.bindings.method(()=>e.log)}},1)]});n.controls.add(r);let i=m(A,{class:`layout-split`,position:180,fixedPanel:()=>e.fixed,firstMinSize:120,secondMinSize:200,onSplitterMoved:t=>e.log=`moved${t.byUser?` by you`:``}${t.collapsed===`none`?``:`, ${t.collapsed} hidden`}`,style:`block-size: 20rem; inline-size: 100%; ${Me}`,ref:e=>t=e,runover:{initializeComponent:t=>{t.bindings.model(()=>e.tree,t=>{let n=e;n!=null&&typeof n.tree!=`function`&&(n.tree=t)})}},childs:[m(E,{text:`Folders`,scrollable:!0,padding:`sm`,style:Z,runover:{},childs:[m(k,{gap:`xxs`,runover:{},childs:[m({initializeComponent:e=>{e.bindings.list(()=>je??[],e=>m(v,{indexkey:()=>e,text:e,variant:`ghost`,stretch:!0,runover:{},childs:[]}))}})]})]}),m(A,{orientation:`vertical`,position:`65%`,secondMinSize:48,runover:{},childs:[m(E,{text:`Editor`,scrollable:!0,padding:`sm`,runover:{},childs:[m(`p`,{initializeComponent:e=>{let t=m(`text`,{initializeComponent:e=>{e.setText(`Drag the splitters, or Tab to one and use the arrow keys, Home, End and Enter.`)}},1);e.controls.add(t)}},1)]}),m(E,{text:`Output`,scrollable:!0,padding:`sm`,style:Z,runover:{},childs:[m(`code`,{initializeComponent:e=>{let t=m(`text`,{initializeComponent:e=>{e.setText(`Build finished in 1.2 s.`)}},1);e.controls.add(t)}},1)]})]})]});n.controls.add(i)}}})}function Pe(){return f({initializeComponent:e=>{{let t=m(E,{class:`layout-scroll`,text:`Terms`,scrollable:`vertical`,padding:`md`,variant:`outline`,style:`block-size: 8rem; inline-size: 18rem`,runover:{},childs:[m(`p`,{initializeComponent:e=>{let t=m(`text`,{initializeComponent:e=>{e.setText(`1. The service is offered as it is.`)}},1);e.controls.add(t)}},1),m(`p`,{initializeComponent:e=>{let t=m(`text`,{initializeComponent:e=>{e.setText(`2. You keep the rights to what you upload.`)}},1);e.controls.add(t)}},1),m(`p`,{initializeComponent:e=>{let t=m(`text`,{initializeComponent:e=>{e.setText(`3. We may change these terms with a notice of 30 days.`)}},1);e.controls.add(t)}},1),m(`p`,{initializeComponent:e=>{let t=m(`text`,{initializeComponent:e=>{e.setText(`4. Either side may end the agreement at any time.`)}},1);e.controls.add(t)}},1),m(`p`,{initializeComponent:e=>{let t=m(`text`,{initializeComponent:e=>{e.setText(`5. The law of the place you live in applies.`)}},1);e.controls.add(t)}},1)]});e.controls.add(t);let n=m(E,{variant:`card`,padding:`md`,runover:{},childs:[m(`text`,{initializeComponent:e=>{e.setText(`A card`)}},1)]});e.controls.add(n);let r=m(E,{variant:`outline`,padding:`md`,runover:{},childs:[m(`text`,{initializeComponent:e=>{e.setText(`An outline`)}},1)]});e.controls.add(r)}}})}var Fe=[`xxs`,`xs`,`sm`,`md`,`lg`,`xl`,`xxl`],Ie=`border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg);`;function Le(){let e=g({gap:`sm`});return f({initializeComponent:t=>{{let n=m(k,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Gap`,runover:{},childs:[m({initializeComponent:t=>{t.bindings.list(()=>Fe??[],t=>m(v,{indexkey:()=>t,text:t,size:`sm`,variant:()=>e.gap===t?`solid`:`ghost`,"aria-pressed":()=>e.gap===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.gap=t)}},childs:[]}))}})]});t.controls.add(n);let r=m(k,{class:`layout-gap-demo`,orientation:`horizontal`,gap:()=>e.gap,padding:`xs`,runover:{},childs:[m(E,{variant:`card`,padding:`sm`,runover:{},childs:[m(`text`,{initializeComponent:e=>{e.setText(`A`)}},1)]}),m(E,{variant:`card`,padding:`sm`,runover:{},childs:[m(`text`,{initializeComponent:e=>{e.setText(`B`)}},1)]}),m(E,{variant:`card`,padding:`sm`,runover:{},childs:[m(`text`,{initializeComponent:e=>{e.setText(`C`)}},1)]})]});t.controls.add(r);let i=m(k,{orientation:`horizontal`,gap:12,padding:`xs md`,style:Ie,runover:{},childs:[m(E,{variant:`card`,padding:`sm`,runover:{},childs:[m(`text`,{initializeComponent:e=>{e.setText(`12 pixels apart`)}},1)]}),m(E,{variant:`card`,padding:`sm`,runover:{},childs:[m(`text`,{initializeComponent:e=>{e.setText(`padding xs md`)}},1)]})]});t.controls.add(i);let a=m(V,{columns:`* *`,gap:`1.5rem`,style:`inline-size: 100%`,runover:{},childs:[m(E,{variant:`card`,padding:`sm`,runover:{},childs:[m(`text`,{initializeComponent:e=>{e.setText(`1.5rem apart`)}},1)]}),m(E,{variant:`card`,padding:`sm`,runover:{},childs:[m(`text`,{initializeComponent:e=>{e.setText(`in a Grid`)}},1)]})]});t.controls.add(a)}}})}var Re=[`start`,`center`,`end`,`stretch`,`baseline`],ze=[`start`,`center`,`end`,`space-between`,`space-evenly`],Be=`border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg);`;function Ve(){let e=g({orientation:`horizontal`,align:`center`,justify:`start`,wrap:!1,reverse:!1});return f({initializeComponent:t=>{{let n=m(k,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Orientation`,runover:{},childs:[m({initializeComponent:t=>{t.bindings.list(()=>[`horizontal`,`vertical`],t=>m(v,{indexkey:()=>t,text:t,size:`sm`,variant:()=>e.orientation===t?`solid`:`ghost`,"aria-pressed":()=>e.orientation===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.orientation=t)}},childs:[]}))}})]});t.controls.add(n);let r=m(k,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Align`,runover:{},childs:[m({initializeComponent:t=>{t.bindings.list(()=>Re??[],t=>m(v,{indexkey:()=>t,text:t,size:`sm`,variant:()=>e.align===t?`solid`:`ghost`,"aria-pressed":()=>e.align===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.align=t)}},childs:[]}))}})]});t.controls.add(r);let i=m(k,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Justify`,runover:{},childs:[m({initializeComponent:t=>{t.bindings.list(()=>ze??[],t=>m(v,{indexkey:()=>t,text:t,size:`sm`,variant:()=>e.justify===t?`solid`:`ghost`,"aria-pressed":()=>e.justify===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.justify=t)}},childs:[]}))}})]});t.controls.add(i);let a=m(k,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[m(v,{text:`wrap`,size:`sm`,toggle:!0,variant:`outline`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.wrap,t=>{let n=e;n!=null&&typeof n.wrap!=`function`&&(n.wrap=t)})}},childs:[]}),m(v,{text:`reverse`,size:`sm`,toggle:!0,variant:`outline`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.reverse,t=>{let n=e;n!=null&&typeof n.reverse!=`function`&&(n.reverse=t)})}},childs:[]})]});t.controls.add(a);let o=m(k,{class:`layout-stack-demo`,orientation:()=>e.orientation,align:()=>e.align,justify:()=>e.justify,wrap:()=>e.wrap,reverse:()=>e.reverse,gap:`sm`,padding:`sm`,style:`inline-size: 100%; min-block-size: 10rem; ${Be}`,runover:{},childs:[m(E,{variant:`card`,padding:`sm`,runover:{},childs:[m(`text`,{initializeComponent:e=>{e.setText(`One`)}},1)]}),m(E,{variant:`card`,padding:`md`,runover:{},childs:[m(`text`,{initializeComponent:e=>{e.setText(`Two, taller`)}},1)]}),m(E,{variant:`card`,padding:`sm`,runover:{},childs:[m(`text`,{initializeComponent:e=>{e.setText(`Three`)}},1)]}),m(C,{label:`Grows`,labelMode:`hidden`,placeholder:`I grow`,grow:!0,runover:{},childs:[]})]});t.controls.add(o)}}})}var Q=re(Object.assign({"./examples/AppShell.tsx":pe,"./examples/GridForm.tsx":me,"./examples/GridTracks.tsx":he,"./examples/GroupBoxes.tsx":ge,"./examples/Localization.tsx":_e,"./examples/NestedSplit.tsx":ve,"./examples/Panels.tsx":ye,"./examples/Programmatic.tsx":be,"./examples/Spacing.tsx":xe,"./examples/StackOptions.tsx":Se})),He=[[`'xxs' … 'xxl'`,"A step from the spacing scale: `xxs`, `xs`, `sm`, `md`, `lg`, `xl` or `xxl`, from the `layout.space.*` tokens (the design system `space.1` … `space.12`). Density and themes apply to them."],[`12`,`A number is in pixels.`],[`'1.5rem'`,`Any CSS length.`],[`'xs md'`,`Padding accepts one to four values, as in CSS (block-start, inline-end, block-end, inline-start), and can mix steps and lengths. The values follow the reading direction.`]],Ue=[[`'auto 1fr 2fr 120'`,`CSS grid tracks. A bare number is in pixels.`],[`'* 2*'`,"`*` means `1fr`, and `2*` means `2fr`."],[`'minmax(8rem, 1fr) auto'`,`Any CSS track, including functions.`],[`['auto', 120, '*']`,`The same tracks as a list.`],[`3`,`A number creates that many equal columns or rows.`]],We=[[`orientation`,"`Bind<'horizontal' | 'vertical'>`","`'vertical'`","`horizontal` follows the reading direction."],[`gap`,"`Bind<LayoutSpace>`","`layout.gap`",`The space between children.`],[`padding`,"`Bind<LayoutSpace>`",`—`,`The space inside the edges.`],[`align`,"`Bind<LayoutAlign>`","`'stretch'`","Alignment across the direction: `start`, `center`, `end`, `stretch` or `baseline`."],[`justify`,"`Bind<StackJustify>`","`'start'`","Alignment along the direction: `start`, `center`, `end`, `space-between`, `space-around` or `space-evenly`."],[`wrap`,"`Bind<boolean>`","`false`",`Moves children that do not fit to a new line.`],[`reverse`,"`Bind<boolean>`","`false`",`Lays out children from the opposite end. The Tab order stays in document order.`],[`inline`,"`Bind<boolean>`","`false`",`Flows within a line of text, as wide as its children.`]],Ge=[[`columns, rows`,"`Bind<GridTracks>`",`One column`,`See Tracks.`],[`gap`,"`Bind<LayoutSpace>`","`layout.gap`",`The gap between rows and columns.`],[`rowGap, columnGap`,"`Bind<LayoutSpace>`","`gap`",`The gap in one direction only.`],[`padding`,"`Bind<LayoutSpace>`",`—`,`The space inside the edges.`],[`autoRows, autoColumns`,"`Bind<number | string>`","`'auto'`",`The size of implicit tracks. A number is in pixels.`],[`flow`,"`Bind<GridFlow>`","`'row'`","How children without a position fill the grid: `row`, `column`, `row dense` or `column dense`."],[`align`,"`Bind<LayoutAlign>`","`'stretch'`",`The vertical alignment of children in their cells.`],[`justify`,"`Bind<GridJustify>`","`'stretch'`",`The horizontal alignment of children in their cells.`],[`inline`,"`Bind<boolean>`","`false`",`Flows within a line of text.`]],Ke=[[`scrollable`,"`Bind<boolean | 'vertical' | 'horizontal' | 'both'>`","`false`",`Scrolls its content. It then becomes a Tab stop, so the keyboard can scroll it.`],[`padding`,"`Bind<LayoutSpace>`",`—`,`The space inside the edges.`],[`variant`,"`Bind<PanelVariant>`","`'plain'`","`plain`, `outline` (a border) or `card` (a card surface)."],[`text`,"`Bind<string>`","`''`",`Names the panel, which makes it a region landmark with that name.`]],qe=[[`title`,"`Bind<string>`","`''`","The legend. `&Address` makes Alt+A move focus to the first control inside. This is the same property as `text`."],[`collapsible`,"`Bind<boolean>`","`false`",`Makes the title a button that shows and hides the content.`],[`collapsed`,"`Bind<boolean>`","`false`","Hides the content (with `collapsible`)."],[`padding`,"`Bind<LayoutSpace>`","`layout.group-box.padding`",`The space inside the frame.`],[`gap`,"`Bind<LayoutSpace>`","`layout.group-box.gap`",`The space between children, which stack in a column.`],[`variant`,"`Bind<GroupBoxVariant>`","`'outline'`","`outline` (a frame with the title on its edge) or `plain` (the title above the content)."]],Je=[[`gap`,"`Bind<LayoutSpace>`",`—`,`The space between a docked child and the remaining area.`],[`padding`,"`Bind<LayoutSpace>`",`—`,`The space inside the edges.`]],$=[[`orientation`,"`Bind<'horizontal' | 'vertical'>`","`'horizontal'`","`horizontal` places the panes side by side, as in Stack, and `vertical` stacks them."],[`position`,"`Bind<SplitPosition>`","`'50%'`",'The size of the pane that keeps its size (the first pane with `fixedPanel="none"`), in pixels, as a share, or as a CSS length. `x-model` binds it.'],[`fixedPanel`,"`Bind<'none' | 'first' | 'second'>`","`'none'`","The pane that keeps its size when the container is resized. With `none`, both grow and the position is kept as a share."],[`firstMinSize, secondMinSize`,"`Bind<number>`","`0`",`The minimum size of each pane, in pixels.`],[`collapsed`,"`Bind<'none' | 'first' | 'second'>`","`'none'`",`The collapsed pane. The other pane takes all the space.`],[`resizable`,"`Bind<boolean>`","`true`",`Lets the pointer and keyboard move the splitter.`],[`collapsible`,"`Bind<boolean>`","`true`",`Enter and a double-click collapse and restore the first pane.`],[`step`,"`Bind<number>`","`10`",`The distance an arrow key moves the splitter, in pixels.`],[`splitterLabel`,"`Bind<string>`","`uiLocale.strings.resize`",`The accessible name of the splitter.`]],Ye=[[`grow`,`Stack`,"`Bind<boolean | number>`",`Takes the free space along the direction. Numbers share it proportionally.`],[`row, column`,`Grid`,"`Bind<number | string>`","The starting line, counted from 1. A string is passed to CSS as is (`-1`)."],[`rowSpan, columnSpan`,`Grid`,"`Bind<number>`",`The number of tracks it spans.`],[`dock`,`DockPanel`,"`Bind<Dock>`","`top`, `bottom`, `start`, `end`, `fill` (the default) or `float`."],[`left, top, right, bottom`,`DockPanel`,"`Bind<number | string>`","The anchors of a `float` child. A number is in pixels, and `left` plus `right` stretches it."]],Xe=[[`every prop above`,`read/write, reactive`,`Accepts a value or a function, the same as the prop.`],[`SplitContainer.first, second`,`read-only`,"The two panes, as `Panel` objects: `split.first.controls.add(…)`, `split.second.scrollable = true`."],[`SplitContainer.splitterPart`,`read-only`,'The `role="separator"` part.'],[`SplitContainer.value`,`read/write`,"Maps to `position` for `x-model`."],[`GroupBox.legendPart`,`read-only`,"The `<legend>` part."]],Ze=[[`Stack.setGrow(child, grow), growOf(child)`,"`void`, value","Sets a child's `grow` programmatically, with a value or a function."],[`Grid.setCell(child, cell), cellOf(child)`,"`void`, `GridCell`","Sets a child's `row`, `column`, `rowSpan` and `columnSpan` programmatically."],[`DockPanel.setDock(child, dock), dockOf(child)`,"`void`, `Dock`","Sets a child's `dock` programmatically."],[`DockPanel.setAnchors(child, anchors)`,"`void`","Sets the `left`, `top`, `right` and `bottom` of a `float` child."],[`SplitContainer.collapse(pane?), restore()`,"`void`",`Collapses a pane (the first by default), or shows both panes again.`],[`GroupBox.focus()`,"`boolean`",`Sets focus on the first control inside, expanding a collapsed box if needed.`]],Qe=[[`SplitContainer.onSplitterMoved(e)`,"Occurs when the splitter moves (at the end of a drag), or when a pane is collapsed or restored. `e`: `{ position, collapsed, byUser, source }`."],[`GroupBox.onToggled(e)`,"Occurs when the content is shown or hidden. `e`: `{ collapsed, byUser, source }`."]],$e=[[`Tab`,"The splitter is one Tab stop between the panes, and a scrolling `Panel` is its own Tab stop."],[`Left / Right (side by side), Up / Down (one over the other)`,"Moves the splitter by `step`. Left and Right follow the visual direction on right-to-left pages."],[`Home / End`,`Sets the first pane to its smallest or largest size.`],[`Enter`,`Collapses the first pane, or restores the splitter to its previous position.`],["Alt + key (`&Address`)","Moves focus to the first control in a `GroupBox` (Control + Option + key on Apple platforms)."],[`Arrows, Page Up / Down`,"Scrolls a focused scrolling `Panel`, using the browser's default behavior."]],et=[[`Splitter`,'`role="separator"`, focusable, with `aria-valuenow` (the share of the first pane, 0 to 100), `aria-valuemin`, `aria-valuemax`, `aria-orientation` and `aria-controls` for the first pane. It is named by `splitterLabel` or `uiLocale`, following the ARIA window splitter pattern.'],[`Hidden pane`,"`inert`, so it is out of reach of Tab and screen readers. Focus inside moves to the splitter."],[`GroupBox`,"A native `<fieldset>` named by its `<legend>`. When disabled, it disables the native controls inside. A collapsible group box has a button with `aria-expanded`."],[`Panel`,"With `text`, a region landmark with that name. When scrolling, it is a Tab stop."],[`Order`,`Stack, Grid and DockPanel position children with CSS only. Tab and screen readers follow document order, so write children in reading order.`]],tt=[[`.mx-stack`,"`data-orientation`, `data-align`, `data-justify`, `data-wrap`, `data-reverse`, `data-inline`. A growing child gets `data-mx-grow`."],[`.mx-grid`,"`data-align`, `data-justify`, `data-inline`. Tracks and child positions are inline grid properties."],[`.mx-panel`,"`data-variant`, `data-scroll`."],[`.mx-group-box`,"`data-variant`, `data-collapsible`, `data-collapsed`, `data-disabled`; `.mx-group-box__legend`, `__title`, `__toggle`, `__chevron`."],[`.mx-dock-panel`,"Each child gets `data-mx-dock`. Its position and the `gap`, a margin on the side facing the remaining area, are set inline."],[`.mx-split-container`,"`data-orientation`, `data-collapsed`, `data-resizable`, `data-dragging`; `.mx-split-container__pane` (`data-pane`), `__splitter`."],[`--_gap, --_row-gap, --_column-gap`,"Set inline from `gap`, `rowGap` and `columnGap` (Stack, Grid, GroupBox)."]],nt=[[`layout.space.xxs … xxl`,"The spacing steps of `gap` and `padding`."],[`layout.gap`,`The default gap of Stack and Grid.`],[`layout.panel`,"Unit: a panel (`outline` for a frame, `card` for a raised surface)."],[`layout.group, layout.group-caption, layout.group-toggle, layout.group-chevron`,"Units: a group box (`plain`, `collapsed`), its label, the collapse button and its chevron."],[`layout.group-box.gap, layout.group-box.legend-float`,`The default gap inside a group box, and the position of its label.`],[`layout.splitter-handle, layout.splitter-line, layout.splitter-grip`,"Units: the splitter (`focus`), its line and its grip (`active`, `disabled`)."],[`layout.splitter.*`,"`size` (the pointer target area), `line-width`, `active-width`, `grip-length`, `grip-thickness`."]];function rt(){return f({initializeComponent:e=>{{let t=m(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=m(P,{text:"Container controls for arranging other controls: `Stack` (a row or column), `Grid` (rows and columns), `Panel` (a plain box that can scroll), `GroupBox` (a titled frame), `DockPanel` (children docked to its edges) and `SplitContainer` (two panes with a splitter). All of them are controls, so they can disable and hide their content, and they lay out children added at any time.",runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let n=m(M,{anchor:`import`,title:`Import`,runover:{},childs:[m(j,{code:`
import { Stack, Grid, Panel, GroupBox, DockPanel, SplitContainer, type LayoutSpace } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(n);let r=m(M,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[m(`p`,{initializeComponent:e=>{let t=m(P,{text:"Children can be declared in JSX or added later with `controls.add`, and the container handles both. A child sets its own layout options through its props (`grow`, `row`, `dock`…), whatever type of component it is.",runover:{},childs:[]});e.controls.add(t)}},1),m(N,{files:Q(`Programmatic.tsx`),stack:!0,runover:{},childs:[m(Ee,{runover:{},childs:[]})]})]});e.controls.add(r);let i=m(M,{anchor:`stack`,title:`Stack`,runover:{},childs:[m(`p`,{initializeComponent:e=>{let t=m(P,{text:"A row or column with a gap. `align` positions children across the direction, and `justify` positions them along it. `wrap` starts a new line when they do not fit, and a child with `grow` takes the free space.",runover:{},childs:[]});e.controls.add(t)}},1),m(N,{files:Q(`StackOptions.tsx`),stack:!0,runover:{},childs:[m(Ve,{runover:{},childs:[]})]})]});e.controls.add(i);let a=m(M,{anchor:`spacing`,title:`Spacing`,runover:{},childs:[m(`p`,{initializeComponent:e=>{let t=m(P,{text:"`gap` and `padding` accept a step from the spacing scale, a number of pixels, or any CSS length.",runover:{},childs:[]});e.controls.add(t)}},1),m(F,{head:[`Value`,`Meaning`],rows:He,runover:{},childs:[]}),m(N,{files:Q(`Spacing.tsx`),stack:!0,runover:{},childs:[m(Le,{runover:{},childs:[]})]})]});e.controls.add(a);let o=m(M,{anchor:`grid`,title:`Grid`,runover:{},childs:[m(`p`,{initializeComponent:e=>{let t=m(P,{text:"Rows and columns defined in a CSS-like syntax. Children fill the cells in order, or set their position with `row`, `column`, `rowSpan` and `columnSpan`, counted from 1.",runover:{},childs:[]});e.controls.add(t)}},1),m(F,{head:[`Tracks`,`Meaning`],rows:Ue,runover:{},childs:[]}),m(N,{title:`Form layout`,files:Q(`GridForm.tsx`),stack:!0,runover:{},childs:[m(De,{runover:{},childs:[]})]}),m(N,{title:`Fixed and flexible tracks`,files:Q(`GridTracks.tsx`),runover:{},childs:[m(Oe,{runover:{},childs:[]})]})]});e.controls.add(o);let s=m(M,{anchor:`panel`,title:`Panel`,runover:{},childs:[m(`p`,{initializeComponent:e=>{let t=m(P,{text:"A plain box with padding, an optional frame and its own scrolling. A scrolling panel is a Tab stop, so it can be scrolled with the keyboard, and `text` provides its name.",runover:{},childs:[]});e.controls.add(t)}},1),m(N,{files:Q(`Panels.tsx`),runover:{},childs:[m(Pe,{runover:{},childs:[]})]})]});e.controls.add(s);let c=m(M,{anchor:`groupbox`,title:`GroupBox`,runover:{},childs:[m(`p`,{initializeComponent:e=>{let t=m(P,{text:"A titled frame around related controls. It is a `<fieldset>`, so screen readers announce the group by its title and disabling it disables its content. The `&` key in the title moves focus to the first control, and `collapsible` lets the title show and hide the content.",runover:{},childs:[]});e.controls.add(t)}},1),m(N,{files:Q(`GroupBoxes.tsx`),stack:!0,runover:{},childs:[m(ke,{runover:{},childs:[]})]})]});e.controls.add(c);let l=m(M,{anchor:`dock`,title:`DockPanel`,runover:{},childs:[m(`p`,{initializeComponent:e=>{let t=m(P,{text:"Children dock to the edges in the order they appear: `top`, `bottom`, `start` and `end` (the last two follow the reading direction), and `fill` takes the remaining space. A `float` child sits over the others at its own `left`, `top`, `right` and `bottom`. The layout uses CSS grid, so no code runs when the size changes.",runover:{},childs:[]});e.controls.add(t)}},1),m(N,{title:`Application shell`,files:Q(`AppShell.tsx`),stack:!0,runover:{},childs:[m(Te,{runover:{},childs:[]})]})]});e.controls.add(l);let u=m(M,{anchor:`split`,title:`SplitContainer`,runover:{},childs:[m(`p`,{initializeComponent:e=>{let t=m(P,{text:"Two panes, `first` and `second`, separated by a splitter that can be dragged or moved with the keyboard. `fixedPanel` preserves the size of one pane when the container is resized, and the minimum sizes are enforced. Enter collapses the first pane and restores it. Split containers can be nested.",runover:{},childs:[]});e.controls.add(t)}},1),m(N,{title:`Nested split containers`,files:Q(`NestedSplit.tsx`),stack:!0,runover:{},childs:[m(Ne,{runover:{},childs:[]})]})]});e.controls.add(u);let d=m(M,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[m(F,{head:[`Key`,`Description`],rows:$e,runover:{},childs:[]})]});e.controls.add(d);let f=m(M,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[m(F,{head:[`Topic`,`Details`],rows:et,runover:{},childs:[]})]});e.controls.add(f);let p=m(M,{anchor:`i18n`,title:`Localization`,runover:{},childs:[m(`p`,{initializeComponent:e=>{let t=m(P,{text:"The only string these containers display is the splitter name, `uiLocale.strings.resize`, unless `splitterLabel` is set.",runover:{},childs:[]});e.controls.add(t)}},1),m(N,{files:Q(`Localization.tsx`),runover:{},childs:[m(Ae,{runover:{},childs:[]})]})]});e.controls.add(p);let h=m(M,{anchor:`styling`,title:`Styling`,runover:{},childs:[m(F,{head:[`Hook`,`Description`],rows:tt,runover:{},childs:[]}),m(`h3`,{initializeComponent:e=>{let t=m(P,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),m(F,{head:[`Token`,`Description`],rows:nt,runover:{},childs:[]})]});e.controls.add(h);let g=m(M,{anchor:`api`,title:`API reference`,runover:{},childs:[m(`p`,{initializeComponent:e=>{let t=m(P,{text:"Every container also has the properties shared by `Control`: `enabled` and `disabled` (which apply to everything inside), `visible`, `tabStop` and `tabIndex`.",runover:{},childs:[]});e.controls.add(t)}},1),m(`h3`,{initializeComponent:e=>{let t=m(P,{text:`Stack props`,runover:{},childs:[]});e.controls.add(t)}},1),m(F,{head:[`Prop`,`Type`,`Default`,`Description`],rows:We,runover:{},childs:[]}),m(`h3`,{initializeComponent:e=>{let t=m(P,{text:`Grid props`,runover:{},childs:[]});e.controls.add(t)}},1),m(F,{head:[`Prop`,`Type`,`Default`,`Description`],rows:Ge,runover:{},childs:[]}),m(`h3`,{initializeComponent:e=>{let t=m(P,{text:`Panel props`,runover:{},childs:[]});e.controls.add(t)}},1),m(F,{head:[`Prop`,`Type`,`Default`,`Description`],rows:Ke,runover:{},childs:[]}),m(`h3`,{initializeComponent:e=>{let t=m(P,{text:`GroupBox props`,runover:{},childs:[]});e.controls.add(t)}},1),m(F,{head:[`Prop`,`Type`,`Default`,`Description`],rows:qe,runover:{},childs:[]}),m(`h3`,{initializeComponent:e=>{let t=m(P,{text:`DockPanel props`,runover:{},childs:[]});e.controls.add(t)}},1),m(F,{head:[`Prop`,`Type`,`Default`,`Description`],rows:Je,runover:{},childs:[]}),m(`h3`,{initializeComponent:e=>{let t=m(P,{text:`SplitContainer props`,runover:{},childs:[]});e.controls.add(t)}},1),m(F,{head:[`Prop`,`Type`,`Default`,`Description`],rows:$,runover:{},childs:[]}),m(`h3`,{initializeComponent:e=>{let t=m(P,{text:`Props a child sets for its container`,runover:{},childs:[]});e.controls.add(t)}},1),m(F,{head:[`Prop`,`Used by`,`Type`,`Description`],rows:Ye,runover:{},childs:[]}),m(`h3`,{initializeComponent:e=>{let t=m(P,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),m(F,{head:[`Property`,`Access`,`Description`],rows:Xe,runover:{},childs:[]}),m(`h3`,{initializeComponent:e=>{let t=m(P,{text:`Methods`,runover:{},childs:[]});e.controls.add(t)}},1),m(F,{head:[`Method`,`Returns`,`Description`],rows:Ze,runover:{},childs:[]}),m(`h3`,{initializeComponent:e=>{let t=m(P,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),m(F,{head:[`Event`,`When`],rows:Qe,runover:{},childs:[]}),m(`p`,{initializeComponent:e=>{let t=m(P,{text:"`ChildSettings`, which reads a child's settings from its props and tracks children added later, is exported for use in your own containers.",runover:{},childs:[]});e.controls.add(t)}},1)]});e.controls.add(g)}}})}export{rt as default};