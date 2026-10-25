import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, trStrings, uiLocale } from '../../core/ui-locale';
import { DateBox } from './DateBox';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  uiLocale.strings = enStrings;
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle() {
  for (let i = 0; i < 6; i++) await tick();
}

/** Types digits the way the browser reports them to a masked input. */
function typeKeys(b: DateBox, text: string) {
  const el = b.inputElement;
  for (const data of text) {
    el.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertText', data }));
  }
}

function press(el: Element, key: string, init: KeyboardEventInit = {}) {
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  el.dispatchEvent(e);
  return e.defaultPrevented;
}

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d);
const popupShown = (b: DateBox) => !!b.element.querySelector('.mx-popup') && !b.element.querySelector<HTMLElement>('.mx-popup')!.hidden;

describe('DateBox', () => {
  it('types a date in the locale’s order and writes it back through x-model', async () => {
    const s = reactive({ day: null as Date | null });
    let b!: DateBox;
    page(<DateBox ref={(x: DateBox) => (b = x)} label="&Day" locale="tr-TR" x-model={() => s.day} />);
    await settle();
    b.inputElement.focus();
    expect(b.inputElement.value).toBe('__.__.____');
    b.inputElement.setSelectionRange(0, 0);
    typeKeys(b, '2510');
    expect(s.day).toBeNull();
    expect(b.unfinished).toBe(true);
    typeKeys(b, '2026');
    expect(s.day).toEqual(day(2026, 10, 25));
    expect(b.inputElement.value).toBe('25.10.2026');

    s.day = day(2027, 1, 2);
    await settle();
    expect(b.inputElement.value).toBe('02.01.2027');
  });

  it('refuses a date that does not exist and says so when checked', async () => {
    let b!: DateBox;
    page(<DateBox ref={(x: DateBox) => (b = x)} locale="tr-TR" value={day(2026, 1, 1)} />);
    await settle();
    b.inputElement.focus();
    b.inputElement.select();
    typeKeys(b, '31022026');
    expect(b.value).toEqual(day(2026, 1, 1));
    expect(await b.validate()).toBe(false);
    expect(b.validationMessage).toBe('Enter a valid date.');
    uiLocale.strings = trStrings;
    await settle();
    expect(b.validationMessage).toBe('Geçerli bir tarih girin.');
  });

  it('checks min, max and disabled dates', async () => {
    let b!: DateBox;
    page(<DateBox ref={(x: DateBox) => (b = x)} locale="tr-TR" min={day(2026, 1, 1)} max={day(2026, 12, 31)} disabledDates={(d: Date) => d.getDay() === 0} />);
    await settle();
    b.value = day(2025, 6, 1);
    expect(await b.validate()).toBe(false);
    b.value = day(2026, 10, 25);
    expect(await b.validate()).toBe(false);
    b.value = day(2026, 10, 26);
    expect(await b.validate()).toBe(true);
  });

  it('opens a calendar from its button or Alt+Down and takes the day chosen there', async () => {
    const s = reactive({ day: day(2026, 10, 25) as Date | null });
    let b!: DateBox;
    page(<DateBox ref={(x: DateBox) => (b = x)} locale="en-GB" x-model={() => s.day} showTodayButton />);
    await settle();
    const toggle = b.element.querySelector<HTMLButtonElement>('.mx-date-box__toggle')!;
    expect(toggle.getAttribute('aria-label')).toBe('Choose date');
    expect(toggle.getAttribute('aria-haspopup')).toBe('dialog');
    toggle.click();
    expect(popupShown(b)).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(b.element.querySelector('.mx-popup')!.getAttribute('role')).toBe('dialog');
    const focused = document.activeElement as HTMLElement;
    expect(focused.textContent).toBe('25');
    press(focused, 'ArrowRight');
    press(document.activeElement!, 'Enter');
    expect(s.day).toEqual(day(2026, 10, 26));
    expect(popupShown(b)).toBe(false);
    expect(document.activeElement).toBe(b.inputElement);

    press(b.inputElement, 'ArrowDown', { altKey: true });
    expect(popupShown(b)).toBe(true);
    expect(b.element.querySelector('.mx-calendar__today')).not.toBeNull();
  });

  it('picks a time from a list, and both with type="datetime"', async () => {
    const s = reactive({ at: new Date(2026, 9, 25, 10, 0) as Date | null });
    let b!: DateBox;
    page(<DateBox ref={(x: DateBox) => (b = x)} type="datetime" locale="tr-TR" timeStep={15} x-model={() => s.at} />);
    await settle();
    expect(b.inputElement.value).toBe('25.10.2026 10:00');
    b.open();
    const times = b.element.querySelector<HTMLElement>('.mx-date-box__times')!;
    const options = Array.from(times.querySelectorAll<HTMLElement>('[role="option"]'));
    expect(options.length).toBe(96);
    expect(times.querySelector('[data-active]')!.textContent).toBe('10:00');
    options.find((o) => o.textContent === '14:45')!.click();
    expect(s.at).toEqual(new Date(2026, 9, 25, 14, 45));
    b.open();
    const cell = Array.from(b.element.querySelectorAll<HTMLElement>('.mx-calendar__cell')).find((td) => td.textContent === '27' && !td.hasAttribute('data-outside'))!;
    cell.click();
    expect(s.at).toEqual(new Date(2026, 9, 27, 14, 45));
  });

  it('shows the value in a display format while it is not edited', async () => {
    let b!: DateBox;
    page(<DateBox ref={(x: DateBox) => (b = x)} locale="en-GB" displayFormat={{ dateStyle: 'long' }} value={day(2026, 10, 25)} />);
    await settle();
    expect(b.inputElement.value).toBe('25 October 2026');
    b.inputElement.focus();
    expect(b.inputElement.value).toBe('25/10/2026');
    b.inputElement.blur();
    expect(b.inputElement.value).toBe('25 October 2026');
  });

  it('empties with its clear button or Escape, and works from code', async () => {
    const b = new DateBox({ locale: 'tr-TR', clearButton: true, type: 'time' });
    page(b);
    b.value = new Date(2026, 0, 1, 8, 30);
    expect(b.inputElement.value).toBe('08:30');
    expect(b.element.querySelector('.mx-date-box__toggle')!.getAttribute('aria-label')).toBe('Choose time');
    expect(press(b.inputElement, 'Escape')).toBe(true);
    expect(b.value).toBeNull();
    b.value = new Date(2026, 0, 1, 9, 0);
    b.element.querySelector<HTMLButtonElement>('.mx-date-box__clear')!.click();
    expect(b.value).toBeNull();
    b.showPickerButton = false;
    expect(b.element.querySelector('.mx-date-box__toggle')).toBeNull();
  });
});
