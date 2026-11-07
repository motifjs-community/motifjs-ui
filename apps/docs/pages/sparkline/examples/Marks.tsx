import { Sparkline, Stack } from '@motifx-community/ui';

const TEMPERATURE = [12, 14, 13, 17, 21, 19, 16, 15, 18, 22, 20, 17];

/** The lowest and the highest value marked, and a line at the average. */
export default function Marks() {
    return (
        <Stack gap="md">
            <span class="sp-marks">
                Temperature <Sparkline data={TEMPERATURE} highlight={['min', 'max', 'last']} reference="average" format={{ style: 'unit', unit: 'celsius' }} label="Temperature" height={32} />
            </span>
        </Stack>
    );
}
