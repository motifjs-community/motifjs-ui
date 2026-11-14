# ShortcutEditor

> Editors · @motifx-community/ui 0.1.0-beta.10

A list of the app’s keyboard shortcuts in which the user assigns other keys. It shows the shortcuts of commands, of the app and of the kit’s components, and you can place it anywhere: a settings page, a dialog or a tab.

## Import

```tsx
import { ShortcutEditor } from '@motifx-community/ui';
```

## Changing the keys of shortcuts

The editor lists the shortcuts in `shortcuts`, the registry that holds every keyboard shortcut of the app. Select a shortcut, press the new keys in the field, and choose Assign. The field says first whether the keys are free or which shortcut uses them. Remove keys leaves a shortcut without keys, and Reset gives it its own keys again.

```tsx
import { reactive } from '@motifx/core';
import { ShortcutEditor, Stack, commands, type Keymap } from '@motifx-community/ui';

/**
 * The app's commands, limited to this example, and an editor for their keys. The keys the user gives arrive in
 * `onKeysChanged`, ready to save; giving them back to `shortcuts.keymap` restores them.
 */
export default function Basic() {
  const s = reactive({ told: 'Nothing yet.', keymap: {} as Keymap });
  const run = (what: string) => () => (s.told = what);

  return (
    <Stack
      gap="md"
      ref={(host: Stack) => {
        commands.add({ key: 'demo.save', text: '&Save', shortcut: 'Mod+S', category: 'File', scope: host, run: run('Save') });
        commands.add({ key: 'demo.print', text: '&Print', shortcut: 'Mod+P', category: 'File', scope: host, run: run('Print') });
        commands.add({ key: 'demo.find', text: '&Find', shortcut: 'Mod+F', category: 'Edit', scope: host, run: run('Find') });
        commands.add({ key: 'demo.replace', text: '&Replace', category: 'Edit', scope: host, run: run('Replace') });
      }}
    >
      <ShortcutEditor height="22rem" filter={(info) => info.customizable && !!info.name?.startsWith('demo.')} onKeysChanged={(e) => (s.keymap = e.keymap)} />
      <p tabIndex={0} class="se-page">Click here, then press the keys: they work while focus is in this example.</p>
      <output class="se-told">{() => s.told}</output>
      <pre class="se-keymap">{() => JSON.stringify(s.keymap)}</pre>
    </Stack>
  );
}
```

## Saving the user’s keys

The keys the user assigns are kept in `shortcuts.keymap`, a plain object keyed by the shortcut’s name. `onKeysChanged`, or `shortcuts.onKeymapChanged`, reports it after each change; assigning a saved object to `shortcuts.keymap` restores the keys. Where the object is stored is up to the app.

```tsx
shortcuts.keymap = JSON.parse(localStorage.getItem('keys') ?? '{}');
shortcuts.onKeymapChanged((e) => localStorage.setItem('keys', JSON.stringify(e.keymap)));
```

A shortcut added later, such as one of a component opened after the keymap was restored, takes the user’s keys for its name when it is added.

## In a dialog

The editor fills the height of its parent, so it can be the content of a window or a tab panel. Without a `filter`, it lists every shortcut of the page the user can change: here, the shortcuts of this documentation site.

```tsx
import { Button, MxForm, ShortcutEditor } from '@motifx-community/ui';

/** The editor in a window of its own, as a settings dialog opens it. It lists every shortcut of this site. */
export default function InWindow() {
  const open = (button: Button) => {
    const form = new MxForm({ title: 'Keyboard shortcuts', width: '40rem', height: '30rem', resizable: true, modal: true });
    form.content = new ShortcutEditor();
    form.footer = <Button text="Close" tone="accent" onclick={() => form.close('ok')} />;
    void form.showDialog(button);
  };
  let button!: Button;
  return <Button text="Keyboard shortcuts…" variant="outline" ref={(b: Button) => (button = b)} onclick={() => open(button)} />;
}
```

The customizer of a [MenuBar](menus-customization.md) shows the same editor on its Keyboard page; `customizerKeyboard: false` leaves the page out.

## Which shortcuts are listed

