import { reactive } from '@motifx/core';
import { Chip, ChipGroup, DateBox, DropDown, MxForm, TextBox, Wizard, WizardStep } from '@motifx-community/ui';
import type { Automation } from './home-types';

const ACTIONS = ['Morning scene', 'Away scene', 'Movie scene', 'Night scene', 'All lights off', 'Lock every door'].map(text => ({ value: text, text }));
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** A new automation, step by step: what it does, when, and its name. */
export class AutomationForm extends MxForm {
    readonly data = reactive({ name: '', action: 'All lights off' as unknown, time: new Date(2026, 0, 1, 22, 0) as Date | null, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as unknown });

    constructor() {
        super({ title: 'New automation', width: '34rem' });
    }

    get automation(): Omit<Automation, 'id'> {
        const d = this.data;
        return { name: d.name, on: true, time: d.time, days: d.days as string[], action: String(d.action) };
    }

    override view() {
        const d = this.data;
        return (
            <Wizard label="New automation" onFinished={() => this.close('ok')}>
                <WizardStep title="Action" description="What happens">
                    <DropDown label="&Action" items={ACTIONS} x-model={() => d.action} required stretch />
                </WizardStep>
                <WizardStep title="When" description="Time and days" validate={() => (d.days as string[]).length > 0}>
                    <DateBox label="&Time" type="time" timeStep={15} x-model={() => d.time} required />
                    <ChipGroup selection="multiple" label="Days" x-model={() => d.days}>
                        {DAYS.map(day => (
                            <Chip text={day} />
                        ))}
                    </ChipGroup>
                </WizardStep>
                <WizardStep title="Name" description="How it is called">
                    <TextBox label="&Name" x-model={() => d.name} required stretch placeholder="Evening lights" />
                </WizardStep>
            </Wizard>
        );
    }
}
