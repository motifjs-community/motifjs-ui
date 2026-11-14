import{Qn as e,Zn as t,er as n,n as r}from"./next-id-CtzpBrBT.js";import{t as i}from"./DateRangeBox-KKkByu-O.js";import{t as a}from"./Stack-wRt1e9tO.js";import{a as o,i as s,n as c,r as l,t as u}from"./docs-B_LZlyP5.js";import{t as d}from"./sources-BXVvOiIY.js";var f=`import { reactive } from '@motifx/core';\r
import { DateRangeBox, Stack, type DateRange } from '@motifx-community/ui';\r
\r
/** Date and time on both ends: the time is typed after the date, the calendars keep it; one box in Turkish. */\r
export default function DateTime() {\r
    const s = reactive({ shift: [new Date(2026, 2, 10, 8, 30), new Date(2026, 2, 10, 17, 0)] as DateRange, trip: [null, null] as DateRange });\r
    return (\r
        <Stack orientation="horizontal" wrap align="center">\r
            <DateRangeBox label="Shift" type="datetime" x-model={() => s.shift} displayFormat={{ dateStyle: 'short', timeStyle: 'short' }} />\r
            <DateRangeBox label="Seyahat" locale="tr-TR" showWeekNumbers x-model={() => s.trip} startPlaceholder="gidiş" endPlaceholder="dönüş" />\r
        </Stack>\r
    );\r
}\r
`,p=`import { reactive } from '@motifx/core';\r
import { Button, DateRangeBox, Stack, type DateRange } from '@motifx-community/ui';\r
\r
const today = new Date();\r
const inMonths = (n: number) => new Date(today.getFullYear(), today.getMonth() + n, today.getDate());\r
\r
/** A stay of one to fourteen nights, within the next six months, never starting on a Sunday. The message identifies the rule that failed. */\r
export default function Limits() {\r
    const s = reactive({ stay: [null, null] as DateRange, told: '' });\r
    let box!: DateRangeBox;\r
    return (\r
        <Stack orientation="horizontal" wrap align="center">\r
            <DateRangeBox\r
                ref={(b: DateRangeBox) => (box = b)}\r
                label="Stay"\r
                min={today}\r
                max={inMonths(6)}\r
                minDays={1}\r
                maxDays={14}\r
                disabledDates={d => d.getDay() === 0}\r
                required\r
                x-model={() => s.stay}\r
            />\r
            <Button text="Check" variant="outline" onclick={() => void box.validate().then(ok => (s.told = ok ? 'Fine.' : box.validationMessage))} />\r
            <output class="dr-check">{() => s.told}</output>\r
        </Stack>\r
    );\r
}\r
`,m=`import { reactive } from '@motifx/core';\r
import { DateRangeBox, Stack, type DateRange, type DateRangePreset } from '@motifx-community/ui';\r
\r
const day = (offset: number) => {\r
    const d = new Date();\r
    d.setHours(0, 0, 0, 0);\r
    d.setDate(d.getDate() + offset);\r
    return d;\r
};\r
\r
// Custom ranges, calculated when selected so that they are relative to today.\r
const QUARTERS: DateRangePreset[] = [\r
    { text: 'Next 3 days', range: () => [day(0), day(2)] },\r
    { text: 'Next week', range: () => [day(1), day(7)] },\r
    { text: 'Next 90 days', range: () => [day(0), day(89)] }\r
];\r
\r
/** The kit's presets beside the calendars, and custom presets. */\r
export default function Presets() {\r
    const s = reactive({ sales: [null, null] as DateRange, plan: [null, null] as DateRange });\r
    return (\r
        <Stack orientation="horizontal" wrap align="center">\r
            <DateRangeBox label="Sales period" presets x-model={() => s.sales} />\r
            <DateRangeBox label="Planning" presets={QUARTERS} calendars={1} x-model={() => s.plan} />\r
        </Stack>\r
    );\r
}\r
`,h=`import { reactive } from '@motifx/core';\r
import { Button, DateRangeBox, Stack, type DateRange } from '@motifx-community/ui';\r
\r
const say = (d: Date | null) => (d ? d.toLocaleDateString('en-GB') : '—');\r
\r
/** A range bound with x-model, and one created programmatically and read through its properties. */\r
export default function Programmatic() {\r
    const s = reactive({ stay: [new Date(2026, 2, 10), new Date(2026, 2, 14)] as DateRange, told: '' });\r
    const coded = new DateRangeBox({ label: 'Report period', clearButton: true, onValueChanged: e => (s.told = \`\${say(e.value[0])} to \${say(e.value[1])}\`) });\r
\r
    return (\r
        <Stack gap="md">\r
            <Stack orientation="horizontal" wrap align="center">\r
                <DateRangeBox label="Stay" x-model={() => s.stay} clearButton />\r
                <output class="dr-stay">{() => \`\${say(s.stay[0])} to \${say(s.stay[1])}\`}</output>\r
            </Stack>\r
            <Stack orientation="horizontal" wrap align="center">\r
                <span onConfig={c => c.controls.add(coded)} />\r
                <Button text="This week" variant="outline" onclick={() => (coded.value = [new Date(2026, 2, 16), new Date(2026, 2, 22)])} />\r
                <output class="dr-told">{() => s.told}</output>\r
            </Stack>\r
        </Stack>\r
    );\r
}\r
`;function g(){let e=n({shift:[new Date(2026,2,10,8,30),new Date(2026,2,10,17,0)],trip:[null,null]});return t(a,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(i,{label:`Shift`,type:`datetime`,displayFormat:{dateStyle:`short`,timeStyle:`short`},runover:{initializeComponent:t=>{t.bindings.model(()=>e.shift,t=>{let n=e;n!=null&&typeof n.shift!=`function`&&(n.shift=t)})}},childs:[]}),t(i,{label:`Seyahat`,locale:`tr-TR`,showWeekNumbers:!0,startPlaceholder:`gidiş`,endPlaceholder:`dönüş`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.trip,t=>{let n=e;n!=null&&typeof n.trip!=`function`&&(n.trip=t)})}},childs:[]})]})}var _=e=>e?e.toLocaleDateString(`en-GB`):`—`;function v(){let e=n({stay:[new Date(2026,2,10),new Date(2026,2,14)],told:``}),o=new i({label:`Report period`,clearButton:!0,onValueChanged:t=>e.told=`${_(t.value[0])} to ${_(t.value[1])}`});return t(a,{gap:`md`,runover:{},childs:[t(a,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(i,{label:`Stay`,clearButton:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.stay,t=>{let n=e;n!=null&&typeof n.stay!=`function`&&(n.stay=t)})}},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`dr-stay`),t.bindings.method(()=>`${_(e.stay[0])} to ${_(e.stay[1])}`)}},1)]}),t(a,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(`span`,{onConfig:e=>e.controls.add(o)}),t(r,{text:`This week`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>o.value=[new Date(2026,2,16),new Date(2026,2,22)])}},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`dr-told`),t.bindings.method(()=>e.told)}},1)]})]})}var y=new Date,b=e=>new Date(y.getFullYear(),y.getMonth()+e,y.getDate());function x(){let e=n({stay:[null,null],told:``}),o;return t(a,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(i,{label:`Stay`,min:y,max:b(6),minDays:1,maxDays:14,disabledDates:e=>e.getDay()===0,required:!0,ref:e=>o=e,runover:{initializeComponent:t=>{t.bindings.model(()=>e.stay,t=>{let n=e;n!=null&&typeof n.stay!=`function`&&(n.stay=t)})}},childs:[]}),t(r,{text:`Check`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>void o.validate().then(t=>e.told=t?`Fine.`:o.validationMessage))}},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`dr-check`),t.bindings.method(()=>e.told)}},1)]})}var S=e=>{let t=new Date;return t.setHours(0,0,0,0),t.setDate(t.getDate()+e),t},C=[{text:`Next 3 days`,range:()=>[S(0),S(2)]},{text:`Next week`,range:()=>[S(1),S(7)]},{text:`Next 90 days`,range:()=>[S(0),S(89)]}];function w(){let e=n({sales:[null,null],plan:[null,null]});return t(a,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(i,{label:`Sales period`,presets:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.sales,t=>{let n=e;n!=null&&typeof n.sales!=`function`&&(n.sales=t)})}},childs:[]}),t(i,{label:`Planning`,presets:C,calendars:1,runover:{initializeComponent:t=>{t.bindings.model(()=>e.plan,t=>{let n=e;n!=null&&typeof n.plan!=`function`&&(n.plan=t)})}},childs:[]})]})}var T=d(Object.assign({"./examples/DateTime.tsx":f,"./examples/Limits.tsx":p,"./examples/Presets.tsx":m,"./examples/Programmatic.tsx":h})),E=[[`value`,"`Bind<DateRange>`","`[null, null]`","The `[start, end]` pair, where either value can be `null` until selected. `x-model` provides two-way binding."],[`type`,"`Bind<'date' | 'datetime'>`","`'date'`","With `datetime`, the time is typed after the date and the calendars preserve it."],[`min, max, disabledDates`,"`Bind<Date | null>`, `Bind<(d: Date) => boolean>`",`—`,`The dates allowed at both ends, typed or picked.`],[`minDays, maxDays`,"`Bind<number | null>`","`null`",`The minimum and maximum length of a range in days, counted from the start. While the end is being picked, the calendars only offer days within this limit.`],[`presets`,"`Bind<readonly DateRangePreset[] | boolean>`","`false`","`true` shows the built-in ranges next to the calendars (today, yesterday, the last 7 and 30 days, this month and last month). Custom presets use `{ text, range: () => DateRange }`."],[`calendars`,"`Bind<1 | 2>`","`2`",`The number of months side by side in the popup. Two months stay one month apart when paging.`],[`closeOnComplete`,"`Bind<boolean>`","`true`",`Closes the popup once both ends are selected.`],[`locale, displayFormat, firstDayOfWeek, showWeekNumbers, showSeconds`,``,``,"These work the same way as in `DateBox`."],[`startPlaceholder, endPlaceholder`,"`Bind<string>`","`''`",`Displayed in an empty box.`],[`clearButton, showPickerButton`,"`Bind<boolean>`","`false`, `true`",`The clear button and the button that opens the calendars.`],[`label, helpText, required, rules, readOnly, size, variant…`,``,``,`Field props shared by all editors.`]],D=[[`startDate, endDate`,"`Date | null`",`The start and end as separate properties.`],[`inputPart, endInputPart`,`read-only`,`The start and end inputs.`],[`open(), close(), opened`,"`boolean` / `void`","The popup with the calendars, along with `onOpened` and `onClosed`."],[`clear()`,"`void`",`Clears both ends.`],[`validate(), validationMessage, isValid`,``,"Works the same way as on all fields. Validation covers incomplete dates, dates outside `min`, `max` or `disabledDates`, a start after the end, and ranges shorter than `minDays` or longer than `maxDays`."],[`onValueChanged`,`event`,"Occurs when the pair changes (`value`, `previousValue`, `byUser`)."]],O=[[`Typing`,"Each side is a masked input in the locale's order (`22.11.2006`). A complete, valid date is accepted as soon as it is finished, and a cleared side becomes `null`. Tab moves from the start date to the end date."],[`Picking`,`In the popup, the first pick sets the start and the second sets the end. If the second pick is earlier, it becomes the start. With both dates selected, the next pick starts a new range. While the end is being picked, hovering shows the resulting range.`],[`Two months`,`The calendars show the month of the start date and the next month, and they page together.`],[`Presets`,`A list next to the calendars. Selecting a preset applies the range and closes the popup.`],[`Keyboard`,"Alt+Down opens the popup. Inside it, the calendars handle the arrow keys and Enter selects. Escape closes the popup, and clears the field if `clearButton` is on and the popup is already closed."]],k=[[`Inputs`,`Two text inputs named “<label>, Start date” and “<label>, End date” in the kit language. The field label is associated with the start input.`],[`Popup`,`A dialog named “Choose date”. The calendars are kit grids, and the presets are a list box.`],[`Messages`,`Rule messages use the kit language. Custom rules use your own text.`]],A=[[`.mx-date-range-box`,"The field. `data-type`."],[`.mx-date-range-box__start, .mx-date-range-box__end, .mx-date-range-box__separator`,`The inputs and the glyph between them.`],[`.mx-date-range-box__toggle, .mx-date-range-box__clear`,`Buttons inside the box.`],[`.mx-date-range-box__popup, .mx-date-range-box__calendar, .mx-date-range-box__presets`,`The popup, each calendar and the presets.`]],j=[[`date-range-box.separator, .presets`,"Units: the glyph between the inputs (`icon`, `bg`) and the preset list (`focus`, `beside`)."],[`date-range-box.calendar`,`Place: a calendar in the popup.`],[`date-range-box.popup-gap`,`The gap between the calendars and the presets.`],[`calendar.cell range-start, range-end, range-single, range-in`,`The calendar cells in a range: its ends and the days between them, drawn by each design language.`]];function M(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(l,{text:"A single field for a start date and an end date. Users can type through two masks, or pick from two side-by-side months and a list of presets, within the allowed dates and range length. The value is a `[start, end]` pair.",runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(s,{anchor:`import`,title:`Import`,runover:{},childs:[t(o,{code:`
import { DateRangeBox, type DateRange } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(s,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[t(c,{files:T(`Programmatic.tsx`),runover:{},childs:[t(v,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(s,{anchor:`presets`,title:`Presets`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"`presets` adds ready-made ranges next to the calendars. Use `true` for the built-in presets, or provide your own, each calculated when selected. `calendars={1}` shows a single month.",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{files:T(`Presets.tsx`),runover:{},childs:[t(w,{runover:{},childs:[]})]})]});e.controls.add(a);let d=t(s,{anchor:`limits`,title:`Limits`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"`min`, `max` and `disabledDates` limit both ends, whether typed or picked. `minDays` and `maxDays` limit the length of the range, and while the end date is being picked, the calendars only offer days within that limit. When a rule fails, the message says which one.",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{files:T(`Limits.tsx`),runover:{},childs:[t(x,{runover:{},childs:[]})]})]});e.controls.add(d);let f=t(s,{anchor:`datetime`,title:`Time and other locales`,runover:{},childs:[t(c,{files:T(`DateTime.tsx`),runover:{},childs:[t(g,{runover:{},childs:[]})]})]});e.controls.add(f);let p=t(s,{anchor:`behaviour`,title:`Behavior`,runover:{},childs:[t(u,{head:[`Topic`,`Details`],rows:O,runover:{},childs:[]})]});e.controls.add(p);let m=t(s,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(u,{head:[`Topic`,`Details`],rows:k,runover:{},childs:[]})]});e.controls.add(m);let h=t(s,{anchor:`styling`,title:`Styling`,runover:{},childs:[t(u,{head:[`Hook`,`Description`],rows:A,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(l,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(u,{head:[`Token`,`Description`],rows:j,runover:{},childs:[]})]});e.controls.add(h);let _=t(s,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(l,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(u,{head:[`Prop`,`Type`,`Default`,`Description`],rows:E,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(l,{text:`Events, properties and methods`,runover:{},childs:[]});e.controls.add(n)}},1),t(u,{head:[`Member`,`Type`,`Description`],rows:D,runover:{},childs:[]})]});e.controls.add(_)}}})}export{M as default};