import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Programmatic from './examples/Programmatic';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const METHODS = [
    ['addTab(tab, index?)', 'Adds a tab at `index`, the end by default.'],
    ['addGroup(tabPath, group, index?)', 'Adds a group to a tab.'],
    ['addCommand(parentPath, command, index?)', 'Adds a command to a group (`tab/group`) or to a row (`tab/group/row`).'],
    ['remove(path)', 'Removes a tab, a group or a command.'],
    ['move(path, index, toParent?)', 'Moves it to `index` in its list, or in the list at `toParent`: a group to another tab, a command to another group or row.'],
    ['update(path, changes)', 'Changes some of its fields, such as `text`, `visible`, `enabled` or `glyph`; the others stay as they are.'],
    ['findTab(key), findGroup(path), findCommand(path)', 'The tab, group or command as it is now.'],
    ['beginUpdate(), endUpdate()', 'Holds the changes until `endUpdate()`, which applies them at once.']
];

export default function RibbonMenuProgrammaticPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Tabs, groups and commands can be added, removed, moved and changed at any time, by their paths. The menu redraws only what changed: groups and commands that stay keep their buttons, their state and their place." />
            </p>

            <Section anchor="example" title="Changes by path">
                <Example files={code('Programmatic.tsx')}>
                    <Programmatic />
                </Example>
            </Section>

            <Section anchor="methods" title="Methods">
                <ApiTable head={['Method', 'Description']} rows={METHODS} />
                <p>
                    <Rich text="Each method returns `false` when nothing changed, such as for a path that does not exist." />
                </p>
                <Code
                    code={`
menu.beginUpdate();
menu.addGroup('home', { key: 'styles', text: 'Styles', commands: [] }, 1);
menu.addCommand('home/styles', { key: 'normal', text: 'Normal', glyph: 'star' });
menu.update('home/clipboard/paste', { enabled: false });
menu.endUpdate();
`}
                />
            </Section>

            <Section anchor="paths" title="Paths">
                <p>
                    <Rich text="A path names an item by its keys joined with `/`: `home` is a tab, `home/clipboard` a group, `home/clipboard/paste` a command, and a fourth part a command of a row. A missing key is the position, which changes when items are added or removed before it, so give the items you change keys." />
                </p>
            </Section>

            <Section anchor="data" title="Your data">
                <p>
                    <Rich text="The methods never change the tabs, groups and commands you gave. Each change makes a new list, with new objects only along the changed path, and it becomes `items`. `onItemsChanged` reports the new list: keep it in your state when you save the menu or bind `items` to it. When you keep the tabs in reactive state, you can also change that state directly; the menu follows it, and with plain data `refresh()` reads it again." />
                </p>
            </Section>
        </>
    );
}
