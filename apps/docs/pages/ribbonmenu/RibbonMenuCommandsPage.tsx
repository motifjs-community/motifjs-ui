import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import CommandTypes from './examples/CommandTypes';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const TYPES = [
    ['`button`', 'Runs `click`. The default.'],
    ['`toggle`', 'Stays pressed while `pressed` is `true`. As a function, `pressed` is followed, and `click` changes the value it reads.'],
    ['`split`', 'Runs `click` from its own part, and opens `menu` from the arrow beside it.'],
    ['`menu`', 'Opens `menu`.'],
    ['`row`', 'A row of small commands (`commands`), such as the commands that style text.'],
    ['`content`', 'Any content of the application (`content`), such as a drop-down or a number box. Made once, and kept. Give it the small size of fields, so it fits the row.'],
    ['`gallery`', 'Its first choices (`items`) in a row and a button that opens all of them in a grid. `value` marks the chosen one, `columns` sets how many stand in a row, and `click` receives the choice as `e.item`.'],
    ['`separator`', 'A line between commands.']
];

const SIZES = [
    ['`large`', 'The icon above the text, as high as the group. A gallery is large by default.'],
    ['`medium`', 'The icon beside the text. Medium and small commands stand three to a column. The default.'],
    ['`small`', 'The icon alone. The text names it and appears as its tooltip.']
];

export default function RibbonMenuCommandsPage() {
    return (
        <>
            <p class="lead">
                <Rich text="A group holds commands of three sizes and eight types. Every field of a command is a value or a function the menu follows, so the commands change with the application’s state." />
            </p>

            <Section anchor="example" title="Every command">
                <p>
                    <Rich text="This menu does not give way (`adaptive: false`), so every command keeps the size it is given; scroll the commands to see them all." />
                </p>
                <Example files={code('CommandTypes.tsx')}>
                    <CommandTypes />
                </Example>
            </Section>

            <Section anchor="sizes" title="Sizes">
                <ApiTable head={['Size', 'Description']} rows={SIZES} />
                <p>
                    <Rich text="Every row has the same height in every tab, whatever stands in it: a field or a button. The menu keeps its height when the user moves between tabs." />
                </p>
            </Section>

            <Section anchor="types" title="Types">
                <ApiTable head={['Type', 'Description']} rows={TYPES} />
            </Section>

            <Section anchor="groups" title="Groups">
                <p>
                    <Rich text="A group has a name under its commands. With `more`, a button beside the name opens more options of the group, such as a window; `onGroupMore` reports it too. Its `glyph` or `icon` is shown on the button the group folds into when there is no room." />
                </p>
            </Section>

            <Section anchor="contexts" title="Tabs of a context">
                <p>
                    <Rich text="A tab with `context`, such as one for a picture being edited, is drawn in the context color with a band over it. Show it with `visible` while the context lasts. Its context’s name is told to assistive technology, not shown." />
                </p>
            </Section>
        </>
    );
}
