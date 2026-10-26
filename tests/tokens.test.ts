// @vitest-environment node
// No DOM here, and under jsdom `import.meta.url` would not be a file URL.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tokens as designTokens } from '@motifx-community/design-system';
import { describe, expect, it } from 'vitest';
import { LAYER, SCOPES, componentTokens, identities, identityScope, referenceOf, render, renderCss, renderIdentity } from '../scripts/build-tokens.mjs';
import { componentTokens as generated } from '../src/generated/tokens';

const root = fileURLToPath(new URL('..', import.meta.url)); // the repo root, whatever the working directory
const read = (file: string) => readFileSync(join(root, file), 'utf8');
const pathOf = (t: { path: string[] }) => t.path.join('.');

/** Every hand-written CSS file of the kit: components and base; not the generated one, not the import list. */
function kitCss(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    if (!existsSync(join(root, dir))) return;
    for (const e of readdirSync(join(root, dir), { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(rel);
      else if (e.name.endsWith('.css') && e.name !== 'index.css') out.push(rel);
    }
  };
  walk('src/components');
  walk('src/parts');
  walk('src/styles');
  return out;
}

describe('component tokens', () => {
  it('reference design-system tokens only, with matching types', async () => {
    const tokens = await componentTokens();
    for (const t of tokens) {
      const ref = referenceOf(t);
      if (ref) expect(ref in designTokens, `${pathOf(t)} references ${ref}`).toBe(true);
    }
  });

  it('are written as var() chains inside @layer mx.components', async () => {
    const css = await render('mx/components-css');
    expect(LAYER).toBe('mx.components');
    // Until a component has tokens the file holds only its header.
    if (!(await componentTokens()).length) return void expect(css).toMatch(/^\/\*[^\n]*\*\/\n$/);
    expect(css).toMatch(/^\/\*[^\n]*\*\/\n@layer mx\.components \{\n {2}:root, \[data-theme\], \[data-identity\], \[data-density\] \{\n( {4}--mx-[\w-]+: [^\n]+;\n)+ {2}\}\n\}\n$/);
    expect(SCOPES).toBe(':root, [data-theme], [data-identity], [data-density]');
    // Only component tokens are written; the design system's layers come from its own stylesheet.
    expect(css).not.toContain('--mx-color-gray-');
  });

  it('a design language maps only existing component tokens, to design-system tokens of the same type', async () => {
    expect(identities()).toContain('material');
    for (const language of identities()) {
      const mapped = await componentTokens(language);
      expect(mapped.length, language).toBeGreaterThan(0);
      for (const t of mapped) {
        const ref = referenceOf(t);
        if (ref) expect(ref in designTokens, `${language} ${pathOf(t)} references ${ref}`).toBe(true);
        expect(pathOf(t) in generated, `${language} ${pathOf(t)}`).toBe(true);
      }
    }
  });

  it("writes a language's mapping under its scope, theme and density scopes inside it included", async () => {
    const css = await renderIdentity('material');
    expect(identityScope('material')).toBe('[data-identity="material"], :where([data-identity="material"]) :is([data-theme], [data-density])');
    expect(css).toContain(`  ${identityScope('material')} {\n`);
    expect(css).toContain('--mx-button-radius: var(--mx-radius-full);');
    expect(css).toContain('--mx-field-height-md: var(--mx-control-height-lg);');
    // The base block stays first, so a language's block wins by source order at the same weight.
    const whole = await renderCss();
    expect(whole.indexOf(SCOPES)).toBeLessThan(whole.indexOf(identityScope('material')));
  });

  it('generated files match the source', async () => {
    expect(read('src/generated/components.css')).toBe(await renderCss());
    expect(read('src/generated/tokens.ts')).toBe(await render('mx/components-ts'));
    const names = (await componentTokens()).map(pathOf).sort();
    expect(Object.keys(generated).sort()).toEqual(names);
  });
});

describe('kit CSS', () => {
  const files = kitCss();

  it('finds the base file', () => {
    expect(files).toContain('src/styles/base.css');
  });

  it('every file sits in @layer mx.components', () => {
    for (const file of files) {
      expect(read(file), file).toMatch(/^(\/\*[\s\S]*?\*\/\s*)?@layer mx\.components \{/);
    }
  });

  it('uses only tokens that exist: the design system\'s or this kit\'s component tokens', () => {
    const known = new Set<string>([
      ...Object.values(designTokens).map((t) => t.cssVar),
      ...Object.values(generated as Record<string, { cssVar: string }>).map((t) => t.cssVar),
    ]);
    for (const file of files) {
      for (const [, name] of read(file).matchAll(/var\((--mx-[\w-]+)/g)) {
        expect(known.has(name), `${file} uses ${name}`).toBe(true);
      }
    }
  });

  // A component's look is its own: every value it paints with is one of its component tokens, so a
  // design language can restyle that one component (tokens/component/identity/<language>/). Only the
  // motion and the stacking order come straight from the design system: they are not a component's look.
  const sharedFamilies = /^--mx-(motion|z)-/;

  it('paints only with component tokens (the motion and the stacking order aside)', () => {
    const own = new Set(Object.values(generated as Record<string, { cssVar: string }>).map((t) => t.cssVar));
    for (const file of files) {
      const direct = [...read(file).matchAll(/var\((--mx-[\w-]+)/g)].map((m) => m[1]).filter((name) => !own.has(name) && !sharedFamilies.test(name));
      expect(direct, `${file} reads design-system tokens directly`).toEqual([]);
    }
  });

  it('writes no lengths by hand where the look is decided (borders, outlines, shadows, corners, spacing, type)', () => {
    const look = /^(border|outline|box-shadow|padding|gap|row-gap|column-gap|font-size|line-height|letter-spacing|text-decoration-thickness|text-underline-offset)/;
    for (const file of files) {
      for (const [, prop, value] of read(file).matchAll(/^\s*([a-z-]+)\s*:\s*([^;{}]+);/gm)) {
        if (!look.test(prop)) continue;
        const bare = value.replace(/var\([^()]*(?:\([^()]*\))*[^()]*\)/g, '');
        const lengths = (bare.match(/(?<![\w-])-?\d*\.?\d+(px|rem|em)\b/g) ?? []).filter((l) => !/^-?0*\.?0+(px|rem|em)$/.test(l));
        expect(lengths, `${file}: ${prop}: ${value}`).toEqual([]);
      }
    }
  });

  it('draws keyboard focus with the component\'s own focus tokens', () => {
    for (const file of files) {
      for (const [, selector, body] of read(file).matchAll(/([^{}]*:focus-visible[^{}]*)\{([^{}]*)\}/g)) {
        for (const [, prop, value] of body.matchAll(/^\s*(outline[a-z-]*|box-shadow)\s*:\s*([^;]+);/gm)) {
          for (const [, name] of value.matchAll(/var\((--mx-[\w-]+)/g)) {
            expect(/-focus-(width|offset|color|halo)$/.test(name), `${file} ${selector.trim()} ${prop} uses ${name}`).toBe(true);
          }
        }
      }
    }
  });

  it('a design language\'s own stylesheet styles nothing outside that language', () => {
    const dir = join(root, 'src/styles/identity');
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir).filter((f) => f.endsWith('.css'))) {
      const language = name.replace(/\.css$/, '');
      const css = readFileSync(join(dir, name), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      const scope = new RegExp(`^(:where\\()?\\[data-identity=(["'])${language}\\2\\]`);
      for (const [, selectors] of css.matchAll(/([^{}@;]+)\{[^{}]*\}/g)) {
        // A selector list splits at its own commas, not at those inside :not(…) or :is(…).
        let depth = 0;
        const list = [...selectors].map((c) => (c === '(' ? (depth++, c) : c === ')' ? (depth--, c) : c === ',' && depth === 0 ? '|' : c)).join('');
        for (const selector of list.split('|').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean)) {
          expect(scope.test(selector), `${name}: ${selector}`).toBe(true);
        }
      }
    }
  });

  it('the shipped stylesheet imports the design system first, then only this kit', () => {
    const index = read('src/styles/index.css');
    const imports = [...index.matchAll(/^@import '([^']+)';$/gm)].map((m) => m[1]);
    expect(imports[0]).toBe('@motifx-community/design-system/styles.css');
    for (const spec of imports.slice(1)) expect(spec.startsWith('.'), spec).toBe(true);
    // Nothing but imports: a rule between them would break postcss-import in the app's bundler.
    const statements = index.replace(/\/\*[\s\S]*?\*\//g, '').trim().split('\n');
    expect(statements.every((l) => l.startsWith('@import '))).toBe(true);
  });
});
