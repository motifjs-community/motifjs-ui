import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import FileMenu from './examples/FileMenu';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const TOPICS = [
    ['[Slots and search](/appmenu/search)', 'The app’s own content above and under the items, and a search over them.'],
    ['[Programmatic changes](/appmenu/programmatic)', 'Adding, removing, moving and changing items by key.'],
    ['[API reference](/appmenu/api)', 'Props, item fields, members, events, styling hooks and tokens.']
];

const LAYOUT = [
    ['Wide window', 'The menu covers half of the window (`app-menu.share`), with the list beside the page.'],
    ['Half the window is too narrow', 'When half the window is narrower than `app-menu.min-size`, the menu covers the whole window.'],
    ['The menu is too narrow for both', 'When the menu is narrower than `app-menu.split-size`, the list and the page take turns, the one coming in pushing the other out. Choosing a page shows it, and Back or Escape returns to the list.']
];

const KEYS = [
    ['Arrow Down, Arrow Up', 'Moves between the items of both lists, wrapping at the ends.'],
    ['Home, End', 'Moves to the first or the last item.'],
    ['Enter, Space', 'Shows the page of the item, or runs its command.'],
    ['A letter', 'Chooses the item with that access key. Without one, moves to the next item whose text starts with the letters typed.'],
    ['Escape', 'Clears the search, returns to the list when the page is shown alone, and otherwise closes the menu.'],
    ['Tab, Shift+Tab', 'Moves between the list and the page. Focus stays inside the menu.']
];

const A11Y = [
    ['Dialog', 'The panel is a modal `dialog` named by `label` or by the language pack; the page around it is `inert`.'],
    ['List', 'The list is a `nav` named like the menu. The item whose page is shown has `aria-current="page"`, a disabled one `aria-disabled`.'],
    ['Pages', 'Each page is a `region` named by its item. Shown in place of the list, it takes focus.'],
    ['Focus', 'It goes to the item shown when the menu opens, and back where it was when the menu closes.'],
    ['Reading direction', 'The panel comes from the start edge and the arrows point to it, on the right in right-to-left pages.'],
    ['Motion', 'The panel and the turns between list and page move with the motion tokens, and without motion when the user prefers reduced motion.']
];

export default function AppMenuPage() {
    return (
        <>
            <p class="lead">
                <Rich text="The main menu of an application. It slides in from the start edge with a list of items, and each item shows its own page beside the list or runs a command. The menu holds nothing of its own: the items, the pages and the commands are given by the application." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { AppMenu, type AppMenuItem } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="basic" title="Pages and commands">
                <p>
                    <Rich text="An item with `page` shows that page beside the list. The page is created the first time it is shown, and kept. Any other item is a command (`click`) and closes the menu. Items with the same `group` stand together, and items with `bottom` stand at the bottom of the list." />
                </p>
                <Example files={code('FileMenu.tsx')}>
                    <FileMenu />
                </Example>
            </Section>

            <Section anchor="topics" title="Topics">
                <ApiTable head={['Page', 'What it covers']} rows={TOPICS} />
            </Section>

            <Section anchor="layout" title="Layout">
                <ApiTable head={['Room', 'Layout']} rows={LAYOUT} />
            </Section>

            <Section anchor="keyboard" title="Keyboard">
                <ApiTable head={['Key', 'Action']} rows={KEYS} />
            </Section>

            <Section anchor="a11y" title="Accessibility">
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>

            <Section anchor="i18n" title="Localization">
                <p>
                    <Rich text="Its own texts come from `uiLocale.strings`: its name when it has none (`appMenuLabel`), the close and back buttons (`appMenuClose`, `appMenuBack`), the search (`search`) and what it says when nothing matches (`appMenuNoMatch`). They change with the language at once." />
                </p>
            </Section>
        </>
    );
}
