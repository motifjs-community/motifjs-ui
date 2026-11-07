import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import BarMarks from './examples/BarMarks';
import MarkShapes from './examples/MarkShapes';
import MovingMarks from './examples/MovingMarks';
import Targets from './examples/Targets';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['marks', '`Bind<GaugeMark[]>`', '`[]`', 'Other values marked on the scale: `value`, a `label`, and a `shape` of their own.'],
    ['markShape', '`Bind<GaugeMarker>`', '`\'triangle\'`', 'The shape of the marks, unless a mark has its own.'],
    ['tooltip', '`Bind<boolean>`', '`true`', 'Shows the value or the mark under the pointer.'],
];

export default function GaugeMarksPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Marks show other values on the scale besides the gauge's own, such as a target, a limit, or the lowest and highest expected." />
            </p>

            <Section anchor="targets" title="Targets and limits">
                <p>
                    <Rich text="`marks` takes values with a `label`. Each label is read with the gauge's value, and shows when the pointer is over its mark." />
                </p>
                <Example stack files={code('Targets.tsx')}>
                    <Targets />
                </Example>
            </Section>
            <Section anchor="shapes" title="Shapes of marks">
                <p>
                    <Rich text="`markShape` sets the shape of every mark, and a mark's own `shape` wins over it. A callout writes the mark's value." />
                </p>
                <Example stack files={code('MarkShapes.tsx')}>
                    <MarkShapes />
                </Example>
            </Section>
            <Section anchor="moving" title="Marks that change">
                <p>
                    <Rich text="A function as `marks` is followed: the marks move when the values they read change." />
                </p>
                <Example stack files={code('MovingMarks.tsx')}>
                    <MovingMarks />
                </Example>
            </Section>
            <Section anchor="bars" title="On a bar">
                <p>
                    <Rich text="Marks work the same on a straight gauge." />
                </p>
                <Example stack files={code('BarMarks.tsx')}>
                    <BarMarks />
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
