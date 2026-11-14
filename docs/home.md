# @motifx-community/ui

> Get started · @motifx-community/ui 0.1.0-beta.10

Components for MotifJS: objects you create when you need them, show anywhere and dispose when you are done, drawn from the MotifJS design system's tokens.

## Install

```tsx
npm i @motifx/core @motifx-community/ui
```

```tsx
import { Button, Control, FocusContainer, addShortcut } from '@motifx-community/ui';
```

## Component model

- Every component is an object. Declare it in JSX and bind it to state, or instantiate it with `new` and add it to the component tree at runtime. Both approaches expose the same API.

- Lifetime follows ownership: disposing a component also disposes the components it owns.

- Every component supports keyboard navigation, focus management and the WAI-ARIA roles and states of its pattern.

## Components

The library includes more than fifty components built on a shared base. Each one provides keyboard and focus support, accessible roles and names, English and Turkish strings that can be switched at runtime, right-to-left layout, and component tokens for the five design languages of the design system: Tactile, Lounge, Material, Fluent and Lilac. Every component has a reference page with live examples and its full API.

| Group | Components |
| --- | --- |
| Buttons and commands | [`Button`](button.md) (menu, split, toggle, busy), [`ButtonGroup`](buttongroup.md), [`Toolbar`](toolbar.md), [`SpeedDial`](speeddial.md), [`MenuBar`](menus.md) and [`ContextMenu`](menus-context.md) |
| Editors | [`TextBox`](textbox.md) (mask, validation), [`TextArea`](textarea.md), [`NumberBox`](numberbox.md), [`DateBox`](datebox.md), [`DateRangeBox`](daterangebox.md), [`Calendar`](calendar.md), [`ColorBox`](colorbox.md) and [`ColorPicker`](colorbox.md), [`Slider`](slider.md), [`Rating`](rating.md), [`FileUploader`](fileuploader.md), [`ValidationSummary`](validationsummary.md) |
| Choice | [`CheckBox`](checkbox.md), [`Switch`](switch.md), [`RadioGroup`](radiogroup.md), [`DropDown`](dropdown.md), [`ComboBox`](combobox.md) and [`Autocomplete`](combobox.md), [`Lookup`](lookup.md), [`TagBox`](tagbox.md), [`ListBox`](listbox.md) |
| Display and feedback | [`Badge`](badge.md), [`Avatar`](avatar.md) and [`AvatarGroup`](avatar.md), [`Chip`](chip.md) and [`ChipGroup`](chip.md), [`Card`](card.md), [`Gallery`](gallery.md), [`TileView`](tileview.md), [`Timeline`](timeline.md), [`Skeleton`](skeleton.md), [`ProgressBar`](progress.md) and [`Spinner`](progress.md), [`LoadPanel`](loadpanel.md), [`Tooltip`](tooltip.md), [`Popover`](popover.md), [`Toast`](toast.md) |
| Navigation and layers | [`Tabs`](tabs.md), [`Accordion`](accordion.md), [`Breadcrumb`](breadcrumb.md), [`Pagination`](pagination.md), [`Stepper`](stepper.md), [`Wizard`](wizard.md), [`MultiView`](multiview.md), [`Window`](window.md) and dialog, [`BottomSheet`](bottomsheet.md), [`Drawer`](drawer.md), [`ActionSheet`](actionsheet.md) |
| Layout | [`Stack`](layout.md), [`Grid`](layout.md), [`DockPanel`](layout.md), [`Panel`](layout.md), [`GroupBox`](layout.md), [`SplitContainer`](layout.md), [`Splitter`](splitter.md), [`Resizable`](resizable.md), [`Draggable`](draggable.md), [`FormLayout`](formlayout.md), [`ScrollView`](scrollview.md) (pull to refresh, load more), [`Sortable`](sortable.md) |
| Data | [`DataGrid`](datagrid.md) (virtual or paged, editing, filters, grouping, master-detail, export), [`TreeView`](treeview.md), [`FilterBuilder`](filterbuilder.md), [`Scheduler`](scheduler.md) (day to timeline, recurrence, resources, iCalendar), [`TabDocumentManager`](tabdocs.md) (tabs, split, dock, new windows); lists and grids read `@motifx-community/data` sources |
| Base | [`Control`](control.md), [`FocusContainer`](keyboard.md) and [`addShortcut`](keyboard.md), [`uiLocale`](language.md), [the component tokens](tokens.md); `Popup` and `MenuList`, the shared parts a menu or a drop-down opens on |

## Design system

Visual styling comes from `@motifx-community/design-system`, which provides design tokens, three themes, density settings, fonts and user-preference overrides. `styles.css` imports it first, then the `mx.components` layer adds the [component tokens](tokens.md) and the components. Components define no colors or sizes of their own.

- Themes: light, dark and high contrast, selected with `data-theme`. The default follows the operating system preference. The design system build verifies every text and background pair against WCAG AA, and against AAA in high contrast.

- Density: `data-density="compact"` reduces the size of every control, bar and title bar.

- Right-to-left layout: components are built on CSS logical properties.

```tsx
<html data-theme="dark" data-density="compact">
```

```tsx
/* your accent, after styles.css: a design-system override restyles every component */
:root {
  --mx-color-accent-solid: #8764b8;
  --mx-color-accent-solid-hover: #9373c0;
  --mx-color-accent-solid-pressed: #7e5aaf;
  --mx-color-accent-fg: #5c2e91;
}
```

## Feedback

Loading issues…
