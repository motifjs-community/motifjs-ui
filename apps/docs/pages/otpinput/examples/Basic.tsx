import { reactive } from '@motifx/core';
import { Button, OtpInput, Stack } from '@motifx-community/ui';

/** A six-digit code bound to a value. `onCompleted` occurs once, when the last box is filled. */
export default function Basic() {
    const s = reactive({ code: '', told: 'nothing yet' });
    return (
        <Stack gap="md">
            <OtpInput class="otp-basic" label="Verification code" helpText="We sent it to your phone." x-model={() => s.code} onCompleted={e => (s.told = e.value)} />
            <output class="otp-value">{() => `Value: ${s.code || 'empty'}`}</output>
            <output class="otp-told">{() => `Completed: ${s.told}`}</output>
            <Button text="Clear" variant="outline" onclick={() => (s.code = '')} />
        </Stack>
    );
}
