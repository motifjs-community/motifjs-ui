import { Application, reactive } from '@motifx/core';
import '@motifx-community/ui/styles.css';
import '../shared/docs.css';
import { Button, type ButtonTone, type ButtonVariant } from '@motifx-community/ui';
import { Chrome } from '../shared/chrome';
import { ApiTable, Code, Rich, Toc } from '../shared/doc';

const TONES: ButtonTone[] = ['neutral', 'accent', 'danger'];
const VARIANTS: ButtonVariant[] = ['solid', 'outline', 'ghost'];

const PROPS = [
  ['variant', "`Bind<'solid' | 'outline' | 'ghost'>`", "`'solid'`", 'Visual style; see the table below.'],
  ['tone', "`Bind<'neutral' | 'accent' | 'danger'>`", "`'neutral'`", 'Color role: neutral (standard), accent (the theme accent), danger (critical red).'],
  ['size', "`Bind<'sm' | 'md' | 'lg'>`", "`'md'`", 'Height step: 24 / 32 / 40px in comfortable density, smaller in compact.'],
  ['text', '`Bind<string>`', "`''`", 'The caption; use it or JSX children. Settable from code (`button.text = …`). `&` marks the access key: `&Save` → Alt+S clicks it; `&&` is a literal `&`.'],
  ['enabled', '`Bind<boolean>`', '`true`', '`false` adds the native `disabled` and `data-disabled`: no focus, no clicks. A disabled container disables it too.'],
  ['disabled', '`Bind<boolean>`', '`false`', 'The HTML-style inverse of `enabled`, for habit. Ignored when `enabled` is given.'],
  ['visible', '`Bind<boolean>`', '`true`', '`false` hides the button (core `hide()`).'],
  ['tabIndex', '`Bind<number>`', '`0`', 'Its place in the Tab order of its container.'],
  ['tabStop', '`Bind<boolean>`', '`true`', '`false` skips it on Tab; it can still be clicked or focused by code.'],
  ['type', "`'button' | 'submit' | 'reset'`", "`'button'`", 'The native type. Defaults to `button`, so a button inside a `<form>` never submits by accident.'],
  ['onclick, …', 'DOM events', '—', 'Any DOM event, as on a plain `<button>`: `onclick={() => save()}`.'],
  ['class, style, aria-*, data-*, id, role, tabindex', 'attributes', '—', 'Fall through to the `<button>` element.'],
];

const PROPERTIES = [
  ['text, enabled, visible, tabStop', 'get / set', 'The props above as properties, reactive to read. Setting one replaces a getter given as prop. `enabled` reads `false` while a container it sits in is disabled.'],
  ['canFocus', 'get', 'Enabled, on the page and focusable now.'],
  ['focused / focusWithin', 'get', 'Whether it has focus. DOM queries, not reactive.'],
  ['focus()', 'method → `boolean`', 'Focuses it; `false` when it cannot take focus.'],
];

const LOOKS = [
  ['solid + neutral', 'The standard button: control fill, a visible bottom edge and an inner highlight; pressed down by the press offset on click. The default.'],
  ['solid + accent', 'The accent button: the theme accent fill, text on accent, the same pressable shape. Use for the one primary action.'],
  ['solid + danger', 'The accent shape in the danger color, for destructive actions.'],
  ['outline', 'Transparent with a strong stroke; text in the tone color.'],
  ['ghost', 'No fill until hover/press. For toolbars and low-emphasis actions.'],
];

const STYLING = [
  ['.mx-button', 'The button; state in `data-variant`, `data-tone`, `data-size`, `data-disabled`.'],
  ['button.radius', 'The control corner radius (`radius.md`).'],
  ['button.height.* / padding.*', 'From the density tokens (`control.height.*`, `control.padding.*`).'],
  ['button.edge-width / press-offset', 'The bottom edge and the press offset of a solid button, from the density tokens (`control.edge.width`, `control.press.offset`).'],
  ['button.font-size.* / font-weight', 'Caption (12px) for `sm`, body (14px) otherwise; medium weight.'],
  ['button.gap', 'Space between an icon and the label.'],
];

const KEYS = [
  ['Tab', 'Moves focus to the button; the focus ring shows for keyboard use.'],
  ['Enter / Space', 'Activates it (native `<button>` behaviour).'],
  ['Alt + access key', 'With `text="&Save"`: Alt+S focuses and clicks it. The underline shows while Alt is held.'],
];

