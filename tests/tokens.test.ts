// @vitest-environment node
// No DOM here, and under jsdom `import.meta.url` would not be a file URL.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tokens as designTokens } from '@motifx-community/design-system';
import { describe, expect, it } from 'vitest';
import { LAYER, componentTokens, referenceOf, render } from '../scripts/build-tokens.mjs';
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
    expect(css).toMatch(/^\/\*[^\n]*\*\/\n@layer mx\.components \{\n {2}:root \{\n( {4}--mx-[\w-]+: [^\n]+;\n)+ {2}\}\n\}\n$/);
    // Only component tokens are written; the design system's layers come from its own stylesheet.
    expect(css).not.toContain('--mx-color-gray-');
  });

  it('generated files match the source', async () => {
    expect(read('src/generated/components.css')).toBe(await render('mx/components-css'));
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
