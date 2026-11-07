import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Funnel from './examples/Funnel';

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
        </>
    );
}
