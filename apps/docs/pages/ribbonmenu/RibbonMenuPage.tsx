import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Editor from './examples/Editor';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const TOPICS = [
    ['[Commands](/ribbonmenu/commands)', 'The sizes and types of commands: buttons, toggles, split buttons, menus, rows, the app’s own content and galleries.'],
    ['[Layouts and room](/ribbonmenu/layouts)', 'The classic and the simplified layout, how groups give way in less room, and scrolling.'],
    ['[Showing and keys](/ribbonmenu/display)', 'Showing only the tabs or hiding the menu, the button before the tabs, the quick commands and the key hints.'],
    ['[Customization](/ribbonmenu/customization)', 'What the user can hide, move and add, and how to save it.'],
    ['[Programmatic changes](/ribbonmenu/programmatic)', 'Adding, removing, moving and changing tabs, groups and commands by path.'],
    ['[API reference](/ribbonmenu/api)', 'Props, fields, members, events, styling hooks and tokens.']
];

const A11Y = [
    ['Tabs', 'The tabs are a `tablist` named by `label` or by the language pack, each tab a `tab` that controls its `tabpanel`. A tab of a context has the context’s name as its description.'],
    ['Groups', 'Each group is a `group` named by its name. The button beside the name names the group in its tooltip.'],
    ['Commands', 'A small command is named by its text, shown as its tooltip. A toggle reports `aria-pressed`, a menu its `aria-expanded`.'],
    ['Focus', 'The tabs are one Tab stop and each group is one Tab stop. Focus never moves without the user.'],
    ['Motion', 'The layouts and the menus open with the motion tokens, and without motion when the user prefers reduced motion.']
];

const KEYS = [
    ['Arrow Left, Arrow Right', 'On the tabs: the previous or the next tab, shown. In the commands: the previous or the next command.'],
    ['Home, End', 'The first or the last tab, or command of the tab.'],
    ['Arrow Down', 'From the tabs: into the commands of the tab shown, opening them over the page when only the tabs are shown.'],
    ['Tab, Shift+Tab', 'The tabs are one stop, each group is one stop.'],
    ['Escape', 'From the commands: back to the tab shown. Commands open over the page close.'],
    ['Alt, F10', 'Shows the key hints: a letter on each tab, then on each command. See [Showing and keys](/ribbonmenu/display#keys).'],
    ['Alt + the access key', 'Shows the tab whose text marks that letter with `&`, or presses the button before the tabs.'],
    ['Ctrl+F1, a double-click on a tab', 'Shows only the tabs, or the commands always again.'],
    ['Shift+F10, the Menu key', 'Opens the context menu of the command or group with focus.']
];

export default function RibbonMenuPage() {
    return (
        <>
            <p class="lead">
                <Rich text="The commands of an application in tabs, each tab in named groups of large, medium and small commands. It adapts to the room it has, can show only its tabs or hide itself, and lets users arrange it to their liking. The menu holds nothing of its own: the tabs, the groups and the commands are given by the application." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { RibbonMenu, type RibbonTab, type RibbonGroup, type RibbonCommand } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="basic" title="A document editor">
                <p>
                    <Rich text="Each tab has groups, and each group has commands. A tab’s groups are created the first time the tab is shown, and kept. The button before the tabs opens the app’s main menu, the quick commands stand beside it, and the end of the row holds the app’s own search and share button. Choose a picture to see the tab of its context, right-click a command to arrange the menu, and tap Alt to see the key hints." />
                </p>
                <Example files={code('Editor.tsx')}>
                    <Editor />
                </Example>
            </Section>

            <Section anchor="topics" title="Topics">
                <ApiTable head={['Page', 'What it covers']} rows={TOPICS} />
            </Section>

            <Section anchor="keyboard" title="Keyboard">
                <ApiTable head={['Key', 'Action']} rows={KEYS} />
            </Section>

            <Section anchor="a11y" title="Accessibility">
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>

            <Section anchor="i18n" title="Localization">
                <p>
                    <Rich text="The menu’s own texts come from `uiLocale.strings`: the name of the tabs (`ribbonMenuLabel`), the buttons it adds (`ribbonMenuMore`, `ribbonMenuSimple`, `ribbonMenuClassic`, `ribbonMenuTabs`, `ribbonMenuReveal`), the quick commands (`ribbonMenuQuick`) and its context menu. They change with the language at once." />
                </p>
            </Section>
        </>
    );
}
