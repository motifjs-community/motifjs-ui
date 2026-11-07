import { Gauge, Stack } from '@motifx-community/ui';

/** The default arc of 240 degrees, a wider one of 300, and a whole circle. */
export default function ArcCircle() {
    return (
        <Stack orientation="horizontal" gap="lg" wrap align="end">
            <Gauge class="ga-arc" value={72} label="Arc" />
            <Gauge angle={300} value={72} label="Wide arc" />
            <Gauge class="ga-circle" type="circle" value={72} label="Circle" />
        </Stack>
    );
}
