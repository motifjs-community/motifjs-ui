// @vitest-environment node
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const pages = fileURLToPath(new URL('../apps/docs/pages', import.meta.url));

function pageFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? pageFiles(join(dir, e.name)) : e.name.endsWith('Page.tsx') ? [join(dir, e.name)] : []));
}

describe('the anchors of the docs', () => {
  // An anchor is an address and a test's way in, not a text: a change of wording must not reach it.
  it('are lower-case names', () => {
    const wrong = pageFiles(pages).flatMap((file) => [...readFileSync(file, 'utf8').matchAll(/<Section anchor="([^"]*)"/g)].map((m) => m[1]).filter((name) => !/^[a-z0-9-]+$/.test(name)).map((name) => `${file}: ${name}`));
    expect(wrong).toEqual([]);
  });
});
