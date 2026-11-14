import{Qn as e,Zn as t,er as n,n as r}from"./next-id-CtzpBrBT.js";import{t as i}from"./CheckBox-BHqI2SXj.js";import{t as a}from"./Stepper-B_hTFi_l.js";import{t as o}from"./Stack-wRt1e9tO.js";import{a as s,i as c,n as l,r as u,t as d}from"./docs-B_LZlyP5.js";import{t as f}from"./sources-BXVvOiIY.js";var p=`import { reactive } from '@motifx/core';\r
import { CheckBox, Stack, Stepper } from '@motifx-community/ui';\r
\r
/** In linear order a step is reached only after the ones before it; \`onStepChanging\` refuses a step while the box is unchecked. */\r
export default function Linear() {\r
    const s = reactive({ step: 0 as string | number | null, agreed: false, note: '' });\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <Stepper\r
                label="In order"\r
                items={['Terms', 'Details', 'Confirm']}\r
                x-model={() => s.step}\r
                onStepChanging={e => {\r
                    if (e.to > 0 && !s.agreed) {\r
                        e.cancel = true;\r
                        s.note = 'Accept the terms first.';\r
                    } else {\r
                        s.note = '';\r
                    }\r
                }}\r
            />\r
            <CheckBox label="I accept the terms" x-model={() => s.agreed} />\r
            <output class="st-note">{() => s.note}</output>\r
        </Stack>\r
    );\r
}\r
`,m=`import { Stack, Stepper } from '@motifx-community/ui';\r
\r
const STEPS = [\r
    { text: 'Details', description: 'Name and e-mail' },\r
    { text: 'Address', description: 'Where to send it' },\r
    { text: 'Payment', description: 'Card or transfer' },\r
    { text: 'Review' }\r
];\r
\r
/** Horizontal with the texts under or after the indicators, and vertical. */\r
export default function Orientations() {\r
    return (\r
        <Stack gap="lg" style="inline-size: 100%">\r
            <Stepper label="Texts under" items={STEPS} value={1} linear={false} />\r
            <Stepper label="Texts after" items={STEPS.slice(0, 3)} value={1} labelPosition="end" linear={false} />\r
            <div style="inline-size: 18rem">\r
                <Stepper label="Standing" items={STEPS} value={1} orientation="vertical" linear={false} />\r
            </div>\r
        </Stack>\r
    );\r
}\r
`,h=`import { reactive } from '@motifx/core';\r
import { Button, Stack, Stepper } from '@motifx-community/ui';\r
\r
/** A stepper bound with x-model, and one created programmatically and moved with its methods. */\r
export default function Programmatic() {\r
    const s = reactive({ step: 0 as string | number | null, at: 0, told: '' });\r
    const coded = new Stepper({\r
        label: 'Order',\r
        items: ['Cart', 'Address', 'Payment', 'Done'],\r
        linear: false,\r
        onStepChanged: e => {\r
            s.at = e.index;\r
            s.told = \`Step \${e.index + 1}\${e.byUser ? ', pressed' : ''}\`;\r
        }\r
    });\r
\r
    return (\r
        <Stack gap="lg" style="inline-size: 100%">\r
            <Stepper label="Sign up" items={['Account', 'Profile', 'Review']} x-model={() => s.step} />\r
            <output class="st-value">{() => \`value: \${JSON.stringify(s.step)}\`}</output>\r
            <span onConfig={c => c.controls.add(coded)} />\r
            <Stack orientation="horizontal" wrap align="center">\r
                <Button text="Back" variant="outline" enabled={() => s.at > 0} onclick={() => void coded.previous()} />\r
                <Button text="Next" variant="outline" enabled={() => s.at < 3} onclick={() => void coded.next()} />\r
                <output class="st-told">{() => s.told}</output>\r
            </Stack>\r
        </Stack>\r
    );\r
}\r
`,g=`import { Stack, Stepper } from '@motifx-community/ui';\r
\r
const STEPS = ['Plan', 'Build', 'Ship'];\r
\r
/** Three sizes, and a stepper without numbers. */\r
export default function Sizes() {\r
    return (\r
        <Stack gap="lg" style="inline-size: 100%">\r
            <Stepper label="Small" items={STEPS} value={1} size="sm" linear={false} />\r
            <Stepper label="Medium" items={STEPS} value={1} linear={false} />\r
            <Stepper label="Large" items={STEPS} value={1} size="lg" linear={false} />\r
            <Stepper label="Dots" items={STEPS} value={1} showNumbers={false} size="sm" labelPosition="end" linear={false} />\r
        </Stack>\r
    );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { Button, Stack, Stepper } from '@motifx-community/ui';\r
\r
const pencil = () => (\r
    <svg viewBox="0 0 16 16" aria-hidden="true">\r
        <path d="M11.5 2.5l2 2L5 13H3v-2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />\r
    </svg>\r
);\r
\r
/** Completed and failed steps set by the items, an optional step, a disabled step, and an icon in place of the number. */\r
export default function Statuses() {\r
    const s = reactive({ paid: false });\r
    const items = [\r
        { text: 'Cart', status: 'done' as const },\r
        { text: 'Address', description: 'Checked', status: 'done' as const },\r
        { text: 'Payment', description: () => (s.paid ? 'Paid' : 'Card declined'), status: () => (s.paid ? 'done' : 'error') },\r
        { text: 'Gift note', optional: true, icon: pencil() },\r
        { text: 'Pick-up', enabled: false },\r
        { text: 'Done' }\r
    ];\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <Stepper label="Statuses" items={items} value={5} linear={false} />\r
            <Button text={() => (s.paid ? 'Decline the card' : 'Take the payment')} variant="outline" onclick={() => (s.paid = !s.paid)} />\r
        </Stack>\r
    );\r
}\r
`;function v(){let e=n({step:0,at:0,told:``}),i=new a({label:`Order`,items:[`Cart`,`Address`,`Payment`,`Done`],linear:!1,onStepChanged:t=>{e.at=t.index,e.told=`Step ${t.index+1}${t.byUser?`, pressed`:``}`}});return t(o,{gap:`lg`,style:`inline-size: 100%`,runover:{},childs:[t(a,{label:`Sign up`,items:[`Account`,`Profile`,`Review`],runover:{initializeComponent:t=>{t.bindings.model(()=>e.step,t=>{let n=e;n!=null&&typeof n.step!=`function`&&(n.step=t)})}},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`st-value`),t.bindings.method(()=>`value: ${JSON.stringify(e.step)}`)}},1),t(`span`,{onConfig:e=>e.controls.add(i)}),t(o,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(r,{text:`Back`,variant:`outline`,enabled:()=>e.at>0,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>void i.previous())}},childs:[]}),t(r,{text:`Next`,variant:`outline`,enabled:()=>e.at<3,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>void i.next())}},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`st-told`),t.bindings.method(()=>e.told)}},1)]})]})}function y(){let e=n({step:0,agreed:!1,note:``});return t(o,{gap:`md`,style:`inline-size: 100%`,runover:{},childs:[t(a,{label:`In order`,items:[`Terms`,`Details`,`Confirm`],onStepChanging:t=>{t.to>0&&!e.agreed?(t.cancel=!0,e.note=`Accept the terms first.`):e.note=``},runover:{initializeComponent:t=>{t.bindings.model(()=>e.step,t=>{let n=e;n!=null&&typeof n.step!=`function`&&(n.step=t)})}},childs:[]}),t(i,{label:`I accept the terms`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.agreed,t=>{let n=e;n!=null&&typeof n.agreed!=`function`&&(n.agreed=t)})}},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`st-note`),t.bindings.method(()=>e.note)}},1)]})}var b=[{text:`Details`,description:`Name and e-mail`},{text:`Address`,description:`Where to send it`},{text:`Payment`,description:`Card or transfer`},{text:`Review`}];function x(){return t(o,{gap:`lg`,style:`inline-size: 100%`,runover:{},childs:[t(a,{label:`Texts under`,items:b,value:1,linear:!1,runover:{},childs:[]}),t(a,{label:`Texts after`,items:b.slice(0,3),value:1,labelPosition:`end`,linear:!1,runover:{},childs:[]}),t(`div`,{initializeComponent:e=>{e.style(`inline-size: 18rem`);let n=t(a,{label:`Standing`,items:b,value:1,orientation:`vertical`,linear:!1,runover:{},childs:[]});e.controls.add(n)}},1)]})}var S=[`Plan`,`Build`,`Ship`];function C(){return t(o,{gap:`lg`,style:`inline-size: 100%`,runover:{},childs:[t(a,{label:`Small`,items:S,value:1,size:`sm`,linear:!1,runover:{},childs:[]}),t(a,{label:`Medium`,items:S,value:1,linear:!1,runover:{},childs:[]}),t(a,{label:`Large`,items:S,value:1,size:`lg`,linear:!1,runover:{},childs:[]}),t(a,{label:`Dots`,items:S,value:1,showNumbers:!1,size:`sm`,labelPosition:`end`,linear:!1,runover:{},childs:[]})]})}var w=()=>t(`svg`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({viewBox:`0 0 16 16`,"aria-hidden":`true`});let n=t(`path`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({d:`M11.5 2.5l2 2L5 13H3v-2z`,fill:`none`,stroke:`currentColor`,"stroke-width":`1.5`,"stroke-linejoin":`round`})}});e.controls.add(n)}});function T(){let e=n({paid:!1}),i=[{text:`Cart`,status:`done`},{text:`Address`,description:`Checked`,status:`done`},{text:`Payment`,description:()=>e.paid?`Paid`:`Card declined`,status:()=>e.paid?`done`:`error`},{text:`Gift note`,optional:!0,icon:w()},{text:`Pick-up`,enabled:!1},{text:`Done`}];return t(o,{gap:`md`,style:`inline-size: 100%`,runover:{},childs:[t(a,{label:`Statuses`,items:i,value:5,linear:!1,runover:{},childs:[]}),t(r,{text:()=>e.paid?`Decline the card`:`Take the payment`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.paid=!e.paid)}},childs:[]})]})}var E=f(Object.assign({"./examples/Linear.tsx":p,"./examples/Orientations.tsx":m,"./examples/Programmatic.tsx":h,"./examples/Sizes.tsx":g,"./examples/Statuses.tsx":_})),D=[[`items`,"`Bind<readonly (StepperItem | string)[]>`","`[]`","The steps in order: `StepperItem` objects (`text`, `description`, `key`, `icon`, `status`, `optional`, `enabled`, `data`) or plain text."],[`value`,"`Bind<string | number | null>`","`0`","The current step, identified by its `key` or index, or `null` for none. `x-model` provides two-way binding."],[`linear`,"`Bind<boolean>`","`true`",`Lets the user reach a completed step or the one right after the last completed step. Optional steps can be skipped.`],[`orientation`,"`Bind<StepperOrientation>`","`'horizontal'`","`horizontal` or `vertical`."],[`labelPosition`,"`Bind<StepperLabelPosition>`","`'bottom'`","In the horizontal orientation, places the text below the indicator (`bottom`) or after it (`end`)."],[`size`,"`Bind<ControlSize>`","`'md'`","`sm`, `md`, `lg`."],[`clickable`,"`Bind<boolean>`","`true`","`false` makes the stepper display only, with no buttons or Tab stop."],[`showNumbers`,"`Bind<boolean>`","`true`",`Shows the number in the indicator of an upcoming step.`],[`label`,"`Bind<string>`",`The kit string “Steps”`,`The accessible name.`]],O=[[`onStepChanging`,`event`,"Occurs before the current step changes (`from`, `to`, `fromItem`, `toItem`, `byUser`). `cancel = true` keeps it. Setting `promise` to a `Promise<boolean>` waits, and the step changes when it resolves to `true`."],[`onStepChanged`,`event`,"Occurs after the current step changes (`index`, `item`, `previous`, `byUser`)."],[`selectedIndex`,`read-only`,`The index of the current step, or -1 if there is none.`],[`count`,`read-only`,`The number of steps.`],[`canGoNext, canGoPrevious`,`read-only`,`Indicates whether there is an enabled step after or before the current one.`],[`next(), previous()`,"`Promise<boolean>`","Moves to the next or previous enabled step. Returns `false` if there is none or the change was canceled."],[`goTo(step)`,"`Promise<boolean>`","Moves to a step by index or key, in any order. `onStepChanging` is raised first."],[`statusOf(index)`,"`StepperStatus`","`pending`, `current`, `done` or `error`, as displayed."],[`canReach(index)`,"`boolean`",`Indicates whether the user can reach the step.`],[`refresh()`,"`void`",`Re-reads the items after they have been changed in place.`]],k=[[`pending`,`A step not yet reached, with its number in the indicator.`],[`current`,'The active step, with `aria-current="step"`.'],[`done`,"Steps before the current one, and any step with `status: 'done'`. The indicator shows a check, and the line before it is filled."],[`error`,"A step with `status: 'error'`. The indicator shows a mark, the text uses the danger color, and it is announced as “Needs attention”."],[`optional`,`Shows “Optional” below the text. In linear mode, the step can be skipped.`],[`disabled`,"An item with `enabled: false`, or a step that linear mode does not reach yet. It has `aria-disabled` and is outside the Tab order."]],A=[[`Tab`,`One Tab stop: the step focused last, otherwise the current one, otherwise the first reachable step.`],[`Arrow keys`,`Left and Right (Up and Down when vertical) move between reachable steps and wrap at the ends. Home and End move to the first and last.`],[`Enter, Space`,"Selects the focused step, and `onStepChanging` can cancel it."]],j=[[`Landmark`,"A `nav` named “Steps” in the kit language, containing an ordered list. If a page has several, give each one its own `label`."],[`A step`,`A button whose name includes the position, text and status, such as “Step 2 of 4, Address, Where to send it, Completed”.`],[`Not clickable`,"Plain elements with nothing to press. The current step still has `aria-current`."],[`Lines and marks`,`Decorative and hidden from screen readers.`]],M=[[`.mx-stepper`,"The stepper. `data-orientation`, `data-labels`, `data-size`."],[`.mx-stepper__list, .mx-stepper__item`,"The list and each step with its connector. `data-status` is on the item."],[`.mx-stepper__step`,"The step, as a button or a div. `data-status`, `aria-current`, `aria-disabled`."],[`.mx-stepper__indicator, .mx-stepper__number, .mx-stepper__mark, .mx-stepper__icon`,`The circle, the number inside it, the check or error mark, and a custom icon.`],[`.mx-stepper__label, .mx-stepper__description, .mx-stepper__note`,`The text.`],[`.mx-stepper__line`,'The line to the next step. `data-status="done"` up to the current step.']],N=[[`stepper.step, .indicator, .mark, .label, .description, .note, .line`,"Units: the step (`hover`, `pressed`, `focus`, `disabled`, `current`, `done`, `error`), its indicator, the mark (`icon` per state), the text and the line (`done`). In a vertical stepper, the line rotates 90 degrees."],[`stepper.size.*, .font-size.*, .padding.*`,`The indicator, the text and the space around a step, per size.`],[`stepper.description-font-size, .gap, .line-gap, .line-min-length`,`The second line, the space between the indicator and text, and the margins and minimum length of the line.`]];function P(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(u,{text:`Shows the steps of a longer task and the user's progress through them. Each step has an indicator and text, with a line between steps, and steps before the current one are marked complete. [Wizard](/wizard) adds a page and navigation buttons to each step.`,runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(c,{anchor:`import`,title:`Import`,runover:{},childs:[t(s,{code:`
import { Stepper } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(c,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(u,{text:"`value` is the current step, identified by its `key` or index, and `x-model` provides two-way binding. Programmatically, use `next()`, `previous()` and `goTo()`, and `onStepChanged` reports the change.",runover:{},childs:[]});e.controls.add(n)}},1),t(l,{stack:!0,files:E(`Programmatic.tsx`),runover:{},childs:[t(v,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(c,{anchor:`statuses`,title:`Step status`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(u,{text:"Steps before the current one are completed automatically. An item can set `status: 'done'` or `'error'` regardless of the current step, be `optional` or disabled, or show an `icon` instead of its number. Its fields can be functions of your state.",runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Status`,`Details`],rows:k,runover:{},childs:[]}),t(l,{stack:!0,files:E(`Statuses.tsx`),runover:{},childs:[t(T,{runover:{},childs:[]})]})]});e.controls.add(a);let o=t(c,{anchor:`linear`,title:`Linear and free navigation`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(u,{text:"`linear` (the default) lets the user reach only completed steps and the next one, while `linear={false}` allows any step. In both cases, `onStepChanging` is raised first. `cancel` keeps the current step, and `promise` waits for a validation or a server response.",runover:{},childs:[]});e.controls.add(n)}},1),t(l,{stack:!0,files:E(`Linear.tsx`),runover:{},childs:[t(y,{runover:{},childs:[]})]})]});e.controls.add(o);let f=t(c,{anchor:`orientations`,title:`Orientation`,runover:{},childs:[t(l,{stack:!0,files:E(`Orientations.tsx`),runover:{},childs:[t(x,{runover:{},childs:[]})]})]});e.controls.add(f);let p=t(c,{anchor:`sizes`,title:`Sizes`,runover:{},childs:[t(l,{stack:!0,files:E(`Sizes.tsx`),runover:{},childs:[t(C,{runover:{},childs:[]})]})]});e.controls.add(p);let m=t(c,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[t(d,{head:[`Key`,`Description`],rows:A,runover:{},childs:[]})]});e.controls.add(m);let h=t(c,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(d,{head:[`Topic`,`Details`],rows:j,runover:{},childs:[]})]});e.controls.add(h);let g=t(c,{anchor:`styling`,title:`Styling`,runover:{},childs:[t(d,{head:[`Hook`,`Description`],rows:M,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Token`,`Description`],rows:N,runover:{},childs:[]})]});e.controls.add(g);let _=t(c,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Prop`,`Type`,`Default`,`Description`],rows:D,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`Events, properties and methods`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Member`,`Type`,`Description`],rows:O,runover:{},childs:[]})]});e.controls.add(_)}}})}export{P as default};