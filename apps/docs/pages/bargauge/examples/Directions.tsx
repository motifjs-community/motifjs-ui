import { BarGauge, Stack } from '@motifx-community/ui';

const VALUES = [72, 54, 38];

/** Quarters turned to each corner, for a gauge in the corner of a card. */
export default function Directions() {
    return (
        <Stack orientation="horizontal" gap="xl" wrap align="center">
            <BarGauge data={VALUES} angle={90} rotation={-45} size={180} label="Upper left" />
            <BarGauge data={VALUES} angle={90} rotation={45} size={180} label="Upper right" />
            <BarGauge data={VALUES} angle={90} rotation={135} size={180} label="Lower right" />
            <BarGauge data={VALUES} angle={90} rotation={-135} size={180} label="Lower left" />
        </Stack>
    );
}
