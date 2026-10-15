import { Application } from '@motifx/core';
import '@motifx-community/ui/styles.css';
import '../shared/docs.css';
import { Chrome } from '../shared/chrome';
import { Code } from '../shared/doc';
import componentDocs from '../../../src/generated/token-docs.json';
import lightJson from '@motifx-community/design-system/json/light.json';
import darkJson from '@motifx-community/design-system/json/dark.json';
import highContrastJson from '@motifx-community/design-system/json/high-contrast.json';
import compactJson from '@motifx-community/design-system/json/density-compact.json';

/** One row of the design system's flat JSON (name → this). */
interface DesignToken {
  cssVar: string;
  type: string;
  layer: string;
  value: string | number;
  ref: string | null;
}

const light = lightJson as Record<string, DesignToken>;
const dark = darkJson as Record<string, DesignToken>;
const highContrast = highContrastJson as Record<string, DesignToken>;
const compact = compactJson as Record<string, DesignToken>;

const rows = (layer: string) => Object.entries(light).filter(([, t]) => t.layer === layer);
const semantic = rows('semantic');
const density = rows('density');
const primitive = rows('primitive');

const Swatch = (props: { value: string }) => (
  <span class="swatch" style={{ background: props.value }} aria-hidden="true"></span>
);

function Value(props: { type: string; value: string | number }) {
  return (
    <span class="value-cell">
      {props.type === 'color' && <Swatch value={String(props.value)} />}
      <code>{String(props.value)}</code>
    </span>
  );
}

function Page() {
  return (
    <div>
      <Chrome root="../" active="tokens" />
      <main class="docs-main">
        <h1>Tokens</h1>
        <p class="lead">
          Four layers. The first three — primitives, semantic tokens per theme, density — come from{' '}
          <code>@motifx-community/design-system</code> and are listed here for reference. The fourth, the component
          tokens, is this kit's own: a fine-tuning knob per component, each referencing a design-system token, written
          in <code>@layer mx.components</code>.
        </p>

        <h2>Component ({componentDocs.length})</h2>
        <p>
          Source: <code>tokens/component/*.tokens.json</code>. Override one after <code>styles.css</code> to restyle
          every instance of that component; override the design-system token it references to restyle everything.
        </p>
        <table class="token-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>CSS variable</th>
              <th>References</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {componentDocs.map((t) => (
              <tr key={t.name}>
                <td>
                  <code>{t.name}</code>
                </td>
                <td>
                  <code>{t.cssVar}</code>
                </td>
                <td>{t.ref ? <code>{`{${t.ref}}`}</code> : <span>—</span>}</td>
                <td>
                  <Value type={t.type} value={t.value} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Semantic ({semantic.length} per theme)</h2>
        <p>
          The theme's language, the only layer a theme redefines — switch the theme above and watch the swatches.
          Every text/background pair is checked in the design system's build: WCAG AA in light and dark, AAA in high
          contrast.
        </p>
        <table class="token-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>CSS variable</th>
              <th>Light</th>
              <th>Dark</th>
              <th>High contrast</th>
            </tr>
          </thead>
          <tbody>
            {semantic.map(([name, t]) => (
              <tr key={name}>
                <td>
                  <code>{name}</code>
                </td>
                <td>
                  <code>{t.cssVar}</code>
                </td>
                <td>
                  <Value type={t.type} value={t.value} />
                </td>
                <td>
                  <Value type={t.type} value={dark[name].value} />
                </td>
                <td>
                  <Value type={t.type} value={highContrast[name].value} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Density ({density.length})</h2>
        <p>
          Control heights, paddings, gaps, the pressable edge and the bar height; <code>data-density="compact"</code>{' '}
          swaps them all.
        </p>
        <table class="token-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>CSS variable</th>
              <th>Comfortable</th>
              <th>Compact</th>
            </tr>
          </thead>
          <tbody>
            {density.map(([name, t]) => (
              <tr key={name}>
                <td>
                  <code>{name}</code>
                </td>
                <td>
                  <code>{t.cssVar}</code>
                </td>
                <td>
                  <code>{String(t.value)}</code>
                </td>
                <td>
                  <code>{String(compact[name].value)}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Primitive ({primitive.length})</h2>
        <p>The raw palette and scales. Themes and components never hardcode these values; they reference them.</p>
        <table class="token-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Type</th>
              <th>CSS variable</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {primitive.map(([name, t]) => (
              <tr key={name}>
                <td>
                  <code>{name}</code>
                </td>
                <td>{t.type}</td>
                <td>
                  <code>{t.cssVar}</code>
                </td>
                <td>
                  <Value type={t.type} value={t.value} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Using token names in TS</h2>
        <Code
          code={`
import { cssVar } from '@motifx-community/ui/tokens';

cssVar('button.radius');       // 'var(--mx-button-radius)'  — a component token
cssVar('color.accent.solid');  // 'var(--mx-color-accent-solid)' — a design-system token
// both names are typo-checked; apps that need only the design system import cssVar from there
`}
        />
      </main>
    </div>
  );
}

Application.CreateBuilder().build().useDevelopment(true).run('#app', <Page />);
