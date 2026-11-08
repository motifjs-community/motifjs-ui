import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import FileMenu from './examples/FileMenu';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const LAYOUT = [
    ['Wide window', 'The menu covers half of the window (`app-menu.share`), with the list beside the page.'],
    ['Half the window is too narrow', 'When half the window is narrower than `app-menu.min-size`, the menu covers the whole window.'],
    ['The menu is too narrow for both', 'When the menu is narrower than `app-menu.split-size`, the list and the page take turns. Choosing a page shows it, and Back or Escape returns to the list.']
];

const KEYS = [
    ['Arrow Down, Arrow Up', 'Moves between the items of both lists, wrapping at the ends.'],
    ['Home, End', 'Moves to the first or the last item.'],
    ['Enter, Space', 'Shows the page of the item, or runs its command.'],
    ['A letter', 'Chooses the item with that access key. Without one, moves to the next item whose text starts with the letters typed.'],
    ['Escape', 'Returns to the list when the page is shown alone. Otherwise, closes the menu.'],
    ['Tab, Shift+Tab', 'Moves between the list and the page. Focus stays inside the menu.']
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

            <Section anchor="layout" title="Layout">
                <ApiTable head={['Room', 'Layout']} rows={LAYOUT} />
            </Section>

            <Section anchor="keyboard" title="Keyboard">
                <ApiTable head={['Key', 'Action']} rows={KEYS} />
            </Section>
        </>
    );
}
