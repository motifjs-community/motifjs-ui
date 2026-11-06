import { Code, Section } from '../../shared/doc';


export default function HomePage() {
  return (
    <>
      <p class="lead">
        Components for MotifJS that work the way desktop UI does — created when needed, shown anywhere, closed and
        disposed like windows — drawn from the MotifJS design system's tokens.
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
            Every component is an object. Write it in JSX and bind it to state, or create it with <code>new</code> and
            add it wherever and whenever you need it — the developer using it decides, both ways are complete.
          </li>
          <li>Lifetime follows ownership: a component dies with the one it belongs to.</li>
          <li>Keyboard, focus and ARIA are part of every component, not extras.</li>
        </ul>
      </Section>

      <Section anchor="today" title="What ships today">
        <p>
          More than fifty components, every one an object with the same base: focus and the keyboard, the right
          roles and names for a screen reader, texts in English and Turkish that switch while the app runs, right to
          left, and a look in each of the design system's five languages (Tactile, Lounge, Material, Fluent, Lilac)
          painted from component tokens. Each has a page with live examples and its API.
        </p>
        <table class="token-table api-table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Components</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Buttons and commands</td>
              <td>
                <a rel="router" href="/button"><code>Button</code></a> (menu, split, toggle, busy),{' '}
                <a rel="router" href="/buttongroup"><code>ButtonGroup</code></a>,{' '}
                <a rel="router" href="/toolbar"><code>Toolbar</code></a>,{' '}
                <a rel="router" href="/menus"><code>MenuBar</code> and <code>ContextMenu</code></a>
              </td>
            </tr>
            <tr>
              <td>Editors</td>
              <td>
                <a rel="router" href="/textbox"><code>TextBox</code></a> (mask, validation),{' '}
                <a rel="router" href="/textarea"><code>TextArea</code></a>,{' '}
                <a rel="router" href="/numberbox"><code>NumberBox</code></a>,{' '}
                <a rel="router" href="/datebox"><code>DateBox</code></a>,{' '}
                <a rel="router" href="/daterangebox"><code>DateRangeBox</code></a>,{' '}
                <a rel="router" href="/calendar"><code>Calendar</code></a>,{' '}
                <a rel="router" href="/colorbox"><code>ColorBox</code> and <code>ColorPicker</code></a>,{' '}
                <a rel="router" href="/slider"><code>Slider</code></a>,{' '}
                <a rel="router" href="/rating"><code>Rating</code></a>,{' '}
                <a rel="router" href="/fileuploader"><code>FileUploader</code></a>
              </td>
            </tr>
            <tr>
              <td>Choice</td>
              <td>
                <a rel="router" href="/checkbox"><code>CheckBox</code></a>,{' '}
                <a rel="router" href="/switch"><code>Switch</code></a>,{' '}
                <a rel="router" href="/radiogroup"><code>RadioGroup</code></a>,{' '}
                <a rel="router" href="/dropdown"><code>DropDown</code></a>,{' '}
                <a rel="router" href="/combobox"><code>ComboBox</code> and <code>Autocomplete</code></a>,{' '}
                <a rel="router" href="/lookup"><code>Lookup</code></a>,{' '}
                <a rel="router" href="/tagbox"><code>TagBox</code></a>,{' '}
                <a rel="router" href="/listbox"><code>ListBox</code></a>
              </td>
            </tr>
            <tr>
              <td>Display and feedback</td>
              <td>
                <a rel="router" href="/badge"><code>Badge</code></a>,{' '}
                <a rel="router" href="/avatar"><code>Avatar</code> and <code>AvatarGroup</code></a>,{' '}
                <a rel="router" href="/chip"><code>Chip</code> and <code>ChipGroup</code></a>,{' '}
                <a rel="router" href="/card"><code>Card</code></a>,{' '}
                <a rel="router" href="/skeleton"><code>Skeleton</code></a>,{' '}
                <a rel="router" href="/progress"><code>ProgressBar</code> and <code>Spinner</code></a>,{' '}
                <a rel="router" href="/loadpanel"><code>LoadPanel</code></a>,{' '}
                <a rel="router" href="/tooltip"><code>Tooltip</code></a>,{' '}
                <a rel="router" href="/popover"><code>Popover</code></a>,{' '}
                <a rel="router" href="/toast"><code>Toast</code></a>
              </td>
            </tr>
            <tr>
              <td>Navigation and layers</td>
              <td>
                <a rel="router" href="/tabs"><code>Tabs</code></a>,{' '}
                <a rel="router" href="/accordion"><code>Accordion</code></a>,{' '}
                <a rel="router" href="/breadcrumb"><code>Breadcrumb</code></a>,{' '}
                <a rel="router" href="/pagination"><code>Pagination</code></a>,{' '}
                <a rel="router" href="/stepper"><code>Stepper</code></a>,{' '}
                <a rel="router" href="/wizard"><code>Wizard</code></a>,{' '}
                <a rel="router" href="/window"><code>Window</code> and dialog</a>,{' '}
                <a rel="router" href="/bottomsheet"><code>BottomSheet</code></a>,{' '}
                <a rel="router" href="/drawer"><code>Drawer</code></a>,{' '}
                <a rel="router" href="/actionsheet"><code>ActionSheet</code></a>
              </td>
            </tr>
            <tr>
              <td>Layout</td>
              <td>
                <a rel="router" href="/layout"><code>Stack</code>, <code>Grid</code>, <code>DockPanel</code>, <code>Panel</code>, <code>GroupBox</code>, <code>SplitContainer</code></a>,{' '}
                <a rel="router" href="/formlayout"><code>FormLayout</code></a>,{' '}
                <a rel="router" href="/scrollview"><code>ScrollView</code></a> (pull to refresh, load more),{' '}
                <a rel="router" href="/sortable"><code>Sortable</code></a>
              </td>
            </tr>
            <tr>
              <td>Data</td>
              <td>
                <a rel="router" href="/datagrid"><code>DataGrid</code></a> (virtual or paged, editing, filters, grouping, master-detail, export),{' '}
                <a rel="router" href="/treeview"><code>TreeView</code></a>,{' '}
                <a rel="router" href="/filterbuilder"><code>FilterBuilder</code></a>,{' '}
                <a rel="router" href="/scheduler"><code>Scheduler</code></a> (day to timeline, recurrence, resources, iCalendar),{' '}
                <a rel="router" href="/tabdocs"><code>TabDocumentManager</code></a> (tabs, split, dock, new windows); lists and grids read <code>@motifx-community/data</code> sources
              </td>
            </tr>
            <tr>
              <td>Base</td>
              <td>
                <a rel="router" href="/control"><code>Control</code></a>,{' '}
                <a rel="router" href="/keyboard"><code>FocusContainer</code> and <code>addShortcut</code></a>,{' '}
                <a rel="router" href="/language"><code>uiLocale</code></a>,{' '}
                <a rel="router" href="/tokens">the component tokens</a>; <code>Popup</code> and <code>MenuList</code>, the shared parts a menu or a drop-down opens on
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section anchor="design" title="Design system">
        <p>
          The look comes from <code>@motifx-community/design-system</code>: its tokens, three themes, density, fonts
          and user-preference overrides. <code>styles.css</code> imports it first, then this kit's own layer
          (<code>mx.components</code>) adds the <a rel="router" href="/tokens">component tokens</a> and the components.
          Nothing here is a color or a size of its own.
        </p>
        <ul class="docs-list">
          <li>
            Themes: light, dark and high contrast, switched with <code>data-theme</code>; the OS preference is the
            default. Every text/background pair is checked in the design system's build: WCAG AA, AAA in high
            contrast.
          </li>
          <li>
            Density: <code>data-density="compact"</code> shrinks every control, bar and title bar.
          </li>
          <li>RTL through logical properties.</li>
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
