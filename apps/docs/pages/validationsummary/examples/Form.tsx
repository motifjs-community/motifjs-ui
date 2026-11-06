import { Button, NumberBox, Stack, TextBox, ValidationGroup, ValidationSummary } from '@motifx-community/ui';

/** The invalid fields of a form, listed above it after Save. Clicking a line moves to the field. */
export default function Form() {
    const group = new ValidationGroup();
    return (
        <Stack gap="md" style="inline-size: 100%; max-inline-size: 420px">
            <ValidationSummary class="vs-form" group={group} />
            <TextBox label="Name" required validationGroup={group} />
            <TextBox label="E-mail" required rules={[{ type: 'email' }]} validationGroup={group} />
            <NumberBox label="Guests" required rules={[{ type: 'range', min: 1, max: 8 }]} validationGroup={group} />
            <Stack orientation="horizontal" gap="sm">
                <Button class="vs-save" text="Save" tone="accent" onclick={() => void group.validate({ focus: false })} />
                <Button class="vs-reset" text="Start again" variant="outline" onclick={() => group.reset()} />
            </Stack>
        </Stack>
    );
}
