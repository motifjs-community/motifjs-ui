import { reactive } from '@motifx/core';
import { Signature, Stack, type SignatureStroke } from '@motifx-community/ui';

/** A pad bound to a value. The value is the strokes themselves, so it can be stored and drawn again. */
export default function Basic() {
    const s = reactive({ strokes: [] as readonly SignatureStroke[] });
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Signature class="sig-basic" label="Your signature" helpText="Sign with a pen, a finger or the mouse." x-model={() => s.strokes} />
            <output class="sig-told">{() => `Strokes: ${s.strokes.length}`}</output>
        </Stack>
    );
}
