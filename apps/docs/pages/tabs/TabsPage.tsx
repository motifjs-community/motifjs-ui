import { reactive, type Component } from '@motifx/core';
import { Button, enStrings, Tab, Tabs, TextBox, trStrings, uiLocale, type TabsPlacement, type TabsVariant } from '@motifx-community/ui';
import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';

const HomeIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M2.5 7.5L8 3l5.5 4.5M4 6.5v6.5h8V6.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M2.5 4h11v8h-11zM2.5 4.5L8 8.5l5.5-4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

const PLACEMENTS: TabsPlacement[] = ['top', 'bottom', 'start', 'end'];
const VARIANTS: TabsVariant[] = ['line', 'pill'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
  ['hint', '`Bind<string>`', "`''`", 'A tooltip.'],
  ['closable', '`Bind<boolean | undefined>`', 'the Tabs', 'A close button on this tab.'],
  ['lazy, keepAlive', '`Bind<boolean | undefined>`', 'the Tabs', 'This tab\'s own setting.'],
  ['content', '`() => ComponentBase | ComponentBase[]`', '—', 'Makes the panel content when the panel is built: instead of, or after, the JSX children.'],
  ['enabled', '`Bind<boolean>`', '`true`', '`false`: the tab cannot be selected and the arrow keys skip it.'],
  ['visible', '`Bind<boolean>`', '`true`', '`false`: the tab is left out; a selected one hands the selection to a neighbour.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'A value or a function, like the prop.'],
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
  ['select(tab | index)', '`boolean`', 'Selects a tab from code; `false` when it is hidden or not there.'],
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
  ['tabs.height.*, tabs.padding.*, tabs.font-size.*', 'Sizes, from the density tokens.'],
  ['tabs.gap, tabs.tab-gap, tabs.radius, tabs.font-weight', 'Inside a tab; between pills; corners; weight.'],
  ['tabs.divider-width, tabs.indicator-width', 'The line along the panel and the bar on the selected tab.'],
  ['tabs.strip-padding, tabs.vertical-width', 'The pill tray\'s padding; the width of a vertical strip.'],
  ['tabs.icon-size, tabs.badge-*, tabs.close-*', 'Icon, badge and close button.'],
  ['tabs.scroll-size, tabs.panel-padding', 'The scroll buttons; the space around a panel.'],
];

export default function TabsPage() {
  const s = reactive({
    page: 'general' as string | number,
    placement: 'top' as TabsPlacement,
    variant: 'line' as TabsVariant,
    stretch: false,
    scrollButtons: true,
    keepDraft: true,
    unread: 3,
    name: '',
    log: '',
    lang: 'en',
    builds: 0,
  });
  let added = 0;

  const coded = new Tabs({ label: 'Reports', closable: true });
  coded.add(new Tab({ title: 'Summary', content: () => <p>The summary, built when it was first shown.</p> }));
  coded.onSelectionChanged((e) => (s.log = e.tab ? `Selected “${e.tab.title}”${e.byUser ? ' by the user' : ' from code'}.` : 'No tab left.'));
  const addReport = () => {
    const n = ++added;
    const tab = coded.add(new Tab({ title: `Report ${n}`, content: () => <p>Report {n}.</p> }));
    coded.select(tab);
  };

  const months = new Tabs({ label: 'Months', scrollButtons: () => s.scrollButtons });
  for (const month of MONTHS) months.add(new Tab({ title: month, content: () => <p>{month}: nothing planned yet.</p> }));

  const lazyTabs = new Tabs({ label: 'Lazy panels' });
  lazyTabs.add(new Tab({ title: 'First', content: () => <p>Always here.</p> }));
  lazyTabs.add(
    new Tab({
      title: 'Kept',
      content: () => {
        s.builds++;
        return <TextBox label="Type, switch tabs, come back" />;
      },
    }),
  );
  lazyTabs.add(
    new Tab({
      title: 'Made each time',
      keepAlive: false,
      content: () => {
        s.builds++;
        return <TextBox label="This one starts empty each time" />;
      },
    }),
  );

  const place = (target: Tabs) => (c: Component<HTMLDivElement>) => c.controls.add(target);

  return (
    <>
      <p class="lead">
        Tabs show one panel at a time under a strip of tabs: from JSX or from code, closable, with icons and badges,
        scroll buttons when the tabs do not fit, four placements and panels built when they are first shown.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Tabs, Tab } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="A `<Tab>`'s children are its panel. `value` is the selected tab's `key` (else its index) and `x-model` binds it two-way. Created with `new`, tabs are added, inserted and removed from code." />
        </p>
        <Example
          code={`
<Tabs label="Settings" x-model={() => this.state.page}>
  <Tab key="general" title="&General">
    <TextBox label="Name" x-model={() => this.form.name} />
  </Tab>
  <Tab key="advanced" title="&Advanced">…</Tab>
</Tabs>

const reports = new Tabs({ label: 'Reports', closable: true });
reports.add(new Tab({ title: 'Summary', content: () => <Summary /> }));
reports.onSelectionChanged((e) => console.log(e.tab?.title, e.byUser));
this.panel.controls.add(reports);
`}
          stack
        >
          <Tabs label="Settings" x-model={() => s.page}>
            <Tab key="general" title="&General">
              <TextBox label="Name" x-model={() => s.name} helpText="Its text stays while you switch tabs." />
            </Tab>
            <Tab key="advanced" title="&Advanced">
              <p>Advanced settings.</p>
            </Tab>
            <Tab key="about" title="A&bout">
              <p>Version 1.0.</p>
            </Tab>
          </Tabs>
          <output class="tabs-page">{() => `value: "${s.page}"`}</output>
          <div class="docs-flow">
            <Button text="Add a report from code" variant="outline" onclick={addReport} />
            <output class="tabs-log">{() => s.log}</output>
          </div>
          <div class="docs-flow tabs-coded" style="inline-size: 100%" onBuilt={place(coded)} />
        </Example>
      </Section>

      <Section anchor="closable" title="Closable tabs">
        <p>
          <Rich text="A close button on every tab (`closable`), or on some (a tab's own `closable` wins). Delete or a middle click closes the focused or pointed tab. `onClose` can cancel: ask about unsaved work first." />
        </p>
        <Example
          code={`
<Tabs closable onClose={(e) => { if (e.tab.key === 'draft' && this.unsaved) e.cancel = true; }}>
  <Tab title="Home" closable={false}>…</Tab>
  <Tab key="draft" title="Draft">…</Tab>
  <Tab title="Notes">…</Tab>
</Tabs>
`}
          stack
        >
          <Button
            text={() => (s.keepDraft ? 'Draft is protected' : 'Draft can close')}
            variant="outline"
            size="sm"
            toggle
            x-model={() => s.keepDraft}
          />
          <Tabs
            label="Documents"
            closable
            onClose={(e) => {
              if (e.tab.key === 'draft' && s.keepDraft) e.cancel = true;
            }}
          >
            <Tab title="Home" icon={() => <HomeIcon />} closable={false}>
              <p>Home cannot be closed.</p>
            </Tab>
            <Tab key="draft" title="Draft">
              <p>Closing is cancelled while the draft is protected.</p>
            </Tab>
            <Tab title="Notes">
              <p>Notes.</p>
            </Tab>
            <Tab title="Ideas">
              <p>Ideas.</p>
            </Tab>
          </Tabs>
        </Example>
      </Section>

      <Section anchor="overflow" title="Many tabs">
        <p>
          <Rich text="When the tabs do not fit, arrow buttons scroll the strip (`scrollButtons`, on by default); the selected tab and the one with focus scroll into view." />
        </p>
        <Example
          code={`
const months = new Tabs({ label: 'Months', scrollButtons: () => this.state.buttons });
for (const month of MONTHS) months.add(new Tab({ title: month, content: () => <MonthView month={month} /> }));
`}
          stack
        >
          <Button text="Scroll buttons" variant="outline" size="sm" toggle x-model={() => s.scrollButtons} />
          <div class="tabs-months" style="inline-size: 100%; max-inline-size: 28rem" onBuilt={place(months)} />
        </Example>
      </Section>

      <Section anchor="placement" title="Placement">
        <Example
          code={`
<Tabs placement="start">…</Tabs>
`}
          stack
        >
          <div class="docs-flow" role="group" aria-label="Placement">
            {PLACEMENTS.map((placement) => (
              <Button
                key={placement}
                text={placement}
                size="sm"
                variant={() => (s.placement === placement ? 'solid' : 'ghost')}
                aria-pressed={() => s.placement === placement}
                onclick={() => (s.placement = placement)}
              />
            ))}
          </div>
          <Tabs label="Placement" class="tabs-placement" placement={() => s.placement}>
            <Tab title="Profile">
              <p>Profile.</p>
            </Tab>
            <Tab title="Security">
              <p>Security.</p>
            </Tab>
            <Tab title="Billing">
              <p>Billing.</p>
            </Tab>
          </Tabs>
        </Example>
      </Section>

      <Section anchor="activation" title="Manual activation">
        <p>
          <Rich text={'By default an arrow key selects the tab it moves to. With `activation="manual"` it only moves focus and Enter or Space selects: better when a panel is slow to show.'} />
        </p>
        <Example
          code={`
<Tabs activation="manual">…</Tabs>
`}
        >
          <Tabs label="Manual" class="tabs-manual" activation="manual">
            <Tab title="One">
              <p>One.</p>
            </Tab>
            <Tab title="Two">
              <p>Two.</p>
            </Tab>
            <Tab title="Three">
              <p>Three.</p>
            </Tab>
          </Tabs>
        </Example>
      </Section>

      <Section anchor="content" title="Icons, badges, disabled tabs">
        <Example
          code={`
<Tab title="Inbox" icon={() => <MailIcon />} badge={() => this.unread} hint="Mail you have not read" />
<Tab title="Archive" enabled={false} />
`}
          stack
        >
          <Tabs label="Mail">
            <Tab title="Inbox" icon={() => <MailIcon />} badge={() => (s.unread ? s.unread : null)} hint="Mail you have not read">
              <Button text="Read one" variant="outline" onclick={() => (s.unread = Math.max(0, s.unread - 1))} />
            </Tab>
            <Tab title="Sent">
              <p>Sent mail.</p>
            </Tab>
            <Tab title="Archive" enabled={false}>
              <p>Archive.</p>
            </Tab>
          </Tabs>
        </Example>
      </Section>

      <Section anchor="look" title="Variants and sizes">
        <Example
          code={`
<Tabs variant="pill" size="sm" stretch>…</Tabs>
`}
          stack
        >
          <div class="docs-flow">
            {VARIANTS.map((variant) => (
              <Button
                key={variant}
                text={variant}
                size="sm"
                variant={() => (s.variant === variant ? 'solid' : 'ghost')}
                aria-pressed={() => s.variant === variant}
                onclick={() => (s.variant = variant)}
              />
            ))}
            <Button text="Stretch" size="sm" variant="outline" toggle x-model={() => s.stretch} />
          </div>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Tabs key={size} label={`Size ${size}`} size={size} variant={() => s.variant} stretch={() => s.stretch}>
              <Tab title="Day">
                <p>{`Size ${size}.`}</p>
              </Tab>
              <Tab title="Week">
                <p>Week.</p>
              </Tab>
              <Tab title="Month">
                <p>Month.</p>
              </Tab>
            </Tabs>
          ))}
        </Example>
      </Section>

      <Section anchor="lazy" title="Lazy panels">
        <p>
          <Rich text="A panel is built the first time it is shown and kept afterwards, so what was typed in it stays (`lazy`, on by default; `lazy={false}` builds every panel at once). A tab with a `content` factory and `keepAlive={false}` has its content disposed while hidden and made again when it shows. JSX children are made once by the page, so they are always kept." />
        </p>
        <Example
          code={`
tabs.add(new Tab({ title: 'Kept', content: () => <TextBox label="…" /> }));
tabs.add(new Tab({ title: 'Made each time', keepAlive: false, content: () => <TextBox label="…" /> }));
`}
          stack
        >
          <div style="inline-size: 100%" onBuilt={place(lazyTabs)} />
          <output class="tabs-builds">{() => `Panels built: ${s.builds}`}</output>
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="Tabs write one text: the close button's tooltip, `uiLocale.strings.close`. Every tab follows a change at once." />
        </p>
        <Example
          code={`
uiLocale.strings = trStrings;
`}
        >
          <Button
            text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')}
            variant="outline"
            onclick={() => {
              s.lang = s.lang === 'en' ? 'tr' : 'en';
              uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
            }}
          />
          <span>
            The close button reads <output class="tabs-close-name">{() => uiLocale.strings.close}</output>
          </span>
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>Component tokens</h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>Tabs props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>Tab props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={TAB_PROPS} />
        <h3>Properties</h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>Methods</h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>Events</h3>
        <ApiTable head={['Event', 'When']} rows={EVENTS} />
      </Section>
    </>
  );
}
