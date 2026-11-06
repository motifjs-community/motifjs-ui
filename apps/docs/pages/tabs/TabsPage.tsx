import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Closable from './examples/Closable';
import Programmatic from './examples/Programmatic';
import IconsAndBadges from './examples/IconsAndBadges';
import LazyPanels from './examples/LazyPanels';
import Localization from './examples/Localization';
import ManualActivation from './examples/ManualActivation';
import ManyTabs from './examples/ManyTabs';
import Placement from './examples/Placement';
import VariantsAndSizes from './examples/VariantsAndSizes';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<string | number | null>`', 'The first tab', 'The `key` of the selected tab, or its index. `x-model` provides two-way binding.'],
  ['selectedIndex', '`Bind<number>`', '`0`', 'The index of the selected tab in `tabs`.'],
  ['label', '`Bind<string>`', "`''`", 'The accessible name of the tab list (`aria-label`). This is the same property as `text`.'],
  ['activation', "`Bind<'auto' | 'manual'>`", "`'auto'`", 'With `auto`, an arrow key selects the tab it moves to. With `manual`, arrow keys only move focus, and Enter or Space selects.'],
  ['placement', '`Bind<TabsPlacement>`', "`'top'`", '`top`, `bottom`, `start` or `end`. `start` and `end` stack the tabs vertically.'],
  ['variant', '`Bind<TabsVariant>`', "`'line'`", '`line` shows a bar on the selected tab. `pill` places the tabs on a tray and raises the selected one.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`, from the density tokens.'],
  ['stretch', '`Bind<boolean>`', '`false`', 'Makes the tabs share the full width.'],
  ['scrollButtons', '`Bind<boolean>`', '`true`', 'Shows arrow buttons at the ends of the strip when tabs do not fit. When off, a thin scrollbar appears.'],
  ['closable', '`Bind<boolean>`', '`false`', 'Adds a close button to every tab. A tab\'s own `closable` takes precedence.'],
  ['lazy', '`Bind<boolean>`', '`true`', 'Creates a panel the first time it is shown and then keeps it. A tab\'s own `lazy` takes precedence.'],
  ['keepAlive', '`Bind<boolean>`', '`true`', 'With `false`, content created by a tab\'s `content` is disposed while hidden and recreated when shown. A tab\'s own `keepAlive` takes precedence.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'Properties shared by all controls. `tabStop={false}` removes the tab strip from the Tab order.'],
];

