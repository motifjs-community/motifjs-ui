import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { OtpInput } from './OtpInput';

const hosts: Component[] = [];
const tick = () => new Promise(resolve => setTimeout(resolve, 20));

function page(view: Component): Component {
    const host = mountHost(view);
    hosts.push(host);
    return host;
}

/** What the browser does when the user types: the text of the input changes, then `input` occurs. */
function type(otp: OtpInput, value: string) {
    const input = otp.inputPart.element;
    input.value = value;
    input.setSelectionRange(value.length, value.length);
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));
}

const chars = (otp: OtpInput) => otp.cells.map(cell => cell.charPart.element.textContent);

afterEach(async () => {
    for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
    document.body.innerHTML = '';
    await uiLocale.use('en');
    uiLocale.strings = enStrings;
});

describe('OtpInput', () => {
    it('is one input with a box for each character, and asks the phone for the code', async () => {
        const otp = new OtpInput({ label: 'Code' });
        page(otp);
        await tick();
        expect(otp.cells).toHaveLength(6);
        expect(otp.inputPart.element.autocomplete).toBe('one-time-code');
        expect(otp.inputPart.element.inputMode).toBe('numeric');
        expect(otp.element.querySelectorAll('input')).toHaveLength(1);
        expect(otp.element.querySelector('.mx-otp-input__cells')!.getAttribute('aria-hidden')).toBe('true');
        expect(otp.element.querySelector('label')!.htmlFor).toBe(otp.inputPart.element.id);
    });

    it('takes a value given before its length is known', async () => {
        const otp = new OtpInput({ length: 8, value: '12345678' });
        page(otp);
        await tick();
        expect(otp.value).toBe('12345678');
        expect(chars(otp).join('')).toBe('12345678');
        expect(otp.isComplete).toBe(true);
    });

    it('leaves out what it does not accept, and what does not fit', async () => {
        const otp = new OtpInput({ length: 4 });
        page(otp);
        await tick();
        type(otp, '1a2-3 456');
        expect(otp.value).toBe('1234');
        expect(otp.inputPart.element.value).toBe('1234');
    });

    it('takes a pasted code with a separator whole: nothing limits the input before the characters are left out', async () => {
        const otp = new OtpInput({ length: 6 });
        page(otp);
        await tick();
        expect(otp.inputPart.element.maxLength).toBe(-1);
        type(otp, '123-456');
        expect(otp.value).toBe('123456');
    });

    it('accepts letters, a pattern of its own, and turns them into capitals', async () => {
        const otp = new OtpInput({ length: 4, charset: 'alphanumeric', uppercase: true });
        page(otp);
        await tick();
        type(otp, 'a1-b2');
        expect(otp.value).toBe('A1B2');
        expect(otp.inputPart.element.inputMode).toBe('text');
        otp.pattern = /[ab]/i;
        await tick();
        type(otp, 'xaybz');
        expect(otp.value).toBe('AB');
    });

    it('binds x-model and follows it', async () => {
        const s = reactive({ code: '12' });
        let otp!: OtpInput;
        page(<OtpInput ref={(x: OtpInput) => (otp = x)} length={4} x-model={() => s.code} />);
        await tick();
        expect(chars(otp).slice(0, 2)).toEqual(['1', '2']);
        type(otp, '123');
        await tick();
        expect(s.code).toBe('123');
        s.code = '';
        await tick();
        expect(otp.inputPart.element.value).toBe('');
        expect(chars(otp).join('')).toBe('');
    });

    it('tells a complete code once, and again after it changed', async () => {
        const done = vi.fn();
        const otp = new OtpInput({ length: 3, onCompleted: done });
        page(otp);
        await tick();
        type(otp, '12');
        expect(done).not.toHaveBeenCalled();
        type(otp, '123');
        type(otp, '123');
        expect(done).toHaveBeenCalledTimes(1);
        expect(done.mock.calls[0][0].value).toBe('123');
        type(otp, '12');
        type(otp, '123');
        expect(done).toHaveBeenCalledTimes(2);
    });

    it('draws a mark for each character when masked, and keeps the value', async () => {
        const otp = new OtpInput({ length: 3, value: '12', masked: true });
        page(otp);
        await tick();
        expect(chars(otp)).toEqual(['•', '•', '']);
        expect(otp.value).toBe('12');
        otp.maskCharacter = '*';
        otp.masked = true;
        await tick();
        expect(chars(otp)[0]).toBe('*');
    });

    it('shows the placeholder in empty boxes and separates groups', async () => {
        const otp = new OtpInput({ length: 6, value: '1', placeholder: '0', groupSize: 3 });
        page(otp);
        await tick();
        expect(chars(otp)).toEqual(['1', '0', '0', '0', '0', '0']);
        const seps = otp.element.querySelectorAll('.mx-otp-input__separator');
        expect(seps).toHaveLength(1);
        expect(seps[0].textContent).toBe('–');
    });

    it('marks the box of the caret, and clears the mark on leaving', async () => {
        const otp = new OtpInput({ length: 4, value: '12' });
        page(otp);
        await tick();
        otp.inputPart.element.focus();
        await tick();
        expect(otp.cells[2].boxPart.element.hasAttribute('data-active')).toBe(true);
        expect(otp.cells[2].caretPart.element.hidden).toBe(false);
        otp.inputPart.element.blur();
        await tick();
        expect(otp.cells[2].boxPart.element.hasAttribute('data-active')).toBe(false);
    });

    it('keeps the caret in the last box when the code is complete', async () => {
        const otp = new OtpInput({ length: 3, value: '123' });
        page(otp);
        await tick();
        otp.inputPart.element.focus();
        await tick();
        expect(otp.cells[2].boxPart.element.hasAttribute('data-active')).toBe(true);
        expect(otp.cells[2].caretPart.element.hidden).toBe(true);
    });

    /** What the browser does for a character typed or pasted at the caret: `beforeinput`, the text, then `input`. */
    function insert(otp: OtpInput, at: number, data: string, inputType = 'insertText') {
        const input = otp.inputPart.element;
        input.setSelectionRange(at, at);
        input.dispatchEvent(new InputEvent('beforeinput', { inputType, data, bubbles: true }));
        input.value = input.value.slice(0, at) + data + input.value.slice(at);
        input.setSelectionRange(at + data.length, at + data.length);
        input.dispatchEvent(new InputEvent('input', { inputType, data, bubbles: true }));
    }

    it('overwrites a filled box: the character typed takes the place of the one after the caret', async () => {
        const otp = new OtpInput({ length: 4, value: '1234' });
        page(otp);
        await tick();
        insert(otp, 1, '9');
        await tick();
        expect(otp.value).toBe('1934');
        expect([otp.inputPart.element.selectionStart, otp.inputPart.element.selectionEnd]).toEqual([2, 2]);
    });

    it('does not overwrite anything at the end, or for a paste', async () => {
        const otp = new OtpInput({ length: 4, value: '12' });
        page(otp);
        await tick();
        insert(otp, 2, '9');
        await tick();
        expect(otp.value).toBe('129');
        insert(otp, 0, '8', 'insertFromPaste');
        await tick();
        expect(otp.value).toBe('8129');
    });

    it('fails while incomplete, in the language of the kit, and passes when complete', async () => {
        const otp = new OtpInput({ length: 4, value: '12' });
        page(otp);
        await tick();
        expect(await otp.validate()).toBe(false);
        expect(otp.validationMessage).toBe('Enter all 4 characters.');
        expect(otp.element.hasAttribute('data-invalid')).toBe(true);
        type(otp, '1234');
        await tick();
        expect(await otp.validate()).toBe(true);
    });

    it('lets an empty field pass unless it is required', async () => {
        const otp = new OtpInput({ length: 4 });
        page(otp);
        await tick();
        expect(await otp.validate()).toBe(true);
        otp.required = true;
        await tick();
        expect(await otp.validate()).toBe(false);
    });

    it('draws again when its length changes, and cuts the value to fit', async () => {
        const otp = new OtpInput({ length: 4, value: '1234' });
        page(otp);
        await tick();
        const [first, second] = otp.cells.map(cell => cell.boxPart.element);
        otp.length = 2;
        await tick();
        expect(otp.cells).toHaveLength(2);
        expect(otp.value).toBe('12');
        expect(otp.element.querySelectorAll('.mx-otp-input__cell')).toHaveLength(2);
        // The boxes that stay are the same; a group size puts a separator between them in place.
        otp.groupSize = 1;
        otp.length = 3;
        await tick();
        const boxes = [...otp.element.querySelectorAll('.mx-otp-input__cell')];
        expect(boxes.slice(0, 2)).toEqual([first, second]);
        expect(boxes[0]).toBe(first);
        expect(boxes[1]).toBe(second);
        expect(otp.element.querySelectorAll('.mx-otp-input__separator')).toHaveLength(2);
        expect([...otp.element.querySelector('.mx-otp-input__cells')!.children].map(e => e.className)).toEqual([
            'mx-otp-input__cell', 'mx-otp-input__separator', 'mx-otp-input__cell', 'mx-otp-input__separator', 'mx-otp-input__cell',
        ]);
        otp.groupSize = 0;
        await tick();
        expect(otp.element.querySelectorAll('.mx-otp-input__separator')).toHaveLength(0);
        expect(otp.element.querySelector('.mx-otp-input__cell')).toBe(first);
    });

    it('is read-only and disabled through the input', async () => {
        const otp = new OtpInput({ length: 4, readOnly: true });
        page(otp);
        await tick();
        expect(otp.inputPart.element.readOnly).toBe(true);
        otp.enabled = false;
        await tick();
        expect(otp.element.hasAttribute('data-disabled')).toBe(true);
    });

    it('clears and puts the caret in the first box', async () => {
        const otp = new OtpInput({ length: 4, value: '12' });
        page(otp);
        await tick();
        otp.clear();
        await tick();
        expect(otp.value).toBe('');
        expect(document.activeElement).toBe(otp.inputPart.element);
        expect(otp.cells[0].boxPart.element.hasAttribute('data-active')).toBe(true);
    });
});
