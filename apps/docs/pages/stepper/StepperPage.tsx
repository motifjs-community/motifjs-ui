import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Programmatic from './examples/Programmatic';
import Linear from './examples/Linear';
import Orientations from './examples/Orientations';
import Sizes from './examples/Sizes';
import Statuses from './examples/Statuses';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['items', '`Bind<readonly (StepperItem | string)[]>`', '`[]`', 'The steps in order: `StepperItem`s (`text`, `description`, `key`, `icon`, `status`, `optional`, `enabled`, `data`) or plain texts.'],
    ['value', '`Bind<string | number | null>`', '`0`', 'The current step: its `key`, else its index; `null` for none. `x-model` binds it two-way.'],
    ['linear', '`Bind<boolean>`', '`true`', 'A press reaches a completed step, or the one right after the last completed; optional steps may be skipped.'],
    ['orientation', '`Bind<StepperOrientation>`', "`'horizontal'`", '`horizontal` or `vertical`.'],
    ['labelPosition', '`Bind<StepperLabelPosition>`', "`'bottom'`", 'Horizontal only: the texts under the indicator (`bottom`) or after it (`end`).'],
    ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`.'],
    ['clickable', '`Bind<boolean>`', '`true`', '`false` shows the way only: no buttons, no Tab stop.'],
    ['showNumbers', '`Bind<boolean>`', '`true`', 'The indicator of a step to come shows its number.'],
    ['label', '`Bind<string>`', 'the kit’s “Steps”', 'What screen readers call it.']
];

const MEMBERS = [
    ['onStepChanging', 'event', 'The current step is about to change (`from`, `to`, `fromItem`, `toItem`, `byUser`). `cancel = true` keeps it; `promise` set to a `Promise<boolean>` waits, and the step changes when it resolves to `true`.'],
    ['onStepChanged', 'event', 'The current step changed (`index`, `item`, `previous`, `byUser`).'],
    ['selectedIndex', 'read-only', 'The index of the current step; -1 when there is none.'],
    ['count', 'read-only', 'How many steps there are.'],
    ['canGoNext, canGoPrevious', 'read-only', 'There is an enabled step after, or before, the current one.'],
    ['next(), previous()', '`Promise<boolean>`', 'Goes to the next or the previous enabled step; `false` when there is none or the change was refused.'],
    ['goTo(step)', '`Promise<boolean>`', 'Goes to a step by index or key, whatever the order; `onStepChanging` is asked first.'],
    ['statusOf(index)', '`StepperStatus`', '`pending`, `current`, `done` or `error`, as drawn.'],
    ['canReach(index)', '`boolean`', 'Whether a press may reach the step.'],
    ['refresh()', '`void`', 'Reads the items again after they were changed in place.']
];

const STATUSES = [
    ['pending', 'A step to come: its number in the indicator.'],
    ['current', 'The step in hand: `aria-current="step"`.'],
    ['done', 'The steps before the current one, and any step whose item says `status: \'done\'`: a check in the indicator, the line before it filled.'],
    ['error', 'A step whose item says `status: \'error\'`: a mark in the indicator, the text in the danger colour; read out as “Needs attention”.'],
    ['optional', 'Says “Optional” under the text; in linear order it may be skipped.'],
    ['disabled', 'An item with `enabled: false`, or a step linear order does not reach yet: `aria-disabled`, out of the Tab order.']
];

const KEYS = [
    ['Tab', 'One stop: the step focused last, else the current one, else the first that can be reached.'],
    ['Arrow keys', 'Left and Right (Up and Down standing) move between the steps that can be reached, around the ends; Home and End go to the first and the last.'],
    ['Enter, Space', 'Choose the focused step; `onStepChanging` may refuse.']
];

const A11Y = [
    ['Landmark', 'A `nav` named “Steps” in the kit language, holding an ordered list; several on one page: give each its own `label`.'],
    ['A step', 'A button whose name reads “Step 2 of 4, Address, Where to send it, Completed”: the position, the texts and the status are all in it.'],
    ['Not clickable', 'Plain elements: nothing to press, the current one still `aria-current`.'],
    ['Lines and marks', 'Decorative, hidden from readers.']
];

const HOOKS = [
    ['.mx-stepper', 'The stepper. `data-orientation`, `data-labels`, `data-size`.'],
    ['.mx-stepper__list, .mx-stepper__item', 'The list and each step with its line. `data-status` on the item.'],
    ['.mx-stepper__step', 'The step: a button or a div. `data-status`, `aria-current`, `aria-disabled`.'],
    ['.mx-stepper__indicator, .mx-stepper__number, .mx-stepper__mark, .mx-stepper__icon', 'The circle, the number in it, the check or error mark, an icon of your own.'],
    ['.mx-stepper__label, .mx-stepper__description, .mx-stepper__note', 'The texts.'],
    ['.mx-stepper__line', 'The line to the next step. `data-status="done"` up to the current one.']
];

const TOKENS = [
    ['stepper.step, .indicator, .mark, .label, .description, .note, .line', 'Units: the step (`hover`, `pressed`, `focus`, `disabled`, `current`, `done`, `error`), its indicator, the mark (`icon` per state), the texts, the line (`done`); the line turns a quarter in a vertical stepper.'],
    ['stepper.size.*, .font-size.*, .padding.*', 'The indicator, the text and the space around a step, per size.'],
    ['stepper.description-font-size, .gap, .line-gap, .line-min-length', 'The second line, the space between indicator and texts, and the line’s margins and least length.']
];

export default function StepperPage() {
    return (
        <>
            <p class="lead">
                The steps of a longer task and where the user stands in them: an indicator and a text per step, a line between them, the
                steps before the current one completed. The <a rel="router" href="/wizard">Wizard</a> adds a page and the buttons to each
                step.
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
                    <Rich text="The current step is `value`: a step’s `key`, else its index; `x-model` binds it two-way. Programmatically, `next()`, `previous()` and `goTo()` move it and `onStepChanged` tells." />
                </p>
                <Example stack files={code('Programmatic.tsx')}>
                    <Programmatic />
                </Example>
            </Section>

            <Section anchor="statuses" title="Statuses">
                <p>
                    <Rich text="The steps before the current one are completed by themselves. An item may say `status: 'done'` or `'error'` whatever the current step is, be `optional`, be disabled, or carry an `icon` in place of its number; its fields may be functions of your state." />
                </p>
                <ApiTable head={['Status', 'How']} rows={STATUSES} />
                <Example stack files={code('Statuses.tsx')}>
                    <Statuses />
                </Example>
            </Section>

            <Section anchor="linear" title="In order, or free">
                <p>
                    <Rich text="`linear` (the default) lets a press reach only the completed steps and the next one; `linear={false}` lets it reach any. Either way `onStepChanging` is asked first: `cancel` keeps the step, a `promise` waits for a check or a server." />
                </p>
                <Example stack files={code('Linear.tsx')}>
                    <Linear />
                </Example>
            </Section>

            <Section anchor="orientations" title="Orientations">
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
                <ApiTable head={['Key', 'What it does']} rows={KEYS} />
            </Section>

            <Section anchor="a11y" title="Accessibility">
                <ApiTable head={['Topic', 'How']} rows={A11Y} />
            </Section>

            <Section anchor="styling" title="Styling">
                <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
                <h3>Component tokens</h3>
                <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
            </Section>

            <Section anchor="api" title="API reference">
                <h3>Props</h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>Events, properties and methods</h3>
                <ApiTable head={['Member', 'Kind', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
