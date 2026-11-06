import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import Custom from './examples/Custom';
import Programmatic from './examples/Programmatic';
import Vertical from './examples/Vertical';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['steps', '`readonly WizardStepProps[]`', '`[]`', 'Steps made programmatically, each as the props of a `WizardStep`; the JSX `WizardStep` children come first.'],
    ['value', '`Bind<string | number | null>`', '`0`', 'The current step: its `key`, else its index. `x-model` binds it two-way.'],
    ['linear', '`Bind<boolean>`', '`true`', 'A step is reached only after the ones before it; optional steps may be skipped.'],
    ['orientation', '`Bind<StepperOrientation>`', "`'horizontal'`", '`horizontal`: the stepper above the pages; `vertical`: beside them.'],
    ['labelPosition', '`Bind<StepperLabelPosition>`', "`'bottom'`", 'Where the stepper’s texts sit, horizontal only.'],
    ['size', '`Bind<ControlSize>`', "`'md'`", 'The stepper’s size.'],
    ['showStepper, showNavigation', '`Bind<boolean>`', '`true`', 'The stepper, and the bar with the Back and Next buttons.'],
    ['clickable', '`Bind<boolean>`', '`true`', 'The steps of the stepper can be pressed.'],
    ['lazy', '`Bind<boolean>`', '`true`', 'A page is built when first shown, then kept (a step’s own `lazy` wins).'],
    ['keepAlive', '`Bind<boolean>`', '`true`', '`false`: what a step’s `content` made is disposed while hidden and made again when it shows (a step’s own `keepAlive` wins).'],
    ['previousText, nextText, finishText', '`Bind<string>`', 'the kit’s “Back”, “Next”, “Finish”', 'The buttons’ texts.'],
    ['label', '`Bind<string>`', 'The kit string “Steps”', 'What screen readers call the stepper.']
];

const STEP_PROPS = [
    ['title', '`Bind<string>`', "`''`", 'The step’s text in the stepper. The same property as `text`.'],
    ['description', '`Bind<string>`', "`''`", 'A second line under the title.'],
    ['key', '`Bind<string>`', 'the index', 'Names the step in `value`; the JSX `key` works too.'],
    ['icon', '`Bind<IconSource | null>`', '`null`', 'Drawn in the indicator in place of the number.'],
    ['optional', '`Bind<boolean>`', '`false`', 'May be skipped; says so under the title.'],
    ['enabled', '`Bind<boolean>`', '`true`', '`false` keeps the step from being reached.'],
    ['error', '`Bind<boolean>`', '`false`', 'Draws the step with an error; the wizard sets it when the page does not validate, and clears it when it does.'],
    ['validateFields', '`Bind<boolean>`', '`true`', 'The kit’s fields on the page are validated before the wizard moves on from it; the first invalid one takes focus.'],
    ['validate', '`() => boolean | Promise<boolean>`', '—', 'Asked after the fields; `false` keeps the page and marks the step.'],
    ['lazy, keepAlive', '`Bind<boolean | undefined>`', 'the wizard’s', 'See the wizard’s.'],
    ['content', '`() => ComponentBase | ComponentBase[]`', '—', 'Makes the page programmatically, when the page is built.']
];

const MEMBERS = [
    ['onStepChanging, onStepChanged', 'event', 'The stepper’s events: `onStepChanging` (`cancel`, `promise`) runs before the page is validated.'],
    ['onFinishing', 'event', 'The last page validated and the wizard is about to finish; `cancel = true` keeps it open, `promise` waits and finishes on `true`.'],
    ['onFinished', 'event', 'The wizard finished: every step is drawn done.'],
    ['next(), previous(), goTo(step)', '`Promise<boolean>`', 'Next validates the page first and finishes on the last step; Back validates nothing; `goTo` validates when it goes forward.'],
    ['finish()', '`Promise<boolean>`', 'Validates the page, asks `onFinishing`, then finishes.'],
    ['leaveCheck()', '`Promise<boolean>`', 'Validates the current page the way Next does, without moving.'],
    ['add(step), insert(index, step), remove(step)', '`WizardStep` / `boolean`', 'Steps programmatically; a step of another wizard moves here.'],
    ['stepper, steps, currentStep, selectedIndex', 'read-only', 'The `Stepper`, the `WizardStep`s in order, the current one and its index.'],
    ['isLast, isFinished', 'read-only', 'The current step is the last that can be gone to (Next finishes); the wizard finished.'],
    ['previousButton, nextButton', 'read-only', 'The kit’s buttons in the bar, for an icon or a look of your own.']
];

const A11Y = [
    ['Stepper', 'A `nav` of steps as on the [Stepper](/stepper) page: each a button with its position and status in its name, one Tab stop.'],
    ['Page', 'A `group` named after its step; the hidden pages are out of the tree.'],
    ['Validation', 'A page that fails keeps focus on its first invalid field, with its message; the step reads “Needs attention”.'],
    ['Buttons', 'The kit’s buttons, named in the kit language: “Back”, “Next”, “Finish”.']
];

const HOOKS = [
    ['.mx-wizard', 'The wizard. `data-orientation`.'],
    ['.mx-wizard__stepper', 'The stepper (`.mx-stepper` too).'],
    ['.mx-wizard__pages, .mx-wizard__page', 'The pages and each page; a hidden page carries `hidden`.'],
    ['.mx-wizard__bar, .mx-wizard__previous, .mx-wizard__next', 'The bar and its buttons.']
];

const TOKENS = [
    ['wizard.frame, .page, .bar', 'Units: the whole, a page, the bar (a rule over it, its padding).'],
    ['wizard.previous, wizard.next', 'Places: the buttons’ look in the bar (`variant`).'],
    ['wizard.gap, .bar-gap, .rail-width', 'Between the stepper, the pages and the bar; between the buttons; the stepper’s width when it stands beside the pages.']
];

export default function WizardPage() {
    return (
        <>
            <p class="lead">
              <Rich text="A task in steps: a [Stepper](/stepper) above or beside one page per step, and the Back and Next buttons under them. Next validates the page first; on the last step it finishes." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { Wizard, WizardStep } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Pages from JSX">
                <p>
                    <Rich text="Each `WizardStep` is a step and its page. Next validates the kit’s fields on the page, then the step’s own `validate`; a page that fails keeps the wizard, marks its step and focuses the first invalid field. On the last step Next reads Finish and raises `onFinished`." />
                </p>
                <Example stack files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>

            <Section anchor="code" title="Programmatic use">
                <p>
                    <Rich text="`steps` makes the steps from props, each page from a `content` factory when it is first shown; `add`, `insert` and `remove` change them later. `next()`, `previous()`, `goTo()` and `finish()` move it." />
                </p>
                <Example stack files={code('Programmatic.tsx')}>
                    <Programmatic />
                </Example>
            </Section>

            <Section anchor="vertical" title="Standing">
                <Example stack files={code('Vertical.tsx')}>
                    <Vertical />
                </Example>
            </Section>

            <Section anchor="custom" title="Your own buttons, finishing that waits">
                <p>
                    <Rich text="`showNavigation={false}` takes the bar away; your own buttons call the methods. `onFinishing` may set a `promise`: the wizard finishes when it resolves to `true`, and stays otherwise." />
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
