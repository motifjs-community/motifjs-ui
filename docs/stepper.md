# Stepper

> Navigation · @motifx-community/ui 0.1.0-beta.2

The steps of a longer task and where the user stands in them: an indicator and a text per step, a line between them, the steps before the current one completed. The [Wizard](wizard.md) adds a page and the buttons to each step.

## Import

```tsx
import { Stepper } from '@motifx-community/ui';
```

## From JSX and from code

The current step is `value`: a step’s `key`, else its index; `x-model` binds it two-way. From code, `next()`, `previous()` and `goTo()` move it and `onStepChanged` tells.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, Stepper } from '@motifx-community/ui';

/** A stepper bound with x-model, and one made from code and moved with its own methods. */
export default function FromCode() {
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

## Statuses

The steps before the current one are completed by themselves. An item may say `status: 'done'` or `'error'` whatever the current step is, be `optional`, be disabled, or carry an `icon` in place of its number; its fields may be functions of your state.

| Status | How |
| --- | --- |
| `pending` | A step to come: its number in the indicator. |
| `current` | The step in hand: `aria-current="step"`. |
| `done` | The steps before the current one, and any step whose item says `status: 'done'`: a check in the indicator, the line before it filled. |
| `error` | A step whose item says `status: 'error'`: a mark in the indicator, the text in the danger colour; read out as “Needs attention”. |
| `optional` | Says “Optional” under the text; in linear order it may be skipped. |
| `disabled` | An item with `enabled: false`, or a step linear order does not reach yet: `aria-disabled`, out of the Tab order. |

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, Stepper } from '@motifx-community/ui';

const pencil = () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '<path d="M11.5 2.5l2 2L5 13H3v-2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>';
    return svg;
};

/** Completed and failed steps told by the items, an optional step, a disabled one, an icon in place of the number. */
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

## In order, or free

`linear` (the default) lets a press reach only the completed steps and the next one; `linear={false}` lets it reach any. Either way `onStepChanging` is asked first: `cancel` keeps the step, a `promise` waits for a check or a server.

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

## Orientations

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

| Key | What it does |
| --- | --- |
| `Tab` | One stop: the step focused last, else the current one, else the first that can be reached. |
| `Arrow keys` | Left and Right (Up and Down standing) move between the steps that can be reached, around the ends; Home and End go to the first and the last. |
| `Enter, Space` | Choose the focused step; `onStepChanging` may refuse. |

## Accessibility

| Topic | How |
| --- | --- |
| `Landmark` | A `nav` named “Steps” in the kit language, holding an ordered list; several on one page: give each its own `label`. |
| `A step` | A button whose name reads “Step 2 of 4, Address, Where to send it, Completed”: the position, the texts and the status are all in it. |
| `Not clickable` | Plain elements: nothing to press, the current one still `aria-current`. |
| `Lines and marks` | Decorative, hidden from readers. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-stepper` | The stepper. `data-orientation`, `data-labels`, `data-size`. |
| `.mx-stepper__list, .mx-stepper__item` | The list and each step with its line. `data-status` on the item. |
| `.mx-stepper__step` | The step: a button or a div. `data-status`, `aria-current`, `aria-disabled`. |
| `.mx-stepper__indicator, .mx-stepper__number, .mx-stepper__mark, .mx-stepper__icon` | The circle, the number in it, the check or error mark, an icon of your own. |
| `.mx-stepper__label, .mx-stepper__description, .mx-stepper__note` | The texts. |
| `.mx-stepper__line` | The line to the next step. `data-status="done"` up to the current one. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `stepper.step, .indicator, .mark, .label, .description, .note, .line` | Units: the step (`hover`, `pressed`, `focus`, `disabled`, `current`, `done`, `error`), its indicator, the mark (`icon` per state), the texts, the line (`done`); the line turns a quarter in a vertical stepper. |
| `stepper.size.*, .font-size.*, .padding.*` | The indicator, the text and the space around a step, per size. |
| `stepper.description-font-size, .gap, .line-gap, .line-min-length` | The second line, the space between indicator and texts, and the line’s margins and least length. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly (StepperItem \| string)[]>` | `[]` | The steps in order: `StepperItem`s (`text`, `description`, `key`, `icon`, `status`, `optional`, `enabled`, `data`) or plain texts. |
| `value` | `Bind<string \| number \| null>` | `0` | The current step: its `key`, else its index; `null` for none. `x-model` binds it two-way. |
| `linear` | `Bind<boolean>` | `true` | A press reaches a completed step, or the one right after the last completed; optional steps may be skipped. |
| `orientation` | `Bind<StepperOrientation>` | `'horizontal'` | `horizontal` or `vertical`. |
| `labelPosition` | `Bind<StepperLabelPosition>` | `'bottom'` | Horizontal only: the texts under the indicator (`bottom`) or after it (`end`). |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`. |
| `clickable` | `Bind<boolean>` | `true` | `false` shows the way only: no buttons, no Tab stop. |
| `showNumbers` | `Bind<boolean>` | `true` | The indicator of a step to come shows its number. |
| `label` | `Bind<string>` | the kit’s “Steps” | What screen readers call it. |

### Events, properties and methods

| Member | Kind | Description |
| --- | --- | --- |
| `onStepChanging` | event | The current step is about to change (`from`, `to`, `fromItem`, `toItem`, `byUser`). `cancel = true` keeps it; `promise` set to a `Promise<boolean>` waits, and the step changes when it resolves to `true`. |
| `onStepChanged` | event | The current step changed (`index`, `item`, `previous`, `byUser`). |
| `selectedIndex` | read-only | The index of the current step; -1 when there is none. |
| `count` | read-only | How many steps there are. |
| `canGoNext, canGoPrevious` | read-only | There is an enabled step after, or before, the current one. |
| `next(), previous()` | `Promise<boolean>` | Goes to the next or the previous enabled step; `false` when there is none or the change was refused. |
| `goTo(step)` | `Promise<boolean>` | Goes to a step by index or key, whatever the order; `onStepChanging` is asked first. |
| `statusOf(index)` | `StepperStatus` | `pending`, `current`, `done` or `error`, as drawn. |
| `canReach(index)` | `boolean` | Whether a press may reach the step. |
| `refresh()` | `void` | Reads the items again after they were changed in place. |
