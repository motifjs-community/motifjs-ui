import { BarGauge } from '@motifx-community/ui';

const RIDERS = [
    { name: 'Rider 1', speed: 121.4 },
    { name: 'Rider 2', speed: 135.4 },
    { name: 'Rider 3', speed: 115.9 },
    { name: 'Rider 4', speed: 141.1 },
    { name: 'Rider 5', speed: 127.5 }
];

/** Rows read through their fields, named in a legend; the bar under the pointer shows its name and value. */
export default function Legend() {
    return (
        <BarGauge class="bg-legend" data={RIDERS} valueField="speed" nameField="name" max={200} showLabels={false} legend
            format={{ style: 'unit', unit: 'kilometer-per-hour' }} label="Average speed" />
    );
}