function Page() {
  const s = reactive({ busy: false, clicks: 0 });

  return (
    <div>
      <Chrome root="../" active="button" />
      <main class="docs-main">
        <h1>Button</h1>
        <p class="lead">
          A native <code>&lt;button&gt;</code> drawn from the design system's tokens. <code>variant</code>, <code>tone</code> and{' '}
          <code>size</code> are reactive props written to <code>data-*</code> attributes; the CSS binds to those, and
          every value comes from a token.
        </p>

        <Toc
          items={[
            ['import', 'Import'],
            ['usage', 'Usage'],
            ['looks', 'Variants and tones'],
            ['sizes', 'Sizes and density'],
            ['state', 'Reactive props'],
            ['keyboard', 'Keyboard and accessibility'],
            ['api', 'API reference'],
            ['styling', 'Styling and tokens'],
          ]}
        />

        <h2 id="import">Import</h2>
        <Code
          code={`
import '@motifx-community/ui/styles.css';
import { Button } from '@motifx-community/ui';
`}
        />

        <h2 id="usage">Usage</h2>
        <p>
          In JSX like any element, or created in code like any MotifJS component — it is a component object that can be
          added anywhere with <code>controls.add</code> and changed later through its properties. The shared properties
          (<code>text</code>, <code>enabled</code>, <code>visible</code>, <code>tabStop</code>) come from{' '}
          <a href="../control/index.html">Control</a>.
        </p>
        <Code
          code={`
<Button tone="accent" onclick={() => this.model.save()}>Save</Button>
<Button onclick={() => this.close()}>Cancel</Button>

// created in code, changed from code
const retry = new Button({ text: 'Retry', tone: 'accent' });
retry.motif.on('click', () => this.model.reload());
this.toolbar.controls.add(retry);
retry.text = 'Retry (2)';
retry.enabled = false;
`}
        />
        <div class="demo">
          <Button tone="accent" onclick={() => s.clicks++}>
            Save
          </Button>
          <Button onclick={() => s.clicks++}>Cancel</Button>
          <span>
            Clicks: <output>{() => s.clicks}</output>
          </span>
        </div>

        <h2 id="looks">Variants and tones</h2>
        <ApiTable head={['Combination', 'Look']} rows={LOOKS} />
        <div class="demo demo--grid">
          <span class="demo__label"></span>
          {VARIANTS.map((v) => (
            <span key={v} class="demo__label">
              {v}
            </span>
          ))}
          {TONES.map((tone) => (
            <div key={tone} style={{ display: 'contents' }}>
              <span class="demo__label">{tone}</span>
              {VARIANTS.map((variant) => (
                <span key={variant}>
                  <Button tone={tone} variant={variant}>
                    Button
                  </Button>
                </span>
              ))}
            </div>
          ))}
        </div>

        <h2 id="sizes">Sizes and density</h2>
        <p>
          Heights come from the density tokens — switch <em>Compact</em> in the header and all three shrink.
        </p>
        <div class="demo">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>

        <h2 id="state">Reactive props</h2>
        <p>
          Every prop takes a value or a getter. With a getter it follows state: only the attribute changes, nothing is
          rebuilt. A plain value is a snapshot. The <code>Control</code> props (<code>text</code>, <code>enabled</code>,
          …) can also be set from code later.
        </p>
        <Code
          code={`
<Button tone="accent" enabled={() => !this.state.busy}>Submit</Button>
<Button variant={() => (this.state.selected ? 'solid' : 'ghost')}>Filter</Button>
`}
        />
        <div class="demo">
          <Button tone="accent" enabled={() => !s.busy}>
            Submit
          </Button>
          <Button onclick={() => (s.busy = !s.busy)}>Toggle enabled</Button>
        </div>

        <h2 id="keyboard">Keyboard and accessibility</h2>
        <ApiTable head={['Key', 'Behaviour']} rows={KEYS} />
        <ul class="docs-list">
          <li>
            <Rich text="It is a real `<button>`: role, name (its text) and disabled state reach assistive tech natively." />
          </li>
          <li>
            <Rich text="An icon-only button needs `aria-label`; it falls through to the element." />
          </li>
          <li>
            <Rich text="Every text/background pair it uses passes WCAG AA (AAA in high contrast), checked at build time." />
          </li>
        </ul>

        <h2 id="api">API reference</h2>
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>Properties and methods</h3>
        <ApiTable head={['Member', 'Kind', 'Description']} rows={PROPERTIES} />

        <h2 id="styling">Styling and tokens</h2>
        <ApiTable head={['Hook / token', 'What it is']} rows={STYLING} />
      </main>
    </div>
  );
}

Application.CreateBuilder().build().run('#app', <Page />);
