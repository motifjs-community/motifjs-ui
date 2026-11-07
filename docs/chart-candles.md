# Chart: Candles

> Charts · @motifx-community/ui 0.1.0-beta.5

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

## API reference

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `lowField, highField` | `string \| (row) => unknown` |  | The ends of a range, and the lowest and highest price of a candle. |
| `openField, closeField` | `string \| (row) => unknown` |  | The first and the last price of a candle. |

Every other prop, member and event is on the [Overview](chart.md#api).

## Feedback

Loading issues…
