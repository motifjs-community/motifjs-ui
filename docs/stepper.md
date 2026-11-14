# Stepper

> Navigation · @motifx-community/ui 0.1.0-beta.10

Shows the steps of a longer task and the user's progress through them. Each step has an indicator and text, with a line between steps, and steps before the current one are marked complete. [Wizard](wizard.md) adds a page and navigation buttons to each step.

## Import

```tsx
import { Stepper } from '@motifx-community/ui';
```

## Declarative and programmatic

`value` is the current step, identified by its `key` or index, and `x-model` provides two-way binding. Programmatically, use `next()`, `previous()` and `goTo()`, and `onStepChanged` reports the change.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, Stepper } from '@motifx-community/ui';

/** A stepper bound with x-model, and one created programmatically and moved with its methods. */
export default function Programmatic() {
    const s = reactive({ step: 0 as string | number | null, at: 0, told: '' });
    const coded = new Stepper({
        label: 'Order',
        items: ['Cart', 'Address', 'Payment', 'Done'],
        linear: false,
        onStepChanged: e => {
            s.at = e.index;
            s.told = `Step ${e.index + 1}${e.byUser ? ', pressed' : ''}`;
        }
    });

    return (
        <Stack gap="lg" style="inline-size: 100%">
            <Stepper label="Sign up" items={['Account', 'Profile', 'Review']} x-model={() => s.step} />
            <output class="st-value">{() => `value: ${JSON.stringify(s.step)}`}</output>
            <span onConfig={c => c.controls.add(coded)} />
            <Stack orientation="horizontal" wrap align="center">
                <Button text="Back" variant="outline" enabled={() => s.at > 0} onclick={() => void coded.previous()} />
                <Button text="Next" variant="outline" enabled={() => s.at < 3} onclick={() => void coded.next()} />
                <output class="st-told">{() => s.told}</output>
            </Stack>
        </Stack>
    );
}
```

## Step status

Steps before the current one are completed automatically. An item can set `status: 'done'` or `'error'` regardless of the current step, be `optional` or disabled, or show an `icon` instead of its number. Its fields can be functions of your state.

| Status | Details |
| --- | --- |
| `pending` | A step not yet reached, with its number in the indicator. |
| `current` | The active step, with `aria-current="step"`. |
| `done` | Steps before the current one, and any step with `status: 'done'`. The indicator shows a check, and the line before it is filled. |
| `error` | A step with `status: 'error'`. The indicator shows a mark, the text uses the danger color, and it is announced as “Needs attention”. |
| `optional` | Shows “Optional” below the text. In linear mode, the step can be skipped. |
| `disabled` | An item with `enabled: false`, or a step that linear mode does not reach yet. It has `aria-disabled` and is outside the Tab order. |

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, Stepper } from '@motifx-community/ui';

const pencil = () => (
    <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M11.5 2.5l2 2L5 13H3v-2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
    </svg>
);

/** Completed and failed steps set by the items, an optional step, a disabled step, and an icon in place of the number. */
export default function Statuses() {
    const s = reactive({ paid: false });
    const items = [
        { text: 'Cart', status: 'done' as const },
        { text: 'Address', description: 'Checked', status: 'done' as const },
        { text: 'Payment', description: () => (s.paid ? 'Paid' : 'Card declined'), status: () => (s.paid ? 'done' : 'error') },
        { text: 'Gift note', optional: true, icon: pencil() },
        { text: 'Pick-up', enabled: false },
        { text: 'Done' }
    ];
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Stepper label="Statuses" items={items} value={5} linear={false} />
            <Button text={() => (s.paid ? 'Decline the card' : 'Take the payment')} variant="outline" onclick={() => (s.paid = !s.paid)} />
        </Stack>
    );
}
```

## Linear and free navigation

`linear` (the default) lets the user reach only completed steps and the next one, while `linear={false}` allows any step. In both cases, `onStepChanging` is raised first. `cancel` keeps the current step, and `promise` waits for a validation or a server response.

```tsx
import { reactive } from '@motifx/core';
import { CheckBox, Stack, Stepper } from '@motifx-community/ui';

/** In linear order a step is reached only after the ones before it; `onStepChanging` refuses a step while the box is unchecked. */
export default function Linear() {
    const s = reactive({ step: 0 as string | number | null, agreed: false, note: '' });
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Stepper
                label="In order"
                items={['Terms', 'Details', 'Confirm']}
                x-model={() => s.step}
                onStepChanging={e => {
                    if (e.to > 0 && !s.agreed) {
                        e.cancel = true;
                        s.note = 'Accept the terms first.';
                    } else {
                        s.note = '';
                    }
                }}
            />
            <CheckBox label="I accept the terms" x-model={() => s.agreed} />
            <output class="st-note">{() => s.note}</output>
        </Stack>
    );
}
```

## Orientation

```tsx
import { Stack, Stepper } from '@motifx-community/ui';

const STEPS = [
    { text: 'Details', description: 'Name and e-mail' },
    { text: 'Address', description: 'Where to send it' },
    { text: 'Payment', description: 'Card or transfer' },
    { text: 'Review' }
];

/** Horizontal with the texts under or after the indicators, and vertical. */
export default function Orientations() {
    return (
        <Stack gap="lg" style="inline-size: 100%">
            <Stepper label="Texts under" items={STEPS} value={1} linear={false} />
            <Stepper label="Texts after" items={STEPS.slice(0, 3)} value={1} labelPosition="end" linear={false} />
            <div style="inline-size: 18rem">
                <Stepper label="Standing" items={STEPS} value={1} orientation="vertical" linear={false} />
            </div>
        </Stack>
    );
}
```

