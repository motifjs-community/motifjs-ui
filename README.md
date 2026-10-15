# @motifx-community/ui

UI components for **MotifJS** (`@motifx/core`) that work the way desktop UI does: a component is an
object you create when you need it, show anywhere, and close like a window — or write in JSX and
bind to state. Everything is drawn from the [MotifJS design system](https://github.com/motifjs-community/motifjs-design-system)
(`@motifx-community/design-system`): its tokens, themes, density, fonts and user-preference
overrides. This package adds the components and their component tokens, nothing else.

> **Status:** early. Components are built one at a time; today: `MxForm` and `Button`, on the `Control` base. Not yet
> published to npm.

## Install

```sh
npm i @motifx/core @motifx-community/design-system @motifx-community/ui
```

```tsx
import '@motifx-community/ui/styles.css'; // imports the design system first, then the components
import { Button, MxForm, type FormResult } from '@motifx-community/ui';
```

`styles.css` begins with `@import '@motifx-community/design-system/styles.css'`, which a bundler
(Vite, the MotifJS default) resolves. Without a bundler, link the design system's stylesheet first and
this one after it.

## 30 seconds

```tsx
class ConfirmForm extends MxForm {
  view() {
    return (
      <>
        <p>Delete this record?</p>
        <footer>
          <Button tone="danger" data-result="yes">Delete</Button>
          <Button data-result="no" ref={(b) => (this.cancelButton = b)}>Cancel</Button>
        </footer>
      </>
    );
  }
}

// on a click — nothing declared in a template beforehand:
const answer = await new ConfirmForm({ text: 'Delete' }).showDialog(this);
if (answer === 'yes') this.model.delete();
```

The same form can open modeless (`show`), follow a state two-way (`<ConfirmForm modal
x-model={() => this.state.confirming} />`) or sit embedded in a page. It dies when it closes, or
with the component that owns it.

## Components

| Component | What it is | Docs |
| --- | --- | --- |
| `Control` | The base of every control: `text`, `enabled` / `isEnabled`, `visible`, `tabStop` and focus, the same from JSX and from code | `apps/docs/control` |
| `Label` | Text that names a control: accessible name, click and `&` access key go to its `target`; the type ramp and tones; ellipsis / max lines | `apps/docs/label` |
| `Panel` | Container with padding (token steps or free CSS), own scrolling and docking (top / bottom / start / end / fill / float) | `apps/docs/panel` |
| `Stack` | One line of children, vertical or horizontal, with a gap | `apps/docs/stack` |
| `Grid` | Sized rows and columns (`auto, 1fr, 2fr, 120`), children by `row` / `column` | `apps/docs/grid` |
| `GroupBox` | Titled frame (`<fieldset>`), access key to its first field, docks like a Panel | `apps/docs/groupbox` |
| `SplitContainer` | Two panels and a splitter: drag, arrow keys, fixed panel, min sizes, collapse | `apps/docs/splitcontainer` |
| `MxForm` | A form shown when needed: modeless window, modal dialog that answers with a result, `x-model`-bound window, or embedded; move, resize, maximize, minimize to a target; lifetime bound to an owner | `apps/docs/form` |
| `Button` | Standard / accent / danger, outline and ghost buttons, `variant` × `tone` × `size`, all reactive; solid buttons are pressable (bottom edge, press offset) | `apps/docs/button` |

Shared exports: `FormResult`, `CloseReason`, `UiLocale` / `uiLocale` / `enStrings` / `trStrings`.

## Design system and component tokens

- The primitive, semantic and density layers, the three themes (`data-theme="light|dark|high-contrast"`,
  OS preference by default), density (`data-density="compact"`), the fonts, reduced motion, reduced
  transparency and forced colors all come from `@motifx-community/design-system`. Its
  `--mx-*` custom properties are the contract; this package never redefines them.
- This package adds one layer on top: **component tokens** (`button.*`, `form.*`, `groupbox.*`,
  `split.*`), DTCG JSON in `tokens/component/`, each a fine-tuning knob of one component that
  references a design-system token (`button.radius` → `{radius.md}`, `form.titlebar.height` →
  `{bar.height}`). They are built with Style Dictionary against the design system's source, so a
  reference to a token that does not exist fails the build, and written as `--mx-button-*`,
  `--mx-form-*`, … inside `@layer mx.components`, after the design system's `mx.base`.
- Un-layered app CSS wins over both packages. Override a component token to restyle one component
  everywhere, or a design-system token to restyle everything:

```css
/* after styles.css */
:root {
  --mx-form-width: 40rem; /* every window opens wider */
  --mx-color-accent-solid: #8764b8; /* every accent surface, in every component */
  --mx-color-accent-solid-hover: #9373c0;
  --mx-color-accent-solid-pressed: #7e5aaf;
  --mx-color-accent-fg: #5c2e91;
}
```

- `@motifx-community/ui/tokens` exports `cssVar` / `cssProperty` and a `TokenName` that is the design
  system's names plus the component token names, for styles written in TS.
- RTL through logical properties.

## Docs

`apps/docs` is the reference site (Vite + MotifJS): a full page per component — usage, behaviour,
keyboard and accessibility, localization, API tables, styling hooks and tokens — plus a token
reference (the component tokens, and the design system's layers for reference). `npm run dev`
serves it on port 4500.

## Contributing

The design system is a dependency by path until it is published: clone
`motifjs-design-system` next to this repository and build it (`npm ci && npm run build` there), then
`npm install` here links it. `npm run check` must stay green (typecheck, `motif-lint`, stylelint
with the design system's shared config, tests, build, docs build). `npm run e2e` runs the
real-browser checks (needs a local Chrome and `playwright-core`, see the script header).
Discussions live in the main [motifjs repo](https://github.com/motifjsdev/motifjs).

## License

[MIT](LICENSE)
