import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import AccessKeys from './examples/AccessKeys';
import FocusGuard from './examples/FocusGuard';
import Shortcut from './examples/Shortcut';
import TabOrder from './examples/TabOrder';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const RULES = [
  ['Tab navigation', 'Every control is a Tab stop unless `tabStop = false`. `tabIndex` sets the order of the controls in a container.'],
  ['Active control', 'Containers (`FocusContainer`) track `activeControl` and restore focus with `restoreFocus()` when they become active again.'],
  ['Composite controls', 'One Tab stop with arrow keys inside, using a roving tabindex or `aria-activedescendant`. This arrives with the first composite control.'],
  ['Focus never on <body>', 'When the focused part of a control is disabled, hidden, removed or disposed, focus moves to the next usable element.'],
  ['Focus ring', 'Shown only during keyboard use (`:focus-visible`), with the design system\'s double ring.'],
  ['Access keys', '`&Save` in a control\'s text assigns Alt+S. The letter is underlined while Alt is held.'],
  ['Shortcuts', '`addShortcut(\'Ctrl+S\', …)` registers a shortcut for the whole application or for one control.'],
];

const CHORDS = [
  ['Ctrl / Control', 'The Ctrl key.'],
  ['Alt / Option', 'The Alt key (Option on a Mac).'],
  ['Shift', 'The Shift key.'],
  ['Meta / Cmd / Win', 'The Windows key, or Cmd on a Mac.'],
  ['Mod', 'Cmd on Apple platforms and Ctrl elsewhere, so `Mod+S` saves on every platform.'],
  ['keys', 'A character (`S`, `1`, `/`) or a `KeyboardEvent.key` name: `Enter`, `Escape` (`Esc`), `Delete` (`Del`), `F2`, `ArrowUp` (`Up`), `Space`, `Plus`… Case does not matter. `Ctrl++` means Ctrl and plus.'],
];

const SHORTCUT_RULES = [
  ['Most specific first', 'Shortcuts scoped to the controls that hold focus run first, starting with the innermost. Application-wide shortcuts run last. A handler that returns `false` passes the key on.'],
  ['Modal windows', 'While a modal window is open, only shortcuts scoped inside it run. Application-wide shortcuts are suppressed.'],
  ['Windows', 'Application-wide shortcuts without Ctrl, Alt or Meta (Delete, Escape, a letter) do not run while focus is in a window, because those keys belong to the window. Combinations with a modifier and function keys still run.'],
  ['Text fields', 'A combination without Ctrl, Alt or Meta does not fire in text fields, so that Delete deletes text, unless you set `inEditable: true`. Function keys and combinations with a modifier work everywhere.'],
  ['Disabled scope', 'A shortcut scoped to a disabled control does not run.'],
  ['Handled', 'The key receives `preventDefault()` and goes no further. Shortcuts run before access keys, so an explicit combination takes priority over an implicit key.'],
];

const ACCESS = [
  ['Marker', 'Put `&` before a letter: `&Save`, `Save &as…`. `&&` produces a literal ampersand. Only the first marker counts.'],
  ['Keys', 'Alt plus the key. On Apple platforms, use Control + Option plus the key, because Option alone types characters there. Browsers use the same keys for HTML `accesskey`.'],
  ['Description', 'The key activates the control. A button receives focus and is clicked, as with HTML `accesskey`. Any other control receives focus (`onAccessKey()`).'],
  ['Several with the same key', 'Each press moves focus to the next match without activating it.'],
  ['Where', 'The modal window if one is open, otherwise the window that has focus, otherwise the page outside any window. Disabled and hidden controls are skipped.'],
  ['AltGr', 'AltGr (Ctrl+Alt on Windows) is ignored, because it types characters such as `@` on a Turkish keyboard.'],
  ['Underline', 'Shown while Alt is held (Control + Option on Apple platforms). Tapping Alt keeps the underlines visible until Alt is tapped again, another key is pressed or the pointer is used. While the page has access keys, that tap is not passed to the browser, which would otherwise move keyboard focus to its menu bar. Set `data-mx-access-keys="always"` on `<html>` to show them all the time.'],
  ['Accessibility', 'The accessible name is the plain text, and the control receives `aria-keyshortcuts="Alt+S"` (`"Control+Alt+S"` on Apple platforms).'],
  ['Plain elements', 'Any element with `aria-keyshortcuts="Alt+N"` takes part. A button-like element is clicked, an input receives focus, and a `<label>` moves focus to its field.'],
];