## Sizes

```tsx
import { Stack, Stepper } from '@motifx-community/ui';

const STEPS = ['Plan', 'Build', 'Ship'];

/** Three sizes, and a stepper without numbers. */
export default function Sizes() {
    return (
        <Stack gap="lg" style="inline-size: 100%">
            <Stepper label="Small" items={STEPS} value={1} size="sm" linear={false} />
            <Stepper label="Medium" items={STEPS} value={1} linear={false} />
            <Stepper label="Large" items={STEPS} value={1} size="lg" linear={false} />
            <Stepper label="Dots" items={STEPS} value={1} showNumbers={false} size="sm" labelPosition="end" linear={false} />
        </Stack>
    );
}
```

## Keyboard

| Key | Description |
| --- | --- |
| `Tab` | One Tab stop: the step focused last, otherwise the current one, otherwise the first reachable step. |
| `Arrow keys` | Left and Right (Up and Down when vertical) move between reachable steps and wrap at the ends. Home and End move to the first and last. |
| `Enter, Space` | Selects the focused step, and `onStepChanging` can cancel it. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Landmark` | A `nav` named “Steps” in the kit language, containing an ordered list. If a page has several, give each one its own `label`. |
| `A step` | A button whose name includes the position, text and status, such as “Step 2 of 4, Address, Where to send it, Completed”. |
| `Not clickable` | Plain elements with nothing to press. The current step still has `aria-current`. |
| `Lines and marks` | Decorative and hidden from screen readers. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-stepper` | The stepper. `data-orientation`, `data-labels`, `data-size`. |
| `.mx-stepper__list, .mx-stepper__item` | The list and each step with its connector. `data-status` is on the item. |
| `.mx-stepper__step` | The step, as a button or a div. `data-status`, `aria-current`, `aria-disabled`. |
| `.mx-stepper__indicator, .mx-stepper__number, .mx-stepper__mark, .mx-stepper__icon` | The circle, the number inside it, the check or error mark, and a custom icon. |
| `.mx-stepper__label, .mx-stepper__description, .mx-stepper__note` | The text. |
| `.mx-stepper__line` | The line to the next step. `data-status="done"` up to the current step. |

### Component tokens

| Token | Description |
| --- | --- |
| `stepper.step, .indicator, .mark, .label, .description, .note, .line` | Units: the step (`hover`, `pressed`, `focus`, `disabled`, `current`, `done`, `error`), its indicator, the mark (`icon` per state), the text and the line (`done`). In a vertical stepper, the line rotates 90 degrees. |
| `stepper.size.*, .font-size.*, .padding.*` | The indicator, the text and the space around a step, per size. |
| `stepper.description-font-size, .gap, .line-gap, .line-min-length` | The second line, the space between the indicator and text, and the margins and minimum length of the line. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly (StepperItem \| string)[]>` | `[]` | The steps in order: `StepperItem` objects (`text`, `description`, `key`, `icon`, `status`, `optional`, `enabled`, `data`) or plain text. |
| `value` | `Bind<string \| number \| null>` | `0` | The current step, identified by its `key` or index, or `null` for none. `x-model` provides two-way binding. |
| `linear` | `Bind<boolean>` | `true` | Lets the user reach a completed step or the one right after the last completed step. Optional steps can be skipped. |
| `orientation` | `Bind<StepperOrientation>` | `'horizontal'` | `horizontal` or `vertical`. |
| `labelPosition` | `Bind<StepperLabelPosition>` | `'bottom'` | In the horizontal orientation, places the text below the indicator (`bottom`) or after it (`end`). |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`. |
| `clickable` | `Bind<boolean>` | `true` | `false` makes the stepper display only, with no buttons or Tab stop. |
| `showNumbers` | `Bind<boolean>` | `true` | Shows the number in the indicator of an upcoming step. |
| `label` | `Bind<string>` | The kit string “Steps” | The accessible name. |

### Events, properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `onStepChanging` | event | Occurs before the current step changes (`from`, `to`, `fromItem`, `toItem`, `byUser`). `cancel = true` keeps it. Setting `promise` to a `Promise<boolean>` waits, and the step changes when it resolves to `true`. |
| `onStepChanged` | event | Occurs after the current step changes (`index`, `item`, `previous`, `byUser`). |
| `selectedIndex` | read-only | The index of the current step, or -1 if there is none. |
| `count` | read-only | The number of steps. |
| `canGoNext, canGoPrevious` | read-only | Indicates whether there is an enabled step after or before the current one. |
| `next(), previous()` | `Promise<boolean>` | Moves to the next or previous enabled step. Returns `false` if there is none or the change was canceled. |
| `goTo(step)` | `Promise<boolean>` | Moves to a step by index or key, in any order. `onStepChanging` is raised first. |
| `statusOf(index)` | `StepperStatus` | `pending`, `current`, `done` or `error`, as displayed. |
| `canReach(index)` | `boolean` | Indicates whether the user can reach the step. |
| `refresh()` | `void` | Re-reads the items after they have been changed in place. |

## Feedback

Loading issues…
