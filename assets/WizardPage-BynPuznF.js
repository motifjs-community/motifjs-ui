import{Qn as e,Un as t,Zn as n,er as r,n as i}from"./next-id-CtzpBrBT.js";import{t as a}from"./TextBox-iHQY3j6o.js";import{t as o}from"./TextArea-B9RnvadP.js";import{t as s}from"./CheckBox-BHqI2SXj.js";import{t as c}from"./Switch-CESerSF7.js";import{t as l}from"./RadioGroup-DbpJGVz-.js";import{n as u,t as d}from"./Wizard-DSM7nog1.js";import{t as f}from"./Stack-wRt1e9tO.js";import{a as p,i as m,n as h,r as g,t as _}from"./docs-B_LZlyP5.js";import{t as v}from"./sources-BXVvOiIY.js";var y=`import { reactive } from '@motifx/core';\r
import { CheckBox, Stack, TextBox, Wizard, WizardStep } from '@motifx-community/ui';\r
\r
/** Three pages with kit fields: Next validates the page first, and Finish notifies the application. */\r
export default function Basic() {\r
    const s = reactive({ name: '', email: '', city: '', agreed: false, result: '' });\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <Wizard label="Sign up" onFinished={() => (s.result = \`Welcome, \${s.name}.\`)}>\r
                <WizardStep title="Account" description="Who you are">\r
                    <Stack orientation="horizontal" wrap align="center">\r
                        <TextBox label="Name" x-model={() => s.name} required />\r
                        <TextBox label="E-mail" x-model={() => s.email} required rules={[{ type: 'email' }]} />\r
                    </Stack>\r
                </WizardStep>\r
                <WizardStep title="Address" description="Where you live">\r
                    <TextBox label="City" x-model={() => s.city} required />\r
                </WizardStep>\r
                <WizardStep title="Review" validate={() => s.agreed}>\r
                    <p>{() => \`\${s.name || '—'}, \${s.email || '—'}, \${s.city || '—'}\`}</p>\r
                    <CheckBox label="Everything is right" x-model={() => s.agreed} />\r
                </WizardStep>\r
            </Wizard>\r
            <output class="wz-result">{() => s.result}</output>\r
        </Stack>\r
    );\r
}\r
`,b=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TextBox, Wizard, WizardStep } from '@motifx-community/ui';\r
\r
/** No bar: custom buttons control it, and finishing waits for a promise (a server) and can be refused. */\r
export default function Custom() {\r
    const s = reactive({ code: '', busy: false, note: '' });\r
    let wizard!: Wizard;\r
    const finish = () => {\r
        s.note = '';\r
        void wizard.finish().then(ok => (s.note = ok ? 'Saved.' : s.note || 'Not finished.'));\r
    };\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <Wizard\r
                ref={(w: Wizard) => (wizard = w)}\r
                label="Redeem"\r
                showNavigation={false}\r
                labelPosition="end"\r
                onFinishing={e => {\r
                    s.busy = true;\r
                    e.promise = new Promise<boolean>(resolve => setTimeout(() => resolve(s.code.toUpperCase() === 'MOTIF'), 600)).then(ok => {\r
                        s.busy = false;\r
                        if (!ok) s.note = 'That code is not known.';\r
                        return ok;\r
                    });\r
                }}\r
            >\r
                <WizardStep title="Code">\r
                    <TextBox label="Gift code" x-model={() => s.code} required placeholder="MOTIF" />\r
                </WizardStep>\r
                <WizardStep title="Confirm">\r
                    <p>{() => \`Redeem “\${s.code}”?\`}</p>\r
                </WizardStep>\r
            </Wizard>\r
            <Stack orientation="horizontal" wrap align="center">\r
                <Button text="Back" variant="outline" onclick={() => void wizard.previous()} />\r
                <Button text="Next" variant="outline" onclick={() => void wizard.next()} />\r
                <Button text="Redeem" busy={() => s.busy} onclick={finish} />\r
                <output class="wz-note">{() => s.note}</output>\r
            </Stack>\r
        </Stack>\r
    );\r
}\r
`,x=`import { Component, reactive } from '@motifx/core';\r
import { Button, Stack, Wizard, WizardStep } from '@motifx-community/ui';\r
\r
// A page created programmatically: any MotifJS component.\r
class Note extends Component<HTMLDivElement, { text: string }> {\r
    override view() {\r
        return <p>{this.props.text}</p>;\r
    }\r
}\r
\r
/** A wizard created programmatically: its steps as props with content factories, moved with its methods, with a step added later. */\r
export default function Programmatic() {\r
    const s = reactive({ told: '' });\r
    const wizard = new Wizard({\r
        label: 'Setup',\r
        steps: [\r
            { title: 'Welcome', content: () => new Note({ text: 'A page made by a factory, built when first shown.' }) },\r
            { title: 'Options', description: 'Pick what you need', content: () => new Note({ text: 'The second page.' }) },\r
            { title: 'Done', content: () => new Note({ text: 'The last page; Next reads Finish here.' }) }\r
        ],\r
        onStepChanged: e => (s.told = \`Step \${e.index + 1}: \${(e.item as { text: string }).text}\`),\r
        onFinished: () => (s.told = 'Finished.')\r
    });\r
    const addStep = () => {\r
        wizard.insert(2, new WizardStep({ title: 'Extra', optional: true, content: () => new Note({ text: 'Added programmatically.' }) }));\r
    };\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <span onConfig={c => c.controls.add(wizard)} />\r
            <Stack orientation="horizontal" wrap align="center">\r
                <Button text="Go to Done" variant="outline" onclick={() => void wizard.goTo(wizard.steps.length - 1)} />\r
                <Button text="Add a step" variant="outline" onclick={addStep} />\r
                <output class="wz-told">{() => s.told}</output>\r
            </Stack>\r
        </Stack>\r
    );\r
}\r
`,S=`import { reactive } from '@motifx/core';\r
import { RadioGroup, Switch, TextArea, Wizard, WizardStep } from '@motifx-community/ui';\r
\r
/** The stepper beside the pages, the texts after the indicators. */\r
export default function Vertical() {\r
    const s = reactive({ plan: 'Team', notify: true, note: '' });\r
    return (\r
        <Wizard label="Subscription" orientation="vertical" style="min-block-size: 16rem; inline-size: 100%">\r
            <WizardStep title="Plan" description="What you pay for">\r
                <RadioGroup label="Plan" items={['Solo', 'Team', 'Business']} x-model={() => s.plan} />\r
            </WizardStep>\r
            <WizardStep title="Alerts" description="How we reach you">\r
                <Switch label="Send me a monthly summary" x-model={() => s.notify} />\r
            </WizardStep>\r
            <WizardStep title="Notes" optional>\r
                <TextArea label="Anything else?" x-model={() => s.note} rows={3} />\r
            </WizardStep>\r
        </Wizard>\r
    );\r
}\r
`;function C(){let e=r({name:``,email:``,city:``,agreed:!1,result:``});return n(f,{gap:`md`,style:`inline-size: 100%`,runover:{},childs:[n(d,{label:`Sign up`,onFinished:()=>e.result=`Welcome, ${e.name}.`,runover:{},childs:[n(u,{title:`Account`,description:`Who you are`,runover:{},childs:[n(f,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(a,{label:`Name`,required:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.name,t=>{let n=e;n!=null&&typeof n.name!=`function`&&(n.name=t)})}},childs:[]}),n(a,{label:`E-mail`,required:!0,rules:[{type:`email`}],runover:{initializeComponent:t=>{t.bindings.model(()=>e.email,t=>{let n=e;n!=null&&typeof n.email!=`function`&&(n.email=t)})}},childs:[]})]})]}),n(u,{title:`Address`,description:`Where you live`,runover:{},childs:[n(a,{label:`City`,required:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.city,t=>{let n=e;n!=null&&typeof n.city!=`function`&&(n.city=t)})}},childs:[]})]}),n(u,{title:`Review`,validate:()=>e.agreed,runover:{},childs:[n(`p`,{initializeComponent:t=>{t.bindings.method(()=>`${e.name||`—`}, ${e.email||`—`}, ${e.city||`—`}`)}},1),n(s,{label:`Everything is right`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.agreed,t=>{let n=e;n!=null&&typeof n.agreed!=`function`&&(n.agreed=t)})}},childs:[]})]})]}),n(`output`,{initializeComponent:t=>{t.class.add(`wz-result`),t.bindings.method(()=>e.result)}},1)]})}function w(){let e=r({code:``,busy:!1,note:``}),t,o=()=>{e.note=``,t.finish().then(t=>e.note=t?`Saved.`:e.note||`Not finished.`)};return n(f,{gap:`md`,style:`inline-size: 100%`,runover:{},childs:[n(d,{label:`Redeem`,showNavigation:!1,labelPosition:`end`,onFinishing:t=>{e.busy=!0,t.promise=new Promise(t=>setTimeout(()=>t(e.code.toUpperCase()===`MOTIF`),600)).then(t=>(e.busy=!1,t||(e.note=`That code is not known.`),t))},ref:e=>t=e,runover:{},childs:[n(u,{title:`Code`,runover:{},childs:[n(a,{label:`Gift code`,required:!0,placeholder:`MOTIF`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.code,t=>{let n=e;n!=null&&typeof n.code!=`function`&&(n.code=t)})}},childs:[]})]}),n(u,{title:`Confirm`,runover:{},childs:[n(`p`,{initializeComponent:t=>{t.bindings.method(()=>`Redeem “${e.code}”?`)}},1)]})]}),n(f,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(i,{text:`Back`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>void t.previous())}},childs:[]}),n(i,{text:`Next`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>void t.next())}},childs:[]}),n(i,{text:`Redeem`,busy:()=>e.busy,runover:{initializeComponent:e=>{e.motif.on(`click`,o)}},childs:[]}),n(`output`,{initializeComponent:t=>{t.class.add(`wz-note`),t.bindings.method(()=>e.note)}},1)]})]})}var T=class extends t{view(){return n(`p`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.bindings.add(`textContent`,this.props,`text`)},__childExpr:()=>this.props.text});e.controls.add(t)}},1)}};T.elementTag=`div`;function E(){let e=r({told:``}),t=new d({label:`Setup`,steps:[{title:`Welcome`,content:()=>new T({text:`A page made by a factory, built when first shown.`})},{title:`Options`,description:`Pick what you need`,content:()=>new T({text:`The second page.`})},{title:`Done`,content:()=>new T({text:`The last page; Next reads Finish here.`})}],onStepChanged:t=>e.told=`Step ${t.index+1}: ${t.item.text}`,onFinished:()=>e.told=`Finished.`}),a=()=>{t.insert(2,new u({title:`Extra`,optional:!0,content:()=>new T({text:`Added programmatically.`})}))};return n(f,{gap:`md`,style:`inline-size: 100%`,runover:{},childs:[n(`span`,{onConfig:e=>e.controls.add(t)}),n(f,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(i,{text:`Go to Done`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>void t.goTo(t.steps.length-1))}},childs:[]}),n(i,{text:`Add a step`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,a)}},childs:[]}),n(`output`,{initializeComponent:t=>{t.class.add(`wz-told`),t.bindings.method(()=>e.told)}},1)]})]})}function D(){let e=r({plan:`Team`,notify:!0,note:``});return n(d,{label:`Subscription`,orientation:`vertical`,style:`min-block-size: 16rem; inline-size: 100%`,runover:{},childs:[n(u,{title:`Plan`,description:`What you pay for`,runover:{},childs:[n(l,{label:`Plan`,items:[`Solo`,`Team`,`Business`],runover:{initializeComponent:t=>{t.bindings.model(()=>e.plan,t=>{let n=e;n!=null&&typeof n.plan!=`function`&&(n.plan=t)})}},childs:[]})]}),n(u,{title:`Alerts`,description:`How we reach you`,runover:{},childs:[n(c,{label:`Send me a monthly summary`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.notify,t=>{let n=e;n!=null&&typeof n.notify!=`function`&&(n.notify=t)})}},childs:[]})]}),n(u,{title:`Notes`,optional:!0,runover:{},childs:[n(o,{label:`Anything else?`,rows:3,runover:{initializeComponent:t=>{t.bindings.model(()=>e.note,t=>{let n=e;n!=null&&typeof n.note!=`function`&&(n.note=t)})}},childs:[]})]})]})}var O=v(Object.assign({"./examples/Basic.tsx":y,"./examples/Custom.tsx":b,"./examples/Programmatic.tsx":x,"./examples/Vertical.tsx":S})),k=[[`steps`,"`readonly WizardStepProps[]`","`[]`","Steps created programmatically, each as `WizardStep` props. JSX `WizardStep` children come first."],[`value`,"`Bind<string | number | null>`","`0`","The current step, identified by its `key` or index. `x-model` provides two-way binding."],[`linear`,"`Bind<boolean>`","`true`",`A step can be reached only after the previous ones, and optional steps can be skipped.`],[`orientation`,"`Bind<StepperOrientation>`","`'horizontal'`","`horizontal` places the stepper above the pages, and `vertical` places it next to them."],[`labelPosition`,"`Bind<StepperLabelPosition>`","`'bottom'`",`The position of the stepper text, in the horizontal orientation only.`],[`size`,"`Bind<ControlSize>`","`'md'`",`The size of the stepper.`],[`showStepper, showNavigation`,"`Bind<boolean>`","`true`",`Shows the stepper, and the bar with the Back and Next buttons.`],[`clickable`,"`Bind<boolean>`","`true`",`Lets the user press the stepper steps.`],[`lazy`,"`Bind<boolean>`","`true`","Creates a page when first shown and then keeps it. A step's own `lazy` takes precedence."],[`keepAlive`,"`Bind<boolean>`","`true`","With `false`, content created by a step's `content` is disposed while hidden and recreated when shown. A step's own `keepAlive` takes precedence."],[`previousText, nextText, finishText`,"`Bind<string>`",`The kit strings “Back”, “Next” and “Finish”`,`The button text.`],[`label`,"`Bind<string>`",`The kit string “Steps”`,`The accessible name of the stepper.`]],A=[[`title`,"`Bind<string>`","`''`","The step text in the stepper. This is the same property as `text`."],[`description`,"`Bind<string>`","`''`",`A second line below the title.`],[`key`,"`Bind<string>`",`The index`,"Identifies the step in `value`. The JSX `key` also works."],[`icon`,"`Bind<IconSource | null>`","`null`",`Displayed in the indicator instead of the number.`],[`optional`,"`Bind<boolean>`","`false`",`Marks the step as optional, which appears below the title.`],[`enabled`,"`Bind<boolean>`","`true`","`false` prevents the step from being reached."],[`error`,"`Bind<boolean>`","`false`",`Shows the step with an error. The wizard sets it when the page fails validation and clears it when the page passes.`],[`validateFields`,"`Bind<boolean>`","`true`",`The kit fields on the page are validated before the wizard moves on, and the first invalid field receives focus.`],[`validate`,"`() => boolean | Promise<boolean>`",`—`,"Runs after the fields are validated. `false` keeps the page and marks the step."],[`lazy, keepAlive`,"`Bind<boolean | undefined>`",`From the wizard`,`See the wizard prop.`],[`content`,"`() => ComponentBase | ComponentBase[]`",`—`,`Creates the page programmatically when the page is created.`]],j=[[`onStepChanging, onStepChanged`,`event`,"The stepper events. `onStepChanging` (`cancel`, `promise`) runs before the page is validated."],[`onFinishing`,`event`,"Occurs when the last page is valid and the wizard is about to finish. `cancel = true` keeps it open, and `promise` waits and finishes on `true`."],[`onFinished`,`event`,`Occurs when the wizard finishes. Every step is shown as complete.`],[`next(), previous(), goTo(step)`,"`Promise<boolean>`","Next validates the page and finishes on the last step. Back does not validate. `goTo` validates when moving forward."],[`finish()`,"`Promise<boolean>`","Validates the page, raises `onFinishing`, and then finishes."],[`leaveCheck()`,"`Promise<boolean>`",`Validates the current page as Next does, without moving.`],[`add(step), insert(index, step), remove(step)`,"`WizardStep` / `boolean`",`Manage steps programmatically. A step from another wizard moves here.`],[`stepper, steps, currentStep, selectedIndex`,`read-only`,"The `Stepper`, the `WizardStep` objects in order, the current step and its index."],[`isLast, isFinished`,`read-only`,`Indicate whether the current step is the last reachable one (Next finishes), and whether the wizard has finished.`],[`previousButton, nextButton`,`read-only`,`The kit buttons in the bar, for a custom icon or appearance.`]],M=[[`Stepper`,"A `nav` of steps, as on the [Stepper](/stepper) page. Each step is a button with its position and status in its name, and there is one Tab stop."],[`Page`,"A `group` named after its step. Hidden pages are removed from the accessibility tree."],[`Validation`,`When validation fails, focus stays on the first invalid field with its message, and the step is announced as “Needs attention”.`],[`Buttons`,`Kit buttons named “Back”, “Next” and “Finish” in the kit language.`]],N=[[`.mx-wizard`,"The wizard. `data-orientation`."],[`.mx-wizard__stepper`,"The stepper (also `.mx-stepper`)."],[`.mx-wizard__pages, .mx-wizard__page`,"The pages and each page. A hidden page has `hidden`."],[`.mx-wizard__bar, .mx-wizard__previous, .mx-wizard__next`,`The bar and its buttons.`]],P=[[`wizard.frame, .page, .bar`,`Units: the root, a page and the bar (a divider above it and its padding).`],[`wizard.previous, wizard.next`,"Places: the appearance of the buttons in the bar (`variant`)."],[`wizard.gap, .bar-gap, .rail-width`,`The spacing between the stepper, pages and bar, and between the buttons, plus the stepper width when it is next to the pages.`]];function F(){return e({initializeComponent:e=>{{let t=n(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=n(g,{text:`Guides the user through a multi-step task. It combines a [Stepper](/stepper) above or next to one page per step with Back and Next buttons below. Next validates the page first, and on the last step it finishes the wizard.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let r=n(m,{anchor:`import`,title:`Import`,runover:{},childs:[n(p,{code:`
import { Wizard, WizardStep } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=n(m,{anchor:`ways`,title:`Defining pages in JSX`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(g,{text:"Each `WizardStep` is a step and its page. Next validates the kit fields on the page and then runs the step's own `validate`. If validation fails, the wizard stays on the page, marks the step and focuses the first invalid field. On the last step, Next becomes Finish and raises `onFinished`.",runover:{},childs:[]});e.controls.add(t)}},1),n(h,{stack:!0,files:O(`Basic.tsx`),runover:{},childs:[n(C,{runover:{},childs:[]})]})]});e.controls.add(i);let a=n(m,{anchor:`code`,title:`Programmatic use`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(g,{text:"`steps` creates steps from props, and each page is created from a `content` factory when first shown. `add`, `insert` and `remove` change the steps later, and `next()`, `previous()`, `goTo()` and `finish()` navigate.",runover:{},childs:[]});e.controls.add(t)}},1),n(h,{stack:!0,files:O(`Programmatic.tsx`),runover:{},childs:[n(E,{runover:{},childs:[]})]})]});e.controls.add(a);let o=n(m,{anchor:`vertical`,title:`Vertical orientation`,runover:{},childs:[n(h,{stack:!0,files:O(`Vertical.tsx`),runover:{},childs:[n(D,{runover:{},childs:[]})]})]});e.controls.add(o);let s=n(m,{anchor:`custom`,title:`Custom buttons and asynchronous finish`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(g,{text:"`showNavigation={false}` removes the bar, so your own buttons can call the methods. `onFinishing` can set a `promise`, and the wizard finishes when it resolves to `true` and stays open otherwise.",runover:{},childs:[]});e.controls.add(t)}},1),n(h,{stack:!0,files:O(`Custom.tsx`),runover:{},childs:[n(w,{runover:{},childs:[]})]})]});e.controls.add(s);let c=n(m,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[n(_,{head:[`Topic`,`Details`],rows:M,runover:{},childs:[]})]});e.controls.add(c);let l=n(m,{anchor:`styling`,title:`Styling`,runover:{},childs:[n(_,{head:[`Hook`,`Description`],rows:N,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(g,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),n(_,{head:[`Token`,`Description`],rows:P,runover:{},childs:[]})]});e.controls.add(l);let u=n(m,{anchor:`api`,title:`API reference`,runover:{},childs:[n(`h3`,{initializeComponent:e=>{let t=n(g,{text:`Wizard props`,runover:{},childs:[]});e.controls.add(t)}},1),n(_,{head:[`Prop`,`Type`,`Default`,`Description`],rows:k,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(g,{text:`WizardStep props`,runover:{},childs:[]});e.controls.add(t)}},1),n(_,{head:[`Prop`,`Type`,`Default`,`Description`],rows:A,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(g,{text:`Events, properties and methods`,runover:{},childs:[]});e.controls.add(t)}},1),n(_,{head:[`Member`,`Type`,`Description`],rows:j,runover:{},childs:[]})]});e.controls.add(u)}}})}export{F as default};