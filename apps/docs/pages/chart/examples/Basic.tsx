import { Chart } from '@motifx-community/ui';
import { SALES } from './sales';

/** One series needs no legend: the title names it. */
export default function Basic() {
    return <Chart class="ch-basic" title="Online sales" subtitle="By month, in euros" data={SALES} xField="month" series={[{ type: 'bar', yField: 'online', name: 'Online' }]} />;
}
