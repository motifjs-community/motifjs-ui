var e=`import { Gauge, Stack } from '@motifx-community/ui';\r
\r
/** A bar across with the ends of its scale under its ends, and one with ticks. The label and the value sit above. */\r
export default function Across() {\r
    return (\r
        <Stack gap="lg" style="inline-size: 100%">\r
            <Gauge class="ga-linear" type="linear" value={72} label="Storage" format={{ style: 'unit', unit: 'gigabyte' }} max={128} />\r
            <Gauge type="linear" value={4.3} max={5} scale="ticks" tickInterval={1} minorTicks={3} label="Rating" format={{ maximumFractionDigits: 1 }} />\r
        </Stack>\r
    );\r
}\r
`,t=`import { Gauge, Stack } from '@motifx-community/ui';\r
\r
/** The default arc of 240 degrees, a wider one of 300, and a whole circle. */\r
export default function ArcCircle() {\r
    return (\r
        <Stack orientation="horizontal" gap="lg" wrap align="end">\r
            <Gauge class="ga-arc" value={72} label="Arc" />\r
            <Gauge angle={300} value={72} label="Wide arc" />\r
            <Gauge class="ga-circle" type="circle" value={72} label="Circle" />\r
        </Stack>\r
    );\r
}\r
`,n=`import { Gauge, Stack } from '@motifx-community/ui';\r
\r
const MONTHS = [\r
    { name: 'January', change: 12 },\r
    { name: 'February', change: -7 },\r
    { name: 'March', change: 4 },\r
    { name: 'April', change: -15 }\r
];\r
\r
const RESULT = [\r
    { from: -20, to: 0, tone: 'danger' as const, label: 'loss' },\r
    { from: 0, to: 20, tone: 'good' as const, label: 'profit' }\r
];\r
\r
/** Changes against last year, one bar each: a loss fills to the left of 0, a profit to the right. */\r
export default function Balance() {\r
    return (\r
        <Stack class="ga-balance" gap="md" style="inline-size: 100%">\r
            {MONTHS.map(m => (\r
                <Gauge type="linear" value={m.change} min={-20} max={20} baseValue={0} label={m.name} ranges={RESULT} scale="ticks" tickInterval={10}\r
                    format={{ style: 'unit', unit: 'percent', signDisplay: 'exceptZero' }} />\r
            ))}\r
        </Stack>\r
    );\r
}\r
`,r=`import { Gauge, Stack, type GaugeMarker } from '@motifx-community/ui';\r
\r
const BARS: { marker: GaugeMarker; value: number; label: string }[] = [\r
    { marker: 'triangle', value: 85, label: 'Triangle' },\r
    { marker: 'circle', value: 65, label: 'Circle' },\r
    { marker: 'rhombus', value: 80, label: 'Rhombus' },\r
    { marker: 'line', value: 75, label: 'Line' },\r
    { marker: 'text', value: 70, label: 'Callout' }\r
];\r
\r
/** Each marker on a bar across. On a straight gauge a needle is drawn as a triangle. */\r
export default function BarMarkers() {\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            {BARS.map(b => (\r
                <Gauge class="ga-bar-marker" type="linear" fill={false} scale="ticks" tickInterval={25} marker={b.marker} value={b.value} label={b.label} />\r
            ))}\r
        </Stack>\r
    );\r
}\r
`,i=`import { Gauge, Stack } from '@motifx-community/ui';\r
\r
/** Marks on bars: the lowest and highest expected, and a price between its low and high of the day. */\r
export default function BarMarks() {\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <Gauge class="ga-bar-marks" type="linear" value={17} max={30} scale="ticks" tickInterval={5} marks={[{ value: 5, label: 'Lowest' }, { value: 25, label: 'Highest' }]}\r
                label="Issues closed" />\r
            <Gauge type="linear" value={28} min={10} max={50} scale="ticks" tickInterval={10} fill={false} marker="circle" markShape="line"\r
                marks={[{ value: 18, label: 'Low' }, { value: 43, label: 'High' }]} format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} label="Price" />\r
        </Stack>\r
    );\r
}\r
`,a=`import { Gauge, Stack } from '@motifx-community/ui';\r
\r
/** The value written in a callout that points at it: inside an arc, beside a bar. */\r
export default function Callout() {\r
    return (\r
        <Stack orientation="horizontal" gap="xl" wrap align="end">\r
            <Gauge class="ga-callout" angle={180} fill={false} scale="ticks" tickInterval={50} marker="text" value={70} label="Arc" />\r
            <Gauge type="linear" fill={false} scale="ticks" tickInterval={25} marker="text" value={70} label="Bar" style="flex: 1 1 16rem" />\r
        </Stack>\r
    );\r
}\r
`,o=`import { Gauge, Stack } from '@motifx-community/ui';\r
\r
const PRESSURE = [\r
    { from: 900, to: 1000, label: 'low' },\r
    { from: 1000, to: 1020, label: 'normal' },\r
    { from: 1020, to: 1100, label: 'high' }\r
];\r
\r
/** Ranges with neither a tone nor a color take the chart colors in order. */\r
export default function ChartColors() {\r
    return (\r
        <Stack orientation="horizontal" gap="xl" wrap align="end">\r
            <Gauge class="ga-chart-colors" value={1016} min={900} max={1100} ranges={PRESSURE} scale="ticks" ticks={[900, 1000, 1020, 1100]} label="Pressure (hPa)" />\r
            <Gauge type="linear" orientation="vertical" size={200} value={1016} min={900} max={1100} ranges={PRESSURE} fill={false} marker="circle"\r
                scale="ticks" ticks={[900, 1000, 1020, 1100]} label="Pressure (hPa)" />\r
        </Stack>\r
    );\r
}\r
`,s=`import { reactive } from '@motifx/core';\r
import { Gauge, Slider, Stack } from '@motifx-community/ui';\r
\r
/** Gauges put together: a speedometer, four quarter gauges around it and a fuel bar, all driven by one slider. */\r
export default function Dashboard() {\r
    const s = reactive({ speed: 80 });\r
    const quarter = (rotation: number, label: string, value: () => number) => (\r
        <Gauge class="ga-dash-quarter" angle={90} rotation={rotation} size={130} value={value} label={label} showValue={false} scale="ticks" tickInterval={50} />\r
    );\r
    return (\r
        <Stack gap="lg" align="center">\r
            <Stack orientation="horizontal" gap="md" align="center" wrap justify="center">\r
                <Stack gap="md">\r
                    {quarter(-45, 'Oil', () => s.speed / 2)}\r
                    {quarter(-135, 'Water', () => 100 - s.speed / 2)}\r
                </Stack>\r
                <Gauge class="ga-speed" value={() => s.speed} max={200} size={220} angle={270} scale="ticks" tickInterval={20} minorTicks={1}\r
                    marker="needle" label="km/h" ranges={[{ from: 160, to: 200, tone: 'danger' }]} />\r
                <Stack gap="md">\r
                    {quarter(45, 'Load', () => s.speed / 2)}\r
                    {quarter(135, 'Charge', () => 100 - s.speed / 2)}\r
                </Stack>\r
            </Stack>\r
            <Gauge class="ga-fuel" type="linear" value={() => 50 - s.speed * 0.2} max={50} scale="ticks" tickInterval={25} minorTicks={1}\r
                format={{ maximumFractionDigits: 0 }} label="Fuel (l)" />\r
            <Slider label="Speed" x-model={() => s.speed} min={0} max={200} />\r
        </Stack>\r
    );\r
}\r
`,c=`import { reactive } from '@motifx/core';\r
import { Gauge, Slider, Stack } from '@motifx-community/ui';\r
\r
const degrees = (v: number) => \`\${v}°\`;\r
\r
/** A deviation from the target: the fill grows from 0 to either side. */\r
export default function Deviation() {\r
    const s = reactive({ angle: 20 });\r
    return (\r
        <Stack gap="md">\r
            <Stack orientation="horizontal" gap="lg" wrap align="end">\r
                <Gauge class="ga-base" angle={90} min={-45} max={45} baseValue={0} value={() => s.angle} scale="ticks" tickInterval={45} format={degrees}\r
                    label="Deviation" size={240} />\r
                <Gauge class="ga-base-bar" type="linear" orientation="vertical" size={180} min={-45} max={45} baseValue={0} value={() => s.angle}\r
                    scale="ticks" tickInterval={15} format={degrees} label="Deviation" />\r
            </Stack>\r
            <Slider label="Deviation" x-model={() => s.angle} min={-45} max={45} />\r
        </Stack>\r
    );\r
}\r
`,l=`import { Gauge, Stack } from '@motifx-community/ui';\r
\r
const DRIVES = [\r
    { name: 'System', used: 212, size: 256 },\r
    { name: 'Projects', used: 640, size: 1000 },\r
    { name: 'Backup', used: 1880, size: 2000 }\r
];\r
\r
/** Bars in a list, one for each drive. A drive more than 90 percent full takes the danger tone. */\r
export default function Drives() {\r
    return (\r
        <Stack class="ga-drives" gap="md" style="inline-size: 100%">\r
            {DRIVES.map(d => (\r
                <Gauge type="linear" value={d.used} max={d.size} label={d.name} format={{ style: 'unit', unit: 'gigabyte' }}\r
                    ranges={[{ from: d.size * 0.9, to: d.size, tone: 'danger', label: 'almost full' }]} />\r
            ))}\r
        </Stack>\r
    );\r
}\r
`,u=`import { Gauge, Stack } from '@motifx-community/ui';\r
\r
/** A fill with a needle over it, and a fill with a triangle that keeps the value easy to find. */\r
export default function FillAndMarker() {\r
    return (\r
        <Stack orientation="horizontal" gap="lg" wrap align="end">\r
            <Gauge value={128} max={240} marker="needle" scale="ticks" tickInterval={40} label="km/h" />\r
            <Gauge value={62} marker="triangle" scale="ticks" tickInterval={25} label="Progress" format={{ style: 'unit', unit: 'percent' }} />\r
            <Gauge type="linear" orientation="vertical" size={180} value={62} marker="triangle" scale="ticks" tickInterval={25} label="Level" />\r
        </Stack>\r
    );\r
}\r
`,d=`import { reactive } from '@motifx/core';\r
import { Gauge, Slider, Stack } from '@motifx-community/ui';\r
\r
/** A value against its scale, following a slider. */\r
export default function First() {\r
    const s = reactive({ disk: 64 });\r
    return (\r
        <Stack gap="md" align="start">\r
            <Gauge class="ga-first" value={() => s.disk} label="Disk" format={{ style: 'unit', unit: 'percent' }} />\r
            <Slider label="Disk" x-model={() => s.disk} min={0} max={100} />\r
        </Stack>\r
    );\r
}\r
`,f=`import { Gauge, Stack } from '@motifx-community/ui';\r
\r
const degrees = (v: number) => \`\${v}°\`;\r
\r
/** Values as a percentage, as money, and through a function of your own. */\r
export default function Formats() {\r
    return (\r
        <Stack orientation="horizontal" gap="lg" wrap align="end">\r
            <Gauge angle={180} value={45} scale="ticks" tickInterval={25} format={{ style: 'unit', unit: 'percent' }} label="Battery" />\r
            <Gauge angle={180} value={7400} max={10000} scale="ticks" tickInterval={2500} format={{ style: 'currency', currency: 'EUR', notation: 'compact' }} label="Budget" />\r
            <Gauge class="ga-degrees" angle={180} value={20} min={-45} max={45} scale="ticks" tickInterval={45} format={degrees} label="Angle" />\r
        </Stack>\r
    );\r
}\r
`,p=`import { Gauge, Stack } from '@motifx-community/ui';\r
\r
/** A half, and a quarter turned to each corner. A quarter has little room inside, so its value is left out. */\r
export default function HalfQuarter() {\r
    return (\r
        <Stack orientation="horizontal" gap="lg" wrap align="end">\r
            <Gauge class="ga-half" angle={180} value={72} label="Half" />\r
            <Gauge class="ga-quarter" angle={90} rotation={-45} value={80} label="Upper left" showValue={false} scale="ticks" tickInterval={50} />\r
            <Gauge angle={90} rotation={45} value={75} label="Upper right" showValue={false} scale="ticks" tickInterval={50} />\r
            <Gauge angle={90} rotation={135} value={70} label="Lower right" showValue={false} scale="ticks" tickInterval={50} />\r
            <Gauge angle={90} rotation={-135} value={68} label="Lower left" showValue={false} scale="ticks" tickInterval={50} />\r
        </Stack>\r
    );\r
}\r
`,m=`import { Gauge, Stack } from '@motifx-community/ui';\r
\r
/** Marks as lines for every mark, and a mark with a callout of its own beside a needle. */\r
export default function MarkShapes() {\r
    return (\r
        <Stack orientation="horizontal" gap="xl" wrap align="end">\r
            <Gauge value={62} markShape="line" marks={[{ value: 30, label: 'Low' }, { value: 80, label: 'High' }]} scale="ticks" tickInterval={25} label="Lines" />\r
            <Gauge class="ga-mark-text" value={2200} max={3000} scale="ticks" tickInterval={500} marker="needle" fill={false}\r
                marks={[{ value: 2700, label: 'Recommended', shape: 'text' }]} label="Oven (°C)" />\r
            <Gauge value={55} marks={[{ value: 20, shape: 'circle' }, { value: 45, shape: 'rhombus' }, { value: 90 }]} scale="ticks" tickInterval={25} label="Mixed" />\r
        </Stack>\r
    );\r
}\r
`,h=`import { reactive } from '@motifx/core';\r
import { Gauge, NumberBox, Stack } from '@motifx-community/ui';\r
\r
/** Marks that follow the data: change the target and the limit, and the marks move. */\r
export default function MovingMarks() {\r
    const s = reactive({ value: 34, target: 23, limit: 38 });\r
    return (\r
        <Stack orientation="horizontal" gap="xl" wrap align="center">\r
            <Gauge class="ga-moving-marks" value={() => s.value} min={10} max={40} scale="ticks" tickInterval={5} label="Voltage (kV)"\r
                marks={() => [{ value: s.target, label: 'Target' }, { value: s.limit, label: 'Limit', shape: 'line' }]} />\r
            <Stack gap="sm">\r
                <NumberBox label="Value" x-model={() => s.value} min={10} max={40} />\r
                <NumberBox label="Target" x-model={() => s.target} min={10} max={40} />\r
                <NumberBox label="Limit" x-model={() => s.limit} min={10} max={40} />\r
            </Stack>\r
        </Stack>\r
    );\r
}\r
`,g=`import { Gauge, Stack, type GaugeNeedleShape } from '@motifx-community/ui';\r
\r
const NEEDLES: { shape: GaugeNeedleShape; value: number; label: string }[] = [\r
    { shape: 'tapered', value: 75, label: 'Tapered' },\r
    { shape: 'straight', value: 62, label: 'Straight' },\r
    { shape: 'two-tone', value: 80, label: 'Two-tone' }\r
];\r
\r
/** The three needles, on a half arc without a fill. A two-tone needle's tip takes the color of the value's range. */\r
export default function Needles() {\r
    return (\r
        <Stack orientation="horizontal" gap="lg" wrap align="end">\r
            {NEEDLES.map(n => (\r
                <Gauge class="ga-marker" angle={180} fill={false} scale="ticks" tickInterval={50} marker="needle" needleShape={n.shape} value={n.value} label={n.label}\r
                    ranges={[{ from: 80, to: 100, tone: 'danger' }]} />\r
            ))}\r
        </Stack>\r
    );\r
}\r
`,_=`import { Gauge, Stack } from '@motifx-community/ui';\r
\r
const BANDS = [\r
    { from: 0, to: 18.5, color: '#4f8fd8', label: 'under' },\r
    { from: 18.5, to: 25, color: '#3c9a5f', label: 'normal' },\r
    { from: 25, to: 30, color: '#d9a400', label: 'over' },\r
    { from: 30, to: 40, color: '#c8463b', label: 'high' }\r
];\r
\r
/** Ranges in colors of your own. A color is never the only sign: the range's name is read with the value. */\r
export default function OwnColors() {\r
    return (\r
        <Stack orientation="horizontal" gap="lg" wrap align="end">\r
            <Gauge class="ga-own" value={23.4} min={10} max={40} ranges={BANDS} scale="ticks" ticks={[10, 18.5, 25, 30, 40]} label="Body mass index" />\r
            <Gauge type="linear" value={27.1} min={10} max={40} ranges={BANDS} scale="ticks" ticks={[10, 18.5, 25, 30, 40]} label="Body mass index" style="flex: 1 1 16rem" />\r
        </Stack>\r
    );\r
}\r
`,v=`import { Gauge, Stack } from '@motifx-community/ui';\r
\r
/** Ticks only where they mean something: the reserve, half and full; the limits of normal pressure. */\r
export default function OwnTicks() {\r
    return (\r
        <Stack orientation="horizontal" gap="xl" wrap align="end">\r
            <Gauge class="ga-custom" type="linear" orientation="vertical" size={180} value={35} max={50} scale="ticks" ticks={[0, 10, 25, 50]} label="Fuel (l)" />\r
            <Gauge value={1016} min={900} max={1100} scale="ticks" ticks={[900, 1000, 1020, 1100]} label="Pressure (hPa)" />\r
        </Stack>\r
    );\r
}\r
`,y=`import { Component } from '@motifx/core';\r
import { Button, Gauge, Stack } from '@motifx-community/ui';\r
\r
/** A gauge created programmatically. Each prop is also a property that can be set later. */\r
export default class Programmatic extends Component<HTMLDivElement> {\r
    constructor() {\r
        super('div');\r
        const gauge = new Gauge({ value: 30, label: 'Queue', scale: 'ticks', tickInterval: 25 });\r
        const add = new Button({ text: 'Add 10', variant: 'outline', onclick: () => (gauge.value = Math.min(100, (gauge.value ?? 0) + 10)) });\r
        const needle = new Button({ text: 'Needle on or off', variant: 'outline', onclick: () => (gauge.marker = gauge.marker ? null : 'needle') });\r
        const buttons = new Stack({ orientation: 'horizontal', gap: 'sm', wrap: true });\r
        buttons.controls.add(add, needle);\r
        const stack = new Stack({ gap: 'md', align: 'start' });\r
        stack.controls.add(gauge, buttons);\r
        this.controls.add(stack);\r
    }\r
}\r
`,b=`import { reactive } from '@motifx/core';\r
import { Gauge, Slider, Stack } from '@motifx-community/ui';\r
\r
/** The fill takes the tone of the range its value is in; the ranges show as a band outside the track. */\r
export default function Ranges() {\r
    const s = reactive({ cpu: 64 });\r
    return (\r
        <Stack gap="md">\r
            <Gauge\r
                class="ga-ranges"\r
                value={() => s.cpu}\r
                label="CPU"\r
                format={{ style: 'unit', unit: 'percent' }}\r
                ranges={[\r
                    { from: 0, to: 70, tone: 'good', label: 'normal' },\r
                    { from: 70, to: 90, tone: 'warning', label: 'high' },\r
                    { from: 90, to: 100, tone: 'danger', label: 'critical' }\r
                ]}\r
            />\r
            <Slider label="CPU" x-model={() => s.cpu} min={0} max={100} />\r
        </Stack>\r
    );\r
}\r
`,x=`import { reactive } from '@motifx/core';\r
import { Gauge, Slider, Stack } from '@motifx-community/ui';\r
\r
const RANGES = [\r
    { from: 0, to: 60, tone: 'good' as const, label: 'quiet' },\r
    { from: 60, to: 85, tone: 'warning' as const, label: 'loud' },\r
    { from: 85, to: 120, tone: 'danger' as const, label: 'harmful' }\r
];\r
\r
const decibels = (v: number) => \`\${v} dB\`;\r
\r
/** What assistive technology reads: the value with the name of its range, shown here under the gauge. */\r
export default function ReadRange() {\r
    const s = reactive({ level: 52, read: '' });\r
    // Shows the text the gauge gives assistive technology each time it changes.\r
    const follow = (gauge: Gauge) => {\r
        const show = () => (s.read = gauge.element.getAttribute('aria-valuetext') ?? '');\r
        new MutationObserver(show).observe(gauge.element, { attributes: true, attributeFilter: ['aria-valuetext'] });\r
        show();\r
    };\r
    return (\r
        <Stack gap="md" align="start">\r
            <Gauge ref={follow} class="ga-read" value={() => s.level} max={120} ranges={RANGES}\r
                format={decibels} label="Noise" />\r
            <output class="ga-read-out">{() => \`Read as: \${s.read}\`}</output>\r
            <Slider label="Noise" x-model={() => s.level} min={0} max={120} />\r
        </Stack>\r
    );\r
}\r
`,S=`import { Gauge, Stack } from '@motifx-community/ui';\r
\r
/** A scale from 100 down to 0: what is left, counted down. */\r
export default function Reversed() {\r
    return (\r
        <Stack orientation="horizontal" gap="xl" wrap align="end">\r
            <Gauge class="ga-down" value={30} min={100} max={0} scale="ticks" tickInterval={20} label="Remaining" />\r
            <Gauge type="linear" orientation="vertical" size={180} value={30} min={100} max={0} scale="ticks" tickInterval={25} label="Depth (m)" />\r
        </Stack>\r
    );\r
}\r
`,C=`import { Gauge, Stack } from '@motifx-community/ui';\r
\r
/** The two ends, ticks with their values, and no scale at all. */\r
export default function ScaleModes() {\r
    return (\r
        <Stack orientation="horizontal" gap="lg" wrap align="end">\r
            <Gauge value={58} scale="ends" label="Ends" />\r
            <Gauge value={58} scale="ticks" tickInterval={25} label="Ticks" />\r
            <Gauge value={58} scale="none" label="None" />\r
        </Stack>\r
    );\r
}\r
`,w=`import { reactive } from '@motifx/core';\r
import { Button, Gauge, Stack } from '@motifx-community/ui';\r
\r
const LOAD = [\r
    { from: 0, to: 70, tone: 'good' as const, label: 'normal' },\r
    { from: 70, to: 90, tone: 'warning' as const, label: 'high' },\r
    { from: 90, to: 100, tone: 'danger' as const, label: 'critical' }\r
];\r
\r
const walk = (v: number, step: number) => Math.max(2, Math.min(98, v + Math.round(Math.random() * step * 2 - step)));\r
\r
/** New values every second. Each change moves over the motion of the design language. */\r
export default function ServerLoad() {\r
    const s = reactive({ running: true, cpu: 46, memory: 62, disk: 31 });\r
    const timer = setInterval(() => {\r
        if (!s.running) return;\r
        s.cpu = walk(s.cpu, 12);\r
        s.memory = walk(s.memory, 4);\r
        s.disk = walk(s.disk, 8);\r
    }, 1000);\r
    return (\r
        <Stack gap="md" align="start" onDisposing={() => clearInterval(timer)}>\r
            <Stack orientation="horizontal" gap="lg" wrap align="end">\r
                <Gauge class="ga-live" value={() => s.cpu} ranges={LOAD} label="Processor" format={{ style: 'unit', unit: 'percent' }} />\r
                <Gauge value={() => s.memory} ranges={LOAD} marker="needle" fill={false} scale="ticks" tickInterval={25} label="Memory" format={{ style: 'unit', unit: 'percent' }} />\r
                <Gauge type="linear" orientation="vertical" size={160} value={() => s.disk} ranges={LOAD} scale="ticks" tickInterval={25} label="Disk" />\r
            </Stack>\r
            <Button text={() => (s.running ? 'Pause' : 'Go on')} variant="outline" onclick={() => (s.running = !s.running)} />\r
        </Stack>\r
    );\r
}\r
`,T=`import { Gauge, Stack } from '@motifx-community/ui';\r
\r
/** The same gauge at three sizes. The track keeps the thickness of the design language. */\r
export default function Sizes() {\r
    return (\r
        <Stack orientation="horizontal" gap="lg" wrap align="end">\r
            <Gauge class="ga-small" size={120} value={40} label="120 px" />\r
            <Gauge value={40} label="Design language" />\r
            <Gauge class="ga-large" size={220} value={40} label="220 px" scale="ticks" tickInterval={10} />\r
        </Stack>\r
    );\r
}\r
`,E=`import { Gauge } from '@motifx-community/ui';\r
\r
const EXPECTED = [\r
    { value: 40, label: 'Lowest expected' },\r
    { value: 90, label: 'Highest expected' }\r
];\r
\r
const SOLD = [\r
    { from: 0, to: 30, tone: 'danger' as const },\r
    { from: 30, to: 70, tone: 'warning' as const },\r
    { from: 70, to: 100, tone: 'good' as const }\r
];\r
\r
/** The lowest and highest expected values marked on the scale. Point at a mark to see its name. */\r
export default function Targets() {\r
    return <Gauge class="ga-marks" value={85} scale="ticks" tickInterval={10} marks={EXPECTED} ranges={SOLD} label="Tickets sold (%)" size={200} />;\r
}\r
`,D=`import { Gauge, Stack } from '@motifx-community/ui';\r
\r
/** Ticks every 100 with three small ones between, and ticks at an even step chosen for the size. */\r
export default function Ticks() {\r
    return (\r
        <Stack orientation="horizontal" gap="lg" wrap align="end">\r
            <Gauge class="ga-minor" value={750} max={1000} scale="ticks" tickInterval={100} minorTicks={3} label="Fan speed (rpm)" />\r
            <Gauge value={63} scale="ticks" label="Even step" />\r
            <Gauge type="linear" orientation="vertical" size={180} value={63} scale="ticks" minorTicks={1} label="Upright" />\r
        </Stack>\r
    );\r
}\r
`,O=`import { Gauge, Stack, type GaugeMarker } from '@motifx-community/ui';\r
\r
const SHAPES: { marker: GaugeMarker; value: number; label: string }[] = [\r
    { marker: 'triangle', value: 85, label: 'Triangle' },\r
    { marker: 'circle', value: 65, label: 'Circle' },\r
    { marker: 'rhombus', value: 80, label: 'Rhombus' },\r
    { marker: 'line', value: 75, label: 'Line' }\r
];\r
\r
/** A triangle outside the track, and a circle, a rhombus and a line on it. */\r
export default function TrackShapes() {\r
    return (\r
        <Stack orientation="horizontal" gap="lg" wrap align="end">\r
            {SHAPES.map(s => (\r
                <Gauge class="ga-track-marker" angle={180} fill={false} scale="ticks" tickInterval={50} marker={s.marker} value={s.value} label={s.label} />\r
            ))}\r
        </Stack>\r
    );\r
}\r
`,k=`import { Gauge, Stack } from '@motifx-community/ui';\r
\r
/** Upright gauges: \`size\` sets their length. The label sits above and the value under them. */\r
export default function Upright() {\r
    return (\r
        <Stack orientation="horizontal" gap="xl" wrap align="end">\r
            <Gauge class="ga-upright" type="linear" orientation="vertical" size={160} value={72} label="Tank" scale="ticks" />\r
            <Gauge type="linear" orientation="vertical" size={220} value={35} max={50} label="Fuel (l)" scale="ticks" tickInterval={10} minorTicks={1} />\r
            <Gauge type="linear" orientation="vertical" size={120} value={0.8} max={1} label="Load" format={{ style: 'percent' }} />\r
        </Stack>\r
    );\r
}\r
`,A=`import { Gauge, Stack } from '@motifx-community/ui';\r
\r
/** The value in the middle with a unit, a gauge that shows only its fill, and a needle that moves the value under the arc. */\r
export default function ValueLabel() {\r
    return (\r
        <Stack orientation="horizontal" gap="lg" wrap align="end">\r
            <Gauge value={21.5} label="Room" format={{ style: 'unit', unit: 'celsius', maximumFractionDigits: 1 }} />\r
            <Gauge value={21.5} max={40} label="Room" showValue={false} />\r
            <Gauge class="ga-needle-value" value={21.5} max={40} label="Room" marker="needle" format={{ style: 'unit', unit: 'celsius', maximumFractionDigits: 1 }} />\r
        </Stack>\r
    );\r
}\r
`,j=`import { reactive } from '@motifx/core';\r
import { DropDown, Gauge, Stack } from '@motifx-community/ui';\r
\r
const CITIES = [\r
    { name: 'Ankara', temperature: 14, humidity: 48, pressure: 1016 },\r
    { name: 'Lisbon', temperature: 21, humidity: 67, pressure: 1021 },\r
    { name: 'Oslo', temperature: -6, humidity: 81, pressure: 994 },\r
    { name: 'Cairo', temperature: 33, humidity: 22, pressure: 1009 }\r
];\r
\r
const PRESSURE = [\r
    { from: 900, to: 1000, label: 'low' },\r
    { from: 1000, to: 1020, label: 'normal' },\r
    { from: 1020, to: 1100, label: 'high' }\r
];\r
\r
/** Three upright gauges, each showing its value its own way: a fill from 0, a rhombus, a circle among ranges. */\r
export default function Weather() {\r
    const s = reactive({ city: 'Ankara' as string | null });\r
    const city = () => CITIES.find(c => c.name === s.city) ?? CITIES[0];\r
    return (\r
        <Stack gap="lg" align="center">\r
            <Stack orientation="horizontal" gap="xl" wrap justify="center">\r
                <Gauge class="ga-weather" type="linear" orientation="vertical" size={220} min={-40} max={40} baseValue={0} scale="ticks" tickInterval={20}\r
                    value={() => city().temperature} label="Temperature (°C)" />\r
                <Gauge class="ga-weather" type="linear" orientation="vertical" size={220} scale="ticks" tickInterval={10} fill={false} marker="rhombus"\r
                    value={() => city().humidity} label="Humidity (%)" />\r
                <Gauge class="ga-weather" type="linear" orientation="vertical" size={220} min={900} max={1100} scale="ticks" ticks={[900, 1000, 1020, 1100]}\r
                    fill={false} marker="circle" value={() => city().pressure} label="Pressure (hPa)" ranges={PRESSURE} />\r
            </Stack>\r
            <DropDown label="City" items={CITIES} textField="name" valueField="name" x-model={() => s.city} />\r
        </Stack>\r
    );\r
}\r
`;export{n as A,l as C,a as D,o as E,e as M,i as O,u as S,s as T,h as _,D as a,f as b,w as c,x as d,b as f,g,_ as h,O as i,t as j,r as k,C as l,v as m,A as n,E as o,y as p,k as r,T as s,j as t,S as u,m as v,c as w,d as x,p as y};