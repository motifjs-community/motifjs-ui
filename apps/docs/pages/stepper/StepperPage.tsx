import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Programmatic from './examples/Programmatic';
import Linear from './examples/Linear';
import Orientations from './examples/Orientations';
import Sizes from './examples/Sizes';
import Statuses from './examples/Statuses';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['items', '`Bind<readonly (StepperItem | string)[]>`', '`[]`', 'The steps in order: `StepperItem` objects (`text`, `description`, `key`, `icon`, `status`, `optional`, `enabled`, `data`) or plain text.'],
    ['value', '`Bind<string | number | null>`', '`0`', 'The current step, identified by its `key` or index, or `null` for none. `x-model` provides two-way binding.'],
    ['linear', '`Bind<boolean>`', '`true`', 'Lets the user reach a completed step or the one right after the last completed step. Optional steps can be skipped.'],
    ['orientation', '`Bind<StepperOrientation>`', "`'horizontal'`", '`horizontal` or `vertical`.'],
    ['labelPosition', '`Bind<StepperLabelPosition>`', "`'bottom'`", 'In the horizontal orientation, places the text below the indicator (`bottom`) or after it (`end`).'],
    ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`.'],
    ['clickable', '`Bind<boolean>`', '`true`', '`false` makes the stepper display only, with no buttons or Tab stop.'],
    ['showNumbers', '`Bind<boolean>`', '`true`', 'Shows the number in the indicator of an upcoming step.'],
    ['label', '`Bind<string>`', 'The kit string “Steps”', 'The accessible name.']
];

const MEMBERS = [
    ['onStepChanging', 'event', 'Occurs before the current step changes (`from`, `to`, `fromItem`, `toItem`, `byUser`). `cancel = true` keeps it. Setting `promise` to a `Promise<boolean>` waits, and the step changes when it resolves to `true`.'],
    ['onStepChanged', 'event', 'Occurs after the current step changes (`index`, `item`, `previous`, `byUser`).'],
    ['selectedIndex', 'read-only', 'The index of the current step, or -1 if there is none.'],
    ['count', 'read-only', 'The number of steps.'],
    ['canGoNext, canGoPrevious', 'read-only', 'Indicates whether there is an enabled step after or before the current one.'],
    ['next(), previous()', '`Promise<boolean>`', 'Moves to the next or previous enabled step. Returns `false` if there is none or the change was canceled.'],
    ['goTo(step)', '`Promise<boolean>`', 'Moves to a step by index or key, in any order. `onStepChanging` is raised first.'],
    ['statusOf(index)', '`StepperStatus`', '`pending`, `current`, `done` or `error`, as displayed.'],
    ['canReach(index)', '`boolean`', 'Indicates whether the user can reach the step.'],
    ['refresh()', '`void`', 'Re-reads the items after they have been changed in place.']
];

const STATUSES = [
    ['pending', 'A step not yet reached, with its number in the indicator.'],
    ['current', 'The active step, with `aria-current="step"`.'],
    ['done', 'Steps before the current one, and any step with `status: \'done\'`. The indicator shows a check, and the line before it is filled.'],
    ['error', 'A step with `status: \'error\'`. The indicator shows a mark, the text uses the danger color, and it is announced as “Needs attention”.'],
    ['optional', 'Shows “Optional” below the text. In linear mode, the step can be skipped.'],
    ['disabled', 'An item with `enabled: false`, or a step that linear mode does not reach yet. It has `aria-disabled` and is outside the Tab order.']
];

const KEYS = [
    ['Tab', 'One Tab stop: the step focused last, otherwise the current one, otherwise the first reachable step.'],
    ['Arrow keys', 'Left and Right (Up and Down when vertical) move between reachable steps and wrap at the ends. Home and End move to the first and last.'],
    ['Enter, Space', 'Selects the focused step, and `onStepChanging` can cancel it.']
];

