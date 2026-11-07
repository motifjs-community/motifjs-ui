import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import Programmatic from './examples/Programmatic';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PAGES = [
    ['[Labels and legend](/bar-gauge/labels)', 'Values at the ends of the bars, formats, a legend and the tooltip.'],
    ['[Data](/bar-gauge/data)', 'Numbers or rows, fields and functions, bars both ways, a changing number of bars, live values.'],
    ['[Angles and size](/bar-gauge/angles)', 'A whole circle, halves and quarters, and many bars in one gauge.'],
];

const PROPS = [
    ['data', '`Bind<(T | number)[]>`', '`[]`', 'The values: numbers, or rows with `valueField`. They are read and never changed.'],
    ['valueField', '`Bind<ChartField<T> | null>`', '`null`', 'The field of a row that holds its value, or a function that reads it.'],
    ['nameField', '`Bind<ChartField<T> | null>`', '`null`', 'The field of a row that holds its name, shown in the legend and the tooltip and read with its value.'],
    ['colorField', '`Bind<ChartField<T> | null>`', '`null`', 'The field of a row that holds a color of its own.'],
    ['min, max', '`Bind<number>`', '`0`, `100`', 'The ends of the scale.'],
    ['baseValue', '`Bind<number | null>`', 'The start of the scale', 'Where the bars start, so they grow both ways from a value inside the scale.'],
    ['angle', '`Bind<number>`', '`270`', 'How far the bars go round, in degrees.'],
    ['rotation', '`Bind<number>`', '`0`', 'How far the middle of the bars is turned from the top, clockwise, in degrees.'],
    ['colors', '`Bind<string[] | null>`', 'The chart colors', 'Colors of your own, in the order of the values.'],
    ['label', '`Bind<string>`', '`\'\'`', 'What the values are, read as its name.'],
    ['format', '`Bind<ChartFormat | null>`', 'The language\'s numbers', 'How the values read: options of the browser\'s number format, or a function of your own.'],
    ['showLabels', '`Bind<boolean>`', '`true`', 'Writes each value at the end of its bar.'],
    ['legend', '`Bind<boolean>`', '`false`', 'Shows a legend of the names under the bars.'],
    ['tooltip', '`Bind<boolean>`', '`true`', 'Shows the value under the pointer.'],
    ['size', '`Bind<number | null>`', 'From the design language', 'The width of the bars\' whole circle in pixels.'],
];

const MEMBERS = [
    ['refresh()', 'Draws again after the given rows were changed in place.'],
];

const A11Y = [
    ['Role', 'It has the role `img`, and its name gives every value with its name.'],
    ['Color', 'A color is never the only sign: each value is written at the end of its bar, or named in the legend.'],
    ['Motion', 'A change moves over the motion of the design language, and at once when the reader prefers reduced motion. A new bar grows from the base value.'],
];

export default function BarGaugePage() {
    return (
        <>
            <p class="lead">
                <Rich text="Shows several values side by side as bars bent round one middle, each against the same scale. It compares a few values at a glance, in little room." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { BarGauge } from '@motifx-community/ui';
`}
                />
            </Section>
            <Section anchor="basic" title="A first bar gauge">
                <p>
                    <Rich text="`data` takes the values, the first one on the outside. Each value is written at the end of its bar." />
                </p>
                <Example files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>
            <Section anchor="pages" title="More about bar gauges">
                <p>
                    <Rich text="Each part has its own page." />
                </p>
                <ApiTable head={['Page', 'Covers']} rows={PAGES} />
            </Section>
            <Section anchor="programmatic" title="Creating it programmatically">
                <p>
                    <Rich text="Each prop is also a property: set it later, and the gauge draws again. A new bar grows from the base value." />
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
                    <Rich text="Members" />
                </h3>
                <ApiTable head={['Member', 'Description']} rows={MEMBERS} />
                <h3>
                    <Rich text="Accessibility" />
                </h3>
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>
        </>
    );
}
