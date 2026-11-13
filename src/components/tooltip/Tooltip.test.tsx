import { Component, reactive } from '@motifx/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { measureNow } from '../../core/measure';
import { Button } from '../button/Button';
import { addTooltip } from './add-tooltip';
import { Tooltip } from './Tooltip';

let hosts: Component[] = [];

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance', 'Date'] });
});

afterEach(async () => {
  document.body.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, pointerType: 'mouse' }));
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  vi.advanceTimersByTime(1000);
  vi.useRealTimers();
  document.body.innerHTML = '';
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle() {
  for (let i = 0; i < 5; i++) await tick();
}

function over(el: Element, pointerType = 'mouse') {
  el.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType }));
}

function press(el: Element) {
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' }));
}

function key(name: string) {
  const e = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true });
  (document.activeElement ?? document.body).dispatchEvent(e);
  return e;
}

const shown = (t: Tooltip) => t.element.isConnected && !t.element.hidden;

/** A plain element away from every target, for the pointer to move to. */
function elsewhere(host: Component) {
  const el = document.createElement('p');
  (host.element as HTMLElement).append(el);
  return el;
}

describe('Tooltip', () => {
  it('describes a target from JSX after the delay, also when the target comes later in the view', async () => {
    let save!: Button;
    let tip!: Tooltip;
    const host = page(
      <div>
        <Tooltip ref={(t: Tooltip) => (tip = t)} target={() => save} text="Save the file (Ctrl+S)" />
        <Button ref={(b: Button) => (save = b)} text="Save" />
      </div>,
    );
    await settle();
    const button = save.element;
    expect(tip.element.getAttribute('role')).toBe('tooltip');
    expect(tip.element?.isConnected ?? false).toBe(false);
    expect(tip.element.textContent).toBe('Save the file (Ctrl+S)');

    over(button);
    vi.advanceTimersByTime(499);
    expect(shown(tip)).toBe(false);
    vi.advanceTimersByTime(1);
    expect(shown(tip)).toBe(true);
    expect(tip.opened).toBe(true);
    expect(button.getAttribute('aria-describedby')).toBe(tip.element.id);
    // Placed after the browser shows it, in the next measuring round (timers are fake here).
    await settle();
    measureNow(tip);
    expect(tip.element.dataset.side).toBeDefined();

    over(elsewhere(host));
    vi.advanceTimersByTime(149);
    expect(shown(tip)).toBe(true);
    vi.advanceTimersByTime(1);
    expect(shown(tip)).toBe(false);
    expect(button.hasAttribute('aria-describedby')).toBe(false);
  });

  it('works programmatically: new Tooltip with a component, open() and close(), properties set later', async () => {
    const targetPart = new Component<HTMLSpanElement>('span');
    targetPart.element.textContent = 'Help';
    const host = page(targetPart);
    const target = targetPart.element;
    const tip = new Tooltip({ target: targetPart, text: 'Opens the guide' });
    const opened = vi.fn();
    const closed = vi.fn();
    tip.onOpened(opened);
    tip.onClosed(closed);

    expect(tip.element.isConnected).toBe(false);
    expect(tip.open()).toBe(true);
    // It places itself next to its target.
    expect(tip.parent).toBe(host);
    expect(tip.element.previousElementSibling).toBe(target);
    expect(shown(tip)).toBe(true);
    expect(target.getAttribute('aria-describedby')).toBe(tip.element.id);
    expect(opened).toHaveBeenCalledTimes(1);

    tip.text = 'Opens the user guide';
    tip.placement = 'bottom';
    expect(tip.element.textContent).toBe('Opens the user guide');
    // Placed after the browser shows it, in the next measuring round.
    await settle();
    measureNow(tip);
    expect(tip.element.dataset.side).toBe('bottom');

    tip.close();
    expect(shown(tip)).toBe(false);
    expect(closed).toHaveBeenCalledTimes(1);
    tip.opened = true;
    expect(shown(tip)).toBe(true);
    const el = tip.element;
    await tip.dispose();
    expect(el.isConnected).toBe(false);
    expect(target.hasAttribute('aria-describedby')).toBe(false);
  });

  it('follows getter props', async () => {
    const s = reactive({ text: 'One', placement: 'top' as 'top' | 'bottom', on: true });
    const target = new Component<HTMLButtonElement>('button');
    let tip!: Tooltip;
    page(<Tooltip ref={(t: Tooltip) => (tip = t)} target={target} text={() => s.text} placement={() => s.placement} enabled={() => s.on} />);
    page(target);
    await settle();
    tip.open();
    s.text = 'Two';
    s.placement = 'bottom';
    await settle();
    expect(tip.element.textContent).toBe('Two');
    measureNow(tip);
    expect(tip.element.dataset.side).toBe('bottom');
    s.on = false;
    await settle();
    expect(shown(tip)).toBe(false);
    expect(tip.open()).toBe(false);
  });

  it('reads functions over plain data again on reState', async () => {
    const plain = { text: 'One', placement: 'top' as 'top' | 'bottom' };
    const target = new Component<HTMLButtonElement>('button');
    let tip!: Tooltip;
    const host = page(<Tooltip ref={(t: Tooltip) => (tip = t)} target={target} text={() => plain.text} placement={() => plain.placement} />);
    page(target);
    await settle();
    tip.open();
    Object.assign(plain, { text: 'Two', placement: 'bottom' });
    await settle();
    expect(tip.element.textContent).toBe('One');
    host.reState();
    await settle();
    expect(tip.element.textContent).toBe('Two');
    measureNow(tip);
    expect(tip.element.dataset.side).toBe('bottom');
  });

  it('can be hovered: the pointer moves onto it without closing it', async () => {
    const targetPart = new Component<HTMLButtonElement>('button');
    const target = targetPart.element;
    let tip!: Tooltip;
    const host = page(<Tooltip ref={(t: Tooltip) => (tip = t)} target={targetPart} text="Hover me" />);
    host.controls.add(targetPart);
    await settle();
    over(target);
    vi.advanceTimersByTime(500);
    expect(shown(tip)).toBe(true);
    over(tip.element);
    vi.advanceTimersByTime(1000);
    expect(shown(tip)).toBe(true);
    over(elsewhere(host));
    vi.advanceTimersByTime(150);
    expect(shown(tip)).toBe(false);
  });

  it('shows on keyboard focus at once, hides on blur, and Escape hides it without moving focus', async () => {
    let save!: Button;
    let tip!: Tooltip;
    page(
      <div>
        <Button ref={(b: Button) => (save = b)} text="Save" />
        <Tooltip ref={(t: Tooltip) => (tip = t)} target={() => save} text="Saves" />
        <button class="other">Other</button>
      </div>,
    );
    await settle();
    save.focus();
    expect(shown(tip)).toBe(true);
    const e = key('Escape');
    expect(e.defaultPrevented).toBe(true);
    expect(shown(tip)).toBe(false);
    expect(document.activeElement).toBe(save.element);

    (document.querySelector('.other') as HTMLElement).focus();
    save.focus();
    expect(shown(tip)).toBe(true);
    (document.querySelector('.other') as HTMLElement).focus();
    expect(shown(tip)).toBe(false);
    expect(key('Escape').defaultPrevented).toBe(false);
  });

  it('a press on the target hides it, and it stays hidden while the pointer stays there', async () => {
    const targetPart = new Component<HTMLButtonElement>('button');
    const innerPart = new Component<HTMLSpanElement>('span');
    targetPart.controls.add(innerPart);
    const target = targetPart.element;
    const inner = innerPart.element;
    let tip!: Tooltip;
    const host = page(<Tooltip ref={(t: Tooltip) => (tip = t)} target={targetPart} text="Tip" />);
    host.controls.add(targetPart);
    await settle();
    over(target);
    vi.advanceTimersByTime(500);
    press(target);
    expect(shown(tip)).toBe(false);
    over(inner);
    vi.advanceTimersByTime(1000);
    expect(shown(tip)).toBe(false);
    over(elsewhere(host));
    over(target);
    vi.advanceTimersByTime(500);
    expect(shown(tip)).toBe(true);
  });

  it('only one is open at a time, and the next one shows at once soon after', async () => {
    const aPart = new Component<HTMLButtonElement>('button');
    const bPart = new Component<HTMLButtonElement>('button');
    const a = aPart.element;
    const b = bPart.element;
    let ta!: Tooltip;
    let tb!: Tooltip;
    const host = page(
      <div>
        <Tooltip ref={(t: Tooltip) => (ta = t)} target={aPart} text="A" />
        <Tooltip ref={(t: Tooltip) => (tb = t)} target={bPart} text="B" />
      </div>,
    );
    host.controls.add(aPart, bPart);
    await settle();
    over(a);
    vi.advanceTimersByTime(500);
    expect(shown(ta)).toBe(true);
    over(b);
    expect(shown(ta)).toBe(false);
    expect(shown(tb)).toBe(true);

    over(elsewhere(host));
    vi.advanceTimersByTime(150);
    expect(shown(tb)).toBe(false);
    vi.advanceTimersByTime(100);
    over(a);
    expect(shown(ta)).toBe(true);

    over(elsewhere(host));
    vi.advanceTimersByTime(150 + Tooltip.skipDelay);
    over(b);
    expect(shown(tb)).toBe(false);
    vi.advanceTimersByTime(500);
    expect(shown(tb)).toBe(true);

    ta.open();
    expect(shown(tb)).toBe(false);
  });

  it('showOn: focus ignores the pointer; manual shows only programmatically; touch never shows it', async () => {
    const s = reactive({ showOn: 'focus' as 'focus' | 'manual' | 'hover-focus' });
    const targetPart = new Component<HTMLButtonElement>('button');
    const target = targetPart.element;
    let tip!: Tooltip;
    const host = page(<Tooltip ref={(t: Tooltip) => (tip = t)} target={targetPart} text="Tip" showOn={() => s.showOn} />);
    host.controls.add(targetPart);
    await settle();
    over(target);
    vi.advanceTimersByTime(1000);
    expect(shown(tip)).toBe(false);
    key('Tab');
    target.focus();
    expect(shown(tip)).toBe(true);
    target.blur();

    s.showOn = 'manual';
    await settle();
    target.focus();
    expect(shown(tip)).toBe(false);
    tip.open();
    expect(shown(tip)).toBe(true);
    over(elsewhere(host));
    vi.advanceTimersByTime(1000);
    expect(shown(tip)).toBe(true);
    tip.close();

    s.showOn = 'hover-focus';
    await settle();
    over(elsewhere(host), 'touch');
    over(target, 'touch');
    vi.advanceTimersByTime(1000);
    expect(shown(tip)).toBe(false);
  });

  it('delay and hideDelay are its own', async () => {
    const targetPart = new Component<HTMLButtonElement>('button');
    const target = targetPart.element;
    let tip!: Tooltip;
    const host = page(<Tooltip ref={(t: Tooltip) => (tip = t)} target={targetPart} text="Tip" delay={100} hideDelay={0} />);
    host.controls.add(targetPart);
    await settle();
    over(target);
    vi.advanceTimersByTime(100);
    expect(shown(tip)).toBe(true);
    over(elsewhere(host));
    vi.advanceTimersByTime(0);
    expect(shown(tip)).toBe(false);
  });

  it('shows any content, made only when first shown', async () => {
    const target = new Component<HTMLButtonElement>('button');
    let tip!: Tooltip;
    const content = new Component<HTMLDivElement>('div');
    content.element.className = 'rich';
    const host = page(
      <Tooltip ref={(t: Tooltip) => (tip = t)} target={target} text="Bold" content={content}>
        <kbd>Ctrl+B</kbd>
      </Tooltip>,
    );
    host.controls.add(target);
    await settle();
    expect(tip.element.querySelector('kbd')!.textContent).toBe('Ctrl+B');
    expect(tip.element.querySelector('.rich')).toBeNull();
    tip.open();
    expect(tip.element.querySelector('.rich')).not.toBeNull();
    expect(tip.element.firstElementChild!.className).toBe('mx-tooltip__text');
  });

  it('goes with a component target when made programmatically', async () => {
    const button = new Button({ text: 'Go' });
    page(button);
    const tip = new Tooltip({ target: button, text: 'Goes' });
    tip.open();
    const el = tip.element;
    expect(button.element.getAttribute('aria-describedby')).toBe(el.id);
    await button.dispose();
    await settle();
    expect(tip.isDisposed).toBe(true);
    expect(el.isConnected).toBe(false);
  });

  it('addTooltip: one for many components, each made on first use, removable', async () => {
    const host = page(new Component<HTMLDivElement>('div'));
    const cells = Array.from({ length: 50 }, (_, i) => {
      const cell = new Component<HTMLSpanElement>('span');
      cell.element.textContent = `Cell ${i}`;
      host.controls.add(cell);
      return cell;
    });
    const removers = cells.map((cell, i) => addTooltip(cell, i === 3 ? { text: 'Third', placement: 'bottom' } : `Tip ${i}`));
    expect(document.querySelectorAll('.mx-tooltip').length).toBe(0);
    over(cells[7].element);
    vi.advanceTimersByTime(500);
    const tips = document.querySelectorAll<HTMLElement>('.mx-tooltip');
    expect(tips.length).toBe(1);
    expect(tips[0].textContent).toBe('Tip 7');
    expect(tips[0]?.isConnected).toBe(true);
    over(cells[3].element);
    expect(document.querySelector<HTMLElement>(`#${cells[3].element.getAttribute('aria-describedby')}`)!.textContent).toBe('Third');

    removers[3]();
    expect(cells[3].element.hasAttribute('aria-describedby')).toBe(false);
    over(elsewhere(host));
    vi.advanceTimersByTime(1000);
    over(cells[3].element);
    vi.advanceTimersByTime(1000);
    expect(document.querySelectorAll('.mx-tooltip:not([hidden])').length).toBe(0);
    for (const remove of removers) remove();
  });

  it('describes the focusable part of a composite target, and keeps other descriptions', async () => {
    // The focusable part is found among the target's components.
    const field = new Component<HTMLDivElement>('div');
    const inputPart = new Component<HTMLInputElement>('input');
    field.controls.add(inputPart);
    const input = inputPart.element;
    input.setAttribute('aria-describedby', 'help');
    let tip!: Tooltip;
    page(<Tooltip ref={(t: Tooltip) => (tip = t)} target={field} text="Your name" />, field);
    await settle();
    tip.open();
    expect(input.getAttribute('aria-describedby')).toBe(`help ${tip.element.id}`);
    tip.close();
    expect(input.getAttribute('aria-describedby')).toBe('help');
  });

  it('closes when the page scrolls', async () => {
    const targetPart = new Component<HTMLButtonElement>('button');
    const target = targetPart.element;
    let tip!: Tooltip;
    const host = page(<Tooltip ref={(t: Tooltip) => (tip = t)} target={targetPart} text="Tip" />);
    host.controls.add(targetPart);
    await settle();
    const at = { top: 100 };
    target.getBoundingClientRect = () => ({ top: at.top, bottom: at.top + 30, left: 10, right: 90, width: 80, height: 30, x: 10, y: at.top, toJSON: () => ({}) });
    tip.open();
    // Scrolls are heard once core tells it is mounted (a timer, fake here); where its target is, in the next round.
    vi.advanceTimersByTime(0);
    await settle();
    measureNow(tip);
    // A scroll that moves the target closes it, once the round sees it moved.
    at.top = 60;
    document.dispatchEvent(new Event('scroll'));
    measureNow(tip);
    expect(shown(tip)).toBe(false);
  });
  it('one shown for focus follows its target through scrolling, and closes if the target ends up off the screen', async () => {
    let save!: Button;
    let tip!: Tooltip;
    page(
      <div>
        <Button ref={(b: Button) => (save = b)} text="Save" />
        <Tooltip ref={(t: Tooltip) => (tip = t)} target={() => save} text="Saves" />
      </div>,
    );
    await settle();
    const at = { top: 100 };
    save.element.getBoundingClientRect = () => ({ top: at.top, bottom: at.top + 30, left: 10, right: 90, width: 80, height: 30, x: 10, y: at.top, toJSON: () => ({}) });
    save.focus();
    expect(shown(tip)).toBe(true);
    // Scrolls are heard once core tells it is mounted (a timer, fake here); each scroll and its end, in the next round.
    vi.advanceTimersByTime(0);
    await settle();
    measureNow(tip);
    document.dispatchEvent(new Event('scroll'));
    measureNow(tip);
    expect(shown(tip)).toBe(true);
    at.top = -500;
    document.dispatchEvent(new Event('scroll'));
    measureNow(tip);
    expect(shown(tip)).toBe(true);
    document.dispatchEvent(new Event('scrollend'));
    measureNow(tip);
    expect(shown(tip)).toBe(false);
  });

  it('a manual one stays through presses and scrolling until code or Escape closes it', async () => {
    const target = new Component<HTMLButtonElement>('button');
    let tip!: Tooltip;
    const host = page(<Tooltip ref={(t: Tooltip) => (tip = t)} target={target} text="Tip" showOn="manual" />);
    host.controls.add(target);
    await settle();
    tip.open();
    press(elsewhere(host));
    document.dispatchEvent(new Event('scroll'));
    expect(shown(tip)).toBe(true);
    key('Escape');
    expect(shown(tip)).toBe(false);
  });

  it('made programmatically, it goes next to its target, never inside a button', () => {
    // A part inside a kit button: the button keeps its parts for itself, so it goes after the button.
    const panel = new Component<HTMLDivElement>('div');
    const button = new Button({ text: 'Save' });
    panel.controls.add(button);
    page(panel);
    const icon = button.controls.items[0];
    expect(icon).toBeDefined();
    const tip = new Tooltip({ target: icon, text: 'Icon' });
    tip.open();
    expect(tip.element.parentElement).toBe(panel.element);
    void tip.dispose();
  });
});
