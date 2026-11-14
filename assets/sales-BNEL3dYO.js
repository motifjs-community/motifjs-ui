var e=`import { Chart } from '@motifx-community/ui';\r
import { SALES } from './sales';\r
\r
/** Areas stacked on each other: the top line is the total. */\r
export default function Areas() {\r
    return (\r
        <Chart\r
            class="ch-areas"\r
            title="Total sales"\r
            data={SALES}\r
            xField="month"\r
            stacked="normal"\r
            series={[\r
                { type: 'area', yField: 'stores', name: 'Stores' },\r
                { type: 'area', yField: 'online', name: 'Online' }\r
            ]}\r
        />\r
    );\r
}\r
`,t=`import { Chart } from '@motifx-community/ui';\r
import { SALES } from './sales';\r
\r
/** One series needs no legend: the title names it. */\r
export default function Basic() {\r
    return <Chart class="ch-basic" title="Online sales" subtitle="By month, in euros" data={SALES} xField="month" series={[{ type: 'bar', yField: 'online', name: 'Online' }]} />;\r
}\r
`,n=`import { reactive } from '@motifx/core';\r
import { ButtonGroup, Chart, Stack, type ChartSeriesType } from '@motifx-community/ui';\r
\r
const PRICES = Array.from({ length: 24 }, (_, i) => {\r
    const open = 100 + Math.round(Math.sin(i / 3) * 12 + i * 0.8);\r
    const close = open + Math.round(Math.cos(i * 1.7) * 6);\r
    return { day: new Date(2026, 9, i + 1), open, close, high: Math.max(open, close) + 2 + (i % 3), low: Math.min(open, close) - 2 - (i % 4) };\r
});\r
\r
/** Four prices a day. A rising candle is hollow and a falling one filled, so they read apart without their colors. */\r
export default function Candles() {\r
    const s = reactive({ type: 'candlestick' as ChartSeriesType });\r
    return (\r
        <Stack class="docs-wide" gap="md">\r
            <ButtonGroup\r
                label="Shape"\r
                x-model={() => s.type}\r
                items={[\r
                    { value: 'candlestick', text: 'Candles' },\r
                    { value: 'ohlc', text: 'OHLC bars' }\r
                ]}\r
            />\r
            <Chart\r
                class="ch-candles"\r
                title="Share price in October"\r
                data={PRICES}\r
                xField="day"\r
                xAxis={{ format: { day: 'numeric' } }}\r
                series={() => [{ type: s.type, openField: 'open', highField: 'high', lowField: 'low', closeField: 'close', name: 'Price' }]}\r
            />\r
        </Stack>\r
    );\r
}\r
`,r=`import { reactive } from '@motifx/core';\r
import { ButtonGroup, Chart, Stack } from '@motifx-community/ui';\r
\r
const START = new Date(2026, 0, 1).getTime();\r
const DAY = 24 * 60 * 60 * 1000;\r
\r
const YEAR = Array.from({ length: 260 }, (_, i) => {\r
    const open = Math.round((120 + Math.sin(i / 18) * 14 + i * 0.12 + Math.sin(i * 2.1) * 2) * 10) / 10;\r
    const close = Math.round((open + Math.cos(i * 1.7) * 3) * 10) / 10;\r
    return { day: new Date(START + i * DAY), open, close, high: Math.max(open, close) + 1 + (i % 3) * 0.5, low: Math.min(open, close) - 1 - (i % 4) * 0.4 };\r
});\r
\r
const LAST = YEAR[YEAR.length - 1].day.getTime();\r
\r
/** A year of prices with zoom on; the buttons zoom to the latest stretch with \`zoomTo\`, and dragging across the plot still works. */\r
export default function CandlesPeriods() {\r
    const s = reactive({ period: 'all' });\r
    let chart!: Chart;\r
    // A zoom of the reader's own, by dragging or the wheel, leaves no button chosen.\r
    let moving = false;\r
    const show = (period: string) => {\r
        const days = { month: 30, quarter: 91 }[period];\r
        moving = true;\r
        if (days) chart.zoomTo(new Date(LAST - days * DAY), new Date(LAST));\r
        else chart.resetZoom();\r
        moving = false;\r
    };\r
    return (\r
        <Stack class="docs-wide" gap="md">\r
            <ButtonGroup\r
                label="Period"\r
                x-model={() => s.period}\r
                onValueChanged={e => e.byUser && show(e.value as string)}\r
                items={[\r
                    { value: 'month', text: '1 month' },\r
                    { value: 'quarter', text: '3 months' },\r
                    { value: 'all', text: 'All' }\r
                ]}\r
            />\r
            <Chart\r
                ref={(x: Chart) => (chart = x)}\r
                class="ch-candles-periods"\r
                title="Share price this year"\r
                data={YEAR}\r
                xField="day"\r
                zoom\r
                series={[{ type: 'candlestick', openField: 'open', highField: 'high', lowField: 'low', closeField: 'close', name: 'Price' }]}\r
                onZoomChanged={e => !moving && (s.period = e.from ? '' : 'all')}\r
            />\r
        </Stack>\r
    );\r
}\r
`,i=`import { Chart, Stack } from '@motifx-community/ui';\r
\r
const DAYS = Array.from({ length: 30 }, (_, i) => {\r
    const open = 48 + Math.round((Math.sin(i / 4) * 5 + i * 0.3) * 10) / 10;\r
    const close = Math.round((open + Math.cos(i * 1.3) * 2.4) * 10) / 10;\r
    const high = Math.round((Math.max(open, close) + 0.6 + (i % 3) * 0.4) * 10) / 10;\r
    const low = Math.round((Math.min(open, close) - 0.6 - (i % 4) * 0.3) * 10) / 10;\r
    return { day: new Date(2026, 8, i + 1), open, close, high, low, volume: Math.round(1.2e6 + Math.abs(close - open) * 6e5 + (i % 5) * 1.5e5) };\r
});\r
\r
const average = Math.round((DAYS.reduce((sum, d) => sum + d.close, 0) / DAYS.length) * 100) / 100;\r
\r
/** Prices and the volume traded: two charts on one time line, never two scales on one plot. A line marks the month's average close. */\r
export default function CandlesVolume() {\r
    return (\r
        <Stack class="docs-wide" gap="sm">\r
            <Chart\r
                class="ch-candles-price"\r
                title="Share price in September"\r
                data={DAYS}\r
                xField="day"\r
                height={260}\r
                xAxis={{ format: { day: 'numeric' } }}\r
                yAxis={{ format: { style: 'currency', currency: 'EUR' } }}\r
                references={[{ value: average, label: 'Average close' }]}\r
                series={[{ type: 'candlestick', openField: 'open', highField: 'high', lowField: 'low', closeField: 'close', name: 'Price' }]}\r
            />\r
            <Chart\r
                class="ch-candles-volume"\r
                label="Volume traded in September"\r
                data={DAYS}\r
                xField="day"\r
                height={200}\r
                xAxis={{ format: { day: 'numeric' } }}\r
                yAxis={{ format: { notation: 'compact' } }}\r
                series={[{ type: 'bar', yField: 'volume', name: 'Volume' }]}\r
            />\r
        </Stack>\r
    );\r
}\r
`,a=`import { reactive } from '@motifx/core';\r
import { Button, Chart, Stack } from '@motifx-community/ui';\r
import { SALES } from './sales';\r
\r
/** An image with the title and the legend, to download or to put in a report. */\r
export default function Export() {\r
    const s = reactive({ image: '' });\r
    let chart!: Chart;\r
    return (\r
        <Stack class="docs-wide" gap="md">\r
            <Chart\r
                ref={(x: Chart) => (chart = x)}\r
                class="ch-export"\r
                title="Sales by channel"\r
                data={SALES}\r
                xField="month"\r
                series={[\r
                    { type: 'bar', yField: 'online', name: 'Online' },\r
                    { type: 'bar', yField: 'stores', name: 'Stores' }\r
                ]}\r
            />\r
            <Button text="Create the image" variant="outline" onclick={() => chart.toDataURL().then(url => (s.image = url))} />\r
            {s.image && <img class="ch-image" alt="The chart as an image" src={() => s.image} />}\r
        </Stack>\r
    );\r
}\r
`,o=`import { Chart } from '@motifx-community/ui';\r
\r
const STEPS = [\r
    { step: 'Visited the shop', people: 12000 },\r
    { step: 'Viewed a product', people: 7400 },\r
    { step: 'Added to the cart', people: 2900 },\r
    { step: 'Started to pay', people: 1650 },\r
    { step: 'Paid', people: 1180 }\r
];\r
\r
/** Stages in order, each with what is left of the first one. */\r
export default function Funnel() {\r
    return <Chart class="ch-funnel" title="From visit to order" data={STEPS} xField="step" legend={false} series={[{ type: 'funnel', yField: 'people', name: 'People' }]} />;\r
}\r
`,s=`import { reactive } from '@motifx/core';\r
import { Chart, Stack } from '@motifx-community/ui';\r
\r
const STEPS = [\r
    { step: 'Applied', people: 840 },\r
    { step: 'Screened', people: 410 },\r
    { step: 'Interviewed', people: 126 },\r
    { step: 'Offered', people: 34 },\r
    { step: 'Hired', people: 21 }\r
];\r
\r
/** Every stage with its count; a click on a stage tells how many of the first stage got that far. */\r
export default function FunnelLabels() {\r
    const s = reactive({ told: 'Click a stage.' });\r
    return (\r
        <Stack class="docs-wide" gap="sm">\r
            <Chart\r
                class="ch-funnel-labels"\r
                title="Hiring this year"\r
                data={STEPS}\r
                xField="step"\r
                legend={false}\r
                series={[{ type: 'funnel', yField: 'people', name: 'People', labels: 'all' }]}\r
                onPointClick={e => (s.told = \`\${e.point.xText}: \${e.point.yText} people, \${Math.round((e.point.y / STEPS[0].people) * 1000) / 10}% of those who applied\`)}\r
            />\r
            <output class="ch-funnel-told">{() => s.told}</output>\r
        </Stack>\r
    );\r
}\r
`,c=`import { reactive } from '@motifx/core';\r
import { ButtonGroup, Chart, Stack } from '@motifx-community/ui';\r
\r
const PERIODS = {\r
    march: [\r
        { step: 'Opened the email', people: 5200 },\r
        { step: 'Clicked the link', people: 1900 },\r
        { step: 'Signed up', people: 640 },\r
        { step: 'Bought', people: 180 }\r
    ],\r
    april: [\r
        { step: 'Opened the email', people: 6100 },\r
        { step: 'Clicked the link', people: 2600 },\r
        { step: 'Signed up', people: 1020 },\r
        { step: 'Bought', people: 310 }\r
    ]\r
};\r
\r
/** The same stages for another period: new rows, and the stages move to their new sizes. */\r
export default function FunnelPeriods() {\r
    const s = reactive({ period: 'march' as keyof typeof PERIODS });\r
    return (\r
        <Stack class="docs-wide" gap="md">\r
            <ButtonGroup\r
                label="Period"\r
                x-model={() => s.period}\r
                items={[\r
                    { value: 'march', text: 'March' },\r
                    { value: 'april', text: 'April' }\r
                ]}\r
            />\r
            <Chart\r
                class="ch-funnel-periods"\r
                title="Spring campaign"\r
                data={() => PERIODS[s.period]}\r
                xField="step"\r
                legend={false}\r
                series={[{ type: 'funnel', yField: 'people', name: 'People', labels: 'all' }]}\r
            />\r
        </Stack>\r
    );\r
}\r
`,l=`import { Chart } from '@motifx-community/ui';\r
\r
const READINGS = [\r
    { hour: '08:00', room: 19 },\r
    { hour: '09:00', room: 20 },\r
    { hour: '10:00', room: null },\r
    { hour: '11:00', room: 22 },\r
    { hour: '12:00', room: 23 },\r
    { hour: '13:00', room: null },\r
    { hour: '14:00', room: 24 },\r
    { hour: '15:00', room: null },\r
    { hour: '16:00', room: 22 }\r
];\r
\r
/** An empty value breaks a line, as nothing was measured. \`gaps\` can join past it instead. */\r
export default function Gaps() {\r
    return (\r
        <Chart\r
            class="ch-gaps"\r
            title="Room temperature"\r
            data={READINGS}\r
            xField="hour"\r
            series={[\r
                { yField: 'room', name: 'Broken', markers: true },\r
                { yField: (row: { room: number | null }) => (row.room === null ? null : row.room + 4), name: 'Joined', gaps: 'connect', step: 'middle' }\r
            ]}\r
        />\r
    );\r
}\r
`,u=`import { Chart } from '@motifx-community/ui';\r
\r
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];\r
const HOURS = ['8', '10', '12', '14', '16', '18', '20'];\r
const LOAD = DAYS.flatMap((day, d) => HOURS.map((hour, h) => ({ day, hour, orders: Math.round(20 + 60 * Math.sin(((h + 1) / 8) * Math.PI) * (d < 5 ? 1 : 0.55) + d * 3) })));\r
\r
/** A value for each pair, as a color in seven steps. The legend gives each step its values. */\r
export default function Heatmap() {\r
    return <Chart class="ch-heat" title="Orders by day and hour" data={LOAD} xField="hour" series={[{ type: 'heatmap', yField: 'day', valueField: 'orders', name: 'Orders', labels: 'all' }]} />;\r
}\r
`,d=`import { Chart } from '@motifx-community/ui';\r
\r
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];\r
\r
// Five weeks of steps walked, more at the weekend.\r
const STEPS = Array.from({ length: 5 }, (_, w) => \`Week \${w + 1}\`).flatMap((week, w) =>\r
    DAYS.map((day, d) => ({ week, day, steps: Math.round(5200 + (d >= 5 ? 4200 : 0) + Math.sin(w * 2 + d) * 1800 + w * 350) }))\r
);\r
\r
/** A calendar of weeks and days: each cell's label reads in the series' own format, short enough to fit. */\r
export default function HeatmapCalendar() {\r
    return (\r
        <Chart\r
            class="ch-heat-calendar"\r
            title="Steps walked"\r
            data={STEPS}\r
            xField="day"\r
            series={[{ type: 'heatmap', yField: 'week', valueField: 'steps', name: 'Steps', labels: 'all', format: { notation: 'compact', maximumFractionDigits: 1 } }]}\r
        />\r
    );\r
}\r
`,f=`import { Chart } from '@motifx-community/ui';\r
\r
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];\r
const HOURS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0'));\r
\r
// How long the server takes to answer, slower in working hours.\r
const TIMES = DAYS.flatMap((day, d) =>\r
    HOURS.map((hour, h) => ({ day, hour, ms: Math.round(90 + (d < 5 ? 1 : 0.4) * 160 * Math.max(0, Math.sin(((h - 6) / 14) * Math.PI)) + ((h * 7 + d * 3) % 11) * 4) }))\r
);\r
\r
/** Many cells and no labels: the colors carry the pattern, the tooltip and the table carry the values. */\r
export default function HeatmapHours() {\r
    return (\r
        <Chart\r
            class="ch-heat-hours"\r
            title="Response time by hour"\r
            data={TIMES}\r
            xField="hour"\r
            xAxis={{ title: 'Hour of the day' }}\r
            series={[{ type: 'heatmap', yField: 'day', valueField: 'ms', name: 'Response time', format: { style: 'unit', unit: 'millisecond', maximumFractionDigits: 0 } }]}\r
        />\r
    );\r
}\r
`,p=`import { Chart } from '@motifx-community/ui';\r
\r
const TEAMS = [\r
    { team: 'Customer support', tickets: 412 },\r
    { team: 'Platform engineering', tickets: 318 },\r
    { team: 'Finance and accounting operations', tickets: 205 },\r
    { team: 'Sales', tickets: 164 },\r
    { team: 'Design', tickets: 96 }\r
];\r
\r
/** On its side, for long names and a ranking. The labels carry the values. */\r
export default function Horizontal() {\r
    return <Chart class="ch-horizontal" horizontal title="Open tickets" data={TEAMS} xField="team" yAxis={{ grid: false, labels: false }} series={[{ type: 'bar', yField: 'tickets', name: 'Tickets', labels: 'all' }]} />;\r
}\r
`,m=`import { Chart } from '@motifx-community/ui';\r
import { SALES } from './sales';\r
\r
/** Two series, the second one smoothed and with its last value labeled. */\r
export default function Lines() {\r
    return (\r
        <Chart\r
            class="ch-lines"\r
            title="Sales by channel"\r
            data={SALES}\r
            xField="month"\r
            series={[\r
                { yField: 'online', name: 'Online', labels: 'last' },\r
                { yField: 'stores', name: 'Stores', smooth: true, labels: 'last' }\r
            ]}\r
        />\r
    );\r
}\r
`,h=`import { reactive } from '@motifx/core';\r
import { Button, Chart, Stack } from '@motifx-community/ui';\r
\r
/** A function prop follows reactive data. */\r
export default function Live() {\r
    const s = reactive({ points: [12, 18, 15, 21, 19].map((value, i) => ({ step: i + 1, value })) });\r
    const add = () => {\r
        const last = s.points[s.points.length - 1];\r
        s.points = [...s.points, { step: last.step + 1, value: Math.max(2, last.value + Math.round(Math.random() * 12 - 6)) }];\r
    };\r
    return (\r
        <Stack class="docs-wide" gap="md">\r
            <Chart class="ch-live" label="A growing series" data={() => s.points} xField="step" series={[{ yField: 'value', name: 'Value', markers: true }]} />\r
            <Button text="Add a value" variant="outline" onclick={add} />\r
        </Stack>\r
    );\r
}\r
`,g=`import { Chart } from '@motifx-community/ui';\r
\r
const QUARTERS = [\r
    { quarter: 'Q1 2025', profit: 120 },\r
    { quarter: 'Q2 2025', profit: -45 },\r
    { quarter: 'Q3 2025', profit: 80 },\r
    { quarter: 'Q4 2025', profit: -110 },\r
    { quarter: 'Q1 2026', profit: 160 }\r
];\r
\r
/** Bars grow both ways from zero, each rounded at its far end. */\r
export default function Negative() {\r
    return <Chart class="ch-negative" title="Quarterly result" data={QUARTERS} xField="quarter" series={[{ type: 'bar', yField: 'profit', name: 'Result', labels: 'all' }]} />;\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { ButtonGroup, Chart, Stack, type ChartSeriesType } from '@motifx-community/ui';\r
\r
const TRAFFIC = [\r
    { source: 'Search', visits: 4820 },\r
    { source: 'Direct', visits: 2610 },\r
    { source: 'Social', visits: 1480 },\r
    { source: 'Email', visits: 920 },\r
    { source: 'Referral', visits: 540 }\r
];\r
\r
/** One whole and its parts. Hide a part in the legend: the others share the whole again, and keep their colors. */\r
export default function Parts() {\r
    const s = reactive({ type: 'donut' as ChartSeriesType });\r
    return (\r
        <Stack class="docs-wide" gap="md">\r
            <ButtonGroup\r
                label="Shape"\r
                x-model={() => s.type}\r
                items={[\r
                    { value: 'donut', text: 'Donut' },\r
                    { value: 'pie', text: 'Pie' }\r
                ]}\r
            />\r
            <Chart class="ch-parts" title="Visits by source" data={TRAFFIC} xField="source" series={() => [{ type: s.type, yField: 'visits', name: 'Visits' }]} />\r
        </Stack>\r
    );\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { Chart, Stack } from '@motifx-community/ui';\r
\r
const SPENDING = [\r
    { item: 'Rent', amount: 1200 },\r
    { item: 'Food', amount: 540 },\r
    { item: 'Transport', amount: 210 },\r
    { item: 'Bills', amount: 180 },\r
    { item: 'Leisure', amount: 260 }\r
];\r
\r
const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });\r
\r
/** A click, or Enter, chooses a part; the page tells what it is and how much of the whole it takes. */\r
export default function PieChoose() {\r
    const s = reactive({ told: 'Choose a part of the pie.' });\r
    return (\r
        <Stack class="docs-wide" gap="sm">\r
            <Chart\r
                class="ch-pie-choose"\r
                title="Spending in March"\r
                data={SPENDING}\r
                xField="item"\r
                pointSelection="single"\r
                series={[{ type: 'pie', yField: 'amount', name: 'Amount', format: { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 } }]}\r
                onSelectionChanged={e => {\r
                    const p = e.points[0];\r
                    s.told = p ? \`\${p.xText}: \${money.format(p.y)}, \${Math.round((p.share ?? 0) * 100)}% of the month\` : 'Choose a part of the pie.';\r
                }}\r
            />\r
            <output class="ch-pie-told">{() => s.told}</output>\r
        </Stack>\r
    );\r
}\r
`,y=`import { Chart } from '@motifx-community/ui';\r
\r
const DISK = [\r
    { kind: 'Photos', size: 182 },\r
    { kind: 'Videos', size: 124 },\r
    { kind: 'Apps', size: 64 },\r
    { kind: 'Documents', size: 22 },\r
    { kind: 'System', size: 38 }\r
];\r
\r
/** A thin ring that starts at the right, with every share written on its part. */\r
export default function PieLabels() {\r
    return (\r
        <Chart\r
            class="ch-pie-labels"\r
            title="Disk use"\r
            subtitle="430 GB of 512 GB"\r
            data={DISK}\r
            xField="kind"\r
            series={[{ type: 'donut', yField: 'size', name: 'Size', innerRadius: 0.72, startAngle: 90, labels: 'all', format: { style: 'unit', unit: 'gigabyte' } }]}\r
        />\r
    );\r
}\r
`,b=`import { Component } from '@motifx/core';\r
import { Button, Chart, Stack } from '@motifx-community/ui';\r
import { SALES } from './sales';\r
\r
/** A chart created programmatically. Each prop is also a property that can be set later. */\r
export default class Programmatic extends Component<HTMLDivElement> {\r
    constructor() {\r
        super('div');\r
        const chart = new Chart({ label: 'Sales', data: SALES, xField: 'month', series: [{ type: 'bar', yField: 'online', name: 'Online' }] });\r
        const next = new Button({ text: 'Show the stores', variant: 'outline', onclick: () => (chart.series = [{ type: 'bar', yField: 'stores', name: 'Stores' }]) });\r
        const stack = new Stack({ gap: 'md' });\r
        stack.controls.add(chart, next);\r
        this.controls.add(stack);\r
    }\r
}\r
`,x=`import { Chart } from '@motifx-community/ui';\r
\r
const SCORES = [\r
    { skill: 'Speed', a: 82, b: 64 },\r
    { skill: 'Battery', a: 58, b: 88 },\r
    { skill: 'Camera', a: 90, b: 72 },\r
    { skill: 'Screen', a: 76, b: 80 },\r
    { skill: 'Sound', a: 64, b: 70 },\r
    { skill: 'Price', a: 48, b: 84 }\r
];\r
\r
/** Several measures around a center, one shape for each series. */\r
export default function Radar() {\r
    return (\r
        <Chart\r
            class="ch-radar"\r
            title="Two phones compared"\r
            data={SCORES}\r
            xField="skill"\r
            series={[\r
                { type: 'radar', yField: 'a', name: 'Phone A', markers: true },\r
                { type: 'radar', yField: 'b', name: 'Phone B', markers: true }\r
            ]}\r
        />\r
    );\r
}\r
`,S=`import { Chart } from '@motifx-community/ui';\r
\r
const REVIEW = [\r
    { skill: 'Delivery', target: 80, team: 86, last: 72 },\r
    { skill: 'Quality', target: 85, team: 78, last: 74 },\r
    { skill: 'Teamwork', target: 75, team: 88, last: 80 },\r
    { skill: 'Planning', target: 70, team: 62, last: 55 },\r
    { skill: 'Learning', target: 60, team: 74, last: 66 }\r
];\r
\r
/** A fixed scale from 0 to 100, so shapes compare fairly; hide a series in the legend to compare two. */\r
export default function RadarTarget() {\r
    return (\r
        <Chart\r
            class="ch-radar-target"\r
            title="Team review"\r
            data={REVIEW}\r
            xField="skill"\r
            yAxis={{ min: 0, max: 100, tickCount: 5 }}\r
            series={[\r
                { type: 'radar', yField: 'target', name: 'Target' },\r
                { type: 'radar', yField: 'team', name: 'This year', markers: true },\r
                { type: 'radar', yField: 'last', name: 'Last year', markers: true }\r
            ]}\r
        />\r
    );\r
}\r
`,C=`import { Chart } from '@motifx-community/ui';\r
\r
const RAIN = [\r
    { month: 'Jan', north: 92, south: 110 },\r
    { month: 'Feb', north: 74, south: 96 },\r
    { month: 'Mar', north: 68, south: 72 },\r
    { month: 'Apr', north: 52, south: 48 },\r
    { month: 'May', north: 46, south: 30 },\r
    { month: 'Jun', north: 38, south: 12 },\r
    { month: 'Jul', north: 30, south: 4 },\r
    { month: 'Aug', north: 34, south: 6 },\r
    { month: 'Sep', north: 48, south: 22 },\r
    { month: 'Oct', north: 70, south: 58 },\r
    { month: 'Nov', north: 84, south: 92 },\r
    { month: 'Dec', north: 98, south: 118 }\r
];\r
\r
/** Twelve months around the circle: a year that comes back to where it started. */\r
export default function RadarYear() {\r
    return (\r
        <Chart\r
            class="ch-radar-year"\r
            title="Rain over the year"\r
            data={RAIN}\r
            xField="month"\r
            yAxis={{ format: { style: 'unit', unit: 'millimeter' } }}\r
            series={[\r
                { type: 'radar', yField: 'north', name: 'North coast' },\r
                { type: 'radar', yField: 'south', name: 'South coast' }\r
            ]}\r
        />\r
    );\r
}\r
`,w=`import { Chart } from '@motifx-community/ui';\r
\r
const WEATHER = [\r
    { month: 'Jan', low: 2, high: 9, mean: 5 },\r
    { month: 'Feb', low: 3, high: 11, mean: 7 },\r
    { month: 'Mar', low: 5, high: 14, mean: 9 },\r
    { month: 'Apr', low: 8, high: 18, mean: 13 },\r
    { month: 'May', low: 12, high: 23, mean: 17 },\r
    { month: 'Jun', low: 16, high: 28, mean: 22 },\r
    { month: 'Jul', low: 19, high: 31, mean: 25 },\r
    { month: 'Aug', low: 19, high: 31, mean: 25 },\r
    { month: 'Sep', low: 15, high: 26, mean: 21 },\r
    { month: 'Oct', low: 11, high: 21, mean: 16 },\r
    { month: 'Nov', low: 7, high: 15, mean: 11 },\r
    { month: 'Dec', low: 4, high: 11, mean: 7 }\r
];\r
\r
/** A band from the lowest to the highest value, with a line through it. */\r
export default function Ranges() {\r
    return (\r
        <Chart\r
            class="ch-range"\r
            title="Temperature over the year"\r
            data={WEATHER}\r
            xField="month"\r
            yAxis={{ format: { style: 'unit', unit: 'celsius' } }}\r
            series={[\r
                { type: 'rangeArea', lowField: 'low', highField: 'high', name: 'Range' },\r
                { yField: 'mean', name: 'Mean', smooth: true }\r
            ]}\r
        />\r
    );\r
}\r
`,T=`import { Chart } from '@motifx-community/ui';\r
\r
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];\r
const SOLD = [420, 446, 470, 462, 498, 530, 548];\r
\r
// The months give the axis; the series bring their own values.\r
const AXIS: Record<string, string | number>[] = MONTHS.map(month => ({ month }));\r
const ACTUAL = SOLD.map((units, i) => ({ month: MONTHS[i], units }));\r
// The forecast starts at the last real month and widens as it goes further.\r
const FORECAST = MONTHS.slice(SOLD.length - 1).map((month, i) => {\r
    const units = SOLD[SOLD.length - 1] + i * 22;\r
    return { month, units, low: units - i * 16, high: units + i * 16 };\r
});\r
\r
/** Each series with rows of its own: what was sold, the forecast, and the band it may fall in. */\r
export default function RangesForecast() {\r
    return (\r
        <Chart\r
            class="ch-range-forecast"\r
            title="Units sold, and the forecast"\r
            data={AXIS}\r
            xField="month"\r
            series={[\r
                { type: 'rangeArea', data: FORECAST, lowField: 'low', highField: 'high', name: 'Likely range' },\r
                { data: FORECAST, yField: 'units', name: 'Forecast', markers: true },\r
                { data: ACTUAL, yField: 'units', name: 'Sold', markers: true }\r
            ]}\r
        />\r
    );\r
}\r
`,E=`import { Chart } from '@motifx-community/ui';\r
\r
const TASKS = [\r
    { task: 'Research', start: 1, end: 4 },\r
    { task: 'Design', start: 3, end: 8 },\r
    { task: 'Build', start: 6, end: 16 },\r
    { task: 'Test', start: 12, end: 18 },\r
    { task: 'Launch', start: 18, end: 20 }\r
];\r
\r
/** Bars from a start to an end, laid on their side: a plan read week by week, with a line for this week. */\r
export default function RangesTimeline() {\r
    return (\r
        <Chart\r
            class="ch-range-timeline"\r
            title="Project plan"\r
            data={TASKS}\r
            xField="task"\r
            horizontal\r
            legend={false}\r
            yAxis={{ title: 'Week', min: 0, max: 20 }}\r
            references={[{ value: 9, label: 'This week' }]}\r
            series={[{ type: 'rangeBar', lowField: 'start', highField: 'end', name: 'Weeks' }]}\r
        />\r
    );\r
}\r
`,D=`import { Chart } from '@motifx-community/ui';\r
import { SALES } from './sales';\r
\r
/** A target across the values, and a period marked on the positions. */\r
export default function References() {\r
    return (\r
        <Chart\r
            class="ch-refs"\r
            title="Online sales against the target"\r
            data={SALES}\r
            xField="month"\r
            references={[\r
                { value: 8000, label: 'Target' },\r
                { axis: 'x', from: 'Jun', to: 'Aug', label: 'Summer sale' }\r
            ]}\r
            series={[{ type: 'bar', yField: 'online', name: 'Online' }]}\r
        />\r
    );\r
}\r
`,O=`import { Chart } from '@motifx-community/ui';\r
\r
const CARS = [\r
    { power: 66, weight: 980, price: 16 },\r
    { power: 90, weight: 1120, price: 21 },\r
    { power: 110, weight: 1240, price: 27 },\r
    { power: 130, weight: 1320, price: 31 },\r
    { power: 150, weight: 1450, price: 38 },\r
    { power: 170, weight: 1510, price: 44 },\r
    { power: 190, weight: 1600, price: 52 },\r
    { power: 230, weight: 1680, price: 71 },\r
    { power: 260, weight: 1760, price: 86 },\r
    { power: 300, weight: 1850, price: 112 }\r
];\r
\r
/** Two numbers per dot, and a third as its size. The size counts by area. */\r
export default function Scatter() {\r
    return (\r
        <Chart\r
            class="ch-scatter"\r
            title="Power, weight and price"\r
            data={CARS}\r
            xField="power"\r
            xAxis={{ title: 'Power (hp)' }}\r
            yAxis={{ title: 'Weight (kg)', min: 800 }}\r
            series={[{ type: 'bubble', yField: 'weight', sizeField: 'price', name: 'Cars' }]}\r
        />\r
    );\r
}\r
`,k=`import { reactive } from '@motifx/core';\r
import { Chart, Stack } from '@motifx-community/ui';\r
\r
const CITIES = [\r
    { city: 'Lisbon', rent: 1350, salary: 1600 },\r
    { city: 'Madrid', rent: 1250, salary: 2100 },\r
    { city: 'Milan', rent: 1500, salary: 2300 },\r
    { city: 'Vienna', rent: 1100, salary: 2900 },\r
    { city: 'Prague', rent: 950, salary: 1900 },\r
    { city: 'Warsaw', rent: 900, salary: 1700 },\r
    { city: 'Berlin', rent: 1400, salary: 3300 },\r
    { city: 'Athens', rent: 700, salary: 1200 },\r
    { city: 'Dublin', rent: 2100, salary: 3500 },\r
    { city: 'Helsinki', rent: 1150, salary: 3100 }\r
];\r
\r
/** Click dots, or move to them with the arrow keys and press Enter, to choose several; the page compares them. */\r
export default function ScatterChoose() {\r
    const s = reactive({ told: 'Choose cities on the chart.' });\r
    return (\r
        <Stack class="docs-wide" gap="sm">\r
            <Chart\r
                class="ch-scatter-choose"\r
                title="Rent and salary"\r
                subtitle="Monthly, in euros"\r
                data={CITIES}\r
                xField="rent"\r
                pointSelection="multiple"\r
                xAxis={{ title: 'Rent of a flat' }}\r
                yAxis={{ title: 'Salary after tax' }}\r
                tooltip={{ format: c => (c.point ? \`\${c.point.row.city}: rent \${c.point.xText}, salary \${c.point.yText}\` : c.title) }}\r
                series={[{ type: 'scatter', yField: 'salary', name: 'Cities' }]}\r
                onSelectionChanged={e =>\r
                    (s.told = e.points.length\r
                        ? e.points.map(p => \`\${p.row.city}: \${Math.round((p.row.rent / p.row.salary) * 100)}% of the salary\`).join(' · ')\r
                        : 'Choose cities on the chart.')\r
                }\r
            />\r
            <output class="ch-scatter-told">{() => s.told}</output>\r
        </Stack>\r
    );\r
}\r
`,A=`import { Chart } from '@motifx-community/ui';\r
\r
// Hours studied and the exam score of two classes.\r
const CLASS_A = [2, 3, 4, 4, 5, 6, 6, 7, 8, 9, 10, 11].map((hours, i) => ({ hours, score: Math.min(98, Math.round(42 + hours * 4.6 + ((i * 7) % 9) - 4)) }));\r
const CLASS_B = [1, 2, 3, 3, 4, 5, 6, 7, 7, 8, 9, 12].map((hours, i) => ({ hours, score: Math.min(98, Math.round(36 + hours * 5.1 + ((i * 5) % 11) - 5)) }));\r
\r
const mean = (rows: { hours: number; score: number }[], key: 'hours' | 'score') => Math.round((rows.reduce((sum, r) => sum + r[key], 0) / rows.length) * 10) / 10;\r
const ALL = [...CLASS_A, ...CLASS_B];\r
\r
/** Two groups of dots, each with rows of its own, and lines at the means of both axes. */\r
export default function ScatterGroups() {\r
    return (\r
        <Chart\r
            class="ch-scatter-groups"\r
            title="Study time and exam score"\r
            xField="hours"\r
            xAxis={{ title: 'Hours studied', min: 0 }}\r
            yAxis={{ title: 'Score', min: 30, max: 100 }}\r
            references={[\r
                { axis: 'x', value: mean(ALL, 'hours'), label: 'Mean hours' },\r
                { value: 70, label: 'Pass' }\r
            ]}\r
            series={[\r
                { type: 'scatter', data: CLASS_A, yField: 'score', name: 'Class A' },\r
                { type: 'scatter', data: CLASS_B, yField: 'score', name: 'Class B' }\r
            ]}\r
        />\r
    );\r
}\r
`,j=`import { reactive } from '@motifx/core';\r
import { Chart, Stack } from '@motifx-community/ui';\r
import { SALES } from './sales';\r
\r
/** A click, or Enter with the keyboard, chooses months; a second click lets one go. */\r
export default function Selection() {\r
    const s = reactive({ chosen: 'Nothing chosen' });\r
    return (\r
        <Stack class="docs-wide" gap="sm">\r
            <Chart\r
                class="ch-select"\r
                label="Online sales"\r
                data={SALES.slice(0, 6)}\r
                xField="month"\r
                pointSelection="multiple"\r
                series={[{ type: 'bar', yField: 'online', name: 'Online' }]}\r
                onSelectionChanged={(e) => (s.chosen = e.points.length ? e.points.map((p) => p.xText).join(', ') : 'Nothing chosen')}\r
            />\r
            <output class="ch-select-told">{() => s.chosen}</output>\r
        </Stack>\r
    );\r
}\r
`,M=`import { data } from '@motifx-community/data';\r
import { Chart } from '@motifx-community/ui';\r
import { SALES } from './sales';\r
\r
const source = new data.DataSource({ adapter: new data.ArrayAdapter({ data: SALES, key: 'month' }) });\r
\r
/** Rows from any adapter of the data layer: the chart follows the source. */\r
export default function Source() {\r
    return <Chart class="ch-source" title="From a data source" dataSource={source} xField="month" series={[{ type: 'bar', yField: 'returns', name: 'Returns' }]} />;\r
}\r
`,N=`import { reactive } from '@motifx/core';\r
import { ButtonGroup, Chart, Stack, type ChartStacked } from '@motifx-community/ui';\r
import { SALES } from './sales';\r
\r
/** The same bars side by side, stacked, and as shares of a hundred. */\r
export default function Stacked() {\r
    const s = reactive({ mode: 'none' });\r
    const stacked = (): ChartStacked => (s.mode === 'none' ? false : (s.mode as ChartStacked));\r
    return (\r
        <Stack class="docs-wide" gap="md">\r
            <ButtonGroup\r
                label="Stacking"\r
                x-model={() => s.mode}\r
                items={[\r
                    { value: 'none', text: 'Side by side' },\r
                    { value: 'normal', text: 'Stacked' },\r
                    { value: 'percent', text: 'Percent' }\r
                ]}\r
            />\r
            <Chart\r
                class="ch-stacked"\r
                data={SALES.slice(0, 6)}\r
                xField="month"\r
                label="Sales by channel"\r
                stacked={stacked}\r
                series={[\r
                    { type: 'bar', yField: 'online', name: 'Online' },\r
                    { type: 'bar', yField: 'stores', name: 'Stores' }\r
                ]}\r
            />\r
        </Stack>\r
    );\r
}\r
`,P=`import { reactive } from '@motifx/core';\r
import { Button, Chart, Stack } from '@motifx-community/ui';\r
import { SALES } from './sales';\r
\r
/** No values, and new values on their way. */\r
export default function States() {\r
    const s = reactive({ rows: SALES.slice(0, 6), loading: false });\r
    return (\r
        <Stack class="docs-wide" gap="md">\r
            <Chart class="ch-states" label="Sales" data={() => s.rows} loading={() => s.loading} xField="month" emptyText="No sales in this period" series={[{ type: 'bar', yField: 'online', name: 'Online' }]} />\r
            <Stack orientation="horizontal" gap="sm">\r
                <Button text="Clear" variant="outline" onclick={() => (s.rows = [])} />\r
                <Button text="Fill" variant="outline" onclick={() => (s.rows = SALES.slice(0, 6))} />\r
                <Button text="Load" variant="outline" onclick={() => (s.loading = !s.loading)} />\r
            </Stack>\r
        </Stack>\r
    );\r
}\r
`,F=`import { reactive } from '@motifx/core';\r
import { Button, Chart, Stack } from '@motifx-community/ui';\r
\r
const SECOND = 1000;\r
\r
/** New values arrive every second, and the chart shows the last 30 seconds. The marks move from where they were. */\r
export default function Streaming() {\r
    const now = Date.now();\r
    const s = reactive({ running: true, points: Array.from({ length: 30 }, (_, i) => ({ time: new Date(now - (30 - i) * SECOND), value: 40 + Math.round(Math.random() * 20) })) });\r
    const timer = setInterval(() => {\r
        if (!s.running) return;\r
        const last = s.points[s.points.length - 1];\r
        const next = { time: new Date(last.time.getTime() + SECOND), value: Math.max(5, Math.min(95, last.value + Math.round(Math.random() * 14 - 7))) };\r
        s.points = [...s.points.slice(-120), next];\r
    }, SECOND);\r
    return (\r
        <Stack class="docs-wide" gap="sm" onDisposing={() => clearInterval(timer)}>\r
            <Chart class="ch-stream" label="Requests a second" data={() => s.points} xField="time" xAxis={{ span: 30 * SECOND }} yAxis={{ min: 0, max: 100 }} series={[{ yField: 'value', name: 'Requests', labels: 'last' }]} />\r
            <Button text={() => (s.running ? 'Pause' : 'Go on')} variant="outline" onclick={() => (s.running = !s.running)} />\r
        </Stack>\r
    );\r
}\r
`,I=`import { Chart } from '@motifx-community/ui';\r
\r
const DAY = 24 * 60 * 60 * 1000;\r
const START = new Date(2026, 0, 1).getTime();\r
const VISITS = Array.from({ length: 180 }, (_, i) => ({\r
    day: new Date(START + i * DAY),\r
    visits: Math.round(900 + i * 6 + Math.sin(i / 6) * 180 + (i % 7 === 0 ? -160 : 0))\r
}));\r
\r
/** Dates place themselves on round days and months. */\r
export default function TimeAxis() {\r
    return <Chart class="ch-time" title="Daily visits" data={VISITS} xField="day" series={[{ type: 'area', yField: 'visits', name: 'Visits' }]} />;\r
}\r
`,L=`import { Chart } from '@motifx-community/ui';\r
\r
const BUDGET = [\r
    { item: 'Start', change: 1200 },\r
    { item: 'Sales', change: 860 },\r
    { item: 'Services', change: 340 },\r
    { item: 'Salaries', change: -690 },\r
    { item: 'Rent', change: -240 },\r
    { item: 'Half year', total: true },\r
    { item: 'Taxes', change: -310 },\r
    { item: 'End', total: true }\r
];\r
\r
/** Each step adds or takes away, and a total row shows where it stands. */\r
export default function Waterfall() {\r
    return <Chart class="ch-waterfall" title="Cash over the year" data={BUDGET} xField="item" series={[{ type: 'waterfall', yField: 'change', totalField: 'total', name: 'Cash', labels: 'all' }]} />;\r
}\r
`,R=`import { Chart } from '@motifx-community/ui';\r
\r
const BRIDGE = [\r
    { step: 'Profit last year', change: 4.2 },\r
    { step: 'Higher prices', change: 1.1 },\r
    { step: 'More units sold', change: 0.8 },\r
    { step: 'Material costs', change: -1.4 },\r
    { step: 'New staff', change: -0.6 },\r
    { step: 'Exchange rates', change: -0.3 },\r
    { step: 'Profit this year', total: true }\r
];\r
\r
/** On its side, so long step names read in full. */\r
export default function WaterfallBridge() {\r
    return (\r
        <Chart\r
            class="ch-waterfall-bridge"\r
            title="From last year's profit to this year's"\r
            subtitle="In millions of euros"\r
            data={BRIDGE}\r
            xField="step"\r
            horizontal\r
            legend={false}\r
            series={[{ type: 'waterfall', yField: 'change', totalField: 'total', name: 'Profit', labels: 'all', format: { style: 'currency', currency: 'EUR', notation: 'compact', maximumFractionDigits: 1 } }]}\r
        />\r
    );\r
}\r
`,z=`import { Chart } from '@motifx-community/ui';\r
\r
const FLOW = [\r
    { month: 'Opening', change: 50 },\r
    { month: 'Jan', change: 12 },\r
    { month: 'Feb', change: -8 },\r
    { month: 'Mar', change: 15 },\r
    { month: 'Q1', total: true },\r
    { month: 'Apr', change: -21 },\r
    { month: 'May', change: 9 },\r
    { month: 'Jun', change: 18 },\r
    { month: 'Q2', total: true }\r
];\r
\r
/** Totals between the steps show where the account stands at the end of each quarter; only the highest and lowest bars carry labels. */\r
export default function WaterfallQuarters() {\r
    return (\r
        <Chart\r
            class="ch-waterfall-quarters"\r
            title="Account balance, first half"\r
            subtitle="In thousands of euros"\r
            data={FLOW}\r
            xField="month"\r
            legend={false}\r
            series={[{ type: 'waterfall', yField: 'change', totalField: 'total', name: 'Balance', labels: 'extremes' }]}\r
        />\r
    );\r
}\r
`,B=`import { reactive } from '@motifx/core';\r
import { Chart, Stack } from '@motifx-community/ui';\r
\r
const MINUTE = 60 * 1000;\r
const START = new Date(2026, 9, 1).getTime();\r
// A sensor read every minute for about ten weeks: 100,000 values.\r
const READINGS = Array.from({ length: 100000 }, (_, i) => ({ time: new Date(START + i * MINUTE), load: Math.round(50 + 20 * Math.sin(i / 1440 * Math.PI * 2) + 8 * Math.sin(i / 97) + (i % 8191 === 0 ? 30 : 0)) }));\r
\r
/** Drag across the plot to zoom in, Ctrl and the wheel zoom around the pointer, Shift and the wheel move along. The line is thinned to the width, and its peaks stay. */\r
export default function Zoom() {\r
    const s = reactive({ seen: 'All of it' });\r
    const time = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });\r
    return (\r
        <Stack class="docs-wide" gap="sm">\r
            <Chart\r
                class="ch-zoom"\r
                title="Server load"\r
                subtitle="100,000 readings, one a minute"\r
                data={READINGS}\r
                xField="time"\r
                zoom\r
                yAxis={{ format: { style: 'unit', unit: 'percent' } }}\r
                series={[{ type: 'area', yField: 'load', name: 'Load' }]}\r
                onZoomChanged={(e) => (s.seen = e.from ? \`\${time.format(e.from as Date)} to \${time.format(e.to as Date)}\` : 'All of it')}\r
            />\r
            <output class="ch-zoom-told">{() => s.seen}</output>\r
        </Stack>\r
    );\r
}\r
`,V=`import { reactive } from '@motifx/core';\r
import { ButtonGroup, Chart, Stack } from '@motifx-community/ui';\r
\r
const WEEKS = Array.from({ length: 52 }, (_, i) => ({ week: \`W\${i + 1}\`, orders: Math.round(300 + Math.sin(i / 8) * 90 + (i > 46 ? 160 : 0) + ((i * 13) % 7) * 12) }));\r
\r
/** Zoom works on categories too: the buttons call \`zoomTo\` with the names of the first and last week to show. */\r
export default function ZoomWeeks() {\r
    const s = reactive({ part: 'all' });\r
    let chart!: Chart;\r
    let moving = false;\r
    const show = (part: string) => {\r
        moving = true;\r
        if (part === 'first') chart.zoomTo('W1', 'W26');\r
        else if (part === 'last') chart.zoomTo('W41', 'W52');\r
        else chart.resetZoom();\r
        moving = false;\r
    };\r
    return (\r
        <Stack class="docs-wide" gap="md">\r
            <ButtonGroup\r
                label="Weeks"\r
                x-model={() => s.part}\r
                onValueChanged={e => e.byUser && show(e.value as string)}\r
                items={[\r
                    { value: 'first', text: 'First half' },\r
                    { value: 'last', text: 'Last 12 weeks' },\r
                    { value: 'all', text: 'All' }\r
                ]}\r
            />\r
            <Chart\r
                ref={(x: Chart) => (chart = x)}\r
                class="ch-zoom-weeks"\r
                title="Orders by week"\r
                data={WEEKS}\r
                xField="week"\r
                zoom\r
                legend={false}\r
                series={[{ type: 'bar', yField: 'orders', name: 'Orders' }]}\r
                onZoomChanged={e => !moving && (s.part = e.from ? '' : 'all')}\r
            />\r
        </Stack>\r
    );\r
}\r
`,H=`/** Twelve months of made-up figures, shared by the examples. */\r
export const SALES = [\r
    { month: 'Jan', online: 4200, stores: 6100, returns: 310 },\r
    { month: 'Feb', online: 4600, stores: 5800, returns: 280 },\r
    { month: 'Mar', online: 5900, stores: 6400, returns: 420 },\r
    { month: 'Apr', online: 6300, stores: 6000, returns: 390 },\r
    { month: 'May', online: 7100, stores: 6600, returns: 450 },\r
    { month: 'Jun', online: 7600, stores: 7000, returns: 520 },\r
    { month: 'Jul', online: 8200, stores: 6800, returns: 610 },\r
    { month: 'Aug', online: 8000, stores: 6500, returns: 580 },\r
    { month: 'Sep', online: 8900, stores: 7200, returns: 640 },\r
    { month: 'Oct', online: 9400, stores: 7600, returns: 700 },\r
    { month: 'Nov', online: 11200, stores: 8800, returns: 930 },\r
    { month: 'Dec', online: 12800, stores: 10100, returns: 1100 }\r
];\r
`;export{p as A,r as B,b as C,g as D,_ as E,c as F,t as H,s as I,o as L,d as M,u as N,h as O,l as P,a as R,x as S,v as T,e as U,n as V,E as _,R as a,C as b,F as c,M as d,j as f,D as g,O as h,z as i,f as j,m as k,P as l,k as m,V as n,L as o,A as p,B as r,I as s,H as t,N as u,T as v,y as w,S as x,w as y,i as z};