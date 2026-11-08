import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Customize from './examples/Customize';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const MENU = [
    ['On a command', 'Add it to the quick commands or remove it, hide it, move it earlier or later in its group.'],
    ['On a group', 'Hide the group, move it earlier or later in its tab.'],
    ['Always', 'Show the hidden commands again, choose the layout, how the commands are shown and where the quick commands stand, and undo all changes.']
];

const FIELDS = [
    ['hidden', '`string[]`', 'The groups and commands the user hid.'],
    ['order', '`Record<string, string[]>`', 'The order the user gave: a tab’s groups under its key, a group’s commands under its path.'],
    ['quick', '`string[]`', 'The commands the user added to the quick commands.'],
    ['layout, display, quickBar', '', 'The layout, the way the commands are shown and the place of the quick commands, as the user chose them.']
];

export default function RibbonMenuCustomizationPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Users arrange the menu from its context menu: they hide what they never use, move what they use most, and add commands to the quick commands. Everything they change is one plain object, to save and give back." />
            </p>

            <Section anchor="example" title="Arranging and saving">
                <p>
                    <Rich text="Right-click a command or a group, or press Shift+F10 on it. Here each change is saved in the browser and given back when the page opens again. Paste is `fixed`: it cannot be hidden or moved." />
                </p>
                <Example files={code('Customize.tsx')}>
                    <Customize />
                </Example>
            </Section>

            <Section anchor="menu" title="The context menu">
                <ApiTable head={['Where', 'What the user can do']} rows={MENU} />
                <p>
                    <Rich text="`customizable: false` leaves the browser’s own context menu. A group or a command with `fixed: true` cannot be hidden or moved." />
                </p>
            </Section>

            <Section anchor="state" title="Saving">
                <p>
                    <Rich text="`onCustomized` reports everything the user changed so far as a `RibbonMenuCustomization`; give it back with `customization` and the menu starts from it. Groups and commands are named by their keys joined with `/`, so give them keys: a missing key is the position, which changes when the app adds items." />
                </p>
                <Code
                    code={`
{
  "hidden": ["home/editing/filter"],
  "order": { "home/clipboard": ["copy", "cut", "paste"] },
  "quick": ["home/insert/table"],
  "display": "tabs"
}
`}
                />
                <ApiTable head={['Field', 'Type', 'Description']} rows={FIELDS} />
                <p>
                    <Rich text="The menu never changes the tabs, groups and commands the app gives: hidden and moved items are drawn from its own copy of the user’s changes. `findCommand(path)` finds a command by its path." />
                </p>
            </Section>
        </>
    );
}
