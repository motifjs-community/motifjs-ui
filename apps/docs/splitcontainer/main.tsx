import { Application, reactive } from '@motifx/core';
import '@motifx-community/ui/styles.css';
import '../shared/docs.css';
import { Button, SplitContainer, Stack } from '@motifx-community/ui';
import { Chrome } from '../shared/chrome';
import { ApiTable, Code, Rich, Toc } from '../shared/doc';

const PROPS = [
  ['orientation', '`Bind<SplitOrientation>`', "`'horizontal'`", 'As in Stack: `horizontal` puts the panels side by side, `vertical` one above the other.'],
  ['position', '`Bind<Length>`', "`'50%'`", 'Size of the first panel: pixels or a CSS length/percentage. After the user moves the splitter it holds pixels, or a percentage when no panel is fixed.'],
  ['fixedPanel', "`Bind<'first' | 'second' | 'none'>`", "`'none'`", 'The panel that keeps its size when the container is resized; `none` keeps the proportion.'],
  ['firstMinSize, secondMinSize', '`Bind<Length>`', '`25`', 'Smallest sizes, kept while dragging and by the layout.'],
  ['splitterSize', '`Bind<Length>`', 'token `split.splitter.size` (4px)', 'Thickness of the splitter’s hit area; the drawn line stays 1px.'],
  ['resizable', '`Bind<boolean>`', '`true`', '`false`: the user cannot move the splitter, and it leaves the Tab order.'],
  ['step', '`Bind<number>`', '`10`', 'Pixels per arrow key press.'],
  ['collapsed', "`Bind<'first' | 'second' | 'none'>`", "`'none'`", 'Hides a panel; the other one takes the whole area.'],
  ['first, second', 'JSX, component or factory', '—', 'Content of each panel. Without them, the first and second JSX children.'],
  ['onSplitterMoved', '`(e) => void`', '—', 'After the user moved the splitter (pointer or keyboard); `e.position` in pixels.'],
];

const PROPERTIES = [
  ['first, second', '`SplitPanel`', 'The two sides, each a Panel (padding, scrolling, docking): `split.second.controls.add(…)`.'],
  ['every prop above', 'read/write, reactive', '`split.collapsed = \'second\'`, `split.position = 300`.'],
  ['activeControl, restoreFocus()', 'focus container', 'Remembers which control inside was active and can return focus there.'],
];

const KEYS = [
  ['Tab', 'The splitter is a Tab stop between the panels (unless `resizable` is false).'],
  ['← → (horizontal) / ↑ ↓ (vertical)', 'Move the splitter by `step`; in RTL, ← grows the first panel, which is on the right.'],
  ['Home / End', 'The first panel to its smallest / largest size.'],
  ['Screen readers', '`role="separator"` with `aria-orientation` (of the line), `aria-valuenow` (first panel in percent), `aria-controls` (the first panel) and a localized name (`UiStrings.splitter`).'],
];

const TOKENS = [
  ['split.splitter.size', 'Hit area of the splitter.'],
  ['split.splitter.line / hover / active', 'The 1px divider line: at rest, under the pointer, while dragged (accent).'],
];

function Page() {
  const s = reactive({ moved: 0 });
  let outer: SplitContainer | null = null;
  return (
    <div>
      <Chrome root="../" active="splitcontainer" />
      <main class="docs-main">
        <h1>SplitContainer</h1>
        <p class="lead">
          Two panels and a splitter the user can move: drag it, or Tab to it and use the arrow keys. CSS grid lays it
          out, so resizing the window runs no script.
        </p>

        <Toc
          items={[
            ['import', 'Import'],
            ['usage', 'Usage'],
            ['sizing', 'Sizing'],
            ['keyboard', 'Keyboard and accessibility'],
            ['api', 'API reference'],
            ['styling', 'Styling and tokens'],
          ]}
        />

        <h2 id="import">Import</h2>
        <Code code={`import { SplitContainer } from '@motifx-community/ui';`} />

        <h2 id="usage">Usage</h2>
        <Code
          code={`
<SplitContainer position={240} fixedPanel="first" height="100%">
  <FolderTree />
  <SplitContainer orientation="vertical" position="70%">
    <Editor />
    <Output />
  </SplitContainer>
</SplitContainer>

// code
const split = new SplitContainer({ orientation: 'vertical' });
split.first.controls.add(editor);
split.second.controls.add(output);
split.collapsed = 'second';
`}
        />
        <div class="demo demo--stack">
          <SplitContainer
            class="docs-stage docs-stage--tall split-demo"
            position={200}
            fixedPanel="first"
            firstMinSize={120}
            onSplitterMoved={() => s.moved++}
            ref={(c: SplitContainer) => (outer = c)}
          >
            <div class="docs-box" data-dock="fill">
              First panel (fixed, min 120px)
            </div>
            <SplitContainer orientation="vertical" position="60%" dock="fill">
              <div class="docs-box" data-dock="fill">
                Second · top (60%)
              </div>
              <div class="docs-box" data-dock="fill">
                Second · bottom
              </div>
            </SplitContainer>
          </SplitContainer>
          <Stack orientation="horizontal" gap="sm">
            <Button text="Collapse first" onclick={() => outer && (outer.collapsed = outer.collapsed === 'first' ? 'none' : 'first')} />
            <Button text="Lock splitter" onclick={() => outer && (outer.resizable = !outer.resizable)} />
            <span>
              Moved <output class="moved">{() => s.moved}</output> times
            </span>
          </Stack>
        </div>

        <h2 id="sizing">Sizing</h2>
        <ul class="docs-list">
          <li>
            <Rich text="`position` is the size of the first panel: `240` (pixels), `'30%'`, any CSS length." />
          </li>
          <li>
            <Rich text="`fixedPanel='first'` keeps the first panel's pixels when the container resizes; `second` keeps the second's; `none` keeps the proportion (a dragged splitter is stored as a percentage)." />
          </li>
          <li>
            <Rich text="Like a docking Panel, it needs a height: `height`, `dock='fill'` in a sized parent, or a window." />
          </li>
        </ul>

        <h2 id="keyboard">Keyboard and accessibility</h2>
        <ApiTable head={['Key / topic', 'Behaviour']} rows={KEYS} />

        <h2 id="api">API reference</h2>
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>Properties</h3>
        <ApiTable head={['Member', 'Type / kind', 'Description']} rows={PROPERTIES} />

        <h2 id="styling">Styling and tokens</h2>
        <p>
          <Rich text="Hooks: `.mx-split` (`data-orientation`, `data-dragging`), `.mx-split__panel` (`data-part='first|second'`), `.mx-split__splitter` (`data-fixed`)." />
        </p>
        <ApiTable head={['Token', 'What it is']} rows={TOKENS} />
      </main>
    </div>
  );
}

Application.CreateBuilder().build().run('#app', <Page />);
