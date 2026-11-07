import { reactive } from '@motifx/core';
import { Button, QRCode, Stack } from '@motifx-community/ui';

/** An image of the code, to download or print. */
export default function Export() {
    const s = reactive({ image: '' });
    let code!: QRCode;
    return (
        <Stack gap="md">
            <QRCode ref={(x: QRCode) => (code = x)} class="qr-export" value="Printed with the order" />
            <Button text="Create the image" variant="outline" onclick={() => (s.image = code.toDataURL('image/png', { size: 256 }))} />
            {s.image && <img class="qr-image" alt="The code as an image" src={() => s.image} />}
        </Stack>
    );
}
