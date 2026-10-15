import { Application, reactive } from '@motifx/core';
import '@motifx-community/ui/styles.css';
import '../shared/docs.css';
import { Button, Control } from '@motifx-community/ui';
import { Chrome } from '../shared/chrome';
import { ApiTable, Code, Rich, Toc } from '../shared/doc';

/** A plain container control for the demos: a div whose JSX children core renders. */
class DemoPanel extends Control<HTMLDivElement> {}

const PROPS = [
  ['text', '`Bind<string>`', "`''`", 'The control\'s text. Where it shows is up to the control: a button\'s caption, a form\'s title.'],
  ['enabled', '`Bind<boolean>`', '`true`', '`false` disables the control and everything inside it. See "Enabled".'],
  ['disabled', '`Bind<boolean>`', '`false`', 'The HTML-style inverse of `enabled`, for habit: `disabled={() => state.busy}`. Ignored when `enabled` is given.'],
  ['visible', '`Bind<boolean>`', '`true`', '`false` hides the control with core `hide()`; `true` shows it again with `show()`.'],
  ['tabStop', '`Bind<boolean>`', '`true`', '`false` takes the control out of the Tab order; a click or `focus()` still focuses it.'],
  ['tabIndex', '`Bind<number>`', '`0`', 'Order among the controls of the same container: Tab visits them in ascending order, ties in document order. Leave it unset where you can: document order is also the reading order of screen readers. See Keyboard and focus.'],
  ['dock', '`Bind<Dock>`', "`'none'`", 'Where it goes in a Panel, GroupBox or SplitContainer panel: `top`, `bottom`, `start`, `end`, `fill`, `float`. See Panel.'],
  ['left, top, right, bottom', '`Bind<Length>`', '—', 'CSS offsets of a floating control; the edges given are the ones it stays anchored to.'],
  ['width, height', '`Bind<Length>`', '—', 'Size: pixels or any CSS length.'],
  ['row, column, rowSpan, columnSpan', '`Bind<number>`', '—', 'Its cell in a Grid: 1-based lines, as in CSS `grid-row` / `grid-column`.'],
];

const PROPERTIES = [
  ['text', '`string`', 'read/write, reactive', 'Setting it replaces a getter given as prop.'],
  ['enabled', '`boolean`', 'read/write, reactive', 'This control\'s own value, as set or bound (like the HTML `disabled` attribute).'],
  ['isEnabled', '`boolean`', 'read-only, reactive', 'Whether it can be used now: enabled itself and in every control it sits in (like CSS `:enabled`). Windows shown inside do not inherit it.'],
  ['visible', '`boolean`', 'read/write, reactive', 'This control\'s own value; a hidden parent does not change it.'],
  ['disabled', '`boolean`', 'read/write, reactive', '`!enabled`.'],
  ['tabIndex', '`number`', 'read/write, reactive', 'Position in the Tab order of its container.'],
  ['tabStop', '`boolean`', 'read/write, reactive', 'Writes `tabindex="-1"` on the focus element while `false`, and puts back the element\'s own `tabindex` afterwards.'],
  ['parentControl', '`Control | null`', 'read-only', 'The nearest ancestor that is a `Control`, not crossing a window.'],
  ['canFocus', '`boolean`', 'read-only', 'Enabled, on the page and focusable right now.'],
  ['focused', '`boolean`', 'read-only', 'Its focus element has focus. A DOM query, not reactive.'],
  ['focusWithin', '`boolean`', 'read-only', 'Focus is on it or anything inside it. A DOM query, not reactive.'],
];

const METHODS = [
  ['focus()', '`boolean`', 'Focuses the control; `false` when it cannot take focus (`canFocus`).'],
  ['onAccessKey()', '`boolean`', 'What its access key (`&Save` → Alt+S, Control+Option+S on Apple platforms) does: focus; a button also clicks. Override it in your control.'],
  ['addShortcut(chord, handler, options?)', '`() => void`', 'A shortcut active while focus is inside this control, removed when it is disposed. See Keyboard and focus.'],
];

const CONTAINER = [
  ['activeControl', '`Control | null`', 'read/write, reactive', 'The control inside that has (or last had) focus, as `document.activeElement` is for the page; a nested container counts as one. Setting it focuses that control.'],
  ['restoreFocus()', '`boolean`', 'method', 'Focus back to where it was the last time the container was active, else its active control, else the first in Tab order.'],
  ['cyclesTab', '`boolean`', 'protected getter', '`true` keeps Tab inside the container. `false` by default; `MxForm` returns `true` while shown as a modal window.'],
];

