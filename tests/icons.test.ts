import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as glyphs from '../src/core/glyphs';
// @ts-expect-error a plain .mjs script, no types
import { renderIcons, svgOf } from '../scripts/build-icons.mjs';

const root = join(__dirname, '..');
const kit = JSON.parse(readFileSync(join(root, 'tokens/icons/kit.icons.json'), 'utf8'));

describe('icons', () => {
  it('the generated stylesheet is the one the icon files make', () => {
    expect(readFileSync(join(root, 'src/generated/icons.css'), 'utf8')).toBe(renderIcons());
  });

  it('every glyph helper names an icon of the kit, and draws it as a span', () => {
    const helpers = Object.entries(glyphs).filter(([name]) => name !== 'glyph');
    expect(helpers.length).toBeGreaterThan(30);
    for (const [name, make] of helpers) {
      const mark = name === 'dockGuideMark' ? (make as (side: string) => HTMLElement)('left') : (make as () => HTMLElement)();
      expect(mark.className, name).toBe('mx-glyph');
      expect(kit.icons[mark.dataset.icon!], `${name} → ${mark.dataset.icon}`).toBeDefined();
      expect(mark.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('a path is drawn as a line of the set, a filled icon as a shape, a whole SVG as it is', () => {
    expect(svgOf('M4 6l4 4 4-4', { stroke: 1.5 })).toContain("stroke-width='1.5'");
    expect(svgOf({ path: 'M1 1h2', fill: true }, { stroke: 1.5 })).toContain("fill='black'");
    expect(svgOf({ svg: ' <svg viewBox="0 0 20 20"><path d="M1 1"/></svg> ' }, {})).toBe('<svg viewBox="0 0 20 20"><path d="M1 1"/></svg>');
    expect(renderIcons()).toContain(".mx-glyph[data-icon='chevron-down']");
  });
});
