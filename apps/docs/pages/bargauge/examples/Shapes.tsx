import { BarGauge, Stack } from '@motifx-community/ui';

const VALUES = [72, 54, 38];

/** A whole circle, a half that opens downward, and a half turned to the right. */
export default function Shapes() {
    return (
        <Stack orientation="horizontal" gap="xl" wrap align="center">
            <BarGauge class="bg-circle" data={VALUES} angle={360} size={160} label="Whole circle" />
            <BarGauge class="bg-half" data={VALUES} angle={180} size={180} label="Half" />
            <BarGauge class="bg-side" data={VALUES} angle={180} rotation={90} size={160} label="Half turned" />
        </Stack>
    );
}
