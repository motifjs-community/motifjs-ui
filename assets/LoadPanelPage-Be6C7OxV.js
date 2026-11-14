import{Qn as e,Zn as t,er as n,n as r}from"./next-id-CtzpBrBT.js";import{t as i}from"./TextBox-iHQY3j6o.js";import{t as a}from"./Panel-D_MXZsSp.js";import{t as o}from"./LoadPanel-ClfgqbYl.js";import{t as s}from"./Stack-wRt1e9tO.js";import{a as c,i as l,n as u,r as d,t as f}from"./docs-B_LZlyP5.js";import{t as p}from"./sources-BXVvOiIY.js";var m=`import { reactive } from '@motifx/core';\r
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
`,h=`import { reactive } from '@motifx/core';\r
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
`,g=`import { reactive } from '@motifx/core';\r
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
`;function _(){let e=n({loading:!1,result:``}),c,l=()=>{e.loading=!0,e.result=``,setTimeout(()=>{e.loading=!1,e.result=`Orders loaded.`},1800)};return t(s,{gap:`md`,style:`inline-size: 100%`,runover:{},childs:[t(a,{class:`lp-panel`,variant:`outline`,padding:`md`,style:`min-block-size: 10rem`,ref:e=>c=e,runover:{},childs:[t(s,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(i,{label:`Customer`,value:`Ada`,runover:{},childs:[]}),t(r,{text:`Load orders`,tone:`accent`,runover:{initializeComponent:e=>{e.motif.on(`click`,l)}},childs:[]})]})]}),t(o,{target:()=>c,message:`Loading orders`,delay:200,runover:{initializeComponent:t=>{t.bindings.model(()=>e.loading,t=>{let n=e;n!=null&&typeof n.loading!=`function`&&(n.loading=t)})}},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`lp-result`),t.bindings.method(()=>e.result)}},1)]})}function v(){let e=n({clear:!1,bare:!1,words:!1}),i,c,l,u=t=>{e[t]=!0,setTimeout(()=>e[t]=!1,2500)};return t(s,{orientation:`horizontal`,wrap:!0,align:`center`,style:`inline-size: 100%`,runover:{},childs:[t(a,{variant:`outline`,padding:`md`,style:`min-inline-size: 16rem; min-block-size: 9rem`,ref:e=>i=e,runover:{},childs:[t(r,{text:`No shade`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>u(`clear`))}},childs:[]})]}),t(o,{target:()=>i,shade:!1,closeOnOutside:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.clear,t=>{let n=e;n!=null&&typeof n.clear!=`function`&&(n.clear=t)})}},childs:[]}),t(a,{variant:`outline`,padding:`md`,style:`min-inline-size: 16rem; min-block-size: 9rem`,ref:e=>c=e,runover:{},childs:[t(r,{text:`No pane`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>u(`bare`))}},childs:[]})]}),t(o,{target:()=>c,showPane:!1,runover:{initializeComponent:t=>{t.bindings.model(()=>e.bare,t=>{let n=e;n!=null&&typeof n.bare!=`function`&&(n.bare=t)})}},childs:[]}),t(a,{variant:`outline`,padding:`md`,style:`min-inline-size: 16rem; min-block-size: 9rem`,ref:e=>l=e,runover:{},childs:[t(r,{text:`Words only`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>u(`words`))}},childs:[]})]}),t(o,{target:()=>l,showIndicator:!1,message:`Please wait`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.words,t=>{let n=e;n!=null&&typeof n.words!=`function`&&(n.words=t)})}},childs:[]})]})}function y(){let e=n({told:``}),i=null,a=new o({message:`Building the report…`,cancelable:!0,onCancel:()=>{i&&clearTimeout(i),i=null,e.told=`Cancelled.`}}),c=()=>{e.told=``,a.show(),i=setTimeout(()=>{i=null,a.hide(),e.told=`The report is ready.`},4e3)};return t(s,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(r,{text:`Build the report`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,c)}},childs:[]}),t(`span`,{onConfig:e=>e.controls.add(a)}),t(`output`,{initializeComponent:t=>{t.class.add(`lp-told`),t.bindings.method(()=>e.told)}},1)]})}var b=p(Object.assign({"./examples/Container.tsx":m,"./examples/Options.tsx":h,"./examples/Page.tsx":g})),x=[[`target`,"`Bind<ComponentBase | null>`","`null`","The area to cover, a component. `null` covers the whole page."],[`message`,"`Bind<string>`",`The kit string “Loading…”`,"The message below the indicator. This is the same property as `text`."],[`value`,"`Bind<boolean>`","`false`","Indicates whether the panel is shown. `x-model` provides two-way binding."],[`delay`,"`Bind<number>`","`0`",`The delay in milliseconds before it appears. Hiding it before then shows nothing.`],[`shade`,"`Bind<boolean>`","`true`",`Dims the covered area.`],[`showPane`,"`Bind<boolean>`","`true`",`Shows the box behind the indicator and the message.`],[`showIndicator`,"`Bind<boolean>`","`true`",`Shows the rotating indicator (the kit spinner).`],[`cancelable`,"`Bind<boolean>`","`false`",`Shows a Cancel button in the panel. Escape activates it too.`],[`cancelText`,"`Bind<string>`",`The kit string “Cancel”`,`The button text.`],[`closeOnOutside`,"`Bind<boolean>`","`false`",`Clicking the shade hides the panel.`]],S=[[`onShown, onHidden`,`event`,`Occur when the panel appears (after its delay) and when it is hidden.`],[`onCancel`,`event`,`Occurs when the Cancel button or Escape is pressed. The panel hides afterward.`],[`show(), hide(), cancel()`,"`boolean` / `void`","Programmatic control. `show()` returns `false` while the panel is shown or waiting for its delay."],[`isShown`,`read-only`,`Indicates whether the panel is currently on screen.`],[`spinner, cancelButton`,`read-only`,`The kit spinner and button in the panel.`]],C=[[`Covering a container`,"The panel is placed inside the container, above its content. The container gets `aria-busy`, and the content under the panel is inert, so it cannot be clicked or focused."],[`Over the page`,"Without a `target`, the panel covers the viewport and the rest of the page is inert."],[`Focus`,`Focus moves from the content underneath to the panel (to the Cancel button if there is one) and returns to its original position when the panel hides.`],[`Delay`,"Quick operations show nothing. The panel appears after `delay`, and hiding it before then cancels it."],[`Spinner.cover`,"The kit spinner can cover a container with a single call (`Spinner.cover`). LoadPanel is the full component, with the panel, message, delay and button."]],w=[[`Pane`,"A `status` region. The message is announced when the panel appears and when it changes."],[`Indicator`,`Decorative. The message describes what is happening.`],[`Under it`,"`inert` and `aria-busy`, so screen readers skip the content and it cannot receive clicks or focus."],[`Cancel`,`A kit button named in the kit language. Escape activates it.`]],T=[[`.mx-load-panel`,"The layer. `data-shade`, `data-pane`, `data-page`."],[`.mx-load-panel__pane`,`The panel.`],[`.mx-load-panel__indicator, .mx-load-panel__message, .mx-load-panel__cancel`,`The spinner, the message and the button.`]],E=[[`load-panel.shade, .pane, .message`,"Units: the layer (`shaded`), the panel (`shown`) and the message."],[`load-panel.cancel`,"Place: the appearance of the Cancel button (`variant`)."],[`load-panel.padding, .gap`,`The minimum distance to the edge of the covered area, and the space between the indicator, message and button.`]];function D(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(d,{text:`A loading overlay for a container or the whole page. It includes a shade, a panel with the kit spinner and a message, and a Cancel button when the operation can be stopped. The content underneath is unavailable while it is shown, and focus returns afterward.`,runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(l,{anchor:`import`,title:`Import`,runover:{},childs:[t(c,{code:`
import { LoadPanel } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(l,{anchor:`ways`,title:`Covering a container`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(d,{text:"`target` specifies the component to cover. `value` or `x-model` shows and hides the panel, or you can call `show()` and `hide()`. `delay` keeps it from flashing during quick operations.",runover:{},childs:[]});e.controls.add(n)}},1),t(u,{stack:!0,files:b(`Container.tsx`),runover:{},childs:[t(_,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(l,{anchor:`page`,title:`Covering the page, with Cancel`,runover:{},childs:[t(u,{files:b(`Page.tsx`),runover:{},childs:[t(y,{runover:{},childs:[]})]})]});e.controls.add(a);let o=t(l,{anchor:`options`,title:`Shade, panel and indicator`,runover:{},childs:[t(u,{stack:!0,files:b(`Options.tsx`),runover:{},childs:[t(v,{runover:{},childs:[]})]})]});e.controls.add(o);let s=t(l,{anchor:`behaviour`,title:`Behavior`,runover:{},childs:[t(f,{head:[`Topic`,`Details`],rows:C,runover:{},childs:[]})]});e.controls.add(s);let p=t(l,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(f,{head:[`Topic`,`Details`],rows:w,runover:{},childs:[]})]});e.controls.add(p);let m=t(l,{anchor:`styling`,title:`Styling`,runover:{},childs:[t(f,{head:[`Hook`,`Description`],rows:T,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(d,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(f,{head:[`Token`,`Description`],rows:E,runover:{},childs:[]})]});e.controls.add(m);let h=t(l,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(d,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(f,{head:[`Prop`,`Type`,`Default`,`Description`],rows:x,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(d,{text:`Events, properties and methods`,runover:{},childs:[]});e.controls.add(n)}},1),t(f,{head:[`Member`,`Type`,`Description`],rows:S,runover:{},childs:[]})]});e.controls.add(h)}}})}export{D as default};