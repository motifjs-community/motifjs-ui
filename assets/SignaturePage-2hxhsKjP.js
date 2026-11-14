import{$n as e,Qn as t,Un as n,Zn as r,er as i,n as a}from"./next-id-CtzpBrBT.js";import{t as o}from"./Signature-CaKPWVaU.js";import{t as s}from"./Stack-wRt1e9tO.js";import{a as c,i as l,n as u,r as d,t as f}from"./docs-B_LZlyP5.js";import{t as p}from"./sources-BXVvOiIY.js";var m=`import { reactive } from '@motifx/core';\r
import { Signature, Stack, type SignatureStroke } from '@motifx-community/ui';\r
\r
/** A pad bound to a value. The value is the strokes themselves, so it can be stored and drawn again. */\r
export default function Basic() {\r
    const s = reactive({ strokes: [] as readonly SignatureStroke[] });\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <Signature class="sig-basic" label="Your signature" helpText="Sign with a pen, a finger or the mouse." x-model={() => s.strokes} />\r
            <output class="sig-told">{() => \`Strokes: \${s.strokes.length}\`}</output>\r
        </Stack>\r
    );\r
}\r
`,h=`import { reactive } from '@motifx/core';\r
import { Button, Signature, Stack } from '@motifx-community/ui';\r
\r
/** An image of the signature. It is drawn in black on a transparent background unless told otherwise. */\r
export default function Export() {\r
    const s = reactive({ image: '' });\r
    let pad!: Signature;\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <Signature ref={(x: Signature) => (pad = x)} class="sig-export" label="Sign to create an image" />\r
            <Button text="Create the image" variant="outline" onclick={() => (s.image = pad.toDataURL('image/png', { background: '#ffffff', width: 420 }))} />\r
            {s.image && <img class="sig-image" alt="The signature as an image" src={() => s.image} style="max-inline-size: 100%; border: 1px solid var(--mx-color-stroke-divider)" />}\r
        </Stack>\r
    );\r
}\r
`,g=`import { Signature, Stack } from '@motifx-community/ui';\r
\r
/** The pen, the size of the pad and which parts it shows. */\r
export default function Options() {\r
    return (\r
        <Stack gap="lg" style="inline-size: 100%">\r
            <Signature class="sig-pen" label="A thick blue pen" penColor="#1d4ed8" minWidth={2} maxWidth={6} height={120} />\r
            <Signature class="sig-plain" label="Only the pad" showGuide={false} showClear={false} showUndo={false} placeholder="" height={120} />\r
        </Stack>\r
    );\r
}\r
`,_=`import { Component } from '@motifx/core';\r
import { Button, Signature, Stack } from '@motifx-community/ui';\r
\r
/** A pad created programmatically. \`undo()\` and \`clear()\` do what its buttons do. */\r
export default class Programmatic extends Component<HTMLDivElement> {\r
    constructor() {\r
        super('div');\r
        const pad = new Signature({ label: 'Programmatic signature', height: 120, showUndo: false, showClear: false });\r
        const clear = new Button({ text: 'Clear', variant: 'outline', onclick: () => pad.clear() });\r
        const stack = new Stack({ gap: 'md' });\r
        stack.controls.add(pad, clear);\r
        this.controls.add(stack);\r
    }\r
}\r
`,v=`import { Button, Signature, Stack, type SignatureStroke } from '@motifx-community/ui';\r
\r
const SAVED: readonly SignatureStroke[] = [\r
    {\r
        points: Array.from({ length: 40 }, (_, i) => ({\r
            x: 0.12 + (i / 39) * 0.76,\r
            y: 0.5 + Math.sin(i / 3) * 0.2 * (1 - i / 60),\r
            pressure: 0.3 + (i % 8) / 12\r
        }))\r
    }\r
];\r
\r
/** A saved signature drawn again, a required field, and a pad that cannot be changed. */\r
export default function States() {\r
    let pad!: Signature;\r
    return (\r
        <Stack gap="lg" style="inline-size: 100%">\r
            <Signature class="sig-saved" label="Saved signature" value={SAVED} height={120} readOnly />\r
            <Signature ref={(x: Signature) => (pad = x)} class="sig-required" label="Required" required height={120} />\r
            <Button text="Validate" variant="outline" onclick={() => void pad.validate()} />\r
            <Signature class="sig-disabled" label="Disabled" enabled={false} height={100} />\r
        </Stack>\r
    );\r
}\r
`;function y(){let e=i({strokes:[]});return r(s,{gap:`md`,style:`inline-size: 100%`,runover:{},childs:[r(o,{class:`sig-basic`,label:`Your signature`,helpText:`Sign with a pen, a finger or the mouse.`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.strokes,t=>{let n=e;n!=null&&typeof n.strokes!=`function`&&(n.strokes=t)})}},childs:[]}),r(`output`,{initializeComponent:t=>{t.class.add(`sig-told`),t.bindings.method(()=>`Strokes: ${e.strokes.length}`)}},1)]})}function b(){let t=i({image:``}),n;return r(s,{gap:`md`,style:`inline-size: 100%`,runover:{},childs:[r(o,{class:`sig-export`,label:`Sign to create an image`,ref:e=>n=e,runover:{},childs:[]}),r(a,{text:`Create the image`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>t.image=n.toDataURL(`image/png`,{background:`#ffffff`,width:420}))}},childs:[]}),r({initializeComponent:n=>{n.bindings.when(()=>{try{if(t&&t.image!==null&&t.image!==void 0)return t.image}catch(t){return e(t),null}},e=>r(`img`,{initializeComponent:e=>{e.style(`max-inline-size: 100%; border: 1px solid var(--mx-color-stroke-divider)`),e.attr.add({alt:`The signature as an image`,src:()=>t.image}),e.class.add(`sig-image`)}},1))}})]})}function x(){return r(s,{gap:`lg`,style:`inline-size: 100%`,runover:{},childs:[r(o,{class:`sig-pen`,label:`A thick blue pen`,penColor:`#1d4ed8`,minWidth:2,maxWidth:6,height:120,runover:{},childs:[]}),r(o,{class:`sig-plain`,label:`Only the pad`,showGuide:!1,showClear:!1,showUndo:!1,placeholder:``,height:120,runover:{},childs:[]})]})}var S=class extends n{constructor(){super(`div`);let e=new o({label:`Programmatic signature`,height:120,showUndo:!1,showClear:!1}),t=new a({text:`Clear`,variant:`outline`,onclick:()=>e.clear()}),n=new s({gap:`md`});n.controls.add(e,t),this.controls.add(n)}};S.elementTag=`div`;var C=[{points:Array.from({length:40},(e,t)=>({x:.12+t/39*.76,y:.5+Math.sin(t/3)*.2*(1-t/60),pressure:.3+t%8/12}))}];function w(){let e;return r(s,{gap:`lg`,style:`inline-size: 100%`,runover:{},childs:[r(o,{class:`sig-saved`,label:`Saved signature`,value:C,height:120,readOnly:!0,runover:{},childs:[]}),r(o,{class:`sig-required`,label:`Required`,required:!0,height:120,ref:t=>e=t,runover:{},childs:[]}),r(a,{text:`Validate`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>void e.validate())}},childs:[]}),r(o,{class:`sig-disabled`,label:`Disabled`,enabled:!1,height:100,runover:{},childs:[]})]})}var T=p(Object.assign({"./examples/Basic.tsx":m,"./examples/Export.tsx":h,"./examples/Options.tsx":g,"./examples/Programmatic.tsx":_,"./examples/States.tsx":v})),E=[[`height`,"`Bind<number | null>`",`From the design language`,`The height of the pad in pixels.`],[`penColor`,"`Bind<string | null>`",`From the design language`,`The color of the lines.`],[`minWidth, maxWidth`,"`Bind<number>`","`1`, `3`",`The width of a line at its thinnest and thickest, in pixels.`],[`placeholder`,"`Bind<string>`",`The kit string “Sign here”`,"The text of the empty pad. `''` removes it."],[`showGuide`,"`Bind<boolean>`","`true`",`Draws the line to sign on.`],[`showClear, showUndo`,"`Bind<boolean>`","`true`",`Show the buttons that remove the signature and the last stroke.`],[`label, helpText, readOnly, required, rules, error, validateOn`,``,``,"Same as `TextBox`."]],D=[[`value`,"`readonly SignatureStroke[]`","The strokes. `x-model` provides two-way binding."],[`isEmpty`,"`boolean`",`Indicates that nothing has been signed.`],[`clear()`,"`void`",`Removes the signature.`],[`undo()`,"`void`",`Removes the last stroke.`],[`toDataURL(type?, options?)`,"`string`",`The signature as a data URL, a PNG by default.`],[`toBlob(type?, options?)`,"`Promise<Blob | null>`",`The signature as an image file, a PNG by default.`],[`toSVG(options?)`,"`string`",`The signature as an SVG document.`]],O=[[`width, height`,"`number`",`Twice the pad`,`The size of the image in pixels. The height keeps the shape of the pad.`],[`color`,"`string`","`'#000000'`",`The color of the lines, which does not depend on the theme.`],[`background`,"`string`",`Transparent`,`The background.`]],k=[[`SignatureStroke`,"`{ points: readonly SignaturePoint[] }`",`One line drawn without lifting the pen.`],[`SignaturePoint`,"`{ x, y, pressure }`","`x` and `y` run from `0` to `1` across the pad, so a signature fits a pad of any size. `pressure` runs from `0` to `1`."]],A=[[`onStrokeBegan`,"`{ stroke, originalEvent, source }`",`Occurs when the pen touches the pad.`],[`onStrokeEnded`,"`{ stroke, originalEvent, source }`",`Occurs when the pen leaves the pad, after the value has changed.`],[`onValueChanged`,"`{ value, previousValue, byUser, source, event }`","Same as `TextBox`."]],j=[[`Delete`,`Removes the signature.`],[`Ctrl+Z`,`Removes the last stroke.`],[`Tab`,`Moves focus to the pad, and then to its buttons.`]],M=[[`Pad`,"The pad has the role `img`, the name of its label, and says whether it is signed."],[`Signing`,"A signature is drawn with a pointer. Where a person may not be able to draw, offer another way, such as typing the name in a `TextBox`."],[`Touch`,`The pad takes every touch, so signing does not scroll the page.`]],N=[[`.mx-signature`,"The field. `data-invalid`, `data-readonly` and `data-disabled` describe its state."],[`.mx-signature__pad, .mx-signature__canvas, .mx-signature__guide, .mx-signature__placeholder`,`The pad, the canvas, the line to sign on and the text.`],[`.mx-signature__actions`,`The buttons in the corner of the pad.`]],P=[[`signature.width, .height, .guide-inset, .actions-inset`,`The size of the field and of the pad, and the distances of the line and the buttons.`],[`signature.pad, .guide, .placeholder`,"Units: the pad, whose `color` is the color of the ink (`focus`, `invalid`, `readonly`, `disabled`), the line and the text."],[`signature.field`,`Place: the field under the pad, without a box of its own.`]];function F(){return t({initializeComponent:e=>{{let t=r(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=r(d,{text:`A pad to sign on with a pen, a finger or a mouse. The value is the strokes themselves, so a signature can be stored as data, drawn again at any size and exported as an image.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let n=r(l,{anchor:`import`,title:`Import`,runover:{},childs:[r(c,{code:`
import { Signature } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(n);let i=r(l,{anchor:`basic`,title:`Signing`,runover:{},childs:[r(`p`,{initializeComponent:e=>{let t=r(d,{text:"`x-model` binds the strokes. A pen that reports pressure sets the width of the line, and otherwise it follows the speed. The buttons in the corner remove the last stroke and the whole signature.",runover:{},childs:[]});e.controls.add(t)}},1),r(u,{stack:!0,files:T(`Basic.tsx`),runover:{},childs:[r(y,{runover:{},childs:[]})]})]});e.controls.add(i);let a=r(l,{anchor:`export`,title:`Creating an image`,runover:{},childs:[r(`p`,{initializeComponent:e=>{let t=r(d,{text:"`toDataURL()`, `toBlob()` and `toSVG()` give an image. It is drawn in black so that it does not depend on the theme, and the background is transparent unless you set one.",runover:{},childs:[]});e.controls.add(t)}},1),r(u,{stack:!0,files:T(`Export.tsx`),runover:{},childs:[r(b,{runover:{},childs:[]})]})]});e.controls.add(a);let o=r(l,{anchor:`options`,title:`The pen and the pad`,runover:{},childs:[r(`p`,{initializeComponent:e=>{let t=r(d,{text:"`penColor`, `minWidth` and `maxWidth` set the pen, and `height` the pad. `showGuide`, `showClear`, `showUndo` and `placeholder` turn its parts on and off.",runover:{},childs:[]});e.controls.add(t)}},1),r(u,{stack:!0,files:T(`Options.tsx`),runover:{},childs:[r(x,{runover:{},childs:[]})]})]});e.controls.add(o);let s=r(l,{anchor:`states`,title:`Saved signatures and states`,runover:{},childs:[r(`p`,{initializeComponent:e=>{let t=r(d,{text:"Giving the stored strokes as `value` draws the signature again. `required`, `readOnly` and `enabled` work as in every field.",runover:{},childs:[]});e.controls.add(t)}},1),r(u,{stack:!0,files:T(`States.tsx`),runover:{},childs:[r(w,{runover:{},childs:[]})]})]});e.controls.add(s);let p=r(l,{anchor:`programmatic`,title:`Programmatic use`,runover:{},childs:[r(`p`,{initializeComponent:e=>{let t=r(d,{text:"`new Signature(props)` creates the pad without JSX. Each prop is also a property.",runover:{},childs:[]});e.controls.add(t)}},1),r(u,{stack:!0,files:T(`Programmatic.tsx`),runover:{},childs:[r(S,{runover:{},childs:[]})]})]});e.controls.add(p);let m=r(l,{anchor:`api`,title:`API reference`,runover:{},childs:[r(`h3`,{initializeComponent:e=>{let t=r(d,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),r(f,{head:[`Prop`,`Type`,`Default`,`Description`],rows:E,runover:{},childs:[]}),r(`h3`,{initializeComponent:e=>{let t=r(d,{text:`Properties and methods`,runover:{},childs:[]});e.controls.add(t)}},1),r(f,{head:[`Member`,`Type`,`Description`],rows:D,runover:{},childs:[]}),r(`h3`,{initializeComponent:e=>{let t=r(d,{text:`Image options`,runover:{},childs:[]});e.controls.add(t)}},1),r(f,{head:[`Prop`,`Type`,`Default`,`Description`],rows:O,runover:{},childs:[]}),r(`h3`,{initializeComponent:e=>{let t=r(d,{text:`Types`,runover:{},childs:[]});e.controls.add(t)}},1),r(f,{head:[`Member`,`Type`,`Description`],rows:k,runover:{},childs:[]}),r(`h3`,{initializeComponent:e=>{let t=r(d,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),r(f,{head:[`Event`,`Type`,`Description`],rows:A,runover:{},childs:[]}),r(`h3`,{initializeComponent:e=>{let t=r(d,{text:`Keyboard`,runover:{},childs:[]});e.controls.add(t)}},1),r(f,{head:[`Key`,`Description`],rows:j,runover:{},childs:[]}),r(`h3`,{initializeComponent:e=>{let t=r(d,{text:`Accessibility`,runover:{},childs:[]});e.controls.add(t)}},1),r(f,{head:[`Topic`,`Details`],rows:M,runover:{},childs:[]}),r(`h3`,{initializeComponent:e=>{let t=r(d,{text:`Styling hooks`,runover:{},childs:[]});e.controls.add(t)}},1),r(f,{head:[`Hook`,`Description`],rows:N,runover:{},childs:[]}),r(`h3`,{initializeComponent:e=>{let t=r(d,{text:`Design tokens`,runover:{},childs:[]});e.controls.add(t)}},1),r(f,{head:[`Token`,`Description`],rows:P,runover:{},childs:[]})]});e.controls.add(m)}}})}export{F as default};