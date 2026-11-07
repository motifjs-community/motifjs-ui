import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import First from './examples/First';
import Programmatic from './examples/Programmatic';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const KINDS = [
    ['[Circular](/gauge/circular)', '`type: \'arc\'` or `\'circle\'`', 'An arc, a whole circle, a half or a quarter, with the value in the middle.'],
    ['[Linear](/gauge/linear)', '`type: \'linear\'`', 'A straight bar, across or upright, alone or in a list.'],
    ['[BarGauge](/bar-gauge)', '`BarGauge`', 'Several values against one scale, as bars bent round one middle.'],
];

const PARTS = [
    ['[Scales](/gauge/scales)', 'The ends or ticks with their values, small ticks, ticks of your own, a scale that runs down, formats.'],
    ['[Ranges](/gauge/ranges)', 'Stretches of the scale with a meaning: tones, colors of your own, the chart colors, and their names read with the value.'],
    ['[Markers](/gauge/markers)', 'Needles, triangles, circles, rhombuses, lines and callouts that point at the value, with or without the fill.'],
    ['[Marks](/gauge/marks)', 'Targets and limits marked on the scale, with names, shapes, and values that change.'],
    ['[Base value](/gauge/base-value)', 'A fill that grows from a value inside the scale, to either side.'],
    ['[Dashboards](/gauge/dashboards)', 'Gauges put together and driven by the same values, live.'],
];

const CHOOSE = [
    ['One value against a known scale, read at a glance', '`Gauge`'],
    ['A few values side by side against one scale', '[BarGauge](/bar-gauge)'],
    ['How far a task has come', '[ProgressBar](/progress)'],
    ['How a value changes over time', '[Chart](/chart) or [Sparkline](/sparkline)'],
    ['Many exact values to compare and sort', '[DataGrid](/datagrid)'],
];

const PROPS = [
    ['value', '`Bind<number | null>`', '`null`', 'The value.'],
    ['min, max', '`Bind<number>`', '`0`, `100`', 'The ends of the scale. A `min` above `max` runs the scale the other way.'],
    ['type', '`Bind<\'arc\' | \'circle\' | \'linear\'>`', '`\'arc\'`', 'How it draws.'],
    ['orientation', '`Bind<\'horizontal\' | \'vertical\'>`', '`\'horizontal\'`', 'Which way a straight gauge runs.'],
    ['angle', '`Bind<number>`', '`240`', 'How far an arc goes round, in degrees.'],
    ['rotation', '`Bind<number>`', '`0`', 'How far the middle of an arc is turned from the top, clockwise, in degrees.'],
    ['ranges', '`Bind<GaugeRange[]>`', '`[]`', 'Stretches of the scale: `from`, `to`, `tone` or `color`, and a `label` read with the value. A range with neither a tone nor a color takes the next chart color.'],
    ['scale', '`Bind<\'ends\' | \'ticks\' | \'none\'>`', '`\'ends\'`', 'What the scale shows.'],
    ['ticks', '`Bind<number[] | null>`', '`null`', 'The values of the ticks.'],
    ['tickInterval', '`Bind<number | null>`', 'An even step', 'How far apart the ticks are.'],
    ['minorTicks', '`Bind<number>`', '`0`', 'How many small ticks go between two ticks.'],
    ['fill', '`Bind<boolean>`', '`true`', 'Fills the track from `baseValue` to the value.'],
    ['baseValue', '`Bind<number | null>`', 'The start of the scale', 'Where the fill starts.'],
    ['marker', '`Bind<\'needle\' | \'triangle\' | \'circle\' | \'rhombus\' | \'line\' | \'text\' | null>`', '`null`', 'A shape that points at the value. On a straight gauge a needle is a triangle.'],
    ['needleShape', '`Bind<\'tapered\' | \'straight\' | \'two-tone\'>`', '`\'tapered\'`', 'How a needle is drawn.'],
    ['marks', '`Bind<GaugeMark[]>`', '`[]`', 'Other values marked on the scale: `value`, a `label`, and a `shape` of their own.'],
    ['markShape', '`Bind<GaugeMarker>`', '`\'triangle\'`', 'The shape of the marks, unless a mark has its own.'],
    ['label', '`Bind<string>`', '`\'\'`', 'What it measures, shown under the value and read as its name.'],
    ['format', '`Bind<ChartFormat | null>`', 'The language\'s numbers', 'How the values read: options of the browser\'s number format, or a function of your own.'],
    ['showValue', '`Bind<boolean>`', '`true`', 'Shows the value in the middle.'],
    ['tooltip', '`Bind<boolean>`', '`true`', 'Shows the value or the mark under the pointer.'],
    ['size', '`Bind<number | null>`', 'From the design language', 'The width of an arc\'s whole circle, or the length of an upright gauge, in pixels.'],
];

