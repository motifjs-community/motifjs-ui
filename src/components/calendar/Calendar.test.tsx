import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import { Calendar } from './Calendar';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  await uiLocale.use('en');
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle() {
  for (let i = 0; i < 6; i++) await tick();
}

function press(key: string, init: KeyboardEventInit = {}) {
  const target = document.activeElement!;
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));
}

const cells = (c: Calendar) => Array.from(c.element.querySelectorAll<HTMLElement>('tbody .mx-calendar__cell'));
const title = (c: Calendar) => c.element.querySelector('.mx-calendar__title')!.textContent;
const focusedText = () => (document.activeElement as HTMLElement).textContent;
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d);

describe('Calendar', () => {
  it('shows the month of its value in the locale, weeks starting where the locale starts them', async () => {
    let c!: Calendar;
    page(<Calendar ref={(x: Calendar) => (c = x)} value={day(2026, 10, 25)} locale="tr-TR" />);
    await settle();
    expect(title(c)).toBe('Ekim 2026');
    const heads = Array.from(c.element.querySelectorAll('thead th')).map((th) => th.textContent);
    expect(heads[0]).toBe('Pzt');
    expect(c.element.querySelector('[role="grid"]')).not.toBeNull();
    const selected = c.element.querySelector('[aria-selected="true"]')!;
    expect(selected.textContent).toBe('25');
    expect(selected.getAttribute('tabindex')).toBe('0');
    expect(selected.getAttribute('aria-label')).toContain('25 Ekim 2026');
    expect(cells(c).filter((td) => td.tabIndex === 0).length).toBe(1);

    c.locale = 'en-US';
    expect(title(c)).toBe('October 2026');
    expect(c.element.querySelector('thead th')!.textContent).toBe('Sun');
  });

  it('moves with the keyboard and chooses with Enter, two-way with x-model', async () => {
    const s = reactive({ day: day(2026, 10, 25) as Date | null });
    let c!: Calendar;
    page(<Calendar ref={(x: Calendar) => (c = x)} x-model={() => s.day} locale="en-GB" />);
    await settle();
    c.focus();
    press('ArrowRight');
    expect(focusedText()).toBe('26');
    press('ArrowDown');
    expect(focusedText()).toBe('2');
    expect(title(c)).toBe('November 2026');
    press('PageUp');
    expect(title(c)).toBe('October 2026');
    press('Home');
    expect(c.focusedDate.getDay()).toBe(1);
    press('End');
    expect(c.focusedDate.getDay()).toBe(0);
    press('PageDown', { shiftKey: true });
    expect(title(c)).toBe('October 2027');
    press('Enter');
    expect(s.day!.getFullYear()).toBe(2027);

    s.day = day(2025, 1, 15);
    await settle();
    expect(title(c)).toBe('January 2025');
  });

  it('keeps out what cannot be chosen', async () => {
    let c!: Calendar;
    page(
      <Calendar
        ref={(x: Calendar) => (c = x)}
        value={day(2026, 10, 15)}
        min={day(2026, 10, 10)}
        max={day(2026, 10, 20)}
        disabledDates={(d: Date) => d.getDay() === 0}
        locale="en-GB"
      />,
    );
    await settle();
    const nine = cells(c).find((td) => td.textContent === '9' && !td.hasAttribute('data-outside'))!;
    expect(nine.getAttribute('aria-disabled')).toBe('true');
    nine.click();
    expect(c.value!.getDate()).toBe(15);
    const sunday = cells(c).find((td) => td.textContent === '18')!;
    expect(sunday.getAttribute('aria-disabled')).toBe('true');
    expect(c.element.querySelector<HTMLButtonElement>('.mx-calendar__previous')!.disabled).toBe(true);
    expect(c.element.querySelector<HTMLButtonElement>('.mx-calendar__next')!.disabled).toBe(true);
    cells(c).find((td) => td.textContent === '16')!.click();
    expect(c.value!.getDate()).toBe(16);
  });

  it('zooms out to months and years, and back in', async () => {
    let c!: Calendar;
    page(<Calendar ref={(x: Calendar) => (c = x)} value={day(2026, 10, 25)} locale="en-GB" />);
    await settle();
    c.element.querySelector<HTMLButtonElement>('.mx-calendar__title')!.click();
    expect(c.currentView).toBe('year');
    expect(title(c)).toBe('2026');
    expect(cells(c).length).toBe(12);
    c.element.querySelector<HTMLButtonElement>('.mx-calendar__title')!.click();
    expect(c.currentView).toBe('decade');
    expect(title(c)).toBe('2020 – 2029');
    cells(c).find((td) => td.textContent === '2030')!.click();
    expect(c.currentView).toBe('year');
    expect(title(c)).toBe('2030');
    cells(c)[2].click();
    expect(c.currentView).toBe('month');
    expect(title(c)).toBe('March 2030');
    expect(c.value!.getFullYear()).toBe(2026);
  });

  it('picks a month when its smallest view is the year', async () => {
    let c!: Calendar;
    page(<Calendar ref={(x: Calendar) => (c = x)} minView="year" locale="en-GB" />);
    await settle();
    expect(c.currentView).toBe('year');
    c.focus();
    press('ArrowRight');
    press('Enter');
    expect(c.value!.getDate()).toBe(1);
    expect(c.currentView).toBe('year');
  });

  it('names its buttons from uiLocale, shows week numbers and a Today button', async () => {
    let c!: Calendar;
    page(<Calendar ref={(x: Calendar) => (c = x)} value={day(2026, 1, 5)} showWeekNumbers showTodayButton locale="en-GB" />);
    await settle();
    expect(c.element.querySelector('.mx-calendar__previous')!.getAttribute('aria-label')).toBe('Previous month');
    expect(c.element.querySelector('tbody .mx-calendar__week')!.textContent).toBe('1');
    await uiLocale.use('tr');
    await settle();
    expect(c.element.querySelector('.mx-calendar__next')!.getAttribute('aria-label')).toBe('Sonraki ay');
    const today = c.element.querySelector<HTMLButtonElement>('.mx-calendar__today')!;
    expect(today.textContent).toBe('Bugün');
    today.click();
    expect(c.value!.toDateString()).toBe(new Date().toDateString());
  });

  it('keeps its cells when the month, the value or the focus changes; another view builds its own', async () => {
    const c = new Calendar({ locale: 'en-GB', value: day(2024, 2, 10), showOtherMonths: false });
    page(c);
    await settle();
    const all = () => Array.from(c.element.querySelectorAll<HTMLElement>('tbody td'));
    const before = all();
    expect(before.length).toBe(42);
    c.value = day(2024, 2, 12);
    c.goTo(day(2024, 5, 1));
    await settle();
    expect(title(c)).toBe('May 2024');
    expect(all()).toEqual(before);
    expect(cells(c).map((x) => x.textContent)[0]).toBe('1');
    expect(cells(c).length).toBe(31);
    c.currentView = 'year';
    await settle();
    expect(all().length).toBe(12);
    const months = all();
    c.goTo(day(2030, 1, 1));
    await settle();
    expect(all()).toEqual(months);
  });

  it('works programmatically', async () => {
    const c = new Calendar({ locale: 'en-GB' });
    page(c);
    c.value = day(2024, 2, 29);
    expect(title(c)).toBe('February 2024');
    c.currentView = 'decade';
    expect(title(c)).toBe('2020 – 2029');
    c.goTo(day(1999, 12, 31));
    expect(title(c)).toBe('1990 – 1999');
  });

  it('reads functions over plain data again on reState, and writes a day set programmatically to x-model', async () => {
    const first = day(2026, 3, 10);
    const plain = { value: first, min: null as Date | null };
    const s = reactive({ day: null as Date | null });
    let c!: Calendar;
    let m!: Calendar;
    const host = page(
      <Calendar ref={(x: Calendar) => (c = x)} locale="en-GB" value={() => plain.value} min={() => plain.min} />,
      <Calendar ref={(x: Calendar) => (m = x)} locale="en-GB" x-model={() => s.day} />,
    );
    await settle();
    Object.assign(plain, { value: day(2026, 5, 20), min: day(2026, 5, 1) });
    await settle();
    expect(title(c)).toBe('March 2026');
    host.reState();
    expect(title(c)).toBe('May 2026');
    expect(c.min?.getTime()).toBe(day(2026, 5, 1).getTime());
    expect(first.getTime()).toBe(day(2026, 3, 10).getTime());
    m.value = day(2026, 7, 4);
    expect(s.day?.getTime()).toBe(day(2026, 7, 4).getTime());
    s.day = day(2026, 8, 1);
    await settle();
    expect(title(m)).toBe('August 2026');
  });
});
