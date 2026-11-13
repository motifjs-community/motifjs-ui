import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { dayStart } from '../../parts/dates/day-start';
import { DateRangeBox } from './DateRangeBox';

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

const day = (y: number, m: number, d: number) => new Date(y, m, d);

function typeDigits(input: HTMLInputElement, digits: string) {
    input.focus();
    input.value = '';
    for (const ch of digits) {
        input.value += ch;
        input.dispatchEvent(new InputEvent('input', { bubbles: true, data: ch, inputType: 'insertText' }));
    }
}

const cell = (box: DateRangeBox, which: number, date: Date) => box.rangeParts.calendars[which].element.querySelector<HTMLElement>(`[data-date="${+dayStart(date)}"]`)!;

describe('DateRangeBox', () => {
    it('is a field with two masked inputs named by their side; a value draws both, x-model takes them back', async () => {
        const s = reactive({ stay: [day(2026, 2, 10), day(2026, 2, 14)] as [Date | null, Date | null] });
        let box!: DateRangeBox;
        page(<DateRangeBox ref={(b: DateRangeBox) => (box = b)} label="Stay" locale="en-US" x-model={() => s.stay} clearButton />);
        await settle();
        expect(box.inputPart.element.getAttribute('aria-label')).toBe(`Stay, ${enStrings.rangeStart}`);
        expect(box.endInputPart.element.getAttribute('aria-label')).toBe(`Stay, ${enStrings.rangeEnd}`);
        expect(box.inputPart.element.value).toBe('03/10/2026');
        expect(box.endInputPart.element.value).toBe('03/14/2026');
        expect(box.startDate).toEqual(day(2026, 2, 10));
        box.clear();
        await settle();
        expect(s.stay).toEqual([null, null]);
        expect(box.inputPart.element.value).toBe('');
        await uiLocale.use('tr');
        expect(box.endInputPart.element.getAttribute('aria-label')).not.toContain(enStrings.rangeEnd);
    });

    it('takes dates typed on either side, and validates the order and the span', async () => {
        const box = new DateRangeBox({ locale: 'en-US', minDays: 2, maxDays: 10 });
        page(box);
        await settle();
        typeDigits(box.inputPart.element, '03102026');
        expect(box.value).toEqual([day(2026, 2, 10), null]);
        typeDigits(box.endInputPart.element, '03112026');
        expect(box.value).toEqual([day(2026, 2, 10), day(2026, 2, 11)]);
        expect(await box.validate()).toBe(false);
        expect(box.validationMessage).toBe('Choose at least 2 days.');
        typeDigits(box.endInputPart.element, '03302026');
        expect(await box.validate()).toBe(false);
        expect(box.validationMessage).toBe('Choose at most 10 days.');
        typeDigits(box.endInputPart.element, '03052026');
        expect(await box.validate()).toBe(false);
        expect(box.validationMessage).toBe(enStrings.rangeOrder);
        typeDigits(box.endInputPart.element, '03152026');
        expect(await box.validate()).toBe(true);
    });

    it('picks the start then the end on two calendars side by side, marks the range, and closes', async () => {
        const box = new DateRangeBox({ locale: 'en-US', value: [day(2026, 2, 1), null] });
        page(box);
        await settle();
        expect(box.open()).toBe(true);
        const calendars = box.rangeParts.calendars;
        expect(calendars.length).toBe(2);
        expect(calendars[0].focusedDate.getMonth()).toBe(2);
        expect(calendars[1].focusedDate.getMonth()).toBe(3);
        // A start is there: the next pick is the end.
        cell(box, 1, day(2026, 3, 5)).click();
        await settle();
        expect(box.value).toEqual([day(2026, 2, 1), day(2026, 3, 5)]);
        expect(box.opened).toBe(false);
        box.open();
        await settle();
        expect(cell(box, 0, day(2026, 2, 1)).dataset.range).toBe('start');
        expect(cell(box, 0, day(2026, 2, 20)).dataset.range).toBe('in');
        expect(cell(box, 1, day(2026, 3, 5)).dataset.range).toBe('end');
        // A full range: a pick starts a new one; an earlier second pick becomes the start.
        cell(box, 0, day(2026, 2, 10)).click();
        await settle();
        expect(box.value).toEqual([day(2026, 2, 10), null]);
        expect(box.opened).toBe(true);
        cell(box, 0, day(2026, 2, 4)).click();
        await settle();
        expect(box.value).toEqual([day(2026, 2, 4), day(2026, 2, 10)]);
    });

    it('offers the kit presets and takes one, and limits the end to the span while the end is being picked', async () => {
        const box = new DateRangeBox({ presets: true, maxDays: 3, closeOnComplete: false });
        page(box);
        await settle();
        box.open();
        await settle();
        const list = box.rangeParts.presetList!;
        expect(list.element.querySelectorAll('[role="option"]').length).toBe(6);
        list.element.querySelector<HTMLElement>('[role="option"]')!.click();
        await settle();
        const today = dayStart(new Date());
        expect(box.value).toEqual([today, today]);
        box.value = [day(2026, 2, 10), null];
        box.open();
        await settle();
        box.rangeParts.stage = 1;
        box.syncPicker();
        expect(box.rangeParts.calendars[0].canChoose(day(2026, 2, 12))).toBe(true);
        expect(box.rangeParts.calendars[0].canChoose(day(2026, 2, 20))).toBe(false);
    });
});
