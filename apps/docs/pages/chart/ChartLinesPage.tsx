import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Areas from './examples/Areas';
import Gaps from './examples/Gaps';
import Lines from './examples/Lines';
import TimeAxis from './examples/TimeAxis';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const FIELDS = [
    ['smooth', '`boolean`', '`false`', 'Curves the line without passing the values it connects.'],
    ['step', "`'start' | 'middle' | 'end'`", '', 'Draws a stepped line, and sets where the value changes.'],
    ['markers', '`boolean`', '`false`', 'Marks each value on a line.'],
    ['labels', "`'none' | 'last' | 'extremes' | 'all'`", "`'none'`", 'The values that show a label. A label that does not fit is omitted.'],
    ['gaps', "`'break' | 'connect' | 'zero'`", "`'break'`", 'How a line treats a missing value.'],
];

export default function ChartLinesPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Lines and areas show how values change along an axis: over time, or from one category to the next." />
            </p>

            <Section anchor="lines" title="Lines">
                <p>
                    <Rich text="A line is the default series type. `smooth` curves the line without adding a peak that is not in the data, and `labels` shows selected values on the chart. Point to a position to read every series at that position." />
                </p>
                <Example files={code('Lines.tsx')}>
                    <Lines />
                </Example>
            </Section>
            <Section anchor="areas" title="Areas">
                <p>
                    <Rich text="`stacked` adds the areas together, so that the top line shows the total." />
                </p>
                <Example files={code('Areas.tsx')}>
                    <Areas />
                </Example>
            </Section>
            <Section anchor="time" title="Dates">
                <p>
                    <Rich text="Date values produce a time axis, with marks on round days and months in the language of the page. Long series are reduced to what the width can display, and their peaks are preserved." />
                </p>
                <Example files={code('TimeAxis.tsx')}>
                    <TimeAxis />
                </Example>
            </Section>
            <Section anchor="gaps" title="Missing values">
                <p>
                    <Rich text="A missing value breaks the line, because nothing was measured at that position. `gaps` connects across it or treats it as zero, and `step` draws a stepped line." />
                </p>
                <Example files={code('Gaps.tsx')}>
                    <Gaps />
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
