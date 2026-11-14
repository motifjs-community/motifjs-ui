import{$n as e,Qn as t,Un as n,Zn as r,er as i,n as a}from"./next-id-CtzpBrBT.js";import{t as o}from"./TextBox-iHQY3j6o.js";import{t as s}from"./ButtonGroup-D5Vn22Ds.js";import{t as c}from"./QRCode-C94iRE4X.js";import{t as l}from"./Stack-wRt1e9tO.js";import{a as u,i as d,n as f,r as p,t as m}from"./docs-B_LZlyP5.js";import{t as h}from"./sources-BXVvOiIY.js";var g=`import { reactive } from '@motifx/core';\r
import { QRCode, Stack, TextBox } from '@motifx-community/ui';\r
\r
/** A code that follows a text. The smallest version that holds the text is chosen. */\r
export default function Basic() {\r
    const s = reactive({ text: 'https://ui.motifjs.com' });\r
    return (\r
        <Stack gap="md">\r
            <TextBox label="Text" x-model={() => s.text} />\r
            <QRCode class="qr-basic" value={() => s.text} />\r
        </Stack>\r
    );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { Button, QRCode, Stack } from '@motifx-community/ui';\r
\r
/** An image of the code, to download or print. */\r
export default function Export() {\r
    const s = reactive({ image: '' });\r
    let code!: QRCode;\r
    return (\r
        <Stack gap="md">\r
            <QRCode ref={(x: QRCode) => (code = x)} class="qr-export" value="Printed with the order" />\r
            <Button text="Create the image" variant="outline" onclick={() => (s.image = code.toDataURL('image/png', { size: 256 }))} />\r
            {s.image && <img class="qr-image" alt="The code as an image" src={() => s.image} />}\r
        </Stack>\r
    );\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { ButtonGroup, QRCode, Stack, type QrLevel } from '@motifx-community/ui';\r
\r
/** A higher level survives more damage, and needs a larger code. */\r
export default function Levels() {\r
    const s = reactive({ level: 'M' as QrLevel });\r
    return (\r
        <Stack gap="md">\r
            <ButtonGroup\r
                label="Error correction"\r
                x-model={() => s.level}\r
                items={[\r
                    { value: 'L', text: 'L' },\r
                    { value: 'M', text: 'M' },\r
                    { value: 'Q', text: 'Q' },\r
                    { value: 'H', text: 'H' }\r
                ]}\r
            />\r
            <QRCode class="qr-level" value="https://ui.motifjs.com/qrcode" level={() => s.level} size={200} />\r
        </Stack>\r
    );\r
}\r
`,y=`import { QRCode } from '@motifx-community/ui';\r
\r
/** A logo in the middle, which takes the place of some modules. Level H restores what it covers. */\r
export default function Logo() {\r
    return <QRCode class="qr-logo" value="https://ui.motifjs.com/qrcode" level="H" logo="/favicon.svg" size={220} />;\r
}\r
`,b=`import { Component } from '@motifx/core';\r
import { Button, QRCode, Stack } from '@motifx-community/ui';\r
\r
/** A code created programmatically. Each prop is also a property that can be set later. */\r
export default class Programmatic extends Component<HTMLDivElement> {\r
    constructor() {\r
        super('div');\r
        const code = new QRCode({ value: 'First', size: 140 });\r
        const next = new Button({ text: 'Change the text', variant: 'outline', onclick: () => (code.value = 'Second') });\r
        const stack = new Stack({ gap: 'md' });\r
        stack.controls.add(code, next);\r
        this.controls.add(stack);\r
    }\r
}\r
`;function x(){let e=i({text:`https://ui.motifjs.com`});return r(l,{gap:`md`,runover:{},childs:[r(o,{label:`Text`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.text,t=>{let n=e;n!=null&&typeof n.text!=`function`&&(n.text=t)})}},childs:[]}),r(c,{class:`qr-basic`,value:()=>e.text,runover:{},childs:[]})]})}function S(){let t=i({image:``}),n;return r(l,{gap:`md`,runover:{},childs:[r(c,{class:`qr-export`,value:`Printed with the order`,ref:e=>n=e,runover:{},childs:[]}),r(a,{text:`Create the image`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>t.image=n.toDataURL(`image/png`,{size:256}))}},childs:[]}),r({initializeComponent:n=>{n.bindings.when(()=>{try{if(t&&t.image!==null&&t.image!==void 0)return t.image}catch(t){return e(t),null}},e=>r(`img`,{initializeComponent:e=>{e.attr.add({alt:`The code as an image`,src:()=>t.image}),e.class.add(`qr-image`)}},1))}})]})}function C(){let e=i({level:`M`});return r(l,{gap:`md`,runover:{},childs:[r(s,{label:`Error correction`,items:[{value:`L`,text:`L`},{value:`M`,text:`M`},{value:`Q`,text:`Q`},{value:`H`,text:`H`}],runover:{initializeComponent:t=>{t.bindings.model(()=>e.level,t=>{let n=e;n!=null&&typeof n.level!=`function`&&(n.level=t)})}},childs:[]}),r(c,{class:`qr-level`,value:`https://ui.motifjs.com/qrcode`,level:()=>e.level,size:200,runover:{},childs:[]})]})}function w(){return r(c,{class:`qr-logo`,value:`https://ui.motifjs.com/qrcode`,level:`H`,logo:`/favicon.svg`,size:220,runover:{},childs:[]})}var T=class extends n{constructor(){super(`div`);let e=new c({value:`First`,size:140}),t=new a({text:`Change the text`,variant:`outline`,onclick:()=>e.value=`Second`}),n=new l({gap:`md`});n.controls.add(e,t),this.controls.add(n)}};T.elementTag=`div`;var E=h(Object.assign({"./examples/Basic.tsx":g,"./examples/Export.tsx":_,"./examples/Levels.tsx":v,"./examples/Logo.tsx":y,"./examples/Programmatic.tsx":b})),D=[[`value`,"`Bind<string>`","`''`",`The text of the code. It may hold any characters.`],[`level`,"`Bind<'L' | 'M' | 'Q' | 'H'>`","`'M'`",`How much of the code can be damaged: about 7, 15, 25 or 30 percent.`],[`size`,"`Bind<number | null>`",`From the design language`,`The width and height in pixels.`],[`margin`,"`Bind<number>`","`4`","The quiet zone around the code, in modules. Readers need at least `4`."],[`logo`,"`Bind<string | null>`","`null`","The address of an image in the middle of the code. Use level `H` with it."],[`logoSize`,"`Bind<number>`","`0.2`","The share of the code the logo covers, at most `0.3`."],[`label`,"`Bind<string>`",`The kit string “QR code: …”`,`The accessible name.`]],O=[[`isInvalid`,"`boolean`",`Indicates that the value could not be drawn.`],[`modules`,"`number`",`The number of modules along a side of the code, without its margin.`],[`toSVG(options?)`,"`string`",`The code as an SVG document. The logo is not part of it.`],[`toDataURL(type?, options?)`,"`string`",`The code as a data URL, a PNG by default. The logo is not part of it.`]],k=[[`size`,"`number`","`512`",`The width and height in pixels, rounded to whole modules.`],[`color`,"`string`","`'#000000'`",`The color of the modules.`],[`background`,"`string`","`'#ffffff'`",`The background.`]],A=[[`onEncodeFailed`,"`{ value, source }`",`Occurs when the text does not fit in a code, which then draws nothing.`]],j=[[`Name`,"The code has the role `img`, and its name holds the text, so a screen reader can read it."],[`Colors`,`A code stays dark on a light sheet in every theme, as readers expect.`],[`Size`,`For printing, keep a module at least 0.4 mm wide, and leave the quiet zone in place.`]],M=[[`.mx-qr-code`,"The sheet. `data-invalid` says the value could not be drawn."],[`.mx-qr-code__svg, .mx-qr-code__logo`,`The code and the logo.`]],N=[[`qr-code.size`,`The width and height.`],[`qr-code.sheet, .logo`,"Units: the sheet, whose `color` is the color of the modules, and the logo."]];function P(){return t({initializeComponent:e=>{{let t=r(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=r(p,{text:`A QR code, drawn as vectors so that it stays sharp at any size. It has no dependencies, chooses the smallest version that holds the text, and can carry a logo.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let n=r(d,{anchor:`import`,title:`Import`,runover:{},childs:[r(u,{code:`
import { QRCode } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(n);let i=r(d,{anchor:`basic`,title:`A code from a text`,runover:{},childs:[r(`p`,{initializeComponent:e=>{let t=r(p,{text:"`value` is the text of the code, and the code follows it. Change the text to see the code grow.",runover:{},childs:[]});e.controls.add(t)}},1),r(f,{stack:!0,files:E(`Basic.tsx`),runover:{},childs:[r(x,{runover:{},childs:[]})]})]});e.controls.add(i);let a=r(d,{anchor:`levels`,title:`Error correction`,runover:{},childs:[r(`p`,{initializeComponent:e=>{let t=r(p,{text:"`level` sets how much of the code can be damaged. A higher level holds less text, so the code grows.",runover:{},childs:[]});e.controls.add(t)}},1),r(f,{stack:!0,files:E(`Levels.tsx`),runover:{},childs:[r(C,{runover:{},childs:[]})]})]});e.controls.add(a);let o=r(d,{anchor:`logo`,title:`A logo`,runover:{},childs:[r(`p`,{initializeComponent:e=>{let t=r(p,{text:"`logo` puts an image in the middle, which takes the place of some modules. Level `H` restores what it covers. `logoSize` sets its share, at most `0.3`.",runover:{},childs:[]});e.controls.add(t)}},1),r(f,{stack:!0,files:E(`Logo.tsx`),runover:{},childs:[r(w,{runover:{},childs:[]})]})]});e.controls.add(o);let s=r(d,{anchor:`export`,title:`Creating an image`,runover:{},childs:[r(`p`,{initializeComponent:e=>{let t=r(p,{text:"`toDataURL()` and `toSVG()` give an image, in black on white unless you set other colors. `onEncodeFailed` occurs when a text does not fit in a code.",runover:{},childs:[]});e.controls.add(t)}},1),r(f,{stack:!0,files:E(`Export.tsx`),runover:{},childs:[r(S,{runover:{},childs:[]})]})]});e.controls.add(s);let c=r(d,{anchor:`programmatic`,title:`Programmatic use`,runover:{},childs:[r(`p`,{initializeComponent:e=>{let t=r(p,{text:"`new QRCode(props)` creates the code without JSX. Each prop is also a property.",runover:{},childs:[]});e.controls.add(t)}},1),r(f,{stack:!0,files:E(`Programmatic.tsx`),runover:{},childs:[r(T,{runover:{},childs:[]})]})]});e.controls.add(c);let l=r(d,{anchor:`api`,title:`API reference`,runover:{},childs:[r(`h3`,{initializeComponent:e=>{let t=r(p,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),r(m,{head:[`Prop`,`Type`,`Default`,`Description`],rows:D,runover:{},childs:[]}),r(`h3`,{initializeComponent:e=>{let t=r(p,{text:`Properties and methods`,runover:{},childs:[]});e.controls.add(t)}},1),r(m,{head:[`Member`,`Type`,`Description`],rows:O,runover:{},childs:[]}),r(`h3`,{initializeComponent:e=>{let t=r(p,{text:`Image options`,runover:{},childs:[]});e.controls.add(t)}},1),r(m,{head:[`Prop`,`Type`,`Default`,`Description`],rows:k,runover:{},childs:[]}),r(`h3`,{initializeComponent:e=>{let t=r(p,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),r(m,{head:[`Event`,`Type`,`Description`],rows:A,runover:{},childs:[]}),r(`h3`,{initializeComponent:e=>{let t=r(p,{text:`Accessibility`,runover:{},childs:[]});e.controls.add(t)}},1),r(m,{head:[`Topic`,`Details`],rows:j,runover:{},childs:[]}),r(`h3`,{initializeComponent:e=>{let t=r(p,{text:`Styling hooks`,runover:{},childs:[]});e.controls.add(t)}},1),r(m,{head:[`Hook`,`Description`],rows:M,runover:{},childs:[]}),r(`h3`,{initializeComponent:e=>{let t=r(p,{text:`Design tokens`,runover:{},childs:[]});e.controls.add(t)}},1),r(m,{head:[`Token`,`Description`],rows:N,runover:{},childs:[]})]});e.controls.add(l)}}})}export{P as default};