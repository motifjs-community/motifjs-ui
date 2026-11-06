import{a as e,an as t,h as n,i as r,n as i,nn as a,r as o,rn as s,t as c}from"./doc-B1CtlCkV.js";import{t as l}from"./Switch-B8uj57cD.js";import{t as u}from"./Stack-AS0iyAxC.js";import{t as d}from"./ValidationGroup-T1woV0-X.js";import{t as f}from"./sources-BXVvOiIY.js";var p=`import { reactive } from '@motifx/core';\r
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
`;function v(){let e=t({updates:!0});return a(`div`,{initializeComponent:t=>{t.style(`inline-size: 22rem`);let n=a(l,{label:`Automatic updates`,labelPosition:`start`,stretch:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.updates,t=>{let n=e;n!=null&&typeof n.updates!=`function`&&(n.updates=t)})}},childs:[]});t.controls.add(n);let r=a(l,{label:`Send usage data`,labelPosition:`start`,stretch:!0,helpText:`Anonymous, once a week.`,runover:{},childs:[]});t.controls.add(r)}},1)}function y(){let e=t({wifi:!0,result:``}),r=0,i=null,o=()=>{let t=new l({label:`Feature ${++r}`,onText:`On`,offText:`Off`});t.onValueChanged(n=>e.result=`${t.label}: ${n.value?`on`:`off`}`),i?.controls.add(t),t.focus()};return s({initializeComponent:t=>{{let r=a(l,{label:`&Wi-Fi`,helpText:()=>e.wifi?`Connected to Home.`:`Not connected.`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.wifi,t=>{let n=e;n!=null&&typeof n.wifi!=`function`&&(n.wifi=t)})}},childs:[]});t.controls.add(r);let s=a(u,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[a(n,{text:`Add a switch programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,o)}},childs:[]}),a(`output`,{initializeComponent:t=>{t.class.add(`sw-result`),t.bindings.method(()=>e.result)}},1)]});t.controls.add(s);let c=a(u,{orientation:`horizontal`,wrap:!0,align:`center`,ref:e=>i=e,runover:{},childs:[]});t.controls.add(c)}}})}var b=[`sm`,`md`,`lg`];function x(){return s({initializeComponent:e=>{e.bindings.list(()=>b??[],e=>a(l,{indexkey:()=>e,label:e,size:e,value:e===`md`,onText:`On`,offText:`Off`,runover:{},childs:[]}))}})}var S=[`inside`,`beside`,`none`];function C(){let e=t({place:`inside`,sync:!1,dark:!1});return s({initializeComponent:t=>{{let r=a(u,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Text position`,runover:{},childs:[a({initializeComponent:t=>{t.bindings.list(()=>S??[],t=>a(n,{indexkey:()=>t,text:t,size:`sm`,variant:()=>e.place===t?`solid`:`ghost`,"aria-pressed":()=>e.place===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.place=t)}},childs:[]}))}})]});t.controls.add(r);let i=a(l,{label:`&Sync`,class:`sw-sync`,onText:`On`,offText:`Off`,showStateText:()=>e.place,runover:{initializeComponent:t=>{t.bindings.model(()=>e.sync,t=>{let n=e;n!=null&&typeof n.sync!=`function`&&(n.sync=t)})}},childs:[]});t.controls.add(i);let o=a(l,{label:`Dark mode`,onText:`Dark`,offText:`Light`,showStateText:()=>e.place,runover:{initializeComponent:t=>{t.bindings.model(()=>e.dark,t=>{let n=e;n!=null&&typeof n.dark!=`function`&&(n.dark=t)})}},childs:[]});t.controls.add(o)}}})}function w(){let e=t({terms:!1,editable:!0,result:``}),r=new d,i=async()=>{e.result=(await r.validate()).valid?`Thanks.`:`Please agree first.`};return s({initializeComponent:t=>{{let o=a(u,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[a(l,{label:`I &agree to the terms`,required:!0,validationGroup:r,runover:{initializeComponent:t=>{t.bindings.model(()=>e.terms,t=>{let n=e;n!=null&&typeof n.terms!=`function`&&(n.terms=t)})}},childs:[]}),a(n,{text:`Continue`,tone:`accent`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]}),a(`output`,{initializeComponent:t=>{t.bindings.method(()=>e.result)}},1)]});t.controls.add(o);let s=a(u,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[a(n,{text:`Toggle`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.editable=!e.editable)}},childs:[]}),a(l,{label:`Read-only`,readOnly:()=>!e.editable,value:!0,runover:{},childs:[]}),a(l,{label:`Disabled on`,enabled:()=>e.editable,value:!0,runover:{},childs:[]}),a(l,{label:`Disabled off`,enabled:()=>e.editable,runover:{},childs:[]})]});t.controls.add(s)}}})}var T=f(Object.assign({"./examples/Caption.tsx":p,"./examples/Programmatic.tsx":m,"./examples/Sizes.tsx":h,"./examples/StateText.tsx":g,"./examples/States.tsx":_})),E=[[`value`,"`Bind<boolean>`","`false`","Indicates whether the switch is on. `x-model` provides two-way binding."],[`label`,"`Bind<string>`","`''`","The label next to the track. Writing `&Name` makes Alt+N toggle the switch. This is the same property as `text`."],[`labelPosition`,"`Bind<'start' | 'end'>`","`'end'`","Places the label after the track (`end`) or before it (`start`), following the reading direction."],[`labelMode`,"`Bind<FieldLabelMode>`","`'top'`","`hidden` keeps the label for screen readers only. Every other mode shows it next to the track."],[`onText / offText`,"`Bind<string>`","`''`","Short text for each state, such as `On` and `Off`."],[`showStateText`,"`Bind<SwitchStateText>`","`'inside'`","Where the text appears: `inside` the track, `beside` it, or `none`."],[`helpText`,"`Bind<string>`","`''`",`Help text shown below the label. An error message replaces it.`],[`hint`,"`Bind<string>`","`''`",`The tooltip text.`],[`readOnly`,"`Bind<boolean>`","`false`",`The switch can receive focus and is announced, but it cannot be toggled.`],[`required`,"`Bind<boolean>`","`false`",`The switch must be on.`],[`size`,"`Bind<ControlSize>`","`'md'`","`sm`, `md`, `lg`; the row height follows the density tokens."],[`stretch`,"`Bind<boolean>`","`false`",'Stretches to the full width. With `labelPosition="start"`, the track moves to the far end.'],[`name`,"`Bind<string>`","`''`",`The name submitted with the form.`],[`rules, error, validateOn, validationGroup`,`see Field`,``,`Validation works the same way as for all fields.`],[`enabled / disabled, visible, tabStop, tabIndex`,`see Control`,``,`Properties shared by all controls.`]],D=[[`every prop above`,`read/write, reactive`,`Accepts a value or a function, the same as the prop.`],[`isValid, validationMessage, validating`,`read-only, reactive`,`The result of the last validation.`],[`inputElement`,`read-only`,'The native `<input type="checkbox" role="switch">`.']],O=[[`toggle()`,"`void`",`Toggles the switch as a click does.`],[`validate()`,"`Promise<boolean>`",`Validates the value and displays the result.`],[`resetValidation()`,"`void`",`Clears the results of previous validation.`],[`focus()`,"`boolean`",`Sets focus on the switch.`]],k=[[`onValueChanged(e)`,"Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`."],[`onValidated(e)`,"Occurs when validation finishes. `e`: `{ valid, message, source }`."],[`onclick, onchange, onfocusin, onfocusout`,`DOM events from the input bubble up to the field.`]],A=[[`Space`,`Toggles the switch, using the native key.`],[`Enter`,`Also toggles the switch, as on a button.`],["Alt + key (`&Name`)",`Moves focus to the switch and toggles it (Control + Option + key on Apple platforms).`]],j=[[`Element`,'A native `<input type="checkbox" role="switch">`. Screen readers announce "switch, on" or "switch, off", and the browser provides Space, the form value, `:checked` and `:disabled`. Its label is a `<label for>`, so clicking the label toggles the switch.'],[`On/off text`,"Decorative only (`aria-hidden`), because the switch announces its own state."],[`Read-only`,'`aria-readonly="true"`. The field stays in the Tab order.'],[`Motion`,`The thumb animates with the motion tokens, and the animation is removed when the user prefers reduced motion.`],[`Focus`,`The design system focus ring around the track, shown only during keyboard use.`]],M=[[`.mx-switch`,"The field. `data-state` (`checked`, `unchecked`), `data-state-text`, `data-label-position`, `data-size`, `data-invalid`, `data-readonly`, `data-disabled`."],[`.mx-toggle-field`,`The layout shared by CheckBox and Switch.`],[`.mx-switch__input`,`The native check box, which is the track itself.`],[`.mx-switch__thumb`,`The thumb drawn over the track.`],[`.mx-switch__text, .mx-switch__on, .mx-switch__off`,`The on/off text.`]],N=[[`switch.track, switch.thumb`,"Units: the track and the thumb, each with every state (`checked`, `invalid`, `hover`, `pressed`, `focus`, `disabled` and their combinations)."],[`switch.thumb-icon, switch.halo`,`Units: an icon in the thumb and a halo around it, where the design language includes them.`],[`switch.text, switch.side-text`,`Units: the on/off text in the track and next to it.`],[`switch.track-width.*, switch.track-height.*`,`The track, per size.`],[`switch.thumb-size.*, switch.thumb-size-checked.*, switch.thumb-size-hover.*, switch.thumb-size-pressed.*, switch.thumb-inset, switch.thumb-stretch`,`The thumb per size and state, the space around it, and how far it stretches when pressed.`],[`switch.height.*, switch.font-size.*`,`Row height (density tokens) and label size.`],[`switch.text-padding, switch.gap`,`The spacing of the on/off text and the space before the label.`]];function P(){return s({initializeComponent:t=>{{let n=a(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=a(o,{text:`An on/off switch with a label. It has a track with a sliding thumb, optional on/off text inside or next to the track, and read-only and required states. It is a native check box with the switch role.`,runover:{},childs:[]});e.controls.add(t)}},1);t.controls.add(n);let s=a(r,{anchor:`import`,title:`Import`,runover:{},childs:[a(e,{code:`
import { Switch } from '@motifx-community/ui';
`,runover:{},childs:[]})]});t.controls.add(s);let l=a(r,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"Every prop accepts a value or a function, and `x-model` provides two-way binding for the value. When you create the component with `new`, set the same properties programmatically.",runover:{},childs:[]});e.controls.add(t)}},1),a(i,{files:T(`Programmatic.tsx`),stack:!0,runover:{},childs:[a(y,{runover:{},childs:[]})]})]});t.controls.add(l);let u=a(r,{anchor:`texts`,title:`On/off text`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"`onText` and `offText` appear inside the track, which grows to fit them, or next to it. The text is visual only, and the switch announces its own state.",runover:{},childs:[]});e.controls.add(t)}},1),a(i,{files:T(`StateText.tsx`),stack:!0,runover:{},childs:[a(C,{runover:{},childs:[]})]})]});t.controls.add(u);let d=a(r,{anchor:`caption`,title:`Caption`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:'The label appears after the track, or before it with `labelPosition="start"`. With `stretch`, the field takes the full width and the track moves to the far end, as in a settings list.',runover:{},childs:[]});e.controls.add(t)}},1),a(i,{files:T(`Caption.tsx`),stack:!0,runover:{},childs:[a(v,{runover:{},childs:[]})]})]});t.controls.add(d);let f=a(r,{anchor:`sizes`,title:`Sizes`,runover:{},childs:[a(i,{files:T(`Sizes.tsx`),runover:{},childs:[a(x,{runover:{},childs:[]})]})]});t.controls.add(f);let p=a(r,{anchor:`states`,title:`Required, read-only, disabled`,runover:{},childs:[a(i,{files:T(`States.tsx`),stack:!0,runover:{},childs:[a(w,{runover:{},childs:[]})]})]});t.controls.add(p);let m=a(r,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[a(c,{head:[`Key`,`Description`],rows:A,runover:{},childs:[]})]});t.controls.add(m);let h=a(r,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[a(c,{head:[`Topic`,`Details`],rows:j,runover:{},childs:[]})]});t.controls.add(h);let g=a(r,{anchor:`i18n`,title:`Localization`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"A switch has no strings of its own. `onText` and `offText` are yours and can be functions of your language state. The `required` message comes from `uiLocale.strings`.",runover:{},childs:[]});e.controls.add(t)}},1)]});t.controls.add(g);let _=a(r,{anchor:`styling`,title:`Styling`,runover:{},childs:[a(c,{head:[`Hook`,`Description`],rows:M,runover:{},childs:[]}),a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Token`,`Description`],rows:N,runover:{},childs:[]})]});t.controls.add(_);let b=a(r,{anchor:`api`,title:`API reference`,runover:{},childs:[a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Prop`,`Type`,`Default`,`Description`],rows:E,runover:{},childs:[]}),a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Property`,`Access`,`Description`],rows:D,runover:{},childs:[]}),a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Methods`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Method`,`Returns`,`Description`],rows:O,runover:{},childs:[]}),a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Event`,`When`],rows:k,runover:{},childs:[]})]});t.controls.add(b)}}})}export{P as default};