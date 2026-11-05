# Changelog

All notable changes to this package are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the package uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### New components

- `Gallery`: panes side by side, one in view or several (`itemsPerPage`), moved by the buttons over the sides, the dots
  under them, a swipe, a drag with the mouse or the arrow keys (Home and End too); `loop` goes around the ends without
  running back across the panes between; a slideshow with `slideInterval`, which waits under the pointer, while focus
  is inside, out of sight and under reduced motion, and a button that pauses it; a pane is an image with a caption
  (`image`, `alt`, `text`, `description`) or any `content`; `stretchImages`, `height`; `value` and `x-model`;
  `onSlideChanging` may refuse, `onSlideChanged`, `onItemClick`. A `region` with `aria-roledescription="carousel"`,
  the panes out of view hidden from readers and keys. Units in the five languages: the frame, a pane, its caption
  and texts, the side buttons and their arrows, the bar, the dots, the slideshow button and its glyph.
- `MultiView` and `View`: pages side by side, one in sight, brought by a swipe or a drag, programmatically (`next()`,
  `previous()`, `goTo()`, `add()`, `insert()`, `remove()`) or by a `Tabs`, a `Stepper` or buttons bound to the same
  `value`; `loop`, `animated`, `lazy` and `keepAlive` as in `Tabs` (the same panel content part); hidden and disabled
  views are skipped; `onSelecting` may refuse, `onSelectionChanged`.
- The slide part under both: a finger or a pointer drags the panes, a drag far or fast enough lands on the next one,
  and around the ends the far pane is set next to the one leaving for the move.
- `Splitter` and `SplitPane`: panes side by side or one under the other, as many as needed, a handle between each
  two that the pointer drags and the keys move (arrows by `step`, Home, End), resizing the two panes beside it; a
  pane is a `Panel` with `size` (pixels, a share, or an equal share of what is left), `minSize`, `maxSize`,
  `resizable`, and may be hidden from its handle (`collapsible`: a button on the handle, Enter, a double press);
  `sizes` and `x-model` keep and restore a layout in pixels; panes added, inserted and removed programmatically, one may
  hold another splitter; `onResizing`, `onResized`, `onCollapsing` may refuse, `onCollapsed`. The handle looks as
  the `SplitContainer`’s does in every language.
- `TileView`: tiles of `widthRatio` × `heightRatio` base cells (`baseItemWidth`, `baseItemHeight`) packed densely
  down the columns (the view scrolls sideways) or along the rows; a tile is a text or any `content`; `selectionMode`
  none, single or multiple with `value` and `x-model` (a press, Ctrl and a press, Space, Enter); the arrow keys walk
  the grid by where the tiles lie; `allowReorder` drags a tile to its new place (a long press on a touch screen) or
  moves it with Ctrl and an arrow, `onReordering` may refuse, `onReordered` tells the indexes; `onItemClick`.
- Kit texts `splitterCollapse`, `splitterExpand`, `tiles` in English and Turkish.
- Kit texts `gallery`, `gallerySlides`, `gallerySlideOf`, `galleryPrevious`, `galleryNext`, `galleryChoose`,
  `galleryPlay`, `galleryPause`, `multiView`, `multiViewPageOf` in English and Turkish; the `play` and `pause` glyphs.

### Fixed

- `FileUploader`: the box is a drop zone, not a one-line field: as tall as the button and the hint with the same
  room on every side (`zone-padding`, 8 px in Tactile and Fluent, 12 px in Lounge, Material and Lilac), where the
  button used to touch the dashed frame. The label stays above the box in every language; Material's floating
  label lay over the button. The dead `padding` tokens of the uploader's field place are gone.

## [0.1.0-beta.2] - 2026-11-05

### New components

- `Stepper`: the steps of a longer task and where the user stands, an indicator and a text per step, a line between
  them; completed, current, pending and error statuses, optional and disabled steps, an icon in place of the number;
  linear order (a press reaches a completed step or the next one) or free; `onStepChanging` may refuse or wait on a
  promise; `next()`, `previous()`, `goTo()`; horizontal with the texts under or after the indicators, or vertical;
  one Tab stop with the arrow keys; `x-model`. Units in the five languages: the step, its indicator, the mark, the
  texts and the line (which turns a quarter standing).
- `Wizard` and `WizardStep`: a stepper above or beside a page per step and the Back and Next buttons. Next validates
  the kit's fields on the page, then the step's own `validate`; a page that fails keeps the wizard, marks its step
  and focuses the first invalid field. On the last step Next finishes (`onFinishing` may wait, `onFinished`). Steps
  from JSX or from `steps` with content factories, `add`, `insert`, `remove`; `lazy` and `keepAlive` as in `Tabs`.
- Kit texts `steps`, `stepOf`, `stepOptional`, `stepDone`, `stepError`, `wizardNext`, `wizardPrevious`,
  `wizardFinish` in English and Turkish.
- `Popover`: content next to the element it belongs to, with a title, a close button and an arrow where the
  design language draws one (Tactile, Fluent, Lilac); opened by a press on the target, by the pointer resting on it
  (`showOn: 'hover'`, keyboard focus too) or programmatically; every placement of the kit's popups, a width of its own;
  focus goes in and comes back; Escape, a press outside, focus leaving and the close button close it, and
  `onClosing` may keep it open; `value` and `x-model`.
- `LoadPanel`: a loading layer over a container or the whole page: a shade, a pane with the kit's spinner and a
  message, a Cancel button (`onCancel`, Escape too); what is under it is inert and `aria-busy`, focus waits on the
  panel and comes back; `delay` keeps quick work from flashing it; `value` and `x-model`, `show()` and `hide()`.
- `homeOf` in the core: where a surface made programmatically goes for its anchor (the tooltip's rule, now shared).
- `DateRangeBox`: a start and an end in one field, typed through two masks or picked on two months side by side
  (the first pick the start, the second the end, the pointer showing the range meanwhile), ready-made ranges
  (`presets`), `min`, `max`, `disabledDates`, the least and the most days a range may span (`minDays`, `maxDays`),
  `datetime` too; the value a `[start, end]` pair, `x-model`. The `Calendar` draws a range over its days
  (`rangeStart`, `rangeEnd`: the cell states `range-start`, `range-end`, `range-single`, `range-in` in every
  language) and tells the day under the pointer (`onDayPointed`).
- `FileUploader`: files chosen with a button or dropped on the box, listed with their size and what happens to
  them; `accept`, `maxFileSize`, `minFileSize` and `maxFiles` turn files away with the reason; uploaded as they come,
  on an Upload button or programmatically, by the uploader itself (`uploadUrl`, in one piece or in chunks with
  `Content-Range`, with progress) or by your own `upload`; cancel, retry and remove on each row; a field (label,
  `required`, rules); kit glyphs `upload` and `file`.
- Kit texts for both, in English and Turkish.
- `Sortable`: items the user puts in order by dragging them, with the pointer or a finger (a long press), or
  with the keys (Ctrl + an arrow, Home, End; each move read out); a copy follows the pointer, a line shows where
  it would land, the list scrolls near its edges; sortables of one `group` take each other's items; the items
  are the JSX children, or `items` drawn with `itemTemplate` (the rows keyed by item, kept as the order
  changes); a `handle` takes the drag and the keys; `onDragStarting`, `onDragChanging` and `onDragEnding` may
  refuse; `onReorder`, `onRemove` and `onAdd` tell the indexes and the data stays yours; `move()` programmatically.
  Units in the five languages: the list, an item, the line, the copy.
- `ScrollView`: content that scrolls in a box of its own; the bars shown on scroll, on hover, always or never;
  pull to refresh with a finger or the pointer (`onPullDown`, a promise or `release()`); more loaded near the
  end (`onReachBottom`, `reachBottomOffset`, `release(true)` when there is no more; content that does not fill
  the box asks at once, and again as it grows); `scrollTo`, `scrollBy`, `scrollToElement`, `onScrolled`.
- Kit texts `sortableMoved`, `scrollPullDown`, `scrollRelease` and `scrollRefreshing` in English and Turkish.

### Language

- A Language page in the docs: switching, the packs, a pack of your own, `connectI18n`, your own texts that follow,
  a control's own `locale`, and what a pack is checked for.
- `npm run locales` checks every pack against the built-in texts: every key, the same ICU arguments, `UiStrings` in
  step with `en.json`; `npm run locales -- path/to/de.json` checks a pack of your own.
- The Turkish pack is a chunk of the package, loaded when `uiLocale.use('tr')` first asks for it; it is no longer
  in the main bundle.

### Removed

- `trStrings`. Switch with `await uiLocale.use('tr')`, or add the JSON from `@motifx-community/ui/locales/tr.json`
  with `uiLocale.add('tr', pack)`.

## [0.1.0-beta.1] - 2026-11-04

### DropDown and Lookup: a value on no loaded page is asked for by key

- A value whose item is on no loaded page of `dataSource` is asked for by key, in one request with the keys the
  other fields and grids over the same source need at that moment. Meanwhile the field waits: `aria-busy`, a
  spinner in the arrow's place (`.mx-drop-down__spinner`, `data-loading`), the list closed, never the key as its
  text. A record that carries the name too gives it as `valueText`, and the field shows it at once. A key the
  source does not have shows itself, muted and underlined (`data-missing`), its title says why (`notInList`);
  when the request failed, opening the list asks again.
- Units `drop-down.spinner` and `drop-down.spinner-shape` and the `missing` state of `drop-down.value`, drawn in
  every language. The docs: "A value on no loaded page" on the Lookup page.

### Scheduler

- The agenda view tells the Scheduler it is shown as soon as it is configured: a view change made while focus is
  in the Scheduler moves focus into the agenda, as into the other views.

## [0.1.0-beta.0] - 2026-10-30

The first preview on npm (`npm i @motifx-community/ui@beta`). The package also carries its documentation for
readers that are not a browser: a Markdown page per component in `docs/`, an index in `llms.txt` and every page in
`llms-full.txt`.

### New components

- `Badge`: a text, a count (`max` → `99+`, hidden at 0 unless `showZero`) or a dot, in six tones and three looks;
  on a corner of what it is in (`position`, `Badge.attach`), the anchor's frame stepped over; the count in the kit's
  language.
- `Avatar` and `AvatarGroup`: a picture, else initials (in the capitals of the kit's language), else a person icon;
  a tone of the language's or one taken from the name (`tone: 'auto'`); circle or square; a presence dot. A group
  stacks or spreads its avatars and counts the rest (`max`, `total`, `+N`), from JSX lists too.
- `Chip` and `ChipGroup`: an icon or an avatar before the text, removable (its button, Delete / Backspace), pressable
  or selectable, six tones; a group selects one or several (`x-model`), one Tab stop, the arrow keys between chips.
- `Card`: a picture, a header (avatar, title, subtitle, action), content and actions; vertical or horizontal;
  clickable, a link through its title (`href`, `rel="router"`), selectable with a check box.
- `Skeleton`: lines, a block or a circle while `loading`, then the content; a wave or a pulse that reduced motion
  keeps still.
- `ButtonGroup`: the kit's buttons attached, a segmented choice (`single`, `multiple`, `x-model`) or actions.
- `Rating`: stars or icons of your own, halves, a preview under the pointer, read-only; a field (label, rules).
- `ColorPicker` and `ColorBox`: an area of saturation and brightness, hue and opacity strips, hex and channel inputs,
  presets, a colour from the screen; the box applies at once or on OK.
- `Breadcrumb`: links (the router's too) or buttons, the current page last, the steps that do not fit in a menu.
- `Pagination`: the grid's pager as a component of its own: page sizes, info, steps, page buttons, compact when it
  does not fit.
- The design system's opaque neutral fill (`color.fill.neutral`) for marks on any surface; kit glyphs `person`,
  `star`, `star-filled`, `eyedropper`, `slash`.

### Changed

- `Badge.attach` takes a component only: the badge becomes one of its children and goes with it.

### DataGrid: drawn by hand, with nothing followed inside

- What changes in the grid is told where it is changed (`GridNotices`, once a turn); the rows, the header, the
  filter row, the totals, the group rows and footers, the toolbar, the bottom bar, the pager, the filter panel,
  the band headers, the group panel, the edit and adaptive forms and the filter builder window draw again what a
  change concerns. No JSX, no bindings and no effects of its own inside; what comes in from outside is the
  developer's data, props (a function among them followed by one binding per source) and `reState()`. The state
  the API calls "reactive" stays so for the app's own bindings.
- Datagrid page: bindings 1,306 → 87, live effects 2,285 → 579, effects run while it opens 2,478 → 346; a sort
  runs none (was 140). Every write is made only when its value changed.
- Widening a column no longer has the whole page's style worked out again at each step (the grid's column sheet
  is written only when its rules change): 60–110 ms per step → no long task.
- `onRowPrepared` of the total row comes when what its cells show changed, not on every change of the grid.
- A value the user changes too (the search box, the pager's page box and size list, the filter row's editors,
  the filter panel's check box) is given again only when the grid's value changed, so what is typed stays.

### DataGrid: `masterDetail.keepAcrossPages`

- A paged grid disposes the details of the page left when the page or the page size changes, and makes them again
  when their page shows; a row stays open. `keepAcrossPages: true` keeps them while the user pages, up to
  `keepLimit`. Closing a row keeps its details with `keepDetails` (the default) and disposes them without it.

### Focus: a control hidden or disabled while focused does not scroll the page

- Focus moved off a control that is hidden or disabled goes to the next one without scrolling (the page jumped
  after the first "Save changes" of a batch-edited grid).

### FormLayout: a field not shown is not checked

- A field whose item is not shown (`visible: false`) is left out of `validate()` and `isValid`, its message cleared;
  shown again, it is checked again. A field on a tab not chosen is still checked. The Scheduler form of "Fields for
  one appointment" saves again (its required "Guests" stopped it while hidden).

### Properties: a function prop follows through the component's bindings; `x-model` mirrors the state

- A property given as a function is followed by a binding of the component (`follow`, `PropBinding`): a reactive
  source updates it by itself, plain data shows on the developer's `reState()`. The value is handed on only when it
  differs from the last one read, so a change the user made stays across a `reState()`; a property set programmatically
  stops following its function. `refreshProps()` is gone (one way, not two).
- `x-model` shows the component's state on every path: the user, code (`value`, `pressed`, `position`, a tab or a
  panel chosen programmatically), the component's own rules (a mask, `decimals`, `min`/`max`) and a cancelled close.
- NumberBox rounds its value to `decimals` and shows that many digits; its spin buttons come back after `none`.
  Calendar shows the month of a value given from anywhere.
- Every docs page's components converted; `onReState(component, run)` for parts drawn by hand.

### Scheduler: drawn by hand, with nothing followed inside

- The views (timeline, day and week, month, agenda), the appointment boxes, the tooltip, the "+N more" list, the
  toolbar, the recurrence editor and the series question are made in code and drawn by hand: no JSX, no bindings,
  no inner `reState()`. What comes in from outside is the developer's data, props and `reState()`.
- Effects on the timeline page 10,860 → those of the example templates only; resizing an appointment runs nothing
  reactive (was 1,353 to 1,598 runs); scrolling a big timeline: script, style, layout and paint all below before.
  Every write is made only when its value changed.
- Big views open faster: the view's settings are read once per turn, the week of many groups builds the columns in
  view first and the ones on each side in the frames after (big-data example: first box 950 → ~430 ms, dev).
- Fixed: "On a date" in the recurrence editor jumped back to "Never" (it comes with a date three months after the
  start); a focused box taken away threw in `itemOf`, and its focus going with it took a move by the keys back;
  rows of cells gone with other hours were written again (MJX208); a virtual timeline row let go after its view
  threw, and so did a scroll coming after it; a box waiting for its store shows it locked again; `selectCells` right
  after `showDate` finds the cells of the new days; a resource kind's field given as a function
  (`useColorAsDefault: () => …`) is followed again.
- Docs: "Programmatically" selects the next workday (the work week has no Saturday); the two copies of a TabDocs document
  read a field again when the other one changes it. Tests: the back-button session waits for its history moves
  between tests (`backButtonSettled`), a new window's `onMounted` is waited for.

### Lists, menus, forms, trees and the filter builder: the developer's data as given

- The items of ListBox, DropDown, Lookup, ComboBox, Autocomplete, TagBox, RadioGroup, Toolbar, MenuBar,
  ContextMenu, ActionSheet and a Button's menu, a field's `buttons`, FormLayout's `data` and `items`, TreeView's
  items, FilterBuilder's fields and value and a document's `actions` may be plain or reactive: they are read as
  they are and come back as the very objects given, in events, templates, getters and `x-model`.
- Their fields are read untracked: a change made in place shows after the new `refresh()`, the same for both
  kinds; a list given anew (or by a function that returns a new one) shows at once, and a function in an item's
  field is still followed. New: `refresh()` on every list and menu control, Field (its buttons), FormLayout
  (with `refreshField(field)`), TreeView (with `refreshItem(key)`) and FilterBuilder.
- An object value written to a reactive `x-model` stays the very item: the model's copy handed back is not taken
  in its place and reports no second change.
- A submenu in an ActionSheet and a split button's menu in the toolbar's "more" menu no longer copy the first item
  to draw the line before it.
- `uiLocale` keeps the set it is given as it is: to change a text, assign a new set
  (`uiLocale.strings = { ...uiLocale.strings, close: 'Kapat' }`); a text changed inside the set is not seen.
- A property's drawing and its `normalize` run untracked, so a setter called inside an app's own watch adds
  nothing to it, and a Slider range given by a getter is not followed by its numbers changing in place.

### Scheduler: the developer's data as given

- The appointments and the resource items may be plain or reactive: the Scheduler reads them as they are and never
  wraps, copies or marks them. Events, templates, getters (`shownAppointments`, `seriesOf`, `resourcesOf`) and the
  tooltip hand back the very objects given; its reactive state holds only its own values (a piece's appointment is
  `itemOf(piece)`; the tooltip, the "+N more" list and a drag keep theirs in plain fields; occurrences are plain objects).
- Their fields are read untracked: a change made in place shows after `refresh()`, `refreshAppointment(item)` or
  `refreshResources()`, the same for both kinds; its own edits and a data source's changes show at once.
- Delete, a drag, the form and the series edits work on a plain array; an appointment without a key has one id.
- `addAppointment(values)` stores the object given, not a copy.

### DataGrid: the developer's data as given

- Rows, columns, actions, toolbar and form items, summary items, filter values and the options of `settings`,
  `toolbar`, `export`, `form`, `popup`, `filterBuilder`, `masterDetail`, `adaptiveDetail` and `rowDragging` may be
  plain or reactive: the grid keeps them as given and hands back the very objects (`grid.toolbar.items` is your
  array, `rowDragging.data` your object). Its reactive state holds only its own values, with a counter per option.
- Their fields are read untracked: a change made in place shows after `refresh()`, `repaint()`, `repaintRows(keys)`,
  `refreshSummary()` or `refreshActions()`, the same for both kinds. A new array given to `rows` (or returned by
  its function) still loads again; a `push` or `splice` into it now needs `refresh()`.
- New: `repaintRows(keys)`, `refreshSummary()`, `refreshActions()`. `repaint()` draws the details, the adaptive
  detail, the totals, the toolbar and the actions again too; `refresh()` reads everything again.
- The editing events (`onEditingStart`, `onEditorPreparing`, `onEditorPrepared`, `onRowValidating`) get the row
  itself in `row` and the values entered apart in `values`, with `getValue(field)`; no merged copy, so a class
  instance keeps its prototype. The same for a custom editor's context, `setCellValue(values, value, row, context)`,
  `validate(value, row, context)`, `validateRow(row, { values, getValue, isNew, changed })`, `options(row, context)`,
  `lookup.filter(row, context)`, `comparisonTarget(row, context)` and `validationCallback({ …, context })`.
- `grid.changes` lists `added` and `updated` as `{ row, changed }`: the row itself and the values entered.
  `RowChange.original` is gone (it was the same row). Summaries that follow unsaved edits read them beside the rows.

### Scheduler: smooth scrolling in big views

- The cells of a timeline row and of the day views have no bindings of their own: a cell is written once when it
  is made, and again only when what it shows changes (`CellWriter`, followed once per row or view; the model's
  `look` counter says when the days, columns, time rows or blocked times were written again). The focus writes only
  the cells it left and reached. Cell events are listened for once per row.
- The day views with many groups keep their cells in places: scrolling shows other columns in the same cells, none
  are made or dropped. Their rows and cells are laid out on their own (`contain`).
- After a drop only the timeline rows whose appointments changed are laid out again.
- Measured with a wheel, frame by frame: 1,000 rows × 10,000 appointments in development went from 47 frames over
  33 ms to 2–4 (of about 520) down and from up to 25 to none sideways; the week of 200 groups down from 14 to none.

### Design languages: the token model, units and places

Any design system is carried by a design language's files alone: a new one, or a new version of one, needs no
component touched. This replaces `tokens/component/` and its `identity/` mappings
mentioned further down.

- **Schema and languages.** `tokens/schema/<component>.json` names a component's tokens; every language is a folder,
  `tokens/languages/<language>/`, with the values its design draws. The build checks every language against the
  schema and the design system's references and types. `npm run language -- <name> [--from <language>]` starts a new
  language; the docs Style menu and the checks take the list of languages from the design system.
- **Units.** Every piece a design could draw on its own is a unit (`$units`): the field's box, frame, notch, active
  indicator, label, buttons and help line; a button's face, caption, spinner and split parts; a list's items; a
  slider's segments, knob and stops; and so on for every component. The build gives each unit the same box (display,
  size, margin and padding per side, fill, frame per side, corners, shadow and glow, backdrop, opacity, scale,
  rotation, translation, text, outline, icon) in each of its states and paints it in `src/generated/units.css`; a
  unit standing upright (a vertical slider) is turned a quarter by the build. A language writes only what its design
  has: a piece it leaves out stays invisible, and pieces it shows as one have the space and the corners between
  them at 0. Component CSS keeps the layout only.
- **Slots and places.** A component reads its tokens through slots on its own root (`--_<component>-…`), so one
  instance's values never flow into another inside it. Where a component holds a part (a list in a popup, a field in
  a grid cell, a toolbar's buttons) a place decides that part's units there.
- **Shapes.** `tokens/shapes/kit.shapes.json` describes shapes by kind (circle, ellipse, rounded polygon, rect,
  wave: soft burst, cookies, sunny, pill, pentagon …); the build turns each into a `polygon()` of the same 180
  points, so one becomes the next smoothly. A `shape` token names one.
- Every look in every language and theme is unchanged by the move, measured by pixel and computed-style compares,
  except where a language now draws its source: below.

### Material 3 Expressive, from its specs and videos

- **Slider:** a 16 px track of segments with a 6 px gap at each side of a 4 × 44 px bar handle that narrows to 2 px
  pressed or focused, 2 px inner corners, stop dots at the ends of the inactive track, the steps as dots on the
  track; centred (`origin`) and range sliders the same way; the value as a pill on the inverse surface.
- **Loading indicator (Spinner):** a filled shape that becomes the next of seven (soft burst, 9-sided cookie,
  pentagon, pill, sunny, 4-sided cookie, oval) with a spring while it turns; `contained` draws it in a disc
  (`accent.subtle`, the shape in `accent.on-subtle`). A busy button turns the same shape in its place.
- **Progress indicator (ProgressBar):** while the value is known the bar is a wave travelling along, flat while short
  and again at 100 %, with a gap, the rest of the track and a stop dot; `shape="circle"` the same round a ring. While
  the value is not known both stay as they were.

### New in the components

- `Slider`: `origin` (a centred slider), a track of segments that can stop short of the thumbs (`track-gap`), stop
  dots, a halo, a knob and a core, a value bubble with an arrow, `tick-label-room`; a disabled slider sends nothing
  with its form.
- `Spinner`: `contained`; a shape instead of the ring where the language draws one.
- `ProgressBar`: `shape: 'line' | 'circle'` (a determinate and a turning circle), `labelPosition: 'bottom'`, a wave.
- `Button`: the caption is an element (`.mx-button__text`), so a language can trim its line box (`text-box`) and
  centre the letters optically; `data-icon-only`; `readLook()`. `Field`: `readLook()`. Both for a control placed in
  the page outside the component tree.
- `Accordion`: the chevron stands in a plate of its own (`.mx-accordion__plate`).
- `Toolbar` measures again when a control takes another size or variant from its place.

### Design languages

- Material and Fluent in the docs Style menu next to Tactile and Lounge, with per-language component
  mappings in `tokens/component/identity/material/` (from the Material 3 component specs) and
  `tokens/component/identity/fluent/` (from the Fluent theme resources).
- Every kit stylesheet paints only with its own component tokens, one per role: fills and text per
  state, frame and edge per side, the raised face (`<c>.shadow`), the marks (tab indicator,
  selection bar, check mark) and keyboard focus (`<c>.focus-width|offset|color|halo`). A language can
  change any of them for one component. `tests/tokens.test.ts` enforces it, and the focus rule
  too. New: `tokens/component/{textbox,dropdown,combobox,base}.tokens.json` (`--mx-glyph-size`,
  `--mx-disabled-fg`). Surfaces read the design system's `elevation.*` (Material's toast is level 3
  there now). Every look in every language and theme is unchanged, measured.
