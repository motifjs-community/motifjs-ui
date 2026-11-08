import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import InWindow from './examples/InWindow';
import Options from './examples/Options';
import Programmatic from './examples/Programmatic';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['filter', '`Bind<((shortcut: ShortcutInfo) => boolean) | null>`', 'The shortcuts the user can change', 'Which shortcuts are listed. A shortcut the user cannot change is listed with its row turned off.'],
    ['grouped', '`Bind<boolean>`', '`true`', 'Lists the shortcuts under their categories. A shortcut without one is listed under “Other”.'],
    ['searchEnabled', '`Bind<boolean>`', '`true`', 'Shows a search field above the list.'],
    ['resetAllEnabled', '`Bind<boolean>`', '`true`', 'Shows the button that gives every shortcut its own keys again.'],
    ['height', '`Bind<string | null>`', 'The height of the parent', 'The height, as a CSS length.'],
    ['label', '`Bind<string>`', 'The kit string “Keyboard shortcuts”', 'The accessible name.'],
];

const MEMBERS = [
    ['selected', '`string | null`', 'The name of the selected shortcut. Settable.'],
    ['give(keys)', '`boolean`', 'Gives the selected shortcut the keys (an empty list removes its keys), or its own keys again with `null`. Returns `false` when no shortcut the user can change is selected.'],
    ['resetAll()', '`void`', 'Gives every shortcut its own keys again.'],
    ['refresh()', '`void`', 'Reads the shortcuts and their keys again. The editor does this when shortcuts are added or removed, and when the language changes.'],
];

const EVENTS = [
    ['onKeysChanged', '`{ name, keys, keymap }`', 'Occurs after the user changes the keys of a shortcut. `name` is `null` after a reset of all keys; `keymap` holds every key the user has given, to save.'],
];

const OPTIONS = [
    ['name', '`string`', 'Names what the shortcut does. Shortcuts with the same name share the keys the user gives them. Without a name, a shortcut is not listed and cannot be changed.'],
    ['text', '`string | (() => string)`', 'How the shortcut reads in the list. A function is read again when the language changes.'],
    ['category', '`string | (() => string)`', 'The heading the list groups the shortcut under.'],
    ['customizable', '`boolean`', '`false` keeps the shortcut’s own keys. It is still listed when the filter allows it.'],
];

const KIT = [
    ['Commands (`commands.add`)', 'The key of the command', 'The text and the category of the command.'],
    ['TabDocumentManager', '`tabDocuments.<action>`, such as `tabDocuments.closeTab`; `tabDocuments.focusGroup1` to `9`', 'Each action of `keys`. The keys of a mode, such as moving a window with the arrow keys, are read inside the mode and are not listed.'],
    ['Toaster', '`toaster.focus`', 'The key that moves focus to the notifications.'],
    ['MenuBar', '`menuBar.focus`', 'F10, with `focusOnF10`.'],
];

const KEYS = [
    ['A row', 'The arrow keys, Home and End move through the list; typing in the search field filters it.'],
    ['The keys field', 'Takes the keys pressed instead of running them. Backspace clears it; Tab and Escape keep their usual meaning.'],
];

const A11Y = [
    ['Name', 'The editor is a group named by `label`; the list, the toolbar and the keys field have names of their own.'],
    ['Status', 'The text that says who uses the keys pressed is a live region, read when it changes.'],
    ['Keys', 'Keys are written as the platform writes them: Ctrl+Shift+S, and ⇧⌘S on Apple platforms.'],
];

const HOOKS = [
    ['.mx-shortcut-editor', 'The editor.'],
    ['.mx-shortcut-editor__tools, .mx-shortcut-editor__keys, .mx-shortcut-editor__capture', 'The toolbar, the keys row and its field.'],
    ['.mx-shortcut-editor__status', 'The text that says who uses the keys pressed.'],
    ['.mx-shortcut-editor__list', 'The list of shortcuts.'],
    ['.mx-shortcut-editor__text, .mx-shortcut-editor__changed, .mx-shortcut-editor__row-keys', 'A row: the name of the shortcut, the mark of keys the user changed, and its keys.'],
];

