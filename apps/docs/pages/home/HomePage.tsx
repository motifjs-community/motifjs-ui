import { Code, Rich, Section } from '../../shared/doc';


export default function HomePage() {
  return (
    <>
      <p class="lead">
        <Rich text="Components for MotifJS: objects you create when you need them, show anywhere and dispose when you are done, drawn from the MotifJS design system's tokens." />
      </p>

      <Section anchor="install" title="Install">
        <Code lang="bash" code="npm i @motifx/core @motifx-community/ui" />
        <Code
          code={`
import { Button, Control, FocusContainer, addShortcut } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="how" title="Component model">
        <ul class="docs-list">
          <li>
            <Rich text="Every component is an object. Declare it in JSX and bind it to state, or instantiate it with `new` and add it to the component tree at runtime. Both approaches expose the same API." />
          </li>
          <li>
            <Rich text="Lifetime follows ownership: disposing a component also disposes the components it owns." />
          </li>
          <li>
            <Rich text="Every component supports keyboard navigation, focus management and the WAI-ARIA roles and states of its pattern." />
          </li>
        </ul>
      </Section>

      <Section anchor="Today" title="Components">
        <p>
          <Rich text="The library includes more than fifty components built on a shared base. Each one provides keyboard and focus support, accessible roles and names, English and Turkish strings that can be switched at runtime, right-to-left layout, and component tokens for the five design languages of the design system: Tactile, Lounge, Material, Fluent and Lilac. Every component has a reference page with live examples and its full API." />
        </p>
        <table class="token-table api-table">
          <thead>
            <tr>
              <th>
                <Rich text="Group" />
              </th>
              <th>
                <Rich text="Components" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Rich text="Buttons and commands" />
              </td>
              <td>
                <Rich text="[`Button`](/button) (menu, split, toggle, busy), [`ButtonGroup`](/buttongroup), [`Toolbar`](/toolbar), [`SpeedDial`](/speeddial), [`MenuBar`](/menus) and [`ContextMenu`](/menus)" />
              </td>
            </tr>
            <tr>
              <td>
                <Rich text="Editors" />
              </td>
              <td>
                <Rich text="[`TextBox`](/textbox) (mask, validation), [`TextArea`](/textarea), [`NumberBox`](/numberbox), [`DateBox`](/datebox), [`DateRangeBox`](/daterangebox), [`Calendar`](/calendar), [`ColorBox`](/colorbox) and [`ColorPicker`](/colorbox), [`Slider`](/slider), [`Rating`](/rating), [`FileUploader`](/fileuploader), [`ValidationSummary`](/validationsummary)" />
              </td>
            </tr>
            <tr>
              <td>
                <Rich text="Choice" />
              </td>
              <td>
                <Rich text="[`CheckBox`](/checkbox), [`Switch`](/switch), [`RadioGroup`](/radiogroup), [`DropDown`](/dropdown), [`ComboBox`](/combobox) and [`Autocomplete`](/combobox), [`Lookup`](/lookup), [`TagBox`](/tagbox), [`ListBox`](/listbox)" />
              </td>
            </tr>
            <tr>
              <td>
                <Rich text="Display and feedback" />
              </td>
              <td>
                <Rich text="[`Badge`](/badge), [`Avatar`](/avatar) and [`AvatarGroup`](/avatar), [`Chip`](/chip) and [`ChipGroup`](/chip), [`Card`](/card), [`Gallery`](/gallery), [`TileView`](/tileview), [`Timeline`](/timeline), [`Skeleton`](/skeleton), [`ProgressBar`](/progress) and [`Spinner`](/progress), [`LoadPanel`](/loadpanel), [`Tooltip`](/tooltip), [`Popover`](/popover), [`Toast`](/toast)" />
              </td>
            </tr>
            <tr>
              <td>
                <Rich text="Navigation and layers" />
              </td>
              <td>
                <Rich text="[`Tabs`](/tabs), [`Accordion`](/accordion), [`Breadcrumb`](/breadcrumb), [`Pagination`](/pagination), [`Stepper`](/stepper), [`Wizard`](/wizard), [`MultiView`](/multiview), [`Window`](/window) and dialog, [`BottomSheet`](/bottomsheet), [`Drawer`](/drawer), [`ActionSheet`](/actionsheet)" />
              </td>
            </tr>
            <tr>
              <td>
                <Rich text="Layout" />
              </td>
              <td>
                <Rich text="[`Stack`](/layout), [`Grid`](/layout), [`DockPanel`](/layout), [`Panel`](/layout), [`GroupBox`](/layout), [`SplitContainer`](/layout), [`Splitter`](/splitter), [`Resizable`](/resizable), [`Draggable`](/draggable), [`FormLayout`](/formlayout), [`ScrollView`](/scrollview) (pull to refresh, load more), [`Sortable`](/sortable)" />
              </td>
            </tr>
            <tr>
              <td>
                <Rich text="Data" />
              </td>
              <td>
                <Rich text="[`DataGrid`](/datagrid) (virtual or paged, editing, filters, grouping, master-detail, export), [`TreeView`](/treeview), [`FilterBuilder`](/filterbuilder), [`Scheduler`](/scheduler) (day to timeline, recurrence, resources, iCalendar), [`TabDocumentManager`](/tabdocs) (tabs, split, dock, new windows); lists and grids read `@motifx-community/data` sources" />
              </td>
            </tr>
            <tr>
              <td>
                <Rich text="Base" />
              </td>
              <td>
                <Rich text="[`Control`](/control), [`FocusContainer`](/keyboard) and [`addShortcut`](/keyboard), [`uiLocale`](/language), [the component tokens](/tokens); `Popup` and `MenuList`, the shared parts a menu or a drop-down opens on" />
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section anchor="design" title="Design system">
        <p>
          <Rich text="Visual styling comes from `@motifx-community/design-system`, which provides design tokens, three themes, density settings, fonts and user-preference overrides. `styles.css` imports it first, then the `mx.components` layer adds the [component tokens](/tokens) and the components. Components define no colors or sizes of their own." />
        </p>
        <ul class="docs-list">
          <li>
            <Rich text="Themes: light, dark and high contrast, selected with `data-theme`. The default follows the operating system preference. The design system build verifies every text and background pair against WCAG AA, and against AAA in high contrast." />
          </li>
          <li>
            <Rich text={'Density: `data-density="compact"` reduces the size of every control, bar and title bar.'} />
          </li>
          <li>
            <Rich text="Right-to-left layout: components are built on CSS logical properties." />
          </li>
        </ul>
        <Code lang="html" code={`<html data-theme="dark" data-density="compact">`} />
        <Code
          lang="css"
          code={`
/* your accent, after styles.css: a design-system override restyles every component */
:root {
  --mx-color-accent-solid: #8764b8;
  --mx-color-accent-solid-hover: #9373c0;
  --mx-color-accent-solid-pressed: #7e5aaf;
  --mx-color-accent-fg: #5c2e91;
}
`}
        />
      </Section>
    </>
  );
}
