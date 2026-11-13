import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Container from './examples/Container';
import Options from './examples/Options';
import Page from './examples/Page';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['target', '`Bind<ComponentBase | null>`', '`null`', 'The area to cover, a component. `null` covers the whole page.'],
    ['message', '`Bind<string>`', 'The kit string “Loading…”', 'The message below the indicator. This is the same property as `text`.'],
    ['value', '`Bind<boolean>`', '`false`', 'Indicates whether the panel is shown. `x-model` provides two-way binding.'],
    ['delay', '`Bind<number>`', '`0`', 'The delay in milliseconds before it appears. Hiding it before then shows nothing.'],
    ['shade', '`Bind<boolean>`', '`true`', 'Dims the covered area.'],
    ['showPane', '`Bind<boolean>`', '`true`', 'Shows the box behind the indicator and the message.'],
    ['showIndicator', '`Bind<boolean>`', '`true`', 'Shows the rotating indicator (the kit spinner).'],
    ['cancelable', '`Bind<boolean>`', '`false`', 'Shows a Cancel button in the panel. Escape activates it too.'],
    ['cancelText', '`Bind<string>`', 'The kit string “Cancel”', 'The button text.'],
    ['closeOnOutside', '`Bind<boolean>`', '`false`', 'Clicking the shade hides the panel.']
];

const MEMBERS = [
    ['onShown, onHidden', 'event', 'Occur when the panel appears (after its delay) and when it is hidden.'],
    ['onCancel', 'event', 'Occurs when the Cancel button or Escape is pressed. The panel hides afterward.'],
    ['show(), hide(), cancel()', '`boolean` / `void`', 'Programmatic control. `show()` returns `false` while the panel is shown or waiting for its delay.'],
    ['isShown', 'read-only', 'Indicates whether the panel is currently on screen.'],
    ['spinner, cancelButton', 'read-only', 'The kit spinner and button in the panel.']
];

const BEHAVIOUR = [
    ['Covering a container', 'The panel is placed inside the container, above its content. The container gets `aria-busy`, and the content under the panel is inert, so it cannot be clicked or focused.'],
    ['Over the page', 'Without a `target`, the panel covers the viewport and the rest of the page is inert.'],
    ['Focus', 'Focus moves from the content underneath to the panel (to the Cancel button if there is one) and returns to its original position when the panel hides.'],
    ['Delay', 'Quick operations show nothing. The panel appears after `delay`, and hiding it before then cancels it.'],
    ['Spinner.cover', 'The kit spinner can cover a container with a single call (`Spinner.cover`). LoadPanel is the full component, with the panel, message, delay and button.']
];

const A11Y = [
    ['Pane', 'A `status` region. The message is announced when the panel appears and when it changes.'],
    ['Indicator', 'Decorative. The message describes what is happening.'],
    ['Under it', '`inert` and `aria-busy`, so screen readers skip the content and it cannot receive clicks or focus.'],
    ['Cancel', 'A kit button named in the kit language. Escape activates it.']
];

const HOOKS = [
    ['.mx-load-panel', 'The layer. `data-shade`, `data-pane`, `data-page`.'],
    ['.mx-load-panel__pane', 'The panel.'],
    ['.mx-load-panel__indicator, .mx-load-panel__message, .mx-load-panel__cancel', 'The spinner, the message and the button.']
];

const TOKENS = [
    ['load-panel.shade, .pane, .message', 'Units: the layer (`shaded`), the panel (`shown`) and the message.'],
    ['load-panel.cancel', 'Place: the appearance of the Cancel button (`variant`).'],
    ['load-panel.padding, .gap', 'The minimum distance to the edge of the covered area, and the space between the indicator, message and button.']
];

export default function LoadPanelPage() {
    return (
        <>
            <p class="lead">
              <Rich text="A loading overlay for a container or the whole page. It includes a shade, a panel with the kit spinner and a message, and a Cancel button when the operation can be stopped. The content underneath is unavailable while it is shown, and focus returns afterward." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { LoadPanel } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Covering a container">
                <p>
                    <Rich text="`target` specifies the component to cover. `value` or `x-model` shows and hides the panel, or you can call `show()` and `hide()`. `delay` keeps it from flashing during quick operations." />
                </p>
                <Example stack files={code('Container.tsx')}>
                    <Container />
                </Example>
            </Section>

            <Section anchor="page" title="Covering the page, with Cancel">
                <Example files={code('Page.tsx')}>
                    <Page />
                </Example>
            </Section>

            <Section anchor="options" title="Shade, panel and indicator">
                <Example stack files={code('Options.tsx')}>
                    <Options />
                </Example>
            </Section>

            <Section anchor="behaviour" title="Behavior">
                <ApiTable head={['Topic', 'Details']} rows={BEHAVIOUR} />
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
