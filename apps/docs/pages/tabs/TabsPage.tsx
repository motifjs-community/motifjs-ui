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
  ['value', '`Bind<string | number | null>`', 'the first tab', 'The selected tab\'s `key`, else its index. `x-model` binds it two-way.'],
  ['selectedIndex', '`Bind<number>`', '`0`', 'The selected tab\'s index in `tabs`.'],
  ['label', '`Bind<string>`', "`''`", 'Names the tab list for screen readers (`aria-label`). The same property as `text`.'],
  ['activation', "`Bind<'auto' | 'manual'>`", "`'auto'`", '`auto`: an arrow key selects the tab it moves to. `manual`: arrows move focus only; Enter or Space selects.'],
  ['placement', '`Bind<TabsPlacement>`', "`'top'`", '`top`, `bottom`, `start`, `end`. `start` and `end` stack the tabs vertically.'],
  ['variant', '`Bind<TabsVariant>`', "`'line'`", '`line`: a bar on the selected tab. `pill`: the tabs sit on a tray and the selected one is raised.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`, from the density tokens.'],
  ['stretch', '`Bind<boolean>`', '`false`', 'The tabs share the whole width.'],
  ['scrollButtons', '`Bind<boolean>`', '`true`', 'Arrow buttons at the ends of the strip when the tabs do not fit. Off: a thin scroll bar.'],
  ['closable', '`Bind<boolean>`', '`false`', 'Every tab gets a close button. A tab\'s own `closable` wins.'],
  ['lazy', '`Bind<boolean>`', '`true`', 'A panel is built when it is first shown, then kept. A tab\'s own `lazy` wins.'],
  ['keepAlive', '`Bind<boolean>`', '`true`', '`false`: what a tab\'s `content` made is disposed while the tab is hidden and made again when it shows. A tab\'s own `keepAlive` wins.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'The shared properties of every control. `tabStop={false}` takes the tab strip out of the Tab order.'],
];

