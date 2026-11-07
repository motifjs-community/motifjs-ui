import { data } from '@motifx-community/data';
import { Chart } from '@motifx-community/ui';
import { SALES } from './sales';

const source = new data.DataSource({ adapter: new data.ArrayAdapter({ data: SALES, key: 'month' }) });

/** Rows from any adapter of the data layer: the chart follows the source. */
export default function Source() {
    return <Chart class="ch-source" title="From a data source" dataSource={source} xField="month" series={[{ type: 'bar', yField: 'returns', name: 'Returns' }]} />;
}