const TOKENS = [
    ['shortcut-editor.editor, .keys', 'Units: the editor and the keys row, with the `gap` between their parts.'],
    ['shortcut-editor.status, .row-keys, .changed', 'Units: the status text, the keys at the end of a row (read as in a menu), and the mark of changed keys.'],
];

export default function ShortcutEditorPage() {
    return (
        <>
            <p class="lead">
                <Rich text="A list of the app’s keyboard shortcuts in which the user assigns other keys. It shows the shortcuts of commands, of the app and of the kit’s components, and you can place it anywhere: a settings page, a dialog or a tab." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { ShortcutEditor } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="basic" title="Changing the keys of shortcuts">
                <p>
                    <Rich text="The editor lists the shortcuts in `shortcuts`, the registry that holds every keyboard shortcut of the app. Select a shortcut, press the new keys in the field, and choose Assign. The field says first whether the keys are free or which shortcut uses them. Remove keys leaves a shortcut without keys, and Reset gives it its own keys again." />
                </p>
                <Example stack files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>

            <Section anchor="saving" title="Saving the user’s keys">
                <p>
                    <Rich text="The keys the user assigns are kept in `shortcuts.keymap`, a plain object keyed by the shortcut’s name. `onKeysChanged`, or `shortcuts.onKeymapChanged`, reports it after each change; assigning a saved object to `shortcuts.keymap` restores the keys. Where the object is stored is up to the app." />
                </p>
                <Code
                    code={`
shortcuts.keymap = JSON.parse(localStorage.getItem('keys') ?? '{}');
shortcuts.onKeymapChanged((e) => localStorage.setItem('keys', JSON.stringify(e.keymap)));
`}
                />
                <p>
                    <Rich text="A shortcut added later, such as one of a component opened after the keymap was restored, takes the user’s keys for its name when it is added." />
                </p>
            </Section>

            <Section anchor="window" title="In a dialog">
                <p>
                    <Rich text="The editor fills the height of its parent, so it can be the content of a window or a tab panel. Without a `filter`, it lists every shortcut of the page the user can change: here, the shortcuts of this documentation site." />
                </p>
                <Example stack files={code('InWindow.tsx')}>
                    <InWindow />
                </Example>
                <p>
                    <Rich text="The customizer of a [MenuBar](/menus/customization) shows the same editor on its Keyboard page; `customizerKeyboard: false` leaves the page out." />
                </p>
            </Section>

            <Section anchor="listed" title="Which shortcuts are listed">
                <p>
                    <Rich text="A shortcut is listed when it has a name. `addShortcut` takes the name, the text the list shows and the category it is grouped under; `customizable: false` keeps its keys fixed. Several shortcuts with one name, such as the same action in two documents, are one row and take the same keys. `filter` chooses the rows, `grouped`, `searchEnabled` and `resetAllEnabled` turn the parts of the editor on and off." />
                </p>
                <Example stack files={code('Options.tsx')}>
                    <Options />
                </Example>
                <Code
                    code={`
addShortcut(['F5', 'Mod+R'], () => view.reload(), { name: 'view.reload', text: () => t('Reload'), category: () => t('View') });
`}
                />
            </Section>

            <Section anchor="kit" title="Shortcuts of the kit’s components">
                <p>
                    <Rich text="The kit’s components register their shortcuts under names of their own, with texts in the kit’s language. The user’s keys apply to them as to any other shortcut." />
                </p>
                <ApiTable head={['Component', 'Names', 'Shortcuts']} rows={KIT} />
            </Section>

            <Section anchor="programmatic" title="Programmatic use">
                <p>
                    <Rich text="`new ShortcutEditor(props)` creates the editor without JSX. Each prop is also a property; `selected`, `give()` and `resetAll()` do what the toolbar does." />
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
                    <Rich text="Properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Type', 'Description']} rows={MEMBERS} />
                <h3>
                    <Rich text="Events" />
                </h3>
                <ApiTable head={['Event', 'Type', 'Description']} rows={EVENTS} />
                <h3>
                    <Rich text="Shortcut options for the list" />
                </h3>
                <ApiTable head={['Option of addShortcut', 'Type', 'Description']} rows={OPTIONS} />
                <h3>
                    <Rich text="Keyboard" />
                </h3>
                <ApiTable head={['Where', 'Keys']} rows={KEYS} />
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
