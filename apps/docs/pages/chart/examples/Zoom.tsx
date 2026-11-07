import { reactive } from '@motifx/core';
import { Chart, Stack } from '@motifx-community/ui';

const MINUTE = 60 * 1000;
const START = new Date(2026, 9, 1).getTime();
// A sensor read every minute for about ten weeks: 100,000 values.
const READINGS = Array.from({ length: 100000 }, (_, i) => ({ time: new Date(START + i * MINUTE), load: Math.round(50 + 20 * Math.sin(i / 1440 * Math.PI * 2) + 8 * Math.sin(i / 97) + (i % 8191 === 0 ? 30 : 0)) }));

/** Drag across the plot to zoom in, Ctrl and the wheel zoom around the pointer, Shift and the wheel move along. The line is thinned to the width, and its peaks stay. */
export default function Zoom() {
    const s = reactive({ seen: 'All of it' });
    const time = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    return (
        <Stack class="docs-wide" gap="sm">
            <Chart
                class="ch-zoom"
                title="Server load"
                subtitle="100,000 readings, one a minute"
                data={READINGS}
                xField="time"
                zoom
                yAxis={{ format: { style: 'unit', unit: 'percent' } }}
                series={[{ type: 'area', yField: 'load', name: 'Load' }]}
                onZoomChanged={(e) => (s.seen = e.from ? `${time.format(e.from as Date)} to ${time.format(e.to as Date)}` : 'All of it')}
            />
            <output class="ch-zoom-told">{() => s.seen}</output>
        </Stack>
    );
}
