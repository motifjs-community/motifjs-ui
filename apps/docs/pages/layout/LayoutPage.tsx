import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import AppShell from './examples/AppShell';
import Programmatic from './examples/Programmatic';
import GridForm from './examples/GridForm';
import GridTracks from './examples/GridTracks';
import GroupBoxes from './examples/GroupBoxes';
import Localization from './examples/Localization';
import NestedSplit from './examples/NestedSplit';
import Panels from './examples/Panels';
import Spacing from './examples/Spacing';
import StackOptions from './examples/StackOptions';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const SPACE = [
  ["'xxs' … 'xxl'", 'A step of the spacing scale: `xxs`, `xs`, `sm`, `md`, `lg`, `xl`, `xxl`, from the `layout.space.*` tokens (the design system\'s `space.1` … `space.12`). Density and themes reach them.'],
  ['12', 'A number is pixels.'],
  ["'1.5rem'", 'Any CSS length.'],
  ["'xs md'", 'A padding takes one to four values, as in CSS (block-start, inline-end, block-end, inline-start), steps and lengths mixed. They follow the reading direction.'],
];

const TRACKS = [
  ["'auto 1fr 2fr 120'", 'CSS grid tracks; a bare number is pixels.'],
  ["'* 2*'", '`*` is `1fr`, `2*` is `2fr`.'],
  ["'minmax(8rem, 1fr) auto'", 'Any CSS track, functions included.'],
  ["['auto', 120, '*']", 'The same as a list.'],
  ['3', 'A number: that many equal columns (or rows).'],
];

const STACK_PROPS = [
  ['orientation', "`Bind<'horizontal' | 'vertical'>`", "`'vertical'`", '`horizontal` follows the reading direction.'],
  ['gap', '`Bind<LayoutSpace>`', '`layout.gap`', 'The space between the children.'],
  ['padding', '`Bind<LayoutSpace>`', '—', 'The space inside the edges.'],
  ['align', '`Bind<LayoutAlign>`', "`'stretch'`", 'Across the direction: `start`, `center`, `end`, `stretch`, `baseline`.'],
  ['justify', '`Bind<StackJustify>`', "`'start'`", 'Along it: `start`, `center`, `end`, `space-between`, `space-around`, `space-evenly`.'],
  ['wrap', '`Bind<boolean>`', '`false`', 'Children that do not fit go on to a new line.'],
  ['reverse', '`Bind<boolean>`', '`false`', 'The children are laid out from the other end (Tab order stays the document order).'],
  ['inline', '`Bind<boolean>`', '`false`', 'Flows in a line of text, as wide as its children.'],
];

const GRID_PROPS = [
  ['columns, rows', '`Bind<GridTracks>`', 'one column', 'See Grid tracks.'],
  ['gap', '`Bind<LayoutSpace>`', '`layout.gap`', 'Between rows and columns.'],
  ['rowGap, columnGap', '`Bind<LayoutSpace>`', '`gap`', 'One direction only.'],
  ['padding', '`Bind<LayoutSpace>`', '—', 'The space inside the edges.'],
  ['autoRows, autoColumns', '`Bind<number | string>`', "`'auto'`", 'The size of tracks made as needed (a number is pixels).'],
  ['flow', '`Bind<GridFlow>`', "`'row'`", 'How children without a place fill the grid: `row`, `column`, `row dense`, `column dense`.'],
  ['align', '`Bind<LayoutAlign>`', "`'stretch'`", 'Where children sit in their cells, up and down.'],
  ['justify', '`Bind<GridJustify>`', "`'stretch'`", 'Where children sit in their cells, along the row.'],
  ['inline', '`Bind<boolean>`', '`false`', 'Flows in a line of text.'],
];

const PANEL_PROPS = [
  ['scrollable', "`Bind<boolean | 'vertical' | 'horizontal' | 'both'>`", '`false`', 'Scrolls its content; it is then a Tab stop, so the keys scroll it.'],
  ['padding', '`Bind<LayoutSpace>`', '—', 'The space inside the edges.'],
  ['variant', '`Bind<PanelVariant>`', "`'plain'`", '`plain`, `outline` (a border), `card` (a card surface).'],
  ['text', '`Bind<string>`', "`''`", 'Names the panel: it becomes a region landmark with that name.'],
];

