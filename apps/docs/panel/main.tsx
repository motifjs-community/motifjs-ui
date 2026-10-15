import { Application } from '@motifx/core';
import '@motifx-community/ui/styles.css';
import '../shared/docs.css';
import { Button, Panel, type Dock } from '@motifx-community/ui';
import { Chrome } from '../shared/chrome';
import { ApiTable, Code, Rich, Toc } from '../shared/doc';

const DOCKS: Dock[] = ['top', 'bottom', 'start', 'end', 'fill', 'float', 'none'];

const PROPS = [
  ['padding', '`Bind<Space>`', '—', 'Space inside: a token step (`none`, `xxs` 4px, `xs` 8, `sm` 12, `md` 16, `lg` 24, `xl` 32, `xxl` 48), pixels (`12`), any CSS length, or a shorthand of those (`\'sm lg\'`).'],
  ['scrollable', '`Bind<boolean>`', '`false`', 'The panel scrolls its own content when it does not fit. A scrolling panel is a Tab stop so keyboard users can scroll it; `tabStop={false}` opts out.'],
  ['text, enabled, visible, tabStop, tabIndex, …', 'see Control', '—', 'Every `Control` prop. `enabled = false` disables everything inside.'],
];

const CHILD = [
  ['dock', "`'none' | 'top' | 'bottom' | 'start' | 'end' | 'fill' | 'float'`", 'Where the child goes (see "Docking"). Every control has it; a plain element uses `data-dock="top"`.'],
  ['left, top, right, bottom', '`Bind<Length>`', 'Offsets of a `float` child. The edges you give are the ones it stays anchored to: `right` + `bottom` keeps it in the bottom corner, `left` + `right` stretches it.'],
  ['width, height', '`Bind<Length>`', 'The child\'s size: across a docked edge (a `start` child\'s width, a `top` child\'s height), or a floating child\'s size.'],
];

const DOCK_RULES = [
  ['top / bottom', 'Takes the full width of what is left, at that edge; its height is its content or `height`.'],
  ['start / end', 'Takes the full height of what is left, at that edge (`start` is the left in LTR, the right in RTL); its width is its content or `width`.'],
  ['fill', 'Takes all that is left.'],
  ['order', 'Children dock in document order, the order you read in JSX: the first `top` child is at the very top, a `start` child after it starts below it.'],
  ['none', 'In a panel where something docks, children without `dock` share the area that is left; otherwise they flow as usual.'],
  ['float', 'Positioned freely inside the panel with the CSS offsets `left` / `top` / `right` / `bottom`, above the docked ones.'],
  ['size', 'A docking panel needs a height of its own: `height`, being docked `fill` in a sized parent, a SplitContainer panel or a window.'],
  ['cost', 'CSS grid does the layout. Script runs only when a child is added, removed or changes its `dock`, never on resize.'],
];

const STYLING = [
  ['.mx-panel', 'The panel; `data-scrollable` when it scrolls, `data-mx-docking` while children dock.'],
  ['[data-dock]', 'On a docked or floating child: `top`, `bottom`, `start`, `end`, `fill`, `float`.'],
];

function Page() {
  let movable: Button | null = null;

  return (
    <div>
      <Chrome root="../" active="panel" />
      <main class="docs-main">
        <h1>Panel</h1>
        <p class="lead">
          A plain container: it holds controls, docks them to its edges or lets one fill
          the rest, scrolls its own content, and takes padding as a token step or any CSS length.
        </p>

        <Toc
          items={[
            ['import', 'Import'],
            ['usage', 'Usage'],
            ['docking', 'Docking'],
            ['scroll', 'Padding and scrolling'],
            ['api', 'API reference'],
            ['styling', 'Styling'],
          ]}
        />

        <h2 id="import">Import</h2>
        <Code code={`import { Panel } from '@motifx-community/ui';`} />

        <h2 id="usage">Usage</h2>
        <Code
          code={`
// JSX
<Panel height="100%">
  <Toolbar dock="top" />
  <StatusBar dock="bottom" />
  <FolderTree dock="start" width={240} />
  <FileList dock="fill" />
</Panel>

// code
const panel = new Panel({ padding: 'md', scrollable: true });
panel.controls.add(new Button({ text: 'Top', dock: 'top' }));
panel.dock = 'fill';
`}
        />

        <h2 id="docking">Docking</h2>
        <p>Pick where the highlighted button docks; the others stay where they are.</p>
        <div class="demo demo--stack">
          <div class="docs-flow">
            {DOCKS.map((d) => (
              <Button key={d} size="sm" variant="outline" text={d} onclick={() => movable && (movable.dock = d)} />
            ))}
          </div>
          <Panel class="docs-stage">
            <div class="docs-box" data-dock="top">
              top
            </div>
            <div class="docs-box" data-dock="bottom">
              bottom
            </div>
            <div class="docs-box" data-dock="start" style={{ inlineSize: '7rem' }}>
              left
            </div>
            <Button
              tone="accent"
              text="Movable"
              dock="end"
              right={12}
              bottom={12}
              ref={(b: Button) => (movable = b)}
            />
            <div class="docs-box" data-dock="fill">
              fill
            </div>
          </Panel>
        </div>
        <ApiTable head={['Dock', 'Behaviour']} rows={DOCK_RULES} />

        <h2 id="scroll">Padding and scrolling</h2>
        <Code code={`<Panel padding="sm lg" scrollable height={160}>…</Panel>`} />
        <div class="demo">
          <Panel class="docs-box" padding="sm lg" scrollable height={120} width="100%">
            {Array.from({ length: 12 }, (_, i) => (
              <p key={i}>Line {i + 1} of a panel that scrolls its own content.</p>
            ))}
          </Panel>
        </div>

        <h2 id="api">API reference</h2>
        <h3>Props and properties</h3>
        <p>
          <Rich text="Every prop is also a settable, reactive property (`panel.padding = 'lg'`)." />
        </p>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>On the children</h3>
        <ApiTable head={['Prop', 'Type', 'Description']} rows={CHILD} />

        <h2 id="styling">Styling</h2>
        <ApiTable head={['Hook', 'What it is']} rows={STYLING} />
      </main>
    </div>
  );
}

Application.CreateBuilder().build().run('#app', <Page />);
