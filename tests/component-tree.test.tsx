import { Component, type ComponentBase } from '@motifx/core';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { uiLocale } from '../src/core/ui-locale';
import { mount, settled } from './helpers';
import { recordBuilt, treeProblems } from './tree-check';

/**
 * Every component of the kit, as the docs examples use it: each one is mounted and every component in the tree must
 * stand in its parent's element (a fragment parent: where the fragment stands), and none may be in the page outside the
 * tree. Core places a child only through `controls`: an element moved by hand breaks this.
 */
const examples = import.meta.glob('../apps/docs/pages/**/examples/*.tsx', { import: 'default' }) as Record<string, () => Promise<unknown>>;

/** What an example makes: a function example is called, a class example (a component) is created. */
function made(example: unknown): ComponentBase | null {
  if (typeof example !== 'function') return null;
  const isClass = /^class[\s{]/.test(Function.prototype.toString.call(example));
  return (isClass ? new (example as new () => ComponentBase)() : (example as () => ComponentBase)()) ?? null;
}

async function settle() {
  await settled(6);
}

// The kit is compiled once before the first example: that alone takes longer than a test may.
beforeAll(async () => {
  await import('../src/index');
}, 120_000);

afterEach(async () => {
  document.body.innerHTML = '';
  await uiLocale.use('en');
});

describe('every component stands in its parent element', () => {
  for (const [path, load] of Object.entries(examples)) {
    it(path.replace('../apps/docs/pages/', ''), async () => {
      const example = await load();
      // A file of the examples folder that is no example (data, a helper) has nothing to mount.
      if (typeof example !== 'function') return;
      const record = recordBuilt();
      try {
        const host = mount(new Component<HTMLDivElement>('div'));
        const content = made(example);
        if (content) host.controls.add(content);
        await settle();
        expect(treeProblems(host, record.built)).toEqual([]);
      } finally {
        record.stop();
      }
    });
  }
});
