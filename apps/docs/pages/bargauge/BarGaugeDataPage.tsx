import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import BothWays from './examples/BothWays';
import Changing from './examples/Changing';
import LiveBars from './examples/LiveBars';
import Rows from './examples/Rows';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['data', '`Bind<(T | number)[]>`', '`[]`', 'The values: numbers, or rows with `valueField`. They are read and never changed.'],
    ['valueField', '`Bind<ChartField<T> | null>`', '`null`', 'The field of a row that holds its value, or a function that reads it.'],
    ['nameField', '`Bind<ChartField<T> | null>`', '`null`', 'The field of a row that holds its name, shown in the legend and the tooltip and read with its value.'],
    ['colorField', '`Bind<ChartField<T> | null>`', '`null`', 'The field of a row that holds a color of its own.'],
    ['baseValue', '`Bind<number | null>`', 'The start of the scale', 'Where the bars start, so they grow both ways from a value inside the scale.'],
    ['min, max', '`Bind<number>`', '`0`, `100`', 'The ends of the scale.'],
];

export default function BarGaugeDataPage() {
    return (
        <>
            <p class="lead">
                <Rich text="A bar gauge reads numbers, or rows through their fields, and follows them as they change." />
            </p>

            <Section anchor="rows" title="Numbers or rows">
                <p>
                    <Rich text="`data` takes numbers, or rows with `valueField` and `nameField`. A field can be a function that works the value out; the rows stay as they are." />
                </p>
                <Example files={code('Rows.tsx')}>
                    <Rows />
                </Example>
            </Section>
            <Section anchor="both-ways" title="Both ways from a base value">
                <p>
                    <Rich text="`baseValue` sets where the bars start, so values below and above it go either way." />
                </p>
                <Example files={code('BothWays.tsx')}>
                    <BothWays />
                </Example>
            </Section>
            <Section anchor="changing" title="A changing number of bars">
                <p>
                    <Rich text="The bars follow the data: a new bar grows from the base value. `colorField` keeps each row's color, so the others keep theirs when one goes." />
                </p>
                <Example files={code('Changing.tsx')}>
                    <Changing />
                </Example>
            </Section>
            <Section anchor="live" title="Live values">
                <p>
                    <Rich text="New values every second. Each change moves over the motion of the design language." />
                </p>
                <Example stack files={code('LiveBars.tsx')}>
                    <LiveBars />
                </Example>
            </Section>
            <Section anchor="api" title="Props on this page">
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <p>
                    <Rich text="Every other prop and member is on the [Overview](/bar-gauge#api)." />
                </p>
            </Section>
        </>
    );
}
