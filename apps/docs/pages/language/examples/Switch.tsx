import { reactive } from '@motifx/core';
import { Button, DateBox, NumberBox, Pagination, Stack, uiLocale } from '@motifx-community/ui';
import { kitTexts } from '../../../shared/kit-texts';

/** The kit's language switched live: the pack is loaded first, then every control draws its texts and formats again. */
export default function Switch() {
    const s = reactive({ price: 1234.5, when: new Date(2026, 2, 18) as Date | null });
    return (
        <Stack gap="md">
            <Stack orientation="horizontal" wrap align="center">
                <Button text="English" variant="outline" onclick={() => void uiLocale.use('en')} />
                <Button text="Türkçe" variant="outline" onclick={() => void uiLocale.use('tr')} />
                <span>
                    In use: <output class="lang-locale">{() => kitTexts.locale}</output>
                </span>
            </Stack>
            <Stack orientation="horizontal" wrap align="center">
                <NumberBox label="Price" x-model={() => s.price} format={{ style: 'currency', currency: 'EUR' }} />
                <DateBox label="When" x-model={() => s.when} clearButton />
            </Stack>
            <Pagination total={95} pageSizes={[10, 20, 50]} label="Orders" />
        </Stack>
    );
}