const RANGE = [
    ['from, to', '`number`', 'Required', 'The ends of the range, in either order.'],
    ['tone', '`\'neutral\' | \'good\' | \'warning\' | \'danger\'`', '', 'A meaning in the colors of the design language. The fill takes it while the value is in the range.'],
    ['color', '`string`', '', 'A color of your own instead of a tone.'],
    ['label', '`string`', '', 'A name for the range, read with the value.'],
];

const MARK = [
    ['value', '`number`', 'Required', 'The value marked.'],
    ['label', '`string`', '', 'What it is, read with the gauge\'s value and shown in the tooltip.'],
    ['shape', '`GaugeMarker`', 'The gauge\'s `markShape`', 'Its shape: `needle`, `triangle`, `circle`, `rhombus`, `line` or `text`.'],
];

const A11Y = [
    ['Role', 'It is a meter: assistive technology reads its value, its scale, the range the value is in, and the marks with their names.'],
    ['Color', 'A tone is never the only sign: the value is written, and a range\'s label is read with it.'],
    ['Motion', 'A change of value moves over the motion of the design language, and at once when the reader prefers reduced motion. Values that come quicker than the motion, from a drag or a fast feed, are drawn at once, so the gauge keeps up with them.'],
];

export default function GaugePage() {
    return (
        <>
            <p class="lead">
                <Rich text="Shows a value against its scale, as an arc, a circle or a straight bar. Ranges give stretches of the scale a meaning, markers and marks point at values, and every part takes its look from the design language." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { Gauge } from '@motifx-community/ui';
`}
                />
            </Section>
            <Section anchor="basic" title="A first gauge">
                <p>
                    <Rich text="`value` is the value and `label` says what it measures; the scale runs from `min` to `max`, 0 to 100 by default. A function as the value is followed, so the gauge moves with the data." />
                </p>
                <Example stack files={code('First.tsx')}>
                    <First />
                </Example>
            </Section>
            <Section anchor="kinds" title="Kinds of gauges">
                <p>
                    <Rich text="`type` sets the shape. Each kind has its own page." />
                </p>
                <ApiTable head={['Page', 'Set with', 'Shows']} rows={KINDS} />
            </Section>
            <Section anchor="parts" title="Parts of a gauge">
                <p>
                    <Rich text="The parts work the same on every kind." />
                </p>
                <ApiTable head={['Page', 'Covers']} rows={PARTS} />
            </Section>
            <Section anchor="choosing" title="Choosing a gauge">
                <p>
                    <Rich text="A gauge suits one value whose scale the reader knows. For other needs, other components read better." />
                </p>
                <ApiTable head={['To show', 'Use']} rows={CHOOSE} />
            </Section>
            <Section anchor="motion" title="Changes and motion">
                <p>
                    <Rich text="A new value moves the fill and the markers over the motion of the design language. Values that come quicker than that, from a drag or a live feed, are drawn at once, so the gauge never trails behind them. The [Dashboards](/gauge/dashboards) page shows gauges with live values." />
                </p>
            </Section>
            <Section anchor="programmatic" title="Creating it programmatically">
                <p>
                    <Rich text="Each prop is also a property: set it later, and the gauge draws again." />
                </p>
                <Example stack files={code('Programmatic.tsx')}>
                    <Programmatic />
                </Example>
            </Section>
            <Section anchor="api" title="API reference">
                <h3>
                    <Rich text="Props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                    <Rich text="GaugeRange" />
                </h3>
                <ApiTable head={['Field', 'Type', 'Default', 'Description']} rows={RANGE} />
                <h3>
                    <Rich text="GaugeMark" />
                </h3>
                <ApiTable head={['Field', 'Type', 'Default', 'Description']} rows={MARK} />
                <h3>
                    <Rich text="Accessibility" />
                </h3>
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>
        </>
    );
}
