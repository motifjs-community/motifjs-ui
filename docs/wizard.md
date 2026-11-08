# Wizard

> Navigation · @motifx-community/ui 0.1.0-beta.8

Guides the user through a multi-step task. It combines a [Stepper](stepper.md) above or next to one page per step with Back and Next buttons below. Next validates the page first, and on the last step it finishes the wizard.

## Import

```tsx
import { Wizard, WizardStep } from '@motifx-community/ui';
```

## Defining pages in JSX

Each `WizardStep` is a step and its page. Next validates the kit fields on the page and then runs the step's own `validate`. If validation fails, the wizard stays on the page, marks the step and focuses the first invalid field. On the last step, Next becomes Finish and raises `onFinished`.

```tsx
import { reactive } from '@motifx/core';
import { CheckBox, Stack, TextBox, Wizard, WizardStep } from '@motifx-community/ui';

/** Three pages with kit fields: Next validates the page first, and Finish notifies the application. */
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
```

## Programmatic use

`steps` creates steps from props, and each page is created from a `content` factory when first shown. `add`, `insert` and `remove` change the steps later, and `next()`, `previous()`, `goTo()` and `finish()` navigate.

```tsx
import { Component, reactive } from '@motifx/core';
import { Button, Stack, Wizard, WizardStep } from '@motifx-community/ui';

// A page created programmatically: any MotifJS component.
class Note extends Component<HTMLDivElement, { text: string }> {
    override view() {
        return <p>{this.props.text}</p>;
    }
}

/** A wizard created programmatically: its steps as props with content factories, moved with its methods, with a step added later. */
export default function Programmatic() {
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
        wizard.insert(2, new WizardStep({ title: 'Extra', optional: true, content: () => new Note({ text: 'Added programmatically.' }) }));
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
```

## Vertical orientation

```tsx
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
```

## Custom buttons and asynchronous finish

`showNavigation={false}` removes the bar, so your own buttons can call the methods. `onFinishing` can set a `promise`, and the wizard finishes when it resolves to `true` and stays open otherwise.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TextBox, Wizard, WizardStep } from '@motifx-community/ui';

/** No bar: custom buttons control it, and finishing waits for a promise (a server) and can be refused. */
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
```

## Accessibility

| Topic | Details |
| --- | --- |
| `Stepper` | A `nav` of steps, as on the [Stepper](stepper.md) page. Each step is a button with its position and status in its name, and there is one Tab stop. |
| `Page` | A `group` named after its step. Hidden pages are removed from the accessibility tree. |
| `Validation` | When validation fails, focus stays on the first invalid field with its message, and the step is announced as “Needs attention”. |
| `Buttons` | Kit buttons named “Back”, “Next” and “Finish” in the kit language. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-wizard` | The wizard. `data-orientation`. |
| `.mx-wizard__stepper` | The stepper (also `.mx-stepper`). |
| `.mx-wizard__pages, .mx-wizard__page` | The pages and each page. A hidden page has `hidden`. |
| `.mx-wizard__bar, .mx-wizard__previous, .mx-wizard__next` | The bar and its buttons. |

### Component tokens

| Token | Description |
| --- | --- |
| `wizard.frame, .page, .bar` | Units: the root, a page and the bar (a divider above it and its padding). |
| `wizard.previous, wizard.next` | Places: the appearance of the buttons in the bar (`variant`). |
| `wizard.gap, .bar-gap, .rail-width` | The spacing between the stepper, pages and bar, and between the buttons, plus the stepper width when it is next to the pages. |

## API reference

### Wizard props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `steps` | `readonly WizardStepProps[]` | `[]` | Steps created programmatically, each as `WizardStep` props. JSX `WizardStep` children come first. |
| `value` | `Bind<string \| number \| null>` | `0` | The current step, identified by its `key` or index. `x-model` provides two-way binding. |
| `linear` | `Bind<boolean>` | `true` | A step can be reached only after the previous ones, and optional steps can be skipped. |
| `orientation` | `Bind<StepperOrientation>` | `'horizontal'` | `horizontal` places the stepper above the pages, and `vertical` places it next to them. |
| `labelPosition` | `Bind<StepperLabelPosition>` | `'bottom'` | The position of the stepper text, in the horizontal orientation only. |
| `size` | `Bind<ControlSize>` | `'md'` | The size of the stepper. |
| `showStepper, showNavigation` | `Bind<boolean>` | `true` | Shows the stepper, and the bar with the Back and Next buttons. |
| `clickable` | `Bind<boolean>` | `true` | Lets the user press the stepper steps. |
| `lazy` | `Bind<boolean>` | `true` | Creates a page when first shown and then keeps it. A step's own `lazy` takes precedence. |
| `keepAlive` | `Bind<boolean>` | `true` | With `false`, content created by a step's `content` is disposed while hidden and recreated when shown. A step's own `keepAlive` takes precedence. |
| `previousText, nextText, finishText` | `Bind<string>` | The kit strings “Back”, “Next” and “Finish” | The button text. |
| `label` | `Bind<string>` | The kit string “Steps” | The accessible name of the stepper. |

### WizardStep props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `Bind<string>` | `''` | The step text in the stepper. This is the same property as `text`. |
| `description` | `Bind<string>` | `''` | A second line below the title. |
| `key` | `Bind<string>` | The index | Identifies the step in `value`. The JSX `key` also works. |
| `icon` | `Bind<IconSource \| null>` | `null` | Displayed in the indicator instead of the number. |
| `optional` | `Bind<boolean>` | `false` | Marks the step as optional, which appears below the title. |
| `enabled` | `Bind<boolean>` | `true` | `false` prevents the step from being reached. |
| `error` | `Bind<boolean>` | `false` | Shows the step with an error. The wizard sets it when the page fails validation and clears it when the page passes. |
| `validateFields` | `Bind<boolean>` | `true` | The kit fields on the page are validated before the wizard moves on, and the first invalid field receives focus. |
| `validate` | `() => boolean \| Promise<boolean>` | — | Runs after the fields are validated. `false` keeps the page and marks the step. |
| `lazy, keepAlive` | `Bind<boolean \| undefined>` | From the wizard | See the wizard prop. |
| `content` | `() => ComponentBase \| ComponentBase[]` | — | Creates the page programmatically when the page is created. |

### Events, properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `onStepChanging, onStepChanged` | event | The stepper events. `onStepChanging` (`cancel`, `promise`) runs before the page is validated. |
| `onFinishing` | event | Occurs when the last page is valid and the wizard is about to finish. `cancel = true` keeps it open, and `promise` waits and finishes on `true`. |
| `onFinished` | event | Occurs when the wizard finishes. Every step is shown as complete. |
| `next(), previous(), goTo(step)` | `Promise<boolean>` | Next validates the page and finishes on the last step. Back does not validate. `goTo` validates when moving forward. |
| `finish()` | `Promise<boolean>` | Validates the page, raises `onFinishing`, and then finishes. |
| `leaveCheck()` | `Promise<boolean>` | Validates the current page as Next does, without moving. |
| `add(step), insert(index, step), remove(step)` | `WizardStep` / `boolean` | Manage steps programmatically. A step from another wizard moves here. |
| `stepper, steps, currentStep, selectedIndex` | read-only | The `Stepper`, the `WizardStep` objects in order, the current step and its index. |
| `isLast, isFinished` | read-only | Indicate whether the current step is the last reachable one (Next finishes), and whether the wizard has finished. |
| `previousButton, nextButton` | read-only | The kit buttons in the bar, for a custom icon or appearance. |

## Feedback

Loading issues…
