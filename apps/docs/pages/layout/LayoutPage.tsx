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
  ["'xxs' … 'xxl'", 'A step from the spacing scale: `xxs`, `xs`, `sm`, `md`, `lg`, `xl` or `xxl`, from the `layout.space.*` tokens (the design system `space.1` … `space.12`). Density and themes apply to them.'],
  ['12', 'A number is in pixels.'],
  ["'1.5rem'", 'Any CSS length.'],
  ["'xs md'", 'Padding accepts one to four values, as in CSS (block-start, inline-end, block-end, inline-start), and can mix steps and lengths. The values follow the reading direction.'],
];

const TRACKS = [
  ["'auto 1fr 2fr 120'", 'CSS grid tracks. A bare number is in pixels.'],
  ["'* 2*'", '`*` means `1fr`, and `2*` means `2fr`.'],
  ["'minmax(8rem, 1fr) auto'", 'Any CSS track, including functions.'],
  ["['auto', 120, '*']", 'The same tracks as a list.'],
  ['3', 'A number creates that many equal columns or rows.'],
];

const STACK_PROPS = [
  ['orientation', "`Bind<'horizontal' | 'vertical'>`", "`'vertical'`", '`horizontal` follows the reading direction.'],
  ['gap', '`Bind<LayoutSpace>`', '`layout.gap`', 'The space between children.'],
  ['padding', '`Bind<LayoutSpace>`', '—', 'The space inside the edges.'],
  ['align', '`Bind<LayoutAlign>`', "`'stretch'`", 'Alignment across the direction: `start`, `center`, `end`, `stretch` or `baseline`.'],
  ['justify', '`Bind<StackJustify>`', "`'start'`", 'Alignment along the direction: `start`, `center`, `end`, `space-between`, `space-around` or `space-evenly`.'],
  ['wrap', '`Bind<boolean>`', '`false`', 'Moves children that do not fit to a new line.'],
  ['reverse', '`Bind<boolean>`', '`false`', 'Lays out children from the opposite end. The Tab order stays in document order.'],
  ['inline', '`Bind<boolean>`', '`false`', 'Flows within a line of text, as wide as its children.'],
];

const GRID_PROPS = [
  ['columns, rows', '`Bind<GridTracks>`', 'One column', 'See Tracks.'],
  ['gap', '`Bind<LayoutSpace>`', '`layout.gap`', 'The gap between rows and columns.'],
  ['rowGap, columnGap', '`Bind<LayoutSpace>`', '`gap`', 'The gap in one direction only.'],
  ['padding', '`Bind<LayoutSpace>`', '—', 'The space inside the edges.'],
  ['autoRows, autoColumns', '`Bind<number | string>`', "`'auto'`", 'The size of implicit tracks. A number is in pixels.'],
  ['flow', '`Bind<GridFlow>`', "`'row'`", 'How children without a position fill the grid: `row`, `column`, `row dense` or `column dense`.'],
  ['align', '`Bind<LayoutAlign>`', "`'stretch'`", 'The vertical alignment of children in their cells.'],
  ['justify', '`Bind<GridJustify>`', "`'stretch'`", 'The horizontal alignment of children in their cells.'],
  ['inline', '`Bind<boolean>`', '`false`', 'Flows within a line of text.'],
];

const PANEL_PROPS = [
  ['scrollable', "`Bind<boolean | 'vertical' | 'horizontal' | 'both'>`", '`false`', 'Scrolls its content. It then becomes a Tab stop, so the keyboard can scroll it.'],
  ['padding', '`Bind<LayoutSpace>`', '—', 'The space inside the edges.'],
  ['variant', '`Bind<PanelVariant>`', "`'plain'`", '`plain`, `outline` (a border) or `card` (a card surface).'],
  ['text', '`Bind<string>`', "`''`", 'Names the panel, which makes it a region landmark with that name.'],
];

