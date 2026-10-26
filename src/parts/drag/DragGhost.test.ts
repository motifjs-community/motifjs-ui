import { afterEach, describe, expect, it } from 'vitest';
import { DragGhost } from './DragGhost';

describe('DragGhost', () => {
  const root = document.createElement('div');
  document.body.append(root);
  afterEach(() => root.replaceChildren());

  const header = () => {
    const cell = document.createElement('div');
    cell.className = 'mx-data-grid__header-cell';
    cell.id = 'h1';
    cell.tabIndex = 0;
    cell.setAttribute('aria-sort', 'ascending');
    cell.toggleAttribute('data-dragging', true);
    cell.innerHTML = '<span class="mx-data-grid__title">Customer</span><button tabindex="-1" aria-label="Menu"></button>';
    cell.getBoundingClientRect = () => ({ left: 0, top: 0, right: 180, bottom: 36, width: 180, height: 36, x: 0, y: 0, toJSON: () => ({}) });
    return cell;
  };

  it('shows a copy of the header next to the pointer, follows it with what a drop would do, and goes away', () => {
    const ghost = new DragGhost(() => root, () => true, 'mx-data-grid__ghost');
    ghost.show(header(), 100, 50, 'header');
    const el = root.querySelector<HTMLElement>('.mx-data-grid__ghost')!;
    const copy = el.querySelector<HTMLElement>('.mx-data-grid__header-cell')!;
    expect(el.dataset.kind).toBe('header');
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(copy.querySelector('.mx-data-grid__title')!.textContent).toBe('Customer');
    expect([copy.id, copy.getAttribute('tabindex'), copy.getAttribute('aria-sort'), copy.hasAttribute('data-dragging')]).toEqual(['', null, null, false]);
    expect(copy.querySelector('button')!.getAttributeNames()).toEqual([]);
    expect(copy.style.inlineSize).toBe('180px');
    expect(el.dataset.target).toBe('none');
    ghost.move(200, 80, 'group');
    expect(el.style.transform).toBe('translate(214px, 94px)');
    expect(el.dataset.target).toBe('group');
    ghost.hide();
    expect(root.querySelector('.mx-data-grid__ghost')).toBeNull();
  });

  it('shows nothing while it is turned off', () => {
    let on = false;
    const ghost = new DragGhost(() => root, () => on, 'mx-data-grid__ghost');
    ghost.show(header(), 0, 0, 'header');
    ghost.move(10, 10, 'move');
    expect(root.querySelector('.mx-data-grid__ghost')).toBeNull();
    on = true;
    ghost.show(header(), 0, 0, 'header');
    expect(root.querySelector('.mx-data-grid__ghost')).not.toBeNull();
  });
});