const A11Y = [
    ['Landmark', 'A `nav` named “Steps” in the kit language, containing an ordered list. If a page has several, give each one its own `label`.'],
    ['A step', 'A button whose name includes the position, text and status, such as “Step 2 of 4, Address, Where to send it, Completed”.'],
    ['Not clickable', 'Plain elements with nothing to press. The current step still has `aria-current`.'],
    ['Lines and marks', 'Decorative and hidden from screen readers.']
];

const HOOKS = [
    ['.mx-stepper', 'The stepper. `data-orientation`, `data-labels`, `data-size`.'],
    ['.mx-stepper__list, .mx-stepper__item', 'The list and each step with its connector. `data-status` is on the item.'],
    ['.mx-stepper__step', 'The step, as a button or a div. `data-status`, `aria-current`, `aria-disabled`.'],
    ['.mx-stepper__indicator, .mx-stepper__number, .mx-stepper__mark, .mx-stepper__icon', 'The circle, the number inside it, the check or error mark, and a custom icon.'],
    ['.mx-stepper__label, .mx-stepper__description, .mx-stepper__note', 'The text.'],
    ['.mx-stepper__line', 'The line to the next step. `data-status="done"` up to the current step.']
];

const TOKENS = [
    ['stepper.step, .indicator, .mark, .label, .description, .note, .line', 'Units: the step (`hover`, `pressed`, `focus`, `disabled`, `current`, `done`, `error`), its indicator, the mark (`icon` per state), the text and the line (`done`). In a vertical stepper, the line rotates 90 degrees.'],
    ['stepper.size.*, .font-size.*, .padding.*', 'The indicator, the text and the space around a step, per size.'],
    ['stepper.description-font-size, .gap, .line-gap, .line-min-length', 'The second line, the space between the indicator and text, and the margins and minimum length of the line.']
];

export default function StepperPage() {
    return (
        <>
            <p class="lead">
              <Rich text="Shows the steps of a longer task and the user's progress through them. Each step has an indicator and text, with a line between steps, and steps before the current one are marked complete. [Wizard](/wizard) adds a page and navigation buttons to each step." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { Stepper } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Declarative and programmatic">
                <p>
                    <Rich text="`value` is the current step, identified by its `key` or index, and `x-model` provides two-way binding. Programmatically, use `next()`, `previous()` and `goTo()`, and `onStepChanged` reports the change." />
                </p>
                <Example stack files={code('Programmatic.tsx')}>
                    <Programmatic />
                </Example>
            </Section>

            <Section anchor="statuses" title="Step status">
                <p>
                    <Rich text="Steps before the current one are completed automatically. An item can set `status: 'done'` or `'error'` regardless of the current step, be `optional` or disabled, or show an `icon` instead of its number. Its fields can be functions of your state." />
                </p>
                <ApiTable head={['Status', 'Details']} rows={STATUSES} />
                <Example stack files={code('Statuses.tsx')}>
                    <Statuses />
                </Example>
            </Section>

            <Section anchor="linear" title="Linear and free navigation">
                <p>
                    <Rich text="`linear` (the default) lets the user reach only completed steps and the next one, while `linear={false}` allows any step. In both cases, `onStepChanging` is raised first. `cancel` keeps the current step, and `promise` waits for a validation or a server response." />
                </p>
                <Example stack files={code('Linear.tsx')}>
                    <Linear />
                </Example>
            </Section>

            <Section anchor="orientations" title="Orientation">
                <Example stack files={code('Orientations.tsx')}>
                    <Orientations />
                </Example>
            </Section>

            <Section anchor="sizes" title="Sizes">
                <Example stack files={code('Sizes.tsx')}>
                    <Sizes />
                </Example>
            </Section>

            <Section anchor="keyboard" title="Keyboard">
                <ApiTable head={['Key', 'Description']} rows={KEYS} />
            </Section>

            <Section anchor="a11y" title="Accessibility">
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>

            <Section anchor="styling" title="Styling">
                <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
                <h3>
                  <Rich text="Component tokens" />
                </h3>
                <ApiTable head={['Token', 'Description']} rows={TOKENS} />
            </Section>

            <Section anchor="api" title="API reference">
                <h3>
                  <Rich text="Props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                  <Rich text="Events, properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Type', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
