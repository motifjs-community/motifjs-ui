# @motifx-community/ui

> Get started · @motifx-community/ui 0.1.0-beta.3

Components for MotifJS that work the way desktop UI does — created when needed, shown anywhere, closed and disposed like windows — drawn from the MotifJS design system's tokens.

## Install

```tsx
npm i @motifx/core @motifx-community/ui

import { Button, Control, FocusContainer, addShortcut } from '@motifx-community/ui';
```

## How the components work

- Every component is an object. Write it in JSX and bind it to state, or create it with `new` and add it wherever and whenever you need it — the developer using it decides, both ways are complete.

- Lifetime follows ownership: a component dies with the one it belongs to.

- Keyboard, focus and ARIA are part of every component, not extras.

## What ships today

More than fifty components, every one an object with the same base: focus and the keyboard, the right roles and names for a screen reader, texts in English and Turkish that switch while the app runs, right to left, and a look in each of the design system's five languages (Tactile, Lounge, Material, Fluent, Lilac) painted from component tokens. Each has a page with live examples and its API.

| Group | Components |
| --- | --- |
| Buttons and commands | [`Button`](button.md) (menu, split, toggle, busy), [`ButtonGroup`](buttongroup.md), [`Toolbar`](toolbar.md), [`MenuBar` and `ContextMenu`](menus.md) |
| Editors | [`TextBox`](textbox.md) (mask, validation), [`TextArea`](textarea.md), [`NumberBox`](numberbox.md), [`DateBox`](datebox.md), [`DateRangeBox`](daterangebox.md), [`Calendar`](calendar.md), [`ColorBox` and `ColorPicker`](colorbox.md), [`Slider`](slider.md), [`Rating`](rating.md), [`FileUploader`](fileuploader.md) |
| Choice | [`CheckBox`](checkbox.md), [`Switch`](switch.md), [`RadioGroup`](radiogroup.md), [`DropDown`](dropdown.md), [`ComboBox` and `Autocomplete`](combobox.md), [`Lookup`](lookup.md), [`TagBox`](tagbox.md), [`ListBox`](listbox.md) |
| Display and feedback | [`Badge`](badge.md), [`Avatar` and `AvatarGroup`](avatar.md), [`Chip` and `ChipGroup`](chip.md), [`Card`](card.md), [`Skeleton`](skeleton.md), [`ProgressBar` and `Spinner`](progress.md), [`LoadPanel`](loadpanel.md), [`Tooltip`](tooltip.md), [`Popover`](popover.md), [`Toast`](toast.md) |
| Navigation and layers | [`Tabs`](tabs.md), [`Accordion`](accordion.md), [`Breadcrumb`](breadcrumb.md), [`Pagination`](pagination.md), [`Stepper`](stepper.md), [`Wizard`](wizard.md), [`Window` and dialog](window.md), [`BottomSheet`](bottomsheet.md), [`Drawer`](drawer.md), [`ActionSheet`](actionsheet.md) |
| Layout | [`Stack`, `Grid`, `DockPanel`, `Panel`, `GroupBox`, `SplitContainer`](layout.md), [`FormLayout`](formlayout.md), [`ScrollView`](scrollview.md) (pull to refresh, load more), [`Sortable`](sortable.md) |
| Data | [`DataGrid`](datagrid.md) (virtual or paged, editing, filters, grouping, master-detail, export), [`TreeView`](treeview.md), [`FilterBuilder`](filterbuilder.md), [`Scheduler`](scheduler.md) (day to timeline, recurrence, resources, iCalendar), [`TabDocumentManager`](tabdocs.md) (tabs, split, dock, new windows); lists and grids read `@motifx-community/data` sources |
| Base | [`Control`](control.md), [`FocusContainer` and `addShortcut`](keyboard.md), [`uiLocale`](language.md), [the component tokens](tokens.md); `Popup` and `MenuList`, the shared parts a menu or a drop-down opens on |

## Design system

The look comes from `@motifx-community/design-system`: its tokens, three themes, density, fonts and user-preference overrides. `styles.css` imports it first, then this kit's own layer (`mx.components`) adds the [component tokens](tokens.md) and the components. Nothing here is a color or a size of its own.

- Themes: light, dark and high contrast, switched with `data-theme`; the OS preference is the default. Every text/background pair is checked in the design system's build: WCAG AA, AAA in high contrast.

- Density: `data-density="compact"` shrinks every control, bar and title bar.

- RTL through logical properties.

```tsx
<html data-theme="dark" data-density="compact">

/* your accent, after styles.css: a design-system override restyles every component */
:root {
  --mx-color-accent-solid: #8764b8;
  --mx-color-accent-solid-hover: #9373c0;
  --mx-color-accent-solid-pressed: #7e5aaf;
  --mx-color-accent-fg: #5c2e91;
}
```
