import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Live from './examples/Live';
import Streaming from './examples/Streaming';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

export default function ChartLivePage() {
    return (
        <>
            <p class="lead">
                <Rich text="A chart follows its data: reactive values redraw it, and live data moves along with the latest values." />
            </p>

            <Section anchor="streaming" title="Live data">
                <p>
                    <Rich text="`span` on the position axis shows only the latest stretch: a time in milliseconds, a number, or a count of categories. When the values change, the marks move from where they were, over the design language's motion." />
                </p>
                <Example stack files={code('Streaming.tsx')}>
                    <Streaming />
                </Example>
            </Section>
            <Section anchor="reactive" title="Reactive data">
                <p>
                    <Rich text="A function prop follows reactive data. For plain data, call `reState()`, or `refresh()` after an in-place change." />
                </p>
                <Example stack files={code('Live.tsx')}>
                    <Live />
                </Example>
            </Section>
        </>
    );
}
