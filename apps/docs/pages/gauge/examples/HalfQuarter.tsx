import { Gauge, Stack } from '@motifx-community/ui';

/** A half, and a quarter turned to each corner. A quarter has little room inside, so its value is left out. */
export default function HalfQuarter() {
    return (
        <Stack orientation="horizontal" gap="lg" wrap align="end">
            <Gauge class="ga-half" angle={180} value={72} label="Half" />
            <Gauge class="ga-quarter" angle={90} rotation={-45} value={80} label="Upper left" showValue={false} scale="ticks" tickInterval={50} />
            <Gauge angle={90} rotation={45} value={75} label="Upper right" showValue={false} scale="ticks" tickInterval={50} />
            <Gauge angle={90} rotation={135} value={70} label="Lower right" showValue={false} scale="ticks" tickInterval={50} />
            <Gauge angle={90} rotation={-135} value={68} label="Lower left" showValue={false} scale="ticks" tickInterval={50} />
        </Stack>
    );
}
