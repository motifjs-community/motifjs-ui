import { Component, reactive } from '@motifx/core';
import { addShortcut, Button, FocusContainer } from '@motifx-community/ui';
import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';

/** A container for the demos: a div whose JSX children core renders. */
class DemoBox extends FocusContainer<HTMLDivElement> {}

const RULES = [
  ['Tab navigation', 'Every control is a Tab stop unless `tabStop = false`; `tabIndex` orders the controls of a container.'],
  ['Active control', 'Containers (`FocusContainer`) track `activeControl` and put focus back with `restoreFocus()` when they become active again.'],
  ['Composite controls', 'One Tab stop, arrow keys inside (roving tabindex or `aria-activedescendant`): with the first composite control.'],
  ['Focus never on <body>', 'Disabling, hiding, removing or disposing the focused part of a control moves focus to the next usable element.'],
  ['Focus ring', 'Only for keyboard use (`:focus-visible`), the design system\'s double ring.'],
  ['Access keys', '`&Save` in a control text: Alt+S. Underlined while Alt is held.'],
  ['Shortcuts', '`addShortcut(\'Ctrl+S\', …)` app-wide, or scoped to a control.'],
];

const CHORDS = [
  ['Ctrl / Control', 'The Ctrl key.'],
  ['Alt / Option', 'The Alt key (Option on a Mac).'],
  ['Shift', 'The Shift key.'],
  ['Meta / Cmd / Win', 'The Windows key, Cmd on a Mac.'],
  ['Mod', 'Cmd on Apple platforms, Ctrl elsewhere: `Mod+S` saves everywhere.'],
  ['keys', 'A character (`S`, `1`, `/`), or a `KeyboardEvent.key` name: `Enter`, `Escape` (`Esc`), `Delete` (`Del`), `F2`, `ArrowUp` (`Up`), `Space`, `Plus`… Case does not matter; `Ctrl++` is Ctrl and plus.'],
];

const SHORTCUT_RULES = [
  ['Most specific first', 'Shortcuts scoped to the controls holding focus run first, the innermost one first; app-wide ones last. A handler that returns `false` passes the key on.'],
  ['Modal windows', 'While a modal window is open, only shortcuts scoped inside it run; app-wide ones are silent.'],
  ['Windows', 'App-wide shortcuts without Ctrl, Alt or Meta (Delete, Escape, a letter) do not run while focus is in a window: those keys belong to the window. Chords with a modifier and F-keys still do.'],
  ['Text fields', 'A chord without Ctrl, Alt or Meta leaves text fields alone (Delete deletes text) unless `inEditable: true`. F-keys and chords with a modifier work everywhere.'],
  ['Disabled scope', 'A shortcut scoped to a disabled control does not run.'],
  ['Handled', 'The key gets `preventDefault()` and stops there. Shortcuts run before access keys: an explicit chord wins over an implicit key.'],
];

const ACCESS = [
  ['Marker', '`&` before a letter: `&Save`, `Save &as…`. `&&` is a literal ampersand. Only the first marker counts.'],
  ['Keys', 'Alt + the key; on Apple platforms Control + Option + the key, because Option alone types characters there (browsers use the same keys for HTML `accesskey`).'],
  ['What it does', 'The key activates the control: a button is focused and clicked (as HTML `accesskey` does), another control is focused (`onAccessKey()`).'],
  ['Several with the same key', 'Each press moves focus to the next one, activating none.'],
  ['Where', 'The modal window while one is open, else the window holding focus, else the page outside windows. Disabled and hidden controls are skipped.'],
  ['AltGr', 'Ignored: AltGr (Ctrl+Alt on Windows) types characters such as `@` on a Turkish keyboard.'],
  ['Underline', 'Shown while Alt is held (Control + Option on Apple platforms). Tapping Alt (press and release) keeps it shown until Alt is tapped again, another key is pressed or the pointer is used; while the page has access keys, that tap is kept from the browser, which would otherwise move keyboard focus to its menu bar. `data-mx-access-keys="always"` on `<html>` shows it all the time.'],
  ['Accessibility', 'The accessible name is the plain text; the control gets `aria-keyshortcuts="Alt+S"` (`"Control+Alt+S"` on Apple platforms).'],
  ['Plain elements', 'Any element with `aria-keyshortcuts="Alt+N"` takes part: a button-like one is clicked, an input focused, a `<label>` focuses its field.'],
];

const API = [
  ['addShortcut(chord, handler, options?)', '`() => void`', 'Registers a shortcut; returns the remover. `options.scope`: a component; `options.inEditable`: also in text fields.'],
  ['control.addShortcut(chord, handler, options?)', '`() => void`', 'The same, scoped to the control and removed when it is disposed.'],
  ['parseAccessKey(text)', '`{ text, key, index }`', 'Parses `&Text` for your own controls; render with the `mx-access-key` class and call `setAccessKey(key)`.'],
  ['tabIndex', 'prop / property', 'Order inside the container; default 0.'],
  ['activeControl / restoreFocus()', 'FocusContainer', 'See the Control page.'],
];

