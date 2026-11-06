import { Button, Signature, Stack, type SignatureStroke } from '@motifx-community/ui';

const SAVED: readonly SignatureStroke[] = [
    {
        points: Array.from({ length: 40 }, (_, i) => ({
            x: 0.12 + (i / 39) * 0.76,
            y: 0.5 + Math.sin(i / 3) * 0.2 * (1 - i / 60),
            pressure: 0.3 + (i % 8) / 12
        }))
    }
];

/** A saved signature drawn again, a required field, and a pad that cannot be changed. */
export default function States() {
    let pad!: Signature;
    return (
        <Stack gap="lg" style="inline-size: 100%">
            <Signature class="sig-saved" label="Saved signature" value={SAVED} height={120} readOnly />
            <Signature ref={(x: Signature) => (pad = x)} class="sig-required" label="Required" required height={120} />
            <Button text="Validate" variant="outline" onclick={() => void pad.validate()} />
            <Signature class="sig-disabled" label="Disabled" enabled={false} height={100} />
        </Stack>
    );
}
