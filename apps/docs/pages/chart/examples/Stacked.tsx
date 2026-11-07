import { reactive } from '@motifx/core';
import { ButtonGroup, Chart, Stack, type ChartStacked } from '@motifx-community/ui';
import { SALES } from './sales';

/** The same bars side by side, stacked, and as shares of a hundred. */
export default function Stacked() {
    const s = reactive({ mode: 'none' });
    const stacked = (): ChartStacked => (s.mode === 'none' ? false : (s.mode as ChartStacked));
    return (
        <Stack class="docs-wide" gap="md">
            <ButtonGroup
                label="Stacking"
                x-model={() => s.mode}
                items={[
                    { value: 'none', text: 'Side by side' },
                    { value: 'normal', text: 'Stacked' },
                    { value: 'percent', text: 'Percent' }
                ]}
            />
            <Chart
                class="ch-stacked"
                data={SALES.slice(0, 6)}
                xField="month"
                label="Sales by channel"
                stacked={stacked}
                series={[
                    { type: 'bar', yField: 'online', name: 'Online' },
                    { type: 'bar', yField: 'stores', name: 'Stores' }
                ]}
            />
        </Stack>
    );
}
