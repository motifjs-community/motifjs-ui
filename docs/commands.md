# Commands and shortcuts

> Foundations · @motifx-community/ui 0.1.0-beta.11

A command of the app is defined once: its text, icon, keys, state and action. Menus, toolbars and ribbons name it, its keys run it, and the user can give it other keys. Every shortcut of the app is in one list, so the ones that get in each other’s way are found.

## Defining commands

```tsx
import { commands } from '@motifx-community/ui';

commands.add({ key: 'save', text: '&Save', shortcut: 'Mod+S', category: 'File', enabled: () => doc.dirty, run: () => doc.save() });
commands.add({ key: 'bold', text: '&Bold', shortcut: 'Mod+B', scope: editor, checked: () => editor.bold, run: () => editor.toggleBold() });
```

`commands.add` adds a command and returns what takes it away. Without `scope` it is app-wide; with a component as `scope` it holds, and its keys work, while focus is inside that component, and it goes away when the component is disposed. Each document can add its own `save`; the one that holds is the one of the item’s place, else of the place that holds focus.

## Items that name commands

An item says `command: 'save'`, and what it is not given comes from the command: its text, icon, hint, the keys shown at the end of a menu item, its state and its action. The item’s own value wins, so an item can show another text for the same command.

| Item | In | From the command |
| --- | --- | --- |
| `MenuItem` | `MenuBar`, `ContextMenu`, the menu of a `Button`, `ActionSheet` | Text, icon, hint, keys at the end, enabled, checked, visible, and the action. |
| `ToolbarItem` | `Toolbar` | Text, icon, hint, enabled, visible, the action; a toggle is pressed as the command is checked. |
| `RibbonCommand` | `RibbonMenu` | Text, glyph or icon, hint, enabled, visible, the action; a toggle is pressed as the command is checked. |

```tsx
import { reactive } from '@motifx/core';
import { MenuBar, Stack, Toolbar, commands, shortcuts, type Keymap } from '@motifx-community/ui';

/**
 * Commands defined once, limited to this example: the menu bar and the toolbar name them, their keys run them, and the
 * customizer's keyboard page gives them other keys.
 */
export default function SharedCommands() {
  const s = reactive({ told: 'Nothing yet.', bold: false, keymap: {} as Keymap });
  const run = (what: string) => () => (s.told = what);

  return (
    <Stack
      gap="md"
      ref={(host: Stack) => {
        // Limited to this example (`scope`), and taken away with it.
        commands.add({ key: 'new', text: '&New', shortcut: 'Alt+N', category: 'File', scope: host, run: run('New') });
        commands.add({ key: 'save', text: '&Save', shortcut: 'Mod+S', category: 'File', scope: host, run: run('Save') });
        commands.add({ key: 'print', text: '&Print', shortcut: 'Mod+P', category: 'File', scope: host, run: run('Print') });
        commands.add({ key: 'bold', text: '&Bold', shortcut: 'Mod+B', category: 'Format', scope: host, checked: () => s.bold, run: () => (s.bold = !s.bold) });
        const listening = shortcuts.onKeymapChanged((e) => (s.keymap = e.keymap));
        host.motif.setDisposable(() => listening.dispose());
      }}
    >
      <MenuBar
        label="Editor"
        customizable
        items={[
          { key: 'file', text: '&File', items: [{ command: 'new' }, { command: 'save' }, { command: 'print', beginGroup: true }] },
          { key: 'format', text: 'F&ormat', items: [{ command: 'bold' }] },
        ]}
      />
      <Toolbar label="Commands" items={[{ command: 'save' }, { command: 'print' }, { type: 'separator' }, { type: 'toggle', command: 'bold' }]} />
      <p tabIndex={0} class="cmd-page">Click here, then press the keys: they work while focus is in this example.</p>
      <output class="cmd-told">{() => `${s.told}${s.bold ? ' · bold' : ''}`}</output>
      <pre class="cmd-keymap">{() => JSON.stringify(s.keymap)}</pre>
    </Stack>
  );
}
```

## Keys

