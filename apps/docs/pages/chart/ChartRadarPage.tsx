import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Radar from './examples/Radar';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const FIELDS = [
    ['markers', '`boolean`', '`false`', 'Marks each value on a line.'],
];

export default function ChartRadarPage() {
    return (
        <>
            <p class="lead">
                <Rich text="A radar compares several measures at once, for one or more items." />
            </p>

            <Section anchor="radar" title="Radar">
                <p>
                    <Rich text="`radar` places a spoke for each category around a center and draws a shape for each series." />
                </p>
                <Example files={code('Radar.tsx')}>
                    <Radar />
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
