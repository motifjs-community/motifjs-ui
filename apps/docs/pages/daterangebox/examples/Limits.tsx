import { reactive } from '@motifx/core';
import { Button, DateRangeBox, Stack, type DateRange } from '@motifx-community/ui';

const today = new Date();
const inMonths = (n: number) => new Date(today.getFullYear(), today.getMonth() + n, today.getDate());

/** A stay of one to fourteen nights, within the next six months, never starting on a Sunday; the message says which rule failed. */
export default function Limits() {
    const s = reactive({ stay: [null, null] as DateRange, told: '' });
    let box!: DateRangeBox;
    return (
        <Stack orientation="horizontal" wrap align="center">
            <DateRangeBox
                ref={(b: DateRangeBox) => (box = b)}
                label="Stay"
                min={today}
                max={inMonths(6)}
                minDays={1}
                maxDays={14}
                disabledDates={d => d.getDay() === 0}
                required
                x-model={() => s.stay}
            />
            <Button text="Check" variant="outline" onclick={() => void box.validate().then(ok => (s.told = ok ? 'Fine.' : box.validationMessage))} />
            <output class="dr-check">{() => s.told}</output>
        </Stack>
    );
}
