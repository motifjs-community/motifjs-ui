import{Qn as e,Zn as t}from"./next-id-CtzpBrBT.js";import{t as n}from"./Sparkline-DuCXMd2u.js";import{t as r}from"./Stack-wRt1e9tO.js";import{a as i,i as a,n as o,r as s,t as c}from"./docs-B_LZlyP5.js";import{t as l}from"./sources-BXVvOiIY.js";var u=`import { Sparkline, Stack } from '@motifx-community/ui';\r
\r
const VALUES = [4, 6, 5, 8, 7, 9, 6, 10, 9, 12, 11, 13];\r
const RESULTS = [1, -1, 1, 1, -1, 1, -1, -1, 1, 1, 1, -1];\r
\r
/** A line, an area, bars, and wins and losses. */\r
export default function Kinds() {\r
    return (\r
        <Stack gap="md">\r
            <span class="sp-line">Line <Sparkline data={VALUES} label="Line" /></span>\r
            <span class="sp-area">Area <Sparkline type="area" data={VALUES} label="Area" /></span>\r
            <span class="sp-bar">Bars <Sparkline type="bar" data={VALUES} label="Bars" /></span>\r
            <span class="sp-winloss">Wins and losses <Sparkline type="winloss" data={RESULTS} label="Results" /></span>\r
        </Stack>\r
    );\r
}\r
`,d=`import { Sparkline, Stack } from '@motifx-community/ui';\r
\r
const TEMPERATURE = [12, 14, 13, 17, 21, 19, 16, 15, 18, 22, 20, 17];\r
\r
/** The lowest and the highest value marked, and a line at the average. */\r
export default function Marks() {\r
    return (\r
        <Stack gap="md">\r
            <span class="sp-marks">\r
                Temperature <Sparkline data={TEMPERATURE} highlight={['min', 'max', 'last']} reference="average" format={{ style: 'unit', unit: 'celsius' }} label="Temperature" height={32} />\r
            </span>\r
        </Stack>\r
    );\r
}\r
`,f=`import { Sparkline } from '@motifx-community/ui';\r
\r
const ROWS = [\r
    { name: 'Visits', now: '12,480', week: [9.1, 9.8, 10.2, 9.7, 11.3, 11.9, 12.5] },\r
    { name: 'Orders', now: '1,184', week: [1320, 1290, 1250, 1270, 1210, 1190, 1184] },\r
    { name: 'Returns', now: '38', week: [41, 39, 44, 37, 40, 36, 38] }\r
];\r
\r
/** A trend beside each number, in a row of text. The last value is marked. */\r
export default function Trends() {\r
    return (\r
        <table class="sp-table">\r
            <tbody>\r
                {ROWS.map((row) => (\r
                    <tr>\r
                        <th scope="row">{row.name}</th>\r
                        <td>{row.now}</td>\r
                        <td>\r
                            <Sparkline data={row.week} label={\`\${row.name} this week\`} />\r
                        </td>\r
                    </tr>\r
                ))}\r
            </tbody>\r
        </table>\r
    );\r
}\r
`,p=[4,6,5,8,7,9,6,10,9,12,11,13],m=[1,-1,1,1,-1,1,-1,-1,1,1,1,-1];function h(){return t(r,{gap:`md`,runover:{},childs:[t(`span`,{initializeComponent:e=>{e.class.add(`sp-line`);let r=t(`text`,{initializeComponent:e=>{e.setText(`Line `)}},1);e.controls.add(r);let i=t(n,{data:p,label:`Line`,runover:{},childs:[]});e.controls.add(i)}},1),t(`span`,{initializeComponent:e=>{e.class.add(`sp-area`);let r=t(`text`,{initializeComponent:e=>{e.setText(`Area `)}},1);e.controls.add(r);let i=t(n,{type:`area`,data:p,label:`Area`,runover:{},childs:[]});e.controls.add(i)}},1),t(`span`,{initializeComponent:e=>{e.class.add(`sp-bar`);let r=t(`text`,{initializeComponent:e=>{e.setText(`Bars `)}},1);e.controls.add(r);let i=t(n,{type:`bar`,data:p,label:`Bars`,runover:{},childs:[]});e.controls.add(i)}},1),t(`span`,{initializeComponent:e=>{e.class.add(`sp-winloss`);let r=t(`text`,{initializeComponent:e=>{e.setText(`Wins and losses `)}},1);e.controls.add(r);let i=t(n,{type:`winloss`,data:m,label:`Results`,runover:{},childs:[]});e.controls.add(i)}},1)]})}var g=[12,14,13,17,21,19,16,15,18,22,20,17];function _(){return t(r,{gap:`md`,runover:{},childs:[t(`span`,{initializeComponent:e=>{e.class.add(`sp-marks`);let r=t(`text`,{initializeComponent:e=>{e.setText(`Temperature `)}},1);e.controls.add(r);let i=t(n,{data:g,highlight:[`min`,`max`,`last`],reference:`average`,format:{style:`unit`,unit:`celsius`},label:`Temperature`,height:32,runover:{},childs:[]});e.controls.add(i)}},1)]})}var v=[{name:`Visits`,now:`12,480`,week:[9.1,9.8,10.2,9.7,11.3,11.9,12.5]},{name:`Orders`,now:`1,184`,week:[1320,1290,1250,1270,1210,1190,1184]},{name:`Returns`,now:`38`,week:[41,39,44,37,40,36,38]}];function y(){return t(`table`,{initializeComponent:e=>{e.class.add(`sp-table`);let r=t(`tbody`,{initializeComponent:e=>{let r=t({initializeComponent:e=>{e.bindings.list(()=>v??[],e=>t(`tr`,{initializeComponent:r=>{let i=t(`th`,{initializeComponent:n=>{n.attr.add({scope:`row`});let r=t(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,e,`name`)},__childExpr:()=>e.name});n.controls.add(r)}},1);r.controls.add(i);let a=t(`td`,{initializeComponent:n=>{let r=t(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,e,`now`)},__childExpr:()=>e.now});n.controls.add(r)}},1);r.controls.add(a);let o=t(`td`,{initializeComponent:r=>{let i=t(n,{data:e.week,label:`${e.name} this week`,runover:{},childs:[]});r.controls.add(i)}},1);r.controls.add(o)}},1))}});e.controls.add(r)}},1);e.controls.add(r)}},1)}var b=l(Object.assign({"./examples/Kinds.tsx":u,"./examples/Marks.tsx":d,"./examples/Trends.tsx":f})),x=[[`data`,"`Bind<number[] | T[] | null>`","`null`","The values: numbers, or rows with `yField`. They are read and never changed."],[`yField`,"`Bind<string | (row) => unknown>`","`null`",`The field of a row that holds its value.`],[`type`,"`Bind<'line' | 'area' | 'bar' | 'winloss'>`","`'line'`",`How it draws.`],[`highlight`,"`Bind<('first' | 'last' | 'min' | 'max')[]>`","`['last']` for a line or an area",`The values marked with a dot.`],[`reference`,"`Bind<number | 'average' | null>`","`null`",`A line across at a value, or at the average.`],[`min, max`,"`Bind<number | null>`",`From the values`,`The ends of its scale.`],[`smooth`,"`Bind<boolean>`","`false`",`Curves the line, never past the values it joins.`],[`color`,"`Bind<string | null>`",`The first chart color`,`A color of your own.`],[`label`,"`Bind<string>`",`A kit string`,`What the values are, for the accessible name.`],[`format`,"`Bind<ChartFormat | null>`",`The language's numbers`,`How a value reads.`],[`tooltip`,"`Bind<boolean>`","`true`",`The value under the pointer shows above it.`],[`height`,"`Bind<number | null>`",`From the design language`,`The height in pixels.`]],S=[[`Name`,"It has the role `img`, and its name gives the number of values, the first and the last, the lowest and the highest."],[`Pointer`,`The value under the pointer is a reading aid only: the name already holds the values that matter.`],[`Wins and losses`,`Up and down differ in direction as well as in color.`]];function C(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(s,{text:`A chart the size of a word, for a trend beside a number, in a sentence or in a row of a table. It draws a line, an area, bars, or wins and losses, and marks the values that matter.`,runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(a,{anchor:`import`,title:`Import`,runover:{},childs:[t(i,{code:`
import { Sparkline } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let l=t(a,{anchor:`trends`,title:`Trends beside numbers`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(s,{text:"`data` takes numbers, or rows with `yField`. The last value is marked by default, and the accessible name sums the values up.",runover:{},childs:[]});e.controls.add(n)}},1),t(o,{files:b(`Trends.tsx`),runover:{},childs:[t(y,{runover:{},childs:[]})]})]});e.controls.add(l);let u=t(a,{anchor:`kinds`,title:`Kinds`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(s,{text:"`type` draws a line, an area, bars, or wins and losses, which show only whether each value went up or down.",runover:{},childs:[]});e.controls.add(n)}},1),t(o,{files:b(`Kinds.tsx`),runover:{},childs:[t(h,{runover:{},childs:[]})]})]});e.controls.add(u);let d=t(a,{anchor:`marks`,title:`Marked values and an average`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(s,{text:"`highlight` marks the first, last, lowest or highest value, and `reference` draws a line at a value or at the average. The value under the pointer shows above it.",runover:{},childs:[]});e.controls.add(n)}},1),t(o,{files:b(`Marks.tsx`),runover:{},childs:[t(_,{runover:{},childs:[]})]})]});e.controls.add(d);let f=t(a,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(s,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(c,{head:[`Prop`,`Type`,`Default`,`Description`],rows:x,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(s,{text:`Accessibility`,runover:{},childs:[]});e.controls.add(n)}},1),t(c,{head:[`Topic`,`Details`],rows:S,runover:{},childs:[]})]});e.controls.add(f)}}})}export{C as default};