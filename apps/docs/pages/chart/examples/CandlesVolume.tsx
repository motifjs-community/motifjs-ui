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
