# Wizard

> Navigation · @motifx-community/ui 0.1.0-beta.3

A task in steps: a [Stepper](stepper.md) above or beside one page per step, and the Back and Next buttons under them. Next validates the page first; on the last step it finishes.

## Import

```tsx
import { Wizard, WizardStep } from '@motifx-community/ui';
```

## Pages from JSX

Each `WizardStep` is a step and its page. Next validates the kit’s fields on the page, then the step’s own `validate`; a page that fails keeps the wizard, marks its step and focuses the first invalid field. On the last step Next reads Finish and raises `onFinished`.

```tsx
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
```

## Programmatic use

`steps` makes the steps from props, each page from a `content` factory when it is first shown; `add`, `insert` and `remove` change them later. `next()`, `previous()`, `goTo()` and `finish()` move it.

```tsx
import { Component, reactive } from '@motifx/core';
import { Button, Stack, Wizard, WizardStep } from '@motifx-community/ui';

// A page made programmatically: any MotifJS component.
class Note extends Component<HTMLDivElement, { text: string }> {
    override view() {
        return <p>{this.props.text}</p>;
    }
}

/** A wizard made programmatically: its steps as props with content factories, moved with its methods, a step added later. */
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

## Standing

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

## Your own buttons, finishing that waits

`showNavigation={false}` takes the bar away; your own buttons call the methods. `onFinishing` may set a `promise`: the wizard finishes when it resolves to `true`, and stays otherwise.

```tsx
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
```

## Accessibility

| Topic | How |
| --- | --- |
| `Stepper` | A `nav` of steps as on the [Stepper](stepper.md) page: each a button with its position and status in its name, one Tab stop. |
| `Page` | A `group` named after its step; the hidden pages are out of the tree. |
| `Validation` | A page that fails keeps focus on its first invalid field, with its message; the step reads “Needs attention”. |
| `Buttons` | The kit’s buttons, named in the kit language: “Back”, “Next”, “Finish”. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-wizard` | The wizard. `data-orientation`. |
| `.mx-wizard__stepper` | The stepper (`.mx-stepper` too). |
| `.mx-wizard__pages, .mx-wizard__page` | The pages and each page; a hidden page carries `hidden`. |
| `.mx-wizard__bar, .mx-wizard__previous, .mx-wizard__next` | The bar and its buttons. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `wizard.frame, .page, .bar` | Units: the whole, a page, the bar (a rule over it, its padding). |
| `wizard.previous, wizard.next` | Places: the buttons’ look in the bar (`variant`). |
| `wizard.gap, .bar-gap, .rail-width` | Between the stepper, the pages and the bar; between the buttons; the stepper’s width when it stands beside the pages. |

## API reference

### Wizard props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `steps` | `readonly WizardStepProps[]` | `[]` | Steps made programmatically, each as the props of a `WizardStep`; the JSX `WizardStep` children come first. |
| `value` | `Bind<string \| number \| null>` | `0` | The current step: its `key`, else its index. `x-model` binds it two-way. |
| `linear` | `Bind<boolean>` | `true` | A step is reached only after the ones before it; optional steps may be skipped. |
| `orientation` | `Bind<StepperOrientation>` | `'horizontal'` | `horizontal`: the stepper above the pages; `vertical`: beside them. |
| `labelPosition` | `Bind<StepperLabelPosition>` | `'bottom'` | Where the stepper’s texts sit, horizontal only. |
| `size` | `Bind<ControlSize>` | `'md'` | The stepper’s size. |
| `showStepper, showNavigation` | `Bind<boolean>` | `true` | The stepper, and the bar with the Back and Next buttons. |
| `clickable` | `Bind<boolean>` | `true` | The steps of the stepper can be pressed. |
| `lazy` | `Bind<boolean>` | `true` | A page is built when first shown, then kept (a step’s own `lazy` wins). |
| `keepAlive` | `Bind<boolean>` | `true` | `false`: what a step’s `content` made is disposed while hidden and made again when it shows (a step’s own `keepAlive` wins). |
| `previousText, nextText, finishText` | `Bind<string>` | the kit’s “Back”, “Next”, “Finish” | The buttons’ texts. |
| `label` | `Bind<string>` | the kit’s “Steps” | What screen readers call the stepper. |

### WizardStep props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `Bind<string>` | `''` | The step’s text in the stepper. The same property as `text`. |
| `description` | `Bind<string>` | `''` | A second line under the title. |
| `key` | `Bind<string>` | the index | Names the step in `value`; the JSX `key` works too. |
| `icon` | `Bind<IconSource \| null>` | `null` | Drawn in the indicator in place of the number. |
| `optional` | `Bind<boolean>` | `false` | May be skipped; says so under the title. |
| `enabled` | `Bind<boolean>` | `true` | `false` keeps the step from being reached. |
| `error` | `Bind<boolean>` | `false` | Draws the step with an error; the wizard sets it when the page does not validate, and clears it when it does. |
| `validateFields` | `Bind<boolean>` | `true` | The kit’s fields on the page are validated before the wizard moves on from it; the first invalid one takes focus. |
| `validate` | `() => boolean \| Promise<boolean>` | — | Asked after the fields; `false` keeps the page and marks the step. |
| `lazy, keepAlive` | `Bind<boolean \| undefined>` | the wizard’s | See the wizard’s. |
| `content` | `() => ComponentBase \| ComponentBase[]` | — | Makes the page programmatically, when the page is built. |

### Events, properties and methods

| Member | Kind | Description |
| --- | --- | --- |
| `onStepChanging, onStepChanged` | event | The stepper’s events: `onStepChanging` (`cancel`, `promise`) runs before the page is validated. |
| `onFinishing` | event | The last page validated and the wizard is about to finish; `cancel = true` keeps it open, `promise` waits and finishes on `true`. |
| `onFinished` | event | The wizard finished: every step is drawn done. |
| `next(), previous(), goTo(step)` | `Promise<boolean>` | Next validates the page first and finishes on the last step; Back validates nothing; `goTo` validates when it goes forward. |
| `finish()` | `Promise<boolean>` | Validates the page, asks `onFinishing`, then finishes. |
| `leaveCheck()` | `Promise<boolean>` | Validates the current page the way Next does, without moving. |
| `add(step), insert(index, step), remove(step)` | `WizardStep` / `boolean` | Steps programmatically; a step of another wizard moves here. |
| `stepper, steps, currentStep, selectedIndex` | read-only | The `Stepper`, the `WizardStep`s in order, the current one and its index. |
| `isLast, isFinished` | read-only | The current step is the last that can be gone to (Next finishes); the wizard finished. |
| `previousButton, nextButton` | read-only | The kit’s buttons in the bar, for an icon or a look of your own. |
