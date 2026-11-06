import{Qt as e,Tt as t,a as n,an as r,h as i,i as a,n as o,nn as s,r as c,rn as l,st as u,t as d}from"./doc-B1CtlCkV.js";import{l as f,s as p}from"./draw-parts-CqFeWILG.js";import{t as m}from"./Chip-BFOAfOnC.js";import{t as h}from"./Stack-AS0iyAxC.js";import{t as g}from"./sources-BXVvOiIY.js";var _=[`selection`,`value`,`wrap`,`label`],v=class extends u{valueChanged=new e;current=null;byUser=!1;ready=!1;constructor(e){super(`div`,e);let t=this.props??{},n=this.element;n.classList.add(`mx-chip-group`),this.childs?.length&&this.controls.add(...this.childs);for(let e of _)t[e]!==void 0&&this.bindProperty(e,t[e]);t.onValueChanged&&this.onValueChanged(t.onValueChanged);for(let e of[`selection`,`value`])this.observeProperty(e,()=>this.renderChips());if(this.observeProperty(`value`,e=>{this.ready&&this.valueChanged.fire({value:e,byUser:this.byUser,source:this})}),this.observeProperty(`wrap`,e=>f(n,`data-wrap`,e===!1?`false`:null)),this.observeProperty(`label`,e=>f(n,`aria-label`,e||null)),this.motif.on(`controladded`,()=>this.renderChips(),!1),this.motif.on(`controlremoved`,()=>this.renderChips(),!1),typeof MutationObserver==`function`){let e=new MutationObserver(()=>this.renderChips());e.observe(n,{childList:!0}),this.motif.setDisposable(()=>e.disconnect())}n.addEventListener(`click`,e=>this.pressed(e)),n.addEventListener(`keydown`,e=>this.keyDown(e)),n.addEventListener(`focusin`,e=>{let t=this.chipAt(e.target);t&&(this.current=t.element,this.renderStops())}),this.motif.setDisposable(()=>this.valueChanged.dispose()),this.ready=!0}get selection(){return this.getProperty(`selection`)??`none`}set selection(e){this.assignProperty(`selection`,e)}get value(){return this.getProperty(`value`)??(this.peekProperty(`selection`)===`multiple`?[]:null)}set value(e){this.assignProperty(`value`,e)}get wrap(){return this.getProperty(`wrap`)!==!1}set wrap(e){this.assignProperty(`wrap`,e)}get label(){return this.getProperty(`label`)??``}set label(e){this.assignProperty(`label`,e)}get onValueChanged(){return this.valueChanged.event}get chips(){let e=[];for(let n of Array.from(this.element.children)){let r=t(n);r instanceof m&&e.push(r)}return e}isSelected(e){let t=this.peekProperty(`selection`)??`none`,n=this.peekProperty(`value`);return t===`single`?n!=null&&Object.is(n,e):t===`multiple`&&Array.isArray(n)&&n.some(t=>Object.is(t,e))}chipAt(e){let n=e instanceof Element?e.closest(`.mx-chip`):null;if(!n||n.parentElement!==this.element)return null;let r=t(n);return r instanceof m?r:null}pressed(e){let t=this.chipAt(e.target),n=this.peekProperty(`selection`)??`none`;if(!t||n===`none`||!t.isEnabled||e.target.closest(`.mx-chip__remove`))return;let r=t.value,i=this.isSelected(r),a;if(n===`single`)a=i?null:r;else{let e=this.peekProperty(`value`),t=Array.isArray(e)?e:[];a=i?t.filter(e=>!Object.is(e,r)):[...t,r]}this.byUser=!0,this.changeProperty(`value`,a),this.byUser=!1,this.bindings.writeModel(a)}keyDown(e){if(e.altKey||e.ctrlKey||e.metaKey)return;let t=this.chipAt(e.target);if(!t||e.target!==t.element)return;let n=this.chips.filter(e=>e.focusable&&e.isEnabled&&!e.element.hidden),r=n.indexOf(t);if(r<0)return;let i=getComputedStyle(this.element).direction===`rtl`,a={ArrowDown:1,ArrowUp:-1,ArrowRight:i?-1:1,ArrowLeft:i?1:-1},o;e.key===`Home`?o=n[0]:e.key===`End`?o=n[n.length-1]:a[e.key]&&(o=n[(r+a[e.key]+n.length)%n.length]),o&&(e.preventDefault(),o.element.focus())}renderChips(){let e=this.element,t=this.peekProperty(`selection`)??`none`;f(e,`role`,t===`none`?`group`:`listbox`),f(e,`aria-multiselectable`,t===`multiple`?`true`:null),f(e,`aria-orientation`,t===`none`?null:`horizontal`);for(let e of this.chips){let n=e.element;p(n,`data-in-group`,!0);let r=t!==`none`,i=n.hasAttribute(`data-option`);if(p(n,`data-option`,r),r){let t=this.isSelected(e.value);f(n,`role`,`option`),f(n,`aria-selected`,String(t)),f(n,`aria-pressed`,null),e.selected!==t&&(e.selected=t)}else i&&f(n,`aria-selected`,null);i!==r&&e.drawState()}this.renderStops()}renderStops(){let e=this.chips.filter(e=>e.focusable),t=e.filter(e=>e.isEnabled),n=t.find(e=>e.element===this.current)??t.find(e=>e.selected)??t[0]??null;for(let t of e)t.element.hasAttribute(`data-disabled`)||f(t.element,`tabindex`,t===n?`0`:`-1`)}},y=`import { reactive } from '@motifx/core';\r
import { Chip, ChipGroup, Stack } from '@motifx-community/ui';\r
\r
const DIETS = ['Vegan', 'Vegetarian', 'Gluten free', 'Dairy free'];\r
const SIZES = ['Small', 'Medium', 'Large'];\r
\r
/** Several chosen (filters, bound with \`x-model\`) and one chosen (\`value\` and \`onValueChanged\`); the value is the chips' values. */\r
export default function Groups() {\r
  const s = reactive({ diets: ['Vegan'] as unknown, size: 'Medium' as unknown });\r
\r
  return (\r
    <Stack gap="lg">\r
      <ChipGroup selection="multiple" label="Diet" x-model={() => s.diets}>\r
        {DIETS.map((diet) => (\r
          <Chip key={diet} text={diet} />\r
        ))}\r
      </ChipGroup>\r
      <span>{() => \`Diet: \${(s.diets as string[]).join(', ') || 'any'}\`}</span>\r
      <ChipGroup selection="single" label="Size" value={() => s.size} onValueChanged={(e) => (s.size = e.value)}>\r
        {SIZES.map((size) => (\r
          <Chip key={size} text={size} />\r
        ))}\r
      </ChipGroup>\r
      <span>{() => \`Size: \${s.size ?? 'none'}\`}</span>\r
    </Stack>\r
  );\r
}\r
`,b=`import { Chip, Stack, type ChipVariant } from '@motifx-community/ui';\r
\r
const VARIANTS: ChipVariant[] = ['filled', 'outline'];\r
\r
// An inline star, so that the example needs no icon set.\r
const star = () => {\r
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');\r
  svg.setAttribute('viewBox', '0 0 16 16');\r
  svg.innerHTML = '<path d="M8 1.5l1.9 4.1 4.4.5-3.3 3 .9 4.4L8 11.3l-3.9 2.2.9-4.4-3.3-3 4.4-.5z" fill="currentColor"/>';\r
  return svg;\r
};\r
\r
/** Each appearance: at rest, selected, with an icon, with an avatar, removable and disabled. */\r
export default function Looks() {\r
  return (\r
    <Stack>\r
      {VARIANTS.map((variant) => (\r
        <Stack key={variant} orientation="horizontal" wrap align="center">\r
          <Chip text="Rest" variant={variant} clickable />\r
          <Chip text="Selected" variant={variant} selectable selected />\r
          <Chip text="Icon" variant={variant} icon={star()} clickable />\r
          <Chip text="Ada Lovelace" variant={variant} avatar={{ name: 'Ada Lovelace' }} removable />\r
          <Chip text="Removable" variant={variant} removable />\r
          <Chip text="Disabled" variant={variant} selectable disabled />\r
        </Stack>\r
      ))}\r
    </Stack>\r
  );\r
}\r
`,x=`import { reactive } from '@motifx/core';\r
import { Chip, Stack } from '@motifx-community/ui';\r
\r
/** A chip in JSX tracks its functions, and one created with \`new\` accepts the same properties programmatically. */\r
export default function Programmatic() {\r
  const s = reactive({ vegan: false });\r
  const coded = new Chip({ text: 'Spicy', selectable: true });\r
\r
  return (\r
    <Stack orientation="horizontal" wrap align="center">\r
      <Chip text="Vegan" selectable selected={() => s.vegan} onSelectedChanged={(e) => (s.vegan = e.selected)} />\r
      <span>{() => (s.vegan ? 'Vegan only' : 'Everything')}</span>\r
      <span onConfig={(c) => c.controls.add(coded)} />\r
    </Stack>\r
  );\r
}\r
`,S=`import { reactive } from '@motifx/core';\r
import { Button, Chip, ChipGroup, Stack } from '@motifx-community/ui';\r
\r
const PEOPLE = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Edsger Dijkstra'];\r
\r
/** Your code performs the removal: \`onRemove\` removes the person from the list, and the group updates to match. */\r
export default function Removing() {\r
  const s = reactive({ people: PEOPLE.map((name) => ({ name })) });\r
\r
  return (\r
    <Stack>\r
      <ChipGroup label="Invited">\r
        {s.people.map((person) => (\r
          <Chip\r
            key={person.name}\r
            text={person.name}\r
            avatar={{ name: person.name }}\r
            removable\r
            onRemove={() => s.people.splice(s.people.indexOf(person), 1)}\r
          />\r
        ))}\r
      </ChipGroup>\r
      <Button text="Invite everyone again" variant="outline" onclick={() => s.people.splice(0, s.people.length, ...PEOPLE.map((name) => ({ name })))} />\r
    </Stack>\r
  );\r
}\r
`,C=`import { Chip, Stack, type ControlSize } from '@motifx-community/ui';\r
\r
const SIZES: ControlSize[] = ['sm', 'md', 'lg'];\r
\r
/** Each size, plain, with an avatar and removable. */\r
export default function Sizes() {\r
  return (\r
    <Stack>\r
      {SIZES.map((size) => (\r
        <Stack key={size} orientation="horizontal" wrap align="center">\r
          <Chip text={size} size={size} selectable />\r
          <Chip text="Grace Hopper" size={size} avatar={{ name: 'Grace Hopper' }} removable />\r
        </Stack>\r
      ))}\r
    </Stack>\r
  );\r
}\r
`,w=`import { Chip, Stack, type ChipTone, type ChipVariant } from '@motifx-community/ui';\r
\r
const TONES: ChipTone[] = ['standard', 'accent', 'info', 'success', 'caution', 'danger'];\r
const VARIANTS: ChipVariant[] = ['filled', 'outline'];\r
\r
/** Every tone in each appearance. */\r
export default function Tones() {\r
  return (\r
    <Stack>\r
      {VARIANTS.map((variant) => (\r
        <Stack key={variant} orientation="horizontal" wrap align="center">\r
          {TONES.map((tone) => (\r
            <Chip key={tone} text={tone} tone={tone} variant={variant} />\r
          ))}\r
        </Stack>\r
      ))}\r
    </Stack>\r
  );\r
}\r
`;function T(){let e=r({vegan:!1}),t=new m({text:`Spicy`,selectable:!0});return s(h,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[s(m,{text:`Vegan`,selectable:!0,selected:()=>e.vegan,onSelectedChanged:t=>e.vegan=t.selected,runover:{},childs:[]}),s(`span`,{initializeComponent:t=>{t.bindings.ternary(()=>e.vegan,e=>{e.navigate(s(`text`,{initializeComponent:e=>{e.setText(`Vegan only`)}},1))},e=>{e.navigate(s(`text`,{initializeComponent:e=>{e.setText(`Everything`)}},1))})}},1),s(`span`,{onConfig:e=>e.controls.add(t)})]})}var E=[`Vegan`,`Vegetarian`,`Gluten free`,`Dairy free`],D=[`Small`,`Medium`,`Large`];function O(){let e=r({diets:[`Vegan`],size:`Medium`});return s(h,{gap:`lg`,runover:{},childs:[s(v,{selection:`multiple`,label:`Diet`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.diets,t=>{let n=e;n!=null&&typeof n.diets!=`function`&&(n.diets=t)})}},childs:[s({initializeComponent:e=>{e.bindings.list(()=>E??[],e=>s(m,{indexkey:()=>e,text:e,runover:{},childs:[]}))}})]}),s(`span`,{initializeComponent:t=>{t.bindings.method(()=>`Diet: ${e.diets.join(`, `)||`any`}`)}},1),s(v,{selection:`single`,label:`Size`,value:()=>e.size,onValueChanged:t=>e.size=t.value,runover:{},childs:[s({initializeComponent:e=>{e.bindings.list(()=>D??[],e=>s(m,{indexkey:()=>e,text:e,runover:{},childs:[]}))}})]}),s(`span`,{initializeComponent:t=>{t.bindings.method(()=>`Size: ${e.size??`none`}`)}},1)]})}var k=[`filled`,`outline`],A=()=>{let e=document.createElementNS(`http://www.w3.org/2000/svg`,`svg`);return e.setAttribute(`viewBox`,`0 0 16 16`),e.innerHTML=`<path d="M8 1.5l1.9 4.1 4.4.5-3.3 3 .9 4.4L8 11.3l-3.9 2.2.9-4.4-3.3-3 4.4-.5z" fill="currentColor"/>`,e};function j(){return s(h,{runover:{},childs:[s({initializeComponent:e=>{e.bindings.list(()=>k??[],e=>s(h,{indexkey:()=>e,orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[s(m,{text:`Rest`,variant:e,clickable:!0,runover:{},childs:[]}),s(m,{text:`Selected`,variant:e,selectable:!0,selected:!0,runover:{},childs:[]}),s(m,{text:`Icon`,variant:e,icon:A(),clickable:!0,runover:{},childs:[]}),s(m,{text:`Ada Lovelace`,variant:e,avatar:{name:`Ada Lovelace`},removable:!0,runover:{},childs:[]}),s(m,{text:`Removable`,variant:e,removable:!0,runover:{},childs:[]}),s(m,{text:`Disabled`,variant:e,selectable:!0,disabled:!0,runover:{},childs:[]})]}))}})]})}var M=[`Ada Lovelace`,`Alan Turing`,`Grace Hopper`,`Edsger Dijkstra`];function N(){let e=r({people:M.map(e=>({name:e}))});return s(h,{runover:{},childs:[s(v,{label:`Invited`,runover:{},childs:[s({initializeComponent:t=>{t.bindings.list(()=>e&&e.people!==null&&e.people!==void 0?e.people:[],t=>s(m,{indexkey:()=>t.name,text:t.name,avatar:{name:t.name},removable:!0,onRemove:()=>e.people.splice(e.people.indexOf(t),1),runover:{},childs:[]}))}})]}),s(i,{text:`Invite everyone again`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.people.splice(0,e.people.length,...M.map(e=>({name:e}))))}},childs:[]})]})}var P=[`sm`,`md`,`lg`];function F(){return s(h,{runover:{},childs:[s({initializeComponent:e=>{e.bindings.list(()=>P??[],e=>s(h,{indexkey:()=>e,orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[s(m,{text:e,size:e,selectable:!0,runover:{},childs:[]}),s(m,{text:`Grace Hopper`,size:e,avatar:{name:`Grace Hopper`},removable:!0,runover:{},childs:[]})]}))}})]})}var I=[`standard`,`accent`,`info`,`success`,`caution`,`danger`],L=[`filled`,`outline`];function R(){return s(h,{runover:{},childs:[s({initializeComponent:e=>{e.bindings.list(()=>L??[],e=>s(h,{indexkey:()=>e,orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[s({initializeComponent:t=>{t.bindings.list(()=>I??[],t=>s(m,{indexkey:()=>t,text:t,tone:t,variant:e,runover:{},childs:[]}))}})]}))}})]})}var z=g(Object.assign({"./examples/Groups.tsx":y,"./examples/Looks.tsx":b,"./examples/Programmatic.tsx":x,"./examples/Removing.tsx":S,"./examples/Sizes.tsx":C,"./examples/Tones.tsx":w})),B=[[`text`,"`Bind<string>`","`''`",`The text.`],[`value`,"`Bind<unknown>`",`Its text`,`The value it represents in a group.`],[`icon`,"`Bind<IconSource | null>`","`null`",`An icon before the text: an image address, an element or a component.`],[`avatar`,"`Bind<AvatarProps | null>`","`null`",`An avatar before the text (its props; the chip sets the size).`],[`selectable`,"`Bind<boolean>`","`false`",`Pressing the chip toggles it, as a filter. In a group with selection, the group controls it.`],[`selected`,"`Bind<boolean>`","`false`",`Indicates whether the chip is on.`],[`clickable`,"`Bind<boolean>`","`false`","Lets the chip be pressed like a button (`onclick`)."],[`removable`,"`Bind<boolean>`","`false`","Adds a remove button after the text. The button, Delete and Backspace raise `onRemove`."],[`variant`,"`Bind<ChipVariant>`",`Set by the design language`,"`filled` or `outline`. Material draws chips outlined, and the other design languages draw them filled."],[`tone`,"`Bind<ChipTone>`","`'standard'`","`standard`, `accent`, `info`, `success`, `caution` or `danger`. A selected chip shows the selection color instead."],[`size`,"`Bind<ControlSize>`","`'md'`","`sm`, `md`, `lg`."],[`enabled, visible, tabStop`,`see Control`,``,`Properties shared by all controls.`]],V=[[`onRemove`,"`ChipRemoveEventArgs`","Occurs when the user requests removal (`byKeyboard`). Your code performs the removal."],[`onSelectedChanged`,"`ChipSelectedChangedEventArgs`","Occurs when the chip is turned on or off (`selected`), either by the user or programmatically (`byUser`)."]],H=[[`every prop above`,`read/write`,`Accepts a value or a function, the same as the prop.`],[`avatarControl`,`read-only`,`The avatar before the text, if there is one.`]],U=[[`remove()`,"`void`","Requests removal, as the remove button does (raises `onRemove`)."]],W=[[`selection`,"`Bind<ChipGroupSelection>`","`'none'`","`none`, `single`, `multiple`."],[`value`,"`Bind<unknown>`","`null` / `[]`","The value of the selected chip (`single`), or an array of selected values (`multiple`). A change produces a new array. `x-model` provides two-way binding."],[`wrap`,"`Bind<boolean>`","`true`","`false` keeps the chips on one line that scrolls."],[`label`,"`Bind<string>`","`''`",`The accessible name of the group (“Diet”).`]],G=[[`onValueChanged`,`event`,"Occurs when the value changes (`value`), either through user input or programmatically (`byUser`)."],[`chips`,`read-only`,`The chips in order, including those from JSX lists.`],[`isSelected(value)`,"`boolean`","Indicates whether the chip for `value` is selected."]],K=[[`Enter, Space`,`Presses the chip, which toggles a selectable chip or selects one in a group.`],[`Delete, Backspace`,`Requests removal of a removable chip.`],[`Arrow keys, Home, End`,`In a group, moves between the chips. The group has one Tab stop, on the chip focused last.`]],q=[[`Selectable`,"A button with `aria-pressed`."],[`In a group that selects`,"The group is a `listbox` (`aria-multiselectable` for multiple selection), and each chip is an `option` with `aria-selected`."],[`Remove`,`The remove button is named “Remove Ada” in the kit language. Keyboard users reach it with Delete on the chip.`],[`Disabled state`,"Removed from the Tab order and marked with `aria-disabled`."]],J=[[`.mx-chip`,"The chip. `data-size`, `data-variant`, `data-selected`, `data-pressable`, `data-removable`, `data-lead`, `data-check`, `data-disabled`."],[`.mx-chip__check, .mx-chip__icon, .mx-chip__avatar`,`The content before the text.`],[`.mx-chip__text, .mx-chip__remove`,`The text and the remove button.`],[`.mx-chip-group`,"The group. `data-wrap`."]],Y=[[`chip.chip`,"Unit: the chip, filled at rest, then `outline`, each tone filled and outlined (`accent` … `danger`, `outline-*`), and `selected`, `hover`, `pressed`, `focus` and `disabled`."],[`chip.icon, chip.remove`,"Units: the icon or check mark, and the remove button (`hover`, `pressed`)."],[`chip.height.*, chip.font-size.*, chip.padding.*, chip.icon-inset.*, chip.gap.*`,`The chip, its text and its spacing, per size.`],[`chip.icon-size.*, chip.avatar-size.*, chip.remove-size.*`,`The content before and after the text, per size. An avatar and the remove button have the same inset from the edge as from the top and bottom.`],[`chip.variant, chip.check`,`The default appearance, and whether a selected chip shows a check mark (Material).`],[`chip-group.gap`,`The space between chips.`]];function X(){return l({initializeComponent:e=>{{let t=s(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=s(c,{text:`A compact element with short text and an optional leading icon or avatar. Use it as a filter, as a choice among a few options, or to represent a selected item that can be removed. A group handles single or multiple selection and arrow key navigation.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let r=s(a,{anchor:`import`,title:`Import`,runover:{},childs:[s(n,{code:`
import { Chip, ChipGroup } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=s(a,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[s(`p`,{initializeComponent:e=>{let t=s(c,{text:"Every prop accepts a value or a function. When you create the component with `new`, set the same properties programmatically.",runover:{},childs:[]});e.controls.add(t)}},1),s(o,{files:z(`Programmatic.tsx`),runover:{},childs:[s(T,{runover:{},childs:[]})]})]});e.controls.add(i);let l=s(a,{anchor:`looks`,title:`Appearance and states`,runover:{},childs:[s(o,{files:z(`Looks.tsx`),runover:{},childs:[s(j,{runover:{},childs:[]})]})]});e.controls.add(l);let u=s(a,{anchor:`tones`,title:`Tones`,runover:{},childs:[s(o,{files:z(`Tones.tsx`),runover:{},childs:[s(R,{runover:{},childs:[]})]})]});e.controls.add(u);let f=s(a,{anchor:`sizes`,title:`Sizes`,runover:{},childs:[s(o,{files:z(`Sizes.tsx`),runover:{},childs:[s(F,{runover:{},childs:[]})]})]});e.controls.add(f);let p=s(a,{anchor:`groups`,title:`Selection in a group`,runover:{},childs:[s(`p`,{initializeComponent:e=>{let t=s(c,{text:"`selection` turns chips into selectable options. `value` holds their values, and `onValueChanged` reports changes.",runover:{},childs:[]});e.controls.add(t)}},1),s(o,{files:z(`Groups.tsx`),runover:{},childs:[s(O,{runover:{},childs:[]})]})]});e.controls.add(p);let m=s(a,{anchor:`removing`,title:`Removing chips`,runover:{},childs:[s(`p`,{initializeComponent:e=>{let t=s(c,{text:"A removable chip only sends a request. Remove the item from your list in `onRemove`, and the group updates to match.",runover:{},childs:[]});e.controls.add(t)}},1),s(o,{files:z(`Removing.tsx`),runover:{},childs:[s(N,{runover:{},childs:[]})]})]});e.controls.add(m);let h=s(a,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[s(d,{head:[`Key`,`Description`],rows:K,runover:{},childs:[]})]});e.controls.add(h);let g=s(a,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[s(d,{head:[`Topic`,`Details`],rows:q,runover:{},childs:[]})]});e.controls.add(g);let _=s(a,{anchor:`i18n`,title:`Localization`,runover:{},childs:[s(`p`,{initializeComponent:e=>{let t=s(c,{text:"The remove button's name is the `removeItem` kit string (“Remove {text}”) and changes with the kit language (`uiLocale`).",runover:{},childs:[]});e.controls.add(t)}},1)]});e.controls.add(_);let v=s(a,{anchor:`styling`,title:`Styling`,runover:{},childs:[s(d,{head:[`Hook`,`Description`],rows:J,runover:{},childs:[]}),s(`h3`,{initializeComponent:e=>{let t=s(c,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),s(d,{head:[`Token`,`Description`],rows:Y,runover:{},childs:[]})]});e.controls.add(v);let y=s(a,{anchor:`api`,title:`API reference`,runover:{},childs:[s(`h3`,{initializeComponent:e=>{let t=s(c,{text:`Chip props`,runover:{},childs:[]});e.controls.add(t)}},1),s(d,{head:[`Prop`,`Type`,`Default`,`Description`],rows:B,runover:{},childs:[]}),s(`h3`,{initializeComponent:e=>{let t=s(c,{text:`Chip events`,runover:{},childs:[]});e.controls.add(t)}},1),s(d,{head:[`Event`,`Arguments`,`Description`],rows:V,runover:{},childs:[]}),s(`h3`,{initializeComponent:e=>{let t=s(c,{text:`Chip properties`,runover:{},childs:[]});e.controls.add(t)}},1),s(d,{head:[`Property`,`Access`,`Description`],rows:H,runover:{},childs:[]}),s(`h3`,{initializeComponent:e=>{let t=s(c,{text:`Chip methods`,runover:{},childs:[]});e.controls.add(t)}},1),s(d,{head:[`Method`,`Returns`,`Description`],rows:U,runover:{},childs:[]}),s(`h3`,{initializeComponent:e=>{let t=s(c,{text:`ChipGroup props`,runover:{},childs:[]});e.controls.add(t)}},1),s(d,{head:[`Prop`,`Type`,`Default`,`Description`],rows:W,runover:{},childs:[]}),s(`h3`,{initializeComponent:e=>{let t=s(c,{text:`ChipGroup events, properties and methods`,runover:{},childs:[]});e.controls.add(t)}},1),s(d,{head:[`Member`,`Type`,`Description`],rows:G,runover:{},childs:[]})]});e.controls.add(y)}}})}export{X as default};