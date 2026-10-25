import { Code, Section } from '../../shared/doc';
import componentJson from '../../../../src/generated/token-docs.json';
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

/** One component token, as scripts/build-tokens.mjs writes it for the docs. */
interface ComponentToken {
  name: string;
  cssVar: string;
  type: string;
  ref: string | null;
  value: string | number;
}

const componentDocs = componentJson as ComponentToken[];
const light = lightJson as Record<string, DesignToken>;
const dark = darkJson as Record<string, DesignToken>;
const highContrast = highContrastJson as Record<string, DesignToken>;
const compact = compactJson as Record<string, DesignToken>;

const rows = (layer: string) => Object.entries(light).filter(([, t]) => t.layer === layer);
const semantic = rows('semantic');
const density = rows('density');
const identity = rows('identity');
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

export default function TokensPage() {
  return (
    <>
      <p class="lead">
        Five layers. The first four — primitives, the design language's own scales, semantic tokens per theme,
        density — come from <code>@motifx-community/design-system</code> and are listed here for reference. The fifth, the component
        tokens, is this kit's own: a fine-tuning knob per component, each referencing a design-system token, written
        in <code>@layer mx.components</code>. Components bring their own; none has been written yet.
      </p>

      <Section anchor="component" title="Component ({componentDocs.length})">
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
      </Section>

      <Section anchor="semantic" title="Semantic ({semantic.length} per theme)">
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
      </Section>

      <Section anchor="density" title="Density ({density.length})">
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
      </Section>

      <Section anchor="identity" title="Identity ({identity.length})">
        <p>
          What a design language brings of its own: corner radii, shadows, type and motion. The names are the same in
          every language; <code>data-identity</code> picks whose values apply. Tactile, shown here, is the default.
        </p>
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
            {identity.map(([name, t]) => (
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
      </Section>

      <Section anchor="primitive" title="Primitive ({primitive.length})">
        <p>The shared palette and scales, the same in every design language. Themes and components never hardcode these values; they reference them.</p>
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
      </Section>

      <Section anchor="ts" title="Using token names in TS">
        <Code
          code={`
import { cssVar } from '@motifx-community/ui/tokens';

cssVar('color.accent.solid');  // 'var(--mx-color-accent-solid)' — a design-system token
// component tokens join as components bring them; names are typo-checked,
// and apps that need only the design system import cssVar from there
`}
        />
      </Section>
    </>
  );
}
