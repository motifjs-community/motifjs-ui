import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import ChartColors from './examples/ChartColors';
import OwnColors from './examples/OwnColors';
import Ranges from './examples/Ranges';
import ReadRange from './examples/ReadRange';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['ranges', '`Bind<GaugeRange[]>`', '`[]`', 'Stretches of the scale: `from`, `to`, `tone` or `color`, and a `label` read with the value. A range with neither a tone nor a color takes the next chart color.'],
];

export default function GaugeRangesPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Ranges give stretches of the scale a meaning, such as normal, high and critical. They show as a band beside the track, and the fill takes the color of the range its value is in." />
            </p>

            <Section anchor="tones" title="Tones">
                <p>
                    <Rich text="`tone` takes a meaning in the colors of the design language: `good`, `warning`, `danger` or `neutral`. The fill changes color where it crosses into a range." />
                </p>
                <Example stack files={code('Ranges.tsx')}>
                    <Ranges />
                </Example>
            </Section>
            <Section anchor="colors" title="Colors of your own">
                <p>
                    <Rich text="`color` takes any color instead of a tone." />
                </p>
                <Example stack files={code('OwnColors.tsx')}>
                    <OwnColors />
                </Example>
            </Section>
            <Section anchor="chart-colors" title="Chart colors">
                <p>
                    <Rich text="A range with neither a tone nor a color takes the next chart color, so ranges without a meaning of good or bad still read apart." />
                </p>
                <Example stack files={code('ChartColors.tsx')}>
                    <ChartColors />
                </Example>
            </Section>
            <Section anchor="read" title="Read with the value">
                <p>
                    <Rich text="A range's `label` is read with the value by assistive technology, so the meaning does not rest on color alone." />
                </p>
                <Example stack files={code('ReadRange.tsx')}>
                    <ReadRange />
                </Example>
            </Section>
            <Section anchor="api" title="Props on this page">
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <p>
                    <Rich text="Every other prop, and the types of ranges and marks, are on the [Overview](/gauge#api)." />
                </p>
            </Section>
        </>
    );
}
