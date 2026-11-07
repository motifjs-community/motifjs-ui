import { reactive } from '@motifx/core';
import { Button, Chart, Stack } from '@motifx-community/ui';

/** A function prop follows reactive data. */
export default function Live() {
    const s = reactive({ points: [12, 18, 15, 21, 19].map((value, i) => ({ step: i + 1, value })) });
    const add = () => {
        const last = s.points[s.points.length - 1];
        s.points = [...s.points, { step: last.step + 1, value: Math.max(2, last.value + Math.round(Math.random() * 12 - 6)) }];
    };
    return (
        <Stack class="docs-wide" gap="md">
            <Chart class="ch-live" label="A growing series" data={() => s.points} xField="step" series={[{ yField: 'value', name: 'Value', markers: true }]} />
            <Button text="Add a value" variant="outline" onclick={add} />
        </Stack>
    );
}
