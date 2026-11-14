import{$n as e,Qn as t,Un as n,Zn as r,er as i,n as a}from"./next-id-CtzpBrBT.js";import{t as o}from"./TextBox-iHQY3j6o.js";import{t as s}from"./Barcode-Bnhtc4XO.js";import{t as c}from"./Stack-wRt1e9tO.js";import{a as l,i as u,n as d,r as f,t as p}from"./docs-B_LZlyP5.js";import{t as m}from"./sources-BXVvOiIY.js";var h=`import { reactive } from '@motifx/core';\r
import { Barcode, Button, Stack } from '@motifx-community/ui';\r
\r
/** An image of the code, with its text, to download or print. */\r
export default function Export() {\r
    const s = reactive({ image: '' });\r
    let code!: Barcode;\r
    return (\r
        <Stack gap="md">\r
            <Barcode ref={(x: Barcode) => (code = x)} class="bc-export" value="LABEL-42" />\r
            <Button text="Create the image" variant="outline" onclick={() => (s.image = code.toDataURL('image/png', { scale: 2 }))} />\r
            {s.image && <img class="bc-image" alt="The code as an image" src={() => s.image} />}\r
        </Stack>\r
    );\r
}\r
`,g=`import { Barcode, Stack } from '@motifx-community/ui';\r
\r
/** Each format, with a value it can hold. */\r
export default function Formats() {\r
    return (\r
        <Stack gap="md">\r
            <Barcode class="bc-128" format="code128" value="ORDER-2026-118" />\r
            <Barcode class="bc-39" format="code39" value="PART-77" />\r
            <Barcode class="bc-13" format="ean13" value="400638133393" />\r
            <Barcode class="bc-8" format="ean8" value="9638507" />\r
            <Barcode class="bc-upc" format="upca" value="03600029145" />\r
            <Barcode class="bc-itf" format="itf" value="1234567890" />\r
        </Stack>\r
    );\r
}\r
`,_=`import { Barcode, Stack } from '@motifx-community/ui';\r
\r
/** The size of the bars, and a code without its text. */\r
export default function Options() {\r
    return (\r
        <Stack gap="md">\r
            <Barcode class="bc-large" value="LARGE-1" moduleWidth={3} height={96} />\r
            <Barcode class="bc-plain" value="NO-TEXT" showText={false} />\r
        </Stack>\r
    );\r
}\r
`,v=`import { Component } from '@motifx/core';\r
import { Barcode, Button, Stack } from '@motifx-community/ui';\r
\r
/** A code created programmatically. Each prop is also a property that can be set later. */\r
export default class Programmatic extends Component<HTMLDivElement> {\r
    constructor() {\r
        super('div');\r
        const code = new Barcode({ value: 'FIRST' });\r
        const next = new Button({ text: 'Change the value', variant: 'outline', onclick: () => (code.value = 'SECOND') });\r
        const stack = new Stack({ gap: 'md' });\r
        stack.controls.add(code, next);\r
        this.controls.add(stack);\r
    }\r
}\r
`,y=`import { reactive } from '@motifx/core';\r
import { Barcode, Stack, TextBox } from '@motifx-community/ui';\r
\r
/** A value the format cannot hold draws nothing and raises \`onEncodeFailed\`. An EAN refuses a wrong check digit. */\r
export default function Validation() {\r
    const s = reactive({ value: '4006381333931', told: '' });\r
    return (\r
        <Stack gap="md">\r
            <TextBox label="EAN-13" x-model={() => s.value} />\r
            <Barcode\r
                class="bc-valid"\r
                format="ean13"\r
                value={() => s.value}\r
                onEncodeFailed={e => (s.told = \`“\${e.value}” is not a valid EAN-13.\`)}\r
            />\r
            <output class="bc-told">{() => s.told}</output>\r
        </Stack>\r
    );\r
}\r
`;function b(){let t=i({image:``}),n;return r(c,{gap:`md`,runover:{},childs:[r(s,{class:`bc-export`,value:`LABEL-42`,ref:e=>n=e,runover:{},childs:[]}),r(a,{text:`Create the image`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>t.image=n.toDataURL(`image/png`,{scale:2}))}},childs:[]}),r({initializeComponent:n=>{n.bindings.when(()=>{try{if(t&&t.image!==null&&t.image!==void 0)return t.image}catch(t){return e(t),null}},e=>r(`img`,{initializeComponent:e=>{e.attr.add({alt:`The code as an image`,src:()=>t.image}),e.class.add(`bc-image`)}},1))}})]})}function x(){return r(c,{gap:`md`,runover:{},childs:[r(s,{class:`bc-128`,format:`code128`,value:`ORDER-2026-118`,runover:{},childs:[]}),r(s,{class:`bc-39`,format:`code39`,value:`PART-77`,runover:{},childs:[]}),r(s,{class:`bc-13`,format:`ean13`,value:`400638133393`,runover:{},childs:[]}),r(s,{class:`bc-8`,format:`ean8`,value:`9638507`,runover:{},childs:[]}),r(s,{class:`bc-upc`,format:`upca`,value:`03600029145`,runover:{},childs:[]}),r(s,{class:`bc-itf`,format:`itf`,value:`1234567890`,runover:{},childs:[]})]})}function S(){return r(c,{gap:`md`,runover:{},childs:[r(s,{class:`bc-large`,value:`LARGE-1`,moduleWidth:3,height:96,runover:{},childs:[]}),r(s,{class:`bc-plain`,value:`NO-TEXT`,showText:!1,runover:{},childs:[]})]})}var C=class extends n{constructor(){super(`div`);let e=new s({value:`FIRST`}),t=new a({text:`Change the value`,variant:`outline`,onclick:()=>e.value=`SECOND`}),n=new c({gap:`md`});n.controls.add(e,t),this.controls.add(n)}};C.elementTag=`div`;function w(){let e=i({value:`4006381333931`,told:``});return r(c,{gap:`md`,runover:{},childs:[r(o,{label:`EAN-13`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.value,t=>{let n=e;n!=null&&typeof n.value!=`function`&&(n.value=t)})}},childs:[]}),r(s,{class:`bc-valid`,format:`ean13`,value:()=>e.value,onEncodeFailed:t=>e.told=`“${t.value}” is not a valid EAN-13.`,runover:{},childs:[]}),r(`output`,{initializeComponent:t=>{t.class.add(`bc-told`),t.bindings.method(()=>e.told)}},1)]})}var T=m(Object.assign({"./examples/Export.tsx":h,"./examples/Formats.tsx":g,"./examples/Options.tsx":_,"./examples/Programmatic.tsx":v,"./examples/Validation.tsx":y})),E=[[`code128`,`Any ASCII text`,`The default, for labels, shipping and stock. Digits are packed in pairs, so it stays short.`],[`code39`,"Capitals, digits and `- . $ / + %` and space",`Older industrial labels. Lower-case letters become capitals.`],[`ean13`,`12 or 13 digits`,`Retail products. The check digit is worked out, and a wrong one is refused.`],[`ean8`,`7 or 8 digits`,`Small retail products.`],[`upca`,`11 or 12 digits`,`Retail products in North America.`],[`itf`,`Digits`,`Interleaved 2 of 5, for cartons. An odd number of digits gets a leading zero.`]],D=[[`value`,"`Bind<string>`","`''`",`The value of the code.`],[`format`,"`Bind<BarcodeFormat>`","`'code128'`",`The kind of barcode.`],[`checkDigit`,"`Bind<boolean>`","`false`",`Adds the optional check character of Code 39.`],[`moduleWidth`,"`Bind<number>`","`2`",`The width of the thinnest bar in pixels.`],[`height`,"`Bind<number | null>`",`From the design language`,`The height of the bars in pixels.`],[`margin`,"`Bind<number>`","`10`",`The quiet zone at each side, in modules. Readers need it.`],[`showText`,"`Bind<boolean>`","`true`",`Shows the text under the bars.`],[`label`,"`Bind<string>`",`The kit string “Barcode: …”`,`The accessible name.`]],O=[[`isInvalid`,"`boolean`",`Indicates that the value could not be drawn.`],[`codeText`,"`string`",`The text under the bars, with the check digit where the format has one.`],[`toSVG(options?)`,"`string`",`The code as an SVG document, with its text.`],[`toDataURL(type?, options?)`,"`string`",`The code as a data URL, a PNG by default.`]],k=[[`scale`,"`number`","`2`",`The width of a module in pixels.`],[`color`,"`string`","`'#000000'`",`The color of the bars and the text.`],[`background`,"`string`","`'#ffffff'`",`The background.`]],A=[[`onEncodeFailed`,"`{ value, format, source }`",`Occurs when the format cannot hold the value, which then draws nothing.`]],j=[[`Name`,"The code has the role `img`, and its name holds the value, so a screen reader can read it."],[`Colors`,`A code stays dark on a light sheet in every theme, as readers expect.`],[`Width`,`A narrow parent scrolls the code rather than squeezing its bars, which would stop it reading.`]],M=[[`.mx-barcode`,"The sheet. `data-invalid` says the value could not be drawn."],[`.mx-barcode__svg, .mx-barcode__text`,`The bars and the text.`]],N=[[`barcode.height`,`The height of the bars.`],[`barcode.sheet, .text`,"Units: the sheet, whose `color` is the color of the bars, and the text."]];function P(){return t({initializeComponent:e=>{{let t=r(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=r(f,{text:`A linear barcode, drawn as vectors: Code 128, Code 39, EAN-13, EAN-8, UPC-A or Interleaved 2 of 5. It has no dependencies, works out check digits and refuses a value the format cannot hold.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let n=r(u,{anchor:`import`,title:`Import`,runover:{},childs:[r(l,{code:`
import { Barcode } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(n);let i=r(u,{anchor:`formats`,title:`Formats`,runover:{},childs:[r(`p`,{initializeComponent:e=>{let t=r(f,{text:"`format` sets the kind of barcode, and `value` what it holds.",runover:{},childs:[]});e.controls.add(t)}},1),r(p,{head:[`Format`,`Value`,`Description`],rows:E,runover:{},childs:[]}),r(d,{stack:!0,files:T(`Formats.tsx`),runover:{},childs:[r(x,{runover:{},childs:[]})]})]});e.controls.add(i);let a=r(u,{anchor:`options`,title:`Size and text`,runover:{},childs:[r(`p`,{initializeComponent:e=>{let t=r(f,{text:"`moduleWidth` and `height` set the size of the bars, and `showText` the text under them. Keep the bars wide enough for the distance it is read from.",runover:{},childs:[]});e.controls.add(t)}},1),r(d,{stack:!0,files:T(`Options.tsx`),runover:{},childs:[r(S,{runover:{},childs:[]})]})]});e.controls.add(a);let o=r(u,{anchor:`validation`,title:`Values that do not fit`,runover:{},childs:[r(`p`,{initializeComponent:e=>{let t=r(f,{text:"A value the format cannot hold draws nothing and raises `onEncodeFailed`. Change the last digit of this EAN-13 to see it refused.",runover:{},childs:[]});e.controls.add(t)}},1),r(d,{stack:!0,files:T(`Validation.tsx`),runover:{},childs:[r(w,{runover:{},childs:[]})]})]});e.controls.add(o);let s=r(u,{anchor:`export`,title:`Creating an image`,runover:{},childs:[r(`p`,{initializeComponent:e=>{let t=r(f,{text:"`toDataURL()` and `toSVG()` give an image with the text under the bars, in black on white unless you set other colors.",runover:{},childs:[]});e.controls.add(t)}},1),r(d,{stack:!0,files:T(`Export.tsx`),runover:{},childs:[r(b,{runover:{},childs:[]})]})]});e.controls.add(s);let c=r(u,{anchor:`programmatic`,title:`Programmatic use`,runover:{},childs:[r(`p`,{initializeComponent:e=>{let t=r(f,{text:"`new Barcode(props)` creates the code without JSX. Each prop is also a property.",runover:{},childs:[]});e.controls.add(t)}},1),r(d,{stack:!0,files:T(`Programmatic.tsx`),runover:{},childs:[r(C,{runover:{},childs:[]})]})]});e.controls.add(c);let m=r(u,{anchor:`api`,title:`API reference`,runover:{},childs:[r(`h3`,{initializeComponent:e=>{let t=r(f,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),r(p,{head:[`Prop`,`Type`,`Default`,`Description`],rows:D,runover:{},childs:[]}),r(`h3`,{initializeComponent:e=>{let t=r(f,{text:`Properties and methods`,runover:{},childs:[]});e.controls.add(t)}},1),r(p,{head:[`Member`,`Type`,`Description`],rows:O,runover:{},childs:[]}),r(`h3`,{initializeComponent:e=>{let t=r(f,{text:`Image options`,runover:{},childs:[]});e.controls.add(t)}},1),r(p,{head:[`Prop`,`Type`,`Default`,`Description`],rows:k,runover:{},childs:[]}),r(`h3`,{initializeComponent:e=>{let t=r(f,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),r(p,{head:[`Event`,`Type`,`Description`],rows:A,runover:{},childs:[]}),r(`h3`,{initializeComponent:e=>{let t=r(f,{text:`Accessibility`,runover:{},childs:[]});e.controls.add(t)}},1),r(p,{head:[`Topic`,`Details`],rows:j,runover:{},childs:[]}),r(`h3`,{initializeComponent:e=>{let t=r(f,{text:`Styling hooks`,runover:{},childs:[]});e.controls.add(t)}},1),r(p,{head:[`Hook`,`Description`],rows:M,runover:{},childs:[]}),r(`h3`,{initializeComponent:e=>{let t=r(f,{text:`Design tokens`,runover:{},childs:[]});e.controls.add(t)}},1),r(p,{head:[`Token`,`Description`],rows:N,runover:{},childs:[]})]});e.controls.add(m)}}})}export{P as default};