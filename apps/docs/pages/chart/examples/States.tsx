import { reactive } from '@motifx/core';
import { Button, Chart, Stack } from '@motifx-community/ui';
import { SALES } from './sales';

/** No values, and new values on their way. */
export default function States() {
    const s = reactive({ rows: SALES.slice(0, 6), loading: false });
    return (
        <Stack class="docs-wide" gap="md">
            <Chart class="ch-states" label="Sales" data={() => s.rows} loading={() => s.loading} xField="month" emptyText="No sales in this period" series={[{ type: 'bar', yField: 'online', name: 'Online' }]} />
            <Stack orientation="horizontal" gap="sm">
                <Button text="Clear" variant="outline" onclick={() => (s.rows = [])} />
                <Button text="Fill" variant="outline" onclick={() => (s.rows = SALES.slice(0, 6))} />
                <Button text="Load" variant="outline" onclick={() => (s.loading = !s.loading)} />
            </Stack>
        </Stack>
    );
}
