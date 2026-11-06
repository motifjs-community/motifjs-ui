import { OtpInput, Stack } from '@motifx-community/ui';

/** The sizes, and a field that cannot be changed. */
export default function States() {
    return (
        <Stack gap="lg">
            <OtpInput class="otp-small" label="Small" size="sm" length={4} value="12" />
            <OtpInput class="otp-large" label="Large" size="lg" length={4} value="12" />
            <OtpInput class="otp-readonly" label="Read-only" length={4} value="1234" readOnly />
            <OtpInput class="otp-disabled" label="Disabled" length={4} value="12" enabled={false} />
        </Stack>
    );
}
