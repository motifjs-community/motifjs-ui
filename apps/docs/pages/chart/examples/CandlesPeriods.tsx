import { reactive } from '@motifx/core';
import { ButtonGroup, Chart, Stack } from '@motifx-community/ui';

const START = new Date(2026, 0, 1).getTime();
const DAY = 24 * 60 * 60 * 1000;

const YEAR = Array.from({ length: 260 }, (_, i) => {
    const open = Math.round((120 + Math.sin(i / 18) * 14 + i * 0.12 + Math.sin(i * 2.1) * 2) * 10) / 10;
    const close = Math.round((open + Math.cos(i * 1.7) * 3) * 10) / 10;
    return { day: new Date(START + i * DAY), open, close, high: Math.max(open, close) + 1 + (i % 3) * 0.5, low: Math.min(open, close) - 1 - (i % 4) * 0.4 };
});

const LAST = YEAR[YEAR.length - 1].day.getTime();

/** A year of prices with zoom on; the buttons zoom to the latest stretch with `zoomTo`, and dragging across the plot still works. */
export default function CandlesPeriods() {
    const s = reactive({ period: 'all' });
    let chart!: Chart;
    // A zoom of the reader's own, by dragging or the wheel, leaves no button chosen.
    let moving = false;
    const show = (period: string) => {
        const days = { month: 30, quarter: 91 }[period];
        moving = true;
        if (days) chart.zoomTo(new Date(LAST - days * DAY), new Date(LAST));
        else chart.resetZoom();
        moving = false;
    };
    return (
        <Stack class="docs-wide" gap="md">
            <ButtonGroup
                label="Period"
                x-model={() => s.period}
                onValueChanged={e => e.byUser && show(e.value as string)}
                items={[
                    { value: 'month', text: '1 month' },
                    { value: 'quarter', text: '3 months' },
                    { value: 'all', text: 'All' }
                ]}
            />
            <Chart
                ref={(x: Chart) => (chart = x)}
                class="ch-candles-periods"
                title="Share price this year"
                data={YEAR}
                xField="day"
                zoom
                series={[{ type: 'candlestick', openField: 'open', highField: 'high', lowField: 'low', closeField: 'close', name: 'Price' }]}
                onZoomChanged={e => !moving && (s.period = e.from ? '' : 'all')}
            />
        </Stack>
    );
}