const GROUP_PROPS = [
  ['title', '`Bind<string>`', "`''`", 'The legend; `&Address` makes Alt+A focus the first control inside. The same property as `text`.'],
  ['collapsible', '`Bind<boolean>`', '`false`', 'The title is a button that shows and hides the content.'],
  ['collapsed', '`Bind<boolean>`', '`false`', 'The content is hidden (with `collapsible`).'],
  ['padding', '`Bind<LayoutSpace>`', '`layout.group-box.padding`', 'The space inside the frame.'],
  ['gap', '`Bind<LayoutSpace>`', '`layout.group-box.gap`', 'The space between the children (they stack in a column).'],
  ['variant', '`Bind<GroupBoxVariant>`', "`'outline'`", '`outline` (a frame, the title on its edge) or `plain` (the title over the content).'],
];

const DOCK_PROPS = [
  ['gap', '`Bind<LayoutSpace>`', '—', 'The space between a docked child and what it docks against.'],
  ['padding', '`Bind<LayoutSpace>`', '—', 'The space inside the edges.'],
];

const SPLIT_PROPS = [
  ['orientation', "`Bind<'horizontal' | 'vertical'>`", "`'horizontal'`", '`horizontal`: the panes side by side, as in Stack; `vertical`: one over the other.'],
  ['position', '`Bind<SplitPosition>`', "`'50%'`", 'The size of the pane that keeps its size (the first one with `fixedPanel="none"`): pixels, a share, a CSS length. `x-model` binds it.'],
  ['fixedPanel', "`Bind<'none' | 'first' | 'second'>`", "`'none'`", 'The pane that keeps its size when the container is resized. `none`: both grow, the position is kept as a share.'],
  ['firstMinSize, secondMinSize', '`Bind<number>`', '`0`', 'The smallest size of each pane, in pixels.'],
  ['collapsed', "`Bind<'none' | 'first' | 'second'>`", "`'none'`", 'A pane that is hidden; the other takes all the room.'],
  ['resizable', '`Bind<boolean>`', '`true`', 'The pointer and the keys move the splitter.'],
  ['collapsible', '`Bind<boolean>`', '`true`', 'Enter and a double click hide and restore the first pane.'],
  ['step', '`Bind<number>`', '`10`', 'How far an arrow key moves the splitter, in pixels.'],
  ['splitterLabel', '`Bind<string>`', '`uiLocale.strings.resize`', 'The splitter\'s accessible name.'],
];

