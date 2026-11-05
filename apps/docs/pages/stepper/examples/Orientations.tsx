import { Stack, Stepper } from '@motifx-community/ui';

const STEPS = [
    { text: 'Details', description: 'Name and e-mail' },
    { text: 'Address', description: 'Where to send it' },
    { text: 'Payment', description: 'Card or transfer' },
    { text: 'Review' }
];

/** Horizontal with the texts under or after the indicators, and vertical. */
export default function Orientations() {
    return (
        <Stack gap="lg" style="inline-size: 100%">
            <Stepper label="Texts under" items={STEPS} value={1} linear={false} />
            <Stepper label="Texts after" items={STEPS.slice(0, 3)} value={1} labelPosition="end" linear={false} />
            <div style="inline-size: 18rem">
                <Stepper label="Standing" items={STEPS} value={1} orientation="vertical" linear={false} />
            </div>
        </Stack>
    );
}
