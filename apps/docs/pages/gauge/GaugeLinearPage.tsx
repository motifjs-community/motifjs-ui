import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Across from './examples/Across';
import Drives from './examples/Drives';
import Upright from './examples/Upright';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['type', '`Bind<\'arc\' | \'circle\' | \'linear\'>`', '`\'arc\'`', 'How it draws.'],
    ['orientation', '`Bind<\'horizontal\' | \'vertical\'>`', '`\'horizontal\'`', 'Which way a straight gauge runs.'],
    ['size', '`Bind<number | null>`', 'From the design language', 'The width of an arc\'s whole circle, or the length of an upright gauge, in pixels.'],
    ['label', '`Bind<string>`', '`\'\'`', 'What it measures, shown under the value and read as its name.'],
    ['format', '`Bind<ChartFormat | null>`', 'The language\'s numbers', 'How the values read: options of the browser\'s number format, or a function of your own.'],
];

export default function GaugeLinearPage() {
    return (
        <>
            <p class="lead">
                <Rich text="A linear gauge shows its value on a straight bar, across or upright. Bars fit in narrow places, line up in lists, and compare well side by side." />
            </p>

            <Section anchor="across" title="Across">
                <p>
                    <Rich text="`type: 'linear'` draws a bar across the width it is given. The label and the value sit above it; the ends of the scale sit under its ends, or ticks with `scale`." />
                </p>
                <Example stack files={code('Across.tsx')}>
                    <Across />
                </Example>
            </Section>
            <Section anchor="upright" title="Upright">
                <p>
                    <Rich text="`orientation: 'vertical'` stands the bar upright, and `size` sets its length. The label sits above and the value under it." />
                </p>
                <Example stack files={code('Upright.tsx')}>
                    <Upright />
                </Example>
            </Section>
            <Section anchor="list" title="In a list">
                <p>
                    <Rich text="Bars one under another read as a list. Here a range marks the last tenth of each drive, and its tone shows when a drive is almost full." />
                </p>
                <Example stack files={code('Drives.tsx')}>
                    <Drives />
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
