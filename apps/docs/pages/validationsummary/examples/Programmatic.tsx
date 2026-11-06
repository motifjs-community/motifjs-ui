import { reactive } from '@motifx/core';
import { Button, Stack, TextBox, ValidationGroup, ValidationSummary } from '@motifx-community/ui';

/** A custom header or none. The lines report which field was clicked, and `failed` reports how many there are. */
export default function Programmatic() {
    const group = new ValidationGroup();
    const s = reactive({ header: true, told: '', count: 0 });
    const summary = new ValidationSummary({
        group,
        header: 'Before you send it',
        showHeader: () => s.header,
        onItemClick: e => (s.told = `pressed: ${e.text}`)
    });
    return (
        <Stack gap="md" style="inline-size: 100%; max-inline-size: 420px">
            <span class="vs-coded" onConfig={c => c.controls.add(summary)} />
            <TextBox label="Street" required validationGroup={group} />
            <TextBox label="Town" required validationGroup={group} />
            <Stack orientation="horizontal" wrap align="center">
                <Button class="vs-coded-check" text="Check" tone="accent" onclick={async () => {
                    await group.validate({ focus: false });
                    s.count = summary.count;
                }} />
                <Button text="Header on and off" variant="outline" onclick={() => (s.header = !s.header)} />
                <output class="vs-coded-told">{() => `${s.count} failed${s.told ? `, ${s.told}` : ''}`}</output>
            </Stack>
        </Stack>
    );
}
