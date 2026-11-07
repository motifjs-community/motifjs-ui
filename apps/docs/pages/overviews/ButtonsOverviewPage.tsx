import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import ButtonsDemo from './examples/ButtonsDemo';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const MEMBERS = [
    ['[Button](/button)', 'One command, with an icon, a menu or a split part; a toggle; a busy state while the command runs.'],
    ['[ButtonGroup](/buttongroup)', 'A few related buttons side by side: one or several pressed, or plain actions.'],
    ['[Toolbar](/toolbar)', 'A row of commands that moves what does not fit into a menu.'],
    ['[SpeedDial](/speeddial)', 'A floating button for the main action, opening related actions in a line or a circle.'],
    ['[MenuBar and ContextMenu](/menus)', 'The menus of an application and the menu of an element, with shortcuts, check items and access keys.'],
];

const CHOOSE = [
    ['Run one command', '[Button](/button)'],
    ['Show a choice of a few options at once', '[ButtonGroup](/buttongroup), or [RadioGroup](/radiogroup) in a form'],
    ['Keep many commands in one bar at any width', '[Toolbar](/toolbar)'],
    ['Offer the commands of a whole application', '[MenuBar](/menus)'],
    ['Act on what is under the pointer', '[ContextMenu](/menus)'],
    ['Give a screen one main action, on a phone too', '[SpeedDial](/speeddial)'],
];

const A11Y = [
    ['Roles', 'Buttons, toggle buttons with their pressed state, menus and menu bars, toolbars with one Tab stop.'],
    ['Keyboard', 'Enter and Space press a button; the arrow keys move inside a toolbar, a group and a menu; Escape closes a menu.'],
    ['Focus', 'A disabled command can stay focusable, so readers still find it and learn why it is off.'],
];

export default function ButtonsOverviewPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Buttons start commands. The group covers single buttons, groups of them, toolbars that keep commands in reach at any width, application and context menus, and a floating button for the main action of a screen." />
            </p>

            <Section anchor="demo" title="Commands of an editor">
                <p>
                    <Rich text="A menu bar, a toolbar with toggles and a menu, a segmented choice for the view, a split button for saving, a context menu on the text and a speed dial for new items, all working on one document. Alt with an underlined letter runs a command." />
                </p>
                <Example stack files={code('ButtonsDemo.tsx')}>
                    <ButtonsDemo />
                </Example>
            </Section>
            <Section anchor="components" title="Components in this group">
                <p>
                    <Rich text="Each component has its own page with its examples and its full API." />
                </p>
                <ApiTable head={['Component', 'For']} rows={MEMBERS} />
            </Section>
            <Section anchor="choosing" title="Choosing a component">
                <p>
                    <Rich text="Several components can do the same job; this table points to the one that reads best for it." />
                </p>
                <ApiTable head={['To', 'Use']} rows={CHOOSE} />
            </Section>
            <Section anchor="shared" title="What they share">
                <p>
                    <Rich text="A command's text takes an access key: an `&` before a letter underlines it, and Alt with that letter runs the command. Menus open from the keyboard, move with the arrow keys and close with Escape." />
                </p>
                <p>
                    <Rich text="Icons come from any element or image address. A button with only an icon is named by its `hint`, which also shows as its tooltip." />
                </p>
                <p>
                    <Rich text="`variant`, `tone` and `size` set the look in every component of the group, and the design language draws the rest." />
                </p>
            </Section>
            <Section anchor="accessibility" title="Accessibility">
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>
        </>
    );
}
