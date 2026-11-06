import{Mt as e,a as t,an as n,h as r,i,n as a,nn as o,r as s,rn as c,t as l}from"./doc-B1CtlCkV.js";import{t as u}from"./Stack-AS0iyAxC.js";import{t as d}from"./ValidationGroup-T1woV0-X.js";import{t as f}from"./DateBox-D2-SNvNC.js";import{t as p}from"./sources-BXVvOiIY.js";var m=`import { reactive } from '@motifx/core';\r
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
`,y=new Date;function b(){let e=n({delivery:new Date(y.getFullYear(),y.getMonth(),y.getDate()+3),result:``}),t=0,i=null,a=()=>{let n=new f({label:`Due ${++t}`,locale:`tr-TR`,clearButton:!0});n.value=new Date(2026,9,25),n.onValueChanged(t=>e.result=`${n.label}: ${t.value?t.value.toDateString():`—`}`),i?.controls.add(n),n.focus()};return c({initializeComponent:t=>{{let n=o(f,{label:`&Delivery`,clearButton:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.delivery,t=>{let n=e;n!=null&&typeof n.delivery!=`function`&&(n.delivery=t)})}},childs:[]});t.controls.add(n);let s=o(`output`,{initializeComponent:t=>{t.class.add(`db-day`),t.bindings.ternary(()=>e.delivery,t=>{t.navigate(o(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,()=>{let t;if(e&&e.delivery&&e.delivery.toDateString&&(t=e.delivery.toDateString())!=null)return typeof t==`function`?t():()=>e.delivery.toDateString()})}},1))},e=>{e.navigate(o(`text`,{initializeComponent:e=>{e.setText(`—`)}},1))})}},1);t.controls.add(s);let c=o(r,{text:`Add a date box programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,a)}},childs:[]});t.controls.add(c);let l=o(`output`,{initializeComponent:t=>{t.class.add(`db-made`),t.bindings.method(()=>e.result)}},1);t.controls.add(l);let d=o(u,{orientation:`horizontal`,wrap:!0,align:`center`,ref:e=>i=e,runover:{},childs:[]});t.controls.add(d)}}})}var x=new Date,S=e=>new Date(x.getFullYear(),x.getMonth(),x.getDate()+e);function C(){let e=n({result:``}),t=new d,i=async()=>{let n=await t.validate();e.result=n.valid?`Booked.`:`Pick a weekday in the next 60 days.`};return c({initializeComponent:n=>{{let a=o(f,{label:`Appointment`,required:!0,min:x,max:S(60),disabledDates:e=>e.getDay()===0||e.getDay()===6,helpText:`A weekday in the next 60 days.`,validationGroup:t,showTodayButton:!0,runover:{},childs:[]});n.controls.add(a);let s=o(r,{text:`Check`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]});n.controls.add(s);let c=o(`output`,{initializeComponent:t=>{t.class.add(`db-check`),t.bindings.method(()=>e.result)}},1);n.controls.add(c)}}})}function w(){let e=n({trip:null});return c({initializeComponent:t=>{{let n=o(f,{label:`Türkçe`,locale:`tr-TR`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.trip,t=>{let n=e;n!=null&&typeof n.trip!=`function`&&(n.trip=t)})}},childs:[]});t.controls.add(n);let r=o(f,{label:`English (US)`,locale:`en-US`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.trip,t=>{let n=e;n!=null&&typeof n.trip!=`function`&&(n.trip=t)})}},childs:[]});t.controls.add(r);let i=o(f,{label:`日本語`,locale:`ja-JP`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.trip,t=>{let n=e;n!=null&&typeof n.trip!=`function`&&(n.trip=t)})}},childs:[]});t.controls.add(i)}}})}function T(){let t=n({lang:`en`}),i=()=>{t.lang=t.lang===`en`?`tr`:`en`,e.use(t.lang)};return o(r,{text:()=>t.lang===`en`?`Language: English`:`Dil: Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]})}function E(){let e=n({meeting:null,alarm:null});return c({initializeComponent:t=>{{let n=o(f,{label:`Meeting`,type:`datetime`,timeStep:15,displayFormat:{dateStyle:`medium`,timeStyle:`short`},stretch:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.meeting,t=>{let n=e;n!=null&&typeof n.meeting!=`function`&&(n.meeting=t)})}},childs:[]});t.controls.add(n);let r=o(f,{label:`Alarm`,type:`time`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.alarm,t=>{let n=e;n!=null&&typeof n.alarm!=`function`&&(n.alarm=t)})}},childs:[]});t.controls.add(r)}}})}var D=p(Object.assign({"./examples/Limits.tsx":m,"./examples/Locales.tsx":h,"./examples/Localization.tsx":g,"./examples/Programmatic.tsx":_,"./examples/TimeAndDate.tsx":v})),O=[[`value`,"`Bind<Date | null>`","`null`","The date. `x-model` provides two-way binding."],[`type`,"`Bind<'date' | 'time' | 'datetime'>`","`'date'`",`A date, a time of day, or both.`],[`locale`,"`Bind<string>`",`From the page`,"Sets the order of the parts (`25.10.2026`, `10/25/2026`), the month and day names, and the first day of the week."],[`min / max`,"`Bind<Date | null>`",`—`,`Limits for typing and picking, enforced by validation.`],[`disabledDates`,"`Bind<(date) => boolean>`",`—`,`Days that cannot be selected, such as weekends.`],[`displayFormat`,"`Bind<Intl.DateTimeFormatOptions | null>`",`—`,"How the value is displayed while the field is not being edited: `{ dateStyle: 'long' }`."],[`placeholder`,"`Bind<string>`","`''`",`Displayed when the field is empty and has no focus.`],[`clearButton`,"`Bind<boolean>`","`false`",`Clears the value. Escape does the same.`],[`showPickerButton`,"`Bind<boolean>`","`true`",`The button that opens the calendar or the list of times.`],[`timeStep`,"`Bind<number>`","`30`",`The interval between the times offered, in minutes.`],[`showSeconds`,"`Bind<boolean>`","`false`",`Includes seconds in the time.`],[`firstDayOfWeek, showWeekNumbers, showTodayButton`,`See Calendar`,``,`Passed to the calendar.`],[`label, helpText, required, rules, readOnly, size, variant, …`,`see TextBox`,``,`Field props shared by all editors.`]],k=[[`Digits`,`Fills in the mask and skips separators. The value changes once the date is complete and valid.`],[`Alt + Down, the button`,`Opens the calendar or the list of times, with focus on the selected day.`],[`In the calendar`,`Arrow keys, Home, End, Page Up and Page Down (with Shift, a year), and Enter to select. See Calendar.`],[`In the times`,`Up, Down, Home, End, Page Up, Page Down and Enter.`],[`Escape`,"Closes the picker. With `clearButton` and the picker closed, clears the value."]],A=[[`Field`,"A native `<input>` with its label. The format is the mask the user types into."],[`Button`,'`aria-haspopup="dialog"` and `aria-expanded`, named from `uiLocale` ("Choose date" or "Choose time").'],[`Picker`,'A `role="dialog"` containing the calendar grid (see Calendar) and a list of times (`role="listbox"`).'],[`Errors`,"A date that does not exist, falls outside `min` and `max`, or is disabled fails validation with a message from `uiLocale`."]];function j(){return c({initializeComponent:e=>{{let n=o(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=o(s,{text:"An input for a date, a time or both. Users can type through a mask in the locale's order, or pick from a calendar and a list of times. `min`, `max` and `disabledDates` apply to both methods.",runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(n);let r=o(i,{anchor:`import`,title:`Import`,runover:{},childs:[o(t,{code:`
import { DateBox } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let c=o(i,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[o(a,{files:D(`Programmatic.tsx`),runover:{},childs:[o(b,{runover:{},childs:[]})]})]});e.controls.add(c);let u=o(i,{anchor:`locale`,title:`Locales`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:`The mask follows the locale, including the order of day, month and year and the separators. Month and day names in the calendar and the first day of the week also come from the locale.`,runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:D(`Locales.tsx`),runover:{},childs:[o(w,{runover:{},childs:[]})]})]});e.controls.add(u);let d=o(i,{anchor:`types`,title:`Time and date with time`,runover:{},childs:[o(a,{files:D(`TimeAndDate.tsx`),runover:{},childs:[o(E,{runover:{},childs:[]})]})]});e.controls.add(d);let f=o(i,{anchor:`limits`,title:`Limits and validation`,runover:{},childs:[o(a,{files:D(`Limits.tsx`),runover:{},childs:[o(C,{runover:{},childs:[]})]})]});e.controls.add(f);let p=o(i,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[o(l,{head:[`Key`,`Description`],rows:k,runover:{},childs:[]})]});e.controls.add(p);let m=o(i,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[o(l,{head:[`Topic`,`Details`],rows:A,runover:{},childs:[]})]});e.controls.add(m);let h=o(i,{anchor:`i18n`,title:`Localization`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"Button names and messages come from `uiLocale.strings`. Dates and names come from `locale`.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:D(`Localization.tsx`),runover:{},childs:[o(T,{runover:{},childs:[]})]})]});e.controls.add(h);let g=o(i,{anchor:`styling`,title:`Styling`,runover:{},childs:[o(l,{head:[`Hook`,`Description`],rows:[[`.mx-date-box`,'Added to the field; `data-type="date|time|datetime"`.'],[`.mx-date-box__toggle, .mx-date-box__clear`,`The picker and clear buttons.`],[`.mx-date-box__popup, .mx-date-box__times`,`The picker and its list of times.`],[`date-box.times, date-box.popup-gap, date-box.calendar`,"The list of times (a unit: `focus`, `beside`), the space between the field and its popup, and the calendar as it appears in the popup (a place). Everything else comes from `field.*` and `calendar.*`."]],runover:{},childs:[]})]});e.controls.add(g);let _=o(i,{anchor:`api`,title:`API reference`,runover:{},childs:[o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Prop`,`Type`,`Default`,`Description`],rows:O,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Properties, methods, events`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Member`,`Description`],rows:[[`unfinished`,`Indicates that the typed text is not yet a complete, valid date.`],[`opened, open(), close()`,`The picker.`],[`clear()`,`Clears the value.`],[`inputElement`,"The native `<input>`."],[`onValueChanged, onOpened, onClosed, onValidated`,`These work the same way as in DropDown and TextBox.`]],runover:{},childs:[]}),o(`p`,{initializeComponent:e=>{let t=o(s,{text:"The date helpers are shared: `datePatternOf(locale, kind)`, `dateToDigits`, `digitsToDate`.",runover:{},childs:[]});e.controls.add(t)}},1)]});e.controls.add(_)}}})}export{j as default};