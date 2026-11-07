import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Directions from './examples/Directions';
import Many from './examples/Many';
import Shapes from './examples/Shapes';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['angle', '`Bind<number>`', '`270`', 'How far the bars go round, in degrees.'],
    ['rotation', '`Bind<number>`', '`0`', 'How far the middle of the bars is turned from the top, clockwise, in degrees.'],
    ['size', '`Bind<number | null>`', 'From the design language', 'The width of the bars\' whole circle in pixels.'],
    ['colors', '`Bind<string[] | null>`', 'The chart colors', 'Colors of your own, in the order of the values.'],
];

export default function BarGaugeAnglesPage() {
    return (
        <>
            <p class="lead">
                <Rich text="How far the bars go round and which way they face fit a bar gauge to the room it has." />
            </p>

            <Section anchor="angle" title="Circle and halves">
                <p>
                    <Rich text="`angle` sets how far the bars go round: 270 degrees by default, a whole circle at 360. `rotation` turns them." />
                </p>
                <Example files={code('Shapes.tsx')}>
                    <Shapes />
                </Example>
            </Section>
            <Section anchor="quarters" title="Quarters">
                <p>
                    <Rich text="A quarter turned to a corner fits the corner of a card." />
                </p>
                <Example files={code('Directions.tsx')}>
                    <Directions />
                </Example>
            </Section>
            <Section anchor="many" title="Many bars">
                <p>
                    <Rich text="`size` sets the width of the whole circle. With many bars they grow thinner, so the middle stays open." />
                </p>
                <Example files={code('Many.tsx')}>
                    <Many />
                </Example>
            </Section>
            <Section anchor="api" title="Props on this page">
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <p>
                    <Rich text="Every other prop and member is on the [Overview](/bar-gauge#api)." />
                </p>
            </Section>
        </>
    );
}
