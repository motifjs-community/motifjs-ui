import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import Custom from './examples/Custom';
import Programmatic from './examples/Programmatic';
import Vertical from './examples/Vertical';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['steps', '`readonly WizardStepProps[]`', '`[]`', 'Steps created programmatically, each as `WizardStep` props. JSX `WizardStep` children come first.'],
    ['value', '`Bind<string | number | null>`', '`0`', 'The current step, identified by its `key` or index. `x-model` provides two-way binding.'],
    ['linear', '`Bind<boolean>`', '`true`', 'A step can be reached only after the previous ones, and optional steps can be skipped.'],
    ['orientation', '`Bind<StepperOrientation>`', "`'horizontal'`", '`horizontal` places the stepper above the pages, and `vertical` places it next to them.'],
    ['labelPosition', '`Bind<StepperLabelPosition>`', "`'bottom'`", 'The position of the stepper text, in the horizontal orientation only.'],
    ['size', '`Bind<ControlSize>`', "`'md'`", 'The size of the stepper.'],
    ['showStepper, showNavigation', '`Bind<boolean>`', '`true`', 'Shows the stepper, and the bar with the Back and Next buttons.'],
    ['clickable', '`Bind<boolean>`', '`true`', 'Lets the user press the stepper steps.'],
    ['lazy', '`Bind<boolean>`', '`true`', 'Creates a page when first shown and then keeps it. A step\'s own `lazy` takes precedence.'],
    ['keepAlive', '`Bind<boolean>`', '`true`', 'With `false`, content created by a step\'s `content` is disposed while hidden and recreated when shown. A step\'s own `keepAlive` takes precedence.'],
    ['previousText, nextText, finishText', '`Bind<string>`', 'The kit strings “Back”, “Next” and “Finish”', 'The button text.'],
    ['label', '`Bind<string>`', 'The kit string “Steps”', 'The accessible name of the stepper.']
];

const STEP_PROPS = [
    ['title', '`Bind<string>`', "`''`", 'The step text in the stepper. This is the same property as `text`.'],
    ['description', '`Bind<string>`', "`''`", 'A second line below the title.'],
    ['key', '`Bind<string>`', 'The index', 'Identifies the step in `value`. The JSX `key` also works.'],
    ['icon', '`Bind<IconSource | null>`', '`null`', 'Displayed in the indicator instead of the number.'],
    ['optional', '`Bind<boolean>`', '`false`', 'Marks the step as optional, which appears below the title.'],
    ['enabled', '`Bind<boolean>`', '`true`', '`false` prevents the step from being reached.'],
    ['error', '`Bind<boolean>`', '`false`', 'Shows the step with an error. The wizard sets it when the page fails validation and clears it when the page passes.'],
    ['validateFields', '`Bind<boolean>`', '`true`', 'The kit fields on the page are validated before the wizard moves on, and the first invalid field receives focus.'],
    ['validate', '`() => boolean | Promise<boolean>`', '—', 'Runs after the fields are validated. `false` keeps the page and marks the step.'],
    ['lazy, keepAlive', '`Bind<boolean | undefined>`', 'From the wizard', 'See the wizard prop.'],
    ['content', '`() => ComponentBase | ComponentBase[]`', '—', 'Creates the page programmatically when the page is created.']
];

