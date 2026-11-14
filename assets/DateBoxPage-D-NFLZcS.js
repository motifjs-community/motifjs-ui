import{$n as e,F as t,Qn as n,n as r,tr as i}from"./next-id-IxLtiCRk.js";import{t as a}from"./ValidationGroup-nqszqpD0.js";import{t as o}from"./DateBox-B-QJ7MKL.js";import{t as s}from"./Stack-DTHjt5Ku.js";import{a as c,i as l,n as u,r as d,t as f}from"./docs-DpibOHDk.js";import{t as p}from"./sources-BXVvOiIY.js";var m=`import { reactive } from '@motifx/core';\r
import { Button, DateBox, ValidationGroup } from '@motifx-community/ui';\r
\r
const today = new Date();\r
const inDays = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);\r
\r
/** A required weekday in the next 60 days: \`min\`, \`max\` and \`disabledDates\` limit typing and picking, a group checks it. */\r
export default function Limits() {\r
  const s = reactive({ result: '' });\r
  const group = new ValidationGroup();\r
\r
  const check = async () => {\r
    const result = await group.validate();\r
    s.result = result.valid ? 'Booked.' : 'Pick a weekday in the next 60 days.';\r
  };\r
\r
  return (\r
    <>\r
      <DateBox\r
        label="Appointment"\r
        required\r
        min={today}\r
        max={inDays(60)}\r
        disabledDates={(d: Date) => d.getDay() === 0 || d.getDay() === 6}\r
        helpText="A weekday in the next 60 days."\r
        validationGroup={group}\r
        showTodayButton\r
      />\r
      <Button text="Check" variant="outline" onclick={check} />\r
      <output class="db-check">{() => s.result}</output>\r
    </>\r
  );\r
}\r
`,h=`import { reactive } from '@motifx/core';\r
import { DateBox } from '@motifx-community/ui';\r
\r
/** One date in three locales: each types and shows it in its own order and separators. */\r
export default function Locales() {\r
  const s = reactive({ trip: null as Date | null });\r
  return (\r
    <>\r
      <DateBox label="Türkçe" locale="tr-TR" x-model={() => s.trip} />\r
      <DateBox label="English (US)" locale="en-US" x-model={() => s.trip} />\r
      <DateBox label="日本語" locale="ja-JP" x-model={() => s.trip} />\r
    </>\r
  );\r
}\r
`,g=`import { reactive } from '@motifx/core';\r
import { Button, uiLocale } from '@motifx-community/ui';\r
\r
/** Switches the button names and messages of every date box on the page. */\r
export default function Localization() {\r
  const s = reactive({ lang: 'en' });\r
  const toggle = () => {\r
    s.lang = s.lang === 'en' ? 'tr' : 'en';\r
    void uiLocale.use(s.lang);\r
  };\r
  return <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />;\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { Button, DateBox, Stack } from '@motifx-community/ui';\r
\r
const today = new Date();\r
\r
/** A date box bound with x-model, and date boxes created with \`new\`, given a value and added programmatically. */\r
export default function Programmatic() {\r
  const order = reactive({ delivery: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3) as Date | null, result: '' });\r
  let added = 0;\r
  let host: Stack | null = null;\r
\r
  const addProgrammatic = () => {\r
    const due = new DateBox({ label: \`Due \${++added}\`, locale: 'tr-TR', clearButton: true });\r
    due.value = new Date(2026, 9, 25);\r
    due.onValueChanged((e) => (order.result = \`\${due.label}: \${e.value ? e.value.toDateString() : '—'}\`));\r
    host?.controls.add(due);\r
    due.focus();\r
  };\r
\r
  return (\r
    <>\r
      <DateBox label="&Delivery" x-model={() => order.delivery} clearButton />\r
      <output class="db-day">{() => (order.delivery ? order.delivery.toDateString() : '—')}</output>\r
      <Button text="Add a date box programmatically" variant="outline" onclick={addProgrammatic} />\r
      <output class="db-made">{() => order.result}</output>\r
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />\r
    </>\r
  );\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { DateBox } from '@motifx-community/ui';\r
\r
/** A date with a time in steps of 15 minutes, and a time alone. */\r
export default function TimeAndDate() {\r
  const s = reactive({ meeting: null as Date | null, alarm: null as Date | null });\r
  return (\r
    <>\r
      <DateBox label="Meeting" type="datetime" timeStep={15} displayFormat={{ dateStyle: 'medium', timeStyle: 'short' }} x-model={() => s.meeting} stretch />\r
      <DateBox label="Alarm" type="time" x-model={() => s.alarm} />\r
    </>\r
  );\r
}\r
`,y=new Date;function b(){let t=i({delivery:new Date(y.getFullYear(),y.getMonth(),y.getDate()+3),result:``}),a=0,c=null,l=()=>{let e=new o({label:`Due ${++a}`,locale:`tr-TR`,clearButton:!0});e.value=new Date(2026,9,25),e.onValueChanged(n=>t.result=`${e.label}: ${n.value?n.value.toDateString():`—`}`),c?.controls.add(e),e.focus()};return e({initializeComponent:e=>{{let i=n(o,{label:`&Delivery`,clearButton:!0,runover:{initializeComponent:e=>{e.bindings.model(()=>t.delivery,e=>{let n=t;n!=null&&typeof n.delivery!=`function`&&(n.delivery=e)})}},childs:[]});e.controls.add(i);let a=n(`output`,{initializeComponent:e=>{e.class.add(`db-day`),e.bindings.ternary(()=>t.delivery,e=>{e.navigate(n(`text`,{initializeComponent:e=>{e.bindings.add(`textContent`,()=>{let e;if(t&&t.delivery&&t.delivery.toDateString&&(e=t.delivery.toDateString())!=null)return typeof e==`function`?e():()=>t.delivery.toDateString()})}},1))},e=>{e.navigate(n(`text`,{initializeComponent:e=>{e.setText(`—`)}},1))})}},1);e.controls.add(a);let u=n(r,{text:`Add a date box programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,l)}},childs:[]});e.controls.add(u);let d=n(`output`,{initializeComponent:e=>{e.class.add(`db-made`),e.bindings.method(()=>t.result)}},1);e.controls.add(d);let f=n(s,{orientation:`horizontal`,wrap:!0,align:`center`,ref:e=>c=e,runover:{},childs:[]});e.controls.add(f)}}})}var x=new Date,S=e=>new Date(x.getFullYear(),x.getMonth(),x.getDate()+e);function C(){let t=i({result:``}),s=new a,c=async()=>{let e=await s.validate();t.result=e.valid?`Booked.`:`Pick a weekday in the next 60 days.`};return e({initializeComponent:e=>{{let i=n(o,{label:`Appointment`,required:!0,min:x,max:S(60),disabledDates:e=>e.getDay()===0||e.getDay()===6,helpText:`A weekday in the next 60 days.`,validationGroup:s,showTodayButton:!0,runover:{},childs:[]});e.controls.add(i);let a=n(r,{text:`Check`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,c)}},childs:[]});e.controls.add(a);let l=n(`output`,{initializeComponent:e=>{e.class.add(`db-check`),e.bindings.method(()=>t.result)}},1);e.controls.add(l)}}})}function w(){let t=i({trip:null});return e({initializeComponent:e=>{{let r=n(o,{label:`Türkçe`,locale:`tr-TR`,runover:{initializeComponent:e=>{e.bindings.model(()=>t.trip,e=>{let n=t;n!=null&&typeof n.trip!=`function`&&(n.trip=e)})}},childs:[]});e.controls.add(r);let i=n(o,{label:`English (US)`,locale:`en-US`,runover:{initializeComponent:e=>{e.bindings.model(()=>t.trip,e=>{let n=t;n!=null&&typeof n.trip!=`function`&&(n.trip=e)})}},childs:[]});e.controls.add(i);let a=n(o,{label:`日本語`,locale:`ja-JP`,runover:{initializeComponent:e=>{e.bindings.model(()=>t.trip,e=>{let n=t;n!=null&&typeof n.trip!=`function`&&(n.trip=e)})}},childs:[]});e.controls.add(a)}}})}function T(){let e=i({lang:`en`}),a=()=>{e.lang=e.lang===`en`?`tr`:`en`,t.use(e.lang)};return n(r,{text:()=>e.lang===`en`?`Language: English`:`Dil: Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,a)}},childs:[]})}function E(){let t=i({meeting:null,alarm:null});return e({initializeComponent:e=>{{let r=n(o,{label:`Meeting`,type:`datetime`,timeStep:15,displayFormat:{dateStyle:`medium`,timeStyle:`short`},stretch:!0,runover:{initializeComponent:e=>{e.bindings.model(()=>t.meeting,e=>{let n=t;n!=null&&typeof n.meeting!=`function`&&(n.meeting=e)})}},childs:[]});e.controls.add(r);let i=n(o,{label:`Alarm`,type:`time`,runover:{initializeComponent:e=>{e.bindings.model(()=>t.alarm,e=>{let n=t;n!=null&&typeof n.alarm!=`function`&&(n.alarm=e)})}},childs:[]});e.controls.add(i)}}})}var D=p(Object.assign({"./examples/Limits.tsx":m,"./examples/Locales.tsx":h,"./examples/Localization.tsx":g,"./examples/Programmatic.tsx":_,"./examples/TimeAndDate.tsx":v})),O=[[`value`,"`Bind<Date | null>`","`null`","The date. `x-model` provides two-way binding."],[`type`,"`Bind<'date' | 'time' | 'datetime'>`","`'date'`",`A date, a time of day, or both.`],[`locale`,"`Bind<string>`",`From the page`,"Sets the order of the parts (`25.10.2026`, `10/25/2026`), the month and day names, and the first day of the week."],[`min / max`,"`Bind<Date | null>`",`—`,`Limits for typing and picking, enforced by validation.`],[`disabledDates`,"`Bind<(date) => boolean>`",`—`,`Days that cannot be selected, such as weekends.`],[`displayFormat`,"`Bind<Intl.DateTimeFormatOptions | null>`",`—`,"How the value is displayed while the field is not being edited: `{ dateStyle: 'long' }`."],[`placeholder`,"`Bind<string>`","`''`",`Displayed when the field is empty and has no focus.`],[`clearButton`,"`Bind<boolean>`","`false`",`Clears the value. Escape does the same.`],[`showPickerButton`,"`Bind<boolean>`","`true`",`The button that opens the calendar or the list of times.`],[`timeStep`,"`Bind<number>`","`30`",`The interval between the times offered, in minutes.`],[`showSeconds`,"`Bind<boolean>`","`false`",`Includes seconds in the time.`],[`firstDayOfWeek, showWeekNumbers, showTodayButton`,`See Calendar`,``,`Passed to the calendar.`],[`label, helpText, required, rules, readOnly, size, variant, …`,`see TextBox`,``,`Field props shared by all editors.`]],k=[[`Digits`,`Fills in the mask and skips separators. The value changes once the date is complete and valid.`],[`Alt + Down, the button`,`Opens the calendar or the list of times, with focus on the selected day.`],[`In the calendar`,`Arrow keys, Home, End, Page Up and Page Down (with Shift, a year), and Enter to select. See Calendar.`],[`In the times`,`Up, Down, Home, End, Page Up, Page Down and Enter.`],[`Escape`,"Closes the picker. With `clearButton` and the picker closed, clears the value."]],A=[[`Field`,"A native `<input>` with its label. The format is the mask the user types into."],[`Button`,'`aria-haspopup="dialog"` and `aria-expanded`, named from `uiLocale` ("Choose date" or "Choose time").'],[`Picker`,'A `role="dialog"` containing the calendar grid (see Calendar) and a list of times (`role="listbox"`).'],[`Errors`,"A date that does not exist, falls outside `min` and `max`, or is disabled fails validation with a message from `uiLocale`."]];function j(){return e({initializeComponent:e=>{{let t=n(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=n(d,{text:"An input for a date, a time or both. Users can type through a mask in the locale's order, or pick from a calendar and a list of times. `min`, `max` and `disabledDates` apply to both methods.",runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let r=n(l,{anchor:`import`,title:`Import`,runover:{},childs:[n(c,{code:`
import { DateBox } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=n(l,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[n(u,{files:D(`Programmatic.tsx`),runover:{},childs:[n(b,{runover:{},childs:[]})]})]});e.controls.add(i);let a=n(l,{anchor:`locale`,title:`Locales`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(d,{text:`The mask follows the locale, including the order of day, month and year and the separators. Month and day names in the calendar and the first day of the week also come from the locale.`,runover:{},childs:[]});e.controls.add(t)}},1),n(u,{files:D(`Locales.tsx`),runover:{},childs:[n(w,{runover:{},childs:[]})]})]});e.controls.add(a);let o=n(l,{anchor:`types`,title:`Time and date with time`,runover:{},childs:[n(u,{files:D(`TimeAndDate.tsx`),runover:{},childs:[n(E,{runover:{},childs:[]})]})]});e.controls.add(o);let s=n(l,{anchor:`limits`,title:`Limits and validation`,runover:{},childs:[n(u,{files:D(`Limits.tsx`),runover:{},childs:[n(C,{runover:{},childs:[]})]})]});e.controls.add(s);let p=n(l,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[n(f,{head:[`Key`,`Description`],rows:k,runover:{},childs:[]})]});e.controls.add(p);let m=n(l,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[n(f,{head:[`Topic`,`Details`],rows:A,runover:{},childs:[]})]});e.controls.add(m);let h=n(l,{anchor:`i18n`,title:`Localization`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(d,{text:"Button names and messages come from `uiLocale.strings`. Dates and names come from `locale`.",runover:{},childs:[]});e.controls.add(t)}},1),n(u,{files:D(`Localization.tsx`),runover:{},childs:[n(T,{runover:{},childs:[]})]})]});e.controls.add(h);let g=n(l,{anchor:`styling`,title:`Styling`,runover:{},childs:[n(f,{head:[`Hook`,`Description`],rows:[[`.mx-date-box`,'Added to the field; `data-type="date|time|datetime"`.'],[`.mx-date-box__toggle, .mx-date-box__clear`,`The picker and clear buttons.`],[`.mx-date-box__popup, .mx-date-box__times`,`The picker and its list of times.`],[`date-box.times, date-box.popup-gap, date-box.calendar`,"The list of times (a unit: `focus`, `beside`), the space between the field and its popup, and the calendar as it appears in the popup (a place). Everything else comes from `field.*` and `calendar.*`."]],runover:{},childs:[]})]});e.controls.add(g);let _=n(l,{anchor:`api`,title:`API reference`,runover:{},childs:[n(`h3`,{initializeComponent:e=>{let t=n(d,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),n(f,{head:[`Prop`,`Type`,`Default`,`Description`],rows:O,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(d,{text:`Properties, methods, events`,runover:{},childs:[]});e.controls.add(t)}},1),n(f,{head:[`Member`,`Description`],rows:[[`unfinished`,`Indicates that the typed text is not yet a complete, valid date.`],[`opened, open(), close()`,`The picker.`],[`clear()`,`Clears the value.`],[`inputPart`,"The native `<input>`."],[`onValueChanged, onOpened, onClosed, onValidated`,`These work the same way as in DropDown and TextBox.`]],runover:{},childs:[]}),n(`p`,{initializeComponent:e=>{let t=n(d,{text:"The date helpers are shared: `datePatternOf(locale, kind)`, `dateToDigits`, `digitsToDate`.",runover:{},childs:[]});e.controls.add(t)}},1)]});e.controls.add(_)}}})}export{j as default};