var e=`import { BarGauge } from '@motifx-community/ui';\r
\r
/** Four ratings against the same scale, each written at the end of its bar. */\r
export default function Basic() {\r
    return <BarGauge class="bg-basic" data={[47.3, 65.3, 84.6, 71.9]} format={{ style: 'unit', unit: 'percent', maximumFractionDigits: 1 }} label="Ratings" />;\r
}\r
`,t=`import { BarGauge } from '@motifx-community/ui';\r
\r
const mm = (v: number) => \`\${v.toFixed(2)} mm\`;\r
\r
/** Deviations from a measure: the bars start at 0 and go either way. */\r
export default function BothWays() {\r
    return <BarGauge class="bg-both" data={[-2.13, 1.48, -3.09, 4.52, 3.9]} min={-5} max={5} baseValue={0} format={mm} label="Deviations of the parts" />;\r
}\r
`,n=`import { reactive } from '@motifx/core';\r
import { BarGauge, CheckBox, Stack } from '@motifx-community/ui';\r
\r
/** As many bars as goods chosen. Each row keeps its own color, so a bar does not change color when another goes. */\r
export default function Changing() {\r
    const goods = reactive([\r
        { name: 'Hammers', count: 41, color: 'var(--mx-color-chart-series-1)', on: true },\r
        { name: 'Shovels', count: 32, color: 'var(--mx-color-chart-series-2)', on: true },\r
        { name: 'Ladders', count: 13, color: 'var(--mx-color-chart-series-3)', on: true },\r
        { name: 'Watering cans', count: 48, color: 'var(--mx-color-chart-series-4)', on: true },\r
        { name: 'Screwdrivers', count: 24, color: 'var(--mx-color-chart-series-5)', on: true },\r
        { name: 'Drills', count: 19, color: 'var(--mx-color-chart-series-6)', on: true }\r
    ]);\r
    return (\r
        <Stack orientation="horizontal" gap="xl" wrap align="center">\r
            <BarGauge class="bg-changing" data={() => goods.filter(g => g.on)} valueField="count" nameField="name" colorField="color" max={50}\r
                label="Goods sold" legend />\r
            <Stack gap="sm">\r
                {goods.map(g => (\r
                    <CheckBox label={g.name} x-model={() => g.on} />\r
                ))}\r
            </Stack>\r
        </Stack>\r
    );\r
}\r
`,r=`import { BarGauge, Stack } from '@motifx-community/ui';\r
\r
const VALUES = [72, 54, 38];\r
\r
/** Quarters turned to each corner, for a gauge in the corner of a card. */\r
export default function Directions() {\r
    return (\r
        <Stack orientation="horizontal" gap="xl" wrap align="center">\r
            <BarGauge data={VALUES} angle={90} rotation={-45} size={180} label="Upper left" />\r
            <BarGauge data={VALUES} angle={90} rotation={45} size={180} label="Upper right" />\r
            <BarGauge data={VALUES} angle={90} rotation={135} size={180} label="Lower right" />\r
            <BarGauge data={VALUES} angle={90} rotation={-135} size={180} label="Lower left" />\r
        </Stack>\r
    );\r
}\r
`,i=`import { BarGauge, Stack } from '@motifx-community/ui';\r
\r
const points = (v: number) => \`\${v} pts\`;\r
\r
/** Values as a percentage with one decimal, and through a function of your own. */\r
export default function Formats() {\r
    return (\r
        <Stack orientation="horizontal" gap="xl" wrap align="center">\r
            <BarGauge data={[0.473, 0.653, 0.846]} max={1} format={{ style: 'percent', maximumFractionDigits: 1 }} label="Shares" />\r
            <BarGauge class="bg-points" data={[38, 52, 71]} format={points} label="Scores" />\r
        </Stack>\r
    );\r
}\r
`,a=`import { BarGauge } from '@motifx-community/ui';\r
\r
const RIDERS = [\r
    { name: 'Rider 1', speed: 121.4 },\r
    { name: 'Rider 2', speed: 135.4 },\r
    { name: 'Rider 3', speed: 115.9 },\r
    { name: 'Rider 4', speed: 141.1 },\r
    { name: 'Rider 5', speed: 127.5 }\r
];\r
\r
/** Rows read through their fields, named in a legend; the bar under the pointer shows its name and value. */\r
export default function Legend() {\r
    return (\r
        <BarGauge class="bg-legend" data={RIDERS} valueField="speed" nameField="name" max={200} showLabels={false} legend\r
            format={{ style: 'unit', unit: 'kilometer-per-hour' }} label="Average speed" />\r
    );\r
}\r
`,o=`import { reactive } from '@motifx/core';\r
import { BarGauge, Button, Stack } from '@motifx-community/ui';\r
\r
const walk = (v: number) => Math.max(5, Math.min(95, v + Math.round(Math.random() * 20 - 10)));\r
\r
/** New values every second for each line of production. Each change moves over the motion of the design language. */\r
export default function LiveBars() {\r
    const s = reactive({ running: true, lines: [{ name: 'Line A', load: 64 }, { name: 'Line B', load: 41 }, { name: 'Line C', load: 78 }] });\r
    const timer = setInterval(() => {\r
        if (s.running) s.lines = s.lines.map(l => ({ ...l, load: walk(l.load) }));\r
    }, 1000);\r
    return (\r
        <Stack gap="md" align="start" onDisposing={() => clearInterval(timer)}>\r
            <BarGauge class="bg-live" data={() => s.lines} valueField="load" nameField="name" legend format={{ style: 'unit', unit: 'percent' }} label="Load" />\r
            <Button text={() => (s.running ? 'Pause' : 'Go on')} variant="outline" onclick={() => (s.running = !s.running)} />\r
        </Stack>\r
    );\r
}\r
`,s=`import { BarGauge } from '@motifx-community/ui';\r
\r
const SKILLS = [\r
    { name: 'Reading', value: 82 },\r
    { name: 'Writing', value: 64 },\r
    { name: 'Listening', value: 91 },\r
    { name: 'Speaking', value: 58 },\r
    { name: 'Grammar', value: 73 },\r
    { name: 'Vocabulary', value: 69 },\r
    { name: 'Spelling', value: 77 },\r
    { name: 'Pronunciation', value: 61 }\r
];\r
\r
/** Eight bars: they grow thinner so the middle stays open. */\r
export default function Many() {\r
    return <BarGauge class="bg-many" data={SKILLS} valueField="value" nameField="name" size={260} showLabels={false} legend label="Skills" />;\r
}\r
`,c=`import { Component } from '@motifx/core';\r
import { BarGauge, Button, Stack } from '@motifx-community/ui';\r
\r
/** A bar gauge created programmatically. Each prop is also a property that can be set later. */\r
export default class Programmatic extends Component<HTMLDivElement> {\r
    constructor() {\r
        super('div');\r
        const gauge = new BarGauge({ data: [42, 67], label: 'Goals' });\r
        const add = new Button({ text: 'Add a bar', variant: 'outline', onclick: () => (gauge.data = [...gauge.data, Math.round(20 + Math.random() * 70)]) });\r
        const legend = new Button({ text: 'Legend on or off', variant: 'outline', onclick: () => (gauge.legend = !gauge.legend) });\r
        const buttons = new Stack({ orientation: 'horizontal', gap: 'sm', wrap: true });\r
        buttons.controls.add(add, legend);\r
        const stack = new Stack({ gap: 'md', align: 'start' });\r
        stack.controls.add(gauge, buttons);\r
        this.controls.add(stack);\r
    }\r
}\r
`,l=`import { BarGauge } from '@motifx-community/ui';\r
\r
interface Team {\r
    team: string;\r
    done: number;\r
    planned: number;\r
}\r
\r
const TEAMS: Team[] = [\r
    { team: 'Design', done: 18, planned: 24 },\r
    { team: 'Web', done: 31, planned: 36 },\r
    { team: 'Mobile', done: 12, planned: 30 }\r
];\r
\r
/** Rows read through fields: the value is worked out by a function, the share of the work done. */\r
export default function Rows() {\r
    return (\r
        <BarGauge<Team> class="bg-rows" data={TEAMS} valueField={t => Math.round((t.done / t.planned) * 100)} nameField="team" legend\r
            format={{ style: 'unit', unit: 'percent' }} label="Work done" />\r
    );\r
}\r
`,u=`import { BarGauge, Stack } from '@motifx-community/ui';\r
\r
const VALUES = [72, 54, 38];\r
\r
/** A whole circle, a half that opens downward, and a half turned to the right. */\r
export default function Shapes() {\r
    return (\r
        <Stack orientation="horizontal" gap="xl" wrap align="center">\r
            <BarGauge class="bg-circle" data={VALUES} angle={360} size={160} label="Whole circle" />\r
            <BarGauge class="bg-half" data={VALUES} angle={180} size={180} label="Half" />\r
            <BarGauge class="bg-side" data={VALUES} angle={180} rotation={90} size={160} label="Half turned" />\r
        </Stack>\r
    );\r
}\r
`;export{o as a,r as c,e as d,s as i,n as l,l as n,a as o,c as r,i as s,u as t,t as u};