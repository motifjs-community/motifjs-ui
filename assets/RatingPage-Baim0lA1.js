import{Qn as e,Zn as t,er as n}from"./next-id-CtzpBrBT.js";import{t as r}from"./Rating-CADJTI7b.js";import{t as i}from"./Stack-wRt1e9tO.js";import{a,i as o,n as s,r as c,t as l}from"./docs-B_LZlyP5.js";import{t as u}from"./sources-BXVvOiIY.js";var d=`import { Rating } from '@motifx-community/ui';\r
\r
// A custom heart as image addresses: an outline and a filled version, drawn in the star colors.\r
const svg = (body: string) => \`data:image/svg+xml,\${encodeURIComponent(\`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">\${body}</svg>\`)}\`;\r
const HEART = 'M8 13.5S2 10 2 5.75A2.75 2.75 0 0 1 8 4.5a2.75 2.75 0 0 1 6 1.25C14 10 8 13.5 8 13.5z';\r
const EMPTY = svg(\`<path d="\${HEART}" fill="none" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>\`);\r
const FILLED = svg(\`<path d="\${HEART}" fill="black"/>\`);\r
\r
/** Custom icons: a name from the kit's set, or an image address. */\r
export default function Icons() {\r
  return <Rating label="How much do you like it?" emptyIcon={EMPTY} filledIcon={FILLED} value={3} />;\r
}\r
`,f=`import { Rating, Stack, type ControlSize, type RatingTone } from '@motifx-community/ui';\r
\r
const SIZES: ControlSize[] = ['sm', 'md', 'lg'];\r
const TONES: RatingTone[] = ['accent', 'neutral'];\r
\r
/** Halves, each size and tone, and a score only shown (\`readOnly\`). */\r
export default function Looks() {\r
  return (\r
    <Stack gap="lg">\r
      <Rating label="By halves" step={0.5} value={3.5} />\r
      {SIZES.map((size) => (\r
        <Rating key={size} label={\`Size \${size}\`} size={size} value={4} />\r
      ))}\r
      {TONES.map((tone) => (\r
        <Rating key={tone} label={\`Tone \${tone}\`} tone={tone} value={2} />\r
      ))}\r
      <Rating label="Shown only" readOnly step={0.5} value={4.5} />\r
      <Rating label="Disabled" disabled value={3} />\r
    </Stack>\r
  );\r
}\r
`,p=`import { reactive } from '@motifx/core';\r
import { Rating, Stack } from '@motifx-community/ui';\r
\r
/** A rating bound with \`x-model\`, with a label and help text like any field, and one created with \`new\` programmatically. */\r
export default function Programmatic() {\r
  const s = reactive({ stars: 3 as number | null });\r
  const coded = new Rating({ label: 'Made in code', max: 10, value: 7 });\r
\r
  return (\r
    <Stack gap="lg">\r
      <Rating label="Your rating" x-model={() => s.stars} helpText={() => (s.stars ? \`You gave \${s.stars}\` : 'Not rated yet')} />\r
      <span onConfig={(c) => c.controls.add(coded)} />\r
    </Stack>\r
  );\r
}\r
`;function m(){let e=n({stars:3}),a=new r({label:`Made in code`,max:10,value:7});return t(i,{gap:`lg`,runover:{},childs:[t(r,{label:`Your rating`,helpText:()=>e.stars?`You gave ${e.stars}`:`Not rated yet`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.stars,t=>{let n=e;n!=null&&typeof n.stars!=`function`&&(n.stars=t)})}},childs:[]}),t(`span`,{onConfig:e=>e.controls.add(a)})]})}var h=e=>`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${e}</svg>`)}`,g=`M8 13.5S2 10 2 5.75A2.75 2.75 0 0 1 8 4.5a2.75 2.75 0 0 1 6 1.25C14 10 8 13.5 8 13.5z`,_=h(`<path d="${g}" fill="none" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>`),v=h(`<path d="${g}" fill="black"/>`);function y(){return t(r,{label:`How much do you like it?`,emptyIcon:_,filledIcon:v,value:3,runover:{},childs:[]})}var b=[`sm`,`md`,`lg`],x=[`accent`,`neutral`];function S(){return t(i,{gap:`lg`,runover:{},childs:[t(r,{label:`By halves`,step:.5,value:3.5,runover:{},childs:[]}),t({initializeComponent:e=>{e.bindings.list(()=>b??[],e=>t(r,{indexkey:()=>e,label:`Size ${e}`,size:e,value:4,runover:{},childs:[]}))}}),t({initializeComponent:e=>{e.bindings.list(()=>x??[],e=>t(r,{indexkey:()=>e,label:`Tone ${e}`,tone:e,value:2,runover:{},childs:[]}))}}),t(r,{label:`Shown only`,readOnly:!0,step:.5,value:4.5,runover:{},childs:[]}),t(r,{label:`Disabled`,disabled:!0,value:3,runover:{},childs:[]})]})}var C=u(Object.assign({"./examples/Icons.tsx":d,"./examples/Looks.tsx":f,"./examples/Programmatic.tsx":p})),w=[[`value`,"`Bind<number | null>`","`null`","The score, rounded to `step`. `null` means no score. `x-model` provides two-way binding."],[`max`,"`Bind<number>`","`5`",`The number of stars.`],[`step`,"`Bind<1 | 0.5>`","`1`","`0.5` allows half stars, using the first half of a star or the arrow keys."],[`allowClear`,"`Bind<boolean>`","`true`",`Clicking the selected value, or pressing Delete or Backspace, clears the score.`],[`preview`,"`Bind<boolean>`","`true`",`On hover, the stars preview the score a click would set.`],[`tone`,"`Bind<RatingTone>`",`Set by the design language`,"`accent` or `neutral`. For custom gold stars, set the color in `rating.fill.accent.bg`."],[`emptyIcon, filledIcon`,"`Bind<string | null>`",`Set by the design language`,`The shape of an empty and a filled star: a name from the kit's icon set, or an image address (drawn in the star colors).`],[`label, helpText, readOnly, required, rules, size…`,`see Field`,``,`All standard field props, because a rating is a field.`]],T=[[`Arrow keys`,"Increases or decreases the score by one step (by half with `step={0.5}`)."],[`Home, End`,"Sets no stars (the minimum, without `allowClear`), or all stars."],[`1 … 9`,`Sets that number of stars.`],[`Delete, Backspace`,"Clears the score (with `allowClear`)."]],E=[[`Role`,"A `slider` from 0 to `max`, named by its label. The value is announced as “3 of 5” or “Not rated” in the kit language."],[`Read-only`,"`aria-readonly`. The stars only display the score."]],D=[[`.mx-rating`,"The field. `data-tone`, `data-size`, `data-readonly`, `data-disabled`."],[`.mx-rating__stars`,`The row of stars, which is the slider and receives focus.`],[`.mx-rating__item, .mx-rating__star, .mx-rating__fill`,"One star, its empty shape and its filled part (`--_fill`: the filled share)."]],O=[[`rating.stars, rating.item, rating.star, rating.fill`,`Units: the row (focus, disabled), a star growing on hover, the empty shape, and the filled part in each tone.`],[`rating.size.*, rating.gap.*`,`A star and the space between stars, per size.`],[`rating.tone`,`The default tone.`],[`rating.field.*`,`Place: the field below a rating, without a box.`]];function k(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(c,{text:"A row of stars for entering or displaying a score, in whole or half steps. Rating is a field, so the label, help text, rules and `x-model` work the same way as on any other field.",runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(o,{anchor:`import`,title:`Import`,runover:{},childs:[t(a,{code:`
import { Rating } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(o,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(c,{text:"Every prop accepts a value or a function, and `x-model` provides two-way binding for the score. On hover, the stars preview the score a click would set.",runover:{},childs:[]});e.controls.add(n)}},1),t(s,{files:C(`Programmatic.tsx`),runover:{},childs:[t(m,{runover:{},childs:[]})]})]});e.controls.add(i);let u=t(o,{anchor:`looks`,title:`Half stars, sizes and tones`,runover:{},childs:[t(s,{files:C(`Looks.tsx`),runover:{},childs:[t(S,{runover:{},childs:[]})]})]});e.controls.add(u);let d=t(o,{anchor:`icons`,title:`Custom icons`,runover:{},childs:[t(s,{files:C(`Icons.tsx`),runover:{},childs:[t(y,{runover:{},childs:[]})]})]});e.controls.add(d);let f=t(o,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[t(l,{head:[`Key`,`Description`],rows:T,runover:{},childs:[]})]});e.controls.add(f);let p=t(o,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(l,{head:[`Topic`,`Details`],rows:E,runover:{},childs:[]})]});e.controls.add(p);let h=t(o,{anchor:`styling`,title:`Styling`,runover:{},childs:[t(l,{head:[`Hook`,`Description`],rows:D,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(c,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(l,{head:[`Token`,`Description`],rows:O,runover:{},childs:[]})]});e.controls.add(h);let g=t(o,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(c,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(l,{head:[`Prop`,`Type`,`Default`,`Description`],rows:w,runover:{},childs:[]})]});e.controls.add(g)}}})}export{k as default};