import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Dashboard from './examples/Dashboard';
import ServerLoad from './examples/ServerLoad';
import Weather from './examples/Weather';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['value', '`Bind<number | null>`', '`null`', 'The value.'],
    ['marker', '`Bind<\'needle\' | \'triangle\' | \'circle\' | \'rhombus\' | \'line\' | \'text\' | null>`', '`null`', 'A shape that points at the value. On a straight gauge a needle is a triangle.'],
    ['ranges', '`Bind<GaugeRange[]>`', '`[]`', 'Stretches of the scale: `from`, `to`, `tone` or `color`, and a `label` read with the value. A range with neither a tone nor a color takes the next chart color.'],
];

export default function GaugeDashboardsPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Gauges of different kinds put together, all following the same values. Each gauge keeps its own scale, so readers compare values by their meaning, not by size alone." />
            </p>

            <Section anchor="upright" title="Upright gauges side by side">
                <p>
                    <Rich text="Three upright gauges, each showing its value its own way, follow the city chosen: a fill from 0, a rhombus, and a circle among ranges." />
                </p>
                <Example stack files={code('Weather.tsx')}>
                    <Weather />
                </Example>
            </Section>
            <Section anchor="dashboard" title="A dashboard">
                <p>
                    <Rich text="A speedometer with a needle, four quarter gauges around it, and a fuel bar, all driven by one slider." />
                </p>
                <Example stack files={code('Dashboard.tsx')}>
                    <Dashboard />
                </Example>
            </Section>
            <Section anchor="live" title="Live values">
                <p>
                    <Rich text="New values every second. Each change moves over the motion of the design language, and values that come quicker than it are drawn at once." />
                </p>
                <Example stack files={code('ServerLoad.tsx')}>
                    <ServerLoad />
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
