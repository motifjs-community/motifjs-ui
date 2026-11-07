import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import Formats from './examples/Formats';
import Legend from './examples/Legend';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['showLabels', '`Bind<boolean>`', '`true`', 'Writes each value at the end of its bar.'],
    ['legend', '`Bind<boolean>`', '`false`', 'Shows a legend of the names under the bars.'],
    ['tooltip', '`Bind<boolean>`', '`true`', 'Shows the value under the pointer.'],
    ['format', '`Bind<ChartFormat | null>`', 'The language\'s numbers', 'How the values read: options of the browser\'s number format, or a function of your own.'],
    ['nameField', '`Bind<ChartField<T> | null>`', '`null`', 'The field of a row that holds its name, shown in the legend and the tooltip and read with its value.'],
];

export default function BarGaugeLabelsPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Each value can be written at the end of its bar, named in a legend, and shown with its name under the pointer." />
            </p>

            <Section anchor="values" title="Values at the ends">
                <p>
                    <Rich text="A line runs from the end of each bar to its value, outside the bars. A value that would sit on another moves further out along its line." />
                </p>
                <Example files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>
            <Section anchor="formats" title="Formats">
                <p>
                    <Rich text="`format` writes the values: options of the browser's number format, in the language of the page, or a function of your own." />
                </p>
                <Example files={code('Formats.tsx')}>
                    <Formats />
                </Example>
            </Section>
            <Section anchor="legend" title="Legend and tooltip">
                <p>
                    <Rich text="`legend` lists the names under the bars; `showLabels` can then leave the values at the ends out. The bar under the pointer shows its name and value." />
                </p>
                <Example files={code('Legend.tsx')}>
                    <Legend />
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
