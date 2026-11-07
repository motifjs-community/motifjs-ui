import { Chart } from '@motifx-community/ui';
import { SALES } from './sales';

/** Areas stacked on each other: the top line is the total. */
export default function Areas() {
    return (
        <Chart
            class="ch-areas"
            title="Total sales"
            data={SALES}
            xField="month"
            stacked="normal"
            series={[
                { type: 'area', yField: 'stores', name: 'Stores' },
                { type: 'area', yField: 'online', name: 'Online' }
            ]}
        />
    );
}
