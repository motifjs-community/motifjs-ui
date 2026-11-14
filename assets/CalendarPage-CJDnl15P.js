import{Qn as e,Zn as t,er as n,n as r}from"./next-id-CtzpBrBT.js";import{t as i}from"./Calendar-CL375os2.js";import{t as a}from"./Stack-wRt1e9tO.js";import{a as o,i as s,n as c,r as l,t as u}from"./docs-B_LZlyP5.js";import{t as d}from"./sources-BXVvOiIY.js";var f=`import { Calendar } from '@motifx-community/ui';\r
\r
/** No day before today and no Sunday, in Turkish. */\r
export default function Limits() {\r
  return <Calendar min={new Date()} disabledDates={(d: Date) => d.getDay() === 0} locale="tr-TR" />;\r
}\r
`,p=`import { reactive } from '@motifx/core';\r
import { Button, Calendar, Stack } from '@motifx-community/ui';\r
\r
/** A calendar bound with x-model, and calendars created with \`new\`, added programmatically and moved to a month. */\r
export default function Programmatic() {\r
  const form = reactive({ day: new Date() as Date | null, result: '' });\r
  let host: Stack | null = null;\r
\r
  const addProgrammatic = () => {\r
    const calendar = new Calendar({ locale: 'tr-TR' });\r
    calendar.onValueChanged((e) => (form.result = e.value ? e.value.toDateString() : '—'));\r
    host?.controls.add(calendar);\r
    calendar.goTo(new Date(2027, 0, 1));\r
  };\r
\r
  return (\r
    <>\r
      <Calendar x-model={() => form.day} showWeekNumbers showTodayButton />\r
      <output class="cal-day">{() => (form.day ? form.day.toDateString() : '—')}</output>\r
      <Button text="Add a calendar programmatically" variant="outline" onclick={addProgrammatic} />\r
      <output class="cal-made">{() => form.result}</output>\r
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />\r
    </>\r
  );\r
}\r
`,m=`import { reactive } from '@motifx/core';\r
import { Button, Calendar, Stack, type CalendarView } from '@motifx-community/ui';\r
\r
const views: CalendarView[] = ['month', 'year', 'decade'];\r
\r
/** The view set from state, and a calendar whose choice is a month. */\r
export default function Views() {\r
  const s = reactive({ view: 'month' as CalendarView, month: null as Date | null });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="View">\r
        {views.map((view) => (\r
          <Button key={view} text={view} size="sm" variant={() => (s.view === view ? 'solid' : 'ghost')} aria-pressed={() => s.view === view} onclick={() => (s.view = view)} />\r
        ))}\r
      </Stack>\r
      <Calendar currentView={() => s.view} />\r
      <Calendar minView="year" x-model={() => s.month} />\r
      <output>{() => (s.month ? s.month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : '—')}</output>\r
    </>\r
  );\r
}\r
`;function h(){let o=n({day:new Date,result:``}),s=null,c=()=>{let e=new i({locale:`tr-TR`});e.onValueChanged(e=>o.result=e.value?e.value.toDateString():`—`),s?.controls.add(e),e.goTo(new Date(2027,0,1))};return e({initializeComponent:e=>{{let n=t(i,{showWeekNumbers:!0,showTodayButton:!0,runover:{initializeComponent:e=>{e.bindings.model(()=>o.day,e=>{let t=o;t!=null&&typeof t.day!=`function`&&(t.day=e)})}},childs:[]});e.controls.add(n);let l=t(`output`,{initializeComponent:e=>{e.class.add(`cal-day`),e.bindings.ternary(()=>o.day,e=>{e.navigate(t(`text`,{initializeComponent:e=>{e.bindings.add(`textContent`,()=>{let e;if(o&&o.day&&o.day.toDateString&&(e=o.day.toDateString())!=null)return typeof e==`function`?e():()=>o.day.toDateString()})}},1))},e=>{e.navigate(t(`text`,{initializeComponent:e=>{e.setText(`—`)}},1))})}},1);e.controls.add(l);let u=t(r,{text:`Add a calendar programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,c)}},childs:[]});e.controls.add(u);let d=t(`output`,{initializeComponent:e=>{e.class.add(`cal-made`),e.bindings.method(()=>o.result)}},1);e.controls.add(d);let f=t(a,{orientation:`horizontal`,wrap:!0,align:`center`,ref:e=>s=e,runover:{},childs:[]});e.controls.add(f)}}})}function g(){return t(i,{min:new Date,disabledDates:e=>e.getDay()===0,locale:`tr-TR`,runover:{},childs:[]})}var _=[`month`,`year`,`decade`];function v(){let o=n({view:`month`,month:null});return e({initializeComponent:e=>{{let n=t(a,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`View`,runover:{},childs:[t({initializeComponent:e=>{e.bindings.list(()=>_??[],e=>t(r,{indexkey:()=>e,text:e,size:`sm`,variant:()=>o.view===e?`solid`:`ghost`,"aria-pressed":()=>o.view===e,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>o.view=e)}},childs:[]}))}})]});e.controls.add(n);let s=t(i,{currentView:()=>o.view,runover:{},childs:[]});e.controls.add(s);let c=t(i,{minView:`year`,runover:{initializeComponent:e=>{e.bindings.model(()=>o.month,e=>{let t=o;t!=null&&typeof t.month!=`function`&&(t.month=e)})}},childs:[]});e.controls.add(c);let l=t(`output`,{initializeComponent:e=>{e.bindings.ternary(()=>o.month,e=>{e.navigate(t(`text`,{initializeComponent:e=>{e.bindings.add(`textContent`,()=>{let e;if(o&&o.month&&o.month.toLocaleDateString&&(e=o.month.toLocaleDateString(void 0,{month:`long`,year:`numeric`}))!=null)return typeof e==`function`?e():()=>o.month.toLocaleDateString(void 0,{month:`long`,year:`numeric`})})}},1))},e=>{e.navigate(t(`text`,{initializeComponent:e=>{e.setText(`—`)}},1))})}},1);e.controls.add(l)}}})}var y=d(Object.assign({"./examples/Limits.tsx":f,"./examples/Programmatic.tsx":p,"./examples/Views.tsx":m})),b=[[`value`,"`Bind<Date | null>`","`null`","The selected date. `x-model` provides two-way binding."],[`min / max`,"`Bind<Date | null>`",`—`,`Days outside these limits cannot be selected, and the arrow keys stop there.`],[`disabledDates`,"`Bind<(date) => boolean>`",`—`,`Days that cannot be selected.`],[`locale`,"`Bind<string>`",`From the page`,`Sets the month and day names and the first day of the week.`],[`firstDayOfWeek`,"`Bind<number | null>`",`From the locale`,`0 (Sunday) through 6 (Saturday).`],[`showWeekNumbers`,"`Bind<boolean>`","`false`",`Shows ISO week numbers before each week.`],[`showOtherMonths`,"`Bind<boolean>`","`true`",`Shows days from the previous and next months.`],[`showTodayButton`,"`Bind<boolean>`","`false`",`Shows a Today button below the grid.`],[`currentView`,"`Bind<'month' | 'year' | 'decade'>`","`'month'`",`The current view. The title zooms out, and a selection zooms in.`],[`minView`,"`Bind<CalendarView>`","`'month'`","The view a selection is made in: `year` selects a month, and `decade` selects a year."]],x=[[`Left / Right`,`Moves to the previous or next day, mirrored on right-to-left pages. In the other views, moves by month or year.`],[`Up / Down`,`Moves to the same day one week earlier or later. In the other views, moves by four months or years.`],[`Home / End`,`Moves to the first or last day of the week. In the other views, moves to the start or end of the row.`],[`Page Up / Page Down`,`Moves to the previous or next month, or by a year with Shift. In the other views, moves by a year or a decade.`],[`Enter, Space`,`Selects the day. In the other views, opens the month or year.`]];function S(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(l,{text:`A month view for selecting a date, with year and decade views for quick navigation. It serves as the DateBox picker and can also be used on its own.`,runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(s,{anchor:`import`,title:`Import`,runover:{},childs:[t(o,{code:`
import { Calendar } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(s,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[t(c,{files:y(`Programmatic.tsx`),runover:{},childs:[t(h,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(s,{anchor:`limits`,title:`Limits`,runover:{},childs:[t(c,{files:y(`Limits.tsx`),runover:{},childs:[t(g,{runover:{},childs:[]})]})]});e.controls.add(a);let d=t(s,{anchor:`views`,title:`Views`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"Clicking the title zooms out to the months of the year and then to twelve years, and making a selection zooms back in. `minView` makes a month or a year the final selection.",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{files:y(`Views.tsx`),runover:{},childs:[t(v,{runover:{},childs:[]})]})]});e.controls.add(d);let f=t(s,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[t(u,{head:[`Key`,`Description`],rows:x,runover:{},childs:[]})]});e.controls.add(f);let p=t(s,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(u,{head:[`Topic`,`Details`],rows:[[`Pattern`,'The APG date picker grid: `role="grid"`, one Tab stop on the focused day, and arrow keys inside.'],[`Cells`,'Each day has a full name ("Sunday, 25 October 2026"), with `aria-selected`, `aria-current="date"` for today and `aria-disabled`.'],[`Header`,"Weekday names carry their full form in `abbr`. The title is a live region, so a new month is announced."],[`Buttons`,"The previous and next buttons get names from `uiLocale` for the current view."]],runover:{},childs:[]})]});e.controls.add(p);let m=t(s,{anchor:`styling`,title:`Styling`,runover:{},childs:[t(u,{head:[`Hook`,`Description`],rows:[[`.mx-calendar`,'`data-view="month|year|decade"`.'],[`.mx-calendar__header, __previous, __title, __next`,`The header.`],[`.mx-calendar__cell`,"`aria-selected`, `aria-disabled`, `data-today`, `data-outside`."],[`calendar.container, header, title, nav, nav-icon, weekday, week, cell, ring, foot, today`,"Units: every part in each state (for a cell: `block`, `hover`, `pressed`, `focus`, `outside`, `today`, `selected`, `disabled` …)."],[`calendar.day-size, calendar.view-cell-width-scale, calendar.view-cell-height-scale, calendar.previous-rotate, calendar.next-rotate`,`The size of a day, which the grid is built on, the cells of the zoomed-out views, and the arrow rotation.`]],runover:{},childs:[]})]});e.controls.add(m);let _=t(s,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(l,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(u,{head:[`Prop`,`Type`,`Default`,`Description`],rows:b,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(l,{text:`Properties, methods, events`,runover:{},childs:[]});e.controls.add(n)}},1),t(u,{head:[`Member`,`Description`],rows:[[`focusedDate`,`The day with the Tab stop, whose month is on screen.`],[`goTo(date)`,`Shows the month of a date.`],[`canChoose(date)`,`Indicates whether a day can be selected.`],[`focus()`,`Sets focus on the day with the Tab stop.`],[`onValueChanged(e)`,"`{ value, previousValue, byUser, source, event? }`."]],runover:{},childs:[]})]});e.controls.add(_)}}})}export{S as default};