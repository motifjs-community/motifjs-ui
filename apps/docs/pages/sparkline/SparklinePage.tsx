import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Kinds from './examples/Kinds';
import Marks from './examples/Marks';
import Trends from './examples/Trends';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['data', '`Bind<number[] | T[] | null>`', '`null`', 'The values: numbers, or rows with `yField`. They are read and never changed.'],
    ['yField', '`Bind<string | (row) => unknown>`', '`null`', 'The field of a row that holds its value.'],
    ['type', "`Bind<'line' | 'area' | 'bar' | 'winloss'>`", "`'line'`", 'How it draws.'],
    ['highlight', "`Bind<('first' | 'last' | 'min' | 'max')[]>`", "`['last']` for a line or an area", 'The values marked with a dot.'],
    ['reference', "`Bind<number | 'average' | null>`", '`null`', 'A line across at a value, or at the average.'],
    ['min, max', '`Bind<number | null>`', 'From the values', 'The ends of its scale.'],
    ['smooth', '`Bind<boolean>`', '`false`', 'Curves the line, never past the values it joins.'],
    ['color', '`Bind<string | null>`', 'The first chart color', 'A color of your own.'],
    ['label', '`Bind<string>`', 'A kit string', 'What the values are, for the accessible name.'],
    ['format', '`Bind<ChartFormat | null>`', 'The language\'s numbers', 'How a value reads.'],
    ['tooltip', '`Bind<boolean>`', '`true`', 'The value under the pointer shows above it.'],
    ['height', '`Bind<number | null>`', 'From the design language', 'The height in pixels.'],
];

const A11Y = [
    ['Name', 'It has the role `img`, and its name gives the number of values, the first and the last, the lowest and the highest.'],
    ['Pointer', 'The value under the pointer is a reading aid only: the name already holds the values that matter.'],
    ['Wins and losses', 'Up and down differ in direction as well as in color.'],
];

export default function SparklinePage() {
    return (
        <>
            <p class="lead">
                <Rich text="A chart the size of a word, for a trend beside a number, in a sentence or in a row of a table. It draws a line, an area, bars, or wins and losses, and marks the values that matter." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { Sparkline } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="trends" title="Trends beside numbers">
                <p>
                    <Rich text="`data` takes numbers, or rows with `yField`. The last value is marked by default, and the accessible name sums the values up." />
                </p>
                <Example files={code('Trends.tsx')}>
                    <Trends />
                </Example>
            </Section>
            <Section anchor="kinds" title="Kinds">
                <p>
                    <Rich text="`type` draws a line, an area, bars, or wins and losses, which show only whether each value went up or down." />
                </p>
                <Example files={code('Kinds.tsx')}>
                    <Kinds />
                </Example>
            </Section>
            <Section anchor="marks" title="Marked values and an average">
                <p>
                    <Rich text="`highlight` marks the first, last, lowest or highest value, and `reference` draws a line at a value or at the average. The value under the pointer shows above it." />
                </p>
                <Example files={code('Marks.tsx')}>
                    <Marks />
                </Example>
            </Section>
            <Section anchor="api" title="API reference">
                <h3>
                    <Rich text="Props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                    <Rich text="Accessibility" />
                </h3>
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>
        </>
    );
}
