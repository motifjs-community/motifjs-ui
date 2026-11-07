import { Gauge, Stack } from '@motifx-community/ui';

/** Marks on bars: the lowest and highest expected, and a price between its low and high of the day. */
export default function BarMarks() {
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Gauge class="ga-bar-marks" type="linear" value={17} max={30} scale="ticks" tickInterval={5} marks={[{ value: 5, label: 'Lowest' }, { value: 25, label: 'Highest' }]}
                label="Issues closed" />
            <Gauge type="linear" value={28} min={10} max={50} scale="ticks" tickInterval={10} fill={false} marker="circle" markShape="line"
                marks={[{ value: 18, label: 'Low' }, { value: 43, label: 'High' }]} format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} label="Price" />
        </Stack>
    );
}
