import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import ArcCircle from './examples/ArcCircle';
import HalfQuarter from './examples/HalfQuarter';
import Sizes from './examples/Sizes';
import ValueLabel from './examples/ValueLabel';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['type', '`Bind<\'arc\' | \'circle\' | \'linear\'>`', '`\'arc\'`', 'How it draws.'],
    ['angle', '`Bind<number>`', '`240`', 'How far an arc goes round, in degrees.'],
    ['rotation', '`Bind<number>`', '`0`', 'How far the middle of an arc is turned from the top, clockwise, in degrees.'],
    ['size', '`Bind<number | null>`', 'From the design language', 'The width of an arc\'s whole circle, or the length of an upright gauge, in pixels.'],
    ['showValue', '`Bind<boolean>`', '`true`', 'Shows the value in the middle.'],
    ['label', '`Bind<string>`', '`\'\'`', 'What it measures, shown under the value and read as its name.'],
    ['format', '`Bind<ChartFormat | null>`', 'The language\'s numbers', 'How the values read: options of the browser\'s number format, or a function of your own.'],
];

export default function GaugeCircularPage() {
    return (
        <>
            <p class="lead">
                <Rich text="A circular gauge shows its value on an arc or a whole circle, with the value written in the middle. It reads best for one value whose scale the reader knows, such as a speed or a share." />
            </p>

            <Section anchor="arc" title="Arc and circle">
                <p>
                    <Rich text="`type` draws an open arc, `'arc'`, or a whole circle, `'circle'`. `angle` sets how far an arc goes round: 240 degrees by default, open at the bottom." />
                </p>
                <Example stack files={code('ArcCircle.tsx')}>
                    <ArcCircle />
                </Example>
            </Section>
            <Section anchor="half" title="Half and quarter">
                <p>
                    <Rich text="`angle` of 180 draws a half and 90 a quarter; `rotation` turns the arc, here to each corner. A quarter has little room inside, so its value is better left out with `showValue`." />
                </p>
                <Example stack files={code('HalfQuarter.tsx')}>
                    <HalfQuarter />
                </Example>
            </Section>
            <Section anchor="size" title="Size">
                <p>
                    <Rich text="`size` sets the width of the arc's whole circle, with its ranges. Ticks, their values and marks go around it, so a scale never makes the arc smaller." />
                </p>
                <Example stack files={code('Sizes.tsx')}>
                    <Sizes />
                </Example>
            </Section>
            <Section anchor="value" title="Value and label">
                <p>
                    <Rich text="The value is written in the middle with `format`, and `label` under it. `showValue` leaves the value out. With a needle, the value moves under the arc to keep the middle clear." />
                </p>
                <Example stack files={code('ValueLabel.tsx')}>
                    <ValueLabel />
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
