import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Ranges from './examples/Ranges';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const FIELDS = [
    ['lowField, highField', '`string | (row) => unknown`', '', 'The ends of a range, and the lowest and highest price of a candle.'],
];

export default function ChartRangesPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Ranges show a low and a high value for each position, as a band or as floating bars." />
            </p>

            <Section anchor="ranges" title="Ranges">
                <p>
                    <Rich text="`rangeArea` and `rangeBar` draw from `lowField` to `highField`, and other series share the axis." />
                </p>
                <Example files={code('Ranges.tsx')}>
                    <Ranges />
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
