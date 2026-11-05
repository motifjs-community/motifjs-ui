import { reactive } from '@motifx/core';
import { DateRangeBox, Stack, type DateRange } from '@motifx-community/ui';

/** Date and time on both ends: the time is typed after the date, the calendars keep it; one box in Turkish. */
export default function DateTime() {
    const s = reactive({ shift: [new Date(2026, 2, 10, 8, 30), new Date(2026, 2, 10, 17, 0)] as DateRange, trip: [null, null] as DateRange });
    return (
        <Stack orientation="horizontal" wrap align="center">
            <DateRangeBox label="Shift" type="datetime" x-model={() => s.shift} displayFormat={{ dateStyle: 'short', timeStyle: 'short' }} />
            <DateRangeBox label="Seyahat" locale="tr-TR" showWeekNumbers x-model={() => s.trip} startPlaceholder="gidiş" endPlaceholder="dönüş" />
        </Stack>
    );
}
