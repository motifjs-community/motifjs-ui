# Chart: Candles

> Charts · @motifx-community/ui 0.1.0-beta.8

Candles show the first, highest, lowest and last price for each position.

## Candles

`candlestick` and `ohlc` show four prices for each position: `openField`, `highField`, `lowField` and `closeField`. Rising and falling take the design language's colors for good and bad, and a rising candle is hollow as well.

```tsx
import { reactive } from '@motifx/core';
import { ButtonGroup, Chart, Stack, type ChartSeriesType } from '@motifx-community/ui';

const PRICES = Array.from({ length: 24 }, (_, i) => {
    const open = 100 + Math.round(Math.sin(i / 3) * 12 + i * 0.8);
    const close = open + Math.round(Math.cos(i * 1.7) * 6);
    return { day: new Date(2026, 9, i + 1), open, close, high: Math.max(open, close) + 2 + (i % 3), low: Math.min(open, close) - 2 - (i % 4) };
});

/** Four prices a day. A rising candle is hollow and a falling one filled, so they read apart without their colors. */
export default function Candles() {
    const s = reactive({ type: 'candlestick' as ChartSeriesType });
    return (
        <Stack class="docs-wide" gap="md">
            <ButtonGroup
                label="Shape"
                x-model={() => s.type}
                items={[
                    { value: 'candlestick', text: 'Candles' },
                    { value: 'ohlc', text: 'OHLC bars' }
                ]}
            />
            <Chart
                class="ch-candles"
                title="Share price in October"
                data={PRICES}
                xField="day"
                xAxis={{ format: { day: 'numeric' } }}
                series={() => [{ type: s.type, openField: 'open', highField: 'high', lowField: 'low', closeField: 'close', name: 'Price' }]}
            />
        </Stack>
    );
}
```

## Price and volume

Prices and the volume traded have different units, so they go in two charts on the same time axis instead of on two scales of one plot. A reference line marks the average close.

```tsx
import { Chart, Stack } from '@motifx-community/ui';

const DAYS = Array.from({ length: 30 }, (_, i) => {
    const open = 48 + Math.round((Math.sin(i / 4) * 5 + i * 0.3) * 10) / 10;
    const close = Math.round((open + Math.cos(i * 1.3) * 2.4) * 10) / 10;
    const high = Math.round((Math.max(open, close) + 0.6 + (i % 3) * 0.4) * 10) / 10;
    const low = Math.round((Math.min(open, close) - 0.6 - (i % 4) * 0.3) * 10) / 10;
    return { day: new Date(2026, 8, i + 1), open, close, high, low, volume: Math.round(1.2e6 + Math.abs(close - open) * 6e5 + (i % 5) * 1.5e5) };
});

const average = Math.round((DAYS.reduce((sum, d) => sum + d.close, 0) / DAYS.length) * 100) / 100;

/** Prices and the volume traded: two charts on one time line, never two scales on one plot. A line marks the month's average close. */
export default function CandlesVolume() {
    return (
        <Stack class="docs-wide" gap="sm">
            <Chart
                class="ch-candles-price"
                title="Share price in September"
                data={DAYS}
                xField="day"
                height={260}
                xAxis={{ format: { day: 'numeric' } }}
                yAxis={{ format: { style: 'currency', currency: 'EUR' } }}
                references={[{ value: average, label: 'Average close' }]}
                series={[{ type: 'candlestick', openField: 'open', highField: 'high', lowField: 'low', closeField: 'close', name: 'Price' }]}
            />
            <Chart
                class="ch-candles-volume"
                label="Volume traded in September"
                data={DAYS}
                xField="day"
                height={200}
                xAxis={{ format: { day: 'numeric' } }}
                yAxis={{ format: { notation: 'compact' } }}
                series={[{ type: 'bar', yField: 'volume', name: 'Volume' }]}
            />
        </Stack>
    );
}
```

## Periods

With `zoom` on, `zoomTo()` shows a stretch of time, for example the latest month, and `resetZoom()` shows all of it again. The reader can still drag across the plot, and `onZoomChanged` reports every change.

```tsx
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
```

## API reference

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `lowField, highField` | `string \| (row) => unknown` |  | The ends of a range, and the lowest and highest price of a candle. |
| `openField, closeField` | `string \| (row) => unknown` |  | The first and the last price of a candle. |

Every other prop, member and event is on the [Overview](chart.md#api).

## Feedback

Loading issues…
