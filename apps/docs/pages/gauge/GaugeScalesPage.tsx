import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Formats from './examples/Formats';
import OwnTicks from './examples/OwnTicks';
import Reversed from './examples/Reversed';
import ScaleModes from './examples/ScaleModes';
import Ticks from './examples/Ticks';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['scale', '`Bind<\'ends\' | \'ticks\' | \'none\'>`', '`\'ends\'`', 'What the scale shows.'],
    ['ticks', '`Bind<number[] | null>`', '`null`', 'The values of the ticks.'],
    ['tickInterval', '`Bind<number | null>`', 'An even step', 'How far apart the ticks are.'],
    ['minorTicks', '`Bind<number>`', '`0`', 'How many small ticks go between two ticks.'],
    ['min, max', '`Bind<number>`', '`0`, `100`', 'The ends of the scale. A `min` above `max` runs the scale the other way.'],
    ['format', '`Bind<ChartFormat | null>`', 'The language\'s numbers', 'How the values read: options of the browser\'s number format, or a function of your own.'],
];

export default function GaugeScalesPage() {
    return (
        <>
            <p class="lead">
                <Rich text="The scale tells the reader how to read the value: its ends, ticks with their values, or nothing at all." />
            </p>

            <Section anchor="ticks" title="Ticks">
                <p>
                    <Rich text="`scale: 'ticks'` draws ticks with their values. `tickInterval` sets the step, or an even step that fits the size is chosen. `minorTicks` puts small ticks between them." />
                </p>
                <Example stack files={code('Ticks.tsx')}>
                    <Ticks />
                </Example>
            </Section>
            <Section anchor="own" title="Ticks of your own">
                <p>
                    <Rich text="`ticks` places ticks only at the values given, where they mean something." />
                </p>
                <Example stack files={code('OwnTicks.tsx')}>
                    <OwnTicks />
                </Example>
            </Section>
            <Section anchor="reversed" title="A scale that runs down">
                <p>
                    <Rich text="A `min` above `max` runs the scale the other way, for what is counted down." />
                </p>
                <Example stack files={code('Reversed.tsx')}>
                    <Reversed />
                </Example>
            </Section>
            <Section anchor="formats" title="Formats">
                <p>
                    <Rich text="`format` writes the value and the scale: options of the browser's number format, in the language of the page, or a function of your own." />
                </p>
                <Example stack files={code('Formats.tsx')}>
                    <Formats />
                </Example>
            </Section>
            <Section anchor="modes" title="Ends, ticks or nothing">
                <p>
                    <Rich text="`scale` shows the two ends, `'ends'`, ticks, `'ticks'`, or nothing, `'none'`, where the value alone is enough." />
                </p>
                <Example stack files={code('ScaleModes.tsx')}>
                    <ScaleModes />
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
