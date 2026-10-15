import { Application, reactive } from '@motifx/core';
import '@motifx-community/ui/styles.css';
import '../shared/docs.css';
import { Button, Grid, Label, Stack, type LabelTextStyle, type LabelTone } from '@motifx-community/ui';
import { Chrome } from '../shared/chrome';
import { ApiTable, Code, Rich, Toc } from '../shared/doc';

const PROPS = [
  ['text', '`Bind<string>`', "`''`", 'The text. `&` marks the access key (`&Name` → Alt+N), `&&` is a literal `&`. Comes before any JSX children.'],
  ['target', '`Bind<Control | HTMLElement | string>`', '—', 'What the label names, like HTML `for` but also taking a control or an element: a control, an element or an element id. See Access keys and targets.'],
  ['accessKeys', '`Bind<boolean>`', '`true`', '`&` in `text` marks the access key. `false` shows `&` as written — use it for data that may contain `&` (“Smith & Co”).'],
  ['textStyle', '`Bind<LabelTextStyle>`', 'inherited', 'A step of the type ramp: `caption`, `body`, `bodyStrong`, `bodyLarge`, `subtitle`, `title`, `titleLarge`, `display`. Unset, the font of where it sits.'],
  ['tone', '`Bind<LabelTone>`', 'inherited', '`primary`, `secondary`, `accent`, `danger`, `success`, `caution`. All pass WCAG AA on the theme backgrounds. Unset, the color of where it sits.'],
  ['textAlign', '`Bind<LabelTextAlign>`', '—', '`start`, `center`, `end`, `justify`, in reading direction.'],
  ['verticalAlign', '`Bind<LabelVerticalAlign>`', '—', '`top`, `center`, `bottom` inside a taller label (a `height`, a grid cell, a dock).'],
  ['ellipsis', '`Bind<boolean>`', '`false`', 'One line, cut with “…”; on hover the full text shows as a tooltip.'],
  ['maxLines', '`Bind<number>`', '—', 'At most this many lines, the last one cut with “…”. Wins over `ellipsis`.'],
  ['…Control props', 'see Control', '—', '`enabled` (dims the text and stops the access key), `visible`, `width`, `height`, `dock`, `row` / `column`…'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', '`label.text = \'Orders (3)\'`, `label.target = nameBox`.'],
  ['isTruncated', '`boolean`, read-only', 'Whether the text is cut off now. A measurement, not reactive.'],
  ['onAccessKey()', 'method', 'What its access key does: focus the target, or the field it wraps. A label that names nothing does nothing.'],
];

const A11Y = [
  ['Name', 'With a `target`, the label is the target’s accessible name: `<label for>` for labelable elements (inputs, buttons, selects, …), `aria-labelledby` for others (a listbox, a grid). The name comes off again when the target changes or the label is disposed.'],
  ['Click', 'A click on the label focuses the target (a checkbox toggles, as in HTML).'],
  ['Access key', '`&Name` → `aria-keyshortcuts="Alt+N"` on the label (Control+Option+N on Apple platforms); the key moves focus to the target and never clicks it. Without a target: the field inside the label. A label that names nothing gets no focus behaviour: it would send focus to a control screen readers do not connect to it.'],
  ['Container targets', 'A target that cannot take focus itself (a Panel, a GroupBox) passes it to its first control.'],
  ['Focus', 'A label never takes focus and is never a Tab stop.'],
  ['Disabled', '`enabled = false` dims the text; its access key is not consumed.'],
  ['Cut text', 'Screen readers read the whole text; only the drawing is cut. The tooltip is set on hover, an app-set `title` is left alone.'],
];

const STYLES: { style: LabelTextStyle; sample: string }[] = [
  { style: 'caption', sample: 'Caption — 12/16, regular' },
  { style: 'body', sample: 'Body — 14/20, regular' },
  { style: 'bodyStrong', sample: 'Body strong — 14/20, semibold' },
  { style: 'bodyLarge', sample: 'Body large — 18/24, regular' },
  { style: 'subtitle', sample: 'Subtitle — 20/28, semibold' },
  { style: 'title', sample: 'Title — 28/36, semibold' },
  { style: 'titleLarge', sample: 'Title large — 40/52' },
  { style: 'display', sample: 'Display — 68/92' },
];

const TONES: LabelTone[] = ['primary', 'secondary', 'accent', 'danger', 'success', 'caution'];

const LONG = 'Shipment 4711 left the Istanbul warehouse this morning and is expected at the customer on Friday before noon.';

function Page() {
  const s = reactive({ count: 0, formEnabled: false });
  let status: Label | null = null;
  return (
    <div>
      <Chrome root="../" active="label" />
      <main class="docs-main">
        <h1>Label</h1>
        <p class="lead">
          Text that names a control, drawn with the design system's type ramp. It is a real{' '}
          <code>&lt;label&gt;</code>: it names its target for screen readers, a click focuses the target, and an{' '}
          <code>&amp;</code> access key moves focus there.
        </p>

        <Toc
          items={[
            ['import', 'Import'],
            ['usage', 'Usage'],
            ['targets', 'Access keys and targets'],
            ['styles', 'Text styles and tones'],
            ['trimming', 'Cutting long text'],
            ['a11y', 'Keyboard and accessibility'],
            ['api', 'API reference'],
            ['styling', 'Styling'],
          ]}
        />

        <h2 id="import">Import</h2>
        <Code code={`import { Label } from '@motifx-community/ui';`} />

        <h2 id="usage">Usage</h2>
        <Code
          code={`
<Label text="&Name" target="name" />
<input id="name" />

<Label text={() => \`\${state.count} orders\`} textStyle="subtitle" />
<Label text="Saved" textStyle="caption" tone="success" />

// code
const status = new Label({ text: 'Ready', tone: 'secondary' });
statusBar.controls.add(status);
status.text = 'Saving…';
`}
        />
        <div class="demo demo--stack">
          <Label text="Orders" textStyle="subtitle" />
          <Label text={() => `${s.count} orders waiting`} tone="secondary" />
          <Stack orientation="horizontal" gap="sm">
            <Button text="Add an order" onclick={() => s.count++} />
            <Button
              text="Status from code"
              onclick={() => {
                if (!status) return;
                status.text = status.text === 'Ready' ? 'Saving…' : 'Ready';
                status.tone = status.text === 'Ready' ? 'success' : 'caution';
              }}
            />
            <Label class="status-label" text="Ready" tone="success" ref={(l: Label) => (status = l)} />
          </Stack>
        </div>

        <h2 id="targets">Access keys and targets</h2>
        <p>
          <Rich text="Hold Alt (Control + Option on a Mac) to see the access keys, then press one. `target` names the control the label belongs to; without one, the label names the field inside it, as HTML does." />
        </p>
        <Code
          code={`
<Label text="&Name" target="name" />          // by id
<Label text="&Payment:" target={pay} />        // a control or element
<select ref={…} />
<Label text="&City "><input /></Label>         // wraps its field
<Label text="&Fruits" target={() => fruits} /> // a getter: a ref set later is fine
`}
        />
        <div class="demo demo--stack">
          <Grid class="label-form" columns="auto, *" gap="sm" width="100%">
            <Label text="&Name" target="lbl-name" />
            <input id="lbl-name" name="name" />
            <Label text="&Payment:" target="lbl-pay" />
            <select id="lbl-pay" name="payment">
              <option>Card</option>
              <option>Transfer</option>
            </select>
            <Label text="Ci&ty " columnSpan={2} class="wrapping">
              <input name="city" />
            </Label>
            <Label text="&Fruits" target="lbl-fruits" verticalAlign="top" />
            <div id="lbl-fruits" class="docs-box fruit-list" role="listbox" tabindex="0">
              <div role="option" aria-selected="true">
                Apple
              </div>
              <div role="option" aria-selected="false">
                Pear
              </div>
            </div>
          </Grid>
        </div>

        <h2 id="styles">Text styles and tones</h2>
        <p>
          <Rich text="Unset, a label takes the font and color of where it sits. `textStyle` picks a step of the type ramp; `tone` a theme color." />
        </p>
        <div class="demo demo--stack type-ramp">
          {STYLES.map((t) => (
            <Label key={t.style} textStyle={t.style} text={t.sample} ellipsis width="100%" />
          ))}
        </div>
        <div class="demo">
          <Stack orientation="horizontal" gap="lg" wrap>
            {TONES.map((tone) => (
              <Label key={tone} tone={tone} textStyle="bodyStrong" text={tone} />
            ))}
          </Stack>
        </div>
        <p>
          <Rich text="A disabled label dims, and so does every label inside a disabled control:" />
        </p>
        <div class="demo">
          <Stack class="disabled-row" orientation="horizontal" gap="sm" enabled={() => s.formEnabled}>
            <Label text="&Discount" target="lbl-discount" />
            <input id="lbl-discount" name="discount" />
          </Stack>
          <Button text={() => (s.formEnabled ? 'Disable' : 'Enable')} onclick={() => (s.formEnabled = !s.formEnabled)} />
        </div>

        <h2 id="trimming">Cutting long text</h2>
        <p>
          <Rich text="Drag the corner of the box. `ellipsis` keeps one line, `maxLines` that many; the full text shows as a tooltip on hover, and screen readers always read all of it." />
        </p>
        <div class="demo demo--stack">
          <div class="docs-box trim-box">
            <Label class="trim-one" text={LONG} ellipsis width="100%" />
            <Label class="trim-two" text={LONG} maxLines={2} width="100%" tone="secondary" />
          </div>
        </div>

        <h2 id="a11y">Keyboard and accessibility</h2>
        <ApiTable head={['Topic', 'Behaviour']} rows={A11Y} />

        <h2 id="api">API reference</h2>
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>Properties and methods</h3>
        <ApiTable head={['Member', 'Type / kind', 'Description']} rows={PROPERTIES} />

        <h2 id="styling">Styling</h2>
        <p>
          <Rich text="`.mx-label` with `data-text-style`, `data-tone`, `data-text-align`, `data-vertical-align`, `data-ellipsis`, `data-max-lines` (count in `--_mx-lines`), `data-disabled`. Fonts and colors come from the type ramp and color tokens; Label has no tokens of its own." />
        </p>
      </main>
    </div>
  );
}

Application.CreateBuilder().build().run('#app', <Page />);
