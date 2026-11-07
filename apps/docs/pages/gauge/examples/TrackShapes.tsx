import { Gauge, Stack, type GaugeMarker } from '@motifx-community/ui';

const SHAPES: { marker: GaugeMarker; value: number; label: string }[] = [
    { marker: 'triangle', value: 85, label: 'Triangle' },
    { marker: 'circle', value: 65, label: 'Circle' },
    { marker: 'rhombus', value: 80, label: 'Rhombus' },
    { marker: 'line', value: 75, label: 'Line' }
];

/** A triangle outside the track, and a circle, a rhombus and a line on it. */
export default function TrackShapes() {
    return (
        <Stack orientation="horizontal" gap="lg" wrap align="end">
            {SHAPES.map(s => (
                <Gauge class="ga-track-marker" angle={180} fill={false} scale="ticks" tickInterval={50} marker={s.marker} value={s.value} label={s.label} />
            ))}
        </Stack>
    );
}
