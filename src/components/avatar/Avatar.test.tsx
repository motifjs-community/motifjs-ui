import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { Avatar } from './Avatar';
import { AvatarGroup } from './AvatarGroup';
import { initialsOf } from './initials-of';
import { toneOfName } from './tone-of-name';

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

const part = (avatar: Avatar, name: string) => avatar.element.querySelector<HTMLElement>(`.mx-avatar__${name}`)!;
// A part not shown is out of the page.
const isShown = (el: HTMLElement | null) => !!el && el.isConnected && !el.hidden;

describe('initialsOf', () => {
  it('takes the first letters of the first and last words, in the capitals of the language', () => {
    expect(initialsOf('ada lovelace', 'en')).toBe('AL');
    expect(initialsOf('Ada King Lovelace', 'en')).toBe('AL');
    expect(initialsOf('grace', 'en')).toBe('G');
    expect(initialsOf('ilgin yılmaz', 'tr')).toBe('İY');
    expect(initialsOf('Ada Lovelace (Guest)', 'en')).toBe('AL');
    expect(initialsOf('  --  ', 'en')).toBe('');
  });
});

describe('Avatar', () => {
  it('shows the initials of its name, the same in JSX and programmatically, else a person icon', async () => {
    let jsx!: Avatar;
    page(<Avatar ref={(a: Avatar) => (jsx = a)} name="Ada Lovelace" tone="accent" class="extra" />);
    const coded = new Avatar();
    page(coded);
    await settle();
    expect(jsx.element.className).toContain('mx-avatar');
    expect(jsx.element.className).toContain('extra');
    expect(part(jsx, 'initials').textContent).toBe('AL');
    expect(isShown(part(jsx, 'icon'))).toBe(false);
    expect(jsx.element.dataset.tone).toBe('accent');
    expect(jsx.element.dataset.size).toBe('md');
    expect(jsx.element.getAttribute('role')).toBe('img');
    expect(jsx.element.getAttribute('aria-label')).toBe('Ada Lovelace');
    expect(isShown(part(coded, 'initials'))).toBe(false);
    expect(isShown(part(coded, 'icon'))).toBe(true);
    expect(coded.element.getAttribute('aria-hidden')).toBe('true');
    coded.initials = 'mx';
    expect(part(coded, 'initials').textContent).toBe('mx');
    expect(isShown(part(coded, 'icon'))).toBe(false);
  });

  it('takes a colour from the name with tone auto, the same for the same name', async () => {
    const a = new Avatar({ name: 'Ada Lovelace', tone: 'auto' });
    const b = new Avatar({ name: 'ada lovelace', tone: 'auto' });
    page(a, b);
    await settle();
    expect(a.element.dataset.tone).toBe(toneOfName('Ada Lovelace'));
    expect(a.element.dataset.tone).toBe(b.element.dataset.tone);
    expect(a.element.dataset.tone).not.toBe('auto');
    const tones = new Set(['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Edsger Dijkstra', 'Barbara Liskov', 'Linus Torvalds'].map(toneOfName));
    expect(tones.size).toBeGreaterThan(2);
  });

  it('follows a name given as a function', async () => {
    const s = reactive({ name: 'Ada Lovelace' });
    const avatar = new Avatar({ name: () => s.name });
    page(avatar);
    await settle();
    s.name = 'Alan Turing';
    await settle();
    expect(part(avatar, 'initials').textContent).toBe('AT');
    expect(avatar.element.getAttribute('aria-label')).toBe('Alan Turing');
  });

  it('shows the picture once it loads and falls back to the initials when it cannot', async () => {
    const avatar = new Avatar({ name: 'Ada Lovelace', src: 'ada.png' });
    page(avatar);
    await settle();
    const img = part(avatar, 'image') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('ada.png');
    expect(img.hasAttribute('data-pending')).toBe(true);
    expect(isShown(part(avatar, 'initials'))).toBe(true);
    img.dispatchEvent(new Event('load'));
    expect(avatar.showsPicture).toBe(true);
    expect(img.hasAttribute('data-pending')).toBe(false);
    expect(isShown(part(avatar, 'initials'))).toBe(false);
    avatar.src = 'missing.png';
    img.dispatchEvent(new Event('error'));
    expect(avatar.showsPicture).toBe(false);
    expect(isShown(img)).toBe(false);
    expect(img.hasAttribute('data-pending')).toBe(false);
    expect(isShown(part(avatar, 'initials'))).toBe(true);
  });

  it('shows the presence and says it with the name, in the kit language', async () => {
    const avatar = new Avatar({ name: 'Ada Lovelace', status: 'away' });
    page(avatar);
    await settle();
    expect(part(avatar, 'status').dataset.status).toBe('away');
    expect(avatar.element.getAttribute('aria-label')).toBe('Ada Lovelace, Away');
    await uiLocale.use('tr');
    expect(avatar.element.getAttribute('aria-label')).toBe('Ada Lovelace, Uzakta');
    avatar.status = null;
    expect(isShown(part(avatar, 'status'))).toBe(false);
    expect(avatar.element.getAttribute('aria-label')).toBe('Ada Lovelace');
  });
});

describe('AvatarGroup', () => {
  it('shows up to max avatars and counts the rest, the total included, in a +N after them', async () => {
    let group!: AvatarGroup;
    page(
      <AvatarGroup ref={(g: AvatarGroup) => (group = g)} max={2} label="Members" size="sm">
        <Avatar name="Ada Lovelace" />
        <Avatar name="Alan Turing" />
        <Avatar name="Grace Hopper" />
      </AvatarGroup>,
    );
    await settle();
    const items = () => Array.from(group.element.children) as HTMLElement[];
    expect(group.element.getAttribute('role')).toBe('group');
    expect(group.element.getAttribute('aria-label')).toBe('Members');
    expect(group.element.dataset.size).toBe('sm');
    expect(items().map((el) => el.hasAttribute('data-beyond'))).toEqual([false, false, true, false]);
    const more = items()[3];
    expect(more.classList.contains('mx-avatar-group__more')).toBe(true);
    expect(more.textContent).toBe('+1');
    expect(more.getAttribute('aria-label')).toBe('1 more person');
    group.total = 10;
    expect(more.textContent).toBe('+8');
    group.controls.add(new Avatar({ name: 'Edsger Dijkstra' }));
    expect(items().at(-1)).toBe(more);
    expect(group.hiddenCount).toBe(8);
    group.max = null;
    group.total = null;
    expect(more.hasAttribute('data-beyond')).toBe(true);
    expect(items().filter((el) => el.hasAttribute('data-beyond'))).toEqual([more]);
  });

  it('counts the avatars of a JSX list, as the list changes', async () => {
    const s = reactive({ people: [{ name: 'Ada Lovelace' }, { name: 'Alan Turing' }, { name: 'Grace Hopper' }] });
    let group!: AvatarGroup;
    page(
      <AvatarGroup ref={(g: AvatarGroup) => (group = g)} max={2}>
        {s.people.map((p) => (
          <Avatar key={p.name} name={p.name} />
        ))}
      </AvatarGroup>,
    );
    await settle();
    const more = group.element.querySelector('.mx-avatar-group__more')!;
    expect(group.members.length).toBe(3);
    expect(group.members.map((avatar) => avatar.element.hasAttribute('data-beyond'))).toEqual([false, false, true]);
    expect(more.textContent).toBe('+1');
    s.people.push({ name: 'Edsger Dijkstra' });
    await settle();
    expect(group.members.length).toBe(4);
    expect(more.textContent).toBe('+2');
    expect(group.element.lastElementChild).toBe(more);
  });
});