A shortcut is listed when it has a name. `addShortcut` takes the name, the text the list shows and the category it is grouped under; `customizable: false` keeps its keys fixed. Several shortcuts with one name, such as the same action in two documents, are one row and take the same keys. `filter` chooses the rows, `grouped`, `searchEnabled` and `resetAllEnabled` turn the parts of the editor on and off.

```tsx
import { reactive } from '@motifx/core';
import { ShortcutEditor, Stack, Switch, addShortcut, type ShortcutInfo } from '@motifx-community/ui';

/**
 * Shortcuts of the app's own (`addShortcut` with a name), one the user cannot change, and the switches of the editor:
 * the categories, the search field, the reset button, and every shortcut or only the ones the user can change.
 */
export default function Options() {
  const s = reactive({ grouped: true, search: true, resetAll: true, all: false });
  const ours = (info: ShortcutInfo) => !!info.name?.startsWith('options.');
  const changeable = (info: ShortcutInfo) => info.customizable && ours(info);

  return (
    <Stack
      gap="md"
      ref={(host: Stack) => {
        const stops = [
          addShortcut(['F5', 'Mod+R'], () => {}, { scope: host, name: 'options.reload', text: 'Reload', category: 'View' }),
          addShortcut('Mod+=', () => {}, { scope: host, name: 'options.zoomIn', text: 'Zoom in', category: 'View' }),
          addShortcut('Mod+-', () => {}, { scope: host, name: 'options.zoomOut', text: 'Zoom out', category: 'View' }),
          addShortcut('F1', () => {}, { scope: host, name: 'options.help', text: 'Help', category: 'Help', customizable: false }),
        ];
        host.motif.setDisposable(() => stops.forEach((stop) => stop()));
      }}
    >
      <Stack orientation="horizontal" gap="lg" wrap>
        <Switch label="Categories" x-model={() => s.grouped} />
        <Switch label="Search" x-model={() => s.search} />
        <Switch label="Reset all keys" x-model={() => s.resetAll} />
        <Switch label="Fixed shortcuts too" x-model={() => s.all} />
      </Stack>
      <ShortcutEditor
        height="20rem"
        grouped={() => s.grouped}
        searchEnabled={() => s.search}
        resetAllEnabled={() => s.resetAll}
        filter={() => (s.all ? ours : changeable)}
      />
    </Stack>
  );
}
```

```tsx
addShortcut(['F5', 'Mod+R'], () => view.reload(), { name: 'view.reload', text: () => t('Reload'), category: () => t('View') });
```

## Shortcuts of the kit’s components

The kit’s components register their shortcuts under names of their own, with texts in the kit’s language. The user’s keys apply to them as to any other shortcut.

| Component | Names | Shortcuts |
| --- | --- | --- |
| `Commands (`commands.add`)` | The key of the command | The text and the category of the command. |
| `TabDocumentManager` | `tabDocuments.<action>`, such as `tabDocuments.closeTab`; `tabDocuments.focusGroup1` to `9` | Each action of `keys`. The keys of a mode, such as moving a window with the arrow keys, are read inside the mode and are not listed. |
| `Toaster` | `toaster.focus` | The key that moves focus to the notifications. |
| `MenuBar` | `menuBar.focus` | F10, with `focusOnF10`. |

## Programmatic use

`new ShortcutEditor(props)` creates the editor without JSX. Each prop is also a property; `selected`, `give()` and `resetAll()` do what the toolbar does.

