import { reactive } from '@motifx/core';
import { Button, OtpInput, Stack } from '@motifx-community/ui';

/** An incomplete code fails on its own, and a rule of the application can refuse a complete one. */
export default function Validation() {
    const s = reactive({ code: '' });
    let field!: OtpInput;
    return (
        <Stack gap="md">
            <OtpInput
                ref={(x: OtpInput) => (field = x)}
                class="otp-valid"
                label="Code"
                length={4}
                required
                x-model={() => s.code}
                rules={[{ type: 'custom', check: value => value === '1234', message: 'This code is not correct.' }]}
            />
            <Button text="Verify" variant="outline" onclick={() => void field.validate()} />
        </Stack>
    );
}
