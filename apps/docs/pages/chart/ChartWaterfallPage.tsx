import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Waterfall from './examples/Waterfall';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const FIELDS = [
    ['totalField', '`string | (row) => unknown`', '', 'A row of a waterfall that shows the total so far.'],
    ['labels', "`'none' | 'last' | 'extremes' | 'all'`", "`'none'`", 'The values that show a label. A label that does not fit is omitted.'],
];

export default function ChartWaterfallPage() {
    return (
        <>
            <p class="lead">
                <Rich text="A waterfall shows how a starting value becomes an end value through changes up and down." />
            </p>

            <Section anchor="waterfall" title="Waterfall">
                <p>
                    <Rich text="`waterfall` adds each change to the last one, and a row with `totalField` set shows the total so far. A thin line carries the total from one step to the next." />
                </p>
                <Example files={code('Waterfall.tsx')}>
                    <Waterfall />
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