const CHILD_PROPS = [
  ['grow', 'Stack', '`Bind<boolean | number>`', 'Takes the free space along the direction; numbers share it in proportion.'],
  ['row, column', 'Grid', '`Bind<number | string>`', 'The line it starts at, from 1 (a string goes to CSS as it is: `-1`).'],
  ['rowSpan, columnSpan', 'Grid', '`Bind<number>`', 'How many tracks it covers.'],
  ['dock', 'DockPanel', '`Bind<Dock>`', '`top`, `bottom`, `start`, `end`, `fill` (default) or `float`.'],
  ['left, top, right, bottom', 'DockPanel', '`Bind<number | string>`', 'The anchors of a `float` child; a number is pixels; `left` + `right` stretch it.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['SplitContainer.first, second', 'read-only', 'The panes, two `Panel`s: `split.first.controls.add(…)`, `split.second.scrollable = true`.'],
  ['SplitContainer.splitterElement', 'read-only', 'The `role="separator"` element.'],
  ['SplitContainer.value', 'read/write', '`position`, for `x-model`.'],
  ['GroupBox.legendElement', 'read-only', 'The `<legend>`.'],
];

const METHODS = [
  ['Stack.setGrow(child, grow), growOf(child)', '`void`, value', 'A child\'s `grow` programmatically (a value or a function).'],
  ['Grid.setCell(child, cell), cellOf(child)', '`void`, `GridCell`', 'A child\'s `row`, `column`, `rowSpan`, `columnSpan` programmatically.'],
  ['DockPanel.setDock(child, dock), dockOf(child)', '`void`, `Dock`', 'A child\'s `dock` programmatically.'],
  ['DockPanel.setAnchors(child, anchors)', '`void`', 'The `left` / `top` / `right` / `bottom` of a `float` child.'],
  ['SplitContainer.collapse(pane?), restore()', '`void`', 'Hides a pane (the first by default) / shows both again.'],
  ['GroupBox.focus()', '`boolean`', 'Focuses the first control inside, opening a collapsed box.'],
];

const EVENTS = [
  ['SplitContainer.onSplitterMoved(e)', 'The splitter moved (at the end of a drag), or a pane was hidden or restored. `e`: `{ position, collapsed, byUser, source }`.'],
  ['GroupBox.onToggled(e)', 'The content was shown or hidden. `e`: `{ collapsed, byUser, source }`.'],
];

const KEYS = [
  ['Tab', 'The splitter is one Tab stop between the panes; a scrolling `Panel` is a Tab stop of its own.'],
  ['Left / Right (side by side), Up / Down (one over the other)', 'Move the splitter by `step`; Left and Right follow what you see in a right-to-left page.'],
  ['Home / End', 'The first pane at its smallest / largest size.'],
  ['Enter', 'Hides the first pane, or restores the splitter where it was.'],
  ['Alt + key (`&Address`)', 'Focuses the first control in a `GroupBox` (Control + Option + key on Apple platforms).'],
  ['Arrows, Page Up / Down', 'Scroll a focused scrolling `Panel`, as the browser does.'],
];

const A11Y = [
  ['Splitter', '`role="separator"`, focusable, `aria-valuenow` (the first pane\'s share, 0–100), `aria-valuemin` / `aria-valuemax`, `aria-orientation`, `aria-controls` the first pane, named from `splitterLabel` or `uiLocale` (the ARIA window splitter pattern).'],
  ['Hidden pane', '`inert`: out of reach of Tab and screen readers; focus inside moves to the splitter.'],
  ['GroupBox', 'A native `<fieldset>`, named by its `<legend>`; disabled, it disables the native controls inside. A collapsible one has a button with `aria-expanded`.'],
  ['Panel', 'With `text`, a region landmark of that name. Scrolling, it is a Tab stop.'],
  ['Order', 'Stack, Grid and DockPanel place children with CSS only: Tab and screen readers keep the document order, so write the children in reading order.'],
];

const HOOKS = [
  ['.mx-stack', '`data-orientation`, `data-align`, `data-justify`, `data-wrap`, `data-reverse`, `data-inline`; a growing child gets `data-mx-grow`.'],
  ['.mx-grid', '`data-align`, `data-justify`, `data-inline`; tracks and child places are inline grid properties.'],
  ['.mx-panel', '`data-variant`, `data-scroll`.'],
  ['.mx-group-box', '`data-variant`, `data-collapsible`, `data-collapsed`, `data-disabled`; `.mx-group-box__legend`, `__title`, `__toggle`, `__chevron`.'],
  ['.mx-dock-panel', 'Each child gets `data-mx-dock`; its place and the `gap` (a margin on the side facing the rest) are inline.'],
  ['.mx-split-container', '`data-orientation`, `data-collapsed`, `data-resizable`, `data-dragging`; `.mx-split-container__pane` (`data-pane`), `__splitter`.'],
  ['--_gap, --_row-gap, --_column-gap', 'Written inline from `gap`, `rowGap`, `columnGap` (Stack, Grid, GroupBox).'],
];

const TOKENS = [
  ['layout.space.xxs … xxl', 'The spacing steps of `gap` and `padding`.'],
  ['layout.gap', 'The gap of Stack and Grid when none is given.'],
  ['layout.panel', 'Unit: a panel (`outline`: a frame, `card`: a raised surface).'],
  ['layout.group, layout.group-caption, layout.group-toggle, layout.group-chevron', 'Units: a group box (`plain`, `collapsed`), its caption, the button that folds it and its chevron.'],
  ['layout.group-box.gap, layout.group-box.legend-float', 'The gap inside a group box when none is given; where its caption sits.'],
  ['layout.splitter-handle, layout.splitter-line, layout.splitter-grip', 'Units: the splitter (`focus`), its line and its grip (`active`, `disabled`).'],
  ['layout.splitter.*', '`size` (the area that takes the pointer), `line-width`, `active-width`, `grip-length`, `grip-thickness`.'],
];

export default function LayoutPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Containers that place controls: `Stack` (a row or a column), `Grid` (rows and columns), `Panel` (a plain box that can scroll), `GroupBox` (a titled frame), `DockPanel` (children stuck to its edges) and `SplitContainer` (two panes and a splitter). All of them are controls: they disable and hide what is inside, and lay out children added at any time." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Stack, Grid, Panel, GroupBox, DockPanel, SplitContainer, type LayoutSpace } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="Children come as JSX or are added later with `controls.add`; either way the container picks them up. A child says where it goes in its own props (`grow`, `row`, `dock`…), whatever kind of component it is." />
        </p>
        <Example files={code('Programmatic.tsx')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="stack" title="Stack">
        <p>
          <Rich text="A row or a column with a gap. `align` places the children across the direction, `justify` along it; `wrap` starts a new line when they do not fit. A child with `grow` takes the free space." />
        </p>
        <Example files={code('StackOptions.tsx')} stack>
          <StackOptions />
        </Example>
      </Section>

      <Section anchor="spacing" title="Spacing">
        <p>
          <Rich text="`gap` and `padding` take a step of the spacing scale, a number of pixels or any CSS length." />
        </p>
        <ApiTable head={['Value', 'Meaning']} rows={SPACE} />
        <Example files={code('Spacing.tsx')} stack>
          <Spacing />
        </Example>
      </Section>

      <Section anchor="grid" title="Grid">
        <p>
          <Rich text="Rows and columns written like CSS. Children fill the cells in order, or say where they go: `row`, `column`, `rowSpan`, `columnSpan`, counted from 1." />
        </p>
        <ApiTable head={['Tracks', 'Meaning']} rows={TRACKS} />
        <Example title="A form" files={code('GridForm.tsx')} stack>
          <GridForm />
        </Example>
        <Example title="Fixed and flexible tracks" files={code('GridTracks.tsx')}>
          <GridTracks />
        </Example>
      </Section>

      <Section anchor="panel" title="Panel">
        <p>
          <Rich text="A plain box: padding, a frame if you want one, and its own scrolling. A scrolling panel is a Tab stop, so it can be scrolled with the keys; `text` names it." />
        </p>
        <Example files={code('Panels.tsx')}>
          <Panels />
        </Example>
      </Section>

      <Section anchor="groupbox" title="GroupBox">
        <p>
          <Rich text="A titled frame around related controls: a `<fieldset>`, so screen readers name the group by its title and disabling it disables what is inside. The title's `&` key focuses the first control; `collapsible` makes the title show and hide the content." />
        </p>
        <Example files={code('GroupBoxes.tsx')} stack>
          <GroupBoxes />
        </Example>
      </Section>

      <Section anchor="dock" title="DockPanel">
        <p>
          <Rich text="Children stick to the edges in the order they come — `top`, `bottom`, `start`, `end` (these two follow the reading direction) — and `fill` takes what is left. A `float` child sits over the rest at its own `left` / `top` / `right` / `bottom`. Laid out with CSS grid: nothing runs when the size changes." />
        </p>
        <Example title="An app shell" files={code('AppShell.tsx')} stack>
          <AppShell />
        </Example>
      </Section>

      <Section anchor="split" title="SplitContainer">
        <p>
          <Rich text="Two panes, `first` and `second`, with a splitter between them that the pointer drags and the keys move. `fixedPanel` keeps one pane's size when the container is resized; the minimum sizes hold; Enter hides the first pane and brings it back. Split containers nest." />
        </p>
        <Example title="Nested split containers" files={code('NestedSplit.tsx')} stack>
          <NestedSplit />
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
          <Rich text="The only text the containers write is the splitter's name, `uiLocale.strings.resize`, unless `splitterLabel` gives one." />
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
        <p>
          <Rich text="Every container also has the shared properties of `Control`: `enabled` / `disabled` (cascading to everything inside), `visible`, `tabStop`, `tabIndex`." />
        </p>
        <h3>
          <Rich text="Stack props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={STACK_PROPS} />
        <h3>
          <Rich text="Grid props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={GRID_PROPS} />
        <h3>
          <Rich text="Panel props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PANEL_PROPS} />
        <h3>
          <Rich text="GroupBox props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={GROUP_PROPS} />
        <h3>
          <Rich text="DockPanel props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={DOCK_PROPS} />
        <h3>
          <Rich text="SplitContainer props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={SPLIT_PROPS} />
        <h3>
          <Rich text="Props a child gives its container" />
        </h3>
        <ApiTable head={['Prop', 'Read by', 'Type', 'Description']} rows={CHILD_PROPS} />
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
        <p>
          <Rich text="`ChildSettings` — the part that reads a child's settings from its props and follows children added later — is exported for containers of your own." />
        </p>
      </Section>
    </>
  );
}
