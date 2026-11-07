import { Chart } from '@motifx-community/ui';
import { SALES } from './sales';

/** A target across the values, and a period marked on the positions. */
export default function References() {
    return (
        <Chart
            class="ch-refs"
            title="Online sales against the target"
            data={SALES}
            xField="month"
            references={[
                { value: 8000, label: 'Target' },
                { axis: 'x', from: 'Jun', to: 'Aug', label: 'Summer sale' }
            ]}
            series={[{ type: 'bar', yField: 'online', name: 'Online' }]}
        />
    );
}
