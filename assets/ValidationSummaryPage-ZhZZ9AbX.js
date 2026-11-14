import{Qn as e,Zn as t,er as n,n as r}from"./next-id-CtzpBrBT.js";import{t as i}from"./TextBox-iHQY3j6o.js";import{t as a}from"./NumberBox-8iuCS9_o.js";import{t as o}from"./ValidationGroup-Cy7KxIFq.js";import{t as s}from"./ValidationSummary-DRTWaaip.js";import{t as c}from"./Stack-wRt1e9tO.js";import{a as l,i as u,n as d,r as f,t as p}from"./docs-B_LZlyP5.js";import{t as m}from"./sources-BXVvOiIY.js";var h=`import { Button, NumberBox, Stack, TextBox, ValidationGroup, ValidationSummary } from '@motifx-community/ui';\r
\r
/** The invalid fields of a form, listed above it after Save. Clicking a line moves to the field. */\r
export default function Form() {\r
    const group = new ValidationGroup();\r
    return (\r
        <Stack gap="md" style="inline-size: 100%; max-inline-size: 420px">\r
            <ValidationSummary class="vs-form" group={group} />\r
            <TextBox label="Name" required validationGroup={group} />\r
            <TextBox label="E-mail" required rules={[{ type: 'email' }]} validationGroup={group} />\r
            <NumberBox label="Guests" required rules={[{ type: 'range', min: 1, max: 8 }]} validationGroup={group} />\r
            <Stack orientation="horizontal" gap="sm">\r
                <Button class="vs-save" text="Save" tone="accent" onclick={() => void group.validate({ focus: false })} />\r
                <Button class="vs-reset" text="Start again" variant="outline" onclick={() => group.reset()} />\r
            </Stack>\r
        </Stack>\r
    );\r
}\r
`,g=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TextBox, ValidationGroup, ValidationSummary } from '@motifx-community/ui';\r
\r
/** A custom header or none. The lines report which field was clicked, and \`failed\` reports how many there are. */\r
export default function Programmatic() {\r
    const group = new ValidationGroup();\r
    const s = reactive({ header: true, told: '', count: 0 });\r
    const summary = new ValidationSummary({\r
        group,\r
        header: 'Before you send it',\r
        showHeader: () => s.header,\r
        onItemClick: e => (s.told = \`pressed: \${e.text}\`)\r
    });\r
    return (\r
        <Stack gap="md" style="inline-size: 100%; max-inline-size: 420px">\r
            <span class="vs-coded" onConfig={c => c.controls.add(summary)} />\r
            <TextBox label="Street" required validationGroup={group} />\r
            <TextBox label="Town" required validationGroup={group} />\r
            <Stack orientation="horizontal" wrap align="center">\r
                <Button class="vs-coded-check" text="Check" tone="accent" onclick={async () => {\r
                    await group.validate({ focus: false });\r
                    s.count = summary.count;\r
                }} />\r
                <Button text="Header on and off" variant="outline" onclick={() => (s.header = !s.header)} />\r
                <output class="vs-coded-told">{() => \`\${s.count} failed\${s.told ? \`, \${s.told}\` : ''}\`}</output>\r
            </Stack>\r
        </Stack>\r
    );\r
}\r
`;function _(){let e=new o;return t(c,{gap:`md`,style:`inline-size: 100%; max-inline-size: 420px`,runover:{},childs:[t(s,{class:`vs-form`,group:e,runover:{},childs:[]}),t(i,{label:`Name`,required:!0,validationGroup:e,runover:{},childs:[]}),t(i,{label:`E-mail`,required:!0,rules:[{type:`email`}],validationGroup:e,runover:{},childs:[]}),t(a,{label:`Guests`,required:!0,rules:[{type:`range`,min:1,max:8}],validationGroup:e,runover:{},childs:[]}),t(c,{orientation:`horizontal`,gap:`sm`,runover:{},childs:[t(r,{class:`vs-save`,text:`Save`,tone:`accent`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>void e.validate({focus:!1}))}},childs:[]}),t(r,{class:`vs-reset`,text:`Start again`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.reset())}},childs:[]})]})]})}function v(){let e=new o,a=n({header:!0,told:``,count:0}),l=new s({group:e,header:`Before you send it`,showHeader:()=>a.header,onItemClick:e=>a.told=`pressed: ${e.text}`});return t(c,{gap:`md`,style:`inline-size: 100%; max-inline-size: 420px`,runover:{},childs:[t(`span`,{onConfig:e=>e.controls.add(l),initializeComponent:e=>{e.class.add(`vs-coded`)}}),t(i,{label:`Street`,required:!0,validationGroup:e,runover:{},childs:[]}),t(i,{label:`Town`,required:!0,validationGroup:e,runover:{},childs:[]}),t(c,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(r,{class:`vs-coded-check`,text:`Check`,tone:`accent`,runover:{initializeComponent:t=>{t.motif.on(`click`,async()=>{await e.validate({focus:!1}),a.count=l.count})}},childs:[]}),t(r,{text:`Header on and off`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>a.header=!a.header)}},childs:[]}),t(`output`,{initializeComponent:e=>{e.class.add(`vs-coded-told`),e.bindings.method(()=>`${a.count} failed${a.told?`, ${a.told}`:``}`)}},1)]})]})}var y=m(Object.assign({"./examples/Form.tsx":h,"./examples/Programmatic.tsx":g})),b=[[`group`,"`Bind<ValidationGroup | null>`","`null`",`The group whose invalid fields are listed.`],[`header`,"`Bind<string>`",`The kit string “Please correct the following”`,`The text above the list.`],[`showHeader`,"`Bind<boolean>`","`true`",`Shows the header.`],[`focusOnClick`,"`Bind<boolean>`","`true`",`Clicking a line moves focus to its field.`]],x=[[`onItemClick`,`event`,"Occurs when a line is clicked (`target`, `text`)."],[`failed`,`read-only`,`The invalid targets currently listed, in group order.`],[`count`,`read-only`,`The number of lines.`],[`refresh()`,"`void`",`Redraws the lines from the current state of the fields.`]],S=[[`The summary`,"A live region (`polite`). The lines are announced when they appear, and the summary is hidden when there are no errors."],[`A line`,`A button with the field's label and message (“E-mail: Enter a valid e-mail address”). Clicking it moves focus to the field.`],[`Glyph`,`The icon before the header is decorative.`]],C=[[`.mx-validation-summary`,"The summary. `data-empty` while there are no errors."],[`.mx-validation-summary__header, .mx-validation-summary__icon, .mx-validation-summary__header-text`,`The header, its glyph and its text.`],[`.mx-validation-summary__list, .mx-validation-summary__line, .mx-validation-summary__item`,`The list, a line and the button inside it.`]],w=[[`validation-summary.box, .icon, .header, .item`,"Units: the box, the glyph before the header (`icon`), the header text and a line (`hover`, `focus`)."],[`validation-summary.gap, .line-gap`,`The space between the header and the list, and between the lines.`]];function T(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(f,{text:"Lists the invalid fields of a `ValidationGroup` under a header, with each field's label and message on its own line. Clicking a line moves focus to the field. The summary updates whenever a field in the group is validated or reset, and it is hidden when there are no errors.",runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(u,{anchor:`import`,title:`Import`,runover:{},childs:[t(l,{code:`
import { ValidationSummary, ValidationGroup } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(u,{anchor:`ways`,title:`Using a summary above a form`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(f,{text:"Set `group` to the group the fields join with `validationGroup`. After `group.validate()`, the invalid fields are listed. A field that becomes valid leaves the list, and `group.reset()` clears it. Clicking a line moves focus to the field (`focusOnClick`).",runover:{},childs:[]});e.controls.add(n)}},1),t(d,{stack:!0,files:y(`Form.tsx`),runover:{},childs:[t(_,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(u,{anchor:`programmatic`,title:`Programmatic use`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(f,{text:"`header` sets the line above the list, and `showHeader` hides it. `onItemClick` reports which line was clicked, and `failed` and `count` report what is listed.",runover:{},childs:[]});e.controls.add(n)}},1),t(d,{stack:!0,files:y(`Programmatic.tsx`),runover:{},childs:[t(v,{runover:{},childs:[]})]})]});e.controls.add(a);let o=t(u,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(p,{head:[`Topic`,`Details`],rows:S,runover:{},childs:[]})]});e.controls.add(o);let s=t(u,{anchor:`styling`,title:`Styling`,runover:{},childs:[t(p,{head:[`Hook`,`Description`],rows:C,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(f,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(p,{head:[`Token`,`Description`],rows:w,runover:{},childs:[]})]});e.controls.add(s);let c=t(u,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(f,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(p,{head:[`Prop`,`Type`,`Default`,`Description`],rows:b,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(f,{text:`Events, properties and methods`,runover:{},childs:[]});e.controls.add(n)}},1),t(p,{head:[`Member`,`Type`,`Description`],rows:x,runover:{},childs:[]})]});e.controls.add(c)}}})}export{T as default};