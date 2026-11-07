import { Gauge, Stack, type GaugeMarker } from '@motifx-community/ui';

const BARS: { marker: GaugeMarker; value: number; label: string }[] = [
    { marker: 'triangle', value: 85, label: 'Triangle' },
    { marker: 'circle', value: 65, label: 'Circle' },
    { marker: 'rhombus', value: 80, label: 'Rhombus' },
    { marker: 'line', value: 75, label: 'Line' },
    { marker: 'text', value: 70, label: 'Callout' }
];

/** Each marker on a bar across. On a straight gauge a needle is drawn as a triangle. */
export default function BarMarkers() {
    return (
        <Stack gap="md" style="inline-size: 100%">
            {BARS.map(b => (
                <Gauge class="ga-bar-marker" type="linear" fill={false} scale="ticks" tickInterval={25} marker={b.marker} value={b.value} label={b.label} />
            ))}
        </Stack>
    );
}
