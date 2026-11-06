import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import Looks from './examples/Looks';
import Programmatic from './examples/Programmatic';
import Scrolling from './examples/Scrolling';
import WithContent from './examples/WithContent';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['title, subtitle', '`Bind<string>`', "`''`", 'The title, and a smaller line under it.'],
    ['titleAlign', "`Bind<'start' | 'center'>`", "`'start'`", 'A centered title stays in the middle of the bar whatever lies beside it.'],
    ['headingLevel', '`Bind<number | null>`', '`null`', 'Makes the title a heading of this level.'],
    ['logo', '`Bind<IconSource | null>`', '`null`', 'An image address, an element or a component before the title.'],
    ['navigation', "`Bind<'none' | 'menu' | 'back'>`", "`'none'`", 'The button at the start of the bar.'],
    ['navigationGlyph', '`Bind<string>`', "`'menu'`, `'arrow-start'`", 'The glyph of that button. The back arrow is mirrored in a right-to-left page.'],
    ['navigationLabel', '`Bind<string>`', 'A kit string', 'The accessible name of that button.'],
    ['actions', '`Bind<readonly ToolbarItem[]>`', '`[]`', 'The commands at the end of the bar, the same items as `Toolbar.items`.'],
    ['actionsLabel', '`Bind<string>`', 'The kit string “Actions”', 'The accessible name of the commands.'],
    ['overflow', '`Bind<ToolbarOverflow>`', "`'menu'`", 'How commands that do not fit are handled.'],
    ['content', '`Bind<ComponentBase | null>`', '`null`', 'A control between the title and the commands, the same as JSX children.'],
    ['tone', "`Bind<'surface' | 'accent'>`", "`'surface'`", 'The color of the bar.'],
    ['prominent', '`Bind<boolean>`', '`false`', 'Puts a larger title on a row of its own under the buttons.'],
    ['position', "`Bind<'static' | 'sticky' | 'fixed'>`", "`'sticky'`", 'How the bar stays on the page.'],
    ['scrollBehavior', "`Bind<'none' | 'lift' | 'hide'>`", "`'none'`", '`lift` raises the bar over the content that scrolls under it. `hide` also moves it away while scrolling down, and brings it back while scrolling up.'],
    ['scrollTarget', '`Bind<HTMLElement | null>`', 'The nearest ancestor that scrolls', 'What `scrollBehavior` watches. Without a scrolling ancestor, it is the page.'],
];

const EVENTS = [
    ['onNavigationClick', '`{ navigation, originalEvent, source }`', 'Occurs when the button at the start of the bar is pressed.'],
];

const A11Y = [
    ['Landmark', 'The bar is a `<header>`, which is a banner landmark when it is not inside a sectioning element.'],
    ['Heading', 'Use `headingLevel` when the title is the heading of the page.'],
    ['Commands', 'The commands are a `Toolbar` with an accessible name: one Tab stop, with the arrow keys, Home and End inside it.'],
    ['Focus', 'A bar moved away by `hide` comes back when focus enters it.'],
];

const HOOKS = [
    ['.mx-app-bar', 'The bar. `data-tone`, `data-position`, `data-title-align`, `data-prominent`, `data-lifted` and `data-hidden` describe its state.'],
    ['.mx-app-bar__row, .mx-app-bar__start, .mx-app-bar__navigation, .mx-app-bar__logo', 'The row, the start of the bar, the navigation button and the logo.'],
    ['.mx-app-bar__titles, .mx-app-bar__title, .mx-app-bar__subtitle', 'The titles.'],
    ['.mx-app-bar__content, .mx-app-bar__actions', 'The control and the commands.'],
];

const TOKENS = [
    ['app-bar.bar, .row, .start, .logo, .titles, .title, .subtitle, .content', 'Units: the bar (`lifted`, `accent`), the row (`prominent`), the title (`prominent`, `accent`) and the subtitle (`accent`).'],
    ['app-bar.title-least', 'The room the titles keep before commands move into the menu.'],
    ['app-bar.toolbar, .button', 'Places: the commands, and a button of an accent bar.'],
];

export default function AppBarPage() {
    return (
        <>
            <p class="lead">
                <Rich text="The top bar of an application, with a navigation button, a logo, a title, a control and commands. The commands are a `Toolbar`, so those that do not fit move into a menu." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { AppBar } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="basic" title="Title and commands">
                <p>
                    <Rich text="`navigation` adds a button at the start of the bar, and `onNavigationClick` reports it. `actions` takes the same items as `Toolbar.items`. Make the window narrower to see commands move into the menu." />
                </p>
                <Example stack files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>

            <Section anchor="looks" title="Title and tone">
                <p>
                    <Rich text="`titleAlign` centers the title, `tone` gives the bar the accent color, and `prominent` puts a larger title on a row of its own." />
                </p>
                <Example stack files={code('Looks.tsx')}>
                    <Looks />
                </Example>
            </Section>

            <Section anchor="content" title="A control in the bar">
                <p>
                    <Rich text="JSX children lie between the title and the commands. This is the place for a search box." />
                </p>
                <Example stack files={code('WithContent.tsx')}>
                    <WithContent />
                </Example>
            </Section>

            <Section anchor="scrolling" title="Scrolling">
                <p>
                    <Rich text="By default, the bar sticks to the top of what scrolls. `scrollBehavior` raises it over the content or moves it away while scrolling down. Scroll the box to compare them." />
                </p>
                <Example stack files={code('Scrolling.tsx')}>
                    <Scrolling />
                </Example>
            </Section>

            <Section anchor="programmatic" title="Programmatic use">
                <p>
                    <Rich text="`new AppBar(props)` creates the bar without JSX. Each prop is also a property." />
                </p>
                <Example stack files={code('Programmatic.tsx')}>
                    <Programmatic />
                </Example>
            </Section>

            <Section anchor="api" title="API reference">
                <h3>
                    <Rich text="Props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                    <Rich text="Events" />
                </h3>
                <ApiTable head={['Event', 'Type', 'Description']} rows={EVENTS} />
                <h3>
                    <Rich text="Accessibility" />
                </h3>
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
                <h3>
                    <Rich text="Styling hooks" />
                </h3>
                <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
                <h3>
                    <Rich text="Design tokens" />
                </h3>
                <ApiTable head={['Token', 'Description']} rows={TOKENS} />
            </Section>
        </>
    );
}
