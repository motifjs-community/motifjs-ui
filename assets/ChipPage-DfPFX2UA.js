import{Qn as e,Zn as t,er as n,n as r}from"./next-id-CtzpBrBT.js";import{t as i}from"./Chip-rHQAJ4VA.js";import{t as a}from"./ChipGroup-DGo9euC2.js";import{t as o}from"./Stack-wRt1e9tO.js";import{a as s,i as c,n as l,r as u,t as d}from"./docs-B_LZlyP5.js";import{t as f}from"./sources-BXVvOiIY.js";var p=`import { reactive } from '@motifx/core';\r
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
`,m=`import { Chip, Stack, type ChipVariant } from '@motifx-community/ui';\r
\r
const VARIANTS: ChipVariant[] = ['filled', 'outline'];\r
\r
// An inline star, so that the example needs no icon set.\r
const star = () => (\r
  <svg viewBox="0 0 16 16">\r
    <path d="M8 1.5l1.9 4.1 4.4.5-3.3 3 .9 4.4L8 11.3l-3.9 2.2.9-4.4-3.3-3 4.4-.5z" fill="currentColor" />\r
  </svg>\r
);\r
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
`,h=`import { reactive } from '@motifx/core';\r
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
`,g=`import { reactive } from '@motifx/core';\r
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
`,_=`import { Chip, Stack, type ControlSize } from '@motifx-community/ui';\r
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
`,v=`import { Chip, Stack, type ChipTone, type ChipVariant } from '@motifx-community/ui';\r
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
`;function y(){let e=n({vegan:!1}),r=new i({text:`Spicy`,selectable:!0});return t(o,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(i,{text:`Vegan`,selectable:!0,selected:()=>e.vegan,onSelectedChanged:t=>e.vegan=t.selected,runover:{},childs:[]}),t(`span`,{initializeComponent:n=>{n.bindings.ternary(()=>e.vegan,e=>{e.navigate(t(`text`,{initializeComponent:e=>{e.setText(`Vegan only`)}},1))},e=>{e.navigate(t(`text`,{initializeComponent:e=>{e.setText(`Everything`)}},1))})}},1),t(`span`,{onConfig:e=>e.controls.add(r)})]})}var b=[`Vegan`,`Vegetarian`,`Gluten free`,`Dairy free`],x=[`Small`,`Medium`,`Large`];function S(){let e=n({diets:[`Vegan`],size:`Medium`});return t(o,{gap:`lg`,runover:{},childs:[t(a,{selection:`multiple`,label:`Diet`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.diets,t=>{let n=e;n!=null&&typeof n.diets!=`function`&&(n.diets=t)})}},childs:[t({initializeComponent:e=>{e.bindings.list(()=>b??[],e=>t(i,{indexkey:()=>e,text:e,runover:{},childs:[]}))}})]}),t(`span`,{initializeComponent:t=>{t.bindings.method(()=>`Diet: ${e.diets.join(`, `)||`any`}`)}},1),t(a,{selection:`single`,label:`Size`,value:()=>e.size,onValueChanged:t=>e.size=t.value,runover:{},childs:[t({initializeComponent:e=>{e.bindings.list(()=>x??[],e=>t(i,{indexkey:()=>e,text:e,runover:{},childs:[]}))}})]}),t(`span`,{initializeComponent:t=>{t.bindings.method(()=>`Size: ${e.size??`none`}`)}},1)]})}var C=[`filled`,`outline`],w=()=>t(`svg`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({viewBox:`0 0 16 16`});let n=t(`path`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({d:`M8 1.5l1.9 4.1 4.4.5-3.3 3 .9 4.4L8 11.3l-3.9 2.2.9-4.4-3.3-3 4.4-.5z`,fill:`currentColor`})}});e.controls.add(n)}});function T(){return t(o,{runover:{},childs:[t({initializeComponent:e=>{e.bindings.list(()=>C??[],e=>t(o,{indexkey:()=>e,orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(i,{text:`Rest`,variant:e,clickable:!0,runover:{},childs:[]}),t(i,{text:`Selected`,variant:e,selectable:!0,selected:!0,runover:{},childs:[]}),t(i,{text:`Icon`,variant:e,icon:w(),clickable:!0,runover:{},childs:[]}),t(i,{text:`Ada Lovelace`,variant:e,avatar:{name:`Ada Lovelace`},removable:!0,runover:{},childs:[]}),t(i,{text:`Removable`,variant:e,removable:!0,runover:{},childs:[]}),t(i,{text:`Disabled`,variant:e,selectable:!0,disabled:!0,runover:{},childs:[]})]}))}})]})}var E=[`Ada Lovelace`,`Alan Turing`,`Grace Hopper`,`Edsger Dijkstra`];function D(){let e=n({people:E.map(e=>({name:e}))});return t(o,{runover:{},childs:[t(a,{label:`Invited`,runover:{},childs:[t({initializeComponent:n=>{n.bindings.list(()=>e&&e.people!==null&&e.people!==void 0?e.people:[],n=>t(i,{indexkey:()=>n.name,text:n.name,avatar:{name:n.name},removable:!0,onRemove:()=>e.people.splice(e.people.indexOf(n),1),runover:{},childs:[]}))}})]}),t(r,{text:`Invite everyone again`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.people.splice(0,e.people.length,...E.map(e=>({name:e}))))}},childs:[]})]})}var O=[`sm`,`md`,`lg`];function k(){return t(o,{runover:{},childs:[t({initializeComponent:e=>{e.bindings.list(()=>O??[],e=>t(o,{indexkey:()=>e,orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(i,{text:e,size:e,selectable:!0,runover:{},childs:[]}),t(i,{text:`Grace Hopper`,size:e,avatar:{name:`Grace Hopper`},removable:!0,runover:{},childs:[]})]}))}})]})}var A=[`standard`,`accent`,`info`,`success`,`caution`,`danger`],j=[`filled`,`outline`];function M(){return t(o,{runover:{},childs:[t({initializeComponent:e=>{e.bindings.list(()=>j??[],e=>t(o,{indexkey:()=>e,orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t({initializeComponent:n=>{n.bindings.list(()=>A??[],n=>t(i,{indexkey:()=>n,text:n,tone:n,variant:e,runover:{},childs:[]}))}})]}))}})]})}var N=f(Object.assign({"./examples/Groups.tsx":p,"./examples/Looks.tsx":m,"./examples/Programmatic.tsx":h,"./examples/Removing.tsx":g,"./examples/Sizes.tsx":_,"./examples/Tones.tsx":v})),P=[[`text`,"`Bind<string>`","`''`",`The text.`],[`value`,"`Bind<unknown>`",`Its text`,`The value it represents in a group.`],[`icon`,"`Bind<IconSource | null>`","`null`",`An icon before the text: an image address or a component.`],[`avatar`,"`Bind<AvatarProps | null>`","`null`",`An avatar before the text (its props; the chip sets the size).`],[`selectable`,"`Bind<boolean>`","`false`",`Pressing the chip toggles it, as a filter. In a group with selection, the group controls it.`],[`selected`,"`Bind<boolean>`","`false`",`Indicates whether the chip is on.`],[`clickable`,"`Bind<boolean>`","`false`","Lets the chip be pressed like a button (`onclick`)."],[`removable`,"`Bind<boolean>`","`false`","Adds a remove button after the text. The button, Delete and Backspace raise `onRemove`."],[`variant`,"`Bind<ChipVariant>`",`Set by the design language`,"`filled` or `outline`. Material draws chips outlined, and the other design languages draw them filled."],[`tone`,"`Bind<ChipTone>`","`'standard'`","`standard`, `accent`, `info`, `success`, `caution` or `danger`. A selected chip shows the selection color instead."],[`size`,"`Bind<ControlSize>`","`'md'`","`sm`, `md`, `lg`."],[`enabled, visible, tabStop`,`see Control`,``,`Properties shared by all controls.`]],F=[[`onRemove`,"`ChipRemoveEventArgs`","Occurs when the user requests removal (`byKeyboard`). Your code performs the removal."],[`onSelectedChanged`,"`ChipSelectedChangedEventArgs`","Occurs when the chip is turned on or off (`selected`), either by the user or programmatically (`byUser`)."]],I=[[`every prop above`,`read/write`,`Accepts a value or a function, the same as the prop.`],[`avatarControl`,`read-only`,`The avatar before the text, if there is one.`]],L=[[`remove()`,"`void`","Requests removal, as the remove button does (raises `onRemove`)."]],R=[[`selection`,"`Bind<ChipGroupSelection>`","`'none'`","`none`, `single`, `multiple`."],[`value`,"`Bind<unknown>`","`null` / `[]`","The value of the selected chip (`single`), or an array of selected values (`multiple`). A change produces a new array. `x-model` provides two-way binding."],[`wrap`,"`Bind<boolean>`","`true`","`false` keeps the chips on one line that scrolls."],[`label`,"`Bind<string>`","`''`",`The accessible name of the group (“Diet”).`]],z=[[`onValueChanged`,`event`,"Occurs when the value changes (`value`), either through user input or programmatically (`byUser`)."],[`chips`,`read-only`,`The chips in order, including those from JSX lists.`],[`isSelected(value)`,"`boolean`","Indicates whether the chip for `value` is selected."]],B=[[`Enter, Space`,`Presses the chip, which toggles a selectable chip or selects one in a group.`],[`Delete, Backspace`,`Requests removal of a removable chip.`],[`Arrow keys, Home, End`,`In a group, moves between the chips. The group has one Tab stop, on the chip focused last.`]],V=[[`Selectable`,"A button with `aria-pressed`."],[`In a group that selects`,"The group is a `listbox` (`aria-multiselectable` for multiple selection), and each chip is an `option` with `aria-selected`."],[`Remove`,`The remove button is named “Remove Ada” in the kit language. Keyboard users reach it with Delete on the chip.`],[`Disabled state`,"Removed from the Tab order and marked with `aria-disabled`."]],H=[[`.mx-chip`,"The chip. `data-size`, `data-variant`, `data-selected`, `data-pressable`, `data-removable`, `data-lead`, `data-check`, `data-disabled`."],[`.mx-chip__check, .mx-chip__icon, .mx-chip__avatar`,`The content before the text.`],[`.mx-chip__text, .mx-chip__remove`,`The text and the remove button.`],[`.mx-chip-group`,"The group. `data-wrap`."]],U=[[`chip.chip`,"Unit: the chip, filled at rest, then `outline`, each tone filled and outlined (`accent` … `danger`, `outline-*`), and `selected`, `hover`, `pressed`, `focus` and `disabled`."],[`chip.icon, chip.remove`,"Units: the icon or check mark, and the remove button (`hover`, `pressed`)."],[`chip.height.*, chip.font-size.*, chip.padding.*, chip.icon-inset.*, chip.gap.*`,`The chip, its text and its spacing, per size.`],[`chip.icon-size.*, chip.avatar-size.*, chip.remove-size.*`,`The content before and after the text, per size. An avatar and the remove button have the same inset from the edge as from the top and bottom.`],[`chip.variant, chip.check`,`The default appearance, and whether a selected chip shows a check mark (Material).`],[`chip-group.gap`,`The space between chips.`]];function W(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(u,{text:`A compact element with short text and an optional leading icon or avatar. Use it as a filter, as a choice among a few options, or to represent a selected item that can be removed. A group handles single or multiple selection and arrow key navigation.`,runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(c,{anchor:`import`,title:`Import`,runover:{},childs:[t(s,{code:`
import { Chip, ChipGroup } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(c,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(u,{text:"Every prop accepts a value or a function. When you create the component with `new`, set the same properties programmatically.",runover:{},childs:[]});e.controls.add(n)}},1),t(l,{files:N(`Programmatic.tsx`),runover:{},childs:[t(y,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(c,{anchor:`looks`,title:`Appearance and states`,runover:{},childs:[t(l,{files:N(`Looks.tsx`),runover:{},childs:[t(T,{runover:{},childs:[]})]})]});e.controls.add(a);let o=t(c,{anchor:`tones`,title:`Tones`,runover:{},childs:[t(l,{files:N(`Tones.tsx`),runover:{},childs:[t(M,{runover:{},childs:[]})]})]});e.controls.add(o);let f=t(c,{anchor:`sizes`,title:`Sizes`,runover:{},childs:[t(l,{files:N(`Sizes.tsx`),runover:{},childs:[t(k,{runover:{},childs:[]})]})]});e.controls.add(f);let p=t(c,{anchor:`groups`,title:`Selection in a group`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(u,{text:"`selection` turns chips into selectable options. `value` holds their values, and `onValueChanged` reports changes.",runover:{},childs:[]});e.controls.add(n)}},1),t(l,{files:N(`Groups.tsx`),runover:{},childs:[t(S,{runover:{},childs:[]})]})]});e.controls.add(p);let m=t(c,{anchor:`removing`,title:`Removing chips`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(u,{text:"A removable chip only sends a request. Remove the item from your list in `onRemove`, and the group updates to match.",runover:{},childs:[]});e.controls.add(n)}},1),t(l,{files:N(`Removing.tsx`),runover:{},childs:[t(D,{runover:{},childs:[]})]})]});e.controls.add(m);let h=t(c,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[t(d,{head:[`Key`,`Description`],rows:B,runover:{},childs:[]})]});e.controls.add(h);let g=t(c,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(d,{head:[`Topic`,`Details`],rows:V,runover:{},childs:[]})]});e.controls.add(g);let _=t(c,{anchor:`i18n`,title:`Localization`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(u,{text:"The remove button's name is the `removeItem` kit string (“Remove {text}”) and changes with the kit language (`uiLocale`).",runover:{},childs:[]});e.controls.add(n)}},1)]});e.controls.add(_);let v=t(c,{anchor:`styling`,title:`Styling`,runover:{},childs:[t(d,{head:[`Hook`,`Description`],rows:H,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Token`,`Description`],rows:U,runover:{},childs:[]})]});e.controls.add(v);let b=t(c,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`Chip props`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Prop`,`Type`,`Default`,`Description`],rows:P,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`Chip events`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Event`,`Arguments`,`Description`],rows:F,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`Chip properties`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Property`,`Access`,`Description`],rows:I,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`Chip methods`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Method`,`Returns`,`Description`],rows:L,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`ChipGroup props`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Prop`,`Type`,`Default`,`Description`],rows:R,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`ChipGroup events, properties and methods`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Member`,`Type`,`Description`],rows:z,runover:{},childs:[]})]});e.controls.add(b)}}})}export{W as default};