import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Scatter from './examples/Scatter';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const FIELDS = [
    ['sizeField', '`string | (row) => unknown`', '', 'The size of a bubble.'],
    ['markers', '`boolean`', '`false`', 'Marks each value on a line.'],
];

export default function ChartScatterPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Scatter and bubble charts place each row by two numbers, to show how they relate." />
            </p>

            <Section anchor="scatter" title="Scatter and bubble charts">
                <p>
                    <Rich text="`scatter` and `bubble` plot two numeric values. `sizeField` adds a third value to a bubble, represented by its area. The pointer selects the nearest point." />
                </p>
                <Example files={code('Scatter.tsx')}>
                    <Scatter />
                </Example>
            </Section>
            <Section anchor="api" title="API reference">
                <ApiTable head={['Field', 'Type', 'Default', 'Description']} rows={FIELDS} />
                <p>
                    <Rich text="Every other prop, member and event is on the [Overview](/chart#api)." />
                </p>
            </Section>
        </>
    );
}