const TAB_PROPS = [
  ['title', '`Bind<string>`', "`''`", 'The caption; `&General` makes Alt+G select the tab. The same property as `text`.'],
  ['key', '`Bind<string>`', "`''`", 'Names the tab in `value`. The JSX `key` works too.'],
  ['icon', '`Bind<IconSource | null>`', '—', 'An icon before the title.'],
  ['badge', '`Bind<string | number | null>`', '—', 'A short text after the title (a count); empty or `null` shows none.'],
  ['hint', '`Bind<string>`', "`''`", 'The tooltip text.'],
  ['closable', '`Bind<boolean | undefined>`', 'the Tabs', 'A close button on this tab.'],
  ['lazy, keepAlive', '`Bind<boolean | undefined>`', 'the Tabs', 'This tab\'s own setting.'],
  ['content', '`() => ComponentBase | ComponentBase[]`', '—', 'Makes the panel content when the panel is built: instead of, or after, the JSX children.'],
  ['enabled', '`Bind<boolean>`', '`true`', '`false`: the tab cannot be selected and the arrow keys skip it.'],
  ['visible', '`Bind<boolean>`', '`true`', '`false`: the tab is left out; a selected one hands the selection to a neighbour.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['tabs', 'read-only, reactive', 'The tabs, in strip order.'],
  ['selectedTab', 'read-only, reactive', 'The selected `Tab`, `null` when there is none.'],
  ['Tab.isSelected, Tab.isClosable', 'read-only, reactive', 'Whether the tab is selected; whether it shows a close button.'],
  ['Tab.contentBuilt', 'read-only', 'Whether its panel has been built.'],
  ['Tab.owner, Tab.headerElement', 'read-only', 'Its `Tabs`; its button in the strip. A tab\'s own element is its panel.'],
];

const METHODS = [
  ['add(tab)', '`Tab`', 'Adds a tab at the end. A tab of another `Tabs` moves here.'],
  ['insert(index, tab)', '`Tab`', 'Adds a tab at an index.'],
  ['remove(tab)', '`boolean`', 'Removes the tab and disposes it; no `onClose`. The selection and focus move to a neighbour.'],
  ['select(tab | index)', '`boolean`', 'Selects a tab programmatically; `false` when it is hidden or not there.'],
  ['close(tab)', '`boolean`', 'Closes a tab as its close button does: `onClose` can cancel it.'],
  ['focus()', '`boolean`', 'Focuses the selected tab.'],
  ['Tab.select(), Tab.close(), Tab.focus()', '`boolean`', 'The same, from the tab.'],
];

const EVENTS = [
  ['onSelecting(e)', 'The user is about to select a tab. `e`: `{ tab, index, previousTab, previousIndex, cancel, source, event }`; `e.cancel = true` keeps the current one.'],
  ['onSelectionChanged(e)', 'The selected tab changed. `e`: `{ tab, index, previousTab, previousIndex, byUser, source, event? }`.'],
  ['onClose(e)', 'A tab is about to close, by its button, Delete, a middle click or `close()`. `e`: `{ tab, index, byUser, cancel, source, event? }`.'],
];

const KEYS = [
  ['Tab', 'Into the strip, onto the selected tab; again, into its panel.'],
  ['Left / Right', 'The previous / next tab, wrapping around (reversed in right-to-left text). With `start` and `end` placement: Up / Down.'],
  ['Home / End', 'The first / last tab.'],
  ['Enter / Space', 'Select the focused tab (with `activation="manual"`).'],
  ['Delete', 'Closes the focused tab when it is closable.'],
  ['Alt + key (`&General`)', 'Selects that tab and focuses it (Control + Option + key on Apple platforms).'],
];

const A11Y = [
  ['Roles', '`tablist`, `tab` (a `<button>`) and `tabpanel`; `aria-orientation="vertical"` with `start` and `end` placement.'],
  ['State', '`aria-selected` on the tabs; `aria-controls` ties a tab to its panel and `aria-labelledby` names the panel by its tab.'],
  ['Focus', 'One Tab stop in the strip (the selected tab). A panel with nothing focusable in it takes focus itself (`tabindex="0"`), so its text can be reached.'],
  ['Disabled tabs', '`aria-disabled="true"`; the arrow keys skip them.'],
  ['Close button', 'Not a Tab stop and hidden from screen readers (a button inside a tab would be a control inside a control); Delete closes the tab and `aria-keyshortcuts="Delete"` announces it. Its tooltip comes from `uiLocale`.'],
  ['Scroll buttons', 'For the pointer only, hidden from screen readers: the arrow keys reach every tab and scroll it into view.'],
];

const HOOKS = [
  ['.mx-tabs', 'The root. `data-placement`, `data-variant`, `data-size`, `data-stretch`, `data-overflow`, `data-scroll-buttons`, `data-disabled`.'],
  ['.mx-tabs__strip, .mx-tabs__list', 'The strip and the tab list in it (the scroll box).'],
  ['.mx-tabs__tab', 'A tab: `aria-selected`, `aria-disabled`, `data-closable`.'],
  ['.mx-tabs__icon, .mx-tabs__label, .mx-tabs__badge, .mx-tabs__close', 'The parts of a tab.'],
  ['.mx-tabs__scroll', 'A scroll button: `data-direction` (`back`, `forward`), `data-end` when it has nowhere to go.'],
  ['.mx-tabs__panels, .mx-tabs__panel', 'The panels and a panel (the tab\'s own element).'],
];

const TOKENS = [
  ['tabs.container, tabs.strip, tabs.list, tabs.scroll, tabs.scroll-icon', 'Units: the whole, the strip with its line along the panel (`bottom`, `start`, `end`; the pill tray: `pill`, `pill-bottom` …), the row of tabs, the scroll buttons and their glyph.'],
  ['tabs.tab, tabs.label, tabs.icon, tabs.badge, tabs.close, tabs.close-icon', 'Units: a tab in each state (`hover`, `pressed`, `selected`, `disabled`, `focus`; in the pill variant `pill`, `pill-hover` …) and its parts.'],
  ['tabs.indicator, tabs.separator, tabs.panel', 'Units: the line variant\'s mark (`vertical`, `hover`, `selected`, `selected-disabled`), a line between two tabs, the panel (`pill`, `pill-across`, `focus`).'],
  ['tabs.height.*, tabs.pill-height.*, tabs.padding.*, tabs.font-size.*, tabs.line-height.*, tabs.indicator-inset.*', 'Sizes per size class.'],
  ['tabs.pill-gap, tabs.tab-overlap, tabs.indicator-offset, tabs.indicator-inset-vertical, tabs.close-pull, tabs.vertical-width', 'Where the layout puts the pieces: between pills, over the strip\'s line, the mark, the close button, a vertical strip\'s width.'],
  ['tabs.curve-display, tabs.curve-size, tabs.curve-frame-width, tabs.curve-frame-color', 'Outward curves at the selected tab\'s corners on the panel\'s side, in its fill.'],
];

export default function TabsPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Tabs show one panel at a time under a strip of tabs: from JSX or programmatically, closable, with icons and badges, scroll buttons when the tabs do not fit, four placements and panels built when they are first shown." />
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
          <Rich text="A `<Tab>`'s children are its panel. `value` is the selected tab's `key` (else its index) and `x-model` binds it two-way. Created with `new`, tabs are added, inserted and removed programmatically." />
        </p>
        <Example files={code('Programmatic.tsx')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="closable" title="Closable tabs">
        <p>
          <Rich text="A close button on every tab (`closable`), or on some (a tab's own `closable` wins). Delete or a middle click closes the focused or pointed tab. `onClose` can cancel: ask about unsaved work first." />
        </p>
        <Example files={code('Closable.tsx')} stack>
          <Closable />
        </Example>
      </Section>

      <Section anchor="overflow" title="Many tabs">
        <p>
          <Rich text="When the tabs do not fit, arrow buttons scroll the strip (`scrollButtons`, on by default); the selected tab and the one with focus scroll into view." />
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
          <Rich text={'By default an arrow key selects the tab it moves to. With `activation="manual"` it only moves focus and Enter or Space selects: better when a panel is slow to show.'} />
        </p>
        <Example files={code('ManualActivation.tsx')}>
          <ManualActivation />
        </Example>
      </Section>

      <Section anchor="content" title="Icons, badges, disabled tabs">
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
          <Rich text="A panel is built the first time it is shown and kept afterwards, so what was typed in it stays (`lazy`, on by default; `lazy={false}` builds every panel at once). A tab with a `content` factory and `keepAlive={false}` has its content disposed while hidden and made again when it shows. JSX children are made once by the page, so they are always kept." />
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
          <Rich text="Tabs write one text: the close button's tooltip, `uiLocale.strings.close`. Every tab follows a change at once." />
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
