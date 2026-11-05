import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { Badge } from './Badge';

const hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  await uiLocale.use('en');
  uiLocale.strings = enStrings;
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle() {
  for (let i = 0; i < 4; i++) await tick();
}

describe('Badge', () => {
  it('shows a text, or a count up to max and max+ beyond it, the same in JSX and programmatically', async () => {
    let jsx!: Badge;
    page(<Badge ref={(b: Badge) => (jsx = b)} text="New" tone="success" class="extra" />);
    const coded = new Badge({ count: 120 });
    page(coded);
    await settle();
    expect(jsx.element.className).toContain('mx-badge');
    expect(jsx.element.className).toContain('extra');
    expect(jsx.element.textContent).toBe('New');
    expect(jsx.element.dataset.tone).toBe('success');
    expect(jsx.element.dataset.variant).toBe('solid');
    expect(jsx.element.dataset.size).toBe('md');
    expect(coded.element.textContent).toBe('99+');
    coded.max = 999;
    expect(coded.element.textContent).toBe('120');
    expect(coded.shownText).toBe('120');
  });

  it('hides at 0 unless showZero, and follows a count given as a function', async () => {
    const s = reactive({ unread: 3 });
    const badge = new Badge({ count: () => s.unread });
    page(badge);
    await settle();
    expect(badge.element.textContent).toBe('3');
    s.unread = 0;
    await settle();
    expect(badge.element.hasAttribute('data-empty')).toBe(true);
    badge.showZero = true;
    expect(badge.element.hasAttribute('data-empty')).toBe(false);
    expect(badge.element.textContent).toBe('0');
  });

  it('is a dot without text, hidden from screen readers unless it has a label', async () => {
    const badge = new Badge({ dot: true, count: 5 });
    page(badge);
    await settle();
    expect(badge.element.textContent).toBe('');
    expect(badge.element.hasAttribute('data-dot')).toBe(true);
    expect(badge.element.getAttribute('aria-hidden')).toBe('');
    badge.label = 'New messages';
    expect(badge.element.getAttribute('role')).toBe('img');
    expect(badge.element.getAttribute('aria-label')).toBe('New messages');
    expect(badge.element.hasAttribute('aria-hidden')).toBe(false);
  });

  it('sits on a corner of what it is attached to, as one of its children, and goes with it', async () => {
    const button = new Component<HTMLButtonElement>('button');
    page(button);
    await settle();
    const badge = Badge.attach(button, { count: 2 });
    expect(badge.parent).toBe(button);
    expect(badge.element.parentElement).toBe(button.element);
    expect(badge.element.dataset.position).toBe('top-end');
    expect(button.element.classList.contains('mx-badge-anchor')).toBe(true);
    badge.position = null;
    expect(badge.element.dataset.position).toBeUndefined();
    await button.dispose();
    expect(badge.isDisposed).toBe(true);
  });

  it('writes its count in the kit language, again when the language changes', async () => {
    const badge = new Badge({ count: 1234, max: 9999 });
    page(badge);
    await settle();
    expect(badge.element.textContent).toBe('1,234');
    await uiLocale.use('tr');
    expect(badge.element.textContent).toBe('1.234');
  });
});
