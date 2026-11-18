import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { inner, selectorsOf, stateful, steps } from './selector-steps';

// A component's rule reaches only what the component draws: one of its kind put inside it (in a pane, a page, an
// event, a document, an item drawn by a template) keeps its own look. A selector may not leave a state of a part that
// holds such content by a descendant combinator; it goes its own way down (`>`), or the part declares a value that
// each of its kind declares again. The DataGrid has a test of its own (DataGrid.nested.test.tsx).

const units = readFileSync('src/generated/units.css', 'utf8');
const places = readFileSync('src/generated/places.css', 'utf8');

/** Each component that can hold one of its kind: its stylesheet and its parts that hold content (its root among them). */
const COMPONENTS: { name: string; css: string; hosts: string[] }[] = [
  { name: 'Splitter', css: 'splitter/splitter.css', hosts: ['mx-splitter', 'mx-splitter__pane'] },
  {
    name: 'Timeline',
    css: 'timeline/timeline.css',
    hosts: ['mx-timeline', 'mx-timeline__track', 'mx-timeline__list', 'mx-timeline__item', 'mx-timeline__card', 'mx-timeline__content', 'mx-timeline__detail'],
  },
  { name: 'MultiView', css: 'multiview/multiview.css', hosts: ['mx-multi-view', 'mx-multi-view__viewport', 'mx-multi-view__track'] },
  { name: 'ScrollView', css: 'scrollview/scrollview.css', hosts: ['mx-scroll-view', 'mx-scroll-view__content'] },
  { name: 'Sortable', css: 'sortable/sortable.css', hosts: ['mx-sortable', 'mx-sortable__item'] },
  // An item drawn by a template holds the app's content.
  { name: 'ListBox', css: 'listbox/listbox.css', hosts: ['mx-list-box', 'mx-list', 'mx-list__item'] },
  { name: 'AppBar', css: 'appbar/appbar.css', hosts: ['mx-app-bar', 'mx-app-bar__row', 'mx-app-bar__content'] },
  { name: 'Card', css: 'card/card.css', hosts: ['mx-card', 'mx-card__body', 'mx-card__content', 'mx-card__footer'] },
  {
    name: 'TabDocumentManager',
    css: 'tabdocs/tabdocs.css',
    hosts: ['mx-tabdocs', 'mx-tabdocs__split', 'mx-tabdocs__group', 'mx-tabdocs__panels', 'mx-tabdocs__panel', 'mx-tabdocs__area', 'mx-tabdocs__window', 'mx-tabdocs__window-body'],
  },
];

/** Rules that go down on purpose, and why. */
const MEANT: { match: RegExp; why: string }[] = [
  { match: /^\.mx-card\[data-link\] :is\(/, why: "a link card lifts the app's own controls in it above its link" },
  { match: /\.mx-tabdocs\[data-dragging=/, why: 'while a drag is over the manager, everything under the pointer shows what a drop would do' },
  { match: /\.mx-tabdocs\[data-resizing\]/, why: 'only the splitter being dragged holds focus while the root resizes' },
];

/** The place in a selector where it leaves a state of a part holding content by a descendant combinator, or null. */
function reach(selector: string, holds: (compound: string) => boolean): string | null {
  let armed = '';
  for (const { compound, by } of steps(selector)) {
    if (armed && by === ' ') return `${armed} … ${compound}`;
    // A step to a part that holds nothing from outside keeps the path in the component.
    if (by && by !== ' ' && !holds(compound)) armed = '';
    if (stateful(compound) && holds(compound)) armed = compound;
    for (const part of inner(compound)) {
      const found = reach(part, holds);
      if (found) return found;
    }
  }
  return null;
}

describe('a rule of a component', () => {
  it.each(COMPONENTS)('$name: does not leave a state of a part holding content by a descendant combinator', ({ css, hosts }) => {
    const names = new Set(hosts);
    // Classes in `:is()` and `:where()` count, those in `:not()` do not.
    const holds = (compound: string) => Array.from(compound.replace(/:not\((?:[^()]|\([^()]*\))*\)/g, '').matchAll(/\.([\w-]+)/g)).some(([, name]) => names.has(name));
    const own = selectorsOf(readFileSync(`src/components/${css}`, 'utf8'));
    const generated = [...selectorsOf(units), ...selectorsOf(places)].filter((s) => hosts.some((name) => new RegExp(`\\.${name}(?![\\w-])`).test(s)));
    const found = [...new Set([...own, ...generated])].map((s) => [s, reach(s, holds)]).filter(([s, at]) => at && !MEANT.some((m) => m.match.test(s!)));
    expect(found).toEqual([]);
  });

  it('is read as it is written', () => {
    const holds = (compound: string) => /\.mx-x(?![\w-])|\.mx-x__pane/.test(compound);
    expect(reach(".mx-x[data-a='1'] .mx-x__bar", holds)).toBe(".mx-x[data-a='1'] … .mx-x__bar");
    expect(reach(".mx-x[data-a='1'] > :where(.mx-x__handle) > .mx-x__bar", holds)).toBeNull();
    // A child that holds nothing from outside: what is under it is the component's.
    expect(reach('.mx-x[data-a] > .mx-x__head .mx-x__title', holds)).toBeNull();
    // A child that holds content: the path may still reach the content.
    expect(reach('.mx-x[data-a] > .mx-x__pane .mx-x__bar', holds)).toBe('.mx-x[data-a] … .mx-x__bar');
    expect(reach('.mx-x__bar:where(.mx-x[data-a] *)', holds)).toBe('.mx-x[data-a] … *');
    expect(reach('.mx-x__bar:where(.mx-x[data-a] > *)', holds)).toBeNull();
  });
});
