import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import AddProgrammatically from './examples/AddProgrammatically';
import EnabledPanel from './examples/EnabledPanel';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['text', '`Bind<string>`', "`''`", 'The control\'s text. Where it shows is up to the control: a button\'s caption, a form\'s title.'],
  ['enabled', '`Bind<boolean>`', '`true`', '`false` disables the control and everything inside it. See "Enabled".'],
  ['disabled', '`Bind<boolean>`', '`false`', 'The HTML-style inverse of `enabled`, for habit: `disabled={() => state.busy}`. Ignored when `enabled` is given.'],
  ['visible', '`Bind<boolean>`', '`true`', '`false` hides the control with core `hide()`; `true` shows it again with `show()`.'],
  ['tabStop', '`Bind<boolean>`', '`true`', '`false` takes the control out of the Tab order; a click or `focus()` still focuses it.'],
  ['tabIndex', '`Bind<number>`', '`0`', 'Order among the controls of the same container: Tab visits them in ascending order, ties in document order. Leave it unset where you can: document order is also the reading order of screen readers. See Keyboard and focus.'],
];

const PROPERTIES = [
  ['text', '`string`', 'read/write, reactive', 'Set programmatically with a value or a function, like the prop (see "How a property gets its value").'],
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
  ['cyclesTab', '`boolean`', 'protected getter', '`true` keeps Tab inside the container. `false` by default; a modal window returns `true`.'],
];

const PROTECTED = [
  ['static elementTag', 'The root element. `div` unless the subclass sets another (`button` for a button).'],
  ['focusElement', 'Getter: the element that takes focus; the root by default. Composite controls override it. It runs from the constructor, so derive it from `this.element`.'],
  ['observeProperty(name, apply)', 'Renders a property without an effect: `apply` runs now and on every change, from a getter prop or programmatically.'],
  ['getProperty(name) / setProperty(name, value)', 'The storage behind the shared properties, for your own: tracked read, and set-from-code (which replaces a bound getter).'],
  ['bindProperty(name, prop)', 'Binds one of your own props: a getter is read now and followed by a binding of the control (so `reState()` reads it again), a value is stored once. Call it from your constructor.'],
  ['applyProperty(name, value) / peekProperty(name)', 'Render your own properties without an effect: override `applyProperty` (call `super`); read the current value untracked with `peekProperty`. Can run from the constructor: touch only `this.element`.'],
  ['setAccessKey(key)', 'Declares the access key parsed from `&Text` (`parseAccessKey`): written to `aria-keyshortcuts` as `Alt+K`, which is how Alt+K finds the control.'],
];

const DISABLED = [
  ['Native controls', '`button`, `input`, `select`, `textarea`, `fieldset`, `optgroup`, `option` get `disabled`: the browser blocks them and announces the state.'],
  ['Other focusable elements', 'Links, `[tabindex]`, `contenteditable`, `summary`, `iframe` get `tabindex="-1"` and `aria-disabled="true"`.'],
  ['Pointer input', '`pointerdown`, `mousedown`, `click`, `dblclick`, `auxclick` and `contextmenu` are swallowed inside the disabled control, before any handler.'],
  ['The control itself', 'Gets `data-disabled` for styling.'],
  ['Windows inside', 'A `<dialog>` window opened inside a disabled control is not disabled: owned windows stay usable.'],
];

const COST = [
  ['A property nobody set, bound or read', 'Nothing: no storage, no DOM write, no binding.'],
  ['A plain value (`enabled={false}`, `new Badge({ text })`)', 'Stored and written to the DOM once.'],
  ['A getter (`enabled={() => !state.busy}`)', 'One binding for that property, stopped when the control is disposed or another value or function is set.'],
  ['Reading a property', 'A small change counter, created the first time someone reads it.'],
  ['Setting programmatically', 'A direct DOM write; readers are notified through the counter.'],
  ['`enabled = false`', 'One pass over the control\'s subtree, plus one shared observer while anything is disabled (it disappears when nothing is).'],
];

