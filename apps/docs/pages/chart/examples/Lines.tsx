import { Chart } from '@motifx-community/ui';
import { SALES } from './sales';

/** Two series, the second one smoothed and with its last value labeled. */
export default function Lines() {
    return (
        <Chart
            class="ch-lines"
            title="Sales by channel"
            data={SALES}
            xField="month"
            series={[
                { yField: 'online', name: 'Online', labels: 'last' },
                { yField: 'stores', name: 'Stores', smooth: true, labels: 'last' }
            ]}
        />
    );
}
