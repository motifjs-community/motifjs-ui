import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { Button } from '../button/Button';
import { Card } from './Card';

const hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle() {
  for (let i = 0; i < 4; i++) await tick();
}

const part = (card: Card, name: string) => card.element.querySelector<HTMLElement>(`.mx-card__${name}`)!;

describe('Card', () => {
  it('shows its header and its JSX children, the same programmatically, and names itself by its title', async () => {
    let jsx!: Card;
    page(
      <Card ref={(c: Card) => (jsx = c)} title="Ada Lovelace" subtitle="Mathematician" class="extra">
        <p>First to publish an algorithm.</p>
      </Card>,
    );
    const coded = new Card({ variant: 'outline', size: 'sm' });
    page(coded);
    await settle();
    expect(jsx.element.className).toContain('extra');
    expect(part(jsx, 'title').textContent).toBe('Ada Lovelace');
    expect(part(jsx, 'subtitle').textContent).toBe('Mathematician');
    expect(part(jsx, 'content').textContent).toBe('First to publish an algorithm.');
    expect(jsx.element.getAttribute('role')).toBe('group');
    expect(jsx.element.getAttribute('aria-labelledby')).toBe(part(jsx, 'title').id);
    expect(jsx.element.dataset.size).toBe('md');
    expect(coded.element.dataset.variant).toBe('outline');
    expect(coded.element.dataset.size).toBe('sm');
    // Parts with nothing in them are left out.
    expect(part(coded, 'header').hidden).toBe(true);
    expect(part(coded, 'footer').hidden).toBe(true);
    expect(part(coded, 'media').hidden).toBe(true);
    expect(coded.element.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('follows a title given as a function', async () => {
    const s = reactive({ name: 'Ada' });
    const card = new Card({ title: () => s.name });
    page(card);
    await settle();
    s.name = 'Grace';
    await settle();
    expect(part(card, 'title').textContent).toBe('Grace');
  });

  it('puts components given in props into their parts; one replaced leaves, still alive', async () => {
    const first = new Button({ text: 'Follow' });
    const card = new Card({ title: 'Ada', footer: first, action: new Button({ text: 'More' }) });
    page(card);
    await settle();
    expect(part(card, 'footer').contains(first.element)).toBe(true);
    expect(part(card, 'footer').hidden).toBe(false);
    expect(part(card, 'action').textContent).toBe('More');
    const second = new Button({ text: 'Message' });
    card.footer = second;
    expect(part(card, 'footer').contains(second.element)).toBe(true);
    expect(part(card, 'footer').contains(first.element)).toBe(false);
    expect(first.isDisposed).toBe(false);
    card.footer = null;
    expect(part(card, 'footer').hidden).toBe(true);
  });

  it('shows a picture with its text for screen readers, and an avatar before the titles', async () => {
    const card = new Card({ title: 'Ada', media: 'ada.png', mediaAlt: 'Portrait of Ada', avatar: { name: 'Ada Lovelace' } });
    page(card);
    await settle();
    const img = part(card, 'media').querySelector('img')!;
    expect(img.getAttribute('src')).toBe('ada.png');
    expect(img.alt).toBe('Portrait of Ada');
    expect(card.avatarControl?.element.textContent).toBe('AL');
    expect(part(card, 'header').firstElementChild).toBe(card.avatarControl?.element);
  });

  it('is a link through its title when it has an address; the card takes no focus of its own', async () => {
    const card = new Card({ title: 'Lisbon', href: '/places/lisbon', rel: 'router', footer: new Button({ text: 'Save' }) });
    page(card);
    await settle();
    const link = card.element.querySelector<HTMLAnchorElement>('.mx-card__link')!;
    expect(link.hidden).toBe(false);
    expect(link.textContent).toBe('Lisbon');
    expect(link.getAttribute('href')).toBe('/places/lisbon');
    expect(link.getAttribute('rel')).toBe('router');
    expect(card.element.hasAttribute('data-link')).toBe(true);
    expect(card.element.hasAttribute('tabindex')).toBe(false);
    card.href = null;
    expect(link.hidden).toBe(true);
    expect(part(card, 'title').textContent).toBe('Lisbon');
  });

  it('is selected by a press on it or its check box, named after its title, but not by its own buttons', async () => {
    const seen: [boolean, boolean][] = [];
    const save = new Button({ text: 'Save' });
    const card = new Card({ title: 'Lisbon', selectable: true, footer: save, onSelectedChanged: (e) => seen.push([e.selected, e.byUser]) });
    page(card);
    await settle();
    const box = card.element.querySelector<HTMLInputElement>('.mx-card__select input')!;
    expect(box.getAttribute('aria-label') ?? card.element.querySelector('.mx-card__select label')?.textContent).toContain('Lisbon');
    part(card, 'content').click();
    expect(card.selected).toBe(true);
    expect(card.element.hasAttribute('data-selected')).toBe(true);
    expect(box.checked).toBe(true);
    save.element.click();
    expect(card.selected).toBe(true);
    box.click();
    expect(card.selected).toBe(false);
    card.selected = true;
    expect(seen).toEqual([
      [true, true],
      [false, true],
      [true, false],
    ]);
  });

  it('is pressed with Enter and Space when clickable, and only then takes focus', async () => {
    let clicks = 0;
    const card = new Card({ title: 'Ada', clickable: true, onclick: () => clicks++ });
    page(card);
    await settle();
    expect(card.element.getAttribute('tabindex')).toBe('0');
    expect(card.element.hasAttribute('data-pressable')).toBe(true);
    card.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    card.element.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(clicks).toBe(2);
    card.clickable = false;
    expect(card.element.hasAttribute('tabindex')).toBe(false);
  });
});
