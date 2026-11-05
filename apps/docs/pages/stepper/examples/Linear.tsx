import { reactive } from '@motifx/core';
import { CheckBox, Stack, Stepper } from '@motifx-community/ui';

/** In linear order a step is reached only after the ones before it; `onStepChanging` refuses a step while the box is unchecked. */
export default function Linear() {
    const s = reactive({ step: 0 as string | number | null, agreed: false, note: '' });
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Stepper
                label="In order"
                items={['Terms', 'Details', 'Confirm']}
                x-model={() => s.step}
                onStepChanging={e => {
                    if (e.to > 0 && !s.agreed) {
                        e.cancel = true;
                        s.note = 'Accept the terms first.';
                    } else {
                        s.note = '';
                    }
                }}
            />
            <CheckBox label="I accept the terms" x-model={() => s.agreed} />
            <output class="st-note">{() => s.note}</output>
        </Stack>
    );
}
