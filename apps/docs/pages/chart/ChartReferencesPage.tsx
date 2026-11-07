import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import References from './examples/References';
import Selection from './examples/Selection';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

export default function ChartReferencesPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Reference lines and bands give the values a target, a limit or a period, and the reader can choose values to act on." />
            </p>

            <Section anchor="references" title="Reference lines and bands">
                <p>
                    <Rich text="`references` draws a line at a value or a position, or a band between two, with an optional label." />
                </p>
                <Example files={code('References.tsx', 'sales.ts')}>
                    <References />
                </Example>
            </Section>
            <Section anchor="selection" title="Choosing values">
                <p>
                    <Rich text="`pointSelection` lets a click or Enter choose one value or several. `onSelectionChanged` gives the values chosen, `selectedPoints` reads them and `clearSelection()` lets them go." />
                </p>
                <Example stack files={code('Selection.tsx', 'sales.ts')}>
                    <Selection />
                </Example>
            </Section>
        </>
    );
}
