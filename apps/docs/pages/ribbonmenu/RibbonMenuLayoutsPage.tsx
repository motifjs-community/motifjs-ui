import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Room from './examples/Room';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const STEPS = [
    ['1', 'Large commands become medium.'],
    ['2', 'All commands become small: the icon alone, the text as the tooltip. A gallery becomes its button alone.'],
    ['3', 'The group folds into one large button with its name and glyph, which opens the group in a popup. In the simplified layout, the group moves into the “more” menu at the end of the row instead.'],
    ['Then', 'What still does not fit scrolls: by the buttons over the ends of the commands, the mouse wheel and a finger.']
];

export default function RibbonMenuLayoutsPage() {
    return (
        <>
            <p class="lead">
                <Rich text="The menu has two layouts, and gives way step by step when its room shrinks: commands become smaller, groups fold, and what is left scrolls. Narrow enough, it turns compact." />
            </p>

            <Section anchor="room" title="Less and less room">
                <p>
                    <Rich text="Move the slider to narrow the menu. Every group takes a step before any group takes the next. Groups with a lower `priority` give way first, and of equals, the last one first; here Editing has a higher priority. A group with `collapsible: false` never takes the last step, and `adaptive: false` turns giving way off, leaving only the scroll." />
                </p>
                <Example files={code('Room.tsx')}>
                    <Room />
                </Example>
                <ApiTable head={['Step', 'What changes']} rows={STEPS} />
            </Section>

            <Section anchor="layouts" title="Classic and simplified">
                <p>
                    <Rich text="The classic layout (`layout: 'classic'`) shows the commands in columns under the names of their groups. The simplified layout (`layout: 'simple'`) shows them in a single row, without the names; a command with `simple: false` waits in the “more” menu. The button at the end of the commands switches between them (`layoutSwitch`), and `onLayoutChanged` reports the user’s choice." />
                </p>
            </Section>

            <Section anchor="compact" title="Compact">
                <p>
                    <Rich text="Narrower than the `ribbon-menu.compact-size` token, the menu shows a tab picker in place of its tabs and its commands in the simplified layout, as on a phone. `isCompact` tells whether it is compact; `layout` keeps the layout the user chose for when there is room again." />
                </p>
            </Section>
        </>
    );
}
