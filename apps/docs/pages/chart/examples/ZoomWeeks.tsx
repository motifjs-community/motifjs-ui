import { reactive } from '@motifx/core';
import { ButtonGroup, Chart, Stack } from '@motifx-community/ui';

const WEEKS = Array.from({ length: 52 }, (_, i) => ({ week: `W${i + 1}`, orders: Math.round(300 + Math.sin(i / 8) * 90 + (i > 46 ? 160 : 0) + ((i * 13) % 7) * 12) }));

/** Zoom works on categories too: the buttons call `zoomTo` with the names of the first and last week to show. */
export default function ZoomWeeks() {
    const s = reactive({ part: 'all' });
    let chart!: Chart;
    let moving = false;
    const show = (part: string) => {
        moving = true;
        if (part === 'first') chart.zoomTo('W1', 'W26');
        else if (part === 'last') chart.zoomTo('W41', 'W52');
        else chart.resetZoom();
        moving = false;
    };
    return (
        <Stack class="docs-wide" gap="md">
            <ButtonGroup
                label="Weeks"
                x-model={() => s.part}
                onValueChanged={e => e.byUser && show(e.value as string)}
                items={[
                    { value: 'first', text: 'First half' },
                    { value: 'last', text: 'Last 12 weeks' },
                    { value: 'all', text: 'All' }
                ]}
            />
            <Chart
                ref={(x: Chart) => (chart = x)}
                class="ch-zoom-weeks"
                title="Orders by week"
                data={WEEKS}
                xField="week"
                zoom
                legend={false}
                series={[{ type: 'bar', yField: 'orders', name: 'Orders' }]}
                onZoomChanged={e => !moving && (s.part = e.from ? '' : 'all')}
            />
        </Stack>
    );
}
