# Control

> Foundations · @motifx-community/ui 0.1.0-beta.8

`Control` is the base class of every control in the package. It provides the same `text`, `enabled`, `visible` and `tabStop` properties and the same focus methods, whether a control is declared in JSX and bound to state or created with `new` and changed programmatically.

## Import

```tsx
import { Control, type ControlProps } from '@motifx-community/ui';
```

Every component in the package ([Button](button.md), …) derives from it. Derive from it for your own controls as well.

## Declarative and programmatic

Both approaches are fully supported, so the choice is up to you.

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

`Badge` is the control built in [Writing a control](#own).

```tsx
import { Button, Stack } from '@motifx-community/ui';

/** Buttons created with `new`, added to a container, and their text changed programmatically on a click. */
export default function AddProgrammatically() {
  let added = 0;
  let target: Stack | null = null;

  const addProgrammatic = () => {
    const b = new Button({ text: `Button ${++added}` });
    b.motif.on('click', () => (b.text = `${b.text} ✓`));
    target?.controls.add(b);
  };

  return (
    <>
      <Button text="Add a button programmatically" onclick={addProgrammatic} />
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (target = c)} />
    </>
  );
}
```

## How a property gets its value

- A prop accepts a value or a function. A function that reads a reactive object (`enabled={() => !state.busy}`) keeps the property in sync with that object. This is how MotifJS keeps a prop live.

- The control uses your data exactly as you provide it. It never makes the data reactive, and it never copies or modifies it. With plain data, the function is read again when you call `reState()` on the control or on one of its ancestors, so you decide which kind of data to use.

- With `x-model`, the model always reflects the state of the control. Changes made by the user, by your code (`ctrl.value = …`, `select()`, `show()`) or by a rule you set (`decimals`, a mask, `min` / `max`) are all written back to the model.

- Setting a property programmatically works the same way. A function (`ctrl.enabled = () => !state.busy`) replaces the existing binding and is tracked. A value (`ctrl.enabled = false`) removes the binding, and your code owns the property from then on.

- Every property is reactive when read. `{() => ctrl.text}` in JSX or a `bindings.watch` tracks it no matter how it changes.

- `x-wait` and `x-display` remain one-way: they show and hide the element based on state, and nothing is written back. If state must change when the control is removed, do it in `onDisposed`.

## Enabled

Disabling a control disables everything inside it, including child controls and plain elements, just as a disabled `<fieldset>` does for form fields. Enabling it restores every element to its previous state. An element that was disabled on its own stays disabled, and content added while the control is disabled is disabled too. Any change the application makes in the meantime, such as a bound `disabled`, is what gets restored. Disabled containers can be nested: an element stays disabled as long as any container, or its own value, says so.

| Item | Result |
| --- | --- |
| `Native controls` | `button`, `input`, `select`, `textarea`, `fieldset`, `optgroup` and `option` receive `disabled`, so the browser blocks them and announces the state. |
| `Other focusable elements` | Links, `[tabindex]`, `contenteditable`, `summary` and `iframe` receive `tabindex="-1"` and `aria-disabled="true"`. |
| `Pointer input` | `pointerdown`, `mousedown`, `click`, `dblclick`, `auxclick` and `contextmenu` events are suppressed inside the disabled control before they reach any handler. |
| `The control itself` | The control receives `data-disabled` for styling. |
| `Windows inside` | A `<dialog>` window opened inside a disabled control is not disabled. Owned windows remain usable. |

If focus was inside the control, it moves to the next usable element in the same window, or to the previous one, instead of falling to `<body>`.

```tsx
import { Button, Panel, Stack } from '@motifx-community/ui';

/** A panel disabled and enabled programmatically: everything inside follows, and the inner button keeps its own `enabled`. */
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

`visible` uses the core `hide()` and `show()` methods. A hidden control leaves the page and later returns to the same place with its state intact. If focus was inside, it moves elsewhere first. `tabStop = false` only removes the control from the Tab sequence.

## Focus

```tsx
if (!nameBox.focus()) saveButton.focus();
nameBox.canFocus;      // enabled, on the page, focusable
panel.focusWithin;   // focus is somewhere inside
```

A control never causes focus to fall to `<body>`. Disabling, hiding, removing or disposing the focused part moves focus to the next usable element. Focus rings appear only during keyboard use (`:focus-visible`). For Tab order, access keys and shortcuts, see [Keyboard and focus](keyboard.md).

## FocusContainer

A control that tracks which of its children is active and acts as a scope for Tab. The package's windows, tab pages and document views use it. The outermost container of a page or window also applies the `tabIndex` order (see [Keyboard and focus](keyboard.md)).

```tsx
class CustomerEditor extends FocusContainer<HTMLDivElement> { … }

editor.activeControl;           // the control holding focus inside, reactive
editor.activeControl = nameBox; // focuses it
editor.restoreFocus();          // back to where focus was when it was last active
```

| Member | Type | Type | Description |
| --- | --- | --- | --- |
| `activeControl` | `Control \| null` | read/write, reactive | The child control that has focus, or last had it. It works like `document.activeElement` does for the page, and a nested container counts as one control. Setting it moves focus to that control. |
| `restoreFocus()` | `boolean` | method | Returns focus to where it was the last time the container was active. If that is not possible, it moves to the active control, and then to the first control in Tab order. |
| `cyclesTab` | `boolean` | protected getter | `true` keeps Tab inside the container. The default is `false`, and a modal window returns `true`. |

## Writing a control

Derive from `Control`, set the root element, and render `text` and your own properties with `observeProperty`. No effect is created, and the callback runs on every change.

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

| Member | Description |
| --- | --- |
| `static elementTag` | The root element. It is a `div` unless the subclass specifies another element (`button` for a button). |
| `focusPart` | Getter for the part that receives focus, as a component. It is the control itself by default, or `null` when the control takes no focus. Composite controls override it, and a child control given here answers `focus`, `canFocus` and `focused`. It runs from the constructor, so derive it from parts created on demand. |
| `observeProperty(name, apply)` | Renders a property without an effect. `apply` runs immediately and on every change, whether the change comes from a getter prop or from code. |
| `getProperty(name) / setProperty(name, value)` | The storage behind the shared properties, available for your own: a tracked read, and a programmatic set that replaces any bound getter. |
| `bindProperty(name, prop)` | Binds one of your own props. A getter is read immediately and tracked by a binding on the control, so `reState()` reads it again. A value is stored once. Call it from your constructor. |
| `applyProperty(name, value) / peekProperty(name)` | Renders your own properties without an effect. Override `applyProperty` and call `super`, and read the current value without tracking through `peekProperty`. This method can run from the constructor, so touch only `this.element`. |
| `setAccessKey(key)` | Declares the access key parsed from `&Text` (`parseAccessKey`). It is written to `aria-keyshortcuts` as `Alt+K`, which is how Alt+K finds the control. |

## Performance

The base class adds no per-control listeners, and you pay only for what you use.

| Case | Cost |
| --- | --- |
| `A property nobody set, bound or read` | No cost: no storage, no DOM write and no binding. |
| `A plain value (`enabled={false}`, `new Badge({ text })`)` | Stored and written to the DOM once. |
| `A getter (`enabled={() => !state.busy}`)` | One binding for the property, stopped when the control is disposed or another value or function is set. |
| `Reading a property` | A small change counter, created the first time the property is read. |
| `Setting programmatically` | A direct DOM write. Readers are notified through the counter. |
| ``enabled = false`` | One pass over the control's subtree, plus one shared observer while anything is disabled. The observer is removed when nothing is disabled. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `Bind<string>` | `''` | The text of the control. Where it appears depends on the control, for example a button's caption or a form's title. |
| `enabled` | `Bind<boolean>` | `true` | `false` disables the control and everything inside it. See "Enabled". |
| `disabled` | `Bind<boolean>` | `false` | The HTML-style inverse of `enabled`, provided for familiarity: `disabled={() => state.busy}`. It is ignored when `enabled` is set. |
| `visible` | `Bind<boolean>` | `true` | `false` hides the control with the core `hide()` method. `true` shows it again with `show()`. |
| `tabStop` | `Bind<boolean>` | `true` | `false` removes the control from the Tab order. A click or `focus()` still gives it focus. |
| `tabIndex` | `Bind<number>` | `0` | The order among controls in the same container. Tab visits them in ascending order, and ties follow document order. Leave it unset where you can, because document order is also the reading order for screen readers. See Keyboard and focus. |

### Properties

| Property | Type | Access | Description |
| --- | --- | --- | --- |
| `text` | `string` | read/write, reactive | Set programmatically with a value or a function, the same as the prop (see "How a property gets its value"). |
| `enabled` | `boolean` | read/write, reactive | The control's own value, as set or bound. This matches the HTML `disabled` attribute. |
| `isEnabled` | `boolean` | read-only, reactive | Indicates whether the control can be used now, meaning that it and all its ancestors are enabled. This matches CSS `:enabled`. Windows shown inside it do not inherit the state. |
| `visible` | `boolean` | read/write, reactive | The control's own value. A hidden parent does not change it. |
| `disabled` | `boolean` | read/write, reactive | `!enabled`. |
| `tabIndex` | `number` | read/write, reactive | The position in its container's Tab order. |
| `tabStop` | `boolean` | read/write, reactive | Writes `tabindex="-1"` on the focus element while `false`, and restores the element's own `tabindex` afterward. |
| `parentControl` | `Control \| null` | read-only | The nearest ancestor that is a `Control`, without crossing a window. |
| `canFocus` | `boolean` | read-only | Indicates that the control is enabled, on the page and focusable right now. |
| `focused` | `boolean` | read-only | Indicates that the focus element has focus. This is a DOM query and is not reactive. |
| `focusWithin` | `boolean` | read-only | Indicates that focus is on the control or inside it. This is a DOM query and is not reactive. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `focus()` | `boolean` | Sets focus on the control. Returns `false` if it cannot receive focus (`canFocus`). |
| `onAccessKey()` | `boolean` | Defines what the access key does (`&Save` → Alt+S, or Control+Option+S on Apple platforms). By default it sets focus, and a button also clicks. Override it in your own control. |
| `addShortcut(chord, handler, options?)` | `() => void` | A shortcut that is active while focus is inside this control and is removed when the control is disposed. See Keyboard and focus. |

## Not yet available

- Arrow key navigation inside composite controls (one Tab stop with arrow keys inside) arrives with the first composite control.

## Feedback

Loading issues…