const GROUP_PROPS = [
  ['title', '`Bind<string>`', "`''`", 'The legend. `&Address` makes Alt+A move focus to the first control inside. This is the same property as `text`.'],
  ['collapsible', '`Bind<boolean>`', '`false`', 'Makes the title a button that shows and hides the content.'],
  ['collapsed', '`Bind<boolean>`', '`false`', 'Hides the content (with `collapsible`).'],
  ['padding', '`Bind<LayoutSpace>`', '`layout.group-box.padding`', 'The space inside the frame.'],
  ['gap', '`Bind<LayoutSpace>`', '`layout.group-box.gap`', 'The space between children, which stack in a column.'],
  ['variant', '`Bind<GroupBoxVariant>`', "`'outline'`", '`outline` (a frame with the title on its edge) or `plain` (the title above the content).'],
];

const DOCK_PROPS = [
  ['gap', '`Bind<LayoutSpace>`', '—', 'The space between a docked child and the remaining area.'],
  ['padding', '`Bind<LayoutSpace>`', '—', 'The space inside the edges.'],
];

const SPLIT_PROPS = [
  ['orientation', "`Bind<'horizontal' | 'vertical'>`", "`'horizontal'`", '`horizontal` places the panes side by side, as in Stack, and `vertical` stacks them.'],
  ['position', '`Bind<SplitPosition>`', "`'50%'`", 'The size of the pane that keeps its size (the first pane with `fixedPanel="none"`), in pixels, as a share, or as a CSS length. `x-model` binds it.'],
  ['fixedPanel', "`Bind<'none' | 'first' | 'second'>`", "`'none'`", 'The pane that keeps its size when the container is resized. With `none`, both grow and the position is kept as a share.'],
  ['firstMinSize, secondMinSize', '`Bind<number>`', '`0`', 'The minimum size of each pane, in pixels.'],
  ['collapsed', "`Bind<'none' | 'first' | 'second'>`", "`'none'`", 'The collapsed pane. The other pane takes all the space.'],
  ['resizable', '`Bind<boolean>`', '`true`', 'Lets the pointer and keyboard move the splitter.'],
  ['collapsible', '`Bind<boolean>`', '`true`', 'Enter and a double-click collapse and restore the first pane.'],
  ['step', '`Bind<number>`', '`10`', 'The distance an arrow key moves the splitter, in pixels.'],
  ['splitterLabel', '`Bind<string>`', '`uiLocale.strings.resize`', 'The accessible name of the splitter.'],
];

