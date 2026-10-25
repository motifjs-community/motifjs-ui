import { reactive, type Component } from '@motifx/core';
import { Button, enStrings, ProgressBar, Spinner, TextBox, trStrings, uiLocale, type ControlSize, type ProgressTone } from '@motifx-community/ui';
import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';

const TONES: ProgressTone[] = ['accent', 'neutral', 'success', 'caution', 'danger'];
const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

const BAR_PROPS = [
  ['value', '`Bind<number | null>`', '`null`', 'How far the work is. `null` (or no value) when that is not known: the bar runs to and fro.'],
  ['min / max', '`Bind<number>`', '`0` / `100`', 'The bounds of `value`.'],
  ['label', '`Bind<string>`', "`''`", 'A caption; it names the bar. The same property as `text`.'],
  ['labelPosition', "`Bind<'top' | 'side'>`", "`'top'`", '`top`: the label and the value above the bar; `side`: the label before it, the value after it.'],
  ['showValue', '`Bind<boolean>`', '`false`', 'Writes the percent (whole, rounded down) or `valueText`.'],
  ['valueText', '`(value, fraction) => string`', '—', 'The text for a value, shown and read out (`3 of 12 files`). A function, so it is stored as it is, not bound.'],
  ['locale', '`Bind<string>`', "the page's `lang`", 'The locale of the percent.'],
  ['tone', '`Bind<ProgressTone>`', "`'accent'`", '`accent`, `neutral`, `success`, `caution`, `danger`.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", 'The thickness: `sm`, `md`, `lg`.'],
  ['stretch', '`Bind<boolean>`', '`false`', 'Fills the width of what it sits in.'],
  ['visible, enabled, …', 'see Control', '', 'The shared properties of every control.'],
];

const SPINNER_PROPS = [
  ['label', '`Bind<string>`', "`''`", 'Text next to the ring. The same property as `text`.'],
  ['labelPosition', "`Bind<'side' | 'bottom'>`", "`'side'`", 'After the ring or under it.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`.'],
  ['tone', '`Bind<ProgressTone>`', "`'accent'`", 'The color of the turning part.'],
  ['delay', '`Bind<number>`', '`0`', 'Milliseconds before it shows, from when it is created or shown again; quick work then shows nothing.'],
  ['visible, …', 'see Control', '', 'Showing it again (`visible`) starts the delay again.'],
];

const MEMBERS = [
  ['ProgressBar: every prop', 'read/write, reactive', 'A value or a function, like the prop.'],
  ['ProgressBar: fraction', 'read-only, reactive', 'How much is done, from 0 to 1; `null` while it is not known.'],
  ['Spinner: every prop', 'read/write, reactive', 'A value or a function, like the prop.'],
  ['Spinner: waiting', 'read-only', 'Still inside its delay.'],
  ['Spinner.cover(target, props?)', '`() => void`', 'Covers a component or an element with a spinner; call the returned function to take it away. See Cover.'],
];

const A11Y = [
  ['ProgressBar', '`role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext` (the percent or `valueText`); none of them while the progress is not known.'],
  ['Spinner', '`role="progressbar"` without a value: an indicator of unknown progress, found and named like any widget. Not a `status` live region: those interrupt the reader each time one appears, and a page with many would be noisy.'],
  ['Name', 'The label (`aria-labelledby`), or `uiLocale.strings.loading` when there is none.'],
  ['Cover', 'The container gets `aria-busy="true"`; what is under the spinner is `inert`. Focus inside it moves to the spinner and comes back to where it was.'],
  ['Motion', 'With reduced motion the bar rests as a tinted track and the ring stands still.'],
];

const HOOKS = [
  ['.mx-progress', 'The bar. `data-state="determinate | indeterminate"`, `data-tone`, `data-size`, `data-label-position`, `data-stretch`.'],
  ['.mx-progress__head, .mx-progress__label, .mx-progress__value', 'The caption row.'],
  ['.mx-progress__track, .mx-progress__bar', 'The track and the filled part (`--_value`).'],
  ['.mx-spinner', 'The spinner. `data-size`, `data-tone`, `data-label-position`, `data-waiting`, `data-cover`.'],
  ['.mx-spinner__ring, .mx-spinner__label', 'The ring and the label.'],
  ['[data-mx-covered]', 'A container under `Spinner.cover`.'],
];

const TOKENS = [
  ['progress.thickness.*', 'The thickness per size.'],
  ['progress.width, progress.radius', 'The width when not stretched, the corners.'],
  ['progress.gap, progress.head-gap, progress.label-font-weight, progress.value-font-size', 'The caption.'],
  ['spinner.size.*, spinner.ring-width.*', 'The ring per size.'],
  ['spinner.gap', 'Between the ring and the label.'],
  ['spinner.cover-padding, spinner.cover-background', 'The layer over a covered container.'],
];

export default function ProgressPage() {
  const s = reactive({
    upload: 0,
    uploading: false,
    files: 3,
    busy: false,
    lang: 'en',
    result: '',
  });
  let added = 0;
  let host: Component<HTMLDivElement> | null = null;
  let panel: Component<HTMLDivElement> | null = null;

  const upload = () => {
    if (s.uploading) return;
    s.uploading = true;
    s.upload = 0;
    const timer = setInterval(() => {
      s.upload = Math.min(100, s.upload + 7);
      if (s.upload < 100) return;
      clearInterval(timer);
      s.uploading = false;
    }, 120);
  };

  const addFromCode = () => {
    const bar = new ProgressBar({ label: `Task ${++added}`, value: 25 * added, showValue: true, tone: 'success' });
    host?.controls.add(bar);
  };

  const work = (ms: number) => {
    s.busy = true;
    s.result = '';
    setTimeout(() => {
      s.busy = false;
      s.result = `Done after ${ms} ms.`;
    }, ms);
  };

  const load = () => {
    if (!panel) return;
    const done = Spinner.cover(panel, { label: 'Loading orders' });
    setTimeout(() => {
      done();
      s.result = 'Orders loaded.';
    }, 1500);
  };

  return (
    <>
      <p class="lead">
        ProgressBar shows how far some work is, or that it runs when that is not known. Spinner says "busy, wait": a
        turning ring, alone or over a panel while it loads, shown only after a delay so quick work does not flash it.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { ProgressBar, Spinner, type ProgressTone } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="Every prop takes a value or a function; a function of a reactive object keeps the bar in step with the work. Created with `new`, the same properties are set from code." />
        </p>
        <Example
          code={`
<ProgressBar label="Uploading" value={() => this.upload.percent} showValue />

const bar = new ProgressBar({ label: 'Import', showValue: true, tone: 'success' });
this.panel.controls.add(bar);
bar.value = 25;
`}
          stack
        >
          <ProgressBar label="Uploading" value={() => s.upload} showValue stretch />
          <div class="docs-flow">
            <Button text="Upload" tone="accent" enabled={() => !s.uploading} onclick={upload} />
            <Button text="Add a bar from code" variant="outline" onclick={addFromCode} />
          </div>
          <div class="docs-flow" ref={(c: Component<HTMLDivElement>) => (host = c)} />
        </Example>
      </Section>

      <Section anchor="indeterminate" title="Not known yet">
        <p>
          <Rich text="Without a value (`null`) the bar runs to and fro; give it a number once the work can tell how far it is." />
        </p>
        <Example
          code={`
<ProgressBar label="Preparing" value={null} />
<ProgressBar label="Copying" value={() => (this.copy.total ? this.copy.done : null)} max={() => this.copy.total} />
`}
          stack
        >
          <ProgressBar label="Preparing" value={null} />
        </Example>
      </Section>

      <Section anchor="tones" title="Tones">
        <Example
          code={`
<ProgressBar label="Disk" value={92} tone="danger" showValue />
`}
          stack
        >
          {TONES.map((tone) => (
            <ProgressBar key={tone} label={tone} value={20 + TONES.indexOf(tone) * 18} tone={tone} showValue />
          ))}
        </Example>
      </Section>

      <Section anchor="sizes" title="Sizes, caption beside, your own text">
        <p>
          <Rich text={'`size` sets the thickness. `labelPosition="side"` puts the label before the bar and the value after it. `valueText` writes the value its own way.'} />
        </p>
        <Example
          code={`
<ProgressBar label="Small" size="sm" value={30} />
<ProgressBar label="Files" labelPosition="side" max={12} value={() => this.done} showValue
  valueText={(v) => \`\${v} of 12\`} />
`}
          stack
        >
          {SIZES.map((size) => (
            <ProgressBar key={size} label={`Size ${size}`} size={size} value={60} />
          ))}
          <ProgressBar label="Files" labelPosition="side" max={12} value={() => s.files} showValue valueText={(v) => `${v} of 12`} stretch />
          <Button text="One more file" size="sm" variant="outline" onclick={() => (s.files = s.files >= 12 ? 0 : s.files + 1)} />
        </Example>
      </Section>

      <Section anchor="spinner" title="Spinner">
        <Example
          code={`
<Spinner />
<Spinner label="Loading orders" />
<Spinner label="Saving" labelPosition="bottom" size="lg" />
`}
        >
          {SIZES.map((size) => (
            <Spinner key={size} size={size} />
          ))}
          <Spinner label="Loading orders" />
          <Spinner label="Saving" labelPosition="bottom" size="lg" />
          {TONES.slice(1).map((tone) => (
            <Spinner key={tone} tone={tone} size="sm" label={tone} />
          ))}
        </Example>
      </Section>

      <Section anchor="delay" title="Delay">
        <p>
          <Rich text="A spinner with `delay` stays unseen for that long, from when it is created or shown again. Quick work shows nothing; slow work shows the spinner." />
        </p>
        <Example
          code={`
<Spinner label="Working" delay={400} visible={() => this.busy} />
`}
          stack
        >
          <div class="docs-flow">
            <Button text="Quick work (200 ms)" variant="outline" onclick={() => work(200)} />
            <Button text="Slow work (2 s)" variant="outline" onclick={() => work(2000)} />
            <Spinner label="Working" delay={400} visible={() => s.busy} />
          </div>
          <output class="pr-result">{() => s.result}</output>
        </Example>
      </Section>

      <Section anchor="cover" title="Cover a panel while it loads">
        <p>
          <Rich text="`Spinner.cover(target)` lays a spinner over a component or an element and returns the function that takes it away. What is under it cannot be pressed or focused; focus that was inside waits on the spinner and comes back afterwards." />
        </p>
        <Example
          code={`
const done = Spinner.cover(this.ordersPanel, { label: 'Loading orders', delay: 200 });
try {
  await this.orders.load();
} finally {
  done();
}
`}
          stack
        >
          <div class="docs-panel docs-flow" ref={(c: Component<HTMLDivElement>) => (panel = c)}>
            <TextBox label="Customer" value="Ada" />
            <Button text="Load orders" tone="accent" onclick={load} />
          </div>
        </Example>
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="A bar or a spinner without a label is named `uiLocale.strings.loading`. The percent is written in `locale`, by default the page's `lang`." />
        </p>
        <Example
          code={`
uiLocale.strings = trStrings;
<ProgressBar value={40} showValue locale="tr" />   // %40
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
          <ProgressBar value={40} showValue locale={() => s.lang} />
          <span>
            Unlabelled ones are named <output class="pr-loading">{() => uiLocale.strings.loading}</output>
          </span>
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>Component tokens</h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>ProgressBar props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={BAR_PROPS} />
        <h3>Spinner props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={SPINNER_PROPS} />
        <h3>Properties and methods</h3>
        <ApiTable head={['Member', 'Access / returns', 'Description']} rows={MEMBERS} />
      </Section>
    </>
  );
}
