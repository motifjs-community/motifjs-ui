import { reactive } from '@motifx/core';
import { Button, Stack, TextBox, Wizard, WizardStep } from '@motifx-community/ui';

/** No bar: buttons of your own drive it; finishing waits for a promise (a server) and may be refused. */
export default function Custom() {
    const s = reactive({ code: '', busy: false, note: '' });
    let wizard!: Wizard;
    const finish = () => {
        s.note = '';
        void wizard.finish().then(ok => (s.note = ok ? 'Saved.' : s.note || 'Not finished.'));
    };
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Wizard
                ref={(w: Wizard) => (wizard = w)}
                label="Redeem"
                showNavigation={false}
                labelPosition="end"
                onFinishing={e => {
                    s.busy = true;
                    e.promise = new Promise<boolean>(resolve => setTimeout(() => resolve(s.code.toUpperCase() === 'MOTIF'), 600)).then(ok => {
                        s.busy = false;
                        if (!ok) s.note = 'That code is not known.';
                        return ok;
                    });
                }}
            >
                <WizardStep title="Code">
                    <TextBox label="Gift code" x-model={() => s.code} required placeholder="MOTIF" />
                </WizardStep>
                <WizardStep title="Confirm">
                    <p>{() => `Redeem “${s.code}”?`}</p>
                </WizardStep>
            </Wizard>
            <Stack orientation="horizontal" wrap align="center">
                <Button text="Back" variant="outline" onclick={() => void wizard.previous()} />
                <Button text="Next" variant="outline" onclick={() => void wizard.next()} />
                <Button text="Redeem" busy={() => s.busy} onclick={finish} />
                <output class="wz-note">{() => s.note}</output>
            </Stack>
        </Stack>
    );
}