/** A class page: its app-wide shortcut lives as long as the page. */
export default class KeyboardPage extends Component {
  private readonly s = reactive({ saves: 0, opens: 0, exports: 0, palette: 0, items: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] });

  override onConfigured(): void {
    this.motif.setDisposable(addShortcut('Mod+K', () => void this.s.palette++));
  }

  override view() {
    const s = this.s;
    let box: DemoBox | null = null;
    return (
      <>
        <p class="lead">
          The rules every control follows: Tab order, the active control of a container, focus that never falls to{' '}
          <code>&lt;body&gt;</code>, <code>&amp;File</code> access keys and app-wide shortcuts.
        </p>

        <Section anchor="rules" title="The rules">
          <ApiTable head={['Rule', 'How']} rows={RULES} />
        </Section>

        <Section anchor="tab" title="Tab order">
          <p>
            Give controls a <code>tabIndex</code> and the outermost container of the page or window visits them in
            ascending order at each level of the control tree; equal indexes (and plain elements, index 0) go in document
            order. Until a control inside sets a <code>tabIndex</code>, Tab is left to the browser. A modal window keeps Tab
            inside itself; one radio button per group is a stop, as in browsers.
          </p>
          <Example
            code={`
<CustomerEditor>
  <Button text="Third" tabIndex={3} />
  <Button text="First" tabIndex={1} />
  <Button text="Second" tabIndex={2} />
</CustomerEditor>
`}
          >
            <DemoBox
              class="docs-flow docs-panel"
              ref={(b: DemoBox) => (box = b)}
            >
              <Button text="Third" tabIndex={3} />
              <Button text="First" tabIndex={1} />
              <Button text="Second" tabIndex={2} />
            </DemoBox>
            <span>
              activeControl: <output class="active-name">{() => box?.activeControl?.text ?? '—'}</output>
            </span>
            <Button text="restoreFocus()" onclick={() => box?.restoreFocus()} />
          </Example>
        </Section>

        <Section anchor="active" title="Active control">
          <p>
            A <code>FocusContainer</code> knows which control inside holds focus (<code>activeControl</code>, reactive)
            and puts focus back there with <code>restoreFocus()</code>: a window coming to the front, a tab page coming
            back.
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
          <ApiTable head={['Topic', 'Behaviour']} rows={ACCESS} />
          <div class="demo">
            <Button text="&Save" onclick={() => s.saves++} />
            <Button text="&Open" onclick={() => s.opens++} />
            <Button text="Ex&port" onclick={() => s.exports++} />
            <span>
              Saved <output class="saves">{() => s.saves}</output> · opened <output class="opens">{() => s.opens}</output> · exported{' '}
              <output>{() => s.exports}</output>
            </span>
          </div>
          <p class="docs-note">
            Browsers keep a few Alt combinations for their own menus, and they differ per browser and language; test the
            keys you choose.
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
          <h3>Chords</h3>
          <ApiTable head={['Part', 'Meaning']} rows={CHORDS} />
          <h3>Which shortcut runs</h3>
          <ApiTable head={['Rule', 'Behaviour']} rows={SHORTCUT_RULES} />
          <div class="demo">
            <span>
              This page registers <kbd>Mod+K</kbd> (Ctrl+K, Cmd+K on a Mac). Pressed{' '}
              <output class="palette">{() => s.palette}</output> times.
            </span>
          </div>
        </Section>

        <Section anchor="guard" title="Focus never on &lt;body&gt;">
          <p>
            When the focused part of a control is disabled, hidden, removed (a list row, a branch) or disposed, focus moves
            to the next usable element from that spot in the same window, else the one before it. A click on an empty spot
            still clears focus as usual, and route changes are left to the router.
          </p>
          <div class="demo demo--stack guard-list">
            {s.items.map((item) => (
              <div key={item.id} class="docs-flow">
                <span>Row {item.id}</span>
                <Button text={`Remove row ${item.id}`} onclick={() => s.items.splice(s.items.indexOf(item), 1)} />
              </div>
            ))}
          </div>
        </Section>

        <Section anchor="api" title="API reference">
          <ApiTable head={['Member', 'Returns / kind', 'Description']} rows={API} />
          <p>
            <Rich text="Controls: see `Control` for `tabStop`, `tabIndex`, `focus()`, `onAccessKey()` and `FocusContainer`." />
          </p>
        </Section>
      </>
    );
  }
}
