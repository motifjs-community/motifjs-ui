import{a as e,an as t,h as n,i as r,n as i,nn as a,r as o,rn as s,t as c}from"./doc-B1CtlCkV.js";import{t as l}from"./Stack-AS0iyAxC.js";import{t as u}from"./Calendar-C4320MsB.js";import{t as d}from"./sources-BXVvOiIY.js";var f=`import { Calendar } from '@motifx-community/ui';\r
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
`;function h(){let e=t({day:new Date,result:``}),r=null,i=()=>{let t=new u({locale:`tr-TR`});t.onValueChanged(t=>e.result=t.value?t.value.toDateString():`—`),r?.controls.add(t),t.goTo(new Date(2027,0,1))};return s({initializeComponent:t=>{{let o=a(u,{showWeekNumbers:!0,showTodayButton:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.day,t=>{let n=e;n!=null&&typeof n.day!=`function`&&(n.day=t)})}},childs:[]});t.controls.add(o);let s=a(`output`,{initializeComponent:t=>{t.class.add(`cal-day`),t.bindings.ternary(()=>e.day,t=>{t.navigate(a(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,()=>{let t;if(e&&e.day&&e.day.toDateString&&(t=e.day.toDateString())!=null)return typeof t==`function`?t():()=>e.day.toDateString()})}},1))},e=>{e.navigate(a(`text`,{initializeComponent:e=>{e.setText(`—`)}},1))})}},1);t.controls.add(s);let c=a(n,{text:`Add a calendar programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]});t.controls.add(c);let d=a(`output`,{initializeComponent:t=>{t.class.add(`cal-made`),t.bindings.method(()=>e.result)}},1);t.controls.add(d);let f=a(l,{orientation:`horizontal`,wrap:!0,align:`center`,ref:e=>r=e,runover:{},childs:[]});t.controls.add(f)}}})}function g(){return a(u,{min:new Date,disabledDates:e=>e.getDay()===0,locale:`tr-TR`,runover:{},childs:[]})}var _=[`month`,`year`,`decade`];function v(){let e=t({view:`month`,month:null});return s({initializeComponent:t=>{{let r=a(l,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`View`,runover:{},childs:[a({initializeComponent:t=>{t.bindings.list(()=>_??[],t=>a(n,{indexkey:()=>t,text:t,size:`sm`,variant:()=>e.view===t?`solid`:`ghost`,"aria-pressed":()=>e.view===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.view=t)}},childs:[]}))}})]});t.controls.add(r);let i=a(u,{currentView:()=>e.view,runover:{},childs:[]});t.controls.add(i);let o=a(u,{minView:`year`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.month,t=>{let n=e;n!=null&&typeof n.month!=`function`&&(n.month=t)})}},childs:[]});t.controls.add(o);let s=a(`output`,{initializeComponent:t=>{t.bindings.ternary(()=>e.month,t=>{t.navigate(a(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,()=>{let t;if(e&&e.month&&e.month.toLocaleDateString&&(t=e.month.toLocaleDateString(void 0,{month:`long`,year:`numeric`}))!=null)return typeof t==`function`?t():()=>e.month.toLocaleDateString(void 0,{month:`long`,year:`numeric`})})}},1))},e=>{e.navigate(a(`text`,{initializeComponent:e=>{e.setText(`—`)}},1))})}},1);t.controls.add(s)}}})}var y=d(Object.assign({"./examples/Limits.tsx":f,"./examples/Programmatic.tsx":p,"./examples/Views.tsx":m})),b=[[`value`,"`Bind<Date | null>`","`null`","The selected date. `x-model` provides two-way binding."],[`min / max`,"`Bind<Date | null>`",`—`,`Days outside these limits cannot be selected, and the arrow keys stop there.`],[`disabledDates`,"`Bind<(date) => boolean>`",`—`,`Days that cannot be selected.`],[`locale`,"`Bind<string>`",`From the page`,`Sets the month and day names and the first day of the week.`],[`firstDayOfWeek`,"`Bind<number | null>`",`From the locale`,`0 (Sunday) through 6 (Saturday).`],[`showWeekNumbers`,"`Bind<boolean>`","`false`",`Shows ISO week numbers before each week.`],[`showOtherMonths`,"`Bind<boolean>`","`true`",`Shows days from the previous and next months.`],[`showTodayButton`,"`Bind<boolean>`","`false`",`Shows a Today button below the grid.`],[`currentView`,"`Bind<'month' | 'year' | 'decade'>`","`'month'`",`The current view. The title zooms out, and a selection zooms in.`],[`minView`,"`Bind<CalendarView>`","`'month'`","The view a selection is made in: `year` selects a month, and `decade` selects a year."]],x=[[`Left / Right`,`Moves to the previous or next day, mirrored on right-to-left pages. In the other views, moves by month or year.`],[`Up / Down`,`Moves to the same day one week earlier or later. In the other views, moves by four months or years.`],[`Home / End`,`Moves to the first or last day of the week. In the other views, moves to the start or end of the row.`],[`Page Up / Page Down`,`Moves to the previous or next month, or by a year with Shift. In the other views, moves by a year or a decade.`],[`Enter, Space`,`Selects the day. In the other views, opens the month or year.`]];function S(){return s({initializeComponent:t=>{{let n=a(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=a(o,{text:`A month view for selecting a date, with year and decade views for quick navigation. It serves as the DateBox picker and can also be used on its own.`,runover:{},childs:[]});e.controls.add(t)}},1);t.controls.add(n);let s=a(r,{anchor:`import`,title:`Import`,runover:{},childs:[a(e,{code:`
import { Calendar } from '@motifx-community/ui';
`,runover:{},childs:[]})]});t.controls.add(s);let l=a(r,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[a(i,{files:y(`Programmatic.tsx`),runover:{},childs:[a(h,{runover:{},childs:[]})]})]});t.controls.add(l);let u=a(r,{anchor:`limits`,title:`Limits`,runover:{},childs:[a(i,{files:y(`Limits.tsx`),runover:{},childs:[a(g,{runover:{},childs:[]})]})]});t.controls.add(u);let d=a(r,{anchor:`views`,title:`Views`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"Clicking the title zooms out to the months of the year and then to twelve years, and making a selection zooms back in. `minView` makes a month or a year the final selection.",runover:{},childs:[]});e.controls.add(t)}},1),a(i,{files:y(`Views.tsx`),runover:{},childs:[a(v,{runover:{},childs:[]})]})]});t.controls.add(d);let f=a(r,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[a(c,{head:[`Key`,`Description`],rows:x,runover:{},childs:[]})]});t.controls.add(f);let p=a(r,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[a(c,{head:[`Topic`,`Details`],rows:[[`Pattern`,'The APG date picker grid: `role="grid"`, one Tab stop on the focused day, and arrow keys inside.'],[`Cells`,'Each day has a full name ("Sunday, 25 October 2026"), with `aria-selected`, `aria-current="date"` for today and `aria-disabled`.'],[`Header`,"Weekday names carry their full form in `abbr`. The title is a live region, so a new month is announced."],[`Buttons`,"The previous and next buttons get names from `uiLocale` for the current view."]],runover:{},childs:[]})]});t.controls.add(p);let m=a(r,{anchor:`styling`,title:`Styling`,runover:{},childs:[a(c,{head:[`Hook`,`Description`],rows:[[`.mx-calendar`,'`data-view="month|year|decade"`.'],[`.mx-calendar__header, __previous, __title, __next`,`The header.`],[`.mx-calendar__cell`,"`aria-selected`, `aria-disabled`, `data-today`, `data-outside`."],[`calendar.container, header, title, nav, nav-icon, weekday, week, cell, ring, foot, today`,"Units: every part in each state (for a cell: `block`, `hover`, `pressed`, `focus`, `outside`, `today`, `selected`, `disabled` …)."],[`calendar.day-size, calendar.view-cell-width-scale, calendar.view-cell-height-scale, calendar.previous-rotate, calendar.next-rotate`,`The size of a day, which the grid is built on, the cells of the zoomed-out views, and the arrow rotation.`]],runover:{},childs:[]})]});t.controls.add(m);let _=a(r,{anchor:`api`,title:`API reference`,runover:{},childs:[a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Prop`,`Type`,`Default`,`Description`],rows:b,runover:{},childs:[]}),a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Properties, methods, events`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Member`,`Description`],rows:[[`focusedDate`,`The day with the Tab stop, whose month is on screen.`],[`goTo(date)`,`Shows the month of a date.`],[`canChoose(date)`,`Indicates whether a day can be selected.`],[`focus()`,`Sets focus on the day with the Tab stop.`],[`onValueChanged(e)`,"`{ value, previousValue, byUser, source, event? }`."]],runover:{},childs:[]})]});t.controls.add(_)}}})}export{S as default};