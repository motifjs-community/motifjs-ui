import { Code, Rich, Section } from '../../shared/doc';
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
const designLanguage = rows('design-language');
const primitive = rows('primitive');

const Swatch = (props: { value: string }) => (
  <span class="swatch" style={{ background: props.value }} aria-hidden="true"></span>
);

function Value(props: { type: string; value: string | number }) {
  return (
    <span class="value-cell" onConfig={(sender)=>{
        if (props.type === 'color'){
          sender.controls.add(<Swatch value={String(props.value)} />)
        } 
        sender.controls.add(<code>{String(props.value)}</code>);
    }}>
      {/* {props.type === 'color' && <Swatch value={String(props.value)} />}
      <code>{String(props.value)}</code> */}
    </span>
  );
}

export default function TokensPage() {
  return (
    <>
      <p class="lead">
        <Rich text="The token system has five layers. The first four (primitives, design language scales, semantic tokens per theme, and density) come from `@motifx-community/design-system` and are listed here for reference. The fifth layer, component tokens, belongs to this kit: each component has its own tokens, written in `@layer mx.components`, and each one references a design system token. Every design language provides its own value for each component token." />
      </p>

      <Section anchor="component" title="Component ({componentDocs.length})">
        <p>
          <Rich text="Source: `tokens/schema/*.json` for names and types, and `tokens/languages/<language>/*.json` for values (Tactile values are listed here). Override a component token after `styles.css` to restyle every instance of that component, or override the design system token it references to restyle everything that uses it." />
        </p>
        <div class="table-scroll" tabindex="0">
          <table class="token-table">
            <thead>
              <tr>
                <th>
                  <Rich text="Token" />
                </th>
                <th>
                  <Rich text="CSS variable" />
                </th>
                <th>
                  <Rich text="References" />
                </th>
                <th>
                  <Rich text="Value" />
                </th>
              </tr>
            </thead>
            <tbody>
              {componentDocs.map((t,i) => (
                <tr key={i}>
                  <td>
                    <code>{t.name}</code>
                  </td>
                  <td>
                    <code>{t.cssVar}</code>
                  </td>
                  <td><code>{t.ref}</code></td>
                  <td>
                    <Value type={t.type} value={t.value} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section anchor="semantic" title="Semantic ({semantic.length} per theme)">
        <p>
          <Rich text="Semantic tokens are the only layer a theme redefines. Switch the theme at the top of the page to see the swatches change. The design system build verifies every text and background pair against WCAG AA in light and dark themes, and against AAA in high contrast." />
        </p>
        <div class="table-scroll" tabindex="0">
          <table class="token-table">
            <thead>
              <tr>
                <th>
                  <Rich text="Token" />
                </th>
                <th>
                  <Rich text="CSS variable" />
                </th>
                <th>
                  <Rich text="Light" />
                </th>
                <th>
                  <Rich text="Dark" />
                </th>
                <th>
                  <Rich text="High contrast" />
                </th>
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
        </div>
      </Section>

      <Section anchor="density" title="Density ({density.length})">
        <p>
          <Rich text={'Control heights, padding, gaps, the pressable edge and the bar height. Setting `data-density="compact"` swaps all of them.'} />
        </p>
        <div class="table-scroll" tabindex="0">
          <table class="token-table">
            <thead>
              <tr>
                <th>
                  <Rich text="Token" />
                </th>
                <th>
                  <Rich text="CSS variable" />
                </th>
                <th>
                  <Rich text="Comfortable" />
                </th>
                <th>
                  <Rich text="Compact" />
                </th>
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
        </div>
      </Section>

      <Section anchor="design-language" title="Design language ({designLanguage.length})">
        <p>
          <Rich text="These are the values a design language defines for itself: corner radii, shadows, typography and motion. The names are the same in every language, and `data-design-language` selects which values apply. The values shown here are from Tactile, the default." />
        </p>
        <div class="table-scroll" tabindex="0">
          <table class="token-table">
            <thead>
              <tr>
                <th>
                  <Rich text="Token" />
                </th>
                <th>
                  <Rich text="Type" />
                </th>
                <th>
                  <Rich text="CSS variable" />
                </th>
                <th>
                  <Rich text="Value" />
                </th>
              </tr>
            </thead>
            <tbody>
              {designLanguage.map(([name, t]) => (
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
        </div>
      </Section>

      <Section anchor="primitive" title="Primitive ({primitive.length})">
        <p>
          <Rich text="The shared palette and scales, identical in every design language. Themes and components reference these values and never hardcode them." />
        </p>
        <div class="table-scroll" tabindex="0">
          <table class="token-table">
            <thead>
              <tr>
                <th>
                  <Rich text="Token" />
                </th>
                <th>
                  <Rich text="Type" />
                </th>
                <th>
                  <Rich text="CSS variable" />
                </th>
                <th>
                  <Rich text="Value" />
                </th>
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
        </div>
      </Section>

      <Section anchor="ts" title="Using token names in TypeScript">
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
