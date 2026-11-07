import { Barcode, Stack } from '@motifx-community/ui';

/** Each format, with a value it can hold. */
export default function Formats() {
    return (
        <Stack gap="md">
            <Barcode class="bc-128" format="code128" value="ORDER-2026-118" />
            <Barcode class="bc-39" format="code39" value="PART-77" />
            <Barcode class="bc-13" format="ean13" value="400638133393" />
            <Barcode class="bc-8" format="ean8" value="9638507" />
            <Barcode class="bc-upc" format="upca" value="03600029145" />
            <Barcode class="bc-itf" format="itf" value="1234567890" />
        </Stack>
    );
}
