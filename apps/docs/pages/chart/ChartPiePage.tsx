import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Parts from './examples/Parts';
import PieLabels from './examples/PieLabels';
import PieChoose from './examples/PieChoose';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const FIELDS = [
    ['innerRadius', '`number`', 'From the design language', 'The hole of a donut, as a share of its radius.'],
    ['startAngle', '`number`', '`0`', 'Where the first slice starts, in degrees from the top, clockwise.'],
    ['labels', "`'none' | 'last' | 'extremes' | 'all'`", "`'none'`", 'The values that show a label. A label that does not fit is omitted.'],
];

export default function ChartPiePage() {
    return (
        <>
            <p class="lead">
                <Rich text="A pie or a donut splits one whole into its parts, for a share seen at a glance." />
            </p>

            <Section anchor="parts" title="Pie and donut">
                <p>
                    <Rich text="`pie` and `donut` split one whole into its parts. Shares are written inside the slices that have room for them, the legend names every part, and a donut shows the total in its middle. For close values, bars compare more exactly." />
                </p>
                <Example stack files={code('Parts.tsx')}>
                    <Parts />
                </Example>
            </Section>
            <Section anchor="labels" title="Labels and starting angle">
                <p>
                    <Rich text="`labels: 'all'` writes a value on every part that has room for it, in the series' `format`. `startAngle` turns the first part to another position, and `innerRadius` sets the width of the ring." />
                </p>
                <Example files={code('PieLabels.tsx')}>
                    <PieLabels />
                </Example>
            </Section>
            <Section anchor="choose" title="Choosing a part">
                <p>
                    <Rich text="`pointSelection` lets the reader choose a part with a click or with Enter. `onSelectionChanged` gives the chosen point, with its `share` of the whole." />
                </p>
                <Example stack files={code('PieChoose.tsx')}>
                    <PieChoose />
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