const API = [
  ['addShortcut(chord, handler, options?)', '`() => void`', 'Registers a shortcut and returns a function that removes it. `options.scope` limits it to a component, and `options.inEditable` also enables it in text fields.'],
  ['control.addShortcut(chord, handler, options?)', '`() => void`', 'Registers a shortcut scoped to the control and removes it when the control is disposed.'],
  ['parseAccessKey(text)', '`{ text, key, index }`', 'Parses `&Text` for your own controls. Render the result with the `mx-access-key` class and call `setAccessKey(key)`.'],
  ['tabIndex', 'prop / property', 'The order inside the container. The default is 0.'],
  ['activeControl / restoreFocus()', 'FocusContainer', 'See the Control page.'],
];

export default function KeyboardPage() {
  return (
    <>
      <p class="lead">
        <Rich text={'Every control follows the same rules for Tab order, the active control of a container, focus handling, `&File` access keys and application-wide shortcuts.'} />
      </p>

      <Section anchor="rules" title="Validation rules">
        <ApiTable head={['Rule', 'Details']} rows={RULES} />
      </Section>

      <Section anchor="tab" title="Tab order">
        <p>
          <Rich text="Give controls a `tabIndex`, and the outermost container of the page or window visits them in ascending order at each level of the control tree. Equal indexes and plain elements (index 0) follow document order. Until a control sets a `tabIndex`, Tab is handled by the browser. A modal window keeps Tab inside itself, and only one radio button per group is a Tab stop, as in browsers." />
        </p>
        <Example files={code('TabOrder.tsx')}>
          <TabOrder />
        </Example>
      </Section>

      <Section anchor="active" title="Active control">
        <p>
          <Rich text="A `FocusContainer` knows which child control holds focus (`activeControl`, reactive) and returns focus to it with `restoreFocus()`. For example, when a window comes to the front or the user returns to a tab page." />
        </p>
      </Section>

      <Section anchor="access" title="Access keys">
        <Code
          code={`
<Button text="&Save" onclick={save} />    // Alt+S
<Button text="Save &as…" onclick={saveAs} /> // Alt+A
<Button text="Tom && Jerry" />             // a literal &
<input aria-keyshortcuts="Alt+N" />        // plain elements too
`}
        />
        <ApiTable head={['Topic', 'Behavior']} rows={ACCESS} />
        <Example files={code('AccessKeys.tsx')}>
          <AccessKeys />
        </Example>
        <p class="docs-note">
          <Rich text="Browsers reserve some Alt combinations for their own menus, and these vary by browser and language. Test the keys you choose." />
        </p>
      </Section>

      <Section anchor="shortcuts" title="Shortcuts">
        <Code
          code={`
import { addShortcut } from '@motifx-community/ui';

const remove = addShortcut('Mod+S', () => model.save()); // app-wide
grid.addShortcut('Delete', () => grid.deleteSelected()); // while focus is in the grid
addShortcut('F2', () => rename(), { scope: tree });
`}
        />
        <h3>
          <Rich text="Key combinations" />
        </h3>
        <ApiTable head={['Part', 'Meaning']} rows={CHORDS} />
        <h3>
          <Rich text="Shortcut precedence" />
        </h3>
        <ApiTable head={['Rule', 'Behavior']} rows={SHORTCUT_RULES} />
        <Example files={code('Shortcut.tsx')}>
          <Shortcut />
        </Example>
      </Section>

      <Section anchor="guard" title={'Focus never lands on &lt;body&gt;'}>
        <p>
          <Rich text="When the focused part of a control is disabled, hidden, removed (a list row, a tree branch) or disposed, focus moves to the next usable element from that position in the same window, or to the previous one. Clicking an empty area still clears focus as usual, and route changes are left to the router." />
        </p>
        <Example files={code('FocusGuard.tsx')} stack>
          <FocusGuard />
        </Example>
      </Section>

      <Section anchor="api" title="API reference">
        <ApiTable head={['Member', 'Return value / type', 'Description']} rows={API} />
        <p>
          <Rich text="For `tabStop`, `tabIndex`, `focus()`, `onAccessKey()` and `FocusContainer`, see the `Control` page." />
        </p>
      </Section>
    </>
  );
}
