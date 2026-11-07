# @motifx-community/ui

[![npm](https://img.shields.io/npm/v/@motifx-community/ui/beta?label=npm%20%40beta)](https://www.npmjs.com/package/@motifx-community/ui)
[![CI](https://github.com/motifjs-community/motifjs-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/motifjs-community/motifjs-ui/actions/workflows/ci.yml)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

UI components for **MotifJS** (`@motifx/core`). You can create a component as an object, show it anywhere and dispose it
when you are finished, or declare it in JSX and bind it to state. Visual styling comes from the
[MotifJS design system](https://github.com/motifjs-community/motifjs-design-system) (`@motifx-community/design-system`),
which provides the tokens, themes, density settings, fonts and user-preference overrides. This package adds the
components and their component tokens.

> **Preview** (`beta`): the kit is ready for building applications, but the API may change before 1.0. Updates are
> released as new beta versions.

Documentation is available at [ui.motifjs.com](https://ui.motifjs.com). The same pages are included in the package as
Markdown files in `docs/`.

## Install

```sh
npm i @motifx/core@next @motifx-community/ui@beta @motifx-community/design-system@beta @motifx-community/data@beta @motifx-community/i18n@beta
npm i -D @motifx/compiler@next
```

To set up Vite with the MotifJS compiler and import the styles, see [docs/getting-started.md](docs/getting-started.md).

```tsx
import '@motifx-community/ui/styles.css'; // imports the design system first, then this kit's layer
import { Button, Control, FocusContainer, addShortcut } from '@motifx-community/ui';
```

`styles.css` begins with `@import '@motifx-community/design-system/styles.css'`, which a bundler resolves (Vite is the
MotifJS default). Without a bundler, link the design system stylesheet first and this stylesheet after it.

## Components

Every component can be declared in JSX and bound to state, or created programmatically with `new X({...})`, added
anywhere and changed later. Every prop and property accepts a value or a function. The docs site has a page for each
component (`npm run dev`).

| Group | Components |
| --- | --- |
| Buttons and commands | `Button` (menu, split, drop-down, toggle, busy), `ButtonGroup` (segmented choice), `Toolbar` (overflow menu), `MenuBar`, `ContextMenu`, `SpeedDial` (linear, circle, semi-circle and quarter-circle layouts) |
| Charts | `Chart` (lines, areas, bars, dots, bubbles, pie, donut, funnel, radar, heat map, ranges, candles, waterfall; zoom, live data, references, selection; keyboard, table view, images), `Sparkline` |
| Gauges | `Gauge` (arc, circle, half, quarter, bar across or upright; ticks, ranges, needles and markers, marks), `BarGauge` |
| Display | `QRCode`, `Barcode` (Code 128, Code 39, EAN, UPC, Interleaved 2 of 5), `Badge`, `Avatar`, `AvatarGroup`, `Chip`, `ChipGroup`, `Card`, `Skeleton`, `Gallery` (slides, dots, slideshow), `TileView` (selectable, reorderable tiles on a grid), `Timeline` (vertical, or horizontal along a line of dates) |
| Navigation | `AppBar`, `BottomNavigation`, `Tabs`, `Accordion`, `Breadcrumb`, `Pagination`, `Stepper`, `Wizard`, `MultiView` (swipeable pages), `TabDocumentManager` |
| More editors | `OtpInput` (one-time codes), `Signature` (strokes, image export), `Rating`, `ColorBox`, `ColorPicker` |
| Scheduling | `Scheduler` (day, week, month, timeline, agenda; recurrence, resources, iCalendar) |
| Editors | `TextBox` (mask, validation), `TextArea` (auto-grow), `NumberBox` (locale formats, spin), `DateBox` (date, time, both), `DateRangeBox` (two months, presets, length limits), `Calendar`, `Slider` (range), `FileUploader` (drop, limits, chunks, progress), `ValidationSummary` (the invalid fields of a group, with links to them) |
| Choice | `CheckBox` (three states), `Switch`, `RadioGroup`, `DropDown`, `ComboBox`, `Autocomplete`, `Lookup` (columns), `TagBox`, `ListBox` |
| Data | `DataGrid` (virtual or paged, editing with three save modes, row actions, selection, filters, search panel, grouping with a group panel, toolbar, lookup columns, copy and paste, CSV, Excel and PDF export, persistent layout), `TreeView` (on-demand loading, check boxes, search); lists and grids read `@motifx-community/data` sources |
| Layout and windows | `Stack`, `Grid`, `DockPanel`, `Panel`, `GroupBox`, `SplitContainer`, `Splitter` (any number of panes, collapsible from the handle), `ScrollView` (pull to refresh, load more), `Sortable` (drag or keyboard, across lists in a group), `Resizable` (edges, corners, keyboard on a grip), `Draggable` and `DropTarget` (axis and boundary limits, drop targets, copies), `FormLayout`, `Tabs`, `Accordion`, `MxForm` (modeless and modal windows), `messageBox`, `confirm` |
| Feedback | `ProgressBar`, `Spinner` (can cover a panel), `LoadPanel`, `Tooltip`, `Popover`, `Toast` |
| Shared parts | `Field` (base of every editor), `InputMask`, `ValidationGroup`, `validateFields`, `checkRules`, `OptionList`, `DataItems`, `Popup`, `MenuList`, date helpers (`datePatternOf`) |
| Base | `Control`, `FocusContainer`, `addShortcut`, `parseAccessKey`, `uiLocale` (English, Turkish) |

When a control is disabled, hidden, removed or disposed, focus moves to the next usable element rather than falling to
`<body>`. Focus rings appear only during keyboard use.

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

- The primitive, semantic and density layers, the three themes (`data-theme="light|dark|high-contrast"`, which follows
  the operating system preference by default), density (`data-density="compact"`), fonts, reduced motion, reduced
  transparency and forced colors all come from `@motifx-community/design-system`. Its `--mx-*` custom properties are
  the public contract, and this package never redefines them.
- Each component has its own **component tokens**: a schema in `tokens/schema/` (names and types) and a value for every
  token in every design language in `tokens/languages/<language>/`. Each token references a design system token. Tokens
  are built with Style Dictionary against the design system source, so a reference to a missing token fails the build.
  They are written inside `@layer mx.components`, after the design system's `mx.base`, with one group per component
  (`button.*`, `field.*`, `list.*`, `calendar.*` …).
- **Design languages.** The design system includes Tactile (the default), Lounge, Material, Fluent and Lilac, selected
  with `data-design-language`. Every kit stylesheet uses only its own component tokens, one per role (fill, text, frame per
  side, edge, effect, focus and marks), and every language defines its own value for each one in
  `tokens/languages/<language>/`, such as Material's 56 px filled text field with square bottom corners or Fluent's
  20 px check box. Languages do not inherit from each other, and adding one only requires new files. Decisions that
  apply to every component at once, such as focus, raised surfaces, elevation and selection, come from the design system
  role tokens that the component tokens reference. Design languages are independent interpretations and are not
  affiliated with their owners.
- Application CSS outside a layer takes precedence over both packages. Override a design system token to restyle
  everything that uses it:

```css
/* after styles.css */
:root {
  --mx-color-accent-solid: #8764b8;
  --mx-color-accent-solid-hover: #9373c0;
  --mx-color-accent-solid-pressed: #7e5aaf;
  --mx-color-accent-fg: #5c2e91;
}
```

- `@motifx-community/ui/tokens` exports `cssVar`, `cssProperty` and a `TokenName` type that combines the design system
  names with the component token names, for styles written in TypeScript.
- `@motifx-community/ui/excel` exports `exportDataGrid`, which writes a `DataGrid` to an ExcelJS worksheet. ExcelJS is an
  optional peer dependency that the application installs, and applications that do not import this entry point never
  load it. `@motifx-community/ui/pdf` does the same for jsPDF.
- Right-to-left layout uses CSS logical properties. Elements that must be mirrored, such as an arrow or a resize cursor,
  use `:dir(rtl)`.

## Browsers

Chrome and Edge 120, Firefox 128, Safari 18 and later. The styles use `:has()`, `@property`, `:dir()` and relative color
syntax (`color(from …)`, `oklch(from …)`), which keeps text readable on any color a user selects.

Build your CSS for these browsers (in Vite, `build.cssTarget: ['chrome120', 'edge120', 'firefox128', 'safari18']`). For
an older target, a minifier rewrites `:dir(rtl)` as a list of `:lang()` values, which only match a page whose `lang` is a
right-to-left language.

## Documentation

The package includes its documentation in plain text for tools such as AI assistants. [`llms.txt`](llms.txt) is the index
(following the [llms.txt](https://llmstxt.org) convention), `docs/` has one Markdown page per component (props,
properties, methods, events, keyboard, accessibility, tokens and example code), and [`llms-full.txt`](llms-full.txt)
contains every page in one file. Point your assistant to `node_modules/@motifx-community/ui/llms.txt`.

`apps/docs` is the reference site, which is itself a MotifJS application: one `Application` with the router (a layout
and a lazily loaded page for each address), the reader's settings in a DI service, and the kit's own components. It has
a page for each component, for `Control`, for keyboard and focus, and for tokens. `npm run dev` serves it on port 4500.

## Contributing

Setup instructions, checks and contribution rules are in [CONTRIBUTING.md](CONTRIBUTING.md). `npm run check` must pass
(typecheck, `motif-lint`, stylelint with the design system's shared config, tests, build and docs build). Use the
[MotifJS discussions](https://github.com/motifjsdev/motifjs/discussions) for questions and ideas.

## License

[MIT](LICENSE)
