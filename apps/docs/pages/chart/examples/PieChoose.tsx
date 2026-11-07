import { reactive } from '@motifx/core';
import { Chart, Stack } from '@motifx-community/ui';

const SPENDING = [
    { item: 'Rent', amount: 1200 },
    { item: 'Food', amount: 540 },
    { item: 'Transport', amount: 210 },
    { item: 'Bills', amount: 180 },
    { item: 'Leisure', amount: 260 }
];

const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

/** A click, or Enter, chooses a part; the page tells what it is and how much of the whole it takes. */
export default function PieChoose() {
    const s = reactive({ told: 'Choose a part of the pie.' });
    return (
        <Stack class="docs-wide" gap="sm">
            <Chart
                class="ch-pie-choose"
                title="Spending in March"
                data={SPENDING}
                xField="item"
                pointSelection="single"
                series={[{ type: 'pie', yField: 'amount', name: 'Amount', format: { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 } }]}
                onSelectionChanged={e => {
                    const p = e.points[0];
                    s.told = p ? `${p.xText}: ${money.format(p.y)}, ${Math.round((p.share ?? 0) * 100)}% of the month` : 'Choose a part of the pie.';
                }}
            />
            <output class="ch-pie-told">{() => s.told}</output>
        </Stack>
    );
}
