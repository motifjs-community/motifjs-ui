import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Display from './examples/Display';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const DISPLAYS = [
    ['`always`', 'The tabs and the commands. The default.'],
    ['`tabs`', 'Only the tabs. A tab opens its commands over the page; they close after a command, on Escape, on a click elsewhere and when focus leaves.'],
    ['`auto`', 'A thin strip. It opens the whole menu over the page, which closes the same way.']
];

const HINTS = [
    ['On the tabs', 'Each tab shows its access key (the letter after `&` in its text), else its first letter. The button before the tabs has a letter too, and the quick commands have digits.'],
    ['On the commands', 'A command shows its `keyHint`, else its access key, else its first letter. Several commands starting with the same letter have a letter and a digit.'],
    ['Typing', 'The letters press what they stand on. A tab goes on to the letters of its commands; a command ends the hints. Typing the first of two letters hides the others.'],
    ['Escape', 'Goes back one level: from the commands to the tabs, then ends the hints. Any other key, a click and leaving the page end them too.']
];

export default function RibbonMenuDisplayPage() {
    return (
        <>
            <p class="lead">
                <Rich text="The menu can show only its tabs or hide itself to leave the page more room. A button before the tabs opens the app’s main menu, quick commands are at hand from every tab, and key hints let the keyboard reach any command in a few letters." />
            </p>

            <Section anchor="example" title="Showing, quick commands and keys">
                <p>
                    <Rich text="Choose how the menu is shown and where the quick commands stand. Tap Alt (or press F10) with focus in the menu to see the key hints." />
                </p>
                <Example files={code('Display.tsx')}>
                    <Display />
                </Example>
            </Section>

            <Section anchor="display" title="Showing the commands">
                <ApiTable head={['display', 'What is shown']} rows={DISPLAYS} />
                <p>
                    <Rich text="A double-click on a tab and Ctrl+F1 switch between `always` and `tabs`; the menu’s context menu offers all three. The user’s choice is reported by `onDisplayChanged` and kept in `customization`." />
                </p>
            </Section>

            <Section anchor="app" title="The button before the tabs and the ends of the row">
                <p>
                    <Rich text="`appButton` is the text of a button before the tabs, drawn in the accent color, such as one that opens an `AppMenu`; `onAppButton` reports it. `barStart` and `barEnd` hold any content of the app at the ends of the row of tabs: a search field, a button, an editor." />
                </p>
            </Section>

            <Section anchor="quick" title="Quick commands">
                <p>
                    <Rich text="`quickCommands` are small commands pressed from any tab. The user adds others from a command’s context menu, and removes them the same way. `quickBar` places them in the row of tabs (`start`), under the commands (`below`) or nowhere (`hidden`)." />
                </p>
            </Section>

            <Section anchor="keys" title="Key hints">
                <ApiTable head={['When', 'What happens']} rows={HINTS} />
                <p>
                    <Rich text="Alt and F10 reach the menu that has focus, else the first menu of the page. `keyHints: false` turns them off, and `showKeyHints()` shows them programmatically." />
                </p>
            </Section>
        </>
    );
}
