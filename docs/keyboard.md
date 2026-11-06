# Keyboard and focus

> Foundations · @motifx-community/ui 0.1.0-beta.5

Every control follows the same rules for Tab order, the active control of a container, focus handling, `&File` access keys and application-wide shortcuts.

## Validation rules

| Rule | Details |
| --- | --- |
| `Tab navigation` | Every control is a Tab stop unless `tabStop = false`. `tabIndex` sets the order of the controls in a container. |
| `Active control` | Containers (`FocusContainer`) track `activeControl` and restore focus with `restoreFocus()` when they become active again. |
| `Composite controls` | One Tab stop with arrow keys inside, using a roving tabindex or `aria-activedescendant`. This arrives with the first composite control. |
| `Focus never on <body>` | When the focused part of a control is disabled, hidden, removed or disposed, focus moves to the next usable element. |
| `Focus ring` | Shown only during keyboard use (`:focus-visible`), with the design system's double ring. |
| `Access keys` | `&Save` in a control's text assigns Alt+S. The letter is underlined while Alt is held. |
| `Shortcuts` | `addShortcut('Ctrl+S', …)` registers a shortcut for the whole application or for one control. |

## Tab order

Give controls a `tabIndex`, and the outermost container of the page or window visits them in ascending order at each level of the control tree. Equal indexes and plain elements (index 0) follow document order. Until a control sets a `tabIndex`, Tab is handled by the browser. A modal window keeps Tab inside itself, and only one radio button per group is a Tab stop, as in browsers.

```tsx
import { Button, FocusContainer, Panel, Stack } from '@motifx-community/ui';

/** A custom container: it manages the Tab order of its controls and remembers the active one. */
class CustomerEditor extends FocusContainer<HTMLDivElement> {}

/** Tab visits the buttons by `tabIndex`; the container reports its `activeControl` and puts focus back with `restoreFocus()`. */
export default function TabOrder() {
  let editor: CustomerEditor | null = null;
  return (
    <>
      <CustomerEditor ref={(c: CustomerEditor) => (editor = c)}>
        <Panel variant="outline" padding="md">
          <Stack orientation="horizontal" wrap align="center">
            <Button text="Third" tabIndex={3} />
            <Button text="First" tabIndex={1} />
            <Button text="Second" tabIndex={2} />
          </Stack>
        </Panel>
      </CustomerEditor>
      <span>
        activeControl: <output class="active-name">{() => editor?.activeControl?.text ?? '—'}</output>
      </span>
      <Button text="restoreFocus()" onclick={() => editor?.restoreFocus()} />
    </>
  );
}
```

## Active control

A `FocusContainer` knows which child control holds focus (`activeControl`, reactive) and returns focus to it with `restoreFocus()`. For example, when a window comes to the front or the user returns to a tab page.

## Access keys

```tsx
<Button text="&Save" onclick={save} />    // Alt+S
<Button text="Save &as…" onclick={saveAs} /> // Alt+A
<Button text="Tom && Jerry" />             // a literal &
<input aria-keyshortcuts="Alt+N" />        // plain elements too
```

| Topic | Behavior |
| --- | --- |
| `Marker` | Put `&` before a letter: `&Save`, `Save &as…`. `&&` produces a literal ampersand. Only the first marker counts. |
| `Keys` | Alt plus the key. On Apple platforms, use Control + Option plus the key, because Option alone types characters there. Browsers use the same keys for HTML `accesskey`. |
| `Description` | The key activates the control. A button receives focus and is clicked, as with HTML `accesskey`. Any other control receives focus (`onAccessKey()`). |
| `Several with the same key` | Each press moves focus to the next match without activating it. |
| `Where` | The modal window if one is open, otherwise the window that has focus, otherwise the page outside any window. Disabled and hidden controls are skipped. |
| `AltGr` | AltGr (Ctrl+Alt on Windows) is ignored, because it types characters such as `@` on a Turkish keyboard. |
| `Underline` | Shown while Alt is held (Control + Option on Apple platforms). Tapping Alt keeps the underlines visible until Alt is tapped again, another key is pressed or the pointer is used. While the page has access keys, that tap is not passed to the browser, which would otherwise move keyboard focus to its menu bar. Set `data-mx-access-keys="always"` on `<html>` to show them all the time. |
| `Accessibility` | The accessible name is the plain text, and the control receives `aria-keyshortcuts="Alt+S"` (`"Control+Alt+S"` on Apple platforms). |
| `Plain elements` | Any element with `aria-keyshortcuts="Alt+N"` takes part. A button-like element is clicked, an input receives focus, and a `<label>` moves focus to its field. |

