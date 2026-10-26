# @motifx-community/ui

UI components for **MotifJS** (`@motifx/core`) that work the way desktop UI does: a component is an
object you create when you need it, show anywhere, and close like a window — or write in JSX and
bind to state. Everything is drawn from the [MotifJS design system](https://github.com/motifjs-community/motifjs-design-system)
(`@motifx-community/design-system`): its tokens, themes, density, fonts and user-preference
overrides. This package adds the components and their component tokens, nothing else.

> **Status:** the full set is in (see the table). Not yet published
> to npm.

## Install

```sh
npm i @motifx/core @motifx-community/design-system @motifx-community/data @motifx-community/ui
```

```tsx
import '@motifx-community/ui/styles.css'; // imports the design system first, then this kit's layer
import { Button, Control, FocusContainer, addShortcut } from '@motifx-community/ui';
```

`styles.css` begins with `@import '@motifx-community/design-system/styles.css'`, which a bundler
(Vite, the MotifJS default) resolves. Without a bundler, link the design system's stylesheet first and
this one after it.

## What is here

Every component works from JSX (bound to state) and from code (`new X({...})`, added anywhere,
changed later); every prop and property takes a value or a function. The docs site has a page for
each (`npm run dev`).

| Group | Components |
| --- | --- |
| Buttons and commands | `Button` (menu, split, drop-down, toggle, busy), `Toolbar` (overflow menu), `MenuBar`, `ContextMenu` |
| Editors | `TextBox` (mask, validation), `TextArea` (auto-grow), `NumberBox` (locale formats, spin), `DateBox` (date, time, both), `Calendar`, `Slider` (range) |
| Choice | `CheckBox` (three states), `Switch`, `RadioGroup`, `DropDown`, `ComboBox`, `Autocomplete`, `Lookup` (columns), `TagBox`, `ListBox` |
| Data | `DataGrid` (virtual or paged, editing with three save modes, row actions, selection, filters, search panel, grouping with a group panel, toolbar, lookup columns, copy and paste, CSV and Excel export, kept layout), `TreeView` (lazy, check boxes, filter); lists and grids read `@motifx-community/data` sources |
| Layout and windows | `Stack`, `Grid`, `DockPanel`, `Panel`, `GroupBox`, `SplitContainer`, `FormLayout`, `Tabs`, `Accordion`, `MxForm` (window and modal form), `messageBox`, `confirm` |
| Feedback | `ProgressBar`, `Spinner` (cover a panel), `Tooltip`, `Toast` |
| Shared parts | `Field` (base of every editor), `InputMask`, `ValidationGroup`, `validateFields`, `checkRules`, `OptionList`, `DataItems`, `Popup`, `MenuList`, date helpers (`datePatternOf`) |
| Base | `Control`, `FocusContainer`, `addShortcut`, `parseAccessKey`, `uiLocale` (English, Turkish) |

Focus never falls to `<body>` because a control was disabled, hidden, removed or disposed; it moves to
the next usable element. Focus rings show only for keyboard use.

```tsx
<Button text="&Save" tone="accent" busy={() => this.model.saving} onclick={() => this.model.save()} />
<Button text="Save" split onclick={() => this.save()} menu={[{ text: 'Save &as…', click: () => this.saveAs() }]} />

class SearchBox extends FocusContainer<HTMLDivElement> {
  override onConfigured() {
    this.addShortcut('Escape', () => this.clear(), { inEditable: true }); // while focus is inside
  }
}

addShortcut('Mod+K', () => palette.open()); // app-wide
```

## Design system and component tokens

- The primitive, semantic and density layers, the three themes (`data-theme="light|dark|high-contrast"`,
  OS preference by default), density (`data-density="compact"`), the fonts, reduced motion, reduced
  transparency and forced colors all come from `@motifx-community/design-system`. Its
  `--mx-*` custom properties are the contract; this package never redefines them.
- Each component brings its **component tokens**: DTCG JSON in `tokens/component/`, each a fine-tuning
  knob of one component that references a design-system token. They are built with Style Dictionary
  against the design system's source, so a reference to a token that does not exist fails the build,
  and written inside `@layer mx.components`, after the design system's `mx.base`: one group per component
  (`button.*`, `field.*`, `list.*`, `calendar.*` …).
- **Design languages.** The design system ships Tactile (the default), Lounge, Material, Fluent and
  Lilac (`data-identity`). Every kit stylesheet paints only with its own component tokens, one per role
  (fill, text, frame per side, edge, effect, focus, marks), and a language can map any of them in
  `tokens/component/identity/<language>/` (Material's 56 px filled text field with square bottom
  corners, Fluent's 20 px check box). What tokens cannot express goes in that language's own
  stylesheet, `src/styles/identity/<language>.css`, every rule scoped to it (Lilac's focus ring all
  around a field). What a language decides for every component at once
  (focus, raised faces, elevation per kind of surface, selection) comes from the design system's
  role tokens the component tokens point at.
- Un-layered app CSS wins over both packages. Override a design-system token to restyle everything:

```css
/* after styles.css */
:root {
  --mx-color-accent-solid: #8764b8;
  --mx-color-accent-solid-hover: #9373c0;
  --mx-color-accent-solid-pressed: #7e5aaf;
  --mx-color-accent-fg: #5c2e91;
}
```

- `@motifx-community/ui/tokens` exports `cssVar` / `cssProperty` and a `TokenName` that is the design
  system's names plus the component token names, for styles written in TS.
- `@motifx-community/ui/excel` exports `exportDataGrid`, which writes a `DataGrid` to an ExcelJS
  worksheet. ExcelJS is an optional peer dependency the app installs; apps that do not import this
  entry never load it.
- RTL through logical properties.

## Docs

`apps/docs` is the reference site, itself a MotifJS app: one `Application` with the router (a
layout and a lazily loaded page per address), the reader's settings in a DI service, and the kit's
own components. A full page per component, `Control`, keyboard and focus, and a token reference.
`npm run dev` serves it on port 4500.

## Contributing

The design system is a dependency by path until it is published: clone
`motifjs-design-system` next to this repository and build it (`npm ci && npm run build` there), then
`npm install` here links it. `npm run check` must stay green (typecheck, `motif-lint`, stylelint
with the design system's shared config, tests, build, docs build). `npm run e2e` runs the
real-browser checks (needs a local Chrome and `playwright-core`, see the script header).
Discussions live in the main [motifjs repo](https://github.com/motifjsdev/motifjs).

## License

[MIT](LICENSE)