A command’s `shortcut` runs it, by the rules of [shortcuts](keyboard.md#shortcuts). The keys shown in a menu read as they do on the platform: `Mod+Shift+S` shows Ctrl+Shift+S, and ⇧⌘S on Apple platforms (`shortcutText`). A menu item’s own `shortcut` only changes the text shown.

## The user’s keys

`shortcuts.keymap` holds the keys the user assigned, by the name of the shortcut: the key of a command, or the name given to `addShortcut`. They replace the shortcut’s own keys, and an empty list leaves it without keys. It is one plain object: `onKeymapChanged` reports it to save, and assigning it back restores the keys. How it is saved is up to the app.

[ShortcutEditor](shortcuteditor.md) is the list in which the user changes them: it shows every shortcut with a name, says which shortcut already uses the keys pressed, and assigns them. The customizer of a `MenuBar` shows it on its Keyboard page.

## Conflicts

Every shortcut is in `shortcuts.list()`: the commands’ keys, the app’s own (`addShortcut` with `name`) and those of the kit’s components, such as the keys of `TabDocumentManager`. A shortcut that takes keys already taken in the same place is said on the console and by `onConflict`; the first one added runs, and the innermost scope still comes first. `conflicts()` also finds keys that start longer keys and Alt shortcuts that take an access key of the page.

## API reference

### Command

| Field | Type | Description |
| --- | --- | --- |
| `key` | `string` | Names the command. Several commands may share a key in different scopes, such as `save` in each document. |
| `text, hint` | `Bind<string>` | The text (`&` marks the access key) and a tooltip. |
| `icon, glyph` | `Bind<IconSource>`, `Bind<string>` | An image address or a component (as a function, so that a copy in a menu builds its own), or the name of a glyph for the items that take one. |
| `shortcut` | `string \| string[]` | The keys that run it, as `addShortcut` reads them: `Mod+S`, or several. |
| `enabled, checked, visible` | `Bind<boolean>` | The state of the items that name it. Off, its keys do nothing. |
| `category` | `Bind<string>` | A heading lists group commands under, such as `File`. |
| `scope` | `ComponentBase \| null` | Limits the command and its keys to times when focus is inside this component. Without it, it is app-wide. |
| `inEditable` | `boolean` | Its keys work in text fields too. |
| `run` | `(e: CommandRunEventArgs) => void` | Runs it, with the item that named it, its component and the click or the key press. |

### commands

| Member | Returns | Description |
| --- | --- | --- |
| `add(command)` | `() => void` | Adds a command with its keys; returns what takes it away. |
| `get(key, from?)` | `Command \| null` | The command that holds at `from` (a component, such as the menu or toolbar of the item): of the scope that holds it, else of the one that holds focus, else the app-wide one. |
| `run(key, from?, event?)` | `boolean` | Runs it; `false` when there is none or it is off. |
| `keysOf(command)` | `string[]` | Its keys: the ones the user assigned to its key, else its own `shortcut`. |
| `list(), has(key)` |  | Every command, in the order they came. |
| `onChanged` | `CommandsChangedEventArgs` | A command was added or taken away. |

### shortcuts

| Member | Returns | Description |
| --- | --- | --- |
| `list()` | `ShortcutInfo[]` | Every shortcut working now: the commands’ keys, the app’s own (`addShortcut`) and those of the kit’s components, each with its keys, its own keys, name, text, category, scope and whether the user can change it. |
| `conflicts()` | `ShortcutConflict[]` | The shortcuts in each other’s way: `same` keys in the same place, keys that `prefix` longer keys, an Alt shortcut that takes an `accessKey` of the page. |
| `takenBy(keys, scope?)` | `ShortcutInfo[]` | The shortcuts that keys would get in the way of. |
| `keymap` | `Keymap` | The keys the user assigned, by the name of the shortcut: a plain object to save and restore; `null` clears them. |
| `assign(name, keys)` | `void` | Assigns the user’s keys to the shortcuts with the name (an empty list removes their keys), or restores their own keys with `null`. |
| `keysOf(name, defaults?), isAssigned(name)` |  | The keys of the shortcuts with the name, and whether the user assigned them. |
| `warnings` | `boolean` | Says on the console when a shortcut added gets in another’s way. The default is `true`. |
| `onChanged, onConflict, onKeymapChanged` |  | A shortcut was added or removed, or its keys changed; one added gets in the way of another; the user’s keys changed. |

## Feedback

Loading issues…