const MEMBERS = [
    ['onStepChanging, onStepChanged', 'event', 'The stepper events. `onStepChanging` (`cancel`, `promise`) runs before the page is validated.'],
    ['onFinishing', 'event', 'Occurs when the last page is valid and the wizard is about to finish. `cancel = true` keeps it open, and `promise` waits and finishes on `true`.'],
    ['onFinished', 'event', 'Occurs when the wizard finishes. Every step is shown as complete.'],
    ['next(), previous(), goTo(step)', '`Promise<boolean>`', 'Next validates the page and finishes on the last step. Back does not validate. `goTo` validates when moving forward.'],
    ['finish()', '`Promise<boolean>`', 'Validates the page, raises `onFinishing`, and then finishes.'],
    ['leaveCheck()', '`Promise<boolean>`', 'Validates the current page as Next does, without moving.'],
    ['add(step), insert(index, step), remove(step)', '`WizardStep` / `boolean`', 'Manage steps programmatically. A step from another wizard moves here.'],
    ['stepper, steps, currentStep, selectedIndex', 'read-only', 'The `Stepper`, the `WizardStep` objects in order, the current step and its index.'],
    ['isLast, isFinished', 'read-only', 'Indicate whether the current step is the last reachable one (Next finishes), and whether the wizard has finished.'],
    ['previousButton, nextButton', 'read-only', 'The kit buttons in the bar, for a custom icon or appearance.']
];

const A11Y = [
    ['Stepper', 'A `nav` of steps, as on the [Stepper](/stepper) page. Each step is a button with its position and status in its name, and there is one Tab stop.'],
    ['Page', 'A `group` named after its step. Hidden pages are removed from the accessibility tree.'],
    ['Validation', 'When validation fails, focus stays on the first invalid field with its message, and the step is announced as “Needs attention”.'],
    ['Buttons', 'Kit buttons named “Back”, “Next” and “Finish” in the kit language.']
];

const HOOKS = [
    ['.mx-wizard', 'The wizard. `data-orientation`.'],
    ['.mx-wizard__stepper', 'The stepper (also `.mx-stepper`).'],
    ['.mx-wizard__pages, .mx-wizard__page', 'The pages and each page. A hidden page has `hidden`.'],
    ['.mx-wizard__bar, .mx-wizard__previous, .mx-wizard__next', 'The bar and its buttons.']
];

const TOKENS = [
    ['wizard.frame, .page, .bar', 'Units: the root, a page and the bar (a divider above it and its padding).'],
    ['wizard.previous, wizard.next', 'Places: the appearance of the buttons in the bar (`variant`).'],
    ['wizard.gap, .bar-gap, .rail-width', 'The spacing between the stepper, pages and bar, and between the buttons, plus the stepper width when it is next to the pages.']
];

export default function WizardPage() {
    return (
        <>
            <p class="lead">
              <Rich text="Guides the user through a multi-step task. It combines a [Stepper](/stepper) above or next to one page per step with Back and Next buttons below. Next validates the page first, and on the last step it finishes the wizard." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { Wizard, WizardStep } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Defining pages in JSX">
                <p>
                    <Rich text="Each `WizardStep` is a step and its page. Next validates the kit fields on the page and then runs the step's own `validate`. If validation fails, the wizard stays on the page, marks the step and focuses the first invalid field. On the last step, Next becomes Finish and raises `onFinished`." />
                </p>
                <Example stack files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>

            <Section anchor="code" title="Programmatic use">
                <p>
                    <Rich text="`steps` creates steps from props, and each page is created from a `content` factory when first shown. `add`, `insert` and `remove` change the steps later, and `next()`, `previous()`, `goTo()` and `finish()` navigate." />
                </p>
                <Example stack files={code('Programmatic.tsx')}>
                    <Programmatic />
                </Example>
            </Section>

            <Section anchor="vertical" title="Vertical orientation">
                <Example stack files={code('Vertical.tsx')}>
                    <Vertical />
                </Example>
            </Section>

            <Section anchor="custom" title="Custom buttons and asynchronous finish">
                <p>
                    <Rich text="`showNavigation={false}` removes the bar, so your own buttons can call the methods. `onFinishing` can set a `promise`, and the wizard finishes when it resolves to `true` and stays open otherwise." />
                </p>
                <Example stack files={code('Custom.tsx')}>
                    <Custom />
                </Example>
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
                  <Rich text="Wizard props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                  <Rich text="WizardStep props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={STEP_PROPS} />
                <h3>
                  <Rich text="Events, properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Type', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