const PROTECTED = [
  ['static elementTag', 'The root element. `div` unless the subclass sets another (`button` for Button).'],
  ['focusElement', 'Getter: the element that takes focus; the root by default. Composite controls override it. It runs from the constructor, so derive it from `this.element`.'],
  ['observeProperty(name, apply)', 'Renders a property without an effect: `apply` runs now and on every change, from a getter prop or from code.'],
  ['getProperty(name) / setProperty(name, value)', 'The storage behind the shared properties, for your own: tracked read, and set-from-code (which replaces a bound getter).'],
  ['bindProperty(name, prop)', 'Binds one of your own props: a getter becomes one effect, a value is stored once. Call it from your constructor.'],
  ['hasModel / writeModel(value)', 'Two-way `x-model`: whether the control is bound, and writing a new value back to the bound state.'],
  ['applyProperty(name, value) / peekProperty(name)', 'Render your own properties without an effect: override `applyProperty` (call `super`); read the current value untracked with `peekProperty`. Can run from the constructor: touch only `this.element`.'],
  ['setAccessKey(key)', 'Declares the access key parsed from `&Text` (`parseAccessKey`): written to `aria-keyshortcuts` as `Alt+K`, which is how Alt+K finds the control.'],
  ['strings', 'The texts the control writes itself, from the app\'s `UiLocale` (DI) or the shared one. Reactive.'],
];

const DISABLED = [
  ['Native controls', '`button`, `input`, `select`, `textarea`, `fieldset`, `optgroup`, `option` get `disabled`: the browser blocks them and announces the state.'],
  ['Other focusable elements', 'Links, `[tabindex]`, `contenteditable`, `summary`, `iframe` get `tabindex="-1"` and `aria-disabled="true"`.'],
  ['Pointer input', '`pointerdown`, `mousedown`, `click`, `dblclick`, `auxclick` and `contextmenu` are swallowed inside the disabled control, before any handler.'],
  ['The control itself', 'Gets `data-disabled` for styling.'],
  ['Windows inside', 'A `<dialog>` (an `MxForm` window) opened inside a disabled control is not disabled: owned windows stay usable.'],
];

const COST = [
  ['A property nobody set, bound or read', 'Nothing: no storage, no DOM write, no effect.'],
  ['A plain value (`enabled={false}`, `new Button({ text })`)', 'Stored and written to the DOM once.'],
  ['A getter (`enabled={() => !state.busy}`)', 'One effect for that property, stopped when the control is disposed or the property is set from code.'],
  ['Reading a property', 'A small change counter, created the first time someone reads it.'],
  ['Setting from code', 'A direct DOM write; readers are notified through the counter.'],
  ['`enabled = false`', 'One pass over the control\'s subtree, plus one shared observer while anything is disabled (it disappears when nothing is).'],
];

