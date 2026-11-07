import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import BarMarkers from './examples/BarMarkers';
import Callout from './examples/Callout';
import FillAndMarker from './examples/FillAndMarker';
import Needles from './examples/Needles';
import TrackShapes from './examples/TrackShapes';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['marker', '`Bind<\'needle\' | \'triangle\' | \'circle\' | \'rhombus\' | \'line\' | \'text\' | null>`', '`null`', 'A shape that points at the value. On a straight gauge a needle is a triangle.'],
    ['needleShape', '`Bind<\'tapered\' | \'straight\' | \'two-tone\'>`', '`\'tapered\'`', 'How a needle is drawn.'],
    ['fill', '`Bind<boolean>`', '`true`', 'Fills the track from `baseValue` to the value.'],
];

export default function GaugeMarkersPage() {
    return (
        <>
            <p class="lead">
                <Rich text="A marker points at the value: a needle from the middle of an arc, a shape on or beside the track, or a callout that writes the value." />
            </p>

            <Section anchor="needles" title="Needles">
                <p>
                    <Rich text="`marker: 'needle'` draws a needle from the middle, and `needleShape` sets how: narrowing to its tip, straight, or straight with its tip in the color of the value's range." />
                </p>
                <Example stack files={code('Needles.tsx')}>
                    <Needles />
                </Example>
            </Section>
            <Section anchor="shapes" title="Shapes on the track">
                <p>
                    <Rich text="A triangle points at the value from outside the track; a circle, a rhombus and a line sit on it. Turn `fill` off to show the value with the marker alone." />
                </p>
                <Example stack files={code('TrackShapes.tsx')}>
                    <TrackShapes />
                </Example>
            </Section>
            <Section anchor="callout" title="Callout">
                <p>
                    <Rich text="`marker: 'text'` writes the value in a callout that points at it: inside an arc, beside a bar. The value in the middle is then left out." />
                </p>
                <Example stack files={code('Callout.tsx')}>
                    <Callout />
                </Example>
            </Section>
            <Section anchor="bars" title="On a bar">
                <p>
                    <Rich text="Every marker works on a straight gauge too; a needle is drawn there as a triangle." />
                </p>
                <Example stack files={code('BarMarkers.tsx')}>
                    <BarMarkers />
                </Example>
            </Section>
            <Section anchor="together" title="Marker and fill together">
                <p>
                    <Rich text="A marker over the fill keeps the value easy to find on a long scale." />
                </p>
                <Example stack files={code('FillAndMarker.tsx')}>
                    <FillAndMarker />
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