const CHILD_PROPS = [
  ['grow', 'Stack', '`Bind<boolean | number>`', 'Takes the free space along the direction. Numbers share it proportionally.'],
  ['row, column', 'Grid', '`Bind<number | string>`', 'The starting line, counted from 1. A string is passed to CSS as is (`-1`).'],
  ['rowSpan, columnSpan', 'Grid', '`Bind<number>`', 'The number of tracks it spans.'],
  ['dock', 'DockPanel', '`Bind<Dock>`', '`top`, `bottom`, `start`, `end`, `fill` (the default) or `float`.'],
  ['left, top, right, bottom', 'DockPanel', '`Bind<number | string>`', 'The anchors of a `float` child. A number is in pixels, and `left` plus `right` stretches it.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['SplitContainer.first, second', 'read-only', 'The two panes, as `Panel` objects: `split.first.controls.add(…)`, `split.second.scrollable = true`.'],
  ['SplitContainer.splitterElement', 'read-only', 'The `role="separator"` element.'],
  ['SplitContainer.value', 'read/write', 'Maps to `position` for `x-model`.'],
  ['GroupBox.legendElement', 'read-only', 'The `<legend>` element.'],
];

const METHODS = [
  ['Stack.setGrow(child, grow), growOf(child)', '`void`, value', 'Sets a child\'s `grow` programmatically, with a value or a function.'],
  ['Grid.setCell(child, cell), cellOf(child)', '`void`, `GridCell`', 'Sets a child\'s `row`, `column`, `rowSpan` and `columnSpan` programmatically.'],
  ['DockPanel.setDock(child, dock), dockOf(child)', '`void`, `Dock`', 'Sets a child\'s `dock` programmatically.'],
  ['DockPanel.setAnchors(child, anchors)', '`void`', 'Sets the `left`, `top`, `right` and `bottom` of a `float` child.'],
  ['SplitContainer.collapse(pane?), restore()', '`void`', 'Collapses a pane (the first by default), or shows both panes again.'],
  ['GroupBox.focus()', '`boolean`', 'Sets focus on the first control inside, expanding a collapsed box if needed.'],
];

const EVENTS = [
  ['SplitContainer.onSplitterMoved(e)', 'Occurs when the splitter moves (at the end of a drag), or when a pane is collapsed or restored. `e`: `{ position, collapsed, byUser, source }`.'],
  ['GroupBox.onToggled(e)', 'Occurs when the content is shown or hidden. `e`: `{ collapsed, byUser, source }`.'],
];

const KEYS = [
  ['Tab', 'The splitter is one Tab stop between the panes, and a scrolling `Panel` is its own Tab stop.'],
  ['Left / Right (side by side), Up / Down (one over the other)', 'Moves the splitter by `step`. Left and Right follow the visual direction on right-to-left pages.'],
  ['Home / End', 'Sets the first pane to its smallest or largest size.'],
  ['Enter', 'Collapses the first pane, or restores the splitter to its previous position.'],
  ['Alt + key (`&Address`)', 'Moves focus to the first control in a `GroupBox` (Control + Option + key on Apple platforms).'],
  ['Arrows, Page Up / Down', 'Scrolls a focused scrolling `Panel`, using the browser\'s default behavior.'],
];

const A11Y = [
  ['Splitter', '`role="separator"`, focusable, with `aria-valuenow` (the share of the first pane, 0 to 100), `aria-valuemin`, `aria-valuemax`, `aria-orientation` and `aria-controls` for the first pane. It is named by `splitterLabel` or `uiLocale`, following the ARIA window splitter pattern.'],
  ['Hidden pane', '`inert`, so it is out of reach of Tab and screen readers. Focus inside moves to the splitter.'],
  ['GroupBox', 'A native `<fieldset>` named by its `<legend>`. When disabled, it disables the native controls inside. A collapsible group box has a button with `aria-expanded`.'],
  ['Panel', 'With `text`, a region landmark with that name. When scrolling, it is a Tab stop.'],
  ['Order', 'Stack, Grid and DockPanel position children with CSS only. Tab and screen readers follow document order, so write children in reading order.'],
];

const HOOKS = [
  ['.mx-stack', '`data-orientation`, `data-align`, `data-justify`, `data-wrap`, `data-reverse`, `data-inline`. A growing child gets `data-mx-grow`.'],
  ['.mx-grid', '`data-align`, `data-justify`, `data-inline`. Tracks and child positions are inline grid properties.'],
  ['.mx-panel', '`data-variant`, `data-scroll`.'],
  ['.mx-group-box', '`data-variant`, `data-collapsible`, `data-collapsed`, `data-disabled`; `.mx-group-box__legend`, `__title`, `__toggle`, `__chevron`.'],
  ['.mx-dock-panel', 'Each child gets `data-mx-dock`. Its position and the `gap`, a margin on the side facing the remaining area, are set inline.'],
  ['.mx-split-container', '`data-orientation`, `data-collapsed`, `data-resizable`, `data-dragging`; `.mx-split-container__pane` (`data-pane`), `__splitter`.'],
  ['--_gap, --_row-gap, --_column-gap', 'Set inline from `gap`, `rowGap` and `columnGap` (Stack, Grid, GroupBox).'],
];

const TOKENS = [
  ['layout.space.xxs … xxl', 'The spacing steps of `gap` and `padding`.'],
  ['layout.gap', 'The default gap of Stack and Grid.'],
  ['layout.panel', 'Unit: a panel (`outline` for a frame, `card` for a raised surface).'],
  ['layout.group, layout.group-caption, layout.group-toggle, layout.group-chevron', 'Units: a group box (`plain`, `collapsed`), its label, the collapse button and its chevron.'],
  ['layout.group-box.gap, layout.group-box.legend-float', 'The default gap inside a group box, and the position of its label.'],
  ['layout.splitter-handle, layout.splitter-line, layout.splitter-grip', 'Units: the splitter (`focus`), its line and its grip (`active`, `disabled`).'],
  ['layout.splitter.*', '`size` (the pointer target area), `line-width`, `active-width`, `grip-length`, `grip-thickness`.'],
];

export default function LayoutPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Container controls for arranging other controls: `Stack` (a row or column), `Grid` (rows and columns), `Panel` (a plain box that can scroll), `GroupBox` (a titled frame), `DockPanel` (children docked to its edges) and `SplitContainer` (two panes with a splitter). All of them are controls, so they can disable and hide their content, and they lay out children added at any time." />
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
          <Rich text="Children can be declared in JSX or added later with `controls.add`, and the container handles both. A child sets its own layout options through its props (`grow`, `row`, `dock`…), whatever type of component it is." />
        </p>
        <Example files={code('Programmatic.tsx')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="stack" title="Stack">
        <p>
          <Rich text="A row or column with a gap. `align` positions children across the direction, and `justify` positions them along it. `wrap` starts a new line when they do not fit, and a child with `grow` takes the free space." />
        </p>
        <Example files={code('StackOptions.tsx')} stack>
          <StackOptions />
        </Example>
      </Section>

      <Section anchor="spacing" title="Spacing">
        <p>
          <Rich text="`gap` and `padding` accept a step from the spacing scale, a number of pixels, or any CSS length." />
        </p>
        <ApiTable head={['Value', 'Meaning']} rows={SPACE} />
        <Example files={code('Spacing.tsx')} stack>
          <Spacing />
        </Example>
      </Section>

      <Section anchor="grid" title="Grid">
        <p>
          <Rich text="Rows and columns defined in a CSS-like syntax. Children fill the cells in order, or set their position with `row`, `column`, `rowSpan` and `columnSpan`, counted from 1." />
        </p>
        <ApiTable head={['Tracks', 'Meaning']} rows={TRACKS} />
        <Example title="Form layout" files={code('GridForm.tsx')} stack>
          <GridForm />
        </Example>
        <Example title="Fixed and flexible tracks" files={code('GridTracks.tsx')}>
          <GridTracks />
        </Example>
      </Section>

      <Section anchor="panel" title="Panel">
        <p>
          <Rich text="A plain box with padding, an optional frame and its own scrolling. A scrolling panel is a Tab stop, so it can be scrolled with the keyboard, and `text` provides its name." />
        </p>
        <Example files={code('Panels.tsx')}>
          <Panels />
        </Example>
      </Section>

      <Section anchor="groupbox" title="GroupBox">
        <p>
          <Rich text={'A titled frame around related controls. It is a `<fieldset>`, so screen readers announce the group by its title and disabling it disables its content. The `&` key in the title moves focus to the first control, and `collapsible` lets the title show and hide the content.'} />
        </p>
        <Example files={code('GroupBoxes.tsx')} stack>
          <GroupBoxes />
        </Example>
      </Section>

      <Section anchor="dock" title="DockPanel">
        <p>
          <Rich text="Children dock to the edges in the order they appear: `top`, `bottom`, `start` and `end` (the last two follow the reading direction), and `fill` takes the remaining space. A `float` child sits over the others at its own `left`, `top`, `right` and `bottom`. The layout uses CSS grid, so no code runs when the size changes." />
        </p>
        <Example title="Application shell" files={code('AppShell.tsx')} stack>
          <AppShell />
        </Example>
      </Section>

      <Section anchor="split" title="SplitContainer">
        <p>
          <Rich text="Two panes, `first` and `second`, separated by a splitter that can be dragged or moved with the keyboard. `fixedPanel` preserves the size of one pane when the container is resized, and the minimum sizes are enforced. Enter collapses the first pane and restores it. Split containers can be nested." />
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
          <Rich text="The only string these containers display is the splitter name, `uiLocale.strings.resize`, unless `splitterLabel` is set." />
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
          <Rich text="Every container also has the properties shared by `Control`: `enabled` and `disabled` (which apply to everything inside), `visible`, `tabStop` and `tabIndex`." />
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
          <Rich text="Props a child sets for its container" />
        </h3>
        <ApiTable head={['Prop', 'Used by', 'Type', 'Description']} rows={CHILD_PROPS} />
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
          <Rich text="`ChildSettings`, which reads a child's settings from its props and tracks children added later, is exported for use in your own containers." />
        </p>
      </Section>
    </>
  );
}