- Lilac in the Style menu, with its own spacing in `tokens/component/identity/lilac/` (more room
  between a label and its field, between form rows and columns, in popups, tooltips, toasts, dialogs,
  tabs, accordions and calendars; 18 px check boxes and radios; a 3 px tab indicator; a framed field
  shows focus as a 2 px lilac ring all around, from its field tokens). `e2e/checks/37-design-languages.mjs` measures it too.
- A split button's focus ring is drawn whole: the focused part sits above the arrow next to it.
- Material: pill tabs and the tab scroll buttons are fully round (the segmented button shape).
- Tools: `npm run fingerprint` / `fingerprint:compare` (the computed look of every element on every
  docs page, in every language, theme and state, compared), `e2e/state-sheet.mjs` (every part in
  every state and language on one page) and `e2e/checks/37-design-languages.mjs` (each language
  measured against its source).

### Check boxes and radios

- The check box, the radio circle and the check boxes of DataGrid, ListBox and TreeView draw one
  stroke all around; the pressable depth is a 1px shadow under the mark instead of a darker bottom
  border, which vanished on dark backgrounds and left the outline open at the bottom.
- `checkbox.radius` and the `check-radius` of DataGrid, ListBox and TreeView read the design
  system's new `radius.xs`, so a check box stays square in a design language with round corners
  (Lounge). Same 4px as before in Tactile.
- The docs site has a Style menu (Tactile / Lounge) next to Theme, kept between visits.

### rewrite

- The components are being rewritten from scratch, one at a time. Removed: `Button`, `Label`,
  `Panel`, `Stack`, `Grid`, `GroupBox`, `SplitContainer`, `MxForm`, their component tokens and docs
  pages, the layout props of `Control` (`dock`, offsets, size, grid cells), `UiLocale`,
  `FormResult` / `CloseReason` and the `x-model` helpers of `Control`. The entries below describe
  them as they were.
- Kept: `Control`, `FocusContainer`, `addShortcut`, `parseAccessKey`, the focus guard and the
  `enabled` cascade. The window stack marks a modal window with `modal`. The token build writes
  empty files when there are no component tokens.

### Button

- `Button`: a native `<button>`; `variant` (solid / outline / ghost), `tone` (standard / accent /
  danger), `size` (sm / md / lg) from the density tokens, pressable solid faces; `text` with an `&`
  access key or JSX children; `icon` (an address, an element or a component) at the start or end;
  `stretch`, `type`, `hint`; `toggle` / `pressed` with `x-model`; `busy` (spinner, presses ignored,
  size kept, `aria-busy`); `focusableWhenDisabled` (`aria-disabled`, stays in the Tab order). Every
  prop is a value or a function and a settable, reactive property; set programmatically, a function is
  bound and followed too (`Control` setters as well: `ctrl.enabled = () => !state.busy`).
- A menu: `menu` (items with icon, hint, enabled, visible, checked, beginGroup, each a value or a
  function the open menu follows; click, data) or any
  content (`dropDown`), opened by the whole button or, with `split`, by an arrow next to it while the
  button keeps its own action; `split` changes live; `opened`, `open()`, `close()`, `onItemClick`.
- Shared parts: `Popup` (top layer, follows its anchor, flips when there is no room, closes on
  Escape / a press outside / focus leaving, gives focus back) and `MenuList` (arrows, Home / End,
  letters, `&` keys); `placePopup`; `IconSource`.
- `uiLocale` / `enStrings` / `trStrings` / `UiStrings`: the texts controls write, reactive, starting
  with the page's `lang`.
- Component tokens `button.*`, `popup.*`, `menu.*`. `@motifx/core` 1.2.0-rc.19.

### TextBox

- `TextBox`: a native `<input>` in a field frame; `label` (`&` access key) with `labelMode` top /
  side / floating / hidden, `placeholder`, `helpText`, `hint`, `prefix` / `suffix`, `icon`,
  `buttons` (your own, each with `enabled`, `visible`, `position`, `tabStop`), `clearButton`
  (Escape too), `type` (text, password with a reveal button, email, search, tel, url), `maxLength`
  / `minLength` / `showCounter`, `updateOn` input / change, `selectOnFocus`, `align`, `readOnly`,
  `required`, `size`, `variant` (outline, filled, underline), `stretch`, `inputMode`,
  `autocomplete`, `spellcheck`, `name`; `onValueChanged` (`byUser`), `onEnter`, `onValidated`.
