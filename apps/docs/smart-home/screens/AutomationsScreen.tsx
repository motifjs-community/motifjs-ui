import { Component, FromService } from '@motifx/core';
import { Button, Card, Chip, ChipGroup, DateBox, Switch, toast } from '@motifx-community/ui';
import { AutomationForm } from '../AutomationForm';
import { HomeModel } from '../HomeModel';
import type { Automation } from '../home-types';
import { PlusIcon } from '../icons';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** What the home does on its own, and a new one step by step. */
export default class AutomationsScreen extends Component<HTMLDivElement> {
    private readonly model = FromService(HomeModel)!;

    constructor() {
        super('div');
    }

    private async add(): Promise<void> {
        const form = new AutomationForm();
        if ((await form.showDialog(this)) !== 'ok') return;
        const a = form.automation;
        this.model.addAutomation(a);
        toast.success(`“${a.name}” runs at ${a.time?.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}.`, { title: 'Automation added' });
    }

    private card(a: Automation) {
        return (
            <Card class="sh-automation" title={a.name} subtitle={a.action}>
                <div class="sh-stack">
                    <Switch label="On" x-model={() => a.on} />
                    <DateBox label="Time" type="time" timeStep={15} x-model={() => a.time} enabled={() => a.on} />
                    <ChipGroup selection="multiple" label="Days" x-model={() => a.days as unknown} enabled={() => a.on}>
                        {DAYS.map(day => (
                            <Chip text={day} />
                        ))}
                    </ChipGroup>
                </div>
            </Card>
        );
    }

    override view() {
        const s = this.model.state;
        return (
            <div class="sh-automations-screen">
                <div class="sh-section-head">
                    <h2 class="sh-section-title">{() => `${s.automations.filter(a => a.on).length} of ${s.automations.length} on`}</h2>
                    <Button class="sh-new" text="&New automation…" tone="accent" icon={() => <PlusIcon />} onclick={() => void this.add()} />
                </div>
                <div class="sh-automation-grid">{s.automations.map(a => this.card(a))}</div>
            </div>
        );
    }
}
