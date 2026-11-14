import{Qn as e,Un as t,Zn as n,er as r,n as i}from"./next-id-CtzpBrBT.js";import{t as a}from"./OtpInput-BbRmTHxA.js";import{t as o}from"./Stack-wRt1e9tO.js";import{a as s,i as c,n as l,r as u,t as d}from"./docs-B_LZlyP5.js";import{t as f}from"./sources-BXVvOiIY.js";var p=`import { reactive } from '@motifx/core';\r
import { Button, OtpInput, Stack } from '@motifx-community/ui';\r
\r
/** A six-digit code bound to a value. \`onCompleted\` occurs once, when the last box is filled. */\r
export default function Basic() {\r
    const s = reactive({ code: '', told: 'nothing yet' });\r
    return (\r
        <Stack gap="md">\r
            <OtpInput class="otp-basic" label="Verification code" helpText="We sent it to your phone." x-model={() => s.code} onCompleted={e => (s.told = e.value)} />\r
            <output class="otp-value">{() => \`Value: \${s.code || 'empty'}\`}</output>\r
            <output class="otp-told">{() => \`Completed: \${s.told}\`}</output>\r
            <Button text="Clear" variant="outline" onclick={() => (s.code = '')} />\r
        </Stack>\r
    );\r
}\r
`,m=`import { OtpInput, Stack } from '@motifx-community/ui';\r
\r
/** Other lengths and characters, groups of boxes, and a masked PIN. */\r
export default function Formats() {\r
    return (\r
        <Stack gap="lg">\r
            <OtpInput class="otp-key" label="Access key" length={8} charset="alphanumeric" uppercase groupSize={4} />\r
            <OtpInput class="otp-pin" label="PIN" length={4} masked />\r
            <OtpInput class="otp-hint" label="Code" length={4} placeholder="0" />\r
            <OtpInput class="otp-hex" label="Color code" length={6} pattern={/[0-9a-f]/i} uppercase size="sm" />\r
        </Stack>\r
    );\r
}\r
`,h=`import { Component } from '@motifx/core';\r
import { Button, OtpInput, Stack } from '@motifx-community/ui';\r
\r
/** A field created programmatically. \`clear()\` empties it and puts the caret in the first box. */\r
export default class Programmatic extends Component<HTMLDivElement> {\r
    constructor() {\r
        super('div');\r
        const code = new OtpInput({ label: 'Programmatic code', length: 4, value: '12' });\r
        const clear = new Button({ text: 'Clear', variant: 'outline', onclick: () => code.clear() });\r
        const stack = new Stack({ gap: 'md' });\r
        stack.controls.add(code, clear);\r
        this.controls.add(stack);\r
    }\r
}\r
`,g=`import { OtpInput, Stack } from '@motifx-community/ui';\r
\r
/** The sizes, and a field that cannot be changed. */\r
export default function States() {\r
    return (\r
        <Stack gap="lg">\r
            <OtpInput class="otp-small" label="Small" size="sm" length={4} value="12" />\r
            <OtpInput class="otp-large" label="Large" size="lg" length={4} value="12" />\r
            <OtpInput class="otp-readonly" label="Read-only" length={4} value="1234" readOnly />\r
            <OtpInput class="otp-disabled" label="Disabled" length={4} value="12" enabled={false} />\r
        </Stack>\r
    );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { Button, OtpInput, Stack } from '@motifx-community/ui';\r
\r
/** An incomplete code fails on its own, and a rule of the application can refuse a complete one. */\r
export default function Validation() {\r
    const s = reactive({ code: '' });\r
    let field!: OtpInput;\r
    return (\r
        <Stack gap="md">\r
            <OtpInput\r
                ref={(x: OtpInput) => (field = x)}\r
                class="otp-valid"\r
                label="Code"\r
                length={4}\r
                required\r
                x-model={() => s.code}\r
                rules={[{ type: 'custom', check: value => value === '1234', message: 'This code is not correct.' }]}\r
            />\r
            <Button text="Verify" variant="outline" onclick={() => void field.validate()} />\r
        </Stack>\r
    );\r
}\r
`;function v(){let e=r({code:``,told:`nothing yet`});return n(o,{gap:`md`,runover:{},childs:[n(a,{class:`otp-basic`,label:`Verification code`,helpText:`We sent it to your phone.`,onCompleted:t=>e.told=t.value,runover:{initializeComponent:t=>{t.bindings.model(()=>e.code,t=>{let n=e;n!=null&&typeof n.code!=`function`&&(n.code=t)})}},childs:[]}),n(`output`,{initializeComponent:t=>{t.class.add(`otp-value`),t.bindings.method(()=>`Value: ${e.code||`empty`}`)}},1),n(`output`,{initializeComponent:t=>{t.class.add(`otp-told`),t.bindings.method(()=>`Completed: ${e.told}`)}},1),n(i,{text:`Clear`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.code=``)}},childs:[]})]})}function y(){return n(o,{gap:`lg`,runover:{},childs:[n(a,{class:`otp-key`,label:`Access key`,length:8,charset:`alphanumeric`,uppercase:!0,groupSize:4,runover:{},childs:[]}),n(a,{class:`otp-pin`,label:`PIN`,length:4,masked:!0,runover:{},childs:[]}),n(a,{class:`otp-hint`,label:`Code`,length:4,placeholder:`0`,runover:{},childs:[]}),n(a,{class:`otp-hex`,label:`Color code`,length:6,pattern:/[0-9a-f]/i,uppercase:!0,size:`sm`,runover:{},childs:[]})]})}var b=class extends t{constructor(){super(`div`);let e=new a({label:`Programmatic code`,length:4,value:`12`}),t=new i({text:`Clear`,variant:`outline`,onclick:()=>e.clear()}),n=new o({gap:`md`});n.controls.add(e,t),this.controls.add(n)}};b.elementTag=`div`;function x(){return n(o,{gap:`lg`,runover:{},childs:[n(a,{class:`otp-small`,label:`Small`,size:`sm`,length:4,value:`12`,runover:{},childs:[]}),n(a,{class:`otp-large`,label:`Large`,size:`lg`,length:4,value:`12`,runover:{},childs:[]}),n(a,{class:`otp-readonly`,label:`Read-only`,length:4,value:`1234`,readOnly:!0,runover:{},childs:[]}),n(a,{class:`otp-disabled`,label:`Disabled`,length:4,value:`12`,enabled:!1,runover:{},childs:[]})]})}function S(){let e=r({code:``}),t;return n(o,{gap:`md`,runover:{},childs:[n(a,{class:`otp-valid`,label:`Code`,length:4,required:!0,rules:[{type:`custom`,check:e=>e===`1234`,message:`This code is not correct.`}],ref:e=>t=e,runover:{initializeComponent:t=>{t.bindings.model(()=>e.code,t=>{let n=e;n!=null&&typeof n.code!=`function`&&(n.code=t)})}},childs:[]}),n(i,{text:`Verify`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>void t.validate())}},childs:[]})]})}var C=f(Object.assign({"./examples/Basic.tsx":p,"./examples/Formats.tsx":m,"./examples/Programmatic.tsx":h,"./examples/States.tsx":g,"./examples/Validation.tsx":_})),w=[[`length`,"`Bind<number>`","`6`",`The number of characters.`],[`charset`,"`Bind<'digits' | 'letters' | 'alphanumeric'>`","`'digits'`",`Which characters are accepted. Anything else is left out, also in a pasted code.`],[`pattern`,"`Bind<RegExp | null>`","`null`","Accepts the characters this matches instead of `charset`. It is tested on one character at a time."],[`uppercase`,"`Bind<boolean>`","`false`",`Turns letters into capitals as they are typed.`],[`masked`,"`Bind<boolean>`","`false`",`Draws a mark in place of each character.`],[`maskCharacter`,"`Bind<string>`","`'•'`","The mark of `masked`."],[`placeholder`,"`Bind<string>`","`''`",`Shown in a box that is still empty.`],[`groupSize`,"`Bind<number | null>`","`null`","Puts a separator after every so many boxes, such as `3` for `123-456`."],[`separator`,"`Bind<string>`","`'–'`",`The text of that separator.`],[`autoComplete`,"`Bind<string>`","`'one-time-code'`","The `autocomplete` of the input, which lets a phone offer the code from a message."],[`label, helpText, size, readOnly, required, rules, error, validateOn`,``,``,"Same as `TextBox`."]],T=[[`value`,"`string`","The characters entered so far. `x-model` provides two-way binding."],[`isComplete`,"`boolean`",`Indicates that every box is filled.`],[`clear()`,"`void`",`Empties the boxes and puts the caret in the first one.`],[`validate()`,"`Promise<boolean>`","Same as `TextBox`."],[`focus()`,"`boolean`",`Moves focus to the first empty box.`]],E=[[`onCompleted`,"`{ value, source, originalEvent }`",`Occurs when the user has entered every character, by typing, pasting or from the phone. It occurs once for a code.`],[`onValueChanged`,"`{ value, previousValue, byUser, source, event }`","Same as `TextBox`."]],D=[[`Characters`,`Fill the box with the caret, and the caret moves on. In a filled box, the character takes its place.`],[`Backspace, Delete`,`Remove a character, and those after it move back.`],[`Left, Right, Home, End`,`Move the caret between the boxes.`],[`Ctrl+V`,`Pastes a whole code. Characters that are not accepted, such as spaces and dashes, are left out.`]],O=[[`Input`,"One real `<input>` with its label, one Tab stop. Screen readers treat it as a text box, and the boxes are hidden from them."],[`Direction`,`The boxes run left to right in every page, as a code is read.`],[`Phones`,'`autocomplete="one-time-code"` offers the code from a message, and `inputmode="numeric"` opens the number keypad for digits.'],[`Masked codes`,"`masked` only changes what the boxes draw. Use it where the code should not be read over a shoulder."]],k=[[`.mx-otp-input`,"The field. `data-size`, `data-invalid`, `data-readonly` and `data-disabled` describe its state."],[`.mx-otp-input__input`,`The real input, unseen over the boxes.`],[`.mx-otp-input__cells, .mx-otp-input__cell, .mx-otp-input__char, .mx-otp-input__caret, .mx-otp-input__separator`,"The row, a box, a character, the caret and the separator. `data-active` and `data-filled` describe a box."]],A=[[`otp-input.cell-width, .cell-height, .font-size`,"The size of a box and of a character, for `sm`, `md` and `lg`."],[`otp-input.input-font-size`,`The text of the input under the boxes. Below 16 px a phone zooms in on focus.`],[`otp-input.cells, .cell, .char, .caret, .separator`,"Units: the row, a box (`hover`, `filled`, `active`, `invalid`, `invalid-active`, `readonly`, `disabled`), a character, the caret and the separator."],[`otp-input.field`,`Place: the field under the boxes, without a box of its own.`]];function j(){return e({initializeComponent:e=>{{let t=n(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=n(u,{text:`A one-time code in a row of boxes. Typing, pasting a whole code, the code a phone offers from a message and screen readers work as in any text box, because the boxes are drawn over one real input.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let r=n(c,{anchor:`import`,title:`Import`,runover:{},childs:[n(s,{code:`
import { OtpInput } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=n(c,{anchor:`basic`,title:`Entering a code`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(u,{text:"`x-model` binds the code, and `onCompleted` occurs when the last box is filled. Paste a code into the field, or type part of it and use the arrow keys.",runover:{},childs:[]});e.controls.add(t)}},1),n(l,{stack:!0,files:C(`Basic.tsx`),runover:{},childs:[n(v,{runover:{},childs:[]})]})]});e.controls.add(i);let a=n(c,{anchor:`formats`,title:`Formats`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(u,{text:"`length` sets the number of boxes, and `charset` or `pattern` the characters. `groupSize` separates the boxes, `masked` hides the characters, and `placeholder` marks empty boxes.",runover:{},childs:[]});e.controls.add(t)}},1),n(l,{stack:!0,files:C(`Formats.tsx`),runover:{},childs:[n(y,{runover:{},childs:[]})]})]});e.controls.add(a);let o=n(c,{anchor:`validation`,title:`Validation`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(u,{text:"A code that is not complete fails on its own. `rules` adds your own checks, as in every field.",runover:{},childs:[]});e.controls.add(t)}},1),n(l,{stack:!0,files:C(`Validation.tsx`),runover:{},childs:[n(S,{runover:{},childs:[]})]})]});e.controls.add(o);let f=n(c,{anchor:`states`,title:`Sizes and states`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(u,{text:"`size` sets the size of the boxes. `readOnly` and `enabled` work as in every field.",runover:{},childs:[]});e.controls.add(t)}},1),n(l,{stack:!0,files:C(`States.tsx`),runover:{},childs:[n(x,{runover:{},childs:[]})]})]});e.controls.add(f);let p=n(c,{anchor:`programmatic`,title:`Programmatic use`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(u,{text:"`new OtpInput(props)` creates the field without JSX. Each prop is also a property.",runover:{},childs:[]});e.controls.add(t)}},1),n(l,{stack:!0,files:C(`Programmatic.tsx`),runover:{},childs:[n(b,{runover:{},childs:[]})]})]});e.controls.add(p);let m=n(c,{anchor:`api`,title:`API reference`,runover:{},childs:[n(`h3`,{initializeComponent:e=>{let t=n(u,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),n(d,{head:[`Prop`,`Type`,`Default`,`Description`],rows:w,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(u,{text:`Properties and methods`,runover:{},childs:[]});e.controls.add(t)}},1),n(d,{head:[`Member`,`Type`,`Description`],rows:T,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(u,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),n(d,{head:[`Event`,`Type`,`Description`],rows:E,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(u,{text:`Keyboard`,runover:{},childs:[]});e.controls.add(t)}},1),n(d,{head:[`Key`,`Description`],rows:D,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(u,{text:`Accessibility`,runover:{},childs:[]});e.controls.add(t)}},1),n(d,{head:[`Topic`,`Details`],rows:O,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(u,{text:`Styling hooks`,runover:{},childs:[]});e.controls.add(t)}},1),n(d,{head:[`Hook`,`Description`],rows:k,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(u,{text:`Design tokens`,runover:{},childs:[]});e.controls.add(t)}},1),n(d,{head:[`Token`,`Description`],rows:A,runover:{},childs:[]})]});e.controls.add(m)}}})}export{j as default};