const TAB_PROPS = [
  ['title', '`Bind<string>`', "`''`", 'The caption. `&General` makes Alt+G select the tab. This is the same property as `text`.'],
  ['key', '`Bind<string>`', "`''`", 'Identifies the tab in `value`. The JSX `key` also works.'],
  ['icon', '`Bind<IconSource | null>`', '—', 'An icon before the title.'],
  ['badge', '`Bind<string | number | null>`', '—', 'Short text after the title, such as a count. An empty value or `null` hides it.'],
  ['hint', '`Bind<string>`', "`''`", 'The tooltip text.'],
  ['closable', '`Bind<boolean | undefined>`', 'From Tabs', 'Shows a close button on this tab.'],
  ['lazy, keepAlive', '`Bind<boolean | undefined>`', 'From Tabs', 'This tab\'s own setting.'],
  ['content', '`() => ComponentBase | ComponentBase[]`', '—', 'Creates the panel content when the panel is created, either instead of or after the JSX children.'],
  ['enabled', '`Bind<boolean>`', '`true`', '`false` means the tab cannot be selected and the arrow keys skip it.'],
  ['visible', '`Bind<boolean>`', '`true`', '`false` removes the tab. If it is selected, the selection moves to an adjacent tab.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['tabs', 'read-only, reactive', 'The tabs in strip order.'],
  ['selectedTab', 'read-only, reactive', 'The selected `Tab`, or `null` if there is none.'],
  ['Tab.isSelected, Tab.isClosable', 'read-only, reactive', 'Indicate whether the tab is selected and whether it shows a close button.'],
  ['Tab.contentBuilt', 'read-only', 'Indicates whether its panel has been created.'],
  ['Tab.owner, Tab.headerElement', 'read-only', 'Its `Tabs` and its button in the strip. A tab\'s own element is its panel.'],
];

const METHODS = [
  ['add(tab)', '`Tab`', 'Adds a tab at the end. A tab from another `Tabs` moves here.'],
  ['insert(index, tab)', '`Tab`', 'Adds a tab at an index.'],
  ['remove(tab)', '`boolean`', 'Removes the tab and disposes it, without raising `onClose`. Selection and focus move to an adjacent tab.'],
  ['select(tab | index)', '`boolean`', 'Selects a tab programmatically. Returns `false` if it is hidden or missing.'],
  ['close(tab)', '`boolean`', 'Closes a tab as its close button does, so `onClose` can cancel it.'],
  ['focus()', '`boolean`', 'Sets focus on the selected tab.'],
  ['Tab.select(), Tab.close(), Tab.focus()', '`boolean`', 'Same as the methods above, called on the tab.'],
];

const EVENTS = [
  ['onSelecting(e)', 'Occurs before the user selects a tab. `e`: `{ tab, index, previousTab, previousIndex, cancel, source, event }`. Set `e.cancel = true` to keep the current tab.'],
  ['onSelectionChanged(e)', 'Occurs after the selected tab changes. `e`: `{ tab, index, previousTab, previousIndex, byUser, source, event? }`.'],
  ['onClose(e)', 'Occurs before a tab closes, from its button, Delete, a middle-click or `close()`. `e`: `{ tab, index, byUser, cancel, source, event? }`.'],
];

const KEYS = [
  ['Tab', 'Moves focus to the selected tab, then into its panel.'],
  ['Left / Right', 'Moves to the previous or next tab, wrapping at the ends (reversed for right-to-left text). With `start` and `end` placement, use Up and Down.'],
  ['Home / End', 'Moves to the first or last tab.'],
  ['Enter / Space', 'Selects the focused tab (with `activation="manual"`).'],
  ['Delete', 'Closes the focused tab if it is closable.'],
  ['Alt + key (`&General`)', 'Selects that tab and moves focus to it (Control + Option + key on Apple platforms).'],
];

const A11Y = [
  ['Roles', '`tablist`, `tab` (a `<button>`) and `tabpanel`, with `aria-orientation="vertical"` for `start` and `end` placement.'],
  ['State', '`aria-selected` on the tabs. `aria-controls` links a tab to its panel, and `aria-labelledby` names the panel after its tab.'],
  ['Focus', 'The strip has one Tab stop, on the selected tab. A panel with no focusable content receives focus itself (`tabindex="0"`), so its text can be reached.'],
  ['Disabled tabs', '`aria-disabled="true"`. The arrow keys skip these tabs.'],
  ['Close button', 'Not a Tab stop and hidden from screen readers, because a button inside a tab would be a control within a control. Delete closes the tab, and `aria-keyshortcuts="Delete"` announces it. Its tooltip comes from `uiLocale`.'],
  ['Scroll buttons', 'These are for pointer use only and are hidden from screen readers. The arrow keys reach every tab and scroll it into view.'],
];

const HOOKS = [
  ['.mx-tabs', 'The root. `data-placement`, `data-variant`, `data-size`, `data-stretch`, `data-overflow`, `data-scroll-buttons`, `data-disabled`.'],
  ['.mx-tabs__strip, .mx-tabs__list', 'The strip and its tab list, which is the scrolling box.'],
  ['.mx-tabs__tab', 'A tab: `aria-selected`, `aria-disabled`, `data-closable`.'],
  ['.mx-tabs__icon, .mx-tabs__label, .mx-tabs__badge, .mx-tabs__close', 'The parts of a tab.'],
  ['.mx-tabs__scroll', 'A scroll button: `data-direction` (`back`, `forward`), and `data-end` when it cannot scroll further.'],
  ['.mx-tabs__panels, .mx-tabs__panel', 'The panels and a panel (the tab\'s own element).'],
];

const TOKENS = [
  ['tabs.container, tabs.strip, tabs.list, tabs.scroll, tabs.scroll-icon', 'Units: the root, the strip with its line along the panel (`bottom`, `start`, `end`; the pill tray: `pill`, `pill-bottom` …), the tab row, the scroll buttons and their glyph.'],
  ['tabs.tab, tabs.label, tabs.icon, tabs.badge, tabs.close, tabs.close-icon', 'Units: a tab in each state (`hover`, `pressed`, `selected`, `disabled`, `focus`; in the pill variant `pill`, `pill-hover` …) and its parts.'],
  ['tabs.indicator, tabs.separator, tabs.panel', 'Units: the line variant indicator (`vertical`, `hover`, `selected`, `selected-disabled`), a divider between tabs, and the panel (`pill`, `pill-across`, `focus`).'],
  ['tabs.height.*, tabs.pill-height.*, tabs.padding.*, tabs.font-size.*, tabs.line-height.*, tabs.indicator-inset.*', 'Sizes per size class.'],
  ['tabs.pill-gap, tabs.tab-overlap, tabs.indicator-offset, tabs.indicator-inset-vertical, tabs.close-pull, tabs.vertical-width', 'Layout measurements: the gap between pills, the offset over the strip line, the indicator, the close button, and the width of a vertical strip.'],
  ['tabs.curve-display, tabs.curve-size, tabs.curve-frame-width, tabs.curve-frame-color', 'Outward curves at the corners of the selected tab on the panel side, in its fill color.'],
];

export default function TabsPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Tabs display one panel at a time below a tab strip. You can define them in JSX or programmatically, and they support closable tabs, icons and badges, scroll buttons when tabs overflow, four placements, and panels that are created on first display." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Tabs, Tab } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="The children of a `<Tab>` are its panel. `value` is the `key` of the selected tab, or its index, and `x-model` provides two-way binding. When you create the component with `new`, add, insert and remove tabs programmatically." />
        </p>
        <Example files={code('Programmatic.tsx')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="closable" title="Closable tabs">
        <p>
          <Rich text="`closable` adds a close button to every tab, and a tab's own `closable` takes precedence. Delete or a middle-click closes the focused or hovered tab. `onClose` can cancel the action, for example to confirm unsaved changes." />
        </p>
        <Example files={code('Closable.tsx')} stack>
          <Closable />
        </Example>
      </Section>

      <Section anchor="overflow" title="Overflow">
        <p>
          <Rich text="When tabs do not fit, arrow buttons scroll the strip (`scrollButtons`, on by default). The selected tab and the focused tab scroll into view." />
        </p>
        <Example files={code('ManyTabs.tsx')} stack>
          <ManyTabs />
        </Example>
      </Section>

      <Section anchor="placement" title="Placement">
        <Example files={code('Placement.tsx')} stack>
          <Placement />
        </Example>
      </Section>

      <Section anchor="activation" title="Manual activation">
        <p>
          <Rich text={'By default, an arrow key selects the tab it moves to. With `activation="manual"`, it only moves focus, and Enter or Space selects the tab. This works better when a panel is slow to display.'} />
        </p>
        <Example files={code('ManualActivation.tsx')}>
          <ManualActivation />
        </Example>
      </Section>

      <Section anchor="content" title="Icons, badges and disabled tabs">
        <Example files={code('IconsAndBadges.tsx')} stack>
          <IconsAndBadges />
        </Example>
      </Section>

      <Section anchor="look" title="Variants and sizes">
        <Example files={code('VariantsAndSizes.tsx')} stack>
          <VariantsAndSizes />
        </Example>
      </Section>

      <Section anchor="lazy" title="Lazy panels">
        <p>
          <Rich text="A panel is created the first time it is shown and then kept, so user input is preserved (`lazy`, on by default). `lazy={false}` creates every panel immediately. A tab with a `content` factory and `keepAlive={false}` has its content disposed while hidden and recreated when shown. JSX children are created once by the page, so they are always kept." />
        </p>
        <Example files={code('LazyPanels.tsx')} stack>
          <LazyPanels />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'Details']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="Tabs have one string of their own, the close button tooltip `uiLocale.strings.close`. Every tab updates immediately when it changes." />
        </p>
        <Example files={code('Localization.tsx')}>
          <Localization />
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
        <h3>
          <Rich text="Component tokens" />
        </h3>
        <ApiTable head={['Token', 'Description']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="Tabs props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>
          <Rich text="Tab props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={TAB_PROPS} />
        <h3>
          <Rich text="Properties" />
        </h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>
          <Rich text="Methods" />
        </h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>
          <Rich text="Events" />
        </h3>
        <ApiTable head={['Event', 'When']} rows={EVENTS} />
      </Section>
    </>
  );
}
