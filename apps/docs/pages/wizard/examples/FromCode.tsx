import { Component, reactive } from '@motifx/core';
import { Button, Stack, Wizard, WizardStep } from '@motifx-community/ui';

// A page made from code: any MotifJS component.
class Note extends Component<HTMLDivElement, { text: string }> {
    override view() {
        return <p>{this.props.text}</p>;
    }
}

/** A wizard made from code: its steps as props with content factories, moved with its methods, a step added later. */
export default function FromCode() {
    const s = reactive({ told: '' });
    const wizard = new Wizard({
        label: 'Setup',
        steps: [
            { title: 'Welcome', content: () => new Note({ text: 'A page made by a factory, built when first shown.' }) },
            { title: 'Options', description: 'Pick what you need', content: () => new Note({ text: 'The second page.' }) },
            { title: 'Done', content: () => new Note({ text: 'The last page; Next reads Finish here.' }) }
        ],
        onStepChanged: e => (s.told = `Step ${e.index + 1}: ${(e.item as { text: string }).text}`),
        onFinished: () => (s.told = 'Finished.')
    });
    const addStep = () => {
        wizard.insert(2, new WizardStep({ title: 'Extra', optional: true, content: () => new Note({ text: 'Added from code.' }) }));
    };
    return (
        <Stack gap="md" style="inline-size: 100%">
            <span onConfig={c => c.controls.add(wizard)} />
            <Stack orientation="horizontal" wrap align="center">
                <Button text="Go to Done" variant="outline" onclick={() => void wizard.goTo(wizard.steps.length - 1)} />
                <Button text="Add a step" variant="outline" onclick={addStep} />
                <output class="wz-told">{() => s.told}</output>
            </Stack>
        </Stack>
    );
}
