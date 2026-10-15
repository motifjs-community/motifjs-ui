# Changelog

All notable changes to this package are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the package uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### design system

- The look comes from `@motifx-community/design-system` (a peer dependency): its primitive,
  semantic and density tokens, the three themes (`[data-theme]`, `prefers-color-scheme` by
  default), `[data-density="compact"]`, the fonts, the reset, the typography ramp, the focus ring
  and the reduced-motion / reduced-transparency / forced-colors overrides. `styles.css` imports
  the design system's stylesheet first. This package defines no color, size, font or motion value
  of its own and never redefines a design-system token.
- Component tokens (`button.*`, `form.*`, `groupbox.*`, `split.*`): DTCG 2025.10 JSON in
  `tokens/component/`, one fine-tuning knob per component, each referencing a design-system token
  (or a literal size only that component has). Built with Style Dictionary against the design
  system's source — a reference to a token that does not exist, or a `$type` mismatch, fails the
  build — and written as `--mx-<component>-*` inside `@layer mx.components`, after the design
  system's layers. Title bars read `color.bg.bar` and `bar.height` (density-aware), the form
  footer `color.bg.layer`, the close button's hover the danger colors.
- `./tokens`: `cssVar` / `cssProperty` over the design system's token names plus the component
  token names (`TokenName`), and the `componentTokens` map.
- Tests check that the generated files match the source, that every kit CSS file sits in
  `@layer mx.components` and that every `var(--mx-…)` it uses is a design-system or component
  token; `npm run lint:css` runs the design system's shared stylelint config.

### components

- `Control`: the base of every control. `text`, `enabled` (alias `disabled`), `visible`,
  `tabStop` and `tabIndex` work the same as props (value or getter) and as properties set from
  code; a value set in code replaces a bound getter; every property is reactive to read.
  `enabled` is the control's own value (like the HTML attribute), `isEnabled` whether it can be
  used now (like CSS `:enabled`). `enabled = false` disables the whole subtree (native
  `disabled`, otherwise `tabindex="-1"` + `aria-disabled`, pointer input swallowed), restores it
  exactly, nests, follows content added later, and leaves windows opened inside usable. Hiding or
  disabling the focused part moves focus on instead of dropping it to `<body>`. `focus()`,
  `canFocus`, `focused`, `focusWithin`, `parentControl`, `onAccessKey()`, `addShortcut()`.
  Layout props on every control: `dock`, `left` / `top` / `right` / `bottom`, `width` /
  `height`, `row` / `column` / `rowSpan` / `columnSpan` (1-based, as CSS grid lines). Subclass
  API: `applyProperty` / `peekProperty`, `observeProperty`, `getProperty` / `setProperty` /
  `bindProperty`, `focusElement`, `hasModel` / `writeModel` (two-way `x-model`), `strings`.
  Untouched properties cost nothing; only getter props create effects; state is kept off class
  fields so `ref` callbacks (called by core before fields exist) stick.
- `FocusContainer`: remembers the active control inside (`activeControl`, reactive and
  assignable; `restoreFocus()`) and is a scope for Tab: the outermost one runs `tabIndex` order
  per level of the control tree (ties in document order, one radio per group) and leaves Tab to
  the browser until a control sets a `tabIndex`; `cyclesTab` keeps Tab inside a modal window.
- Keyboard: `&Text` access keys (`parseAccessKey`): Alt + key, Control + Option + key on Apple
  platforms (where Option types characters), written to `aria-keyshortcuts`. The key is
  underlined while the modifiers are held, after an Alt tap (kept from the browser menu while the
  page has access keys), or always with `data-mx-access-keys="always"`; AltGr is ignored; scope
  is the modal form, else the focused window, else the page; shared keys cycle focus; disabled
  controls do not take the key; plain elements take part via `aria-keyshortcuts`.
  `addShortcut(chord, handler, { scope, inEditable })` and `control.addShortcut` (most specific
  scope first, silent across a modal form, plain keys left to text fields and windows). One
  capture listener for the document.
