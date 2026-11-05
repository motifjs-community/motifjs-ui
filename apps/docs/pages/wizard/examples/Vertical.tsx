import { reactive } from '@motifx/core';
import { RadioGroup, Switch, TextArea, Wizard, WizardStep } from '@motifx-community/ui';

/** The stepper beside the pages, the texts after the indicators. */
export default function Vertical() {
    const s = reactive({ plan: 'Team', notify: true, note: '' });
    return (
        <Wizard label="Subscription" orientation="vertical" style="min-block-size: 16rem; inline-size: 100%">
            <WizardStep title="Plan" description="What you pay for">
                <RadioGroup label="Plan" items={['Solo', 'Team', 'Business']} x-model={() => s.plan} />
            </WizardStep>
            <WizardStep title="Alerts" description="How we reach you">
                <Switch label="Send me a monthly summary" x-model={() => s.notify} />
            </WizardStep>
            <WizardStep title="Notes" optional>
                <TextArea label="Anything else?" x-model={() => s.note} rows={3} />
            </WizardStep>
        </Wizard>
    );
}
