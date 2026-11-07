import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Radar from './examples/Radar';
import RadarTarget from './examples/RadarTarget';
import RadarYear from './examples/RadarYear';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const FIELDS = [
    ['markers', '`boolean`', '`false`', 'Marks each value on a line.'],
];

export default function ChartRadarPage() {
    return (
        <>
            <p class="lead">
                <Rich text="A radar compares several measures at once, for one or more items." />
            </p>

            <Section anchor="radar" title="Radar">
                <p>
                    <Rich text="`radar` places a spoke for each category around a center and draws a shape for each series." />
                </p>
                <Example files={code('Radar.tsx')}>
                    <Radar />
                </Example>
            </Section>
            <Section anchor="scale" title="Fixed scale and a target">
                <p>
                    <Rich text="Set `min` and `max` on the value axis so that shapes compare against the same scale. A target series gives a reference shape; the reader can hide series in the legend." />
                </p>
                <Example files={code('RadarTarget.tsx')}>
                    <RadarTarget />
                </Example>
            </Section>
            <Section anchor="cycle" title="A year around the circle">
                <p>
                    <Rich text="A radar suits data that repeats in a cycle, such as the months of a year, because the last position joins the first." />
                </p>
                <Example files={code('RadarYear.tsx')}>
                    <RadarYear />
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
