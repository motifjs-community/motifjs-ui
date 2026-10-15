import { Application, reactive } from '@motifx/core';
import '@motifx-community/ui/styles.css';
import '../shared/docs.css';
import { Button, Stack, type StackAlign, type StackJustify, type StackOrientation } from '@motifx-community/ui';
import { Chrome } from '../shared/chrome';
import { ApiTable, Code, Rich, Toc } from '../shared/doc';

const PROPS = [
  ['orientation', '`Bind<StackOrientation>`', "`'vertical'`", '`vertical`: top to bottom. `horizontal`: along the reading direction (right to left in RTL).'],
  ['gap', '`Bind<Space>`', "`'none'`", 'Space between children: a token step (`xxs` … `xxl`), pixels or any CSS length.'],
  ['padding', '`Bind<Space>`', '—', 'Space inside, like `Panel.padding` (shorthand allowed: `\'0 md\'`).'],
  ['align', '`Bind<StackAlign>`', '`stretch` vertical, `center` horizontal', 'Cross-axis alignment: `start`, `center`, `end`, `stretch`, `baseline`.'],
  ['justify', '`Bind<StackJustify>`', "`'start'`", 'How the children share the main axis: `start`, `center`, `end`, `space-between`, `space-around`, `space-evenly`.'],
  ['wrap', '`Bind<boolean>`', '`false`', 'Children that do not fit go to a new line (column).'],
  ['…Control props', 'see Control', '—', '`enabled`, `visible`, `width`, `height`, `dock`, `row`/`column`…'],
];

function Page() {
  const s = reactive({
    orientation: 'horizontal' as StackOrientation,
    gap: 'sm',
    align: undefined as StackAlign | undefined,
    justify: 'start' as StackJustify,
  });

  return (
    <div>
      <Chrome root="../" active="stack" />
      <main class="docs-main">
        <h1>Stack</h1>
        <p class="lead">
          One line of children, vertical or horizontal, with a gap between them. It is
          CSS flexbox: nothing runs on resize, and horizontal stacks follow the reading direction.
        </p>

        <Toc
          items={[
            ['import', 'Import'],
            ['usage', 'Usage'],
            ['try', 'Try it'],
            ['api', 'API reference'],
          ]}
        />

        <h2 id="import">Import</h2>
        <Code code={`import { Stack } from '@motifx-community/ui';`} />

        <h2 id="usage">Usage</h2>
        <Code
          code={`
// a command bar
<Stack orientation="horizontal" gap="sm" justify="end">
  <Button text="Cancel" />
  <Button text="OK" tone="accent" />
</Stack>

// code
const list = new Stack({ gap: 8 });
list.controls.add(new Button({ text: 'One' }), new Button({ text: 'Two' }));
list.orientation = 'horizontal';
`}
        />

        <h2 id="try">Try it</h2>
        <div class="demo demo--stack">
          <div class="docs-flow">
            <Button size="sm" text="vertical" onclick={() => (s.orientation = 'vertical')} />
            <Button size="sm" text="horizontal" onclick={() => (s.orientation = 'horizontal')} />
            <Button size="sm" text="gap xs" onclick={() => (s.gap = 'xs')} />
            <Button size="sm" text="gap lg" onclick={() => (s.gap = 'lg')} />
            <Button size="sm" text="gap 2px" onclick={() => (s.gap = '2px')} />
            <Button size="sm" text="justify end" onclick={() => (s.justify = 'end')} />
            <Button size="sm" text="space-between" onclick={() => (s.justify = 'space-between')} />
            <Button size="sm" text="align start" onclick={() => (s.align = 'start')} />
          </div>
          <Stack
            class="docs-box stack-demo"
            width="100%"
            orientation={() => s.orientation}
            gap={() => s.gap}
            justify={() => s.justify}
            align={() => s.align}
          >
            <Button text="First" />
            <Button text="Second, longer" />
            <Button text="Third" tone="accent" />
          </Stack>
        </div>

        <h2 id="api">API reference</h2>
        <p>
          <Rich text="Every prop is also a settable, reactive property (`stack.gap = 'lg'`)." />
        </p>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <p>
          <Rich text="Styling hooks: `.mx-stack` with `data-orientation`, `data-align`, `data-justify`, `data-wrap`; gap and padding are inline." />
        </p>
      </main>
    </div>
  );
}

Application.CreateBuilder().build().run('#app', <Page />);
