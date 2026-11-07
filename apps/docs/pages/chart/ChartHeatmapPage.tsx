import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Heatmap from './examples/Heatmap';
import HeatmapCalendar from './examples/HeatmapCalendar';
import HeatmapHours from './examples/HeatmapHours';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const FIELDS = [
    ['valueField', '`string | (row) => unknown`', '', 'The value a heat map shows as a color.'],
    ['labels', "`'none' | 'last' | 'extremes' | 'all'`", "`'none'`", 'The values that show a label. A label that does not fit is omitted.'],
];

export default function ChartHeatmapPage() {
    return (
        <>
            <p class="lead">
                <Rich text="A heat map shows a value for each pair of two categories as a color." />
            </p>

            <Section anchor="heatmap" title="Heat map">
                <p>
                    <Rich text="`heatmap` places a cell at each pair of `xField` and `yField`, colored by `valueField` in seven steps of one hue. Values on both sides of zero take two hues that meet in a neutral middle." />
                </p>
                <Example files={code('Heatmap.tsx')}>
                    <Heatmap />
                </Example>
            </Section>
            <Section anchor="calendar" title="Calendar">
                <p>
                    <Rich text="Any two categories make the grid, here weeks and weekdays. The series `format` controls how cell labels and tooltips read; compact numbers fit small cells." />
                </p>
                <Example files={code('HeatmapCalendar.tsx')}>
                    <HeatmapCalendar />
                </Example>
            </Section>
            <Section anchor="dense" title="Many cells">
                <p>
                    <Rich text="In a dense grid, leave `labels` off. The color steps show the pattern, and the tooltip and the table view show each value." />
                </p>
                <Example files={code('HeatmapHours.tsx')}>
                    <HeatmapHours />
                </Example>
            </Section>
            <Section anchor="api" title="API reference">
                <ApiTable head={['Field', 'Type', 'Default', 'Description']} rows={FIELDS} />
                <p>
                    <Rich text="Every other prop, member and event is on the [Overview](/chart#api)." />
                </p>
            </Section>
        </>
    );
}
