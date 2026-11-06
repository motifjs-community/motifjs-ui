import { reactive } from '@motifx/core';
import { DateBox, NumberBox, Stack } from '@motifx-community/ui';

/** A control's own `locale` takes precedence over the kit's: these use German and Japanese regardless of the kit language. */
export default function Formats() {
    const s = reactive({ amount: 98765.43, day: new Date(2026, 2, 18) as Date | null });
    return (
        <Stack orientation="horizontal" wrap align="center">
            <NumberBox label="Betrag" locale="de-DE" format={{ style: 'currency', currency: 'EUR' }} x-model={() => s.amount} />
            <DateBox label="日付" locale="ja-JP" x-model={() => s.day} />
            <NumberBox label="The kit's locale" format={{ style: 'currency', currency: 'EUR' }} x-model={() => s.amount} />
        </Stack>
    );
}
