# @motifx-community/ui

[![npm](https://img.shields.io/npm/v/@motifx-community/ui/beta?label=npm%20%40beta)](https://www.npmjs.com/package/@motifx-community/ui)
[![CI](https://github.com/motifjs-community/motifjs-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/motifjs-community/motifjs-ui/actions/workflows/ci.yml)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

UI components for **MotifJS** (`@motifx/core`) that work the way desktop UI does: a component is an
object you create when you need it, show anywhere, and close like a window — or write in JSX and
bind to state. Everything is drawn from the [MotifJS design system](https://github.com/motifjs-community/motifjs-design-system)
(`@motifx-community/design-system`): its tokens, themes, density, fonts and user-preference
overrides. This package adds the components and their component tokens, nothing else.

> **Preview** (`beta`): complete enough to build with; the API may still change before 1.0. Updates come as new
> beta versions.

The docs: [ui.motifjs.com](https://ui.motifjs.com). The same pages come with the package as Markdown, in `docs/`.

## Install

```sh
npm i @motifx/core@next @motifx-community/ui@beta @motifx-community/design-system@beta @motifx-community/data@beta @motifx-community/i18n@beta
npm i -D @motifx/compiler@next
```

Set up Vite with the MotifJS compiler and import the styles: see [docs/getting-started.md](docs/getting-started.md).

```tsx
import '@motifx-community/ui/styles.css'; // imports the design system first, then this kit's layer
import { Button, Control, FocusContainer, addShortcut } from '@motifx-community/ui';
```

`styles.css` begins with `@import '@motifx-community/design-system/styles.css'`, which a bundler
(Vite, the MotifJS default) resolves. Without a bundler, link the design system's stylesheet first and
this one after it.

## What is here

Every component works from JSX (bound to state) and programmatically (`new X({...})`, added anywhere,
changed later); every prop and property takes a value or a function. The docs site has a page for
each (`npm run dev`).

| Group | Components |
| --- | --- |
| Buttons and commands | `Button` (menu, split, drop-down, toggle, busy), `ButtonGroup` (segmented choice), `Toolbar` (overflow menu), `MenuBar`, `ContextMenu`, `SpeedDial` (actions in a line or around a button, on a circle, a half or a quarter of one) |
| Display | `Badge`, `Avatar`, `AvatarGroup`, `Chip`, `ChipGroup`, `Card`, `Skeleton`, `Gallery` (slides, dots, slideshow), `TileView` (tiles on a grid, chosen, reordered), `Timeline` (events down the page or along a line of dates) |
| Navigation | `Tabs`, `Accordion`, `Breadcrumb`, `Pagination`, `Stepper`, `Wizard`, `MultiView` (pages by swipe), `TabDocumentManager` |
| More editors | `Rating`, `ColorBox`, `ColorPicker` |
| Scheduling | `Scheduler` (day, week, month, timeline, agenda; recurrence, resources, iCalendar) |
| Editors | `TextBox` (mask, validation), `TextArea` (auto-grow), `NumberBox` (locale formats, spin), `DateBox` (date, time, both), `DateRangeBox` (two months, presets, a span), `Calendar`, `Slider` (range), `FileUploader` (drop, limits, chunks, progress), `ValidationSummary` (the failed fields of a group, each a press away) |
| Choice | `CheckBox` (three states), `Switch`, `RadioGroup`, `DropDown`, `ComboBox`, `Autocomplete`, `Lookup` (columns), `TagBox`, `ListBox` |
| Data | `DataGrid` (virtual or paged, editing with three save modes, row actions, selection, filters, search panel, grouping with a group panel, toolbar, lookup columns, copy and paste, CSV and Excel export, kept layout), `TreeView` (lazy, check boxes, filter); lists and grids read `@motifx-community/data` sources |
| Layout and windows | `Stack`, `Grid`, `DockPanel`, `Panel`, `GroupBox`, `SplitContainer`, `Splitter` (any number of panes, hidden from the handle), `ScrollView` (pull to refresh, load more), `Sortable` (drag or keys, lists of a group), `Resizable` (sides, corners, the keys on a grip), `Draggable` and `DropTarget` (anything moved, along an axis or inside a boundary, copies into targets), `FormLayout`, `Tabs`, `Accordion`, `MxForm` (window and modal form), `messageBox`, `confirm` |
| Feedback | `ProgressBar`, `Spinner` (cover a panel), `LoadPanel`, `Tooltip`, `Popover`, `Toast` |
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
- Each component brings its **component tokens**: a schema in `tokens/schema/` (names and types) and a
  value for every token in every language, `tokens/languages/<language>/`, each a knob of one
  component that references a design-system token. They are built with Style Dictionary
  against the design system's source, so a reference to a token that does not exist fails the build,
  and written inside `@layer mx.components`, after the design system's `mx.base`: one group per component
  (`button.*`, `field.*`, `list.*`, `calendar.*` …).
- **Design languages.** The design system ships Tactile (the default), Lounge, Material, Fluent and
  Lilac (`data-identity`). Every kit stylesheet paints only with its own component tokens, one per role
  (fill, text, frame per side, edge, effect, focus, marks), and every language gives each of them its
  own value in `tokens/languages/<language>/` (Material's 56 px filled text field with square bottom
  corners, Fluent's 20 px check box); no language takes anything from another, and a new one is
  files only. What a language decides for every component at once
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
- RTL through logical properties; what must turn the other way (an arrow, a resize cursor) uses `:dir(rtl)`.

## Browsers

Chrome and Edge 120, Firefox 128, Safari 18 and later. The styles use `:has()`, `@property`, `:dir()` and relative
colour syntax (`color(from …)`, `oklch(from …)`, which keep text readable on any colour a user picks).

Build your CSS for these browsers (in Vite, `build.cssTarget: ['chrome120', 'edge120', 'firefox128', 'safari18']`):
for an older target a minifier rewrites `:dir(rtl)` as a list of `:lang()` values, which only matches a page whose
`lang` is a right-to-left language.

## Docs

The package carries its documentation for readers that are not a browser, such as an AI assistant working in your
project: [`llms.txt`](llms.txt) is the index (the [llms.txt](https://llmstxt.org) convention), `docs/` a Markdown
page per component (props, properties, methods, events, keyboard, accessibility, tokens and the examples' code),
[`llms-full.txt`](llms-full.txt) every page in one file. Point your assistant at
`node_modules/@motifx-community/ui/llms.txt`.

`apps/docs` is the reference site, itself a MotifJS app: one `Application` with the router (a
layout and a lazily loaded page per address), the reader's settings in a DI service, and the kit's
own components. A full page per component, `Control`, keyboard and focus, and a token reference.
`npm run dev` serves it on port 4500.

## Contributing

The design system, the translations and the data layer are dependencies by path until they are published: clone
`motifjs-design-system`, `motifjs-i18n` and `motifjs-data` next to this repository and build each once, then
`npm ci` here links them. `npm run check` must stay green (typecheck, `motif-lint`, stylelint with the design
system's shared config, tests, build, docs build). The setup, the checks and the rules a change follows are in
[CONTRIBUTING.md](CONTRIBUTING.md). Questions and ideas go to the
[MotifJS discussions](https://github.com/motifjsdev/motifjs/discussions).

## License

[MIT](LICENSE)