- Focus guard: focus inside a Control never falls to `<body>` when it is removed, disposed or
  hidden; it moves to the next usable element from that spot.
- Layout: `Panel` (padding as token step or free CSS; `scrollable`, a Tab stop so it can be
  scrolled by keyboard; docking: `dock` top / bottom / start / end / fill / float on any child,
  `start` / `end` following the reading direction, document order, CSS grid, no script on
  resize), `Stack` (vertical / horizontal flex line, `gap`, `align`, `justify`, `wrap`), `Grid`
  (`rows` / `columns` as CSS tracks or pixels, with `*` / `2*` as a shrinkable-share shorthand;
  children by `row` / `column` / spans), `GroupBox` (`<fieldset>` + `<legend>`, access key focuses
  its first field, docks like a Panel, `controls.add` goes inside the frame), `SplitContainer`
  (`orientation` as in Stack, `position`, `fixedPanel`, `firstMinSize` / `secondMinSize`,
  `collapsed`, `resizable`, `step`, `splitterSize`; pointer and keyboard with a localized
  `separator`; RTL aware; `first` / `second` are `SplitPanel`s).
- `Label`: a `<label>` with the type ramp (`textStyle`) and theme `tone`s, inheriting font and
  color when unset. `target` (control, element or id) makes it the target's accessible name
  (`for`, or `aria-labelledby` for non-labelable elements); a click focuses the target and the
  access key moves focus there without clicking. Without a target it names the field inside it.
  `accessKeys`, `textAlign`, `verticalAlign`, `ellipsis` and `maxLines` (full text as a tooltip
  on hover). Labels inside a disabled control dim.
- `Button`: standard / accent / danger, outline and ghost buttons with reactive `variant` /
  `size` / `tone` props exposed as `data-*` attributes; built on `Control`. Static look props
  create no effects. Solid buttons are pressable the way the design system describes: opaque fill,
  bottom edge (`control.edge.width`, `color.stroke.control.edge`), inner top highlight
  (`color.highlight.control`), press offset on `:active`; the focus ring keeps its inner ring.
- `MxForm`: a form (title bar, close/maximize/minimize caption buttons, content area) shown when
  needed. `show(host, disposeRef?)` opens it as a modeless window, `showDialog(host,
  disposeRef?)` as a modal one that resolves with a `FormResult` (`'ok'`, `'cancel'`, any string,
  like `dialog.returnValue`); `host` is any component or the `Application`. It dies when it
  closes, or when `host` or `disposeRef` is disposed while it is open. Content from a subclass
  `view()`, the `content` prop or JSX children; cancelable async `onClosing` (reason `'code'`,
  `'user'` or `'owner'`), `onClosed`, `defaultButton` / `cancelButton` (props or assignable from a
  subclass), `data-result` buttons, nested dialogs, window order, dragging and edge resizing
  (`resizable`). A modal form closes on Escape by default (`closeOnEscape`), keeps Tab inside and
  cannot be minimized; Tab moves on from a modeless window to the page. In JSX,
  `x-model={() => state.open}` binds it two-way (the form writes `false` back when the user closes
  it and keeps its state between openings; `modal` picks dialog or window). Minimize collapses a
  window to its title bar, or moves it into `minimizeTarget`. Events inside a window stop at the
  window's root. `form.*` tokens.
- `src/core/`: `FormResult`, `CloseReason`, the reactive `UiLocale` for component texts (en, tr),
  focus helpers, the page-wide window stack and the scroll lock.
- Base styles of the kit: only the aria-disabled dimming inside a disabled control and the
  access-key underline, inside `@layer mx.components`; everything else comes from the design system.

### entries

- `.` (components and core exports), `./tokens`, `./styles.css`. The per-theme files are the
  design system's (`@motifx-community/design-system/themes/*.css`).

### docs

- A full reference page per component (usage both ways, behaviour, keyboard, accessibility,
  localization, API tables, styling hooks, tokens) and a token reference: the component tokens,
  and the design system's layers for reference (from its `json/*` export). The theme and density
  switches use the design system's `setTheme` / `setDensity`.
