import { reactive } from '@motifx/core';
import { ButtonGroup, QRCode, Stack, type QrLevel } from '@motifx-community/ui';

/** A higher level survives more damage, and needs a larger code. */
export default function Levels() {
    const s = reactive({ level: 'M' as QrLevel });
    return (
        <Stack gap="md">
            <ButtonGroup
                label="Error correction"
                x-model={() => s.level}
                items={[
                    { value: 'L', text: 'L' },
                    { value: 'M', text: 'M' },
                    { value: 'Q', text: 'Q' },
                    { value: 'H', text: 'H' }
                ]}
            />
            <QRCode class="qr-level" value="https://ui.motifjs.com/qrcode" level={() => s.level} size={200} />
        </Stack>
    );
}
