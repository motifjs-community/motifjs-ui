import { Application } from '@motifx/core';
import '@motifx-community/ui/styles.css';
import '../shared/docs.css';
import { Button, Grid, Panel } from '@motifx-community/ui';
import { Chrome } from '../shared/chrome';
import { ApiTable, Code, Rich, Toc } from '../shared/doc';

const TRACKS = [
  ['auto, 1fr, 10rem, minmax(8rem, 1fr), …', 'Any CSS track, as is.'],
  ['120', 'A number: pixels.'],
  ['* , 2*', 'Shorthand for a share of the space left that may shrink below its content: `minmax(0, 1fr)`, `minmax(0, 2fr)`.'],
];

const PROPS = [
  ['columns', '`Bind<string | Length[]>`', 'one column', 'Column sizes: `\'auto, 1fr, 2fr, 120\'` or `[\'auto\', \'1fr\', 120]`.'],
  ['rows', '`Bind<string | Length[]>`', 'as needed, sized to content', 'Row sizes, same syntax.'],
  ['gap', '`Bind<Space>`', '—', 'Space between rows and columns: token step, pixels or CSS length.'],
  ['rowGap, columnGap', '`Bind<Space>`', '—', 'Override `gap` for one direction.'],
  ['padding', '`Bind<Space>`', '—', 'Space inside, like `Panel.padding`.'],
  ['…Control props', 'see Control', '—', '`enabled`, `visible`, `width`, `height`, `dock`…'],
];

const CHILD = [
  ['row, column', '`Bind<number>`', 'The cell: 1-based lines, as in CSS `grid-row` / `grid-column`.'],
  ['rowSpan, columnSpan', '`Bind<number>`', 'How many rows / columns it covers. Default 1.'],
  ['(none)', '—', 'Children without them fill the cells in order. A plain element uses CSS directly: `style={{ gridRow: \'2\', gridColumn: \'1 / span 2\' }}`.'],
];

function Page() {
  return (
    <div>
      <Chrome root="../" active="grid" />
      <main class="docs-main">
        <h1>Grid</h1>
        <p class="lead">
          Rows and columns with defined sizes, like <code>auto, 1fr, 2fr, 120</code>, and children that say which cell
          they take. Plain CSS grid underneath.
        </p>

        <Toc
          items={[
            ['import', 'Import'],
            ['usage', 'Usage'],
            ['tracks', 'Row and column definitions'],
            ['api', 'API reference'],
          ]}
        />

        <h2 id="import">Import</h2>
        <Code code={`import { Grid } from '@motifx-community/ui';`} />

        <h2 id="usage">Usage</h2>
        <Code
          code={`
<Grid columns="200, 1fr" rows="auto, 1fr, auto" gap="sm" height={260}>
  <Panel row={1} column={1} columnSpan={2}>Header</Panel>
  <Panel row={2} column={1} scrollable>Navigation</Panel>
  <Panel row={2} column={2}>Content</Panel>
  <Panel row={3} column={1} columnSpan={2}>Footer</Panel>
</Grid>

// code
const g = new Grid({ columns: [120, '1fr'], gap: 8 });
g.controls.add(new Button({ text: 'Cell', row: 1, column: 2 }));
g.columns = 'auto, 1fr, auto';
`}
        />
        <div class="demo">
          <Grid class="docs-stage" columns="10rem, 1fr" rows="auto, 1fr, auto" gap="sm" padding="sm">
            <Panel class="docs-box" row={1} column={1} columnSpan={2}>
              Header (row 1, both columns)
            </Panel>
            <Panel class="docs-box" row={2} column={1}>
              Navigation
            </Panel>
            <Panel class="docs-box" row={2} column={2}>
              Content (1fr)
            </Panel>
            <Panel class="docs-box" row={3} column={1} columnSpan={2}>
              <Button size="sm" text="Footer button" />
            </Panel>
          </Grid>
        </div>

        <h2 id="tracks">Row and column sizes</h2>
        <ApiTable head={['Definition', 'Meaning']} rows={TRACKS} />

        <h2 id="api">API reference</h2>
        <p>
          <Rich text="Every prop is also a settable, reactive property (`grid.columns = '1*, 2*'`)." />
        </p>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>On the children</h3>
        <ApiTable head={['Prop', 'Type', 'Description']} rows={CHILD} />
        <p>
          <Rich text="Styling hook: `.mx-grid`; templates, gaps and padding are inline." />
        </p>
      </main>
    </div>
  );
}

Application.CreateBuilder().build().run('#app', <Page />);
