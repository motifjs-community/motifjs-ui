import { reactive } from '@motifx/core';
import { Barcode, Button, Stack } from '@motifx-community/ui';

/** An image of the code, with its text, to download or print. */
export default function Export() {
    const s = reactive({ image: '' });
    let code!: Barcode;
    return (
        <Stack gap="md">
            <Barcode ref={(x: Barcode) => (code = x)} class="bc-export" value="LABEL-42" />
            <Button text="Create the image" variant="outline" onclick={() => (s.image = code.toDataURL('image/png', { scale: 2 }))} />
            {s.image && <img class="bc-image" alt="The code as an image" src={() => s.image} />}
        </Stack>
    );
}
