// @vitest-environment node
// No DOM here, and under jsdom `import.meta.url` would not be a file URL.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultDesignLanguage, designLanguages, tokens as designTokens } from '@motifx-community/design-system';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LANGUAGE,
  LAYER,
  SCOPES,
  componentTokens,
  designLanguageScope,
  languageValues,
  languages,
  referenceOf,
  render,
  renderCss,
  renderLanguage,
  renderPlaces,
  renderSlots,
  renderUnits,
  schema,
} from '../scripts/build-tokens.mjs';
import { componentTokens as generated } from '../src/generated/tokens';

const root = fileURLToPath(new URL('..', import.meta.url)); // the repo root, whatever the working directory
// The working tree may hold CRLF (core.autocrlf): compared by content, not by line ends.
const read = (file: string) => readFileSync(join(root, file), 'utf8').replace(/\r\n/g, '\n');
const pathOf = (t: { path: string[] }) => t.path.join('.');
const varOf = (path: string) => `--mx-${path.replace(/\./g, '-')}`;
const slotOf = (path: string) => `--_${path.replace(/\./g, '-')}`;

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

// Building every language through Style Dictionary takes seconds, more while the other test files run.
describe('component tokens', { timeout: 30_000 }, () => {
  it("every language gives every token of the schema a value (a unit's token it does not write stays unset), and nothing else", () => {
    expect(languages()[0]).toBe(DEFAULT_LANGUAGE);
    const names = [...schema().tokens.keys()].sort();
    for (const language of languages()) expect([...languageValues(language).keys()].sort(), language).toEqual(names);
  });

  it('has a language for every design language of the design system, and no other: a new one is its folder in both', () => {
    expect([...languages()].sort()).toEqual([...designLanguages].sort());
    expect(DEFAULT_LANGUAGE).toBe(defaultDesignLanguage);
  });

  it('reference design-system tokens only, with matching types, in every language', async () => {
    for (const language of languages()) {
      for (const t of await componentTokens(language)) {
        const ref = referenceOf(t);
        if (ref) expect(ref in designTokens, `${language} ${pathOf(t)} references ${ref}`).toBe(true);
      }
    }
  });

  it('are written as var() chains inside @layer mx.components', async () => {
    const css = await render('mx/components-css');
    expect(LAYER).toBe('mx.components');
    expect(css).toMatch(/^\/\*[^\n]*\*\/\n@layer mx\.components \{\n {2}:root, \[data-theme\], \[data-design-language\], \[data-density\] \{\n( {4}--mx-[\w-]+: [^\n]+;\n)+ {2}\}\n\}\n$/);
    expect(SCOPES).toBe(':root, [data-theme], [data-design-language], [data-density]');
    // Only component tokens are written; the design system's layers come from its own stylesheet.
    expect(css).not.toContain('--mx-color-gray-');
  });

  it('writes every other language under its scope, theme and density scopes inside it included', async () => {
    const css = await renderLanguage('material');
    expect(designLanguageScope('material')).toBe('[data-design-language="material"], :where([data-design-language="material"]) :is([data-theme], [data-density])');
    expect(css).toContain(`  ${designLanguageScope('material')} {\n`);
    expect(css).toContain('--mx-slider-knob-bg: var(--mx-color-accent-solid);');
    // The default block stays first, so a language's block wins by source order at the same weight.
    const whole = await renderCss();
    expect(whole.indexOf(SCOPES)).toBeLessThan(whole.indexOf(designLanguageScope('material')));
  });

  it("takes every token of a component in a slot on the component's root", () => {
    const css = renderSlots();
    const placeTokens = new Set(schema().places.flatMap((p) => p.tokens.map((t) => `${p.component}.${p.place}.${t}`)));
    for (const [component, selector] of schema().selectors) {
      expect(css, component).toContain(`  ${selector} {\n`);
      for (const path of schema().tokens.keys()) {
        if (path.split('.')[0] !== component || placeTokens.has(path)) continue;
        expect(css).toContain(`${slotOf(path)}: var(${varOf(path)});`);
      }
    }
  });

  it("points a part's slots at a place's tokens inside its selector", () => {
    const css = renderPlaces();
    for (const p of schema().places) {
      expect(css, `${p.component}.${p.place}`).toContain(`  ${p.selector} {\n`);
      for (const t of p.tokens) expect(css).toContain(`${slotOf(`${p.part}.${t}`)}: var(${varOf(`${p.component}.${p.place}.${t}`)});`);
    }
  });

  it('paints every unit a language writes at its selector, and each state written at the state\'s selector', () => {
    const css = renderUnits();
    const { units, tokens } = schema();
    for (const u of units) {
      const written = [...tokens.keys()].filter((p) => p.startsWith(`${u.component}.${u.unit}.`));
      const rest = written.filter((p) => p.split('.').length === 3);
      if (rest.length) expect(css, `${u.component}.${u.unit}`).toContain(`  ${u.selector} {\n`);
      for (const s of u.states) {
        if (written.some((p) => p.split('.')[2] === s.name)) expect(css, `${u.component}.${u.unit}.${s.name}`).toContain(`  ${s.selector} {\n`);
      }
    }
    // A value a language writes is read through its slot, with a fallback at the end of the chain; the rest is the
    // schema's default (or a frame's style) drawn as it is.
    for (const line of css.split('\n').filter((l) => l.startsWith('    '))) expect(line).toMatch(/^ {4}[\w-]+: (var\(--_[\w-]+, .+\)|[^;]+);$/);
  });

  it('generated files match the source', async () => {
    expect(read('src/generated/components.css')).toBe(await renderCss());
    expect(read('src/generated/slots.css')).toBe(renderSlots());
    expect(read('src/generated/places.css')).toBe(renderPlaces());
    expect(read('src/generated/units.css')).toBe(renderUnits());
    expect(read('src/generated/tokens.ts')).toBe(await render('mx/components-ts'));
    expect(Object.keys(generated).sort()).toEqual([...schema().tokens.keys()].sort());
  });
});

