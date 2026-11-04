# Control

> Foundations · @motifx-community/ui 0.1.0-beta.1

The base of every control in the package. It gives each one the same `text`, `enabled`, `visible` and `tabStop`, and the same focus methods, whether the control is written in JSX and bound to state or created with `new` and changed from code.

## Import

```tsx
import { Control, type ControlProps } from '@motifx-community/ui';
```

Every component of the package ([Button](button.md), …) extends it; extend it for your own controls.

## From JSX and from code

Both ways are complete; the developer using the control decides.

```tsx
// JSX, bound to state
<Badge text="Unread" enabled={() => !this.state.busy} />

// code: create, add anywhere, change later
const unread = new Badge({ text: 'Unread' });
this.toolbar.controls.add(unread);
unread.enabled = false;
unread.text = 'Unread mail';
unread.text = () => `Unread (${this.mail.count})`; // a function is followed
```

`Badge` is the control written in [Writing a control](#own).

```tsx
import { Button, Stack } from '@motifx-community/ui';

/** Buttons created with `new`, added to a container, and their text changed from code on a click. */
export default function AddFromCode() {
  let added = 0;
  let target: Stack | null = null;

  const addFromCode = () => {
    const b = new Button({ text: `Button ${++added}` });
    b.motif.on('click', () => (b.text = `${b.text} ✓`));
    target?.controls.add(b);
  };

  return (
    <>
      <Button text="Add a button from code" onclick={addFromCode} />
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (target = c)} />
    </>
  );
}
```

## How a property gets its value

- A prop is a value or a function. A function of a reactive object (`enabled={() => !state.busy}`) keeps the property in step with it; this is how MotifJS keeps a prop live.

- Your data is used as you give it: the control never makes it reactive, never copies or changes it. Over plain data the function is read again when you call `reState()` on the control or on anything it sits in; you choose which kind of data to give.

- With `x-model` the model always shows the control's state: a change by the user, by your code (`ctrl.value = …`, `select()`, `show()`) or by a rule you gave (`decimals`, a mask, `min` / `max`) is written back to it.

- A property set from code takes the same: a function (`ctrl.enabled = () => !state.busy`) is bound in place of what was there and followed; a value (`ctrl.enabled = false`) drops what was bound, and from then on the code owns it.

- Every property is reactive to read: `{() => ctrl.text}` in JSX or a `bindings.watch` follows it, whichever way it changed.

- `x-wait` and `x-display` stay one-way: they show and hide from state, and nothing is written back. If the state must change when the control goes away, do it in `onDisposed`.

## Enabled

Disabling a control disables everything inside it — other controls and plain elements alike, as a disabled `<fieldset>` does for form fields — and enabling it puts every element back exactly as it was. An element that was disabled on its own stays disabled; content added while the control is disabled is disabled too; a change the app makes in the meantime (a bound `disabled`) is what gets restored. Disabled containers nest: an element stays disabled while any of them, or its own value, says so.

| What | What happens |
| --- | --- |
| `Native controls` | `button`, `input`, `select`, `textarea`, `fieldset`, `optgroup`, `option` get `disabled`: the browser blocks them and announces the state. |
| `Other focusable elements` | Links, `[tabindex]`, `contenteditable`, `summary`, `iframe` get `tabindex="-1"` and `aria-disabled="true"`. |
| `Pointer input` | `pointerdown`, `mousedown`, `click`, `dblclick`, `auxclick` and `contextmenu` are swallowed inside the disabled control, before any handler. |
| `The control itself` | Gets `data-disabled` for styling. |
| `Windows inside` | A `<dialog>` window opened inside a disabled control is not disabled: owned windows stay usable. |

If focus was inside, it moves to the next usable element in the same window (or the one before it) instead of falling to `<body>`.

```tsx
import { Button, Panel, Stack } from '@motifx-community/ui';

/** A panel disabled and enabled from code: everything inside follows, and the inner button keeps its own `enabled`. */
export default function EnabledPanel() {
  let panel: Panel | null = null;
  let inner: Button | null = null;

  return (
    <>
      <Button text="Toggle panel enabled" onclick={() => (panel!.enabled = !panel!.enabled)} />
      <Panel variant="outline" padding="md" class="ctl-panel" ref={(p: Panel) => (panel = p)}>
        <Stack orientation="horizontal" wrap align="center">
          <label>
            Name <input name="panel-name" />
          </label>
          <Button text="Inner button" ref={(b: Button) => (inner = b)} />
          <a href="#enabled">A link</a>
        </Stack>
      </Panel>
      <output>{() => (inner ? `Inner button: enabled ${inner.enabled}, isEnabled ${inner.isEnabled}` : '')}</output>
    </>
  );
}
```

## Visible and TabStop

`visible` uses core `hide()` / `show()`: a hidden control leaves the page and comes back in place, with its state. If focus was inside, it moves on first. `tabStop = false` only skips the control on Tab.

## Focus

```tsx
if (!nameBox.focus()) saveButton.focus();
nameBox.canFocus;      // enabled, on the page, focusable
panel.focusWithin;   // focus is somewhere inside
```

Focus never falls to `<body>` because of a control: disabling, hiding, removing or disposing the focused part moves focus to the next usable element. Focus rings show only for keyboard use (`:focus-visible`). Tab order, access keys and shortcuts: [Keyboard and focus](keyboard.md).

## FocusContainer

A control that remembers which control inside it is active and is a scope for Tab; the package's windows, tab pages and document views will be ones. The outermost container of a page or window also runs the `tabIndex` order (see [Keyboard and focus](keyboard.md)).

```tsx
class CustomerEditor extends FocusContainer<HTMLDivElement> { … }

editor.activeControl;           // the control holding focus inside, reactive
editor.activeControl = nameBox; // focuses it
editor.restoreFocus();          // back to where focus was when it was last active
```

| Member | Type | Kind | Description |
| --- | --- | --- | --- |
| `activeControl` | `Control \| null` | read/write, reactive | The control inside that has (or last had) focus, as `document.activeElement` is for the page; a nested container counts as one. Setting it focuses that control. |
| `restoreFocus()` | `boolean` | method | Focus back to where it was the last time the container was active, else its active control, else the first in Tab order. |
| `cyclesTab` | `boolean` | protected getter | `true` keeps Tab inside the container. `false` by default; a modal window returns `true`. |

## Writing a control

Extend `Control`, set the root element, and render `text` (and your own properties) with `observeProperty`: no effect is created, the callback runs on every change.

```tsx
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
```

| Member | What it is |
| --- | --- |
| `static elementTag` | The root element. `div` unless the subclass sets another (`button` for a button). |
| `focusElement` | Getter: the element that takes focus; the root by default. Composite controls override it. It runs from the constructor, so derive it from `this.element`. |
| `observeProperty(name, apply)` | Renders a property without an effect: `apply` runs now and on every change, from a getter prop or from code. |
| `getProperty(name) / setProperty(name, value)` | The storage behind the shared properties, for your own: tracked read, and set-from-code (which replaces a bound getter). |
| `bindProperty(name, prop)` | Binds one of your own props: a getter is read now and followed by a binding of the control (so `reState()` reads it again), a value is stored once. Call it from your constructor. |
| `applyProperty(name, value) / peekProperty(name)` | Render your own properties without an effect: override `applyProperty` (call `super`); read the current value untracked with `peekProperty`. Can run from the constructor: touch only `this.element`. |
| `setAccessKey(key)` | Declares the access key parsed from `&Text` (`parseAccessKey`): written to `aria-keyshortcuts` as `Alt+K`, which is how Alt+K finds the control. |

## Performance

The base adds no listeners per control and pays only for what is used.

| Case | Cost |
| --- | --- |
| `A property nobody set, bound or read` | Nothing: no storage, no DOM write, no binding. |
| `A plain value (`enabled={false}`, `new Badge({ text })`)` | Stored and written to the DOM once. |
| `A getter (`enabled={() => !state.busy}`)` | One binding for that property, stopped when the control is disposed or another value or function is set. |
| `Reading a property` | A small change counter, created the first time someone reads it. |
| `Setting from code` | A direct DOM write; readers are notified through the counter. |
| ``enabled = false`` | One pass over the control's subtree, plus one shared observer while anything is disabled (it disappears when nothing is). |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `Bind<string>` | `''` | The control's text. Where it shows is up to the control: a button's caption, a form's title. |
| `enabled` | `Bind<boolean>` | `true` | `false` disables the control and everything inside it. See "Enabled". |
| `disabled` | `Bind<boolean>` | `false` | The HTML-style inverse of `enabled`, for habit: `disabled={() => state.busy}`. Ignored when `enabled` is given. |
| `visible` | `Bind<boolean>` | `true` | `false` hides the control with core `hide()`; `true` shows it again with `show()`. |
| `tabStop` | `Bind<boolean>` | `true` | `false` takes the control out of the Tab order; a click or `focus()` still focuses it. |
| `tabIndex` | `Bind<number>` | `0` | Order among the controls of the same container: Tab visits them in ascending order, ties in document order. Leave it unset where you can: document order is also the reading order of screen readers. See Keyboard and focus. |

### Properties

| Property | Type | Access | Description |
| --- | --- | --- | --- |
| `text` | `string` | read/write, reactive | Set from code with a value or a function, like the prop (see "How a property gets its value"). |
| `enabled` | `boolean` | read/write, reactive | This control's own value, as set or bound (like the HTML `disabled` attribute). |
| `isEnabled` | `boolean` | read-only, reactive | Whether it can be used now: enabled itself and in every control it sits in (like CSS `:enabled`). Windows shown inside do not inherit it. |
| `visible` | `boolean` | read/write, reactive | This control's own value; a hidden parent does not change it. |
| `disabled` | `boolean` | read/write, reactive | `!enabled`. |
| `tabIndex` | `number` | read/write, reactive | Position in the Tab order of its container. |
| `tabStop` | `boolean` | read/write, reactive | Writes `tabindex="-1"` on the focus element while `false`, and puts back the element's own `tabindex` afterwards. |
| `parentControl` | `Control \| null` | read-only | The nearest ancestor that is a `Control`, not crossing a window. |
| `canFocus` | `boolean` | read-only | Enabled, on the page and focusable right now. |
| `focused` | `boolean` | read-only | Its focus element has focus. A DOM query, not reactive. |
| `focusWithin` | `boolean` | read-only | Focus is on it or anything inside it. A DOM query, not reactive. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `focus()` | `boolean` | Focuses the control; `false` when it cannot take focus (`canFocus`). |
| `onAccessKey()` | `boolean` | What its access key (`&Save` → Alt+S, Control+Option+S on Apple platforms) does: focus; a button also clicks. Override it in your control. |
| `addShortcut(chord, handler, options?)` | `() => void` | A shortcut active while focus is inside this control, removed when it is disposed. See Keyboard and focus. |

## Not yet

- Arrow keys inside composite controls (one Tab stop, arrows inside): with the first composite control.
