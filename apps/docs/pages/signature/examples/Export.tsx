import { reactive } from '@motifx/core';
import { Button, Signature, Stack } from '@motifx-community/ui';

/** An image of the signature. It is drawn in black on a transparent background unless told otherwise. */
export default function Export() {
    const s = reactive({ image: '' });
    let pad!: Signature;
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Signature ref={(x: Signature) => (pad = x)} class="sig-export" label="Sign to create an image" />
            <Button text="Create the image" variant="outline" onclick={() => (s.image = pad.toDataURL('image/png', { background: '#ffffff', width: 420 }))} />
            {s.image && <img class="sig-image" alt="The signature as an image" src={() => s.image} style="max-inline-size: 100%; border: 1px solid var(--mx-color-stroke-divider)" />}
        </Stack>
    );
}
