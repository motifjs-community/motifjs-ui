# Chart: Zoom and large data

> Charts · @motifx-community/ui 0.1.0-beta.5

Large data stays quick: long lines are thinned to the width with their peaks kept, and the reader zooms in for detail.

## Zooming into large data

`zoom` lets the reader drag across the plot to zoom in, use Ctrl and the wheel to zoom around the pointer, Shift and the wheel to move along, and + and - with the keyboard. A button in the title row shows all of it again, and the value axis fits what is in view. `zoomTo()` and `resetZoom()` do the same programmatically.

```tsx
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
```

## Zooming categories

Zoom works on a category axis too. `zoomTo()` takes the first and last category to show, as they are written in the rows.

```tsx
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
```

## Feedback

Loading issues…
