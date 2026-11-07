import { reactive } from '@motifx/core';
import { Barcode, Stack, TextBox } from '@motifx-community/ui';

/** A value the format cannot hold draws nothing and raises `onEncodeFailed`. An EAN refuses a wrong check digit. */
export default function Validation() {
    const s = reactive({ value: '4006381333931', told: '' });
    return (
        <Stack gap="md">
            <TextBox label="EAN-13" x-model={() => s.value} />
            <Barcode
                class="bc-valid"
                format="ean13"
                value={() => s.value}
                onEncodeFailed={e => (s.told = `“${e.value}” is not a valid EAN-13.`)}
            />
            <output class="bc-told">{() => s.told}</output>
        </Stack>
    );
}