export default function ControlPage() {
  return (
    <>
      <p class="lead">
        <Rich text="The base of every control in the package. It gives each one the same `text`, `enabled`, `visible` and `tabStop`, and the same focus methods, whether the control is written in JSX and bound to state or created with `new` and changed programmatically." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Control, type ControlProps } from '@motifx-community/ui';
`}
        />
        <p>
          <Rich text="Every component of the package ([Button](/button), …) extends it; extend it for your own controls." />
        </p>
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="Both ways are complete; the developer using the control decides." />
        </p>
        <Code
          code={`
// JSX, bound to state
<Badge text="Unread" enabled={() => !this.state.busy} />

// code: create, add anywhere, change later
const unread = new Badge({ text: 'Unread' });
this.toolbar.controls.add(unread);
unread.enabled = false;
unread.text = 'Unread mail';
unread.text = () => \`Unread (\${this.mail.count})\`; // a function is followed
`}
        />
        <p>
          <Rich text="`Badge` is the control written in [Writing a control](#own)." />
        </p>
        <Example files={code('AddProgrammatically.tsx')}>
          <AddProgrammatically />
        </Example>
      </Section>

      <Section anchor="rules" title="How a property gets its value">
        <ul class="docs-list">
          <li>
            <Rich text="A prop is a value or a function. A function of a reactive object (`enabled={() => !state.busy}`) keeps the property in step with it; this is how MotifJS keeps a prop live." />
          </li>
          <li>
            <Rich text="Your data is used as you give it: the control never makes it reactive, never copies or changes it. Over plain data the function is read again when you call `reState()` on the control or on anything it sits in; you choose which kind of data to give." />
          </li>
          <li>
            <Rich text="With `x-model` the model always shows the control's state: a change by the user, by your code (`ctrl.value = …`, `select()`, `show()`) or by a rule you gave (`decimals`, a mask, `min` / `max`) is written back to it." />
          </li>
          <li>
            <Rich text="A property set programmatically takes the same: a function (`ctrl.enabled = () => !state.busy`) is bound in place of what was there and followed; a value (`ctrl.enabled = false`) drops what was bound, and from then on the code owns it." />
          </li>
          <li>
            <Rich text="Every property is reactive to read: `{() => ctrl.text}` in JSX or a `bindings.watch` follows it, whichever way it changed." />
          </li>
          <li>
            <Rich text="`x-wait` and `x-display` stay one-way: they show and hide from state, and nothing is written back. If the state must change when the control goes away, do it in `onDisposed`." />
          </li>
        </ul>
      </Section>

      <Section anchor="enabled" title="Enabled">
        <p>
          <Rich text="Disabling a control disables everything inside it — other controls and plain elements alike, as a disabled `<fieldset>` does for form fields — and enabling it puts every element back exactly as it was. An element that was disabled on its own stays disabled; content added while the control is disabled is disabled too; a change the app makes in the meantime (a bound `disabled`) is what gets restored. Disabled containers nest: an element stays disabled while any of them, or its own value, says so." />
        </p>
        <ApiTable head={['What', 'What happens']} rows={DISABLED} />
        <p>
          <Rich text="If focus was inside, it moves to the next usable element in the same window (or the one before it) instead of falling to `<body>`." />
        </p>
        <Example files={code('EnabledPanel.tsx')} stack>
          <EnabledPanel />
        </Example>
      </Section>

      <Section anchor="visible" title="Visible and TabStop">
        <p>
          <Rich text="`visible` uses core `hide()` / `show()`: a hidden control leaves the page and comes back in place, with its state. If focus was inside, it moves on first. `tabStop = false` only skips the control on Tab." />
        </p>
      </Section>

      <Section anchor="focus" title="Focus">
        <Code
          code={`
if (!nameBox.focus()) saveButton.focus();
nameBox.canFocus;      // enabled, on the page, focusable
panel.focusWithin;   // focus is somewhere inside
`}
        />
        <p>
          <Rich text="Focus never falls to `<body>` because of a control: disabling, hiding, removing or disposing the focused part moves focus to the next usable element. Focus rings show only for keyboard use (`:focus-visible`). Tab order, access keys and shortcuts: [Keyboard and focus](/keyboard)." />
        </p>
      </Section>

      <Section anchor="container" title="FocusContainer">
        <p>
          <Rich text="A control that remembers which control inside it is active and is a scope for Tab; the package's windows, tab pages and document views will be ones. The outermost container of a page or window also runs the `tabIndex` order (see [Keyboard and focus](/keyboard))." />
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
      </Section>

      <Section anchor="own" title="Writing a control">
        <p>
          <Rich text="Extend `Control`, set the root element, and render `text` (and your own properties) with `observeProperty`: no effect is created, the callback runs on every change." />
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
      </Section>

      <Section anchor="cost" title="Performance">
        <p>
          <Rich text="The base adds no listeners per control and pays only for what is used." />
        </p>
        <ApiTable head={['Case', 'Cost']} rows={COST} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="Props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>
          <Rich text="Properties" />
        </h3>
        <ApiTable head={['Property', 'Type', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>
          <Rich text="Methods" />
        </h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
      </Section>

      <Section anchor="not-yet" title="Not yet">
        <ul class="docs-list">
          <li>
            <Rich text="Arrow keys inside composite controls (one Tab stop, arrows inside): with the first composite control." />
          </li>
        </ul>
      </Section>
    </>
  );
}
