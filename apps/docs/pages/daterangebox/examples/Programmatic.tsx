import { reactive } from '@motifx/core';
import { Button, DateRangeBox, Stack, type DateRange } from '@motifx-community/ui';

const say = (d: Date | null) => (d ? d.toLocaleDateString('en-GB') : '—');

/** A range bound with x-model, and one made programmatically and read through its properties. */
export default function Programmatic() {
    const s = reactive({ stay: [new Date(2026, 2, 10), new Date(2026, 2, 14)] as DateRange, told: '' });
    const coded = new DateRangeBox({ label: 'Report period', clearButton: true, onValueChanged: e => (s.told = `${say(e.value[0])} to ${say(e.value[1])}`) });

    return (
        <Stack gap="md">
            <Stack orientation="horizontal" wrap align="center">
                <DateRangeBox label="Stay" x-model={() => s.stay} clearButton />
                <output class="dr-stay">{() => `${say(s.stay[0])} to ${say(s.stay[1])}`}</output>
            </Stack>
            <Stack orientation="horizontal" wrap align="center">
                <span onConfig={c => c.controls.add(coded)} />
                <Button text="This week" variant="outline" onclick={() => (coded.value = [new Date(2026, 2, 16), new Date(2026, 2, 22)])} />
                <output class="dr-told">{() => s.told}</output>
            </Stack>
        </Stack>
    );
}
