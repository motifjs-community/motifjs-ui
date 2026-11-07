import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Horizontal from './examples/Horizontal';
import Negative from './examples/Negative';
import Stacked from './examples/Stacked';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const FIELDS = [
    ['stack', '`string | boolean`', 'The chart\'s `stacked`', 'Series with the same name stack on each other.'],
    ['labels', "`'none' | 'last' | 'extremes' | 'all'`", "`'none'`", 'The values that show a label. A label that does not fit is omitted.'],
];

export default function ChartBarsPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Bars compare amounts. They stand on a common baseline, so lengths compare exactly, side by side, stacked, or on their side for long names." />
            </p>

            <Section anchor="stacked" title="Grouped and stacked bars">
                <p>
                    <Rich text="Bars are grouped side by side by default. `stacked` places them on top of each other, as values or as percentages. Use `stack` on a series to assign it to a named stack." />
                </p>
                <Example stack files={code('Stacked.tsx', 'sales.ts')}>
                    <Stacked />
                </Example>
            </Section>
            <Section anchor="horizontal" title="Horizontal charts">
                <p>
                    <Rich text="`horizontal` suits long category names and rankings. Rows keep the order in which they are provided." />
                </p>
                <Example files={code('Horizontal.tsx')}>
                    <Horizontal />
                </Example>
            </Section>
            <Section anchor="negative" title="Negative values">
                <p>
                    <Rich text="Bars extend in both directions from zero. A label that does not fit or that would cover another label is omitted, and its value remains available in the tooltip and the table view." />
                </p>
                <Example files={code('Negative.tsx')}>
                    <Negative />
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
