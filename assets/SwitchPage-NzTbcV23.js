import{Qn as e,Zn as t,er as n,n as r}from"./next-id-CtzpBrBT.js";import{t as i}from"./Switch-CESerSF7.js";import{t as a}from"./ValidationGroup-Cy7KxIFq.js";import{t as o}from"./Stack-wRt1e9tO.js";import{a as s,i as c,n as l,r as u,t as d}from"./docs-B_LZlyP5.js";import{t as f}from"./sources-BXVvOiIY.js";var p=`import { reactive } from '@motifx/core';\r
import { Switch } from '@motifx-community/ui';\r
\r
/** Captions before the track, stretched so the tracks line up at the far end, as in a settings list. */\r
export default function Caption() {\r
  const s = reactive({ updates: true });\r
  return (\r
    <div style="inline-size: 22rem">\r
      <Switch label="Automatic updates" labelPosition="start" stretch x-model={() => s.updates} />\r
      <Switch label="Send usage data" labelPosition="start" stretch helpText="Anonymous, once a week." />\r
    </div>\r
  );\r
}\r
`,m=`import { reactive } from '@motifx/core';\r
import { Button, Stack, Switch } from '@motifx-community/ui';\r
\r
/** A switch bound to state with x-model, and switches created with \`new\` and added programmatically. */\r
export default function Programmatic() {\r
  const s = reactive({ wifi: true, result: '' });\r
  let added = 0;\r
  let host: Stack | null = null;\r
\r
  const addProgrammatic = () => {\r
    const sw = new Switch({ label: \`Feature \${++added}\`, onText: 'On', offText: 'Off' });\r
    sw.onValueChanged((e) => (s.result = \`\${sw.label}: \${e.value ? 'on' : 'off'}\`));\r
    host?.controls.add(sw);\r
    sw.focus();\r
  };\r
\r
  return (\r
    <>\r
      <Switch label="&Wi-Fi" x-model={() => s.wifi} helpText={() => (s.wifi ? 'Connected to Home.' : 'Not connected.')} />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Add a switch programmatically" variant="outline" onclick={addProgrammatic} />\r
        <output class="sw-result">{() => s.result}</output>\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />\r
    </>\r
  );\r
}\r
`,h=`import { Switch, type ControlSize } from '@motifx-community/ui';\r
\r
const SIZES: ControlSize[] = ['sm', 'md', 'lg'];\r
\r
/** A switch in each size, with its on / off text. */\r
export default function Sizes() {\r
  return (\r
    <>\r
      {SIZES.map((size) => (\r
        <Switch key={size} label={size} size={size} value={size === 'md'} onText="On" offText="Off" />\r
      ))}\r
    </>\r
  );\r
}\r
`,g=`import { reactive } from '@motifx/core';\r
import { Button, Stack, Switch, type SwitchStateText } from '@motifx-community/ui';\r
\r
const PLACES: SwitchStateText[] = ['inside', 'beside', 'none'];\r
\r
/** An on / off text in the track, next to it, or not shown. */\r
export default function StateText() {\r
  const s = reactive({ place: 'inside' as SwitchStateText, sync: false, dark: false });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Text position">\r
        {PLACES.map((place) => (\r
          <Button\r
            key={place}\r
            text={place}\r
            size="sm"\r
            variant={() => (s.place === place ? 'solid' : 'ghost')}\r
            aria-pressed={() => s.place === place}\r
            onclick={() => (s.place = place)}\r
          />\r
        ))}\r
      </Stack>\r
      <Switch label="&Sync" class="sw-sync" onText="On" offText="Off" showStateText={() => s.place} x-model={() => s.sync} />\r
      <Switch label="Dark mode" onText="Dark" offText="Light" showStateText={() => s.place} x-model={() => s.dark} />\r
    </>\r
  );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { Button, Stack, Switch, ValidationGroup } from '@motifx-community/ui';\r
\r
/** A switch that must be on, checked with its group, and read-only and disabled ones following state. */\r
export default function States() {\r
  const s = reactive({ terms: false, editable: true, result: '' });\r
  const group = new ValidationGroup();\r
\r
  const next = async () => {\r
    s.result = (await group.validate()).valid ? 'Thanks.' : 'Please agree first.';\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Switch label="I &agree to the terms" required validationGroup={group} x-model={() => s.terms} />\r
        <Button text="Continue" tone="accent" onclick={next} />\r
        <output>{() => s.result}</output>\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Toggle" variant="outline" onclick={() => (s.editable = !s.editable)} />\r
        <Switch label="Read-only" readOnly={() => !s.editable} value={true} />\r
        <Switch label="Disabled on" enabled={() => s.editable} value={true} />\r
        <Switch label="Disabled off" enabled={() => s.editable} />\r
      </Stack>\r
    </>\r
  );\r
}\r
`;function v(){let e=n({updates:!0});return t(`div`,{initializeComponent:n=>{n.style(`inline-size: 22rem`);let r=t(i,{label:`Automatic updates`,labelPosition:`start`,stretch:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.updates,t=>{let n=e;n!=null&&typeof n.updates!=`function`&&(n.updates=t)})}},childs:[]});n.controls.add(r);let a=t(i,{label:`Send usage data`,labelPosition:`start`,stretch:!0,helpText:`Anonymous, once a week.`,runover:{},childs:[]});n.controls.add(a)}},1)}function y(){let a=n({wifi:!0,result:``}),s=0,c=null,l=()=>{let e=new i({label:`Feature ${++s}`,onText:`On`,offText:`Off`});e.onValueChanged(t=>a.result=`${e.label}: ${t.value?`on`:`off`}`),c?.controls.add(e),e.focus()};return e({initializeComponent:e=>{{let n=t(i,{label:`&Wi-Fi`,helpText:()=>a.wifi?`Connected to Home.`:`Not connected.`,runover:{initializeComponent:e=>{e.bindings.model(()=>a.wifi,e=>{let t=a;t!=null&&typeof t.wifi!=`function`&&(t.wifi=e)})}},childs:[]});e.controls.add(n);let s=t(o,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(r,{text:`Add a switch programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,l)}},childs:[]}),t(`output`,{initializeComponent:e=>{e.class.add(`sw-result`),e.bindings.method(()=>a.result)}},1)]});e.controls.add(s);let u=t(o,{orientation:`horizontal`,wrap:!0,align:`center`,ref:e=>c=e,runover:{},childs:[]});e.controls.add(u)}}})}var b=[`sm`,`md`,`lg`];function x(){return e({initializeComponent:e=>{e.bindings.list(()=>b??[],e=>t(i,{indexkey:()=>e,label:e,size:e,value:e===`md`,onText:`On`,offText:`Off`,runover:{},childs:[]}))}})}var S=[`inside`,`beside`,`none`];function C(){let a=n({place:`inside`,sync:!1,dark:!1});return e({initializeComponent:e=>{{let n=t(o,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Text position`,runover:{},childs:[t({initializeComponent:e=>{e.bindings.list(()=>S??[],e=>t(r,{indexkey:()=>e,text:e,size:`sm`,variant:()=>a.place===e?`solid`:`ghost`,"aria-pressed":()=>a.place===e,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>a.place=e)}},childs:[]}))}})]});e.controls.add(n);let s=t(i,{label:`&Sync`,class:`sw-sync`,onText:`On`,offText:`Off`,showStateText:()=>a.place,runover:{initializeComponent:e=>{e.bindings.model(()=>a.sync,e=>{let t=a;t!=null&&typeof t.sync!=`function`&&(t.sync=e)})}},childs:[]});e.controls.add(s);let c=t(i,{label:`Dark mode`,onText:`Dark`,offText:`Light`,showStateText:()=>a.place,runover:{initializeComponent:e=>{e.bindings.model(()=>a.dark,e=>{let t=a;t!=null&&typeof t.dark!=`function`&&(t.dark=e)})}},childs:[]});e.controls.add(c)}}})}function w(){let s=n({terms:!1,editable:!0,result:``}),c=new a,l=async()=>{s.result=(await c.validate()).valid?`Thanks.`:`Please agree first.`};return e({initializeComponent:e=>{{let n=t(o,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(i,{label:`I &agree to the terms`,required:!0,validationGroup:c,runover:{initializeComponent:e=>{e.bindings.model(()=>s.terms,e=>{let t=s;t!=null&&typeof t.terms!=`function`&&(t.terms=e)})}},childs:[]}),t(r,{text:`Continue`,tone:`accent`,runover:{initializeComponent:e=>{e.motif.on(`click`,l)}},childs:[]}),t(`output`,{initializeComponent:e=>{e.bindings.method(()=>s.result)}},1)]});e.controls.add(n);let a=t(o,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(r,{text:`Toggle`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>s.editable=!s.editable)}},childs:[]}),t(i,{label:`Read-only`,readOnly:()=>!s.editable,value:!0,runover:{},childs:[]}),t(i,{label:`Disabled on`,enabled:()=>s.editable,value:!0,runover:{},childs:[]}),t(i,{label:`Disabled off`,enabled:()=>s.editable,runover:{},childs:[]})]});e.controls.add(a)}}})}var T=f(Object.assign({"./examples/Caption.tsx":p,"./examples/Programmatic.tsx":m,"./examples/Sizes.tsx":h,"./examples/StateText.tsx":g,"./examples/States.tsx":_})),E=[[`value`,"`Bind<boolean>`","`false`","Indicates whether the switch is on. `x-model` provides two-way binding."],[`label`,"`Bind<string>`","`''`","The label next to the track. Writing `&Name` makes Alt+N toggle the switch. This is the same property as `text`."],[`labelPosition`,"`Bind<'start' | 'end'>`","`'end'`","Places the label after the track (`end`) or before it (`start`), following the reading direction."],[`labelMode`,"`Bind<FieldLabelMode>`","`'top'`","`hidden` keeps the label for screen readers only. Every other mode shows it next to the track."],[`onText / offText`,"`Bind<string>`","`''`","Short text for each state, such as `On` and `Off`."],[`showStateText`,"`Bind<SwitchStateText>`","`'inside'`","Where the text appears: `inside` the track, `beside` it, or `none`."],[`helpText`,"`Bind<string>`","`''`",`Help text shown below the label. An error message replaces it.`],[`hint`,"`Bind<string>`","`''`",`The tooltip text.`],[`readOnly`,"`Bind<boolean>`","`false`",`The switch can receive focus and is announced, but it cannot be toggled.`],[`required`,"`Bind<boolean>`","`false`",`The switch must be on.`],[`size`,"`Bind<ControlSize>`","`'md'`","`sm`, `md`, `lg`; the row height follows the density tokens."],[`stretch`,"`Bind<boolean>`","`false`",'Stretches to the full width. With `labelPosition="start"`, the track moves to the far end.'],[`name`,"`Bind<string>`","`''`",`The name submitted with the form.`],[`rules, error, validateOn, validationGroup`,`see Field`,``,`Validation works the same way as for all fields.`],[`enabled / disabled, visible, tabStop, tabIndex`,`see Control`,``,`Properties shared by all controls.`]],D=[[`every prop above`,`read/write, reactive`,`Accepts a value or a function, the same as the prop.`],[`isValid, validationMessage, validating`,`read-only, reactive`,`The result of the last validation.`],[`inputPart`,`read-only`,'The native `<input type="checkbox" role="switch">`.']],O=[[`toggle()`,"`void`",`Toggles the switch as a click does.`],[`validate()`,"`Promise<boolean>`",`Validates the value and displays the result.`],[`resetValidation()`,"`void`",`Clears the results of previous validation.`],[`focus()`,"`boolean`",`Sets focus on the switch.`]],k=[[`onValueChanged(e)`,"Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`."],[`onValidated(e)`,"Occurs when validation finishes. `e`: `{ valid, message, source }`."],[`onclick, onchange, onfocusin, onfocusout`,`DOM events from the input bubble up to the field.`]],A=[[`Space`,`Toggles the switch, using the native key.`],[`Enter`,`Also toggles the switch, as on a button.`],["Alt + key (`&Name`)",`Moves focus to the switch and toggles it (Control + Option + key on Apple platforms).`]],j=[[`Element`,'A native `<input type="checkbox" role="switch">`. Screen readers announce "switch, on" or "switch, off", and the browser provides Space, the form value, `:checked` and `:disabled`. Its label is a `<label for>`, so clicking the label toggles the switch.'],[`On/off text`,"Decorative only (`aria-hidden`), because the switch announces its own state."],[`Read-only`,'`aria-readonly="true"`. The field stays in the Tab order.'],[`Motion`,`The thumb animates with the motion tokens, and the animation is removed when the user prefers reduced motion.`],[`Focus`,`The design system focus ring around the track, shown only during keyboard use.`]],M=[[`.mx-switch`,"The field. `data-state` (`checked`, `unchecked`), `data-state-text`, `data-label-position`, `data-size`, `data-invalid`, `data-readonly`, `data-disabled`."],[`.mx-toggle-field`,`The layout shared by CheckBox and Switch.`],[`.mx-switch__input`,`The native check box, which is the track itself.`],[`.mx-switch__thumb`,`The thumb drawn over the track.`],[`.mx-switch__text, .mx-switch__on, .mx-switch__off`,`The on/off text.`]],N=[[`switch.track, switch.thumb`,"Units: the track and the thumb, each with every state (`checked`, `invalid`, `hover`, `pressed`, `focus`, `disabled` and their combinations)."],[`switch.thumb-icon, switch.halo`,`Units: an icon in the thumb and a halo around it, where the design language includes them.`],[`switch.text, switch.side-text`,`Units: the on/off text in the track and next to it.`],[`switch.track-width.*, switch.track-height.*`,`The track, per size.`],[`switch.thumb-size.*, switch.thumb-size-checked.*, switch.thumb-size-hover.*, switch.thumb-size-pressed.*, switch.thumb-inset, switch.thumb-stretch`,`The thumb per size and state, the space around it, and how far it stretches when pressed.`],[`switch.height.*, switch.font-size.*`,`Row height (density tokens) and label size.`],[`switch.text-padding, switch.gap`,`The spacing of the on/off text and the space before the label.`]];function P(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(u,{text:`An on/off switch with a label. It has a track with a sliding thumb, optional on/off text inside or next to the track, and read-only and required states. It is a native check box with the switch role.`,runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(c,{anchor:`import`,title:`Import`,runover:{},childs:[t(s,{code:`
import { Switch } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(c,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(u,{text:"Every prop accepts a value or a function, and `x-model` provides two-way binding for the value. When you create the component with `new`, set the same properties programmatically.",runover:{},childs:[]});e.controls.add(n)}},1),t(l,{files:T(`Programmatic.tsx`),stack:!0,runover:{},childs:[t(y,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(c,{anchor:`texts`,title:`On/off text`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(u,{text:"`onText` and `offText` appear inside the track, which grows to fit them, or next to it. The text is visual only, and the switch announces its own state.",runover:{},childs:[]});e.controls.add(n)}},1),t(l,{files:T(`StateText.tsx`),stack:!0,runover:{},childs:[t(C,{runover:{},childs:[]})]})]});e.controls.add(a);let o=t(c,{anchor:`caption`,title:`Caption`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(u,{text:'The label appears after the track, or before it with `labelPosition="start"`. With `stretch`, the field takes the full width and the track moves to the far end, as in a settings list.',runover:{},childs:[]});e.controls.add(n)}},1),t(l,{files:T(`Caption.tsx`),stack:!0,runover:{},childs:[t(v,{runover:{},childs:[]})]})]});e.controls.add(o);let f=t(c,{anchor:`sizes`,title:`Sizes`,runover:{},childs:[t(l,{files:T(`Sizes.tsx`),runover:{},childs:[t(x,{runover:{},childs:[]})]})]});e.controls.add(f);let p=t(c,{anchor:`states`,title:`Required, read-only, disabled`,runover:{},childs:[t(l,{files:T(`States.tsx`),stack:!0,runover:{},childs:[t(w,{runover:{},childs:[]})]})]});e.controls.add(p);let m=t(c,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[t(d,{head:[`Key`,`Description`],rows:A,runover:{},childs:[]})]});e.controls.add(m);let h=t(c,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(d,{head:[`Topic`,`Details`],rows:j,runover:{},childs:[]})]});e.controls.add(h);let g=t(c,{anchor:`i18n`,title:`Localization`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(u,{text:"A switch has no strings of its own. `onText` and `offText` are yours and can be functions of your language state. The `required` message comes from `uiLocale.strings`.",runover:{},childs:[]});e.controls.add(n)}},1)]});e.controls.add(g);let _=t(c,{anchor:`styling`,title:`Styling`,runover:{},childs:[t(d,{head:[`Hook`,`Description`],rows:M,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Token`,`Description`],rows:N,runover:{},childs:[]})]});e.controls.add(_);let b=t(c,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Prop`,`Type`,`Default`,`Description`],rows:E,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`Properties`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Property`,`Access`,`Description`],rows:D,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`Methods`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Method`,`Returns`,`Description`],rows:O,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`Events`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Event`,`When`],rows:k,runover:{},childs:[]})]});e.controls.add(b)}}})}export{P as default};