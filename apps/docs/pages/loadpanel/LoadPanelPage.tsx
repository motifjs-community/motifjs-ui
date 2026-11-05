import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Container from './examples/Container';
import Options from './examples/Options';
import Page from './examples/Page';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['target', '`Bind<ComponentBase | HTMLElement | null>`', '`null`', 'What it covers: a component or an element; `null` covers the whole page.'],
    ['message', '`Bind<string>`', 'the kit’s “Loading…”', 'The message under the indicator. The same property as `text`.'],
    ['value', '`Bind<boolean>`', '`false`', 'Shown or not; `x-model` binds it two-way.'],
    ['delay', '`Bind<number>`', '`0`', 'Milliseconds before it shows; a hide before that shows nothing.'],
    ['shade', '`Bind<boolean>`', '`true`', 'Dims what it covers.'],
    ['showPane', '`Bind<boolean>`', '`true`', 'The box behind the indicator and the message.'],
    ['showIndicator', '`Bind<boolean>`', '`true`', 'The turning indicator (the kit’s spinner).'],
    ['cancelable', '`Bind<boolean>`', '`false`', 'A Cancel button in the pane; Escape presses it too.'],
    ['cancelText', '`Bind<string>`', 'the kit’s “Cancel”', 'The button’s text.'],
    ['closeOnOutside', '`Bind<boolean>`', '`false`', 'A press on the shade hides it.']
];

const MEMBERS = [
    ['onShown, onHidden', 'event', 'It came on the screen (after its delay); it went.'],
    ['onCancel', 'event', 'The Cancel button was pressed, or Escape; the panel hides after.'],
    ['show(), hide(), cancel()', '`boolean` / `void`', 'From code; `show()` is `false` while it is shown or waiting for its delay.'],
    ['isShown', 'read-only', 'Whether it is on the screen now.'],
    ['spinner, cancelButton', 'read-only', 'The kit’s spinner and button in the pane.']
];

const BEHAVIOUR = [
    ['Over a container', 'It goes inside the container, over everything in it; the container is `aria-busy` and what is under the panel is inert: nothing there can be pressed or focused.'],
    ['Over the page', 'Without a `target`, it covers the viewport and the rest of the page is inert.'],
    ['Focus', 'Focus that was under it waits on the panel (on the Cancel button when there is one) and goes back where it was when the panel hides.'],
    ['Delay', 'Quick work shows nothing: it comes after `delay`, and a hide before that cancels it.'],
    ['Spinner.cover', 'The kit’s spinner covers a container from code in one call (`Spinner.cover`); the load panel is the component with the pane, the message, the delay and the button.']
];

const A11Y = [
    ['Pane', 'A `status` region: the message is read when the panel appears, and again when it changes.'],
    ['Indicator', 'Decorative; the message says what is going on.'],
    ['Under it', '`inert` and `aria-busy`, so readers skip it and nothing there takes a press or focus.'],
    ['Cancel', 'The kit’s button, named in the kit language; Escape presses it.']
];

const HOOKS = [
    ['.mx-load-panel', 'The layer. `data-shade`, `data-pane`, `data-page`.'],
    ['.mx-load-panel__pane', 'The pane.'],
    ['.mx-load-panel__indicator, .mx-load-panel__message, .mx-load-panel__cancel', 'The spinner, the message and the button.']
];

const TOKENS = [
    ['load-panel.shade, .pane, .message', 'Units: the layer (`shaded`), the pane (`shown`), the message.'],
    ['load-panel.cancel', 'Place: the Cancel button’s look (`variant`).'],
    ['load-panel.padding, .gap', 'The least space to the edge of what it covers; the space between the indicator, the message and the button.']
];

export default function LoadPanelPage() {
    return (
        <>
            <p class="lead">
                A “loading” layer over a container or the whole page: a shade, a pane with the kit’s spinner and a message, a Cancel
                button when the work can be stopped. Nothing under it can be used meanwhile, and focus comes back afterwards.
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { LoadPanel } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Over a container">
                <p>
                    <Rich text="`target` names the component or element it covers; `value` (or `x-model`) shows and hides it, `show()` and `hide()` from code. `delay` keeps quick work from flashing it." />
                </p>
                <Example stack files={code('Container.tsx')}>
                    <Container />
                </Example>
            </Section>

            <Section anchor="page" title="Over the page, with Cancel">
                <Example files={code('Page.tsx')}>
                    <Page />
                </Example>
            </Section>

            <Section anchor="options" title="Shade, pane and indicator">
                <Example stack files={code('Options.tsx')}>
                    <Options />
                </Example>
            </Section>

            <Section anchor="behaviour" title="Behaviour">
                <ApiTable head={['Topic', 'How']} rows={BEHAVIOUR} />
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
