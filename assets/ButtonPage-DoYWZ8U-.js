import{Mt as e,a as t,an as n,h as r,i,n as a,nn as o,r as s,rn as c,t as l}from"./doc-B1CtlCkV.js";import{t as u}from"./Stack-AS0iyAxC.js";import{t as d}from"./sources-BXVvOiIY.js";import{t as f}from"./kit-texts-BRS-kYEc.js";var p=`import { reactive } from '@motifx/core';\r
import { Button } from '@motifx-community/ui';\r
\r
/** A button that shows a spinner while its work runs. */\r
export default function Busy() {\r
  const s = reactive({ sending: false });\r
\r
  const send = () => {\r
    s.sending = true;\r
    setTimeout(() => (s.sending = false), 1500);\r
  };\r
\r
  return <Button text="Send" tone="accent" busy={() => s.sending} onclick={send} />;\r
}\r
`,m=`import { reactive } from '@motifx/core';\r
import { Button } from '@motifx-community/ui';\r
\r
/** A disabled button leaves the Tab order; with focusableWhenDisabled it keeps its place. */\r
export default function Disabled() {\r
  const s = reactive({ enabled: false });\r
  return (\r
    <>\r
      <Button text="Toggle enabled" variant="outline" onclick={() => (s.enabled = !s.enabled)} />\r
      <Button text="Plain" enabled={() => s.enabled} />\r
      <Button text="Focusable" enabled={() => s.enabled} focusableWhenDisabled hint="Fill in the form first" />\r
    </>\r
  );\r
}\r
`,h=`import { Button, Stack } from '@motifx-community/ui';\r
\r
/** A button that opens a small form instead of a menu. */\r
export default function DropDown() {\r
  return (\r
    <Button\r
      text="Filter"\r
      variant="outline"\r
      dropDown={\r
        <Stack orientation="horizontal" wrap align="center" padding="sm">\r
          <label>\r
            From <input name="from" type="date" />\r
          </label>\r
          <label>\r
            To <input name="to" type="date" />\r
          </label>\r
        </Stack>\r
      }\r
    />\r
  );\r
}\r
`,g=`import { Button } from '@motifx-community/ui';\r
\r
const SaveIcon = () => (\r
  <svg viewBox="0 0 16 16" aria-hidden="true">\r
    <path d="M3 2.5h8l2.5 2.5v8.5h-10.5zM5.5 2.5v3.5h5v-3.5M5 13.5v-4h6v4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />\r
  </svg>\r
);\r
\r
/** An icon from JSX or from an image address, an icon-only button named by its hint, and JSX children. */\r
export default function IconAndChildren() {\r
  return (\r
    <>\r
      <Button text="Save" icon={() => <SaveIcon />} />\r
      <Button text="Next" icon="../favicon.svg" iconPosition="end" variant="outline" />\r
      <Button icon={() => <SaveIcon />} hint="Save" variant="ghost" />\r
      <Button tone="accent">\r
        Total <b>42</b>\r
      </Button>\r
    </>\r
  );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { Button, uiLocale } from '@motifx-community/ui';\r
import { kitTexts } from '../../../shared/kit-texts';\r
\r
/** The name of a split button's arrow, from uiLocale: an included language or a custom string. */\r
export default function Localization() {\r
  const s = reactive({ lang: 'en' });\r
\r
  const toggle = () => {\r
    s.lang = s.lang === 'en' ? 'tr' : 'en';\r
    void uiLocale.use(s.lang);\r
  };\r
\r
  return (\r
    <>\r
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />\r
      <Button text="Own text" variant="outline" onclick={() => (uiLocale.strings = { ...uiLocale.strings, moreOptions: 'Mehr' })} />\r
      <span>\r
        The arrow above is named <output class="arrow-name">{() => kitTexts.strings.moreOptions}</output>\r
      </span>\r
    </>\r
  );\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { Button, type MenuItem } from '@motifx-community/ui';\r
\r
const NewIcon = () => (\r
  <svg viewBox="0 0 16 16" aria-hidden="true">\r
    <path d="M3 2.5h8l2.5 2.5v8.5h-10.5zM5.5 2.5v3.5h5v-3.5M5 13.5v-4h6v4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />\r
  </svg>\r
);\r
\r
/** A button that opens a menu: an icon, a disabled item, a check mark, group lines and & keys. */\r
export default function Menu() {\r
  const s = reactive({ last: '', wrap: true });\r
\r
  const fileMenu = (): MenuItem[] => [\r
    { text: '&New', icon: () => <NewIcon />, click: () => (s.last = 'New') },\r
    { text: '&Open…', click: () => (s.last = 'Open…') },\r
    { text: 'Open &recent', enabled: false },\r
    { text: '&Word wrap', checked: () => s.wrap, beginGroup: true, click: () => (s.wrap = !s.wrap) },\r
    { text: 'E&xit', beginGroup: true, click: () => (s.last = 'Exit') },\r
  ];\r
\r
  return (\r
    <>\r
      <Button text="&File" menu={fileMenu} variant="outline" />\r
      <span>\r
        Last: <output class="menu-log">{() => s.last || '—'}</output>\r
      </span>\r
    </>\r
  );\r
}\r
`,y=`import { reactive } from '@motifx/core';\r
import { Button, Stack } from '@motifx-community/ui';\r
\r
/** A button in JSX, and buttons created with \`new\`, added and bound programmatically. */\r
export default function Programmatic() {\r
  let added = 0;\r
  let toolbar: Stack | null = null;\r
\r
  const addProgrammatic = () => {\r
    const n = ++added;\r
    const state = reactive({ marks: '' });\r
    const b = new Button({ variant: 'outline' });\r
    b.text = () => \`Button \${n}\${state.marks}\`; // a function is tracked\r
    b.motif.on('click', () => (state.marks += ' ✓'));\r
    toolbar?.controls.add(b);\r
  };\r
\r
  return (\r
    <>\r
      <Button text="Add a button programmatically" onclick={addProgrammatic} />\r
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (toolbar = c)} />\r
    </>\r
  );\r
}\r
`,b=`import { reactive } from '@motifx/core';\r
import { Button } from '@motifx-community/ui';\r
\r
/** A split button: its own action, and an arrow that opens the menu. \`split\` can be switched off. */\r
export default function Split() {\r
  const s = reactive({ last: '', split: true });\r
  return (\r
    <>\r
      <Button\r
        text="Sa&ve"\r
        tone="accent"\r
        split={() => s.split}\r
        onclick={() => (s.last = 'Save')}\r
        menu={[\r
          { text: 'Save &as…', click: () => (s.last = 'Save as…') },\r
          { text: 'Save a&ll', click: () => (s.last = 'Save all') },\r
        ]}\r
      />\r
      <Button text="split" size="sm" variant="ghost" toggle x-model={() => s.split} />\r
      <span>\r
        Last: <output class="split-log">{() => s.last || '—'}</output>\r
      </span>\r
    </>\r
  );\r
}\r
`,x=`import { reactive } from '@motifx/core';\r
import { Button } from '@motifx-community/ui';\r
\r
/** A toggle button bound two-way with x-model. */\r
export default function Toggle() {\r
  const s = reactive({ bold: false });\r
  return (\r
    <>\r
      <Button text="Bold" toggle x-model={() => s.bold} />\r
      <span>\r
        bold: <output class="bold-state">{() => String(s.bold)}</output>\r
      </span>\r
    </>\r
  );\r
}\r
`,S=`import { reactive } from '@motifx/core';\r
import { Button, Stack, type ButtonSize, type ButtonTone, type ButtonVariant } from '@motifx-community/ui';\r
\r
const VARIANTS: ButtonVariant[] = ['solid', 'outline', 'ghost'];\r
const TONES: ButtonTone[] = ['standard', 'accent', 'danger'];\r
const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];\r
\r
/** Every tone in every variant, in the size picked above them. */\r
export default function VariantsTonesSizes() {\r
  const s = reactive({ size: 'md' as ButtonSize });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Size">\r
        {SIZES.map((size) => (\r
          <Button\r
            key={size}\r
            text={size}\r
            size="sm"\r
            variant={() => (s.size === size ? 'solid' : 'ghost')}\r
            aria-pressed={() => s.size === size}\r
            onclick={() => (s.size = size)}\r
          />\r
        ))}\r
      </Stack>\r
      {TONES.map((tone) => (\r
        <Stack key={tone} orientation="horizontal" wrap align="center">\r
          {VARIANTS.map((variant) => (\r
            <Button key={variant} text={\`\${tone} \${variant}\`} tone={tone} variant={variant} size={() => s.size} />\r
          ))}\r
        </Stack>\r
      ))}\r
    </>\r
  );\r
}\r
`;function C(){let e=n({sending:!1}),t=()=>{e.sending=!0,setTimeout(()=>e.sending=!1,1500)};return o(r,{text:`Send`,tone:`accent`,busy:()=>e.sending,runover:{initializeComponent:e=>{e.motif.on(`click`,t)}},childs:[]})}function w(){let e=n({enabled:!1});return c({initializeComponent:t=>{{let n=o(r,{text:`Toggle enabled`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.enabled=!e.enabled)}},childs:[]});t.controls.add(n);let i=o(r,{text:`Plain`,enabled:()=>e.enabled,runover:{},childs:[]});t.controls.add(i);let a=o(r,{text:`Focusable`,enabled:()=>e.enabled,focusableWhenDisabled:!0,hint:`Fill in the form first`,runover:{},childs:[]});t.controls.add(a)}}})}function T(){return o(r,{text:`Filter`,variant:`outline`,dropDown:o(u,{orientation:`horizontal`,wrap:!0,align:`center`,padding:`sm`,runover:{},childs:[o(`label`,{initializeComponent:e=>{let t=o(`text`,{initializeComponent:e=>{e.setText(`From `)}},1);e.controls.add(t);let n=o(`input`,{initializeComponent:e=>{e.attr.add({name:`from`,type:`date`})}},1);e.controls.add(n)}},1),o(`label`,{initializeComponent:e=>{let t=o(`text`,{initializeComponent:e=>{e.setText(`To `)}},1);e.controls.add(t);let n=o(`input`,{initializeComponent:e=>{e.attr.add({name:`to`,type:`date`})}},1);e.controls.add(n)}},1)]}),runover:{},childs:[]})}function E(){let e=0,t=null,i=()=>{let i=++e,a=n({marks:``}),o=new r({variant:`outline`});o.text=()=>`Button ${i}${a.marks}`,o.motif.on(`click`,()=>a.marks+=` ✓`),t?.controls.add(o)};return c({initializeComponent:e=>{{let n=o(r,{text:`Add a button programmatically`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]});e.controls.add(n);let a=o(u,{orientation:`horizontal`,wrap:!0,align:`center`,ref:e=>t=e,runover:{},childs:[]});e.controls.add(a)}}})}var D=()=>o(`svg`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({viewBox:`0 0 16 16`,"aria-hidden":`true`});let t=o(`path`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({d:`M3 2.5h8l2.5 2.5v8.5h-10.5zM5.5 2.5v3.5h5v-3.5M5 13.5v-4h6v4`,fill:`none`,stroke:`currentColor`,"stroke-width":`1.2`,"stroke-linejoin":`round`})}});e.controls.add(t)}});function O(){return c({initializeComponent:e=>{{let t=o(r,{text:`Save`,icon:()=>o(D,{runover:{},childs:[]}),runover:{},childs:[]});e.controls.add(t);let n=o(r,{text:`Next`,icon:`../favicon.svg`,iconPosition:`end`,variant:`outline`,runover:{},childs:[]});e.controls.add(n);let i=o(r,{icon:()=>o(D,{runover:{},childs:[]}),hint:`Save`,variant:`ghost`,runover:{},childs:[]});e.controls.add(i);let a=o(r,{tone:`accent`,runover:{},childs:[o(`text`,{initializeComponent:e=>{e.setText(`Total `)}},1),o(`b`,{initializeComponent:e=>{let t=o(`text`,{initializeComponent:e=>{e.setText(`42`)}},1);e.controls.add(t)}},1)]});e.controls.add(a)}}})}function k(){let t=n({lang:`en`}),i=()=>{t.lang=t.lang===`en`?`tr`:`en`,e.use(t.lang)};return c({initializeComponent:n=>{{let a=o(r,{text:()=>t.lang===`en`?`Language: English`:`Dil: Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]});n.controls.add(a);let s=o(r,{text:`Own text`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.strings={...e.strings,moreOptions:`Mehr`})}},childs:[]});n.controls.add(s);let c=o(`span`,{initializeComponent:e=>{let t=o(`text`,{initializeComponent:e=>{e.setText(`The arrow above is named `)}},1);e.controls.add(t);let n=o(`output`,{initializeComponent:e=>{e.class.add(`arrow-name`),e.bindings.method(()=>f.strings.moreOptions)}},1);e.controls.add(n)}},1);n.controls.add(c)}}})}var A=()=>o(`svg`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({viewBox:`0 0 16 16`,"aria-hidden":`true`});let t=o(`path`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({d:`M3 2.5h8l2.5 2.5v8.5h-10.5zM5.5 2.5v3.5h5v-3.5M5 13.5v-4h6v4`,fill:`none`,stroke:`currentColor`,"stroke-width":`1.2`,"stroke-linejoin":`round`})}});e.controls.add(t)}});function j(){let e=n({last:``,wrap:!0}),t=()=>[{text:`&New`,icon:()=>o(A,{runover:{},childs:[]}),click:()=>e.last=`New`},{text:`&Open…`,click:()=>e.last=`Open…`},{text:`Open &recent`,enabled:!1},{text:`&Word wrap`,checked:()=>e.wrap,beginGroup:!0,click:()=>e.wrap=!e.wrap},{text:`E&xit`,beginGroup:!0,click:()=>e.last=`Exit`}];return c({initializeComponent:n=>{{let i=o(r,{text:`&File`,menu:t,variant:`outline`,runover:{},childs:[]});n.controls.add(i);let a=o(`span`,{initializeComponent:t=>{let n=o(`text`,{initializeComponent:e=>{e.setText(`Last: `)}},1);t.controls.add(n);let r=o(`output`,{initializeComponent:t=>{t.class.add(`menu-log`),t.bindings.method(()=>e.last||`—`)}},1);t.controls.add(r)}},1);n.controls.add(a)}}})}function M(){let e=n({last:``,split:!0});return c({initializeComponent:t=>{{let n=o(r,{text:`Sa&ve`,tone:`accent`,split:()=>e.split,menu:[{text:`Save &as…`,click:()=>e.last=`Save as…`},{text:`Save a&ll`,click:()=>e.last=`Save all`}],runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.last=`Save`)}},childs:[]});t.controls.add(n);let i=o(r,{text:`split`,size:`sm`,variant:`ghost`,toggle:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.split,t=>{let n=e;n!=null&&typeof n.split!=`function`&&(n.split=t)})}},childs:[]});t.controls.add(i);let a=o(`span`,{initializeComponent:t=>{let n=o(`text`,{initializeComponent:e=>{e.setText(`Last: `)}},1);t.controls.add(n);let r=o(`output`,{initializeComponent:t=>{t.class.add(`split-log`),t.bindings.method(()=>e.last||`—`)}},1);t.controls.add(r)}},1);t.controls.add(a)}}})}function N(){let e=n({bold:!1});return c({initializeComponent:t=>{{let n=o(r,{text:`Bold`,toggle:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.bold,t=>{let n=e;n!=null&&typeof n.bold!=`function`&&(n.bold=t)})}},childs:[]});t.controls.add(n);let i=o(`span`,{initializeComponent:t=>{let n=o(`text`,{initializeComponent:e=>{e.setText(`bold: `)}},1);t.controls.add(n);let r=o(`output`,{initializeComponent:t=>{t.class.add(`bold-state`),t.bindings.method(()=>String(e.bold))}},1);t.controls.add(r)}},1);t.controls.add(i)}}})}var P=[`solid`,`outline`,`ghost`],F=[`standard`,`accent`,`danger`],I=[`sm`,`md`,`lg`];function L(){let e=n({size:`md`});return c({initializeComponent:t=>{{let n=o(u,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Size`,runover:{},childs:[o({initializeComponent:t=>{t.bindings.list(()=>I??[],t=>o(r,{indexkey:()=>t,text:t,size:`sm`,variant:()=>e.size===t?`solid`:`ghost`,"aria-pressed":()=>e.size===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.size=t)}},childs:[]}))}})]});t.controls.add(n),t.bindings.list(()=>F??[],t=>o(u,{indexkey:()=>t,orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o({initializeComponent:n=>{n.bindings.list(()=>P??[],n=>o(r,{indexkey:()=>n,text:`${t} ${n}`,tone:t,variant:n,size:()=>e.size,runover:{},childs:[]}))}})]}))}}})}var R=d(Object.assign({"./examples/Busy.tsx":p,"./examples/Disabled.tsx":m,"./examples/DropDown.tsx":h,"./examples/IconAndChildren.tsx":g,"./examples/Localization.tsx":_,"./examples/Menu.tsx":v,"./examples/Programmatic.tsx":y,"./examples/Split.tsx":b,"./examples/Toggle.tsx":x,"./examples/VariantsTonesSizes.tsx":S})),z=[[`text`,"`Bind<string>`","`''`","The caption. `&` marks the access key (`&Save` → Alt+S), and `&&` produces a literal `&`. JSX children follow it."],[`variant`,"`Bind<ButtonVariant>`","`'solid'`","`solid` (filled and pressable), `outline` (framed) or `ghost` (visible only on hover)."],[`tone`,"`Bind<ButtonTone>`","`'standard'`","`standard`, `accent` for the primary action, or `danger` for a destructive action."],[`size`,"`Bind<ButtonSize>`","`'md'`","`sm`, `md` or `lg`, which map to the control heights in the density tokens."],[`icon`,"`Bind<IconSource | null>`",`—`,"An image address, or any element or component (an `<svg>` in JSX, an icon font tag). It is decorative and hidden from screen readers."],[`iconPosition`,"`Bind<'start' | 'end'>`","`'start'`",`Places the icon before or after the text.`],[`stretch`,"`Bind<boolean>`","`false`",`Stretches to the full width of its container.`],[`type`,"`Bind<'button' | 'submit' | 'reset'>`","`'button'`","The native type. The default is `button`, so a button inside a form never submits by accident."],[`hint`,"`Bind<string>`","`''`","A tooltip (`title`). It also provides the name of an icon-only button."],[`toggle`,"`Bind<boolean>`","`false`","Makes it a toggle button. A click turns `pressed` on and off (`aria-pressed`)."],[`pressed`,"`Bind<boolean>`","`false`","The state of a toggle button. `x-model` provides two-way binding."],[`busy`,"`Bind<boolean>`","`false`","Indicates that work is in progress. A spinner appears over the content, clicks are ignored, the size is preserved and `aria-busy` is set."],[`focusableWhenDisabled`,"`Bind<boolean>`","`false`","When disabled, the button stays in the Tab order with `aria-disabled`, so a screen reader can find it and announce it as dimmed."],[`split`,"`Bind<boolean>`","`false`","With a menu, the button keeps its own action and an arrow next to it opens the menu. Without `split`, the whole button opens the menu."],[`menu`,"`Bind<readonly MenuItem[]>`",`—`,`The menu commands, read each time the menu opens.`],[`dropDown`,"`Bind<ComponentBase | null>`",`—`,`Any content to open instead of a menu, such as a picker or a small form.`],[`enabled / disabled, visible, tabStop, tabIndex`,`see Control`,``,`Properties shared by all controls.`]],B=[[`every prop above`,`read/write, reactive`,"Set programmatically with a value or a function, the same as the prop: `b.tone = () => this.state.tone` is tracked, and `b.tone = 'accent'` replaces it."],[`value`,`read/write`,"Maps to `pressed` for `x-model`."],[`opened`,`read/write, reactive`,`Indicates whether the menu or drop-down is open. Set it to open or close it.`],[`hasMenu`,`read-only`,"Indicates whether the button was created with `split`, `menu` or `dropDown`."]],V=[[`open()`,"`boolean`","Opens the menu or drop-down with focus on its first item. Returns `false` if there is nothing to open, or if the button is disabled or busy."],[`close()`,"`void`",`Closes it. If focus is inside, it returns to the part that opened it.`],[`refresh()`,"`void`","Your menu items can be plain or reactive, and the button reads them as they are. After changing them in place, call `refresh()`. An open menu shows the change immediately."],[`focus()`,"`boolean`",`Sets focus on the button, or on its main part if it has a menu.`]],H=[[`onclick`,"The DOM click event of the button, which runs its own action. With `split`, the arrow and the menu do not raise it. With a menu and no `split`, the click opens the menu."],[`onItemClick(e)`,"Occurs when a menu item is selected, after the item's own `click`. `e`: `{ item, source, event }`."]],U=[[`text`,"`Bind<string>`","The label. `&` marks the key that selects it while the menu is open."],[`icon`,"`Bind<IconSource>`",`An icon. A function is called each time the item is drawn.`],[`hint`,"`Bind<string>`",`The tooltip text.`],[`enabled`,"`Bind<boolean>`","`false` shows the item dimmed. It stays reachable but cannot be selected."],[`visible`,"`Bind<boolean>`","`false` removes the item."],[`checked`,"`Bind<boolean>`","When set, the item is a `menuitemcheckbox` and shows a check mark when `true`. Change it in `click`."],[`beginGroup`,"`Bind<boolean>`",`Draws a separator before the item.`],[`click(e)`,`function`,`Runs when the item is selected, after the menu closes.`],[`data`,"`unknown`",`A custom application value.`]],W=[[`Enter, Space`,"Presses the button. With a menu and no `split`, it opens the menu and moves focus to the first item."],["Alt + key (`&Save`)",`Presses the button (Control + Option + key on Apple platforms).`],[`Down / Up`,`On a button that opens a menu, or on the arrow of a split button, opens the menu and moves focus to the first or last item.`],[`Alt + Down`,`On the main part of a split button, opens the menu.`],[`In the menu: Down / Up`,`Moves to the next or previous item, wrapping at the ends. Disabled items are reachable.`],[`In the menu: Home / End`,`Moves to the first or last item.`],[`In the menu: a letter`,"Selects the item with that `&` key. Otherwise, focus moves to the next item that starts with that letter."],[`In the menu: Enter, Space`,`Selects the focused item.`],[`Escape`,`Closes the menu or drop-down, and focus returns to the part that opened it.`],[`Tab`,`Closes the menu and moves to the next control.`]],G=[[`Element`,"A native `<button>` (two with `split`: the button and the arrow), so forms, Enter, Space and screen readers work as expected."],[`Name`,'The text without the `&` marker. An icon-only button is named by its `hint` or by your `aria-label`. The arrow of a split button gets its name from `uiLocale` ("More options").'],[`Toggle buttons`,"`aria-pressed`."],[`Busy state`,'`aria-busy="true"`. The text remains readable under the spinner.'],[`Menu`,'`aria-haspopup="menu"` and `aria-expanded` on the part that opens the menu. The list has `role="menu"`, items are `menuitem` or `menuitemcheckbox` with `aria-checked`, disabled items have `aria-disabled`, and group separators are `separator`.'],[`Drop-down`,'`aria-haspopup="dialog"`. The popup has `role="dialog"` and is named by the button\'s text. Focus moves to its first field.'],[`Focus ring`,`Shown only during keyboard use, with the design system's double ring.`]],K=[[`.mx-button`,'The button, or the group of a button with a menu. `data-variant`, `data-tone`, `data-size`, `data-icon-position`, `data-stretch`, `data-pressed`, `data-busy`, `data-icon`, `data-mode="menu|split"`.'],[`.mx-button__face`,"The pressable part: the button itself, or `.mx-button__main` and `.mx-button__arrow`."],[`.mx-button__icon, .mx-button__chevron, .mx-button__spinner`,`The icon, the arrow glyph of a menu button and the busy spinner.`],[`.mx-popup`,'The surface the menu opens on (`data-side="bottom|top"`).'],[`.mx-menu, .mx-menu__item, .mx-menu__separator`,`The menu, its items and its group separators.`]],q=[[`button.face`,"Unit: the pressable part, with its frame (the bottom side is the key edge), its fill and state layer (`image`) and its focus ring (outline and `glow`). Each appearance is a state (`accent`, `danger`, `outline`, `outline-accent`, `ghost`, …), and each appearance has its own states (`hover`, `toggled-hover`, `open`, `pressed`, `focus`, `toggled`, `disabled`: `outline-hover`, `accent-pressed`, …). There are also `icon-only`, `busy`, and the `main` and `arrow` parts of a split button."],[`button.icon, button.caption, button.chevron, button.spinner, button.divider`,"Units: the icon, the text, the menu arrow (`open`), the busy spinner and the split button divider. Each appearance is a state."],[`button.height.{sm,md,lg}, button.padding.{sm,md,lg}, button.font-size.{sm,md,lg}, button.line-height.{sm,md,lg}`,`Sizes are defined by the density tokens.`],[`button.press-offset, button.icon-only-square, button.text-box, button.spinner-duration`,`The distance a solid button moves when pressed, the square icon button, the caption line box and the spinner rotation.`],[`popup.surface, menu.*`,`The popup surface and the menu items.`]];function J(){return c({initializeComponent:e=>{{let n=o(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=o(s,{text:"A native `<button>` styled with design tokens. It comes in three variants, three tones and three sizes, and supports an icon and an `&` access key. A button can act as a toggle, indicate that work is in progress, and open a menu or any other content, either from the whole button or from an arrow next to it with `split`, so the button keeps its own action.",runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(n);let r=o(i,{anchor:`import`,title:`Import`,runover:{},childs:[o(t,{code:`
import { Button, type MenuItem } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let c=o(i,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:`Both approaches are fully supported. Every prop accepts a value or a function, and a function that reads a reactive object keeps the button in sync with it. Setting a property programmatically works the same way.`,runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:R(`Programmatic.tsx`),runover:{},childs:[o(E,{runover:{},childs:[]})]})]});e.controls.add(c);let u=o(i,{anchor:`look`,title:`Variants, tones and sizes`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`solid` buttons have an opaque fill, a bottom edge, a highlight along the top and a slight movement when pressed. `outline` buttons have a frame, and `ghost` buttons show a background only on hover. The tone sets the colors, and the size sets the height from the density tokens. Turn on Compact above to see the difference.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:R(`VariantsTonesSizes.tsx`),stack:!0,runover:{},childs:[o(L,{runover:{},childs:[]})]})]});e.controls.add(u);let d=o(i,{anchor:`content`,title:`Text, icons and children`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`text` sets the caption, and JSX children follow it. `icon` accepts an image address or any element or component, placed before or after the text with `iconPosition`. A button with only an icon needs an accessible name, so give it a `hint`.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:R(`IconAndChildren.tsx`),runover:{},childs:[o(O,{runover:{},childs:[]})]})]});e.controls.add(d);let f=o(i,{anchor:`toggle`,title:`Toggle buttons`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"With `toggle`, a click turns `pressed` on and off. `x-model` provides two-way binding.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:R(`Toggle.tsx`),runover:{},childs:[o(N,{runover:{},childs:[]})]})]});e.controls.add(f);let p=o(i,{anchor:`busy`,title:`Busy state`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"While `busy` is set, a spinner appears over the content, clicks are ignored and the size does not change. The text remains available to screen readers, and the button gets `aria-busy`.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:R(`Busy.tsx`),runover:{},childs:[o(C,{runover:{},childs:[]})]})]});e.controls.add(p);let m=o(i,{anchor:`disabled`,title:`Disabled state`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"A disabled button uses the native disabled state, so it leaves the Tab order and cannot be pressed. With `focusableWhenDisabled`, it keeps its place in the Tab order and only gets `aria-disabled`. Keyboard and screen reader users can still reach it, and a hint can explain why it is unavailable.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:R(`Disabled.tsx`),runover:{},childs:[o(w,{runover:{},childs:[]})]})]});e.controls.add(m);let h=o(i,{anchor:`menu`,title:`Menu`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"With `menu`, the whole button opens a list of commands. Items can have an icon, a check mark or a group separator, and can be disabled or hidden. While the menu is open, each `&` key selects its item. An item field can be a function, and the open menu tracks what it reads.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:R(`Menu.tsx`),runover:{},childs:[o(j,{runover:{},childs:[]})]})]});e.controls.add(h);let g=o(i,{anchor:`split`,title:`Split button`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"With `split`, the button keeps its own action (`onclick`) and an arrow next to it opens the menu. The two parts are separate Tab stops, and Alt+Down on the button also opens the menu. You can change `split` at any time, but the menu itself (`split`, `menu` or `dropDown`) must exist when the button is created, because it divides the button into two parts.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:R(`Split.tsx`),runover:{},childs:[o(M,{runover:{},childs:[]})]})]});e.controls.add(g);let _=o(i,{anchor:`dropdown`,title:`Any content`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`dropDown` opens any component instead of a menu, such as a picker or a small form. Focus moves to its first field, and Escape or a click outside closes it.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:R(`DropDown.tsx`),runover:{},childs:[o(T,{runover:{},childs:[]})]})]});e.controls.add(_);let v=o(i,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[o(l,{head:[`Key`,`Description`],rows:W,runover:{},childs:[]})]});e.controls.add(v);let y=o(i,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[o(l,{head:[`Topic`,`Details`],rows:G,runover:{},childs:[]})]});e.controls.add(y);let b=o(i,{anchor:`i18n`,title:`Localization`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"The only string a button displays on its own is the name of a split button's arrow. It comes from `uiLocale.strings`, which starts from the page's `lang` (English and Turkish are included) and can be set to any `UiStrings`. Every button updates immediately. The set is used as provided, so to change one string, assign a new set: `uiLocale.strings = { ...uiLocale.strings, moreOptions: 'Mehr' }`. Changing a string inside the existing set has no effect.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:R(`Localization.tsx`),runover:{},childs:[o(k,{runover:{},childs:[]})]})]});e.controls.add(b);let x=o(i,{anchor:`styling`,title:`Styling`,runover:{},childs:[o(l,{head:[`Hook`,`Description`],rows:K,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Token`,`Description`],rows:q,runover:{},childs:[]}),o(`p`,{initializeComponent:e=>{let t=o(s,{text:"All of these reference design system tokens (see [Tokens](/tokens)). Override one after `styles.css` to restyle every button.",runover:{},childs:[]});e.controls.add(t)}},1)]});e.controls.add(x);let S=o(i,{anchor:`api`,title:`API reference`,runover:{},childs:[o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Prop`,`Type`,`Default`,`Description`],rows:z,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Property`,`Access`,`Description`],rows:B,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Methods`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Method`,`Returns`,`Description`],rows:V,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Event`,`When`],rows:H,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`MenuItem`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Field`,`Type`,`Description`],rows:U,runover:{},childs:[]}),o(`p`,{initializeComponent:e=>{let t=o(s,{text:"The menu and the surface it opens on are shared parts, `MenuList` and `Popup`, exported for use in other components.",runover:{},childs:[]});e.controls.add(t)}},1)]});e.controls.add(S)}}})}export{J as default};