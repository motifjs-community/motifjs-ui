import { reactive } from '@motifx/core';
import { CheckBox, Stack, TextBox, Wizard, WizardStep } from '@motifx-community/ui';

/** Three pages with the kit's fields: Next validates the page first; Finish tells the app. */
export default function Basic() {
    const s = reactive({ name: '', email: '', city: '', agreed: false, result: '' });
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Wizard label="Sign up" onFinished={() => (s.result = `Welcome, ${s.name}.`)}>
                <WizardStep title="Account" description="Who you are">
                    <Stack orientation="horizontal" wrap align="center">
                        <TextBox label="Name" x-model={() => s.name} required />
                        <TextBox label="E-mail" x-model={() => s.email} required rules={[{ type: 'email' }]} />
                    </Stack>
                </WizardStep>
                <WizardStep title="Address" description="Where you live">
                    <TextBox label="City" x-model={() => s.city} required />
                </WizardStep>
                <WizardStep title="Review" validate={() => s.agreed}>
                    <p>{() => `${s.name || '—'}, ${s.email || '—'}, ${s.city || '—'}`}</p>
                    <CheckBox label="Everything is right" x-model={() => s.agreed} />
                </WizardStep>
            </Wizard>
            <output class="wz-result">{() => s.result}</output>
        </Stack>
    );
}
