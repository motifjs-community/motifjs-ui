import { Gauge, Stack } from '@motifx-community/ui';

const BANDS = [
    { from: 0, to: 18.5, color: '#4f8fd8', label: 'under' },
    { from: 18.5, to: 25, color: '#3c9a5f', label: 'normal' },
    { from: 25, to: 30, color: '#d9a400', label: 'over' },
    { from: 30, to: 40, color: '#c8463b', label: 'high' }
];

/** Ranges in colors of your own. A color is never the only sign: the range's name is read with the value. */
export default function OwnColors() {
    return (
        <Stack orientation="horizontal" gap="lg" wrap align="end">
            <Gauge class="ga-own" value={23.4} min={10} max={40} ranges={BANDS} scale="ticks" ticks={[10, 18.5, 25, 30, 40]} label="Body mass index" />
            <Gauge type="linear" value={27.1} min={10} max={40} ranges={BANDS} scale="ticks" ticks={[10, 18.5, 25, 30, 40]} label="Body mass index" style="flex: 1 1 16rem" />
        </Stack>
    );
}
