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

      <Section anchor="how" title="How the components work">
        <ul class="docs-list">
          <li>
            <Rich text="Every component is an object. Write it in JSX and bind it to state, or create it with `new` and add it wherever and whenever you need it — the developer using it decides, both ways are complete." />
          </li>
          <li>
            <Rich text="Lifetime follows ownership: a component dies with the one it belongs to." />
          </li>
          <li>
            <Rich text="Keyboard, focus and ARIA are part of every component, not extras." />
          </li>
        </ul>
      </Section>

      <Section anchor="today" title="What ships today">
        <p>
          <Rich text="More than fifty components, every one an object with the same base: focus and the keyboard, the right roles and names for a screen reader, texts in English and Turkish that switch while the app runs, right to left, and a look in each of the design system's five languages (Tactile, Lounge, Material, Fluent, Lilac) painted from component tokens. Each has a page with live examples and its API." />
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
                <Rich text="[`Button`](/button) (menu, split, toggle, busy), [`ButtonGroup`](/buttongroup), [`Toolbar`](/toolbar), [`MenuBar`](/menus) and [`ContextMenu`](/menus)" />
              </td>
            </tr>
            <tr>
              <td>
                <Rich text="Editors" />
              </td>
              <td>
                <Rich text="[`TextBox`](/textbox) (mask, validation), [`TextArea`](/textarea), [`NumberBox`](/numberbox), [`DateBox`](/datebox), [`DateRangeBox`](/daterangebox), [`Calendar`](/calendar), [`ColorBox`](/colorbox) and [`ColorPicker`](/colorbox), [`Slider`](/slider), [`Rating`](/rating), [`FileUploader`](/fileuploader)" />
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
                <Rich text="[`Badge`](/badge), [`Avatar`](/avatar) and [`AvatarGroup`](/avatar), [`Chip`](/chip) and [`ChipGroup`](/chip), [`Card`](/card), [`Skeleton`](/skeleton), [`ProgressBar`](/progress) and [`Spinner`](/progress), [`LoadPanel`](/loadpanel), [`Tooltip`](/tooltip), [`Popover`](/popover), [`Toast`](/toast)" />
              </td>
            </tr>
            <tr>
              <td>
                <Rich text="Navigation and layers" />
              </td>
              <td>
                <Rich text="[`Tabs`](/tabs), [`Accordion`](/accordion), [`Breadcrumb`](/breadcrumb), [`Pagination`](/pagination), [`Stepper`](/stepper), [`Wizard`](/wizard), [`Window`](/window) and dialog, [`BottomSheet`](/bottomsheet), [`Drawer`](/drawer), [`ActionSheet`](/actionsheet)" />
              </td>
            </tr>
            <tr>
              <td>
                <Rich text="Layout" />
              </td>
              <td>
                <Rich text="[`Stack`](/layout), [`Grid`](/layout), [`DockPanel`](/layout), [`Panel`](/layout), [`GroupBox`](/layout), [`SplitContainer`](/layout), [`FormLayout`](/formlayout), [`ScrollView`](/scrollview) (pull to refresh, load more), [`Sortable`](/sortable)" />
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
          <Rich text="The look comes from `@motifx-community/design-system`: its tokens, three themes, density, fonts and user-preference overrides. `styles.css` imports it first, then this kit's own layer (`mx.components`) adds the [component tokens](/tokens) and the components. Nothing here is a color or a size of its own." />
        </p>
        <ul class="docs-list">
          <li>
            <Rich text="Themes: light, dark and high contrast, switched with `data-theme`; the OS preference is the default. Every text/background pair is checked in the design system's build: WCAG AA, AAA in high contrast." />
          </li>
          <li>
            <Rich text={'Density: `data-density="compact"` shrinks every control, bar and title bar.'} />
          </li>
          <li>
            <Rich text="RTL through logical properties." />
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
