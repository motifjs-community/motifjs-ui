import { reactive } from '@motifx/core';
import { Button, Stack, Stepper } from '@motifx-community/ui';

/** A stepper bound with x-model, and one made from code and moved with its own methods. */
export default function FromCode() {
    const s = reactive({ step: 0 as string | number | null, at: 0, told: '' });
    const coded = new Stepper({
        label: 'Order',
        items: ['Cart', 'Address', 'Payment', 'Done'],
        linear: false,
        onStepChanged: e => {
            s.at = e.index;
            s.told = `Step ${e.index + 1}${e.byUser ? ', pressed' : ''}`;
        }
    });

    return (
        <Stack gap="lg" style="inline-size: 100%">
            <Stepper label="Sign up" items={['Account', 'Profile', 'Review']} x-model={() => s.step} />
            <output class="st-value">{() => `value: ${JSON.stringify(s.step)}`}</output>
            <span onConfig={c => c.controls.add(coded)} />
            <Stack orientation="horizontal" wrap align="center">
                <Button text="Back" variant="outline" enabled={() => s.at > 0} onclick={() => void coded.previous()} />
                <Button text="Next" variant="outline" enabled={() => s.at < 3} onclick={() => void coded.next()} />
                <output class="st-told">{() => s.told}</output>
            </Stack>
        </Stack>
    );
}
