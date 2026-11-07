import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Balance from './examples/Balance';
import Deviation from './examples/Deviation';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['baseValue', '`Bind<number | null>`', 'The start of the scale', 'Where the fill starts.'],
    ['fill', '`Bind<boolean>`', '`true`', 'Fills the track from `baseValue` to the value.'],
    ['ranges', '`Bind<GaugeRange[]>`', '`[]`', 'Stretches of the scale: `from`, `to`, `tone` or `color`, and a `label` read with the value. A range with neither a tone nor a color takes the next chart color.'],
];

export default function GaugeBasePage() {
    return (
        <>
            <p class="lead">
                <Rich text="The fill starts at the start of the scale, or at a base value inside it. A scale with values on both sides of a target then fills from the target, either way." />
            </p>

            <Section anchor="deviation" title="Either way from a target">
                <p>
                    <Rich text="`baseValue` sets where the fill starts. A deviation fills from 0 to the left or to the right, on an arc and on a bar." />
                </p>
                <Example stack files={code('Deviation.tsx')}>
                    <Deviation />
                </Example>
            </Section>
            <Section anchor="balance" title="Losses and profits">
                <p>
                    <Rich text="Bars in a list, each filling from 0: a loss to the left in the danger tone, a profit to the right in the good tone." />
                </p>
                <Example stack files={code('Balance.tsx')}>
                    <Balance />
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
