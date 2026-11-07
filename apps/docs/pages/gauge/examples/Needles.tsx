import { Gauge, Stack, type GaugeNeedleShape } from '@motifx-community/ui';

const NEEDLES: { shape: GaugeNeedleShape; value: number; label: string }[] = [
    { shape: 'tapered', value: 75, label: 'Tapered' },
    { shape: 'straight', value: 62, label: 'Straight' },
    { shape: 'two-tone', value: 80, label: 'Two-tone' }
];

/** The three needles, on a half arc without a fill. A two-tone needle's tip takes the color of the value's range. */
export default function Needles() {
    return (
        <Stack orientation="horizontal" gap="lg" wrap align="end">
            {NEEDLES.map(n => (
                <Gauge class="ga-marker" angle={180} fill={false} scale="ticks" tickInterval={50} marker="needle" needleShape={n.shape} value={n.value} label={n.label}
                    ranges={[{ from: 80, to: 100, tone: 'danger' }]} />
            ))}
        </Stack>
    );
}
