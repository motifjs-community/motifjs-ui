import { Barcode, Stack } from '@motifx-community/ui';

/** The size of the bars, and a code without its text. */
export default function Options() {
    return (
        <Stack gap="md">
            <Barcode class="bc-large" value="LARGE-1" moduleWidth={3} height={96} />
            <Barcode class="bc-plain" value="NO-TEXT" showText={false} />
        </Stack>
    );
}
