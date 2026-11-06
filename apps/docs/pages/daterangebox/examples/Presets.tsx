import { reactive } from '@motifx/core';
import { DateRangeBox, Stack, type DateRange, type DateRangePreset } from '@motifx-community/ui';

const day = (offset: number) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + offset);
    return d;
};

// Custom ranges, calculated when selected so that they are relative to today.
const QUARTERS: DateRangePreset[] = [
    { text: 'Next 3 days', range: () => [day(0), day(2)] },
    { text: 'Next week', range: () => [day(1), day(7)] },
    { text: 'Next 90 days', range: () => [day(0), day(89)] }
];

/** The kit's presets beside the calendars, and custom presets. */
export default function Presets() {
    const s = reactive({ sales: [null, null] as DateRange, plan: [null, null] as DateRange });
    return (
        <Stack orientation="horizontal" wrap align="center">
            <DateRangeBox label="Sales period" presets x-model={() => s.sales} />
            <DateRangeBox label="Planning" presets={QUARTERS} calendars={1} x-model={() => s.plan} />
        </Stack>
    );
}
