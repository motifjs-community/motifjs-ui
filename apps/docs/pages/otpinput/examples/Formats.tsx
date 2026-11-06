import { OtpInput, Stack } from '@motifx-community/ui';

/** Other lengths and characters, groups of boxes, and a masked PIN. */
export default function Formats() {
    return (
        <Stack gap="lg">
            <OtpInput class="otp-key" label="Access key" length={8} charset="alphanumeric" uppercase groupSize={4} />
            <OtpInput class="otp-pin" label="PIN" length={4} masked />
            <OtpInput class="otp-hint" label="Code" length={4} placeholder="0" />
            <OtpInput class="otp-hex" label="Color code" length={6} pattern={/[0-9a-f]/i} uppercase size="sm" />
        </Stack>
    );
}
