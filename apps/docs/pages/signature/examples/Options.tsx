import { Signature, Stack } from '@motifx-community/ui';

/** The pen, the size of the pad and which parts it shows. */
export default function Options() {
    return (
        <Stack gap="lg" style="inline-size: 100%">
            <Signature class="sig-pen" label="A thick blue pen" penColor="#1d4ed8" minWidth={2} maxWidth={6} height={120} />
            <Signature class="sig-plain" label="Only the pad" showGuide={false} showClear={false} showUndo={false} placeholder="" height={120} />
        </Stack>
    );
}
