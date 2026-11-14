import{Qn as e,Zn as t,er as n,n as r}from"./next-id-CtzpBrBT.js";import{t as i}from"./TextBox-iHQY3j6o.js";import{t as a}from"./TextArea-B9RnvadP.js";import{t as o}from"./CheckBox-BHqI2SXj.js";import{t as s}from"./Avatar-DZajY4yI.js";import{t as c}from"./Popover-zWEPOUm-.js";import{t as l}from"./Stack-wRt1e9tO.js";import{a as u,i as d,n as f,r as p,t as m}from"./docs-B_LZlyP5.js";import{t as h}from"./sources-BXVvOiIY.js";var g=`import { reactive, type Component } from '@motifx/core';\r
import { Button, Popover, Stack, TextBox } from '@motifx-community/ui';\r
\r
/** A popover with a title, a close button and a small form, and one created programmatically for a link. */\r
export default function Basic() {\r
    const s = reactive({ open: false, name: 'Ada', saved: '' });\r
    let button!: Button;\r
    let link!: Component<HTMLAnchorElement>;\r
    const coded = new Popover({ title: 'Programmatically', content: new Button({ text: 'OK', variant: 'outline', onclick: () => coded.close() }) });\r
\r
    return (\r
        <Stack orientation="horizontal" wrap align="center">\r
            <Button ref={(b: Button) => (button = b)} text="Rename" variant="outline" />\r
            <Popover target={() => button} title="New name" showClose x-model={() => s.open}>\r
                <Stack orientation="horizontal" wrap align="center">\r
                    <TextBox label="Name" x-model={() => s.name} />\r
                    <Button text="Save" tone="accent" onclick={() => ((s.saved = s.name), (s.open = false))} />\r
                </Stack>\r
            </Popover>\r
            <output class="po-saved">{() => (s.saved ? \`Saved: \${s.saved}\` : s.open ? 'Open' : 'Closed')}</output>\r
            <a\r
                href="#from-code"\r
                class="po-link"\r
                ref={(c: Component<HTMLAnchorElement>) => (link = c)}\r
                onclick={(e: Event) => {\r
                    e.preventDefault();\r
                    coded.target = link;\r
                    coded.toggle();\r
                }}\r
            >\r
                A popover programmatically\r
            </a>\r
        </Stack>\r
    );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { Button, Popover, Stack, TextArea } from '@motifx-community/ui';\r
\r
/** A click outside does not close it, and onClosing keeps it open while there is unsaved text. Escape and the button close it. */\r
export default function Events() {\r
    const s = reactive({ note: '', told: '' });\r
    let button!: Button;\r
    let pop!: Popover;\r
    return (\r
        <Stack orientation="horizontal" wrap align="center">\r
            <Button ref={(b: Button) => (button = b)} text="Add a note" variant="outline" />\r
            <Popover\r
                ref={(p: Popover) => (pop = p)}\r
                target={() => button}\r
                title="Note"\r
                closeOnOutside={false}\r
                onClosing={e => {\r
                    if (e.reason === 'escape' && s.note.trim() !== '') {\r
                        e.cancel = true;\r
                        s.told = 'Save or clear the note first.';\r
                    }\r
                }}\r
                onClosed={reason => (s.told = \`Closed: \${String(reason)}\`)}\r
            >\r
                <Stack gap="sm">\r
                    <TextArea label="Text" x-model={() => s.note} rows={3} />\r
                    <Button text="Save" tone="accent" onclick={() => ((s.note = ''), pop.close())} />\r
                </Stack>\r
            </Popover>\r
            <output class="po-told">{() => s.told}</output>\r
        </Stack>\r
    );\r
}\r
`,v=`import type { Component } from '@motifx/core';\r
import { Avatar, Popover, Stack } from '@motifx-community/ui';\r
\r
/** A card that opens while the pointer rests on a name, or when the name has keyboard focus. */\r
export default function Hover() {\r
    let name!: Component<HTMLAnchorElement>;\r
    return (\r
        <Stack orientation="horizontal" wrap align="center">\r
            <span>\r
                Reviewed by{' '}\r
                <a href="#ada" class="po-person" ref={(c: Component<HTMLAnchorElement>) => (name = c)} onclick={(e: Event) => e.preventDefault()}>\r
                    Ada Lovelace\r
                </a>\r
            </span>\r
            <Popover target={() => name} showOn="hover" placement="top" label="Ada Lovelace">\r
                <Stack orientation="horizontal" align="center">\r
                    <Avatar name="Ada Lovelace" size="lg" />\r
                    <Stack>\r
                        <strong>Ada Lovelace</strong>\r
                        <span>Analytical Engine, Programs</span>\r
                    </Stack>\r
                </Stack>\r
            </Popover>\r
        </Stack>\r
    );\r
}\r
`,y=`import { reactive } from '@motifx/core';\r
import { Button, CheckBox, Popover, Stack, type PopupPlacement } from '@motifx-community/ui';\r
\r
const PLACEMENTS: PopupPlacement[] = ['top-start', 'top', 'top-end', 'start', 'end', 'bottom-start', 'bottom', 'bottom-end'];\r
\r
/** Every placement; the arrow where the language draws one, and a width of its own. */\r
export default function Placements() {\r
    const s = reactive({ arrow: true, placement: 'bottom' as PopupPlacement });\r
    let button!: Button;\r
    return (\r
        <Stack gap="md">\r
            <Stack orientation="horizontal" wrap align="center">\r
                {PLACEMENTS.map(placement => (\r
                    <Button key={placement} text={placement} variant={() => (s.placement === placement ? 'solid' : 'outline')} size="sm" onclick={() => (s.placement = placement)} />\r
                ))}\r
                <CheckBox label="Arrow" x-model={() => s.arrow} />\r
            </Stack>\r
            <div style="display: flex; justify-content: center; padding: 3rem 0">\r
                <Button ref={(b: Button) => (button = b)} text="Open" />\r
            </div>\r
            <Popover target={() => button} placement={() => s.placement} arrow={() => s.arrow} width="16rem" label="Placement">\r
                <p>{() => \`Placed at \${s.placement}; it moves to the other side when there is no room.\`}</p>\r
            </Popover>\r
        </Stack>\r
    );\r
}\r
`;function b(){let e=n({open:!1,name:`Ada`,saved:``}),a,o,s=new c({title:`Programmatically`,content:new r({text:`OK`,variant:`outline`,onclick:()=>s.close()})});return t(l,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(r,{text:`Rename`,variant:`outline`,ref:e=>a=e,runover:{},childs:[]}),t(c,{target:()=>a,title:`New name`,showClose:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.open,t=>{let n=e;n!=null&&typeof n.open!=`function`&&(n.open=t)})}},childs:[t(l,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(i,{label:`Name`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.name,t=>{let n=e;n!=null&&typeof n.name!=`function`&&(n.name=t)})}},childs:[]}),t(r,{text:`Save`,tone:`accent`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>(e.saved=e.name,e.open=!1))}},childs:[]})]})]}),t(`output`,{initializeComponent:n=>{n.class.add(`po-saved`),n.bindings.ternary(()=>e.saved,n=>{n.navigate(t(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,()=>{if(`Saved: ${e.saved}`!==null&&`Saved: ${e.saved}`!==void 0)return typeof`Saved: ${e.saved}`==`function`?`Saved: ${e.saved}`():()=>`Saved: ${e.saved}`})}},1))},r=>{n.bindings.ternaryCall(()=>e.open,()=>{r.navigate(t(`text`,{initializeComponent:e=>{e.setText(`Open`)}},1))},()=>{r.navigate(t(`text`,{initializeComponent:e=>{e.setText(`Closed`)}},1))})})}},1),t(`a`,{ref:e=>o=e,initializeComponent:e=>{e.attr.add({href:`#from-code`}),e.class.add(`po-link`),e.motif.on(`click`,e=>{e.preventDefault(),s.target=o,s.toggle()});let n=t(`text`,{initializeComponent:e=>{e.setText(`A popover programmatically`)}},1);e.controls.add(n)}})]})}function x(){let e=n({note:``,told:``}),i,o;return t(l,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(r,{text:`Add a note`,variant:`outline`,ref:e=>i=e,runover:{},childs:[]}),t(c,{target:()=>i,title:`Note`,closeOnOutside:!1,onClosing:t=>{t.reason===`escape`&&e.note.trim()!==``&&(t.cancel=!0,e.told=`Save or clear the note first.`)},onClosed:t=>e.told=`Closed: ${String(t)}`,ref:e=>o=e,runover:{},childs:[t(l,{gap:`sm`,runover:{},childs:[t(a,{label:`Text`,rows:3,runover:{initializeComponent:t=>{t.bindings.model(()=>e.note,t=>{let n=e;n!=null&&typeof n.note!=`function`&&(n.note=t)})}},childs:[]}),t(r,{text:`Save`,tone:`accent`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>(e.note=``,o.close()))}},childs:[]})]})]}),t(`output`,{initializeComponent:t=>{t.class.add(`po-told`),t.bindings.method(()=>e.told)}},1)]})}function S(){let e;return t(l,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(`span`,{initializeComponent:n=>{let r=t(`text`,{initializeComponent:e=>{e.setText(`Reviewed by`)}},1);n.controls.add(r);let i=t(`text`,{initializeComponent:e=>{e.setText(` `)}},1);n.controls.add(i);let a=t(`a`,{ref:t=>e=t,initializeComponent:e=>{e.attr.add({href:`#ada`}),e.class.add(`po-person`),e.motif.on(`click`,e=>e.preventDefault());let n=t(`text`,{initializeComponent:e=>{e.setText(`Ada Lovelace`)}},1);e.controls.add(n)}});n.controls.add(a)}},1),t(c,{target:()=>e,showOn:`hover`,placement:`top`,label:`Ada Lovelace`,runover:{},childs:[t(l,{orientation:`horizontal`,align:`center`,runover:{},childs:[t(s,{name:`Ada Lovelace`,size:`lg`,runover:{},childs:[]}),t(l,{runover:{},childs:[t(`strong`,{initializeComponent:e=>{let n=t(`text`,{initializeComponent:e=>{e.setText(`Ada Lovelace`)}},1);e.controls.add(n)}},1),t(`span`,{initializeComponent:e=>{let n=t(`text`,{initializeComponent:e=>{e.setText(`Analytical Engine, Programs`)}},1);e.controls.add(n)}},1)]})]})]})]})}var C=[`top-start`,`top`,`top-end`,`start`,`end`,`bottom-start`,`bottom`,`bottom-end`];function w(){let e=n({arrow:!0,placement:`bottom`}),i;return t(l,{gap:`md`,runover:{},childs:[t(l,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t({initializeComponent:n=>{n.bindings.list(()=>C??[],n=>t(r,{indexkey:()=>n,text:n,variant:()=>e.placement===n?`solid`:`outline`,size:`sm`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.placement=n)}},childs:[]}))}}),t(o,{label:`Arrow`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.arrow,t=>{let n=e;n!=null&&typeof n.arrow!=`function`&&(n.arrow=t)})}},childs:[]})]}),t(`div`,{initializeComponent:e=>{e.style(`display: flex; justify-content: center; padding: 3rem 0`);let n=t(r,{text:`Open`,ref:e=>i=e,runover:{},childs:[]});e.controls.add(n)}},1),t(c,{target:()=>i,placement:()=>e.placement,arrow:()=>e.arrow,width:`16rem`,label:`Placement`,runover:{},childs:[t(`p`,{initializeComponent:t=>{t.bindings.method(()=>`Placed at ${e.placement}; it moves to the other side when there is no room.`)}},1)]})]})}var T=h(Object.assign({"./examples/Basic.tsx":g,"./examples/Events.tsx":_,"./examples/Hover.tsx":v,"./examples/Placements.tsx":y})),E=[[`target`,"`Bind<ComponentBase | null>`","`null`",`The component it opens next to.`],[`title`,"`Bind<string>`","`''`","A title in the header. This is the same property as `text`."],[`label`,"`Bind<string>`","`''`",`The accessible name when there is no title.`],[`content`,"`Bind<ComponentBase | null>`","`null`",`Content set programmatically, shown after the JSX children.`],[`showOn`,"`Bind<PopoverShowOn>`","`'click'`","`click` toggles it when the target is clicked, `hover` opens it on hover or keyboard focus, and `manual` leaves it to your code."],[`placement`,"`Bind<PopupPlacement>`","`'bottom'`",`The side and alignment. It opens on the opposite side if there is no room.`],[`arrow`,"`Bind<boolean>`","`true`",`Shows an arrow toward the target, where the design language includes one.`],[`showClose`,"`Bind<boolean>`","`false`",`Shows a close button in the header.`],[`width`,"`Bind<string | number | null>`","`null`",`A custom width, as a CSS length or in pixels.`],[`closeOnOutside`,"`Bind<boolean>`","`true`",`Closes the popover on a click outside it and its target.`],[`delay, hideDelay`,"`Bind<number>`","`300`, `200`","The time in milliseconds the pointer must rest on the target before it opens, and the time it stays after the pointer leaves both (`showOn: 'hover'`)."],[`value`,"`Bind<boolean>`","`false`","Indicates whether it is open. `x-model` provides two-way binding."]],D=[[`onOpened`,`event`,`Occurs when it opens.`],[`onClosing`,`event`,"Occurs before it closes (`reason`). Set `cancel = true` to keep it open."],[`onClosed`,`event`,"Occurs when it closes, with the reason: `escape`, `outside`, `focus`, `toggle`, `hover`, `close-button` or `code`."],[`open(), close(reason?), toggle()`,"`boolean` / `void`","Programmatic control. `open()` returns `false` if there is no target on the page or the popover is disabled."],[`place()`,"`void`",`Repositions it relative to its target after its content changes size.`],[`isOpen`,`read-only`,`Indicates whether it is currently open.`],[`closeButton, body`,`read-only`,`The kit close button, and the part that holds the content.`]],O=[[`Opening`,"The popover opens on target click, on hover (`hover`), or programmatically. It appears in the browser's top layer next to the target and follows it as the page scrolls."],[`Focus`,`When opened by a click or programmatically, focus moves to the first focusable element inside, or to the popover itself, and returns to the target when it closes. When opened by hover, focus stays where it is.`],[`Closing`,"It closes on Escape, a click outside it and its target, focus leaving both (Tab), the close button, another click on the target, or the pointer leaving both (`hover`). `onClosing` can keep it open."],[`Placement`,"`placement` sets the side and alignment, as in the kit's other popups. If there is no room on that side, it opens on the opposite side."],[`Where it lives`,`When created programmatically, it is placed in the nearest container of its target that can hold it, so it stays in the target's window and landmark.`]],k=[[`Role`,"`dialog`, named by its title or by `label`. Always provide one of them."],[`Target`,'`aria-controls` and `aria-expanded`, plus `aria-haspopup="dialog"` when a click opens it.'],[`Keyboard`,"Tab moves through the content and out, which closes the popover. Escape closes it and returns focus. A `hover` popover also opens on keyboard focus."],[`Arrow`,`Decorative.`]],A=[[`.mx-popover`,"The popover. `data-side` (`top`, `bottom`, `start`, `end`), `data-arrow`."],[`.mx-popover__arrow`,`The arrow.`],[`.mx-popover__header, .mx-popover__title, .mx-popover__close`,`The header, its title and the close button.`],[`.mx-popover__body`,`The content.`]],j=[[`popover.surface, .arrow, .header, .title, .body`,"Units: the surface (`focus`), the arrow (`display`, `size`, its fill and frame), the header, the title and the body."],[`popover.close`,"Place: the appearance of the close button (`variant`)."],[`popover.offset, .enter-offset, .header-gap`,`The gap to the target, the distance it animates in from, and the space between the title and close button.`]];function M(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(p,{text:`Displays content next to a related element, such as a title, a close button, a form or a card. It opens on click or on hover, follows its target, and points to it with an arrow where the design language includes one.`,runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(d,{anchor:`import`,title:`Import`,runover:{},childs:[t(u,{code:`
import { Popover } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(d,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(p,{text:"JSX children are the content, and `target` specifies the component it opens next to. Programmatically, `content` sets the content, and `open()`, `close()` and `toggle()` control it. `value` and `x-model` report whether it is open.",runover:{},childs:[]});e.controls.add(n)}},1),t(f,{files:T(`Basic.tsx`),runover:{},childs:[t(b,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(d,{anchor:`hover`,title:`Opening on hover`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(p,{text:"`showOn: 'hover'` opens the popover after `delay` while the pointer rests on the target, and when the target has keyboard focus. The pointer can move onto the popover, which closes `hideDelay` after the pointer leaves both.",runover:{},childs:[]});e.controls.add(n)}},1),t(f,{files:T(`Hover.tsx`),runover:{},childs:[t(S,{runover:{},childs:[]})]})]});e.controls.add(a);let o=t(d,{anchor:`placements`,title:`Placement, arrow and width`,runover:{},childs:[t(f,{stack:!0,files:T(`Placements.tsx`),runover:{},childs:[t(w,{runover:{},childs:[]})]})]});e.controls.add(o);let s=t(d,{anchor:`events`,title:`Keeping it open`,runover:{},childs:[t(f,{files:T(`Events.tsx`),runover:{},childs:[t(x,{runover:{},childs:[]})]})]});e.controls.add(s);let c=t(d,{anchor:`behaviour`,title:`Behavior`,runover:{},childs:[t(m,{head:[`Topic`,`Details`],rows:O,runover:{},childs:[]})]});e.controls.add(c);let l=t(d,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(m,{head:[`Topic`,`Details`],rows:k,runover:{},childs:[]})]});e.controls.add(l);let h=t(d,{anchor:`styling`,title:`Styling`,runover:{},childs:[t(m,{head:[`Hook`,`Description`],rows:A,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(p,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(m,{head:[`Token`,`Description`],rows:j,runover:{},childs:[]})]});e.controls.add(h);let g=t(d,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(p,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(m,{head:[`Prop`,`Type`,`Default`,`Description`],rows:E,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(p,{text:`Events, properties and methods`,runover:{},childs:[]});e.controls.add(n)}},1),t(m,{head:[`Member`,`Type`,`Description`],rows:D,runover:{},childs:[]})]});e.controls.add(g)}}})}export{M as default};