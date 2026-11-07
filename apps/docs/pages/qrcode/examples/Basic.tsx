import { reactive } from '@motifx/core';
import { QRCode, Stack, TextBox } from '@motifx-community/ui';

/** A code that follows a text. The smallest version that holds the text is chosen. */
export default function Basic() {
    const s = reactive({ text: 'https://ui.motifjs.com' });
    return (
        <Stack gap="md">
            <TextBox label="Text" x-model={() => s.text} />
            <QRCode class="qr-basic" value={() => s.text} />
        </Stack>
    );
}
