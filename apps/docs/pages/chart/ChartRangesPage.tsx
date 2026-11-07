import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Ranges from './examples/Ranges';
import RangesForecast from './examples/RangesForecast';
import RangesTimeline from './examples/RangesTimeline';

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
            <Section anchor="forecast" title="Forecast with a range">
                <p>
                    <Rich text="Each series can take rows of its own with `data`. Here the actual values, the forecast and its likely range share one category axis, and the band widens as the forecast goes further." />
                </p>
                <Example files={code('RangesForecast.tsx')}>
                    <RangesForecast />
                </Example>
            </Section>
            <Section anchor="timeline" title="Timeline">
                <p>
                    <Rich text="`rangeBar` with `horizontal` lays out start and end values on their side, as in a project plan. A reference line marks the current week." />
                </p>
                <Example files={code('RangesTimeline.tsx')}>
                    <RangesTimeline />
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