describe('kit CSS', () => {
  const files = kitCss();

  it('finds the base file', () => {
    expect(files).toContain('src/styles/base.css');
  });

  it('every file sits in @layer mx.components', () => {
    for (const file of files) {
      // Registered properties (`@property`) stand before it: they are not layered.
      expect(read(file), file).toMatch(/^(\/\*[\s\S]*?\*\/\s*)?(@property [\w-]+ \{[^}]*\}\s*)*@layer mx\.components \{/);
    }
  });

  it("uses only tokens that exist: the design system's or this kit's component tokens", () => {
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
  // design language can restyle that one component (tokens/languages/<language>/). Only the
  // motion and the stacking order come straight from the design system: they are not a component's look.
  const sharedFamilies = /^--mx-(motion|z)-/;

  it('paints only with slots (the motion and the stacking order aside)', () => {
    for (const file of files) {
      const direct = [...read(file).matchAll(/var\((--mx-[\w-]+)/g)].map((m) => m[1]).filter((name) => !sharedFamilies.test(name));
      expect(direct, `${file} reads tokens instead of its slots`).toEqual([]);
    }
  });

  // A slot is a component's token taken in on the component's root: `--_<component>-<token>`.
  const slots = new Set(
    [...schema().tokens.keys()].filter((path) => schema().selectors.has(path.split('.')[0])).map(slotOf),
  );
  const slotLike = (name: string) => [...schema().selectors.keys()].some((component) => name.startsWith(`--_${component}-`));
  // A unit's slot is there only where a language writes the token; layout may read one with a fallback.
  const unitSlot = (name: string) => schema().units.some((u) => name.startsWith(`--_${u.component}-${u.unit}-`));

  it('reads only slots that exist', () => {
    for (const file of files) {
      for (const [, name] of read(file).matchAll(/var\((--_[\w-]+)/g)) {
        if (slotLike(name) && !unitSlot(name)) expect(slots.has(name), `${file} reads ${name}`).toBe(true);
      }
    }
  });

  it('declares no slot and no private property named like one: slots are only the generated ones', () => {
    for (const file of files) {
      for (const [, name] of read(file).matchAll(/^\s*(--_[\w-]+)\s*:/gm)) expect(slotLike(name), `${file} declares ${name}`).toBe(false);
    }
  });

  it('reaches its own parts only: after `X >`, a :where() holds one step', () => {
    // `X > :where(A > B) > C` asks for an element that is a B in an A and also X's child: never what was meant.
    for (const file of files) expect(read(file).match(/> :where\([^)]*>[^)]*\)/g) ?? [], file).toEqual([]);
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

  it("draws keyboard focus with the component's own focus tokens", () => {
    for (const file of files) {
      for (const [, selector, body] of read(file).matchAll(/([^{}]*:focus-visible[^{}]*)\{([^{}]*)\}/g)) {
        for (const [, prop, value] of body.matchAll(/^\s*(outline[a-z-]*|box-shadow)\s*:\s*([^;]+);/gm)) {
          // Slots of the component's focus ring; a private property is a shadow the part keeps under the ring.
          for (const [, name] of value.matchAll(/var\((--_[\w-]+)/g)) {
            if (slotLike(name)) expect(/-focus-(width|offset|color|halo)$/.test(name), `${file} ${selector.trim()} ${prop} uses ${name}`).toBe(true);
          }
        }
      }
    }
  });

  it('a design language is its token files only: no stylesheet of its own', () => {
    expect(existsSync(join(root, 'src/styles/identity'))).toBe(false);
  });

  it('the shipped stylesheet imports the design system first, then only this kit', () => {
    const index = read('src/styles/index.css');
    const imports = [...index.matchAll(/^@import '([^']+)';$/gm)].map((m) => m[1]);
    expect(imports[0]).toBe('@motifx-community/design-system/styles.css');
    for (const spec of imports.slice(1)) expect(spec.startsWith('.'), spec).toBe(true);
    expect(imports).toContain('../generated/slots.css');
    // The units' paint after every component (their CSS only places the units), the places last.
    expect(imports.slice(-2)).toEqual(['../generated/units.css', '../generated/places.css']);
    // Nothing but imports: a rule between them would break postcss-import in the app's bundler.
    const statements = index
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim()
      .split('\n')
      .filter((l) => l.trim());
    expect(statements.every((l) => l.startsWith('@import '))).toBe(true);
  });
});
