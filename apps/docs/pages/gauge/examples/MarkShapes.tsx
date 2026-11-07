import { Gauge, Stack } from '@motifx-community/ui';

/** Marks as lines for every mark, and a mark with a callout of its own beside a needle. */
export default function MarkShapes() {
    return (
        <Stack orientation="horizontal" gap="xl" wrap align="end">
            <Gauge value={62} markShape="line" marks={[{ value: 30, label: 'Low' }, { value: 80, label: 'High' }]} scale="ticks" tickInterval={25} label="Lines" />
            <Gauge class="ga-mark-text" value={2200} max={3000} scale="ticks" tickInterval={500} marker="needle" fill={false}
                marks={[{ value: 2700, label: 'Recommended', shape: 'text' }]} label="Oven (°C)" />
            <Gauge value={55} marks={[{ value: 20, shape: 'circle' }, { value: 45, shape: 'rhombus' }, { value: 90 }]} scale="ticks" tickInterval={25} label="Mixed" />
        </Stack>
    );
}
