import { Chart } from '@motifx-community/ui';

const DISK = [
    { kind: 'Photos', size: 182 },
    { kind: 'Videos', size: 124 },
    { kind: 'Apps', size: 64 },
    { kind: 'Documents', size: 22 },
    { kind: 'System', size: 38 }
];

/** A thin ring that starts at the right, with every share written on its part. */
export default function PieLabels() {
    return (
        <Chart
            class="ch-pie-labels"
            title="Disk use"
            subtitle="430 GB of 512 GB"
            data={DISK}
            xField="kind"
            series={[{ type: 'donut', yField: 'size', name: 'Size', innerRadius: 0.72, startAngle: 90, labels: 'all', format: { style: 'unit', unit: 'gigabyte' } }]}
        />
    );
}
