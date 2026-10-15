import { Application } from '@motifx/core';
import '@motifx-community/ui/styles.css';
import '../shared/docs.css';
import { Button, Grid, GroupBox, Stack } from '@motifx-community/ui';
import { Chrome } from '../shared/chrome';
import { ApiTable, Code, Rich, Toc } from '../shared/doc';

const PROPS = [
  ['text', '`Bind<string>`', "`''`", 'The caption in the frame. `&` marks the access key: Alt + that key focuses the first control inside. An empty caption hides the legend.'],
  ['padding', '`Bind<Space>`', 'token `groupbox.padding` (16px)', 'Space inside the frame; the caption keeps its place whatever the padding.'],
  ['scrollable', '`Bind<boolean>`', '`false`', 'The group scrolls its content.'],
  ['…Panel / Control props', 'see Panel', '—', 'Children dock like in a Panel; `enabled = false` disables the whole group (native fieldset too).'],
];

const A11Y = [
  ['Group', 'A real `<fieldset>`: screen readers announce the caption when focus enters the group.'],
  ['Access key', '`text="&Address"` → `aria-keyshortcuts="Alt+A"`; Alt+A focuses the first control inside.'],
  ['Disabled', '`enabled = false` disables every field inside and the caption dims.'],
];

const TOKENS = [
  ['groupbox.border / radius', 'Frame stroke (the surface stroke) and the corner radius (`radius.lg`).'],
  ['groupbox.padding', 'Default space inside.'],
  ['groupbox.header.*', '`inset` (caption distance from the corner), `padding-inline`, `font-weight` (medium).'],
];

function Page() {
  let group: GroupBox | null = null;
  return (
    <div>
      <Chrome root="../" active="groupbox" />
      <main class="docs-main">
        <h1>GroupBox</h1>
        <p class="lead">
          A titled frame around related controls — a real <code>&lt;fieldset&gt;</code>{' '}
          with a <code>&lt;legend&gt;</code>. Inside it is a Panel: padding, scrolling and docking.
        </p>

        <Toc
          items={[
            ['import', 'Import'],
            ['usage', 'Usage'],
            ['a11y', 'Keyboard and accessibility'],
            ['api', 'API reference'],
            ['styling', 'Styling and tokens'],
          ]}
        />

        <h2 id="import">Import</h2>
        <Code code={`import { GroupBox } from '@motifx-community/ui';`} />

        <h2 id="usage">Usage</h2>
        <Code
          code={`
<GroupBox text="&Shipping address">
  <Grid columns="auto, *" gap="sm">…</Grid>
</GroupBox>

// code: controls.add puts them inside the frame
const options = new GroupBox({ text: 'Options', padding: 'lg' });
options.controls.add(new Button({ text: 'Reset' }));
options.enabled = false;
`}
        />
        <div class="demo demo--stack">
          <GroupBox text="Shipping &address" width="100%" ref={(g: GroupBox) => (group = g)}>
            <Grid columns="auto, *" gap="sm">
              <label for="gb-street">Street</label>
              <input id="gb-street" name="street" />
              <label for="gb-city">City</label>
              <input id="gb-city" name="city" />
            </Grid>
          </GroupBox>
          <Stack orientation="horizontal" gap="sm">
            <Button text="Toggle enabled" onclick={() => group && (group.enabled = !group.enabled)} />
            <Button text="Rename" onclick={() => group && (group.text = group.text.startsWith('Shipping') ? '&Billing address' : 'Shipping &address')} />
          </Stack>
        </div>

        <h2 id="a11y">Keyboard and accessibility</h2>
        <ApiTable head={['Topic', 'Behaviour']} rows={A11Y} />

        <h2 id="api">API reference</h2>
        <p>
          <Rich text="Every prop is also a settable, reactive property (`group.text = 'Billing'`)." />
        </p>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />

        <h2 id="styling">Styling and tokens</h2>
        <p>
          <Rich text="Hooks: `.mx-groupbox` (the fieldset), `.mx-groupbox__header` (the legend), `data-disabled`." />
        </p>
        <ApiTable head={['Token', 'What it is']} rows={TOKENS} />
      </main>
    </div>
  );
}

Application.CreateBuilder().build().run('#app', <Page />);
