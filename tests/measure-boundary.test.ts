// @vitest-environment node
// The measuring layer's boundary: other files reach it through its index only, and inside it element-of.ts alone turns a
// component into an element or a window.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('..', import.meta.url));
const LAYER = 'src/core/measure';

function sources(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...sources(path));
    else if (/\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) out.push(path);
  }
  return out;
}

const read = (file: string) => readFileSync(join(root, file), 'utf8');

describe('the measuring layer', () => {
  it('is reached from outside its folder through its index only', () => {
    const reached: string[] = [];
    for (const file of sources('src')) {
      if (file.startsWith(`${LAYER}/`)) continue;
      for (const [, path] of read(file).matchAll(/from\s+['"]([^'"]*\/measure\/[^'"]+)['"]/g)) reached.push(`${file} -> ${path}`);
    }
    expect(reached).toEqual([]);
  });

  it("reads a component's element and a node's window in element-of.ts alone", () => {
    const found: string[] = [];
    for (const file of sources(LAYER)) {
      if (file.endsWith('/element-of.ts')) continue;
      if (/\.element\b|ownerDocument|defaultView/.test(read(file))) found.push(file);
    }
    expect(found).toEqual([]);
  });
});
