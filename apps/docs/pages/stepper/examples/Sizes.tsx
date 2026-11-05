import { Stack, Stepper } from '@motifx-community/ui';

const STEPS = ['Plan', 'Build', 'Ship'];

/** Three sizes, and a stepper without numbers. */
export default function Sizes() {
    return (
        <Stack gap="lg" style="inline-size: 100%">
            <Stepper label="Small" items={STEPS} value={1} size="sm" linear={false} />
            <Stepper label="Medium" items={STEPS} value={1} linear={false} />
            <Stepper label="Large" items={STEPS} value={1} size="lg" linear={false} />
            <Stepper label="Dots" items={STEPS} value={1} showNumbers={false} size="sm" labelPosition="end" linear={false} />
        </Stack>
    );
}