```tsx
import { reactive } from '@motifx/core';
import { Button } from '@motifx-community/ui';

/** `&` in a button text: Alt+S saves, Alt+O opens, Alt+P exports. */
export default function AccessKeys() {
  const s = reactive({ saves: 0, opens: 0, exports: 0 });
  return (
    <>
      <Button text="&Save" onclick={() => s.saves++} />
      <Button text="&Open" onclick={() => s.opens++} />
      <Button text="Ex&port" onclick={() => s.exports++} />
      <span>
        Saved <output class="saves">{() => s.saves}</output> · opened <output class="opens">{() => s.opens}</output> · exported{' '}
        <output>{() => s.exports}</output>
      </span>
    </>
  );
}
```

Browsers reserve some Alt combinations for their own menus, and these vary by browser and language. Test the keys you choose.

## Shortcuts

```tsx
import { addShortcut } from '@motifx-community/ui';

const remove = addShortcut('Mod+S', () => model.save()); // app-wide
grid.addShortcut('Delete', () => grid.deleteSelected()); // while focus is in the grid
addShortcut('F2', () => rename(), { scope: tree });
```

### Key combinations

| Part | Meaning |
| --- | --- |
| `Ctrl / Control` | The Ctrl key. |
| `Alt / Option` | The Alt key (Option on a Mac). |
| `Shift` | The Shift key. |
| `Meta / Cmd / Win` | The Windows key, or Cmd on a Mac. |
| `Mod` | Cmd on Apple platforms and Ctrl elsewhere, so `Mod+S` saves on every platform. |
| `keys` | A character (`S`, `1`, `/`) or a `KeyboardEvent.key` name: `Enter`, `Escape` (`Esc`), `Delete` (`Del`), `F2`, `ArrowUp` (`Up`), `Space`, `Plus`… Case does not matter. `Ctrl++` means Ctrl and plus. |

### Shortcut precedence

| Rule | Behavior |
| --- | --- |
| `Most specific first` | Shortcuts scoped to the controls that hold focus run first, starting with the innermost. Application-wide shortcuts run last. A handler that returns `false` passes the key on. |
| `Modal windows` | While a modal window is open, only shortcuts scoped inside it run. Application-wide shortcuts are suppressed. |
| `Windows` | Application-wide shortcuts without Ctrl, Alt or Meta (Delete, Escape, a letter) do not run while focus is in a window, because those keys belong to the window. Combinations with a modifier and function keys still run. |
| `Text fields` | A combination without Ctrl, Alt or Meta does not fire in text fields, so that Delete deletes text, unless you set `inEditable: true`. Function keys and combinations with a modifier work everywhere. |
| `Disabled scope` | A shortcut scoped to a disabled control does not run. |
| `Handled` | The key receives `preventDefault()` and goes no further. Shortcuts run before access keys, so an explicit combination takes priority over an implicit key. |

```tsx
import { Component, reactive } from '@motifx/core';
import { addShortcut } from '@motifx-community/ui';

/** An app-wide shortcut, Mod+K, registered for as long as this component lives. */
export default class Shortcut extends Component {
  private readonly s = reactive({ palette: 0 });

  override onConfigured(): void {
    this.motif.setDisposable(addShortcut('Mod+K', () => void this.s.palette++));
  }

  override view() {
    return (
      <span>
        This page registers <kbd>Mod+K</kbd> (Ctrl+K, Cmd+K on a Mac). Pressed <output class="palette">{() => this.s.palette}</output> times.
      </span>
    );
  }
}
```

## Focus never lands on &lt;body&gt;

When the focused part of a control is disabled, hidden, removed (a list row, a tree branch) or disposed, focus moves to the next usable element from that position in the same window, or to the previous one. Clicking an empty area still clears focus as usual, and route changes are left to the router.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack } from '@motifx-community/ui';

/** Removing the row that holds focus moves focus to the next row, not to `<body>`. */
export default function FocusGuard() {
  const s = reactive({ items: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] });
  return (
    <>
      {s.items.map((item) => (
        <Stack key={item.id} orientation="horizontal" wrap align="center">
          <span>Row {item.id}</span>
          <Button text={`Remove row ${item.id}`} onclick={() => s.items.splice(s.items.indexOf(item), 1)} />
        </Stack>
      ))}
    </>
  );
}
```

## API reference

| Member | Return value / type | Description |
| --- | --- | --- |
| `addShortcut(chord, handler, options?)` | `() => void` | Registers a shortcut and returns a function that removes it. `options.scope` limits it to a component, and `options.inEditable` also enables it in text fields. |
| `control.addShortcut(chord, handler, options?)` | `() => void` | Registers a shortcut scoped to the control and removes it when the control is disposed. |
| `parseAccessKey(text)` | `{ text, key, index }` | Parses `&Text` for your own controls. Render the result with the `mx-access-key` class and call `setAccessKey(key)`. |
| `tabIndex` | prop / property | The order inside the container. The default is 0. |
| `activeControl / restoreFocus()` | FocusContainer | See the Control page. |

For `tabStop`, `tabIndex`, `focus()`, `onAccessKey()` and `FocusContainer`, see the `Control` page.

## Feedback

Loading issues…
