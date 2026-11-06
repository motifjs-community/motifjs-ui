import{Mt as e,Qt as t,St as n,a as r,an as i,g as a,gt as o,h as s,i as c,mt as l,n as u,nn as d,pt as f,r as p,rn as m,st as h,t as g}from"./doc-B1CtlCkV.js";import{t as _}from"./Spinner-D9KeEOWM.js";import{c as v,d as y,s as b,u as x}from"./draw-parts-CqFeWILG.js";import{t as S}from"./Stack-AS0iyAxC.js";import{t as C}from"./Panel-psRyqKP0.js";import{t as w}from"./inert-around-CL9Rk5hp.js";import{t as T}from"./index-DVbtDn93.js";import{t as E}from"./sources-BXVvOiIY.js";var D=[`target`,`value`,`delay`,`shade`,`showPane`,`showIndicator`,`cancelable`,`cancelText`,`closeOnOutside`],O=class extends h{pane;spinner;messagePart;cancelButton;shownNow=!1;timer=null;host=null;undo=null;returnTo=null;telling=!1;shownEmitter=new t;hiddenEmitter=new t;cancelled=new t;constructor(e){super(`div`,e);let t=this.props??{},n=this.element;n.classList.add(`mx-load-panel`),n.tabIndex=-1,x(n,!1),this.pane=v(this,`div`,`mx-load-panel__pane`),this.pane.element.setAttribute(`role`,`status`),this.spinner=new _({size:`lg`}),this.spinner.element.classList.add(`mx-load-panel__indicator`),this.spinner.element.setAttribute(`aria-hidden`,`true`),this.pane.controls.add(this.spinner),this.messagePart=v(this.pane,`div`,`mx-load-panel__message`),this.cancelButton=new s({onclick:()=>this.cancel()}),this.cancelButton.element.classList.add(`mx-load-panel__cancel`),this.pane.controls.add(this.cancelButton);for(let e of D)t[e]!==void 0&&this.bindProperty(e,t[e]);t.message!==void 0&&this.bindProperty(`text`,t.message),t.onShown&&this.shownEmitter.event(t.onShown),t.onHidden&&this.hiddenEmitter.event(t.onHidden),t.onCancel&&this.cancelled.event(t.onCancel),this.observeProperty(`text`,()=>this.drawTexts()),this.observeProperty(`cancelText`,()=>this.drawTexts()),this.observeProperty(`shade`,e=>b(n,`data-shade`,e!==!1)),this.observeProperty(`showPane`,e=>b(n,`data-pane`,e!==!1)),this.observeProperty(`showIndicator`,e=>x(this.spinner.element,e!==!1)),this.observeProperty(`cancelable`,e=>x(this.cancelButton.element,!!e)),this.observeProperty(`value`,e=>{this.telling||(e?this.show():this.hide())}),a(this,()=>this.drawTexts()),n.addEventListener(`click`,e=>{e.target===n&&this.peekProperty(`closeOnOutside`)&&this.hide()}),n.addEventListener(`keydown`,e=>{e.key===`Escape`&&this.peekProperty(`cancelable`)&&(e.preventDefault(),e.stopPropagation(),this.cancel())}),this.motif.setDisposable(()=>{this.hide(),this.shownEmitter.dispose(),this.hiddenEmitter.dispose(),this.cancelled.dispose()})}get target(){return this.getProperty(`target`)??null}set target(e){this.assignProperty(`target`,e)}get message(){return this.text}set message(e){this.text=e}get value(){return!!this.getProperty(`value`)}set value(e){this.assignProperty(`value`,e,Boolean)}get delay(){return this.getProperty(`delay`)??0}set delay(e){this.assignProperty(`delay`,e,Number)}get shade(){return this.getProperty(`shade`)!==!1}set shade(e){this.assignProperty(`shade`,e)}get showPane(){return this.getProperty(`showPane`)!==!1}set showPane(e){this.assignProperty(`showPane`,e)}get showIndicator(){return this.getProperty(`showIndicator`)!==!1}set showIndicator(e){this.assignProperty(`showIndicator`,e)}get cancelable(){return!!this.getProperty(`cancelable`)}set cancelable(e){this.assignProperty(`cancelable`,e,Boolean)}get cancelText(){return this.getProperty(`cancelText`)??``}set cancelText(e){this.assignProperty(`cancelText`,e)}get closeOnOutside(){return!!this.getProperty(`closeOnOutside`)}set closeOnOutside(e){this.assignProperty(`closeOnOutside`,e,Boolean)}get isShown(){return this.shownNow}get onShown(){return this.shownEmitter.event}get onHidden(){return this.hiddenEmitter.event}get onCancel(){return this.cancelled.event}show(){if(this.shownNow||this.timer)return!1;this.tell(!0);let e=this.delay;return e>0?this.timer=setTimeout(()=>{this.timer=null,this.mount()},e):this.mount(),!0}hide(){if(this.timer&&=(clearTimeout(this.timer),null),this.tell(!1),!this.shownNow)return;let e=this.element,t=e.contains(f(e));if(this.shownNow=!1,this.undo?.(),this.undo=null,x(e,!1),t){let e=this.returnTo;e?.isConnected&&o(e)?e.focus({preventScroll:!0}):this.host&&l(this.host)}this.returnTo=null,this.host=null,this.hiddenEmitter.fire()}cancel(){this.cancelled.fire(),this.hide()}mount(){let e=this.peekProperty(`target`)??null,t=e===null?this.element.ownerDocument.body:n(e)?e:e.element;if(!t?.isConnected){this.tell(!1);return}let r=this.element;this.isBuilt||this.build(),b(r,`data-page`,e===null),r.parentElement!==t&&t.append(r);let i=f();this.returnTo=i&&(e===null||t.contains(i))?i:null;let a=t.getAttribute(`aria-busy`);t.setAttribute(`aria-busy`,`true`),e!==null&&t.setAttribute(`data-mx-covered`,``);let o=w(r,t);this.undo=()=>{o(),a===null?t.removeAttribute(`aria-busy`):t.setAttribute(`aria-busy`,a),t.removeAttribute(`data-mx-covered`)},this.host=t,this.shownNow=!0,x(r,!0),this.returnTo&&(this.peekProperty(`cancelable`)?this.cancelButton.focus():r.focus({preventScroll:!0})),this.shownEmitter.fire()}tell(e){this.telling=!0;try{this.peekProperty(`value`)!==e&&this.changeProperty(`value`,e),this.bindings.writeModel(e)}finally{this.telling=!1}}drawTexts(){let t=e.strings;y(this.messagePart.element,this.peekProperty(`text`)||t.loading);let n=this.peekProperty(`cancelText`)||t.cancel;this.cancelButton.text!==n&&(this.cancelButton.text=n)}},k=`import { reactive } from '@motifx/core';\r
import { Button, LoadPanel, Panel, Stack, TextBox } from '@motifx-community/ui';\r
\r
/** A load panel over a panel while its orders load: bound with x-model, shown after a short delay. */\r
export default function Container() {\r
    const s = reactive({ loading: false, result: '' });\r
    let panel!: Panel;\r
\r
    // Simulates a server call.\r
    const load = () => {\r
        s.loading = true;\r
        s.result = '';\r
        setTimeout(() => {\r
            s.loading = false;\r
            s.result = 'Orders loaded.';\r
        }, 1800);\r
    };\r
\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <Panel class="lp-panel" variant="outline" padding="md" style="min-block-size: 10rem" ref={(c: Panel) => (panel = c)}>\r
                <Stack orientation="horizontal" wrap align="center">\r
                    <TextBox label="Customer" value="Ada" />\r
                    <Button text="Load orders" tone="accent" onclick={load} />\r
                </Stack>\r
            </Panel>\r
            <LoadPanel target={() => panel} message="Loading orders" delay={200} x-model={() => s.loading} />\r
            <output class="lp-result">{() => s.result}</output>\r
        </Stack>\r
    );\r
}\r
`,A=`import { reactive } from '@motifx/core';\r
import { Button, LoadPanel, Panel, Stack } from '@motifx-community/ui';\r
\r
/** Without the shade, the panel or the indicator. A click on the shade can hide it. */\r
export default function Options() {\r
    const s = reactive({ clear: false, bare: false, words: false });\r
    let clear!: Panel;\r
    let bare!: Panel;\r
    let words!: Panel;\r
    const flash = (key: 'clear' | 'bare' | 'words') => {\r
        s[key] = true;\r
        setTimeout(() => (s[key] = false), 2500);\r
    };\r
    return (\r
        <Stack orientation="horizontal" wrap align="center" style="inline-size: 100%">\r
            <Panel variant="outline" padding="md" style="min-inline-size: 16rem; min-block-size: 9rem" ref={(c: Panel) => (clear = c)}>\r
                <Button text="No shade" variant="outline" onclick={() => flash('clear')} />\r
            </Panel>\r
            <LoadPanel target={() => clear} shade={false} x-model={() => s.clear} closeOnOutside />\r
            <Panel variant="outline" padding="md" style="min-inline-size: 16rem; min-block-size: 9rem" ref={(c: Panel) => (bare = c)}>\r
                <Button text="No pane" variant="outline" onclick={() => flash('bare')} />\r
            </Panel>\r
            <LoadPanel target={() => bare} showPane={false} x-model={() => s.bare} />\r
            <Panel variant="outline" padding="md" style="min-inline-size: 16rem; min-block-size: 9rem" ref={(c: Panel) => (words = c)}>\r
                <Button text="Words only" variant="outline" onclick={() => flash('words')} />\r
            </Panel>\r
            <LoadPanel target={() => words} showIndicator={false} message="Please wait" x-model={() => s.words} />\r
        </Stack>\r
    );\r
}\r
`,j=`import { reactive } from '@motifx/core';\r
import { Button, LoadPanel, Stack } from '@motifx-community/ui';\r
\r
/** Over the whole page, with a Cancel button: the work stops when it is pressed (or on Escape). */\r
export default function Page() {\r
    const s = reactive({ told: '' });\r
    let timer: ReturnType<typeof setTimeout> | null = null;\r
    const panel = new LoadPanel({\r
        message: 'Building the report…',\r
        cancelable: true,\r
        onCancel: () => {\r
            if (timer) clearTimeout(timer);\r
            timer = null;\r
            s.told = 'Cancelled.';\r
        }\r
    });\r
    const start = () => {\r
        s.told = '';\r
        panel.show();\r
        timer = setTimeout(() => {\r
            timer = null;\r
            panel.hide();\r
            s.told = 'The report is ready.';\r
        }, 4000);\r
    };\r
    return (\r
        <Stack orientation="horizontal" wrap align="center">\r
            <Button text="Build the report" variant="outline" onclick={start} />\r
            <span onConfig={c => c.controls.add(panel)} />\r
            <output class="lp-told">{() => s.told}</output>\r
        </Stack>\r
    );\r
}\r
`;function M(){let e=i({loading:!1,result:``}),t,n=()=>{e.loading=!0,e.result=``,setTimeout(()=>{e.loading=!1,e.result=`Orders loaded.`},1800)};return d(S,{gap:`md`,style:`inline-size: 100%`,runover:{},childs:[d(C,{class:`lp-panel`,variant:`outline`,padding:`md`,style:`min-block-size: 10rem`,ref:e=>t=e,runover:{},childs:[d(S,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[d(T,{label:`Customer`,value:`Ada`,runover:{},childs:[]}),d(s,{text:`Load orders`,tone:`accent`,runover:{initializeComponent:e=>{e.motif.on(`click`,n)}},childs:[]})]})]}),d(O,{target:()=>t,message:`Loading orders`,delay:200,runover:{initializeComponent:t=>{t.bindings.model(()=>e.loading,t=>{let n=e;n!=null&&typeof n.loading!=`function`&&(n.loading=t)})}},childs:[]}),d(`output`,{initializeComponent:t=>{t.class.add(`lp-result`),t.bindings.method(()=>e.result)}},1)]})}function N(){let e=i({clear:!1,bare:!1,words:!1}),t,n,r,a=t=>{e[t]=!0,setTimeout(()=>e[t]=!1,2500)};return d(S,{orientation:`horizontal`,wrap:!0,align:`center`,style:`inline-size: 100%`,runover:{},childs:[d(C,{variant:`outline`,padding:`md`,style:`min-inline-size: 16rem; min-block-size: 9rem`,ref:e=>t=e,runover:{},childs:[d(s,{text:`No shade`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>a(`clear`))}},childs:[]})]}),d(O,{target:()=>t,shade:!1,closeOnOutside:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.clear,t=>{let n=e;n!=null&&typeof n.clear!=`function`&&(n.clear=t)})}},childs:[]}),d(C,{variant:`outline`,padding:`md`,style:`min-inline-size: 16rem; min-block-size: 9rem`,ref:e=>n=e,runover:{},childs:[d(s,{text:`No pane`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>a(`bare`))}},childs:[]})]}),d(O,{target:()=>n,showPane:!1,runover:{initializeComponent:t=>{t.bindings.model(()=>e.bare,t=>{let n=e;n!=null&&typeof n.bare!=`function`&&(n.bare=t)})}},childs:[]}),d(C,{variant:`outline`,padding:`md`,style:`min-inline-size: 16rem; min-block-size: 9rem`,ref:e=>r=e,runover:{},childs:[d(s,{text:`Words only`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>a(`words`))}},childs:[]})]}),d(O,{target:()=>r,showIndicator:!1,message:`Please wait`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.words,t=>{let n=e;n!=null&&typeof n.words!=`function`&&(n.words=t)})}},childs:[]})]})}function P(){let e=i({told:``}),t=null,n=new O({message:`Building the report…`,cancelable:!0,onCancel:()=>{t&&clearTimeout(t),t=null,e.told=`Cancelled.`}}),r=()=>{e.told=``,n.show(),t=setTimeout(()=>{t=null,n.hide(),e.told=`The report is ready.`},4e3)};return d(S,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[d(s,{text:`Build the report`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,r)}},childs:[]}),d(`span`,{onConfig:e=>e.controls.add(n)}),d(`output`,{initializeComponent:t=>{t.class.add(`lp-told`),t.bindings.method(()=>e.told)}},1)]})}var F=E(Object.assign({"./examples/Container.tsx":k,"./examples/Options.tsx":A,"./examples/Page.tsx":j})),I=[[`target`,"`Bind<ComponentBase | HTMLElement | null>`","`null`","The area to cover, a component or element. `null` covers the whole page."],[`message`,"`Bind<string>`",`The kit string “Loading…”`,"The message below the indicator. This is the same property as `text`."],[`value`,"`Bind<boolean>`","`false`","Indicates whether the panel is shown. `x-model` provides two-way binding."],[`delay`,"`Bind<number>`","`0`",`The delay in milliseconds before it appears. Hiding it before then shows nothing.`],[`shade`,"`Bind<boolean>`","`true`",`Dims the covered area.`],[`showPane`,"`Bind<boolean>`","`true`",`Shows the box behind the indicator and the message.`],[`showIndicator`,"`Bind<boolean>`","`true`",`Shows the rotating indicator (the kit spinner).`],[`cancelable`,"`Bind<boolean>`","`false`",`Shows a Cancel button in the panel. Escape activates it too.`],[`cancelText`,"`Bind<string>`",`The kit string “Cancel”`,`The button text.`],[`closeOnOutside`,"`Bind<boolean>`","`false`",`Clicking the shade hides the panel.`]],L=[[`onShown, onHidden`,`event`,`Occur when the panel appears (after its delay) and when it is hidden.`],[`onCancel`,`event`,`Occurs when the Cancel button or Escape is pressed. The panel hides afterward.`],[`show(), hide(), cancel()`,"`boolean` / `void`","Programmatic control. `show()` returns `false` while the panel is shown or waiting for its delay."],[`isShown`,`read-only`,`Indicates whether the panel is currently on screen.`],[`spinner, cancelButton`,`read-only`,`The kit spinner and button in the panel.`]],R=[[`Covering a container`,"The panel is placed inside the container, above its content. The container gets `aria-busy`, and the content under the panel is inert, so it cannot be clicked or focused."],[`Over the page`,"Without a `target`, the panel covers the viewport and the rest of the page is inert."],[`Focus`,`Focus moves from the content underneath to the panel (to the Cancel button if there is one) and returns to its original position when the panel hides.`],[`Delay`,"Quick operations show nothing. The panel appears after `delay`, and hiding it before then cancels it."],[`Spinner.cover`,"The kit spinner can cover a container with a single call (`Spinner.cover`). LoadPanel is the full component, with the panel, message, delay and button."]],z=[[`Pane`,"A `status` region. The message is announced when the panel appears and when it changes."],[`Indicator`,`Decorative. The message describes what is happening.`],[`Under it`,"`inert` and `aria-busy`, so screen readers skip the content and it cannot receive clicks or focus."],[`Cancel`,`A kit button named in the kit language. Escape activates it.`]],B=[[`.mx-load-panel`,"The layer. `data-shade`, `data-pane`, `data-page`."],[`.mx-load-panel__pane`,`The panel.`],[`.mx-load-panel__indicator, .mx-load-panel__message, .mx-load-panel__cancel`,`The spinner, the message and the button.`]],V=[[`load-panel.shade, .pane, .message`,"Units: the layer (`shaded`), the panel (`shown`) and the message."],[`load-panel.cancel`,"Place: the appearance of the Cancel button (`variant`)."],[`load-panel.padding, .gap`,`The minimum distance to the edge of the covered area, and the space between the indicator, message and button.`]];function H(){return m({initializeComponent:e=>{{let t=d(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=d(p,{text:`A loading overlay for a container or the whole page. It includes a shade, a panel with the kit spinner and a message, and a Cancel button when the operation can be stopped. The content underneath is unavailable while it is shown, and focus returns afterward.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let n=d(c,{anchor:`import`,title:`Import`,runover:{},childs:[d(r,{code:`
import { LoadPanel } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(n);let i=d(c,{anchor:`ways`,title:`Covering a container`,runover:{},childs:[d(`p`,{initializeComponent:e=>{let t=d(p,{text:"`target` specifies the component or element to cover. `value` or `x-model` shows and hides the panel, or you can call `show()` and `hide()`. `delay` keeps it from flashing during quick operations.",runover:{},childs:[]});e.controls.add(t)}},1),d(u,{stack:!0,files:F(`Container.tsx`),runover:{},childs:[d(M,{runover:{},childs:[]})]})]});e.controls.add(i);let a=d(c,{anchor:`page`,title:`Covering the page, with Cancel`,runover:{},childs:[d(u,{files:F(`Page.tsx`),runover:{},childs:[d(P,{runover:{},childs:[]})]})]});e.controls.add(a);let o=d(c,{anchor:`options`,title:`Shade, panel and indicator`,runover:{},childs:[d(u,{stack:!0,files:F(`Options.tsx`),runover:{},childs:[d(N,{runover:{},childs:[]})]})]});e.controls.add(o);let s=d(c,{anchor:`behaviour`,title:`Behavior`,runover:{},childs:[d(g,{head:[`Topic`,`Details`],rows:R,runover:{},childs:[]})]});e.controls.add(s);let l=d(c,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[d(g,{head:[`Topic`,`Details`],rows:z,runover:{},childs:[]})]});e.controls.add(l);let f=d(c,{anchor:`styling`,title:`Styling`,runover:{},childs:[d(g,{head:[`Hook`,`Description`],rows:B,runover:{},childs:[]}),d(`h3`,{initializeComponent:e=>{let t=d(p,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),d(g,{head:[`Token`,`Description`],rows:V,runover:{},childs:[]})]});e.controls.add(f);let m=d(c,{anchor:`api`,title:`API reference`,runover:{},childs:[d(`h3`,{initializeComponent:e=>{let t=d(p,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),d(g,{head:[`Prop`,`Type`,`Default`,`Description`],rows:I,runover:{},childs:[]}),d(`h3`,{initializeComponent:e=>{let t=d(p,{text:`Events, properties and methods`,runover:{},childs:[]});e.controls.add(t)}},1),d(g,{head:[`Member`,`Type`,`Description`],rows:L,runover:{},childs:[]})]});e.controls.add(m)}}})}export{H as default};