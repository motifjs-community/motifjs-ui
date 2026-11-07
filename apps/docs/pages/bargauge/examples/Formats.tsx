import { BarGauge, Stack } from '@motifx-community/ui';

const points = (v: number) => `${v} pts`;

/** Values as a percentage with one decimal, and through a function of your own. */
export default function Formats() {
    return (
        <Stack orientation="horizontal" gap="xl" wrap align="center">
            <BarGauge data={[0.473, 0.653, 0.846]} max={1} format={{ style: 'percent', maximumFractionDigits: 1 }} label="Shares" />
            <BarGauge class="bg-points" data={[38, 52, 71]} format={points} label="Scores" />
        </Stack>
    );
}