- Mask: `mask` (`0` digit, `9` optional digit, `a` letter, `*` letter or digit, `\` fixed),
  `maskChars` (own characters with case), `maskPlaceholder`, `maskValue` raw / formatted,
  `showMask`; typing, deleting and pasting follow the mask; an unfilled mask fails validation.
- Validation: `rules` (required, email, url, pattern, length, range, compare, custom, async),
  `error` from outside, `validateOn` blur / input / manual, `isValid`, `validationMessage`,
  `validating`, `validate()`, `resetValidation()`; `ValidationGroup` and `validateFields(root)`
  focus the first failed field. Messages come from `uiLocale` and follow it.
- Shared parts: `Field` (the base of every editor), `InputMask` / `MaskedText` / `parseMask`
  (work on any `<input>`), `checkRules`. `Control.changeProperty` stores a user's value without
  dropping a bound getter. New `uiLocale` texts. Component tokens `field.*`.

### The rest of the set

- Editors: `TextArea` (auto-grow between `minRows` / `maxRows`, resize, counter, Ctrl+Enter),
  `NumberBox` (`min` / `max` / `step` / `largeStep`, spin buttons that repeat, wheel, `Intl` formats
  with locale-aware typing, decimal arithmetic, `clamp`, `allowEmpty`), `Slider` (one value or a
  range, ticks and labels, value bubble, vertical, RTL).
- Choice: `CheckBox` (three states), `Switch`, `RadioGroup` (APG keys, columns), `ListBox` (single or
  multiple, select all, search, data sources), `TagBox` (tags, search, `maxTags`, custom values).
- Data: `TreeView` (nested or flat items, lazy children with retry, selection, tri-state check boxes,
  filter, long trees drawn in view), `DataGrid` (moved in from motifjs-data-grid onto
  `@motifx-community/data`: virtual or paged, sorting, column layout, editing with the kit's
  editors, new rows, three save modes, row actions, selection over any number of rows, filter row
  and header filter, copy and paste, CSV export, a saved layout). Rows stay in place in the DOM
  while scrolling; the reading order is given through `aria-owns`. `resizeMode` (grid and column):
  `widget` resizes the column alone, `nextColumn` moves only the edge between it and the next column.
- `DataGrid` lookup columns: `lookup` (a `DataSource` of any adapter, also of another service, or an
  array; `valueField`, `textField`, `searchFields`, `filter(row)`, `allowClearing`, `resolve`
  `batch` / `byKey`, `batchSize`, `sortBy`, `editor` `dropdown` / `combobox` / `lookup`,
  `editorOptions`). Only the keys on the screen are asked for, several in one request, and only the
  cells that show them are drawn again; loading and "not found" states; the chosen text is
  remembered. `textFrom` and `sortField` on any column; `setCellValue` (also async) and the
  `onEditorPreparing` event for every column; the `syncLookupFilterValues` setting (grid and
  column); `refreshLookups()`. Filter row "(All)" lists, header filter texts, copy, export and paste
  by text, and a key the source does not have stops its row from being saved.
- `DataGrid` search panel and toolbar. `searchPanel` (with `searchPanelWidth`, `searchPlaceholder`,
  `searchDelay`, `highlightSearchText`, `highlightCaseSensitive`, `searchVisibleColumnsOnly`, all
  live) puts a search box in a toolbar above the rows; `searchText` (followed, told back through
  `onSearchTextChanged`), `searchByText()`, `searchable` (grid and column; a column that turns its
  filters off is left out). Text columns contain the text, numbers, dates and yes/no equal it when it
  reads as one, lists match their option texts, lookup columns ask their own source for the keys
  whose text holds it (`lookup.searchLimit`) or search a `textFrom` field; the columns are joined
  with OR and with the filters with AND, a text no column reads keeps no row, and the filter goes to
  the data source like any other. What was found is marked with `<mark>`; the count is announced; the
  text is kept with the layout. `toolbar` (`visible`, `items`, also `grid.toolbar`, live): the grid's
  own items (`addRowButton`, `saveButton`, `revertButton`, `exportButton`, `columnChooserButton`,
  `searchPanel`) whose features are on, or the listed ones, changed by name, and items of the app's
  own (buttons or `content`) at the start or the end, on the kit's `Toolbar` with its "more" menu.
  "New row", "Save changes" / "Discard" and "Export" moved from the bar under the rows to the toolbar
  (the bar keeps the counts, the error summary and the pager); `columnChooserButton` setting,
  `showColumnChooser()`; the `gridPendingChanges` text went with the bar's old buttons. `clearFilters()`
  also clears the search text. `KeyedItems.searchInMemory`.
- `DataGrid` grouping. Column `groupIndex` (followed when a function), `groupable` (grid and
  column), `showWhenGrouped`, `autoExpandGroup`, `calculateGroupValue` (a function for rows in
  memory, a field for a server) and `groupCell`; settings `groupPanel`, `groupPanelDragging`,
  `groupPanelEmptyText`, `autoExpandAll`, `groupExpandMode` (`button` / `rowClick`, also per column),
  `remoteGrouping` (`auto` / `true` / `false`), `groupLoadPageSize`, `groupToggleKeys`,
  `groupArrowKeys`, `dragThreshold`, and the column features `groupable`, `showWhenGrouped`,
  `allowCollapsing`, `groupCount`, `groupMenu` (grid and column, the column wins), all live; column
  `groupCompare`; grid `groupCell`; export option `groups`. `grid.group` (read and assign),
  `groupBy(field, index?, dir?)`, `ungroup(field)`, `setGroupOrder(field, dir)`, `clearGrouping()`,
  `expandAll(level?)`, `collapseAll(level?)`, `expandGroup(key)`, `collapseGroup(key)`,
  `isGroupExpanded(key)`; `onRowExpanding` / `onRowExpanded` / `onRowCollapsing` / `onRowCollapsed`,
  `onGroupingChanging` / `onGroupingChanged` (user or code) and `onGroupDropping` (a header or chip
  dropped), the "before" ones cancellable. Group rows are pooled like data rows: "Column: value (count)" (a lookup's
  text, the column's format, "(empty)"), an arrow, moved in by level; a closed group is one row, in
  the virtual list and in pages alike. The grid is a `treegrid` while grouped (`aria-expanded`,
  `aria-level`, `aria-colspan`). Enter / Space open and close a group row, Right and Left open and
  close it and go in and out. The group panel (`groupPanel` toolbar item, at the start): headers
  dropped anywhere on the toolbar group (the bar is outlined while a header is dragged and filled
  under the pointer; a copy of the dragged header or chip follows the pointer, marked when a drop
  would group, move or ungroup; `dragGhost` turns it off), chips turn the order of their groups (click, Enter), move (drag, Shift +
  arrows) and ungroup (Delete, or dragged back onto the headers, where the column lands); the column
  menu has "Group by this column", "Ungroup", "Ungroup all". A grouped column leaves the columns and
  the sort; its header sorts its groups. Data: rows in memory and sources that load everything are
  grouped in memory; a source that loads by blocks over an adapter that groups is asked for the
  groups only and loads the rows of the open groups where the list looks; anything else gets every
  matching row grouped in memory. Filters, search, selection, editing (a saved row moves to its
  group), copy (a group row copies its text), the CSV export (a "Column: value" line per group) and
  the kept layout (`group`) work with it. Texts `gridGroup…` / `gridUngroup…` in en and tr; component
  tokens `datagrid.group-*`, `chip-*`, `panel-empty-color`, `drop-target`.
- `KeyedItems` (shared, batched key → item cache per source and value field); `DataItems.find`
  goes through it. `DropDown` and `ComboBox` ask for a value on no loaded page by their `valueField`
  when it is a field. `DropDown.open(search)` starts the search box with a text.
- Layout and windows: `Stack`, `Grid`, `DockPanel`, `Panel`, `GroupBox`, `SplitContainer`, `Tabs`,
  `Accordion`, `MxForm` (window and modal form, `show` / `showDialog`, move, resize, minimize,
  maximize, nested modals), `messageBox`, `confirm`.
- Commands: `Toolbar` (roving focus, overflow menu), `MenuBar`, `ContextMenu`; `MenuList` gained
  submenus, shortcuts and radio items.
- `DataGrid`: every behaviour is the developer's, today's value its default. New settings
  `tooltipDelay` (500), `extraRows` (4), `columnWidth` (140), `columnMinWidth` (48), `rowStatusWidth`
  (28), `selectionColumnWidth` (36), `resizeStep` (10), `resizeFineStep` (1), `pagerNeighbors` (1),
  `pagerNavigation` (`true`), `pagerInfo` (`true`), `headerFilterPageSize` (100), `headerFilterRows`
  (8), `exportPageSize` (1000), `trueTexts` / `falseTexts`, `editKeys` (`['Enter', 'F2']`),
  `clearKeys` (`['Delete']`), `editOnKeyPress` (`true`), `startEditAction` (`'dblClick'`); column
  fields `headerCell`, `editOnKeyPress`, `startEditAction`, `trueTexts`, `falseTexts` (a column's
  value wins); lookup fields `pageSize` (50), `filterSearchLimit` (1000), `parallelRequests` (6),
  `pasteSearchLimit` (50); prop `layoutStorage` (default `localStorage`). Events, the standard names,
  `…ing` cancelable: `onCellClick`, `onCellDblClick`, `onRowClick`, `onRowDblClick`, `onCellPrepared`,
  `onRowPrepared`, `onContentReady`, `onDataErrorOccurred`, `onEditingStart`, `onInitNewRow`,
  `onSaving` / `onSaved`, `onRowInserting` / `Inserted`, `onRowUpdating` / `Updated`, `onRowRemoving` /
  `Removed`, `onEditCanceling` / `Canceled`, `onFocusedCellChanging` / `Changed`,
  `onFocusedRowChanging` / `Changed`, `onKeyHandling` (`onKeyDown`, a DOM event name in
  JSX), `onOptionChanged`, `onExporting` / `onExported`, `onContextMenuPreparing` (the column menu's
  items, and a row menu on right click or Shift + F10 when items are added), `onToolbarPreparing`,
  `onSelectionChanging`, `onSortChanging` / `Changed`, `onFilterChanging` / `Changed`,
  `onPageChanging` / `Changed`, `onLayoutChanging`, `onSearchTextChanging`, `onCopying`, `onPasting`;
  every event also as `grid.onX(fn)`. State and methods: `status`, `loadError`, `failedBlocks`,
  `editingCell`, `saving`, `exporting`, `focusedRowIndex`, `focusedRowKey`, `getVisibleRows()`,
  `getRowElement()`, `getCellElement()`, `getKeyByRowIndex()`, `getRowIndexByKey()`, `byKey()`,
  `cellValue()`, `navigateToRow()`, `focusCell()`, `editCell()`, `editRow()`, `closeEditCell()`,
  `beginUpdate()` / `endUpdate()`, `repaint()`, `columnOption()`, `getCombinedFilter()`, `state()`.
  `OptionList` `extraRows` (6) and `typingDelay` (600); `KeyedItems` `parallelRequests` (6) and
  `pasteSearchLimit` (50).
- `DataGrid` summaries's `summary`. Prop and property `summary` (`totalItems`,
  `groupItems`, `calculateCustomSummary`, `recalculateWhileEditing`, `skipEmptyValues`, `texts`, each
  followed when a function); item fields `column`, `summaryType` (`sum`, `min`, `max`, `avg`, `count`,
  `custom`), `name`, `showInColumn`, `valueFormat` (`Intl` options or a function; default the column's
  format), `displayFormat` (`{0}`, `{1}`), `customizeText`, `alignment`, `cssClass`, `skipEmptyValues`,
  `visible`, and for group items `showInGroupFooter`, `alignByColumn`. Settings `totalSummary`,
  `groupSummary` (an item's `visible` wins), `totalSummaryTabStop`, `remoteSummary` (`auto` / `true` /
  `false`); `groupLoadPageSize` also paces every-row loads for summaries. `getTotalSummaryValue(name)`
  (by name, place, type, column or `type_column`), `getGroupSummaryValue(key, name)`, `summaryStatus`,
  `onSummaryChanged` (`{ total, editing }`). The row of totals sits under the rows in a sticky row group,
  moves sideways with the columns (sticky ones stay), stacks several items in a column, is a row of the
  ARIA model and a Tab stop of its own; its cells read as items that name their column ("Sum of Amount:
  1,234"). Group items show after the group row's count, under their columns in the group row, or in
  group footer rows (pooled like the other rows, reached by the arrows, in pages too). Totals of rows in
  memory are worked out in the data path; a source that loads pages or blocks asks its adapter
  (`DataSource.loadSummary`) or loads every matching row once (shared with grouping); a server that
  groups gets the group summaries with the groups, and group items only memory can work out group in
  memory. `rowType` `groupFooter` and `totalFooter` in the click and prepared events; `GroupCellContext`
  `summaryItems`. Export: group footers after their rows and the totals last in the CSV and
  `exportRows()`, group items on the group lines; option `summaries`. Texts `gridSummary…`,
  `gridSummarySeparator`, `gridTotalSummary` in en and tr.
- Feedback: `ProgressBar`, `Spinner` (with `Spinner.cover`), `Tooltip` / `addTooltip`, `Toast` /
  `toast` / `Toaster`.
- `Control` binds DOM events given programmatically (`new Button({ onclick })`); its private state getter is
  `controlState`, so a subclass may have a `state` field.
- Fixed: `Stack`, `Grid` and `DockPanel` overflowed the call stack when a child was added in their
  `ref`. `TreeView` reported a check again and again when `checkedKeys` was bound both ways with
  `onCheckChanged` writing the keys back; keys equal to the checked ones now change nothing. A tooltip
  shown for keyboard focus closed at once when focusing scrolled its field into view; it now follows
  the field while the page scrolls and closes only if the field is off the screen when scrolling ends.

### DataGrid PDF export and row drag and drop

- A new entry, `@motifx-community/ui/pdf`, with `exportDataGrid({ jsPDFDocument, component, … })`
  (`pdfExporter.exportDataGrid`): jsPDF is an optional peer dependency, the entry draws
  the grid's `exportSheet()` on the document with jsPDF's own calls (no table plugin): the header rows
  with bands merged over their columns, the data rows with the grid's texts and alignment, the group
  rows across the row, group footers, the totals; the grid's widths narrowed to the page; rows that do
  not fit go on to the next page under the header rows again; right to left from the right edge.
  Options: `topLeft`, `columnWidths`, `margin` (40 pt), `indent`, `repeatHeaders` (`true`),
  `selectedRowsOnly`, `loadPanel` (with Stop), `customizeCell({ gridCell, pdfCell })`,
  `customDrawCell({ doc, rect, gridCell, pdfCell, cancel })`, `onRowExporting({ rowCells, rowHeight })`;
  ours: `fitColumns` (`'shrink'` / `'fill'` / `'none'`), `wordWrapEnabled`, `fontSize`, `headers`,
  `groups`, `summaries`, `pageSize`, `onProgress`, `signal`. It resolves with where the table ends
  (`{ page, y }`). Types `PdfExportOptions`, `PdfCell`, `PdfCustomizeCellArgs`, `PdfCustomDrawCellArgs`,
  `PdfRowExportingArgs`, `PdfExportResult`, `PdfMargin`. `'pdf'` in `export.formats` puts “Export all
  data to PDF” in the toolbar's menu (`onExporting` with `format: 'pdf'`).
- An export given a signal that is already stopped, or stopped while rows in memory are collected,
  now rejects with the `AbortError` instead of going on.
- Row drag and drop (`rowDragging`): the `rowDragging` prop and the live
  `grid.rowDragging` — `allowReordering`, `allowDropInsideItem`, `dropFeedbackMode` (`'indicate'`: a
  line; `'push'`: the rows make room), `showDragIcons` (a drag icon column pinned to the start; off:
  the whole row), `handle`, `group` (drag between grids), `data`, `dragDirection`, `boundary`,
  `container`, `cursorOffset`, `dragTemplate`, `autoScroll` / `scrollSpeed` / `scrollSensitivity`;
  ours: `keyboard`, `moveUpKeys` / `moveDownKeys` (`Ctrl+Shift+ArrowUp` / `Down`), `columnWidth`. A
  copy of the row follows the pointer (`settings.dragGhost`, `dragThreshold`); the rows scroll near
  the edges, also over pooled rows of the virtual list. Handlers `onDragStart`, `onDragMove`,
  `onDragChange`, `onDragEnd` (cancelable, `GridRowDragEventArgs`) and `onReorder`, `onAdd`,
  `onRemove` (`GridRowDropEventArgs`, with `promise`), with `fromIndex`, `toIndex`, `itemData`,
  `itemKey`, `toItemData`, `dropInsideItem`, `fromComponent`, `toComponent`, `fromData`, `toData`.
  `moveRow(fromIndex, toIndex)`; Escape cancels a drag; moves are announced. Texts `gridDragColumn`,
  `gridDragRow`, `gridRowMoved`, `gridRowMovedTo`, `gridRowDroppedOnto`, `gridRowMoveFirst`,
  `gridRowMoveLast`, `gridRowDragCanceled` (en/tr); tokens `datagrid.drag-color`, `drag-radius`,
  `row-drag-opacity`, `row-drag-placeholder`, `row-drop-color`, `row-drop-width`,
  `row-drop-inside-width`, `row-ghost-radius`.
- Docs: “Export to PDF” on the Selection and export page; a new page “Row drag and drop”
  (`/datagrid/drag`: reorder in memory, on a server with an order field, between two grids);
  `e2e/checks/43-datagrid-pdf-drag.mjs`.

### DataGrid infinite scrolling and virtual columns

- Infinite scrolling (`scrolling.mode: 'infinite'`): `mode: 'infinite'` next to
  `'virtual'` and `'paged'`. The rows show part by part (`pageSize` for rows in memory, the block size
  of a source that loads by blocks), the next part loading as the view nears the end; the scroll bar
  grows with the rows that came, and the rows stay pooled and in the source's block cache. No total is
  needed: over a source with `count: false` a part that comes back short ends the rows. While a part
  loads a “Loading more rows…” mark shows over the last rows, with Retry when it fails (the bottom
  bar does with the mark off; Retry asks `onMoreRowsLoading` first); the pager is hidden; Ctrl+End goes
  to the last row shown and loads the next part; a sort, filter, search or grouping starts again from
  the first part. Grouped rows, details, the selection, the row in edit and the focused row keep
  working; “select all” and the export take every row. Settings `loadMoreDistance` (`0`),
  `preloadEnabled` (`false`; in virtual mode it loads a part on each side of the view),
  `loadMoreIndicator` (`true`). `loadMore()`, `loadingMore`, `endReached`,
  `onMoreRowsLoading` (cancelable, `{ skip, take }`) and `onMoreRowsLoaded` (`{ skip, count, ended }`);
  in infinite mode `pageIndex()` is the last part shown and `pageIndex(n)` loads up to it, `pageCount`
  counts the parts, `totalCount()` is −1 until the end is known, `aria-rowcount` −1 too. Texts
  `gridLoadingMore`, `gridLoadMoreFailed`, `gridRecordsLoaded` (en/tr); tokens `datagrid.more-gap`,
  `more-padding-block`, `more-padding-inline`, `more-offset`, `more-radius`, `more-color`,
  `more-danger-color`, `more-background`, `more-shadow`.
- Virtual columns (`columnRenderingMode: 'virtual'`): `settings.columnRenderingMode`
  (`'standard'`) and a column's own `columnRenderingMode`, which wins. Only the scrolling columns in
  view and `extraColumns` (`2`) on each side get cells, in the header, the filter row, the rows, the
  group rows' items under their columns, the group footers and the totals; pinned columns, the active
  column, the column in edit and the columns that stay `'standard'` always do. Cells keep their track
  (the per-grid sheet places them by number), `aria-colindex` and `aria-colcount` stay the real ones; a
  band header spans its columns drawn only and keeps its real `aria-colindex` / `aria-colspan`.
  Resizing, moving (over columns without cells too), pinning and “Fit all columns” work as before; the
  keyboard moves into a column without cells, which gets them and scrolls into view; CSV, Excel and
  PDF write every column. `renderAsync` (`'auto'`), `columnRenderingThreshold` (`300` ms) and
  `columnRenderingDelay` (`300` ms) decide whether new columns are drawn as the rows scroll or once the
  scrolling stops. Measured in Chrome on 200 columns × 100,000 rows: 4,776 cells in the page before,
  154 after (206 at most while scrolling sideways); scrolling down 26–27 fps before, 48–51 after;
  sideways about 60 fps both ways.
- The band header rows keep every band and the pieces over pinned columns on one line (a piece over a
  pinned column could fall to a line of its own, with no height).
- Docs: a new page “Scrolling” (`/datagrid/scrolling`: the modes, infinite scrolling over a slow
  server without a count, rows in memory grouped part by part, 200 virtual columns);
  `e2e/checks/44-datagrid-infinite-columns.mjs`.

### DataGrid band headers and adaptive columns

- Bands (band columns): a `GridBand` in `columns` (`title`, `columns` — columns and
  bands to any depth —, `name`, `align`, `sticky`, `hidden`, `movable`, `hideable`, `pinnable`,
  `menu`, `headerCell`), or given flat with `isBand` and a column's `ownerBand` (a band's `name` or
  place). The header becomes a row per level of bands over the titles, each band's header over its
  columns (`columnheader` with the `aria-colindex` of its first column and `aria-colspan`; the band
  rows count in `aria-rowindex` / `aria-rowcount`). A column moves only inside its band (dragging,
  “Move”, `visibleIndex`), a band among its neighbours with all its columns; a band is pinned, hidden
  and moved as a whole (pinning a column in a band pins its band); a band header does not sort.
  Hiding all its columns hides a band. A band's menu (its button, Alt+Down): pin, move, hide, the
  column chooser, reset. Up from a column's header goes to its band's, Down back, Left / Right along
  the bands of a row. With bands the column chooser is a `TreeView` with check boxes. The layout
  keeps `bands` (each band's hidden state and side; its place comes from its columns) and puts a band
  torn apart by a layout back together. `columnOption` and `columnSettings` take a band's name;
  `addColumn` takes a band, or a column with `ownerBand`. CSV writes a line per band level above the
  titles; `exportSheet()` gives the band rows as header rows and `merges` (the cells a band, or a
  column down the band rows, spans). Setting `bandAlign` (`'center'`). Text `gridHideBand`, token
  `datagrid.band-line-color`. Over a pinned column no band covers, an empty piece stays with the
  column so the band rows scroll under it. Excel: the sheet carries the merges, the writer does not
  apply them yet.
- Adaptive columns: `settings.columnHidingEnabled` and a column's `hidingPriority` (Bind). While the
  grid is narrower than its columns, they hide (the last one first; given a priority on any column,
  only those, the lowest first; pinned and grouped columns never), worked out from the widths kept
  and the viewport's width only, again on every resize. A “…” column at the end of the scrolling
  columns opens a row's adaptive detail under the row (one at a time), before the row's master-detail:
  the hidden columns' titles and values in the edit form's `FormLayout`, editors where the row can be
  edited in its cells (they write into the row's draft; `'cell'` mode saves each). The detail rides on
  the master-detail rows (measured, `aria-owns`, Tab in and out). `adaptiveDetail` (`colCount`,
  `minColWidth`, `labelMode`, `editors`, `expandOnEdit`, `columnWidth`, `toggleKeys`; live through
  `grid.adaptiveDetail`), `onAdaptiveDetailRowPreparing` (`formOptions`),
  `onAdaptiveDetailRowExpanding/Expanded/Collapsing/Collapsed`, `expandAdaptiveDetailRow(key)`,
  `collapseAdaptiveDetailRow()`, `isAdaptiveDetailRowExpanded(key)`, `adaptiveHiddenColumns`;
  `getVisibleRows()` lists it as `rowType: 'detailAdaptive'`. Editing a row in `'row'` mode opens
  its detail and leaving the row closes it (`expandOnEdit`). Hidden columns still count as shown:
  `getVisibleColumns()`, the column chooser, copying and the export have them. Texts `gridAdaptive`,
  `gridAdaptiveOf`; tokens `datagrid.adaptive-*`.
- The per-grid column stylesheet now targets the cells of the grid's rows only, so the fields of an
  edit form inside the grid no longer pick up the rules of hidden columns.
- Docs: a new page “Bands and adaptive columns” (`/datagrid/bands`); `e2e/checks/42-datagrid-bands-adaptive.mjs`.
- Excel export merges a band's header over its columns and a column's header down the band rows (`mergeHeaders`, default `true`).

### FilterBuilder, the DataGrid filter panel and the filter value

- `FilterBuilder` (`src/components/filterbuilder/`): a tree of groups (`and`, `or`, `notAnd`,
  `notOr`) and conditions (field, operation, value) whose `value` is the data layer's
  `data.FilterExpression`, two-way with `x-model`; a condition without its value stays out of it.
  `fields` (`dataField`, `caption`, `dataType`, `format`, `lookup`, `filterOperations`,
  `defaultOperation`, `editor`, `editorOptions`, `customizeText`, `trueText` / `falseText`; Bind
  fields), `customOperations` (`name`, `caption`, `dataTypes`, `hasValue`, `editor`,
  `customizeText`, `calculateFilterExpression`, `readFilterExpression`), `groupOperations`,
  `maxGroupLevel`, `allowHierarchicalFields` (dotted fields as submenus), `texts`, `locale`, `label`,
  `size`, `addKeys` (`Insert`), `removeKeys` (`Delete`). Operations are the data layer's (`in` /
  `notin` read the standard `anyof` / `noneof`); per type as the (`defaultOperations()`).
  Values are edited in place with the kit's TextBox, NumberBox, DateBox, DropDown (yes/no, lookups),
  TagBox (`in` / `notin`), two boxes for `between`, none for `isblank` / `isnotblank`.
- Every change is a method and asks first: `addCondition`, `addGroup`, `removeItem`, `setField`,
  `setOperation`, `setConditionValue`, `setGroupOperation`, `clear`, `openEditor` / `closeEditor`,
  `focusItem`; `onItemAdding/Added`, `onItemRemoving/Removed`, `onItemChanging/Changed` (cancelable,
  `e.value` changeable), `onValueChanged`, `onEditorPreparing` (`options`, an `editor` of your own, or
  `cancel`) / `onEditorPrepared`. `filterText` (property) and the `filterText(value, options)`
  function write a filter as `[City] Equals 'Ankara' And [Amount] Is greater than '100'`;
  `FilterBuilderModel` is the logic without the view.
- Keyboard and ARIA: a `treegrid` (rows with `aria-level`, `aria-posinset`, `aria-setsize`, a kit
  Button per `gridcell`, named “Field: City”, “Operation: Equals”…), one Tab stop with roving focus;
  arrows, Home / End, Ctrl + Home / End, Alt + Down opens a menu on its chosen item, F2 / Enter the
  value editor (Enter keeps, Escape gives up, Tab keeps and goes on, from “from” to “to” first).
  Texts `filterBuilder…` / `filterOp…` (en, tr). Tokens `filterbuilder.*`
  (`tokens/component/filterbuilder.tokens.json`): the rows indent per level with a line along each group.
- DataGrid: `settings.filterPanel` (a panel under the rows: the check box, the filter's text that
  opens the builder, “Create Filter”, “Clear”), `settings.filterSyncEnabled` (`'auto'`: while the
  panel shows; the filter row and header filters are part of the filter value both ways, conditions
  they cannot show stay in it), the column feature `filterBuilder` (default `true`), the props and
  properties `filterValue` and `filterEnabled` (Bind, followed), `filterPanelText`, `filterBuilder`
  (the builder's props, live) and `filterBuilderPopup` (the `MxForm` window: `title`, `showTitle`,
  `width`, `height`, `resizable`, `movable`, `showCloseButton`, `showMaximize`, `fullScreen`), the
  methods `openFilterBuilder()`, `closeFilterBuilder(apply?)`, `clearFilterValue()`, the property
  `filterText`, the events `onFilterBuilderOpening/Opened/Closing/Closed`; `onFilterChanging` /
  `onFilterChanged` carry `filterValue` and `filterEnabled` (and the previous ones) and run for the
  panel and the builder too. A date condition chosen as a day stays a day in the filter value and
  goes to the data source by the day. The kept layout and `state()` keep `filterValue` and
  `filterEnabled`. `clearFilters()` takes the filter value away too. Texts `gridFilterPanel…`,
  `gridFilterBuilderTitle`; tokens `datagrid.filter-panel-*`, `datagrid.filter-text-*`,
  `datagrid.filter-icon-size`, `datagrid.filter-builder-buttons-gap`.
- Docs: a FilterBuilder page (Data group) and “Filter panel and builder” on DataGrid: Filtering
  (the 100,000-row server grid of “Filters” moved there, with the panel); `e2e/checks/41-filterbuilder.mjs`.

### DataGrid pager, columns at run time, header filter ranges and entries

- The pager is a part of its own (`nav`, named by `pagerLabel` or “Pages: <grid>”): the page sizes
  (`pageSizeSelector`, default `false`; `allowedPageSizes`, numbers and `'all'`, default `'auto'`:
  half, once and twice the page size), the text (`pagerInfo`; `pagerInfoText` with `{0}` / `{page}`,
  `{1}` / `{count}`, `{2}` / `{total}`; the default `gridPageOf` now reads “Page 3 of 12 (250
  items)”), the steps (`pagerNavigation`) and the pages (`pagerNeighbors`, each named “Page 3”, the
  current one `aria-current="page"`). `pagerDisplayMode`: `'full'` (page buttons, the sizes as
  pressed-state buttons), `'compact'` (a page number box and a drop-down of the sizes, the text
  hidden), `'adaptive'` (default: full while it fits in the bar, measured on resize). `pager: 'auto'`
  shows it only while there is more than one page (default stays `true`). The pager's buttons keep
  their element while they stay, so focus stays on a pressed page button.
- Page size: `pageSize(n?)` (0: every row on one page), `pageIndex(n?)`, `totalCount()`;
  `onPageSizeChanging` (cancelable) / `onPageSizeChanged` (`{ pageSize, previous }`); the grid goes
  back to the first page (`onPageChanged` tells it). A source that loads by page gets the new size
  through the data layer's `DataSource.setPageSize`; a source of blocks pages by ranges. The size the
  user chose is kept with the layout (`layoutKey`) and in `state()` (`pageSize`); a new `pageSize`
  prop wins over it. `pageKeys` (default `'page'`): PageUp / PageDown turn the page in paged mode
  (`'rows'`: a screen of rows, as before).
- Columns at run time: `addColumn(column, index?)` (what the kept layout says of a column added later
  applies), `deleteColumn(field)` (its sort, grouping and filter go with it, without `…Changing`
  events), `columnCount()`, `getVisibleColumns()`. `columnOption(field, name, value)` now writes any
  field of the definition too (`title` follows where it shows; anything else makes the column's cells
  again in every row, the header, the filter row, the group rows and footers and the totals, its
  layout, sort and filter kept; a field the rows are read by — `type`, `value`, `lookup` … — queries
  them again), plus `hidden`, `flex`, `filterValues`, `filterType`; `columnOption(field, options)`
  sets several. `onOptionChanged` tells each, and `name: 'columns'` with the fields for a column added
  or taken out. Rows in memory compare a column's type from its definition on every query.
- Header filter: a column's `headerFilterInterval` (`Bind`) groups its values — a number column in
  ranges of that size (“0 – 100”, several sizes a tree), a date column in a tree of years → quarters
  or months → days → hours → minutes → seconds down to the part it names; dates are a tree by default
  (`headerFilterDateInterval`, default `'day'`; `null` lists the dates). The tree is the kit's
  `TreeView` with check boxes and a “Select all” `CheckBox`; a node is kept as its path (`2026`,
  `'2026/3'`, `'2026/3/15'`) and filters with `>=` its start and `<` its end, on a
  server too. Counts are worked out in the browser from the distinct values (memory, an adapter that
  groups, or `loadValues`). `headerFilterItems`: entries of its own, `{ text, value }` (a value may be
  a filter expression), or a function of `{ column, filter, signal, values() }`. `filterValues` and
  `filterType` (`'include'` / `'exclude'`, both `Bind`) on the column, `filterType` in `grid.filters`;
  in the list, choosing every value and then taking some away leaves those out.
- Texts (en, tr): `gridPage`, `gridPageCount`, `gridPageNumber`, `gridPageButton`, `gridPageSize`,
  `gridPageSizeAll`, `gridValueRange`, `gridQuarter`; `gridPageOf` gained `{total}`. Tokens
  `datagrid.page-number-width`, `page-size-width`, `values-row-height`.
- Docs: “Pager” (Overview), “Columns at run time” (Layout and events), “Ranges, dates and entries”
  (Filtering), the settings, events, columns and methods tables. Tests: 23 new in the datagrid
  (pager, runtime columns, intervals); `e2e/checks/40-datagrid-pager-columns.mjs`.

### DataGrid selection look, menu tones, deletions in one save

- Selected rows wear the design language's selection look, as the lists and the tree do: tokens
  `datagrid.selected` (`color.selection.bg`, was `color.accent.subtle`), new `selected-text`
  (`color.selection.fg`), `selected-border` (`color.selection.border`), `selected-border-width`
  (`selection.border-width`), `selected-effect` (`effect.selection`), `indicator-width`,
  `indicator-length`, `indicator-radius` (`indicator.*`) and `indicator-color`
  (`color.selection.indicator`). The fill is the row's background, the frame and the effect are
  drawn over the cells (sticky ones too) and the bar at the start where the language has one (Fluent);
  none of it takes room. Hover and the active row's tint lie over the fill, the focus ring on top; on
  a selected row the fill stands for the stripe and the new-row tint.
- `datagrid.ghost-shadow` and `datagrid.export-shadow` are `{elevation.popup}` (were `{shadow.8}`).
- `MenuItem.tone` (`Bind<'standard' | 'accent' | 'success' | 'caution' | 'danger'>`): `MenuList`
  writes `data-tone` on the item (none for `standard`) and follows a function. The grid gives each
  action's `tone` to its items in the row's "more" menu, the context menu and the bars' "Actions" menu.
- `deleteRows(rows)`: several rows in one save, asked once. The ready `remove` on several rows
  (bars, context menu) uses it, through the data layer's `ChangeTracker.removeRows`: in `wait` and
  `background` one save, one request when the adapter saves in batches; `batch` marks them as before.
- Docs: the selection look (Selection), `tone` and the one save (Row actions), `deleteRows` (API).
  `e2e/checks/36-datagrid-bar-actions.mjs` checks that the Delete item carries `data-tone="danger"`.
- `Toolbar`: a button that moves into the "more" menu keeps its `tone` on the menu item.

### DataGrid master-detail rows

- `masterDetail` (each field a `Bind`, live through `grid.masterDetail`): `enabled` (the expand
  column, after the status and check box columns, pinned like them), `template(ctx)` (what a row's
  details hold: a component, an element or a text; `ctx` has `row`, `rowIndex`, `key`, `grid`,
  `collapse()`), `autoExpandAll`, `canExpand` (a value or a function of the row), `keepDetails`
  (default `true`: a closed row keeps its content), `keepLimit` (default `100` details kept out of
  view), `height` (a value or a function of the row; default the content's), `estimatedHeight`
  (default `200`), `columnWidth` (default `36`), `toggleKeys` (default `['Enter', ' ']`), `arrowKeys`
  (default `true`). Changing `enabled`, `autoExpandAll` or `template` opens or closes every row again.
- A row's details are a row of their own under it, one cell across the grid that stays in place while
  the columns scroll sideways. They are not pooled: made the first time they show, kept while the row
  is open (parked out of view, laid out but not drawn), disposed when the row leaves the data, past
  `keepLimit`, on closing without `keepDetails`, or with the grid. Their height is measured (a
  `ResizeObserver`, so a tab or a nested grid that changes size moves the rows after it) and fed to the
  scroll geometry (`ExtraHeights`, two Fenwick trees), so the scroll bar, `reveal` and moving to a row
  stay right in the virtual list and on a page; the pooled rows keep their path.
- Methods `expandRow(key)`, `collapseRow(key)`, `isRowExpanded(key)` (reactive), `expandAllRows()`,
  `collapseAllRows()`. The row events are the groups' ones, now with `kind: 'group' | 'detail'` (and
  `row` for details): `onRowExpanding` / `onRowCollapsing` (cancellable) and `onRowExpanded` /
  `onRowCollapsed`, from the user and programmatically. `onRowPrepared` with `rowType: 'detail'`,
  `getVisibleRows()` lists the details after their row. `GridRowExpandingEventArgs` and
  `GridRowExpandedEventArgs` are unions by `kind`: a handler that reads a group's `key` narrows first.
- Keyboard and ARIA: Enter / Space and Right / Left on the expand cell, Tab into the row's details,
  Escape or Shift+Tab back to the row, Tab out of the grid from their last stop; with details on the
  screen Tab never lands in another row's details. The arrow is a button with `aria-expanded` and
  `aria-controls`; grouped (a treegrid) the row says `aria-expanded` too. The details come right after
  their row in `aria-owns`, count in `aria-rowindex` / `aria-rowcount`, and are named “Details of row
  3”. Clicks, keys, focus, paste and tooltips inside the details are left to their content.
- Texts `gridDetails`, `gridDetailsOf` (en, tr); tokens `datagrid.expand-color`, `expand-radius`,
  `detail-padding`, `detail-background`. Docs: “Master-detail” page (`/datagrid/master-detail`).
  `e2e/checks/39-datagrid-master-detail.mjs`.

### DataGrid edit forms, popups and validation rules

- `settings.editMode: 'row' | 'cell' | 'batch' | 'form' | 'popup'` (default `'row'`, live): how a
  row is edited and when it is handed to saving. `saveMode` still says how a row handed over is
  sent. `'row'` is what the grid did before (in the cells, on leaving the row); `'cell'` saves an
  existing row as each of its cells is left (a new row on leaving it); `'batch'` sets the save mode
  to `'batch'` (the same as `saveMode: 'batch'` with `'row'`), and switching to or from it starts
  again with the data, like `saveMode`.
- `'form'`: the row opens as a form in its place, across the grid's width — the kit's `FormLayout`
  with a field per column, each the editor its cell gets (by type, a lookup's, the column's own
  `editor`), framed and labelled, read-only where the user cannot fill it, with the messages of the
  checks on the fields and the row's own message above them. The rows after it move down by its
  height, in the virtual list and on a page. Save (or Enter in a one-line field) saves the row as the
  save mode says, Cancel (or Escape) gives it up; focus goes into the form and back to the row. A
  field whose value changed through another (`setCellValue`) is made again. Typing on a cell does
  not open it; Enter, F2, the start-edit click, the `edit` action, `editRow()` and `addRow()` do.
  Editing another row, a new row, sorting, filtering, paging and `refresh()` give the form up, as
  the standard does.
- `'popup'`: the same form in the kit's `MxForm` as a modal window, for existing and new rows:
  Save and Cancel in its footer (Enter and Escape press them), the close button cancels, focus stays
  inside and comes back to the row.
- `form` prop / `grid.form` (live): `items` (field names or kit `FormItem`s — a column's field gets
  its editor; groups, buttons and templates are the form's own), `colCount` (default 2),
  `minColWidth`, `labelMode`. `popup` prop / `grid.popup` (live): `title`, `showTitle`, `width`,
  `height`, `resizable`, `movable`, `showCloseButton`, `showMaximize`, `fullScreen`. Column
  `formItem`: `visible`, `colSpan`, `label`, `helpText`, `editorOptions`, `order`. `onOptionChanged`
  tells `form.*` and `popup.*`.
- Column `validationRules`, the standard set: `required` (`trim`), `numeric`, `range`, `stringLength`
  (`trim`), `pattern`, `email`, `compare` (`comparisonTarget(row)`, `comparisonType`), `custom` and
  `async` (`validationCallback({ value, row, column, rule })`), each with `message`,
  `ignoreEmptyValue` (defaults) and, where the standard has it, `reevaluate` (on for
  `async`). Checked with the kit's `checkRules` as a value is written and before the row is saved,
  after `required` and `validate` (which keep working); `async` rules run last and together, the row
  waits for them (its cell busy) and a value is not checked twice. Batch `saveChanges()` checks every
  row first. Messages in the cells, the form and the window.
- `onRowValidating` (`{ key, row, isNew, changed, errors, isValid, errorText, cancel }`) after the
  cells, once per check of the row: add or take out messages, or say no with `errorText`.
  `onEditorPrepared` (`{ field, row, isNew, editor, element, place: 'cell' | 'form' }`).
  `onEditingStart` comes for the form too (`field` `''`); `onEditorPreparing` for every form field
  (`cancel` leaves it out).
- `settings.confirmDelete` (default `true`): `deleteRow()` and the ready `remove`
  ask with the kit's `confirm()` first, once for all the rows an action deletes; not in batch mode.
  `settings.selectTextOnEditStart` (default `true`, what the grid did): off, the caret goes to the end.
- Methods: `editRow(i)` opens the form in the form modes, `editRowByKey(key)`, `saveEditData()`,
  `cancelEditData()`; `closeEditCell()` keeps the form's values. Texts in en and tr:
  `gridConfirmDelete`, `gridConfirmDeleteRows`, `gridConfirmDeleteTitle`, `gridEditRowTitle`,
  `gridNewRowTitle`, `gridRowInvalid`. Tokens: `datagrid.form-padding`, `form-gap`,
  `form-background`, `form-message-color`, `form-label-color`, `form-label-font-size`.
- Docs: a new page "Edit forms and popups" (`/datagrid/forms`: the form with groups and an edit-mode
  switch, the window, the rules with an async one) with the tables of modes, settings, form and popup
  options, rules, events and methods; rows in the API and layout pages; a browser check
  `e2e/checks/38-datagrid-forms.mjs`.

### DataGrid actions in the bars

- Row actions can show in the toolbar (`actionsLocation: 'toolbar'`, the new `rowActions` toolbar
  item, at the start, placed through `toolbar.items` like the others) or at the start of the bottom
  bar (`'bottom'`, on a kit `Toolbar` of its own) for the rows they act on: the selected rows, or the
  active row without selection (`actionsTarget: 'selection' | 'focused' | 'auto'`). Default
  `'row'`, as before; an action's `location` wins, and the actions column shows only while an action
  sits in the row. No target: nothing shows. One row: its own actions, as the row would show them.
  Several rows: the actions every row has (same `id`, visible for each), disabled while disabled for
  one of them (`actionsMultipleEnabled: 'any'`: enabled for any, and run on those), with the count
  after the text ("Print (3)", `actionsShowCount`), named "Print, 3 rows" and described by what the
  bar acts on ("Actions for 3 selected rows"), which is announced when it changes.
- Running on several rows: `onclickMany(rows, e)` once, else `onclick` for each row in turn, a
  promise waited for; a throw, a rejection or a promise of `false` counts the row as failed and does
  not stop the others unless `actionsStopOnError` (or the action's `stopOnError`). While it waits the
  export load panel shows the progress and a Stop button (`actionsProgress`, `actionsStopButton`,
  `grid.stopAction()`); the outcome is announced ("Print: 2 of 3 done, 1 failed"). `multiple: false`
  keeps an action to one row (the ready `edit`). The ready `remove` marks every row in batch mode and
  sends each in the other modes.
- After "select all" over a server (rows not loaded) only actions with `onclickSelection(selection,
  e)` show; they get the selection state of `grid.selection`.
- A row's actions are in its context menu (right click, Shift+F10 / the context menu key), wherever
  they show: inside a selection of several rows the common ones, with the count, for all of them;
  right click makes the row the active one. `actionsContextMenu` and an action's `contextMenu` turn
  it off; `onContextMenuPreparing` gets them in `e.items`; an empty menu does not open.
- `actionsDisplay: 'menu'`: a row shows only its "more" button, every action in its menu, and the
  column is as wide as that button (unless an action is a button always); the bars show one
  "Actions" menu button. An action's `menu: 'auto' | 'always' | 'never'` wins. The row's "more"
  button is named "More actions for row N".
- New: `onActionRunning` (cancelable: `{ action, rows, selection, location }`), `onActionRan`
  (`{ action, rows, location, done, failed, canceled, errors }`), `grid.runAction(id, rows?)`,
  `grid.actionTargets`, `grid.barActions`, `grid.stopAction()`. A press in a row runs through the same
  events. `GridAction.onclick` is optional now and may return a promise; new fields `location`,
  `menu`, `multiple`, `multipleEnabled`, `stopOnError`, `showCount`, `contextMenu`, `beginGroup`,
  `onclickMany`, `onclickSelection`. Texts in en and tr (`gridActionCount`, `gridActionCountLabel`,
  `gridActionsForRow`, `gridActionsForSelectedRow`, `gridActionsForSelectedRows`, `gridActionRunning`,
  `gridActionProgress`, `gridActionStop`, `gridActionDone`, `gridActionPartly`, `gridActionFailed`,
  `gridActionStopped`, `gridMoreActionsForRow`).
- Docs: "Row actions" has a new example (location switch, menu only, Approve with `onclickMany`,
  Print row by row, Delete) and tables of the settings, action fields, events and members; a browser
  check `e2e/checks/36-datagrid-bar-actions.mjs`.

### DataGrid Excel export

- New entry `@motifx-community/ui/excel`: `exportDataGrid({ component, worksheet, … })` writes a
  `DataGrid` to an ExcelJS worksheet's `excelExporter.exportDataGrid`; ExcelJS is an
  optional peer dependency the app brings, and apps that do not import the entry never load it. It
  resolves with the cells written (`{ from, to }`). Options `topLeftCell` (`{ row, column }` or
  `'B2'`), `customizeCell({ gridCell, excelCell })`, `autoFilterEnabled`, `keepColumnWidths`,
  `selectedRowsOnly`, `loadPanel`, `encodeExecutableContent`, and `headers`, `frozenHeader`, `groups`,
  `outline`, `summaries`, `numberFormats`, `booleanText`, `pageSize`, `onProgress`, `signal`. Also
  `excelNumberFormat` and `excelDateFormat` (an `Intl` format as an Excel number format).
- The sheet: a frozen header row, the rows in the grid's order with its filter, search and grouping
  (every matching row, a server's in parts), group rows ("Column: value" with their summary items,
  aligned ones under their columns) with outline levels, group footers and the totals (several items
  of a column a row each). Numbers stay numbers with a number format made from the column's `Intl`
  format, dates stay dates, yes/no cells are `TRUE` / `FALSE`, lookup and list cells and columns with a
  `format` function hold their texts; widths follow the grid.
- Column `format` also takes `Intl` options for number and date columns (shown by the grid, and the
  number format in Excel).
- `export` prop and live `grid.export` (`formats`, default `['csv']`; `allowExportSelectedData`;
  `texts`: `exportTo`, `exportAll`, `exportSelectedRows`, `formats`): the toolbar's export button
  offers a command per format, and "Export selected rows" for each, as a menu when there is more than
  one. `csv` is written by the grid as before; other formats raise `onExporting` with `format`,
  `component` and `selectedRowsOnly`, where the app writes the file. `exportTo(format, options)`,
  `exportSheet(options, write)` (the rows as a sheet of typed cells for any writer; `onExported`
  follows with its `format`), `cancelExport()`; types `GridSheet`, `GridSheetRow`, `GridSheetCell`,
  `GridSheetColumn`, `GridExportCell`, `GridSheetOptions`, `GridExportSettings`, `GridExportTexts`,
  `GridLoadPanel`.
- A load panel over the rows while an export runs, with its progress and a button that stops it
  (`loadPanel`; on for `exportDataGrid`, off for `exportCsv` / `exportRows`). A stopped export rejects
  with the `AbortError`. Texts `gridExportAll`, `gridExportSelectedRows`, `gridExportProgress`,
  `gridExportCancel`, `gridExportCanceled`, `gridFormatXlsx`, `gridFormatCsv`, `gridFormatPdf` in en
  and tr. ExcelJS 4.4 as a dev dependency for the tests and the docs.

### DropDown, ComboBox, Autocomplete, Lookup

- `DropDown`: pick one item (APG select-only combobox); `items` (plain values, `DropDownItem`s or any
  shape through `textField` / `valueField` / `iconField` / `groupField` / `enabledField`) or a
  `dataSource` of `@motifx-community/data` (searched on the server, a value on no loaded page found
  by key); `searchEnabled` (a TextBox in the list), `searchMode`, `searchDelay`, `clearButton`,
  `itemTemplate`, `fieldTemplate`, `matchWidth`, groups, type-ahead, long lists drawn in view only.
- `ComboBox`: a text field whose list follows the text (APG combobox, list autocomplete); items in
  memory or a data source; `minSearchLength`, `searchDelay`, `acceptCustomValue`, `autoHighlight`,
  `showDropDownButton`. `Autocomplete`: the value is the text.
- `Lookup`: a drop-down with a table-like list (`columns` with captions, widths, alignment), a search
  box on by default, for data sources.
- Shared parts: `OptionList` (`role="listbox"`, items or an `ItemSource` that loads while scrolled,
  windowing with spacer rows, `handleKey`, `typeAhead`), `DataItems` (an array or a `DataSource`
  behind one interface), `readItemField`, `functionValue` (a function prop with parameters is the
  value, one without is a getter). `@motifx-community/data` is a peer dependency.

### Calendar, DateBox

- `Calendar`: the APG date grid with year and decade views; `min`, `max`, `disabledDates`, `locale`
  (names and first day of the week from `Intl`), `firstDayOfWeek`, `showWeekNumbers` (ISO),
  `showOtherMonths`, `showTodayButton`, `currentView`, `minView` (pick a month or a year).
- `DateBox`: `type` date / time / datetime typed through a mask in the locale's order
  (`datePatternOf`), a calendar and a list of times (`timeStep`, `showSeconds`) on a popup,
  `displayFormat` while not edited, `min` / `max` / `disabledDates` checked, an unfinished text
  reported (`unfinished`, `invalidDate`).

### FormLayout

- `FormLayout`: the fields of a data object on a grid (`columns`, `minColumnWidth`), each with an
  editor by name or by the type of its value (`FormLayout.editors` can be extended), bound both ways;
  groups with captions, `colSpan`, `visible`, buttons (`submit`), templates; one validation group;
  `onValidSubmit` / `onInvalidSubmit`.

### Field

- A stored `null` stays `null` (a nullable value round-trips). A field checked when it is left waits
  for a press in progress to end, so an error line appearing cannot move a button away from the
  pointer. The clear button is shared (`showClearButton`). `Popup` placements on every side
  (`top`, `start`, `end-start` …) and a closed popup stays hidden whatever its content's display.

### docs app

- The docs site is one MotifJS app: `Application` + router (history mode), `DocsLayout` with a
  `RouterView`, pages loaded when first opened, `SiteSettings` and `PageOutline` services (each
  `Section` adds itself to the outline), the side-menu search is a `TextBox`.
- Every example is its own file (`pages/<id>/examples/`), complete with imports and state; the page
  runs it and "Show code" shows its exact source, a tab per file, with a Copy button. The content
  column grows with wide windows. The browser checks fail on any MotifJS console warning.

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
- The DataGrid reference is a side-menu group of eight pages (overview, editing, filtering and
  search, lookup columns, grouping and summaries, selection and export, layout and events, API
  reference), at most five live grids each, so no page is slow to open; a pointer to a section on
  another page is a link (`[text](/page#anchor)` in a table cell's text).

### TabDocumentManager

- `TabDocumentManager` (`src/components/tabdocs/`):
  documents in tabs, tabs in groups, groups in a layout tree of n-ary horizontal and vertical splits
  with a share per child. A document's content is any component; moving a tab or splitting a group
  moves the same component, never makes it again. `TabDocument` (`id`, `type`, `title`, `description`,
  `icon`, `tooltip`, `badge`, `dirty`, `pinned`, `preview`, `closable`, `contentLifetime`, `content`,
  `state`; Bind fields, reactive) and `TabGroup` (`documents`, `activeDocument`, `recentDocuments`,
  `locked`, `index`, `isActive`, `isMaximized`).
- The strip: icon, title, description, badge, the dirty dot in the close button's place (the button
  under the pointer), the close button (`closeButton`: `always`, `active`, `never`; a document's
  `closable`), the kit Tooltip, sideways scrolling with the wheel, the active tab kept in sight, a
  middle click closes, a double click maximizes (`maximizeOnDoubleClick`); the kit Toolbar at the end
  with Split right and Maximize / Restore (`groupActions`). An empty group says so.
- Splitters (`role="separator"`, value, orientation): the pointer, the keys (`resizeStep`), the
  smallest group size (`minGroupWidth`, `minGroupHeight`), a double click evens the sizes. A group left
  empty closes (`closeEmptyGroups`), a split left with one child gives its place to it.
- Methods: `open(doc, { group, index, active, focus })`, `close` (`onClosing` may set `e.promise`),
  `closeAll`, `activate`, `activateNext`, `activatePrevious`, `move`, `split(group, direction, doc)`,
  `closeGroup`, `focusGroup`, `maximizeGroup`, `restoreGroups`, `evenSizes`, `resizeGroup`,
  `findDocument`, `contentOf`, `saveLayout()` (plain JSON: the tree with the shares, each document's
  `id`, `type`, `title`, `state`, `pinned`, `preview`, the active and recently used tabs, the active and
  maximized group) and `loadLayout(json, factory)`. Properties `documents`, `groups`, `activeGroup`,
  `activeDocument`, `maximizedGroup`. Events: `onOpening`, `onClosing`, `onDocumentActivating`,
  `onMoving`, `onSplitting`, `onLayoutChanging` (cancelable) and `onOpened`, `onClosed`,
  `onDocumentActivated`, `onMoved`, `onSplit`, `onLayoutChanged`.
- Options: `contentLifetime` (`keep`, `lazy`, `dispose`; a document's own wins), `openPosition`,
  `afterClose` (`recent`, `left`, `right`), `activation`, `factory`, `keys` (every key, over
  `TabDocumentManager.defaultKeys`: Ctrl + Page Down / Up, Ctrl + W, Ctrl + 1…9, Ctrl + \, arrows,
  Home, End and Delete on a tab, arrows, Home, End on a splitter), `texts`, `announce` (a polite live
  region), `label` (a `region` landmark). Texts `tabDocs…` (en, tr); tokens `tabdocs.*`, with Material
  and Lilac's 3 px indicator.
- `core/glyphs.ts`: `splitMark`, the split button's glyph.
- Docs: a TabDocumentManager group with an overview page (documents and splits with a form, a grid
  and text; live options; a panel driving the API with an event log; unsaved changes asked with
  `confirm`; saving and restoring the layout); `e2e/checks/45-tabdocs.mjs`.
- Milestone 2, the tabs at an editor's level. Preview tabs: `open(doc, { preview: true })` opens a tab
  in italics that the next preview in the group replaces; it stays after a double click, unsaved
  changes, `keep(doc)`, the menu or a move (`onKeeping` / `onKept`, `previewTabs` turns it off).
- Pinned tabs: `pin(doc)` / `unpin(doc)` (`onPinning`, `onPinned`, `onUnpinning`, `onUnpinned`), first
  in pin order and never moved past the others, a pin mark that unpins, no close button unless
  `closeButtonOnPinned`, `pinnedTabSize` (`normal`, `compact`: the icon or first letter, `shrink`),
  `pinnedTabsOnSeparateRow`; close all, others, to the right or left and close saved leave them
  (`keepPinned`); saved and restored.
- Sizes and overflow: `tabSize` (`fit`, `shrink`, `fixed`) with `tabMinWidth`, `tabMaxWidth`,
  `tabFixedWidth`; `wrapTabs`; scroll buttons (`scrollButtons`) and the wheel. A tab wider than the
  strip shows its start; the active tab stays in sight when a late font changes its width.
- The look: `badge` may be `true` (a dot), `tone` (`warning`, `danger`, `success`, `accent`) colours the
  title and the badge, the description shows as `showDescription` says (`duplicates` by default: only
  when two open documents share a title).
- Menus and lists: a context menu on every tab and on the empty strip (the kit `ContextMenu`;
  close, close others, to the right, to the left, saved, all, copy the title, keep open, pin or
  unpin, split up, down, left or right, move to the next or previous group; new document, reopen
  closed, lock; `contextMenu`, `menuItems`, `onContextMenuOpening`). The group toolbar's "…" button
  opens a searchable list of the group's (or every group's, `openListScope`) documents with close
  all, close saved and lock under it (`Popup`, `ListBox`, `MenuList`; `showOpenList`). The app's own
  buttons: `toolbarItems` per group, a document's `actions` while it is active, with icons and tones.
  `newDocument` makes a document for a double click on the empty strip (`openNew`).
- Recently used, history, reopening: `showRecentList` (Ctrl+E in a browser tab, Ctrl+Tab installed;
  again to walk, Shift back, letting go of Ctrl opens; arrows, Enter and Escape alone work too;
  `recentListScope`), `goBack` / `goForward` over the documents activated in every group
  (`canGoBack`, `canGoForward`, `historySize`), `reopenClosed` (`closedDocuments`,
  `closedHistorySize`), `recentDocuments`, `moveToGroup`, `copyTitle`, `closeOthers`, `closeToRight`,
  `closeToLeft`, `closeSaved`.
- Locked groups: `lock(group)` / `unlock(group)` (`onLocking`, `onLocked`, `onUnlocking`, `onUnlocked`,
  `group.lock()`), `open` without a group goes elsewhere (a new group when all are locked, the only
  group still takes it), an "Unlock group" mark in the toolbar, “Group 1, locked” for screen readers.
- One document in two groups: `allowDuplicate` (a document's own wins) opens a copy with content of
  its own (`clone`, a `content` function or the `factory`) that shares the title, the unsaved changes
  and the state (`original`, `onClosing`'s `lastCopy`); splitting copies it (`splitCopies`, the split
  events' `copy`), or moves it as before. A layout saved with a copy brings it back as one.
- Keys: a browser tab never gets Ctrl+W, Ctrl+Tab, Ctrl+Shift+T, Ctrl+Page Up / Down and often
  Ctrl+1…9, so the default keys are ones it does get, chosen as the editor's web version does (Ctrl+Alt
  for a Ctrl the browser keeps), the desktop key kept beside them: `TabDocumentManager.browserKeys` and
  `TabDocumentManager.desktopKeys` (replacing `defaultKeys`), `keyPreset` (`auto` takes the desktop
  keys in an installed app). New keys: `closeAllTabs`, `closeSavedTabs`, `recentNext`,
  `recentPrevious`, `goBack`, `goForward`, `reopenClosed`, `keepOpen`, `togglePin`, `showOpenList`.
  Polite announcements for pinned, unpinned, kept, locked and unlocked; new `tabDocs…` texts (en, tr).
- Focus stays where it was when a group's element moves in a browser without `moveBefore`.
- Kit: `addShortcut` takes two chords in a row (`'Ctrl+K W'`); a Ctrl+Alt chord leaves a key that AltGr
  typed a character with (`{` on a German keyboard). `Toolbar` places the controls of its items
  through `controls.moveToIndex`: an item hidden (`visible: false`) before the toolbar was built
  showed, at the front. `ToolbarItem.tone`. Glyphs `pinMark`, `lockMark`.
- Docs: two more pages, Tabs (preview, pinned tabs, sizes, badges and tones, copies) and Menus and
  keys (context menus, the list, toolbar buttons, recently used, locked groups, the key table);
  `e2e/checks/46-tabdocs-tabs.mjs`; 45 presses the browser keys.
- Milestone 3, drag and drop. A tab is dragged along its strip (across the border between pinned and
  other tabs it is pinned or unpinned, `pinOnDrag`), onto another strip at the place under the pointer
  or at its end, into a group (the middle of its content), beside a group (an edge of its content: a
  split that way, `dropEdgeSize`), or along an edge of the whole layout (`layoutEdgeDrop`,
  `layoutEdgeSize`, `split(null, side, doc)`). The last tab out closes its group (`closeEmptyGroups`).
  Ctrl (Option on Apple platforms, `copyModifier`) opens a copy when the document may be open twice.
  A whole group is dragged by the empty part of its bar or by a handle at the start of its toolbar
  (`groupDragHandle`; a click on it starts "Move group to…"): beside another group, along an edge of
  the layout, or into another group, whose documents it joins (`moveGroup(group, target, side)`,
  `onLayoutChanging` / `onLayoutChanged` with `'move'`).
- What a drag shows: a copy of the tab under the pointer (`dragGhost`), a mark between tabs, a
  translucent area over the half or the whole of the group a drop would take that glides between
  places (the motion tokens, so reduced motion makes it jump), the cursor (`data-dragging`: `move`,
  `copy`, `none`), the dragged tab or group dimmed. A strip scrolls near its ends (`dragAutoScroll`);
  resting on a tab of another group activates it (`dragHoverActivate`, `dragHoverDelay`). Escape
  cancels and puts back what hovering activated and what the strips scrolled.
- Touch and pen: a long press starts the drag (`longPressDelay`), so a swipe still scrolls the strip;
  held still and let go, it opens the tab's menu. `dragThreshold` for the mouse.
- Settings: `allowDrag` on the manager and per document, `allowDragGroups`, `dropSides` on the
  manager and per group, `allowDrop` per group (both saved with the layout).
- Events: `onDragStarting` (cancelable), `onDragOver` (change the place, or cancel to refuse it; outside
  every manager it comes with `target: 'outside'`, refused), `onDropping` (cancelable, the place may
  change), `onDropped`, `onDragEnded`; each with the document (or `null` for a group), the group it
  comes from, the target, manager, group, index and side, `copy` and `byKeyboard`. `onMoving` /
  `onMoved`, `onSplitting` / `onSplit`, `onOpening` / `onOpened`, `onPinning` / `onPinned` still fire
  for what a drop does. `onSplitting`'s `group` is `null` for a split of the whole layout. `dragging`
  (reactive) says what is being dragged; `cancelDrag()`.
- Between managers: managers with the same `dragGroup` take each other's tabs and groups; the tab, its
  panel and its content move over (the other manager asks through its `onOpening`, after `onMoving`
  here) and follow that manager's settings from then on.
- Drop targets are a list the manager asks (`dropTargets`, `addDropTarget(target)`: `placeAt`, `marks`,
  `drop`); the built-in one covers the strips, the groups and the layout's edges, so the dock guides
  and floating windows of milestone 4 can be added as targets.
- Keys: the active tab a place along its strip (`moveTabLeft`, `moveTabRight`: Alt + Shift + Page Up /
  Down in a browser tab, Ctrl + Shift + Page Up / Down installed; `moveInGroup(doc, by)`), to the next
  or previous group (`moveToNextGroup`, `moveToPreviousGroup`: Ctrl + Alt + Right / Left), to the group
  on a side or a new one there (`moveToGroupLeft`, `…Right`, `…Up`, `…Down`: Ctrl + K, Shift + an
  arrow; `moveToGroup(doc, 'left' | 'right' | 'up' | 'down')`). "Move to…" (`moveTo`, Ctrl + K M; the
  tab's and the strip's menus, `moveTo` and `moveGroupTo` commands; `showMoveTo(doc | group)`): the
  arrows pick a side of a group, again that way the next group or the layout's edge, Tab the next
  group, Enter moves, Escape cancels (`targetLeft` … `targetCancel`), with the same areas shown and
  each place announced. Moved, copied, split and canceled are announced; new `tabDocs…` texts (en, tr).
- Narrow groups: the strip keeps at least one tab's room (`tabMinWidth`) and the group's toolbar folds
  its buttons into its "…" menu first (the kit Toolbar's `overflow: 'menu'`). The sizes the props give
  (`--_min-width`, `--_tab-min`, …) are written on each group, not on the root, whose inline style the
  app may replace (`style.cssText` dropped them, and the groups' smallest sizes with them).
- Kit: `ContextMenu` no longer closes on any scroll. It goes along with the element it opened on and
  closes once that element is out of sight (off the screen, or out of the box that scrolls it); the
  late scroll a press makes when it moves focus kept closing the menu of a tab. `closeOnScroll: false`
  keeps it open even then. `DragGhost` and `scrollStep` moved from the DataGrid to `src/parts/drag/`
  (exported) and the DataGrid uses them from there; a copy is now `inert`. `isChord(chords, e)` in
  `core/keyboard.ts`, for keys a component reads itself. Glyph `gripMark`.
- Docs: a Drag and drop page (dragging, settings, two managers side by side, the keys, changing a
  drop, the API); `e2e/checks/47-tabdocs-drag.mjs`; 46 chooses menu items with real clicks again.
- Milestone 4, docking. Floating windows in the page (`TabWindow`): `float(doc | group, rect?)`, a drag
  let go outside every manager (or, with the dock guides, away from them), Ctrl + K O, the menus. A
  window holds groups as the documents' area does (split, resized, dragged between), opens as large as
  the group it came from (`floatingWindowSize`), moves by the empty part of its strips (the strip is
  its title), resizes from its edges and corners, comes to the front when pressed (the page's
  `windowStack`), maximizes within the page and is restored, stays in the viewport
  (`keepFloatingInView`), closes with its last document (`closeEmptyWindows`) and docks back where it
  was on a double click on its strip (`dockOnDoubleClick`), "Dock back" or Ctrl + K D. Its maximize and
  close buttons sit in the group at its top end corner. `moveWindow`, `resizeWindow`, `maximizeWindow`,
  `restoreWindow`, `closeWindow` (each document still asks), `focusWindow`; the window's own `move`,
  `resize`, `maximize`, `restore`, `close`, `dock(side?)`, `focus`; `floatingWindows` (reactive, back to
  front). Ctrl + K Space moves it by the arrows and resizes it with Shift.
- Dock areas (`TabDockArea`) on the manager's four sides, nesting in the order they were made: each
  holds its own layout, has a size in pixels or a share (`dockAreaSize` per side, `dockAreaMinSize`,
  the documents keep their smallest) and a splitter moved by the mouse and the splitter keys.
  `dock(doc | group | window, side?, size?)` (a document not open yet opens there), `resizeDockArea`,
  `dockAreas`, `dockArea(side)`; empty areas go. Folded (`autoHide(area | doc, on)`, the pin in the
  area's toolbar, the menu, Ctrl + K H), only the titles stay along the edge (a toolbar); a click,
  Enter or resting on a title (`autoHideHover`, `autoHideDelay`) slides the area out over the
  documents (`showAutoHidden`), a press outside, Escape or focus leaving slides it back
  (`hideAutoHidden`). Auto hide is the area's, not one document's.
- Dock guides (`dockGuides`, off by default; `dockGuideKinds`): while dragging, a cross over the group
  under the pointer and a guide in the middle of each edge of the manager, shown only over a manager
  or one of its windows; the guide pointed at shows the area a drop would take, a drop away from the
  guides and strips floats. They are a drop target on the list of milestone 3 (`dockDropTarget`, asked
  before the built-in one; `TabDropTarget.follow` tells a target where the pointer is). New place
  kinds `'dock-guide'`, `'dock-area'` (`dockSide`) and `'float'` (`rect`). A drop over a manager outside
  the `dragGroup` is refused rather than floated.
- Settings, the document's own first: `allowFloat`, `allowDock`, `dockSides`, `allowAutoHide`
  (`TabDocument` and the manager); `TabDocument.window` / `dockArea` and `TabGroup.window` /
  `dockArea` (reactive). Opening a document without a group never puts it in a dock area.
- Events, each cancelable and then reported: `onFloating` (the rect may change) / `onFloated`,
  `onDocking` (side and size may change) / `onDocked`, `onAutoHiding` / `onAutoHidden` (`on`),
  `onSlideChanging` / `onSlideChanged` (a folded area sliding out or back), `onWindowClosing` /
  `onWindowClosed` (`reason`: closed, docked, empty). `onLayoutChanging` / `onLayoutChanged` also for
  `float`, `dock`, `autoHide`, `resizeArea`, `moveWindow`, `resizeWindow`, `maximizeWindow`,
  `restoreWindow`, `closeWindow`, with `window` or `area`.
- Keys and menus: float, dock back, dock left / right / top / bottom (Ctrl + K, Alt + an arrow), auto
  hide on the tab and strip menus and as keys; F6 / Shift + F6 go round the documents, the dock areas
  and the windows (`focusPart`); "Move to…" goes on past the edge of the layout to the dock area of
  that side and to a window of its own. Announced: floated, docked, folded and shown, slid out,
  window closed, maximized, restored (en, tr).
- The layout saves the dock areas (side, size, folded, layout) and the windows (place, maximized, back
  to front, where they dock back, layout): `TabLayout.version` 2; a version 1 layout still loads.
- Look: `tabdocs.window-*`, `area-*`, `panel-*`, `autohide-*`, `guide-*` tokens; Material's guides are
  its middle control height, Material and Lilac's folded titles have their 3 px indicator. The root is
  a grid now (the documents in the middle, the areas around them); the drop area and the mark are
  fixed in the viewport, above the windows.
- Kit: content moved between groups (core's `Transporter`, and `placeNode` without `moveBefore`) lost
  the scroll of everything scrolled inside it: `keepScroll` reads it before and writes it back after
  (CORE-REPORTS R29). `parts/window/` (`followPointer`, `resizeBox`, `resizeFrame`, `WindowBox`,
  `WindowEdge`): the move and resize of `MxForm`, which the floating windows use too. `dockGuideMark`
  glyph. A menu or a popup opened from a slid out area keeps it open.
- Docs: a "Dock and floating windows" page (an editor with tool areas, floating by code, the settings,
  saving the whole layout, the keys, the API); `e2e/checks/48-tabdocs-dock.mjs`; 45 reads layout
  version 2; the drag and drop page says what a drop outside the manager does now.
- Milestone 5, new browser windows. `moveToNewWindow(doc | group | floatingWindow, { rect, url })` opens
  a window of the page's origin (`window.open`, or the app's `openWindow` for an application shell, a host page or a
  test) at the size of what moves, beside it (`newWindowSize`), and moves the document, the group or the
  floating window's whole layout into it; the content is not made again. The window (`TabBrowserWindow`:
  `window`, `element`, `rect`, `groups`, `documents`, `activeGroup`, `activeDocument`, `moveToMainWindow()`,
  `close()`, `focus()`; `browserWindows`, reactive) holds groups as the documents' area does: tabs, pins,
  previews, the lists, splitting, the splitters, the menus, the keys and dragging work there. Its title
  follows its active document (`newWindowTitle`: `'{title} – {page}'` or a function).
- Back: `moveToMainWindow(doc | group | window)` (into the group it came from, else the main window's
  active one), "Move back to main window" on the tab and strip menus, Ctrl + K Shift + D
  (`moveToMainWindow` key); "Move into new window" on the tab menu, the strip menu and a floating
  window's strip ("Move window into new window"), Ctrl + K Shift + O (`moveToNewWindow` key). `move`,
  `split`, `dock` and `float` take groups of any window; "Move to…" goes through the groups of every
  window and, past floating, to a new window.
- Dragging: inside a new window as in the page (strips, a group's zones or guides, the edges of its
  layout: an `'edge'` place carries `browserWindow`). The pointer stays with a drag that leaves its
  window; the window under it there, found by its place on the screen, takes the drop. Let go past
  every window: from the page into a new window there (`'new-window'` place, with `rect`), from a new
  window back to the main window (`'main-window'`); `dragOutToNewWindow` turns it off.
- Closing: when the user closes a new window its documents come back, or close
  (`newWindowCloseAction: 'back' | 'close'`, `onWindowClosing`'s `then`); each one closing asks through
  `onClosing` as usual, back in the main window. `closeWindow(window)` and `window.close()` by code (a
  closing cancel keeps it). When the page goes away its new windows close. `onWindowClosing` /
  `onWindowClosed` carry `kind` (`'floating' | 'browser'`) and `then`; `reason` `'moved'` for a floating
  window that went into a new window; `then: 'back'` docks a floating window back instead of closing.
- Blocked: no window from the browser fires `onError` (`windowBlocked`; `windowNotUsable` for a page of
  another origin) and opens a floating window instead (`newWindowFallback: 'float' | 'none'`, changeable
  in the event). `allowNewWindow` on the manager and per document (the document's own wins).
  `onWindowOpening` (cancelable; `rect`, `url` may change) / `onWindowOpened`. `onLayoutChanging` /
  `onLayoutChanged` also for `'newWindow'` and `'mainWindow'`.
- The layout saves the new windows (place on the screen, layout, the group they came from):
  `TabLayout.version` 3, `browserWindows`; versions 1 and 2 still load. `loadLayout` puts them back as
  floating windows (`restoreWindows: 'float'`), among the main window's documents (`'main'`) or as
  windows again (`'reopen'`): a browser opens windows only on a click or a key, so `loadLayout` called
  from one opens them and `reopenWindows()` opens later what was blocked.
- The look: the page's style sheets (links, `<style>`, constructed sheets) and the attributes of `<html>`
  and `<body>` are copied into the new window and followed (a sheet added or changed later, the theme,
  the design language, `dir`, `lang`). Announced: moved into a new window, back to the main window,
  window closed, the browser did not open the window (en, tr).
- Kit, for other documents: `connectDocument(doc)` / `disconnectDocument(doc)` / `pageDocuments()`: the
  kit's document-wide listeners (shortcuts and access keys, tooltips, the focus guard, the press
  tracking of `afterPress`) work in another same-origin document too and leave it when its window
  closes. `deepActiveElement(node?)` reads the document of `node`, else the one focus went to last.
  `Popup`, `ContextMenu` and `Tooltip` open in the document of the element they open at (its own top
  layer, viewport and window events); `MenuList`, `ListBox`, `Button`, `Field`, `MxForm`, `FocusContainer`,
  the `enabled` cascade, `Control.focused` / `focusWithin` use their element's document and window; the
  window stack keeps one stack per document (`windowStack.top(doc)`); a scoped shortcut holds for parts
  of its component moved into another window. Checks that work for nodes and events of any window
  (`instanceof Element` and `instanceof KeyboardEvent` fail across windows; Chrome also remakes a
  collected node's wrapper with its new window's classes, so a DropDown in a new window stopped
  choosing after a while): `OptionList`, `Tabs`, `TreeView`, `MenuBar`, `FilterBuilder`, `Toaster` and the
  DataGrid's cell contents use them. `ResizeWatch` (exported):
  a `ResizeObserver` that follows its elements into another window, used by the DataGrid, its pager and
  rows, `Tabs`, `TextArea`, `Toolbar` and the manager's groups. `mirrorPage(source, target)` (exported).
  The DataGrid's focus, copy and paste, row drag and column sheet follow it into another window.
  `iconNode(source, doc?)`.
- Core: an element that first reaches another window's document gets no `onMounted`, and a router
  link clicked there would load its page into that window (CORE-REPORTS R30): content made in a new
  window stands for a moment in the page (`core/let-mount.ts`), and a router link clicked there is
  clicked again in the page.
- Docs: a "New windows" page (moving a tab, a group and back with a form, a DropDown and a DataGrid
  keeping their state; closing, blocked windows and the events; saving and restoring with windows and
  why reopening needs a click; what works there and the limits; the API); `e2e/checks/49-tabdocs-window.mjs`.
- Popup: scrolling inside a popup (a menu taller than the window) no longer places it again, which took
  the scroll back to the top; the page scrolling still moves it along with its anchor.
- TabDocumentManager: each tab panel stacks on its own (`isolation`), so a document's own z-index (a
  DataGrid's sticky summary row) no longer rises over a slid-out dock area, a floating window or the drop
  marks. Docs: a "A whole workspace" page; `e2e/checks/51-tabdocs-workspace.mjs`.
- TabDocumentManager, compact bars: the strips of dock areas and floating windows keep their room for
  the tabs. No scroll buttons there (`compactScrollButtons`, default `false`): the wheel, touch and the
  keys scroll the strip, a thin scrollbar shows over the foot of the tabs while the pointer is over it
  (it takes no room and can be dragged), and the "…" button shows how many tabs are not fully in sight
  in place of its mark ("+2", also in its name; `TabGroup.hiddenTabCount`). Tabs shrink before the strip
  scrolls (`compactTabSize: 'shrink'`, `compactTabMinWidth: 64`); shrinking, a tab keeps its icon, its
  close button and a few letters (`tabdocs.tab-title-min-width`). A strip with one document shows it as
  a title, still the tab with its close button, menu, keys, drag and tooltip (`compactSingleTabTitle`,
  default `true`). Only the pin of an area and the close button of a window stay in the toolbar
  (`compactBarButtons`, default `['autoHide', 'closeWindow']`, a list of `TabBarButton`); the other
  buttons, the app's toolbar items but those with `overflow: 'never'`, "Dock back" in a window and the
  group's commands go into one "…" menu above its searchable list of documents (the commands are a Tab
  stop there). Each dock area and floating window has its own `scrollButtons`, `tabSize`,
  `tabMinWidth`, `singleTabTitle` and `barButtons` (`TabBarSettings`, a value or a function, `null`
  follows the manager), saved with the layout as `bar` when they are plain values. The documents' bar
  and new browser windows keep the whole bar by default and have `singleTabTitle` and `barButtons`
  (`'all'`) of their own; how tabs are sized and the scroll buttons are now written on each group
  (`data-tab-size`, `data-scroll-buttons`, `data-compact`, `data-title`). Texts `tabDocsOpenListHidden`,
  `tabDocsBarMenu`, `tabDocsBarMenuHidden` (en, tr). Tokens `tabdocs.scrollbar-*`, `title-*`, `count-*`,
  `tab-title-min-width`. Docs: a "Compact bars" section on the Dock page; `e2e/checks/50-tabdocs-compact.mjs`.
- TabDocumentManager, a close button in every dock area, hidden documents and small bar buttons:
  every dock area's bar has a close button next to the pin for its group's active document
  (`TabBarButton` `'close'`, `.mx-tabdocs__bar-close`, named "Close Notes" or "Hide Explorer"). A
  document that may close closes through `onClosing` / `onClosed` (a dirty one can still ask); one that
  may not (`closable: false`, the tools) is hidden. A single document shown as a title in that bar shows
  no close button of its own (`data-bar-close`). `compactBarButtons` is now `'auto'` by default: an area
  keeps `['autoHide', 'close']`, a floating window `['closeWindow']`; a list is followed as it is in both,
  and an area's or a window's `barButtons` takes `'auto'` too. A floating window's close button now hides
  the documents that cannot close instead of leaving the window open (`closeWindow` programmatically still
  closes them all). Hidden documents: `hide(doc)` and `show(doc, { group, side, index, active, focus })`
  (also `TabDocument.hide()` / `show()`, and `open(doc)` shows a hidden one) put it back into the group
  it was hidden from, else its dock area (made again at its size, folded if it was), else a floating
  window where its window was, else among the documents; `hiddenDocuments` (reactive),
  `TabDocument.isHidden` (`isOpen` stays `true`), `findDocument` finds them; `allowHide` on the manager
  and per document (default `true`); cancelable `onHiding` / `onShowing`, then `onHidden` / `onShown`,
  and `onLayoutChanged` with `'hide'` / `'show'`. The content is kept as `contentLifetime` says. Menus:
  "Hide" on the tab menu of a document that cannot close, "Show hidden" (a submenu of the hidden
  documents) in the strip's menu and the "…" menu (`TabMenuCommand` `'hide'`, `'showHidden'`); key
  `hide` (Ctrl+K X). `saveLayout` writes `hidden` (`TabLayoutHidden`: the document and where it goes
  back), still version 3; older layouts load. The buttons of compact bars are small squares of 24 pixels
  with a smaller mark and tight gaps (`barButtonSize` for the documents' bar, default `'normal'`;
  `compactBarButtonSize`, default `'small'`; an area's or a window's own `barButtonSize` wins); the "+2"
  count fits them, and the ends of the toolbar leave room for the focus ring. Tokens
  `tabdocs.bar-button-size`, `bar-button-padding`, `bar-button-gap`, `bar-icon-size`, `focus-offset`.
  Texts `tabDocsHide`, `tabDocsShowHidden`, `tabDocsCloseActive`, `tabDocsHideActive`, `tabDocsHidden`,
  `tabDocsShown` (en, tr). Docs: rows and a sentence on the Dock page, a "Small buttons" switch in the
  compact bars example; the Workspace example's "Show the activity" shows the hidden Activity again;
  `e2e/checks/50-tabdocs-compact.mjs` covers the close button, hidden tools and the small buttons.
- TabDocumentManager, the document menus are one menu: the group's "…" menu (and a compact bar's single
  "…" menu) draws its documents with the kit's `MenuList`, in the same popup as its commands and with a
  line between them, instead of a `ListBox` with its own field frame and type; so commands and documents
  share the language's menu height, padding, type, radius, hover and focus in every design language and
  theme (measured: a command and a document both 14px / h32 / 11px / 4px in Fluent, 14px / h44 / 16px /
  4px in Material, where the document rows were 12px / h40 and 14px / h56 / radius 9999px). The shown
  document is a checked `menuitemradio` item; its description, and its group when the menu lists every
  group, is the item's secondary text; the unsaved mark sits at the end of the item and its name still
  says "unsaved changes"; the tooltip is the tab's. A search field (the kit's `TextBox` in search mode, the
  size of the menu's items) heads the documents and filters them as you type; nothing found shows a dimmed
  "No items". Up and Down go on from the search through the documents and the commands and around, Tab
  goes from part to part (out of the menu from the last), typing on a document goes back to the search
  with the letter, Enter in the search opens the first document. Only the documents scroll
  (`tabdocs.list-max-height`, default 20rem). The recently used list (Ctrl+E) is the same menu of
  documents, walked by focus while the modifier is held. Hooks `.mx-tabdocs__search`,
  `.mx-tabdocs__documents`, `.mx-tabdocs__commands`; tokens `tabdocs.list-note-fg` and
  `list-note-font-size` are gone (the menu's description tokens draw that text), `list-gap` is now the
  gap under the search. Checks 46 and 50 read the menu.
- `MenuItem.description` (`Bind<string>`): a second, dimmer text after the label (`.mx-menu__description`,
  tokens `menu.description-font-size`, `menu.description-color`), part of the item's name, never a key
  or `aria-keyshortcuts`; typing to an item goes by the label alone. `MenuList.markColumn` keeps the
  column for a mark or an icon when no item has one, so the texts line up with a menu beside it.
- TabDocumentManager document menu: the shown document keeps its icon and gets a check in a column of
  its own (a dot already means unsaved there); the search is as tall as the menu's items in every
  language (tokens `tabdocs.list-search-height`, `list-search-font-size`; Material 44 px instead of its
  56 px field). `MenuList.markBesideIcon` gives the mark its own column before the icons, and
  `MenuList.radioMark: 'dot' | 'check'` chooses how a chosen radio item is marked.

### DataGrid selection by dragging

- Rows: with `selection: 'multiple'`, pressing on a row and dragging over others selects the rows
  passed, live, with a frame around them while the drag runs (`settings.rowDragSelection`, on by
  default). A plain drag replaces the selection, Ctrl/⌘ adds the rows, Shift goes from the anchor;
  over the check box column the rows passed take the state the first one takes. Group rows, group
  footers, details and new rows are passed over (the rows of a closed group are not selected);
  rows that load while the list scrolls under the drag are taken in. `onSelectionChanging` and
  `onSelectionChanged` come once per row reached, with the new `byDrag`; Escape gives the drag up
  and puts the selection back.
- Cell ranges, as in a spreadsheet: `settings.cellSelection` (`'none'`, `'single'`, `'multiple'`).
  Press on a cell and drag to draw a range (a frame, a fill over the row's own look, the anchor cell
  left unfilled); Ctrl/⌘ starts another range, Shift+click extends the last one from its anchor, a
  plain click starts over. Shift with the arrows, Home / End and PageUp / PageDown extend it from its
  far corner (focus goes with the corner), `selectAllCellsKeys` (`['Mod+A']`) selects every cell,
  `clearCellSelectionKeys` (`['Escape']`) clears, a plain move clears. The extending keys are options
  too: `extendCellsKeys` (`GridCellExtendKeys`: a chord list per move — `up`, `down`, `left`, `right`,
  `pageUp`, `pageDown`, `home`, `end` with Shift; `top`, `bottom`, `leftmost`, `rightmost` with
  `Mod+Shift` and the arrows; `first`, `last` with `Mod+Shift+Home` / `End`), and for rows
  `toggleRowSelectionKeys` (`['Shift+Space']`) and `extendRowSelectionKeys` (`GridRowExtendKeys`,
  Shift with Up / Down and PageUp / PageDown). Ctrl+C copies the ranges as
  tab-separated text and an HTML table (the rows and columns they cover, cells outside them empty;
  `copyValues`, `copyHeaders`, `onCopying` with the new `ranges`); Ctrl+V pastes one value into every
  cell of the ranges or a block from the last range's first cell; Delete (`clearKeys`) empties the
  cells the user can edit, through the rows' drafts, the checks and the save mode
  (`onRowUpdating`…). While cells can be selected, clicks on the cells draw ranges and rows are
  selected from the check box column.
- Ranges are kept by row key (a new row by its id) and field: they follow their rows when rows are
  added above or loaded again and keep their columns when these move or hide; a sort, filter,
  search, grouping, opening or closing a group, or another page takes them away. A column opts out
  with `cellSelectable: false` (its own value wins over `settings.cellSelectable`).
- API: `cellRanges` (read/write, reactive; also a prop, a function followed),
  `selectCells(from, to?, add?)`, `clearCellSelection()`, `getSelectedCellValues()`,
  `cellSelectionSummary` (`{ cells, count, numbers, sum, average, min, max }`),
  `onCellSelectionChanging` (cancelable) and `onCellSelectionChanged` (`{ ranges, byDrag }`); types
  `GridCellPoint`, `GridCellRange`, `GridCellValue`, `GridCellSummary`, `GridCellSummaryItem`,
  `GridCellSelectionChangingEventArgs`, `GridCellSelectionChangedEventArgs`. The bottom bar shows the
  summary while more than one cell is selected (`cellSummary`, `cellSummaryItems`:
  `['average', 'count', 'sum']`).
- Both: `cellDragSelection`, `dragSelectionThreshold` (`5`; a shorter move stays a click, so clicks
  that select or start editing work as before), `dragSelectionAutoScroll`,
  `dragSelectionScrollSpeed` (`30`) and `dragSelectionScrollSensitivity` (`60`) — the rows scroll
  near or past an edge, down and sideways, frame by frame — `dragSelectionTouch` (`'scroll'`, or
  `'longPress'` after `dragSelectionLongPress` ms) and `dragSelectionOnEditableCells`, all live. Row
  drag and drop keeps its icon (and the whole row without icons); headers, the filter row, the group
  panel, action buttons, master-detail and adaptive toggles, links, buttons and fields in cells keep
  their presses; no text is selected while a drag runs, Alt+drag is left to the browser.
- Accessibility: `aria-multiselectable` while cells can be selected, `aria-selected` on every
  selectable cell; polite announcements `gridRowsSelected`, `gridCellsSelected`,
  `gridCellRangesSelected`, `gridCellSelectionCleared`, `gridDragSelectCanceled`, `gridCopiedCells`,
  `gridCopyNotLoaded`, `gridCellsCleared` (en/tr). Tokens `datagrid.range-fill`,
  `range-fill-opacity`, `range-selected-fill`, `range-text`, `range-border-color`,
  `range-border-width`, `range-anchor-fill` (Material: its card surface), `row-run-border-color`,
  `row-run-border-width`; forced colors frame each cell of a range in `Highlight`.
- The ranges are marks on the cells drawn now (pooled rows, columns in view), worked out once per
  change for every row; a cell's text is never written again for them. Measured in Chrome drawing
  a range over 100,000 rows × 60 virtual columns: 60 fps inside the rows, 59 fps while scrolling
  past the bottom edge, no cell text written while only the range changed.
- Docs: a new page “Selecting by dragging” (`/datagrid/drag-select`: rows in memory with grouping,
  an editable sheet of orders, 100,000 rows × 60 virtual columns set programmatically), the API page's
  rows and tokens; `e2e/checks/52-datagrid-drag-select.mjs`.
- Touch on real phones (found on an Android phone, Chrome 155): a long press drag of a tab and the DataGrid's
  long press selection did nothing, because the browser decides when the finger lands whether the page may
  scroll at once, and the listener that can stop it was added only on the press. The group bars, and the
  grid's rows while `dragSelectionTouch: 'longPress'`, now hold a touchmove listener from the start that
  stops the scroll only while a drag runs; a plain swipe still scrolls. Docs: long page titles break on a
  phone, the parts of an example stay within it, the token tables scroll in their own box.

### BottomSheet, Drawer and ActionSheet

- `BottomSheet`: a panel that comes up from the bottom of the page (the top layer) or of a `container`
  and stops at `detents` (`'peek'`, `'half'`, `'full'`, `'fit'`, pixels, or a share such as `'40%'`;
  default `['half', 'full']`), `detent` the one it is at (written back when the user moves it). The
  handle and the title follow the finger and the mouse; let go, it snaps to the nearest height, a flick
  faster than `flickSpeed` goes on to the next, past the tallest it gives a little, and dragged or
  flicked down below the lowest it closes (`swipeToClose`). The content takes the sheet along when it
  cannot scroll that way (`dragContent`): down from its top, up while the sheet is not at its tallest; a
  sideways swipe and a scroll stay the content's. A tap on the handle goes to the next height. The
  handle is a vertical `slider` for the keys (Up/Right/Page Up, Down/Left/Page Down, Home, End; its value
  the share of the full height, read as "Half height"…). `showHandle`, `draggable`, `topGap` (`0`: a
  full-screen sheet, its corners square off at the top), `snapTo()`, `expand()`, `collapse()`, `height`;
  `onDetentChanging` (cancelable, `to` can be changed) / `onDetentChanged`. It stands on the on-screen
  keyboard over the page (the visual viewport), and keeps clear of the safe areas.
- `Drawer`: a panel from an edge of the page or of a `container` (`side`: `start`, `end` — they follow the
  reading direction —, `left`, `right`, `top`, `bottom`), over the content or pushing `pushTarget` aside
  (`mode: 'push'`, not modal unless asked), `size` (else `drawer.size`, never more than 85%). A finger
  swiping in from the edge opens it, following the finger (`edgeSwipe`, `edgeSize`); swiped back towards
  the edge it closes (`swipeToClose`); a flick decides however far it went (`flickSpeed`).
- `ActionSheet`: the kit's `MenuItem`s in a bottom sheet (as tall as its items), large enough for a
  finger, with a title, a `message` and a cancel button apart (`showCancel`, `cancelText`). A submenu
  opens in place with "Back" first; `choose(items?, host?)` resolves with the item chosen or `null`;
  `open(byKeyboard)` puts focus on the first item or on the list; `onItemClick`, `chosenItem`, `menu`.
- What they share is `OverlayPanel` (`parts/overlay`, public): `value` (`x-model`), `modal` (what is
  around it is made `inert` inside its container or on the page, Tab stays inside, the window stack knows
  it), `scrim`, `container` (a value or a function read when it opens), `title` / `label`, `content`,
  `footer`, `showClose`, `closeOnEscape`, `closeOnScrim`, `focusOnOpen` (a finger opening it does not
  bring the on-screen keyboard up: no field first on a coarse pointer), `returnFocus`, `disposeOnClose`,
  `open()`, `close(reason)`, `toggle()`, `show(host)`, `onOpening` / `onOpened` / `onClosing` /
  `onClosed` (`reason`: `code`, `escape`, `scrim`, `swipe`, `back`, `button`, `owner`). Content that
  scrolls with nothing to focus in it takes focus itself. `closeOnBack` (default `true`): the browser's
  back, Android's back button and back gesture close it through the session history, holding one entry
  while open and taking it back when it closes otherwise (`holdBackButton(view, onBack, layer)` in core:
  the holder of the highest layer, the last held or raised among equals, closes first; the state the
  page's router keeps in the entry stays). `SwipeTracker` measures a finger's speed.
- `ContextMenu.presentation`: `'menu'` (default), `'sheet'` (its items in an `ActionSheet`) or `'auto'` (a
  sheet when a finger opened it — a long press — or on a screen with only a coarse pointer when not
  opened by a key); `actionSheet`. `MenuList.openSubmenus` (`false` reports a submenu item as chosen, for
  an owner that shows the submenu itself).
- Texts (en, tr): `sheetLabel`, `sheetHandle`, `sheetPeek`, `sheetHalf`, `sheetFull`, `sheetFit`,
  `sheetHeight`, `drawerLabel`, `actionSheetLabel`, `back`. Tokens `sheet.*`, `drawer.*`,
  `actionsheet.*`; Material maps the sheet's outline away and a 32 high handle area, its drawer to 16
  corners, 360 wide, no outline; Lilac more room and rounder drawers; Fluent 8 corners on the drawer.
- Docs: BottomSheet, Drawer and ActionSheet pages; `e2e/checks/54-bottomsheet.mjs`,
  `55-drawer.mjs`, `56-actionsheet.mjs`.

### TabDocumentManager on a tablet and a phone

- The layout stays the same and saves the same at every size; only where things show changes, and the
  content is moved, never made again. `presentation: 'auto' | 'desktop' | 'tablet' | 'phone'` (default
  `'auto'`: under `phoneWidth` (560) of the manager's own width as on a phone, whatever the pointer;
  under `tabletWidth` (1024) as on a tablet when the screen's pointer is a finger, `(pointer: coarse)`,
  followed live; with a mouse a narrow manager stays a desktop; `tabletWhen: 'width'` lets the width
  alone decide). 560: phones are 360–430 pixels wide, a manager of about 590 beside a desktop page's
  side column stays a desktop; apps change both limits. `currentPresentation` (reactive);
  `onPresentationChanging` (cancelable: `from`, `to`, `width`) / `onPresentationChanged`. A manager
  on a desktop with a mouse is as before.
- On a tablet or a phone the documents' groups take the compact bars as the dock areas do (no scroll
  buttons, shrinking tabs, small buttons, a single document as a title; `compactBarButtons: 'auto'` keeps
  only the "…" menu there), through the same `compact…` props; `narrowBars: 'documents'` keeps the
  desktop bar. A narrow tab gives up its description before the letters of its title.
- Tablet: at most two groups side by side (the first branch of the layout and the rest, each showing the
  group used last); the groups that do not fit fold their tabs into the strip of the group beside them
  (a tap activates the tab's own group there; the arrow keys go along the strip as it shows). Dock
  areas go into drawers from their edge, the bottom one into a sheet, opened from their titles along the
  edges or by a finger from the edge (`edgeSwipe`); a floating window is a large sheet.
- Phone: one document, full screen, under a bar with its title (a swipe left or right, or the arrow keys,
  go to the document beside; a tap opens its commands in an action sheet), its close button and the
  number of open documents, which opens a full-screen list: groups (and floating windows) as sections,
  pinned first, a search, a tap to show, a swipe sideways to close, a long press to lift a row and drag
  it within its group or into another, a long press let go to open its commands; Up, Down, Enter,
  Delete, Alt+Up/Down, the Menu key. The tools of the dock areas are buttons in a bar at the bottom: a
  tap opens a sheet above it (peek, half, full by its handle; swipe down closes) or a drawer for an area
  that asks for one. A floating window is a full-screen sheet; new browser windows are off; the tab menu
  is an action sheet ("Move to…" and "Move into new window" are left out there). The browser's back
  closes what is open on top, then goes back through the documents (`backButton`), past the tools used
  in between; of several managers the one used last.
- Settings: `phoneDockMode` (`'sheet'`), `tabletDockMode` (`'auto'`: drawers for the sides, a sheet for
  the bottom) and the area's own `TabDockArea.phoneDockMode` / `tabletDockMode` (`'sheet'`, `'drawer'`,
  `'hidden'`; its own wins), `edgeSwipe`, `backButton`, `menuPresentation`. Methods
  `tabletWhen`, `narrowBars`, `showDocumentList()`, `hideDocumentList()`, `documentListOpen`, `showTool(doc)`, `hideTool(area)`;
  `activate()` of a tool or of a document in a window opens its drawer or sheet. `split`, `move`,
  `float`, `dock` keep working and are shown the way the presentation allows; `moveToNewWindow` returns
  `null` on a phone.
- On a coarse pointer the tabs, their close buttons and the folded areas' titles are taller in every
  presentation (`tabdocs.touch-tab-height`, `touch-close-size`). Tokens for the phone's bar, tools and
  list (`tabdocs.phone-*`, `tool-*`, `phone-list-*`, `divider-*`); the shown document and the open tool
  are marked as the design language marks a selection. Texts (en, tr) `tabDocsPresentation`,
  `tabDocsDesktop`, `tabDocsTablet`, `tabDocsPhone`, `tabDocsPhoneTitle`, `tabDocsPhoneCount`,
  `tabDocsPhoneList`, `tabDocsPhoneSearch`, `tabDocsPhoneTools`.
- Docs: a "Tablet and phone" page (one layout shown four ways and saved the same, a manager that follows
  its width in a resizable frame, the settings and events, the list, the back button, API); the Preview
  and "Between managers" examples, narrow beside their logs, are shown as on a desktop.
  `e2e/checks/53-tabdocs-mobile.mjs` (a phone of 390 × 844 and a tablet of 820 × 1180, both with touch).

### MotifJS 1.2.0-rc.22

- Needs `@motifx/core` 1.2.0-rc.22 (peer `^1.2.0-rc.22`): other documents (R30) and the window manager with
  `onClosing` / `returnOnClose` (R31) are in core now.
- TabDocumentManager's new browser windows are given to the app's window manager
  (`app.windows.attach(view, { styles: 'live', onClosing })`): core mirrors the page's styles and root attributes,
  connects the document (router links, mounting) and says when the window closes. Without an app the kit's own
  mirroring and `pagehide` handling still do it. The kit's workarounds are gone: `core/let-mount.ts` and the
  router-link relay.
- onMounted now fires only under the app's `run()` host or a built `new Component(existingElement)` root, never for
  a raw `appendChild`: the no-app message box and a Toaster in no component tree place themselves under a root of
  their own in the page; the tests' `mount()` helper does the same.

### TabDocumentManager: folded areas slide from under their strip

- A folded area slides out from under its strip and back into it, never over it (the strip lies above the area).
- Nothing else moves while it slides: the manager clips instead of being a scroll box, and the focus given to the
  slid out content does not scroll the page (`focusContent(still)`). Before, a bottom area scrolled the manager
  (or the page) by its own height and back, so the documents above it jumped. `e2e/checks/48-tabdocs-dock.mjs`
  checks it frame by frame for the left and the bottom area.

### Scheduler, milestone 1: the views, the layout, moving, the keys

- `Scheduler` (`src/components/scheduler/`), written with MotifJS alone: every part is a component of its tree (JSX,
  `.map` lists, `x-display`, a `switch` between the day views and the month); nothing is built or placed by hand.
  `SchedulerModel` is the scheduler without its DOM: the days and times shown, where each appointment goes and the
  selection, filled in place (a day, a time row and an appointment's piece stay the same objects while they stay on
  screen, so a change moves the same box).
- Views `day`, `week`, `workWeek` and `month`, and views of their own (`views`: a name, a caption, `intervalCount`,
  the hours, `cellDuration`, `allDayPanel`, `maxAppointmentsPerCell`, winning over the scheduler's settings).
- Appointments from `appointments` (a reactive array is followed) or a `DataSource` (`remoteFiltering`: the days shown
  only, asked again when the view moves; loading and a retry), the fields named by `fields`.
- Appointments at the same time side by side (`overlapMode: 'columns' | 'cascade'`), over midnight on each day,
  all-day and multi-day ones as bars in the all-day panel (`allDayLines`), timed ones in the month as chips, "+N more"
  where a day is full (`maxAppointmentsPerCell`, or as many as fit) with the day's list in a popup.
- Work days and hours shaded, today, holidays (`isHoliday`), the current time line, ended appointments quieter
  (`dimPast`), its own colour per appointment as a tint and a stripe, `appointmentTemplate`.
- The bar: today, previous, next, the date (it opens the kit's `Calendar`) and the views (`toolbar`). Keys: arrows over
  the cells (Shift selects; past the first or last day the view moves on), Home / End, Page Up / Page Down, Enter and
  Space, Escape; `T`, `N` / `J`, `P` / `K`, `D`, `W`, `X`, `M` (`keys`). Focus keeps its date when the view or the
  date changes.
- API: `goToday`, `next`, `previous`, `showDate`, `showView`, `scrollToTime`, `selectCells`, `appointmentsIn`,
  `findAppointment`, `visibleRange`, `resolvedView`, `selectedCells`, `shownAppointments`; events `viewChanging` /
  `viewChanged`, `dateChanging` / `dateChanged`, `cellClick` / `cellDblClick`, `appointmentClick` /
  `appointmentDblClick`, `selectionChanged`, `contentReady`, `moreOpening`.
- Texts in `uiLocale` (en, tr) and `texts`; dates and times by `Intl` in `locale`. Component tokens
  `tokens/component/scheduler.tokens.json`; `chevronStart` in the glyphs.
- Docs page `/scheduler`; `e2e/checks/57-scheduler.mjs` (32 checks, axe in every view in light and dark).

### Scheduler, milestone 2: adding, the form, moving and resizing

- Appointments are moved by dragging (on the step of `snapMinutes`; over the hours, onto the all-day panel, by days in
  the month), resized by their edges (`minDuration`), copied with Ctrl, taken back with Escape; the view scrolls near
  its edges; a finger starts with a long press. While it goes the appointment's own box stands where it would go (a
  draft the layout shows): nothing is built for the drag.
- The keys: the arrows move a focused appointment (Shift + arrows its end), Enter saves, Escape takes it back; Delete
  deletes (asking first, `editing.confirmDelete`); Enter on cells opens the form for a new one over the selection.
- A click shows the tooltip (text, time, description, Edit, Delete; `tooltip`); a double click opens the form
  (`MxForm` + `FormLayout`: title, start, end, all day, description, the end checked against the start).
  `onFormOpening` gets its `items` and `data` to add fields of its own (written to the appointment's fields of those
  names), or cancels it for a form of one's own.
- Writes go where the appointments come from: into the array (pushed, assigned, spliced) or through the data source's
  adapter. `onAppointmentAdding` / `Updating` / `Deleting` may cancel or set a `promise` to wait; while one saves
  the appointment is locked; `onDataError` tells when saving failed, and it shows as it was.
- `editing` (`false`: read only; or `allowAdding`, `allowUpdating`, `allowDeleting`, `allowDragging`,
  `allowResizing`, `allowCopying`, `confirmDelete`), an appointment's own `allowDrag`, `allowResize`, `allowEdit`,
  `allowDelete` winning. `onMoveStart` / `onMoving` / `onMoveEnd` and `onResizeStart` / `onResizing` / `onResizeEnd`
  (cancel on `…ing` marks a place it may not go). Methods `addAppointment`, `updateAppointment`, `deleteAppointment`,
  `showAppointmentForm`, `showTooltip`, `hideTooltip`.
- A scheduler's data source must load `'all'` (it warns otherwise): a page of rows would leave appointments of the
  days shown out. The milestone 1 example used `'page'`; fixed.
- A box carries its text, colour and disabled state from the layout, so a plain object changed by a data source
  reaches it too. Narrow boxes cut their text short on one line instead of breaking words.
- Docs page `/scheduler/editing`; `e2e/checks/58-scheduler-editing.mjs`.

### Scheduler, milestone 3: recurrence and time zones

- **Recurrence rules (RFC 5545), the kit's own engine** (`src/parts/recurrence/`, DOM-free, exported):
  `parseRecurrenceRule` / `formatRecurrenceRule` (`FREQ` daily to yearly, `INTERVAL`, `COUNT`, `UNTIL`, `BYDAY`
  with `2MO` and `-1FR`, `BYMONTHDAY`, `BYMONTH`, `BYYEARDAY`, `BYWEEKNO`, `BYSETPOS`, `WKST`, `BYHOUR`,
  `BYMINUTE`, `BYSECOND`; parts it does not read are kept), `recurrenceDates` (the times in a range only, on the
  wall clock, skipping the steps before the range when there is no count), `describeRecurrence` (the rule in plain
  words, en and tr), exception dates (`readRuleDates`, `addRuleDate`, `filterRuleDates`, `parseRuleDate`,
  `formatRuleDate`). Tested with the RFC's examples, leap years and the 31st.
- **Time zones** (`src/parts/dates/time-zone.ts`, `TimeZone`, `Intl` only): moments and wall clock times both ways,
  a time the clock skips moved on by the gap, one it shows twice taken as the first (or the later). Scheduler
  `timeZone` puts the days and hours on a zone's clock; a series repeats on its start's zone
  (`fields.startTimeZone`); a box on the night summer time changes reaches its end's row and is never shorter than
  it lasts.
- **Series in the scheduler:** `fields.recurrenceRule`, `recurrenceException` (`EXDATE`), `recurrenceId` (an
  occurrence changed apart names its series' key), `startTimeZone`, `endTimeZone`. Only the days shown are
  expanded; each occurrence is an object of its own, kept while it stays on screen.
- **Changing a series:** a drag, the keys, the form and Delete ask "this one / this and the following / the whole
  series" (`MxForm` + `FormLayout` with radio buttons; `seriesEdit` answers without asking; `onSeriesAsking` may
  answer, narrow or cancel; `onSeriesAnswered`). This one: a new appointment in its place and its time left out of
  the series. This and the following: the series ends before it (`UNTIL`, or the count split) and a new series
  goes on. The whole series: every occurrence moves as this one did (a weekly series moved a day moves its
  weekdays). The update and delete events carry `scope` and `series`; `onAppointmentUpdated` gives `added`.
- **Through the data layer:** a change to a series is written one write after another through the adapter (new rows,
  then changes, then deletes). When a later write fails the earlier ones are taken back through the adapter;
  `onDataError` now has `saved`, `unsaved` and `undone`, and the live region says when part of a change stayed
  saved. A deleted series takes its changed occurrences, asked of the adapter (loaded or not). `rangeFilter(range,
  fields)` builds the data layer's filter for a range with the series that began before it; `remoteFiltering`
  uses it (the old filter left such series out).
- **`RecurrenceEditor`** (exported, also in the appointment form, `editing.allowRecurrence`): the repeat list, every
  how many, the weekday buttons, a day of the month or a weekday by its place, the month, the end; it reads and
  writes the rule (`value`, `x-model`) and says it in words. With `editing.allowTimeZones` the form has one
  searchable time zone picker (`Intl`'s zones) and a box "Separate end time zone" (`separateEndZone`, an item like
  the others): checked, a second picker sets the end's zone, and an appointment whose end zone differs opens
  with it checked; unchecked, the end follows the start's zone. Each picker has the whole row (a zone's name is
  long), the box its own row under it; the field's tooltip gives the whole name.
- **Marks:** an occurrence carries a series mark, one changed apart an exception mark (units `series-mark`,
  `exception-mark`; glyphs `repeat`, `repeat-off`; Material draws none; `recurrenceMarks`).
  The tooltip says how it repeats (unit `tooltip-repeat`) and the time on the appointment's own clock.
- Methods `seriesOf`, `isOccurrence`, `isException`, `occurrencesOf`, `recurrenceText`, `askSeries`;
  `updateAppointment` and `deleteAppointment` take a `scope`.
- Token schema `recurrence-editor.json` (units `editor`, `days-label`, `days`, `summary`; the weekday buttons'
  place `day-button`), values in every language. The seven weekday buttons are of one width, the widest name's
  (measured in en, tr, de, fr, el, ta and ar); Fluent draws them as small rounded toggle buttons.
- An appointment's text stands out on its fill in every language and theme, at rest, under the pointer and open:
  `appointment-text-auto` takes black or white by the fill (Material, whose boxes take the appointment's own
  colour), and the time takes the title's colour under the pointer and open (`appointment-time` `hover`, `open`).
- Docs page `/scheduler/recurrence` (one example from a data source); `e2e/checks/60-scheduler-recurrence.mjs`.

### Scheduler, milestone 4: resources, groups and the form

- **Resources** (`resources: SchedulerResource[]`): a kind's `field` (one value, or a list with `allowMultiple`),
  `label`, `items` (an array, or a data source loaded once and followed), `valueExpr`, `displayExpr`, `colorExpr`,
  `useColorAsDefault`, `parentExpr`, and an item's own `workStartHour`, `workEndHour`, `workDays` (through
  `…Expr`). Resources colour the appointments (the kind marked, else the first kind whose item has a colour; an
  appointment's own `color` wins; in a group, the group's item). An item's own `allowDrag`, `allowResize`,
  `allowEdit`, `allowDelete` win over `editing` for its appointments. The tooltip has a line per kind.
- **Groups** (`groups`, a view's own `groups`): the columns of the day, week, work week and month views split by
  resource, nested (a room over its people; `parentExpr` keeps a person under their own room), with a row of heads
  per level; `groupByDate` puts the groups under each date (a single day shows its date over the groups).
  `resourceHeaderTemplate` draws a head. Cells name their group (`aria-label`), `selectedCells` and the cell events
  carry `resources`, a new appointment from a cell gets its group's values. A bar under groups by date is cut into a
  piece per day. The model (`SchedulerModel`) is DOM-free: `groups`, `columns`, `dates`, `heads`, kept in place.
- **Moving between groups:** a drag, and `Alt+Shift+ArrowLeft` / `ArrowRight` on an appointment (`keys.previousGroup`
  / `nextGroup`, mirrored right to left), change the resource fields; in a list only the value of the group it
  leaves changes. `DragEventArgs.resources`, `AppointmentClickEventArgs.group`, `AppointmentTemplateContext.group`.
- **Availability:** `blockedTimes` (`{ start, end, text?, allDay?, recurrenceRule?, resources? }`) mark their cells
  (`data-blocked`, read out); `allowOffHours: false` keeps what the user moves, resizes or saves in the work hours
  (of its resources, else the scheduler's); `allowOverlap: false` keeps it off another appointment of its group,
  and a function there decides the whole check (`SchedulerTimeCheck`: `overlapping`, `blocked`, `offHours`). A drag
  or a move by the keys shows where it may not go (`onMoving` / `onResizing` start with `cancel` set there);
  the form says why it cannot save. `checkTime()`, `resourcesOf()`.
- **The form:** each kind gets a picker (`DropDown`, or `TagBox` for several), each item with its colour.
  `editing.form` (`SchedulerForm`): `items` by name (`text`, `start`, `end`, `allDay`, `timeZone` or its three items,
  `recurrenceRule`, `description`, a resource's field) or items of your own, groups and tabs, `columns`,
  `minColumnWidth`, `labelMode`, `title`, `width`. An item of a built-in's field changes it (its rules add); its
  `visible`, `readOnly`, `enabled`, `required`, `label`, `helpText`, `rules` may be functions of the form
  (`AppointmentFormContext`: `appointment`, `data`, `isNew`). `editor` may be a function (any component taking an
  editor's props) and `template` any MotifJS component. `onFormOpening` gets the items made and may cancel.
- **`FormLayout`:** `tabs` items (every tab checked; a check shows the tab of the first field that failed), `editor`
  as a function, `template(context)` with `{ data, field, validationGroup }`, `editor: 'tagbox'`.
- **Data:** `rangeFilter(range, fields, { resources })` (`RangeFilterOptions`) asks for the resources shown too; a
  scheduler grouped by a field of one value uses it with `remoteFiltering`.
- Units `group-header` (`inner`, `month`), `group-swatch`, `group-divider` (`inner`, `head`), `unavailable` (`all-day`,
  `month`), `drop-mark` (`bar`, `chip`), `resource-swatch` (`tooltip`), `tooltip-resource-label`,
  `tooltip-resource-item`; the cell's `blocked` state; the glyph `blocked`. Material draws no divider and no drop
  mark, Lounge no hatch.
- **Text that reads on any colour:** an appointment's title and time read on its fill whatever the colour, in
  every language and theme. Black or white (`appointment-text-auto`) is chosen by contrast (the fill's luminance
  from 0.179 up takes black; it was a lightness of 0.65, which gave white on mid colours such as `#00838f`).
  A language's ink that would not stand out 4.6 times is made darker on a light fill or lighter on a dark one just
  as far as needed, its hue kept; one that does is left as it is. The time's colours are plain tokens now
  (`appointment-time-tone`, `-hover`, `-open`), read on the fill the same way. Measured in check 61 on 24 hues at 5
  lightnesses, 6 greys and the docs' colours, on a box, a bar and a chip, in six states: at least 4.56:1.
- The layout's column variables are `--_columns` and `--_column` (they were `--_days` and `--_day`).
- Docs pages `/scheduler/resources` and `/scheduler/form`; `e2e/checks/61-scheduler-resources.mjs` and
  `62-scheduler-form.mjs`.

### Scheduler, milestone 5: timelines, the agenda and big data

- **Timeline views** `timelineDay`, `timelineWeek`, `timelineWorkWeek`, `timelineMonth`: a row per group (one without
  groups), nested groups in levels of a resource column, the time along the row (mirrored right to left). The scale
  has two tiers (the days over their hours; the months over their days) and stays at the top while the rows scroll;
  the resource column stays at the start while the time scrolls; a long day's date stays in view. Appointments at
  the same time stack in lanes of their row and the row grows; each row is laid out on its own. The current time,
  blocked times and the hours outside work carry over; cells stretch to fill the room when they are few.
  `maxAppointmentsPerCell` (a number) keeps that many lanes and says "+N more" per day.
- **Everything of milestones 2–4 in the timeline:** a drag along the row and to another row (its resources change),
  both ends resize, a copy with Ctrl, the drop mark; the keys over the cells (Left / Right along the time, Up / Down
  between rows, Home / End, Ctrl + Home / End, PageUp / PageDown, past the end the view moves on) and on an
  appointment (Left / Right a snap step, Up / Down to the row above or below, Shift for its end, Enter saves); the
  form, the tooltip, recurrence, time zones, availability. Cells read their group, date and time.
- **Agenda** (`agenda`, `agendaDuration`, default 7, component-wide and per view): the coming days with their
  appointments in time order (the ones taking the day first; one that lasts days on each of them), days with none
  left out, grouped by resource with `groups`, "No appointments" (`uiLocale`) when empty. A list box: Up / Down,
  Home / End, PageUp / PageDown move over the rows (the focused one is selected), Space shows the tooltip, Enter the
  form, Delete deletes; `keys.agendaView` (`A`).
- **Big data:** a timeline's rows go through `Virtualization` when they are many (each as tall as its lanes, worked
  out by the model from the lane's measured height); the cells and appointments along the time, and the columns of
  a day or a week with many groups, are built from a window the model keeps (`setWindow`, `shownTicks`,
  `shownColumns`, `shownTimed`, `shownHeads`), moved on by a few cells as the view scrolls. `scrolling: 'auto' |
  'standard' | 'virtual'` (component-wide and per view; `'auto'` turns virtual past about 2,000 cells). A drag lays
  out only the rows it touches; the appointments are read once for every layout until they change; groups are found
  by key. Measured in development (DevTools on), 1,440 × 900: 1,000 rows × 10,000 appointments in a timeline week
  show in about 0.6 s with about 850 elements and scroll at 55–60 fps both ways (dragging 50–60 fps); a week of 200
  groups (1,400 columns, 4,000 appointments) shows in about 0.75 s with about 2,700 elements, 60 fps down, 40–58 fps
  sideways (between runs), 45 fps dragging.
- **Settings per view:** `startDate` (intervals counted from it), `agendaDuration`, `scrolling`, and every
  template: a view's own wins, `null` there turns it off.
- **Narrow boxes:** in a row the text in front stays whole and the one after gives way; a short box and a box on a
  timeline read their title first, before the time. The time no longer runs under the series mark in a narrow box
  (it did in the week view too).
- **Templates** (`SchedulerTemplates`, component-wide and per view): `appointmentTemplate`,
  `appointmentTooltipTemplate` (`TooltipTemplateContext`), `dataCellTemplate` (`CellTemplateContext`),
  `dateCellTemplate` (`DateTemplateContext`), `timeCellTemplate` (`TimeTemplateContext`), `resourceHeaderTemplate`,
  `agendaRowTemplate` (`AgendaRowContext`), `moreListTemplate` (`MoreListContext`).
- **Methods:** `scrollTo(date, resources?)`; `scrollToTime` scrolls a timeline along.
- Units `timeline-row` (`first`), `timeline-divider` (`inner`), `resource-cell` (`inner`, `first`, `continued`),
  `timeline-corner`, `timeline-corner-label`, `scale`, `scale-upper` (`today`), `scale-lower` (`day-start`, `day`,
  `weekend`, `today`), `agenda`, `agenda-group` (`first`), `agenda-resource`, `agenda-day` (`today`),
  `agenda-weekday` (`today`), `agenda-month`, `agenda-row` (`hover`, `selected`, `open`, `focus`, `past`,
  `disabled`), `agenda-content`, `agenda-time`, `agenda-dot`, `agenda-text`, `agenda-empty`; the cell's `line`,
  `line-hour`, `line-day`, the appointment's `line`, `line-before`, `line-after`, the day number's `scale` and
  `agenda`, the group swatch's `resource`; `now` and `now-dot` stand up in a timeline (turned). Plain tokens
  `timeline-cell-width`, `timeline-resource-width`, `timeline-lane-size`, `timeline-row-min-height`,
  `agenda-time-width`. Material draws no row divider and an agenda with a day's number in a
  circle, rows lit whole, a dot); Fluent a colour bar on an agenda row.
- Docs pages `/scheduler/timeline`, `/scheduler/agenda`, `/scheduler/big-data`; `e2e/checks/63-scheduler-timeline.mjs`,
  `64-scheduler-agenda.mjs`, `65-scheduler-big-data.mjs` (the numbers against limits).

### Scheduler, milestone 6: tablet, phone, touch, iCalendar and print

- **Presentation by screen, the same model** (as the TabDocumentManager): `presentation: 'auto' | 'desktop' |
  'tablet' | 'phone'`, `phoneWidth` (560), `tabletWidth` (1024), `tabletWhen` (`'touch'`: under `tabletWidth` only on
  a screen whose pointer is a finger, `(pointer: coarse)` followed live; `'width'`), `currentPresentation`,
  `onPresentationChanging` (cancellable) and `onPresentationChanged`. The appointments, views and date stay; only
  how they show changes.
- **As on a phone:** `phoneView` (default `'agenda'`, a day when the views have none; `null` keeps the view; going
  back it shows the view it had, unless the user chose another), `tabletView` (default `null`). The bar is compact:
  the month as the title (with its year when it is not this year; the calendar opens from it), Today as an icon, one
  menu of the views; no steps (a swipe and the month's calendar move, as phone calendars do; N and P still work).
  The tooltip is an `ActionSheet` (the text, the time and how it repeats; Edit, Delete; with a tooltip template a
  `BottomSheet` holding it), the form a full-height `BottomSheet` in one column (`FormOpeningEventArgs.form` is the
  sheet there). A narrower ruler and resource column so a week fits; the agenda writes a row's time under its text.
  Every view works at every size.
- **Touch** (`SchedulerTouch`, every listener on the scheduler before a finger lands):
  - a long press lifts an appointment (the `lifted` state) and drags it; let go, it stays selected with a handle in
    the middle of its start and its end edge (`resize-grip`); a finger on a handle resizes at once; a tap elsewhere
    puts it down. On another appointment an edge is a long press to move it, not a resize;
  - `swipeNavigation` (default `true`): a swipe sideways goes to the next or the previous days (mirrored right to
    left) past a quarter of the view or as a flick; a view that can still scroll that way scrolls first. The view
    follows the finger and an edge mark (`swipe-edge`) shows where the next days come from, `ready` when letting go
    moves on;
  - `pinchZoom` (default `true`) zooms the time scale: the hours of the day
    views (the time between the fingers stays there) and the cells of a timeline. `timeZoom` (0.5 to 4) is the
    setting it writes; `onTimeZoomChanging` (cancellable, the page zooms instead) and `onTimeZoomChanged`;
  - scrolling stays native; no click after a drag or a swipe; a long press opens no page menu; `data-touch` marks the
    scheduler while a finger is in use, so no hover look stays after a touch (the hover states and rules are written
    `:where(.mx-scheduler:not([data-touch]))`, the same specificity);
  - a finger selects one cell; a second tap on it opens the form for a new appointment (a double tap opens one form).
  - On a touch screen the bar takes the language's large buttons (`phone-bar-size` as on a phone: Material's top app
    bar takes its 40 px buttons), the agenda rows `touch-target`, the lines of the month and the all-day panel
    `touch-lane-size`.
- **iCalendar (RFC 5545):** `exportICalendar({ range: 'visible' | 'all' | { start, end }, appointments, name })` returns
  the text; `importICalendar(text)` resolves to `{ added, updated, failed }`. Events `onICalendarExporting`
  (cancellable, `appointments` changeable), `onICalendarExported`, `onICalendarImporting` (cancellable, the values read
  changeable), `onICalendarImported`. Written: `UID` (the key), `DTSTAMP`, `DTSTART` / `DTEND` with `TZID` (all-day as
  `VALUE=DATE`), `SUMMARY`, `DESCRIPTION`, `RRULE` (a wall clock `UNTIL` in UTC), `EXDATE`, `RECURRENCE-ID` (an
  occurrence changed apart, under its series' UID: the left-out time of the series nearest to it), a `VTIMEZONE` for
  each zone used. Read: the same, folded lines, escaped text, `TZID` (an IANA name, else the file's `VTIMEZONE`, as
  Windows zone names), UTC and floating times, `DURATION`, a cancelled occurrence left out of its series. Import
  goes through the editor and the store: `onAppointmentAdding` first, a data source gets the adds through its
  adapter; an event whose UID is an appointment's key changes it.
- **The iCalendar part** (`src/parts/icalendar/`, DOM-free, exported): `parseICalendar`, `writeICalendar`,
  `timeZoneLines` (a zone's `VTIMEZONE` from `Intl`: a yearly `RRULE` when every change follows one, else `RDATE`s),
  `icalendarMoment`, and the types `ICalendar`, `ICalendarEvent`, `ICalendarDate`, `ICalendarProperty`,
  `ICalendarTimeZone`, `ICalendarObservance`, `ICalendarWriteOptions`.
- **Print:** a print stylesheet and `print()` (`onPrinting` cancellable, `onPrinted`). On paper (the browser's print
  too: `beforeprint`) the scheduler is built whole (a virtual view turns standard), nothing scrolls, every hour, row
  and column shows, a week of the month, a timeline row, an agenda day and an appointment are not split between
  pages, the colours are kept (`print-color-adjust: exact`), the bar and the now line are left out. `print()` prints
  this scheduler alone (`data-mx-print-one` on the page while the dialog is open).
- Units `resize-grip` (`active`; turned down the side of a bar), `swipe-edge` (`ready`), `swipe-icon` (`previous`,
  `ready`); new states: the appointment's `lifted`, `selected`, `print`, the bar's `phone`, the scheduler's `print`.
  Plain tokens `touch-target`, `touch-lane-size`, `phone-ruler-width`, `phone-column-min-width`,
  `phone-timeline-resource-width`, `phone-bar-size`, `swipe-inset`, `grip-ring`, `grip-ring-mix`. Places
  `today-icon-button`, `view-menu-button`, `tooltip-sheet`, `form-sheet`.
- Docs pages `/scheduler/mobile` (presentations, a phone-sized frame, a finger) and `/scheduler/icalendar` (export,
  import, print); `e2e/checks/66-scheduler-mobile.mjs`, `67-scheduler-icalendar.mjs`.
- **Memory:** a `Button` disposes its `dropDown` content with itself. Until its popup first opened the content was in
  no tree, so nothing disposed it: the scheduler's date calendar kept the whole scheduler (its model, every
  appointment) after the page was left, 13–18 MB a visit on the big-data page. A sweep of every docs page now finds
  no growth over 0.5 MB a visit.

### Design languages, step 1: what lets a language change everything

Any design system, or a new version of one, is added as files only and looks like its source.

- Glyphs are names: `core/glyphs.ts` returns `span.mx-glyph[data-icon]` (the same helpers), drawn by CSS as a mask
  of `--mx-icon-<name>` in the text colour. The kit's set is `tokens/icons/kit.icons.json`; a language brings its own
  in `tokens/icons/<language>.icons.json`, built by `scripts/build-icons.mjs` (part of `npm run tokens`) into
  `src/generated/icons.css`. The datagrid's drag handle uses the set too (`dragDots`).
- `core/press-origin.ts`: a part with `data-mx-press` gets `data-pressed` and `--_press-x` / `--_press-y` while it
  is pressed (keys press from its middle), for a language's state layer or ripple.
- `core/look-watch.ts` `onLookChanged`: a design language, theme or density changed anywhere. Toolbar (its overflow),
  the option lists, TreeView, TextArea and DataGrid's action widths measure again; a toolbar switched to Material at
  run time now moves what does not fit into its menu.
- DataGrid's per-column rules (hidden columns, alignment, sticky offsets and edges) are in `@layer mx.components`,
  so a language's stylesheet can change their look.
- stylelint: the files of a component made ready for any language take no literal length (`LOSSLESS` in
  `stylelint.config.mjs`).
- `e2e/language-diff.mjs`: from a fingerprint, how much of each component is the same in every language.