function Page() {
  const s = reactive({ added: 0, panelEnabled: true });
  let target: DemoPanel | null = null;
  let codePanel: DemoPanel | null = null;

  const addFromCode = () => {
    const b = new Button({ text: `Button ${++s.added}` });
    b.motif.on('click', () => (b.text = `${b.text} ✓`));
    target?.controls.add(b);
  };

  return (
    <div>
      <Chrome root="../" active="control" />
      <main class="docs-main">
        <h1>Control</h1>
        <p class="lead">
          The base of every control in the package. It gives each one the same{' '}
          <code>text</code>, <code>enabled</code>, <code>visible</code> and <code>tabStop</code>, and the same focus
          methods, whether the control is written in JSX and bound to state or created with <code>new</code> and changed
          from code.
        </p>

        <Toc
          items={[
            ['import', 'Import'],
            ['ways', 'From JSX and from code'],
            ['rules', 'How a property gets its value'],
            ['enabled', 'Enabled'],
            ['visible', 'Visible and TabStop'],
            ['focus', 'Focus'],
            ['container', 'FocusContainer'],
            ['own', 'Writing a control'],
            ['cost', 'Performance'],
            ['api', 'API reference'],
            ['not-yet', 'Not yet'],
          ]}
        />

        <h2 id="import">Import</h2>
        <Code
          code={`
import { Control, type ControlProps } from '@motifx-community/ui';
`}
        />
        <p>
          You use it through the controls built on it (<a href="../button/index.html">Button</a>,{' '}
          <a href="../form/index.html">MxForm</a>, …), or extend it for your own.
        </p>

        <h2 id="ways">From JSX and from code</h2>
        <p>Both ways are complete; the developer using the control decides.</p>
        <Code
          code={`
// JSX, bound to state
<Button text="Save" enabled={() => !this.state.busy} />

// code: create, add anywhere, change later
const save = new Button({ text: 'Save' });
this.toolbar.controls.add(save);
save.enabled = false;
save.text = 'Saving…';
`}
        />
        <div class="demo">
          <Button onclick={addFromCode}>Add a button from code</Button>
          <DemoPanel class="docs-flow" ref={(p: DemoPanel) => (target = p)} />
        </div>

        <h2 id="rules">How a property gets its value</h2>
        <ul class="docs-list">
          <li>
            <Rich text="A prop is a value or a getter. A getter (`enabled={() => !state.busy}`) keeps the property in sync with the state." />
          </li>
          <li>
            <Rich text="Setting the property in code (`ctrl.enabled = false`) gives it a value of its own and drops the getter. From then on the code owns it." />
          </li>
          <li>
            <Rich text="Every property is reactive to read: `{() => ctrl.text}` in JSX or a `bindings.watch` follows it, whichever way it changed." />
          </li>
          <li>
            <Rich text="`x-wait` and `x-display` stay one-way: they show and hide from state, and nothing is written back. If the state must change when the control goes away, do it in `onDisposed`." />
          </li>
        </ul>

        <h2 id="enabled">Enabled</h2>
        <p>
          Disabling a control disables everything inside it — other controls and plain elements alike, as a disabled{' '}
          <code>&lt;fieldset&gt;</code> does for form fields —
          and enabling it puts every element back exactly as it was. An element that was disabled on its own stays
          disabled; content added while the control is disabled is disabled too; a change the app makes in the meantime
          (a bound <code>disabled</code>) is what gets restored. Disabled containers nest: an element stays disabled while
          any of them, or its own value, says so.
        </p>
        <ApiTable head={['What', 'What happens']} rows={DISABLED} />
        <p>
          If focus was inside, it moves to the next usable element in the same window (or the one before it) instead of
          falling to <code>&lt;body&gt;</code>.
        </p>
        <Code
          code={`
<CustomerPanel enabled={() => !this.model.saving} />

// or from code
this.customerPanel.enabled = false;
saveButton.enabled;   // true: its own value
saveButton.isEnabled; // false while it sits in the disabled panel
`}
        />
        <div class="demo demo--stack">
          <Button onclick={() => (codePanel!.enabled = !codePanel!.enabled)}>Toggle panel enabled</Button>
          <DemoPanel class="docs-flow docs-panel" ref={(p: DemoPanel) => (codePanel = p)}>
            <label>
              Name <input name="panel-name" />
            </label>
            <Button text="Inner button" />
            <a href="#enabled">A link</a>
          </DemoPanel>
        </div>

        <h2 id="visible">Visible and TabStop</h2>
        <p>
          <code>visible</code> uses core <code>hide()</code> / <code>show()</code>: a hidden control leaves the page and
          comes back in place, with its state. If focus was inside, it moves on first. <code>tabStop = false</code> only
          skips the control on Tab.
        </p>

        <h2 id="focus">Focus</h2>
        <Code
          code={`
if (!nameBox.focus()) saveButton.focus();
nameBox.canFocus;      // enabled, on the page, focusable
panel.focusWithin;   // focus is somewhere inside
`}
        />
        <p>
          Focus never falls to <code>&lt;body&gt;</code> because of a control: disabling, hiding, removing or disposing
          the focused part moves focus to the next usable element. Focus rings show only for keyboard use (
          <code>:focus-visible</code>). Tab order, access keys and shortcuts:{' '}
          <a href="../keyboard/index.html">Keyboard and focus</a>.
        </p>

        <h2 id="container">FocusContainer</h2>
        <p>
          A control that remembers which control inside it is active and is a scope for Tab. <code>MxForm</code> and{' '}
          <code>SplitContainer</code> are ones; tab pages and document windows will be. The outermost container of a page or window
          also runs the <code>tabIndex</code> order (see <a href="../keyboard/index.html">Keyboard and focus</a>).
        </p>
        <Code
          code={`
class CustomerEditor extends FocusContainer<HTMLDivElement> { … }

editor.activeControl;           // the control holding focus inside, reactive
editor.activeControl = nameBox; // focuses it
editor.restoreFocus();          // back to where focus was when it was last active
`}
        />
        <ApiTable head={['Member', 'Type', 'Kind', 'Description']} rows={CONTAINER} />

        <h2 id="own">Writing a control</h2>
        <p>
          Extend <code>Control</code>, set the root element, and render <code>text</code> (and your own properties) with{' '}
          <code>observeProperty</code>: no effect is created, the callback runs on every change.
        </p>
        <Code
          code={`
interface BadgeProps extends ControlProps {
  count?: Bind<number>;
}

class Badge extends Control<HTMLSpanElement, BadgeProps> {
  static override elementTag = 'span';

  constructor(props?: IBaseProp<BadgeProps>) {
    super(props);
    if (this.props.count !== undefined) this.bindProperty('count', this.props.count);
  }

  get count(): number { return this.getProperty<number>('count') ?? 0; }
  set count(value: number) { this.setProperty('count', value); }

  override onConfigured() {
    this.class.add('my-badge');
    this.observeProperty<string>('text', (t) => this.element.setAttribute('aria-label', t));
    this.observeProperty<number>('count', (n) => (this.element.textContent = String(n ?? 0)));
  }
}
`}
        />
        <ApiTable head={['Member', 'What it is']} rows={PROTECTED} />

        <h2 id="cost">Performance</h2>
        <p>The base adds no listeners per control and pays only for what is used.</p>
        <ApiTable head={['Case', 'Cost']} rows={COST} />

        <h2 id="api">API reference</h2>
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>Properties</h3>
        <ApiTable head={['Property', 'Type', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>Methods</h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />

        <h2 id="not-yet">Not yet</h2>
        <ul class="docs-list">
          <li>
            <Rich text="Arrow keys inside composite controls (one Tab stop, arrows inside): with the first composite control." />
          </li>
        </ul>
      </main>
    </div>
  );
}

Application.CreateBuilder().build().run('#app', <Page />);
