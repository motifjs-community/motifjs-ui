import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Funnel from './examples/Funnel';
import FunnelLabels from './examples/FunnelLabels';
import FunnelPeriods from './examples/FunnelPeriods';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

export default function ChartFunnelPage() {
    return (
        <>
            <p class="lead">
                <Rich text="A funnel follows a quantity through stages in order, and shows how much of it is left at each one." />
            </p>

            <Section anchor="funnel" title="Funnel">
                <p>
                    <Rich text="`funnel` shows stages in the order of the rows, each with the share of the first stage that is left. The stages take one hue, darker towards the first, as they are in order." />
                </p>
                <Example files={code('Funnel.tsx')}>
                    <Funnel />
                </Example>
            </Section>
            <Section anchor="labels" title="Values and clicks">
                <p>
                    <Rich text="`labels: 'all'` writes the value on every stage. `onPointClick` gives the stage that was clicked, for a detail of your own such as the conversion from the first stage." />
                </p>
                <Example stack files={code('FunnelLabels.tsx')}>
                    <FunnelLabels />
                </Example>
            </Section>
            <Section anchor="periods" title="Another period">
                <p>
                    <Rich text="New rows redraw the funnel, and the stages animate to their new sizes. Use this to compare periods or segments with the same stages." />
                </p>
                <Example stack files={code('FunnelPeriods.tsx')}>
                    <FunnelPeriods />
                </Example>
            </Section>
        </>
    );
}
