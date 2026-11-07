import { Gauge, Stack } from '@motifx-community/ui';

/** The value written in a callout that points at it: inside an arc, beside a bar. */
export default function Callout() {
    return (
        <Stack orientation="horizontal" gap="xl" wrap align="end">
            <Gauge class="ga-callout" angle={180} fill={false} scale="ticks" tickInterval={50} marker="text" value={70} label="Arc" />
            <Gauge type="linear" fill={false} scale="ticks" tickInterval={25} marker="text" value={70} label="Bar" style="flex: 1 1 16rem" />
        </Stack>
    );
}
