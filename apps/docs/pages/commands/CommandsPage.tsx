import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import SharedCommands from './examples/SharedCommands';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const COMMAND = [
  ['key', '`string`', 'Names the command. Several commands may share a key in different scopes, such as `save` in each document.'],
  ['text, hint', '`Bind<string>`', 'The text (`&` marks the access key) and a tooltip.'],
  ['icon, glyph', '`Bind<IconSource>`, `Bind<string>`', 'An image, an element or a component, or the name of a glyph for the items that take one.'],
  ['shortcut', '`string | string[]`', 'The keys that run it, as `addShortcut` reads them: `Mod+S`, or several.'],
  ['enabled, checked, visible', '`Bind<boolean>`', 'The state of the items that name it. Off, its keys do nothing.'],
  ['category', '`Bind<string>`', 'A heading lists group commands under, such as `File`.'],
  ['scope', '`ComponentBase | null`', 'Limits the command and its keys to times when focus is inside this component. Without it, it is app-wide.'],
  ['inEditable', '`boolean`', 'Its keys work in text fields too.'],
  ['run', '`(e: CommandRunEventArgs) => void`', 'Runs it, with the item that named it, its component and the click or the key press.'],
];

const ITEMS = [
  ['MenuItem', '`MenuBar`, `ContextMenu`, the menu of a `Button`, `ActionSheet`', 'Text, icon, hint, keys at the end, enabled, checked, visible, and the action.'],
  ['ToolbarItem', '`Toolbar`', 'Text, icon, hint, enabled, visible, the action; a toggle is pressed as the command is checked.'],
  ['RibbonCommand', '`RibbonMenu`', 'Text, glyph or icon, hint, enabled, visible, the action; a toggle is pressed as the command is checked.'],
];

const COMMANDS = [
  ['add(command)', '`() => void`', 'Adds a command with its keys; returns what takes it away.'],
  ['get(key, from?)', '`Command | null`', 'The command that holds at `from` (an element): of the scope that holds it, else of the one that holds focus, else the app-wide one.'],
  ['run(key, from?, event?)', '`boolean`', 'Runs it; `false` when there is none or it is off.'],
  ['keysOf(command)', '`string[]`', 'Its keys: the ones the user assigned to its key, else its own `shortcut`.'],
  ['list(), has(key)', '', 'Every command, in the order they came.'],
  ['onChanged', '`CommandsChangedEventArgs`', 'A command was added or taken away.'],
];

const SHORTCUTS = [
  ['list()', '`ShortcutInfo[]`', 'Every shortcut working now: the commands’ keys, the app’s own (`addShortcut`) and those of the kit’s components, each with its keys, its own keys, name, text, category, scope and whether the user can change it.'],
  ['conflicts()', '`ShortcutConflict[]`', 'The shortcuts in each other’s way: `same` keys in the same place, keys that `prefix` longer keys, an Alt shortcut that takes an `accessKey` of the page.'],
  ['takenBy(keys, scope?)', '`ShortcutInfo[]`', 'The shortcuts that keys would get in the way of.'],
  ['keymap', '`Keymap`', 'The keys the user assigned, by the name of the shortcut: a plain object to save and restore; `null` clears them.'],
  ['assign(name, keys)', '`void`', 'Assigns the user’s keys to the shortcuts with the name (an empty list removes their keys), or restores their own keys with `null`.'],
  ['keysOf(name, defaults?), isAssigned(name)', '', 'The keys of the shortcuts with the name, and whether the user assigned them.'],
  ['warnings', '`boolean`', 'Says on the console when a shortcut added gets in another’s way. The default is `true`.'],
  ['onChanged, onConflict, onKeymapChanged', '', 'A shortcut was added or removed, or its keys changed; one added gets in the way of another; the user’s keys changed.'],
];

export default function CommandsPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A command of the app is defined once: its text, icon, keys, state and action. Menus, toolbars and ribbons name it, its keys run it, and the user can give it other keys. Every shortcut of the app is in one list, so the ones that get in each other’s way are found." />
      </p>

      <Section anchor="define" title="Defining commands">
        <Code
          code={`
import { commands } from '@motifx-community/ui';

commands.add({ key: 'save', text: '&Save', shortcut: 'Mod+S', category: 'File', enabled: () => doc.dirty, run: () => doc.save() });
commands.add({ key: 'bold', text: '&Bold', shortcut: 'Mod+B', scope: editor, checked: () => editor.bold, run: () => editor.toggleBold() });
`}
        />
        <p>
          <Rich text="`commands.add` adds a command and returns what takes it away. Without `scope` it is app-wide; with a component as `scope` it holds, and its keys work, while focus is inside that component, and it goes away when the component is disposed. Each document can add its own `save`; the one that holds is the one of the item’s place, else of the place that holds focus." />
        </p>
      </Section>

      <Section anchor="items" title="Items that name commands">
        <p>
          <Rich text="An item says `command: 'save'`, and what it is not given comes from the command: its text, icon, hint, the keys shown at the end of a menu item, its state and its action. The item’s own value wins, so an item can show another text for the same command." />
        </p>
        <ApiTable head={['Item', 'In', 'From the command']} rows={ITEMS} />
        <Example files={code('SharedCommands.tsx')} stack>
          <SharedCommands />
        </Example>
      </Section>

      <Section anchor="keys" title="Keys">
        <p>
          <Rich text="A command’s `shortcut` runs it, by the rules of [shortcuts](/keyboard#shortcuts). The keys shown in a menu read as they do on the platform: `Mod+Shift+S` shows Ctrl+Shift+S, and ⇧⌘S on Apple platforms (`shortcutText`). A menu item’s own `shortcut` only changes the text shown." />
        </p>
      </Section>

      <Section anchor="keymap" title="The user’s keys">
        <p>
          <Rich text="`shortcuts.keymap` holds the keys the user assigned, by the name of the shortcut: the key of a command, or the name given to `addShortcut`. They replace the shortcut’s own keys, and an empty list leaves it without keys. It is one plain object: `onKeymapChanged` reports it to save, and assigning it back restores the keys. How it is saved is up to the app." />
        </p>
        <p>
          <Rich text="[ShortcutEditor](/shortcuteditor) is the list in which the user changes them: it shows every shortcut with a name, says which shortcut already uses the keys pressed, and assigns them. The customizer of a `MenuBar` shows it on its Keyboard page." />
        </p>
      </Section>

      <Section anchor="conflicts" title="Conflicts">
        <p>
          <Rich text="Every shortcut is in `shortcuts.list()`: the commands’ keys, the app’s own (`addShortcut` with `name`) and those of the kit’s components, such as the keys of `TabDocumentManager`. A shortcut that takes keys already taken in the same place is said on the console and by `onConflict`; the first one added runs, and the innermost scope still comes first. `conflicts()` also finds keys that start longer keys and Alt shortcuts that take an access key of the page." />
        </p>
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="Command" />
        </h3>
        <ApiTable head={['Field', 'Type', 'Description']} rows={COMMAND} />
        <h3>
          <Rich text="commands" />
        </h3>
        <ApiTable head={['Member', 'Returns', 'Description']} rows={COMMANDS} />
        <h3>
          <Rich text="shortcuts" />
        </h3>
        <ApiTable head={['Member', 'Returns', 'Description']} rows={SHORTCUTS} />
      </Section>
    </>
  );
}