```tsx
import { Component } from '@motifx/core';
import { Button, ShortcutEditor, Stack, addShortcut } from '@motifx-community/ui';

/** An editor created programmatically: a shortcut is selected and given other keys from code, then reset. */
export default class Programmatic extends Component<HTMLDivElement> {
    constructor() {
        super('div');
        const stack = new Stack({ gap: 'md' });
        const stop = addShortcut('Mod+K', () => {}, { scope: stack, name: 'code.palette', text: 'Command palette', category: 'Go' });
        stack.motif.setDisposable(stop);
        const editor = new ShortcutEditor({ height: '10rem', filter: (info) => info.name === 'code.palette' });
        const give = new Button({
            text: 'Give it Ctrl+Shift+P',
            variant: 'outline',
            onclick: () => {
                editor.selected = 'code.palette';
                editor.give(['Ctrl+Shift+P']);
            },
        });
        const reset = new Button({ text: 'Reset all keys', variant: 'outline', onclick: () => editor.resetAll() });
        const buttons = new Stack({ orientation: 'horizontal', gap: 'sm' });
        buttons.controls.add(give, reset);
        stack.controls.add(editor, buttons);
        this.controls.add(stack);
    }
}
```

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `filter` | `Bind<((shortcut: ShortcutInfo) => boolean) \| null>` | The shortcuts the user can change | Which shortcuts are listed. A shortcut the user cannot change is listed with its row turned off. |
| `grouped` | `Bind<boolean>` | `true` | Lists the shortcuts under their categories. A shortcut without one is listed under “Other”. |
| `searchEnabled` | `Bind<boolean>` | `true` | Shows a search field above the list. |
| `resetAllEnabled` | `Bind<boolean>` | `true` | Shows the button that gives every shortcut its own keys again. |
| `height` | `Bind<string \| null>` | The height of the parent | The height, as a CSS length. |
| `label` | `Bind<string>` | The kit string “Keyboard shortcuts” | The accessible name. |

### Properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `selected` | `string \| null` | The name of the selected shortcut. Settable. |
| `give(keys)` | `boolean` | Gives the selected shortcut the keys (an empty list removes its keys), or its own keys again with `null`. Returns `false` when no shortcut the user can change is selected. |
| `resetAll()` | `void` | Gives every shortcut its own keys again. |
| `refresh()` | `void` | Reads the shortcuts and their keys again. The editor does this when shortcuts are added or removed, and when the language changes. |

### Events

| Event | Type | Description |
| --- | --- | --- |
| `onKeysChanged` | `{ name, keys, keymap }` | Occurs after the user changes the keys of a shortcut. `name` is `null` after a reset of all keys; `keymap` holds every key the user has given, to save. |

### Shortcut options for the list

| Option of addShortcut | Type | Description |
| --- | --- | --- |
| `name` | `string` | Names what the shortcut does. Shortcuts with the same name share the keys the user gives them. Without a name, a shortcut is not listed and cannot be changed. |
| `text` | `string \| (() => string)` | How the shortcut reads in the list. A function is read again when the language changes. |
| `category` | `string \| (() => string)` | The heading the list groups the shortcut under. |
| `customizable` | `boolean` | `false` keeps the shortcut’s own keys. It is still listed when the filter allows it. |

### Keyboard

| Where | Keys |
| --- | --- |
| `A row` | The arrow keys, Home and End move through the list; typing in the search field filters it. |
| `The keys field` | Takes the keys pressed instead of running them. Backspace clears it; Tab and Escape keep their usual meaning. |

### Accessibility

| Topic | Details |
| --- | --- |
| `Name` | The editor is a group named by `label`; the list, the toolbar and the keys field have names of their own. |
| `Status` | The text that says who uses the keys pressed is a live region, read when it changes. |
| `Keys` | Keys are written as the platform writes them: Ctrl+Shift+S, and ⇧⌘S on Apple platforms. |

### Styling hooks

| Hook | Description |
| --- | --- |
| `.mx-shortcut-editor` | The editor. |
| `.mx-shortcut-editor__tools, .mx-shortcut-editor__keys, .mx-shortcut-editor__capture` | The toolbar, the keys row and its field. |
| `.mx-shortcut-editor__status` | The text that says who uses the keys pressed. |
| `.mx-shortcut-editor__list` | The list of shortcuts. |
| `.mx-shortcut-editor__text, .mx-shortcut-editor__changed, .mx-shortcut-editor__row-keys` | A row: the name of the shortcut, the mark of keys the user changed, and its keys. |

### Design tokens

| Token | Description |
| --- | --- |
| `shortcut-editor.editor, .keys` | Units: the editor and the keys row, with the `gap` between their parts. |
| `shortcut-editor.status, .row-keys, .changed` | Units: the status text, the keys at the end of a row (read as in a menu), and the mark of changed keys. |

## Feedback

Loading issues…
