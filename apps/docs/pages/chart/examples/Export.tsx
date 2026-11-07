import { reactive } from '@motifx/core';
import { Button, Chart, Stack } from '@motifx-community/ui';
import { SALES } from './sales';

/** An image with the title and the legend, to download or to put in a report. */
export default function Export() {
    const s = reactive({ image: '' });
    let chart!: Chart;
    return (
        <Stack class="docs-wide" gap="md">
            <Chart
                ref={(x: Chart) => (chart = x)}
                class="ch-export"
                title="Sales by channel"
                data={SALES}
                xField="month"
                series={[
                    { type: 'bar', yField: 'online', name: 'Online' },
                    { type: 'bar', yField: 'stores', name: 'Stores' }
                ]}
            />
            <Button text="Create the image" variant="outline" onclick={() => chart.toDataURL().then(url => (s.image = url))} />
            {s.image && <img class="ch-image" alt="The chart as an image" src={() => s.image} />}
        </Stack>
    );
}
