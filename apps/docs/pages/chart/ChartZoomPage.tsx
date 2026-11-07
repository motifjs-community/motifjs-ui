import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Zoom from './examples/Zoom';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

export default function ChartZoomPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Large data stays quick: long lines are thinned to the width with their peaks kept, and the reader zooms in for detail." />
            </p>

            <Section anchor="zoom" title="Zooming into large data">
                <p>
                    <Rich text="`zoom` lets the reader drag across the plot to zoom in, use Ctrl and the wheel to zoom around the pointer, Shift and the wheel to move along, and + and - with the keyboard. A button in the title row shows all of it again, and the value axis fits what is in view. `zoomTo()` and `resetZoom()` do the same programmatically." />
                </p>
                <Example stack files={code('Zoom.tsx')}>
                    <Zoom />
                </Example>
            </Section>
        </>
    );
}
