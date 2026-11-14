import{Qn as e,Zn as t,er as n}from"./next-id-CtzpBrBT.js";import{t as r}from"./Breadcrumb-DjxJ-nhd.js";import{t as i}from"./Stack-wRt1e9tO.js";import{a,i as o,n as s,r as c,t as l}from"./docs-B_LZlyP5.js";import{t as u}from"./sources-BXVvOiIY.js";var d=`import { Breadcrumb, Stack } from '@motifx-community/ui';\r
\r
const PATH = ['Workspace', 'Projects', 'Kit', 'Components', 'Navigation', 'Breadcrumb', 'Examples', 'Overflow'];\r
\r
/** Steps that do not fit go into the menu after the first; drag the box's corner to see it. \`maxItems\` caps the count. */\r
export default function Overflow() {\r
  return (\r
    <Stack gap="lg">\r
      <div style="resize: horizontal; overflow: hidden; inline-size: 22rem; min-inline-size: 10rem; max-inline-size: 100%; padding-block: 0.25rem">\r
        <Breadcrumb label="Path that fits" items={PATH} />\r
      </div>\r
      <Breadcrumb label="Path of three" items={PATH} maxItems={3} />\r
    </Stack>\r
  );\r
}\r
`,f=`import { reactive } from '@motifx/core';\r
import { Breadcrumb, Stack } from '@motifx-community/ui';\r
\r
/** Links handled by the router (\`rel="router"\`), a step that is a button, the current page last, and one created programmatically. */\r
export default function Programmatic() {\r
  const s = reactive({ last: '' });\r
  const coded = new Breadcrumb({ label: 'Settings path', items: ['Settings', 'Account', 'Security'] });\r
\r
  // Several on one page: each gets a name of its own.\r
  return (\r
    <Stack gap="lg">\r
      <Breadcrumb\r
        label="Docs path"\r
        rel="router"\r
        items={[{ text: 'Docs', href: '/' }, { text: 'Components', href: '/button' }, 'Display', { text: 'Breadcrumb' }]}\r
        onItemClick={(e) => (s.last = String((e.item as { text?: string }).text ?? e.item))}\r
      />\r
      <span>{() => (s.last ? \`Pressed: \${s.last}\` : 'Press a step')}</span>\r
      <span onConfig={(c) => c.controls.add(coded)} />\r
    </Stack>\r
  );\r
}\r
`,p=`import { Breadcrumb, Stack, type ControlSize } from '@motifx-community/ui';\r
\r
const SIZES: ControlSize[] = ['sm', 'md', 'lg'];\r
\r
/** Each size, with a disabled step. */\r
export default function Sizes() {\r
  return (\r
    <Stack gap="lg">\r
      {SIZES.map((size) => (\r
        <Breadcrumb key={size} label={\`Path \${size}\`} size={size} items={['Home', { text: 'Archived', enabled: false }, 'Reports', \`Size \${size}\`]} />\r
      ))}\r
    </Stack>\r
  );\r
}\r
`;function m(){let e=n({last:``}),a=new r({label:`Settings path`,items:[`Settings`,`Account`,`Security`]});return t(i,{gap:`lg`,runover:{},childs:[t(r,{label:`Docs path`,rel:`router`,items:[{text:`Docs`,href:`/`},{text:`Components`,href:`/button`},`Display`,{text:`Breadcrumb`}],onItemClick:t=>e.last=String(t.item.text??t.item),runover:{},childs:[]}),t(`span`,{initializeComponent:n=>{n.bindings.ternary(()=>e.last,n=>{n.navigate(t(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,()=>{if(`Pressed: ${e.last}`!==null&&`Pressed: ${e.last}`!==void 0)return typeof`Pressed: ${e.last}`==`function`?`Pressed: ${e.last}`():()=>`Pressed: ${e.last}`})}},1))},e=>{e.navigate(t(`text`,{initializeComponent:e=>{e.setText(`Press a step`)}},1))})}},1),t(`span`,{onConfig:e=>e.controls.add(a)})]})}var h=[`Workspace`,`Projects`,`Kit`,`Components`,`Navigation`,`Breadcrumb`,`Examples`,`Overflow`];function g(){return t(i,{gap:`lg`,runover:{},childs:[t(`div`,{initializeComponent:e=>{e.style(`resize: horizontal; overflow: hidden; inline-size: 22rem; min-inline-size: 10rem; max-inline-size: 100%; padding-block: 0.25rem`);let n=t(r,{label:`Path that fits`,items:h,runover:{},childs:[]});e.controls.add(n)}},1),t(r,{label:`Path of three`,items:h,maxItems:3,runover:{},childs:[]})]})}var _=[`sm`,`md`,`lg`];function v(){return t(i,{gap:`lg`,runover:{},childs:[t({initializeComponent:e=>{e.bindings.list(()=>_??[],e=>t(r,{indexkey:()=>e,label:`Path ${e}`,size:e,items:[`Home`,{text:`Archived`,enabled:!1},`Reports`,`Size ${e}`],runover:{},childs:[]}))}})]})}var y=u(Object.assign({"./examples/Overflow.tsx":d,"./examples/Programmatic.tsx":f,"./examples/Sizes.tsx":p})),b=[[`items`,"`Bind<readonly (BreadcrumbItem | string)[]>`","`[]`","The steps, with the current page last: `BreadcrumbItem` objects (`text`, `href`, `icon`, `enabled`, `data`) or plain text. A step with `href` is a link, and one without is a button."],[`rel`,"`Bind<string>`","`''`","The `rel` of the links. `router` lets the MotifJS router handle them, including from the menu."],[`maxItems`,"`Bind<number | null>`",`As many as fit`,`The maximum number of steps shown. The first and last stay, and those in between move to the menu.`],[`lastIsCurrent`,"`Bind<boolean>`","`true`",'Makes the last step the current page, which cannot be pressed and has `aria-current="page"`.'],[`size`,"`Bind<ControlSize>`","`'md'`","`sm`, `md`, `lg`."],[`label`,"`Bind<string>`",`The kit string “Breadcrumb”`,`The accessible name.`]],x=[[`onItemClick`,`event`,"Occurs when a step is pressed, on the breadcrumb or in its menu (`item`, `index`). Set `cancel = true` to prevent following a link."],[`collapsed`,`read-only`,`The indexes of the steps currently in the menu.`]],S=[[`Landmark`,"A `nav` named “Breadcrumb” in the kit language, containing an ordered list. If a page has several, give each one its own `label`."],[`Current page`,'`aria-current="page"`. The current page is not a link.'],[`Menu`,`Steps that do not fit go into a menu behind a button named “More pages”. Choosing one activates the step itself.`],[`Disabled state`,"`aria-disabled`. A disabled link loses its address."]],C=[[`.mx-breadcrumb`,"The breadcrumb. `data-size`."],[`.mx-breadcrumb__list, .mx-breadcrumb__item`,`The list and each step.`],[`.mx-breadcrumb__link, .mx-breadcrumb__current, .mx-breadcrumb__text`,`A pressable step, the current page and the step text.`],[`.mx-breadcrumb__divider, .mx-breadcrumb__more`,`The separator after a step, and the menu of overflow steps.`]],w=[[`breadcrumb.link, .current, .divider`,"Units: a step (`hover`, `pressed`, `focus`, `disabled`), the current page, and the separator (its shape is a chevron, or a slash in Material)."],[`breadcrumb.height.*, .padding.*, .font-size.*`,`A step, per size.`],[`breadcrumb.gap, .divider-size`,`The spacing around a separator, and its size.`]];function T(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(c,{text:`Shows the path to the current page. Each step is a link or button, and the current page comes last. Steps that do not fit move into a menu after the first step.`,runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(o,{anchor:`import`,title:`Import`,runover:{},childs:[t(a,{code:`
import { Breadcrumb } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(o,{anchor:`ways`,title:`Links and buttons`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(c,{text:"A step with `href` is a link, and `rel='router'` lets the MotifJS router handle it. A step without `href` is a button, and `onItemClick` reports the click.",runover:{},childs:[]});e.controls.add(n)}},1),t(s,{files:y(`Programmatic.tsx`),runover:{},childs:[t(m,{runover:{},childs:[]})]})]});e.controls.add(i);let u=t(o,{anchor:`overflow`,title:`Overflow`,runover:{},childs:[t(s,{files:y(`Overflow.tsx`),runover:{},childs:[t(g,{runover:{},childs:[]})]})]});e.controls.add(u);let d=t(o,{anchor:`sizes`,title:`Sizes`,runover:{},childs:[t(s,{files:y(`Sizes.tsx`),runover:{},childs:[t(v,{runover:{},childs:[]})]})]});e.controls.add(d);let f=t(o,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(l,{head:[`Topic`,`Details`],rows:S,runover:{},childs:[]})]});e.controls.add(f);let p=t(o,{anchor:`styling`,title:`Styling`,runover:{},childs:[t(l,{head:[`Hook`,`Description`],rows:C,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(c,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(l,{head:[`Token`,`Description`],rows:w,runover:{},childs:[]})]});e.controls.add(p);let h=t(o,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(c,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(l,{head:[`Prop`,`Type`,`Default`,`Description`],rows:b,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(c,{text:`Events and properties`,runover:{},childs:[]});e.controls.add(n)}},1),t(l,{head:[`Member`,`Type`,`Description`],rows:x,runover:{},childs:[]})]});e.controls.add(h)}}})}export{T as default};