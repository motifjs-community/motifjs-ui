import { Component, reactive } from '@motifx/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountHost } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { Signature } from './Signature';
import { inkPath, inkSvg } from './signature-draw';
import type { SignatureStroke } from './signature-stroke';

const hosts: Component[] = [];
const tick = () => new Promise(resolve => setTimeout(resolve, 20));

function page(view: Component): Component {
    const host = mountHost(view);
    hosts.push(host);
    return host;
}

const LINE: SignatureStroke = { points: [{ x: 0, y: 0, pressure: 0.5 }, { x: 1, y: 1, pressure: 0.5 }] };
const DOT: SignatureStroke = { points: [{ x: 0.5, y: 0.5, pressure: 0.5 }] };

/** A pad of 200 by 100, as jsdom lays out nothing. */
function sized(signature: Signature) {
    signature.canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100, x: 0, y: 0, toJSON: () => ({}) });
    signature.padSize = { width: 200, height: 100 };
}

function pen(signature: Signature, type: string, x: number, y: number, more: Record<string, unknown> = {}) {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 });
    Object.assign(event, { pointerId: 1, pointerType: 'mouse', pressure: 0, ...more });
    signature.padPart.element.dispatchEvent(event);
}

function sign(signature: Signature, from = 10, to = 90) {
    pen(signature, 'pointerdown', from, 50);
    pen(signature, 'pointermove', (from + to) / 2, 50);
    pen(signature, 'pointermove', to, 50);
    pen(signature, 'pointerup', to, 50);
}

// jsdom has no canvas, and the drawing itself is checked in a real browser.
beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

afterEach(async () => {
    for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
    document.body.innerHTML = '';
    await uiLocale.use('en');
    uiLocale.strings = enStrings;
    vi.restoreAllMocks();
});

describe('Signature', () => {
    it('is empty, says so, and names its buttons in the language of the kit', async () => {
        const pad = new Signature({ label: 'Your signature' });
        page(pad);
        await tick();
        expect(pad.isEmpty).toBe(true);
        expect(pad.placeholderPart.hidden).toBe(false);
        expect(pad.placeholderPart.textContent).toBe(enStrings.signatureHere);
        expect(pad.padPart.element.getAttribute('aria-roledescription')).toBe(enStrings.signatureName);
        expect(pad.padPart.element.getAttribute('aria-description')).toBe(enStrings.signatureEmpty);
        expect(pad.undoButton.hint).toBe(enStrings.signatureUndo);
        expect(pad.clearButton.hint).toBe(enStrings.clear);
        expect(pad.clearButton.enabled).toBe(false);
    });

    it('turns a line drawn with the pointer into a stroke, in shares of the pad', async () => {
        const changed = vi.fn();
        const pad = new Signature({ onValueChanged: changed });
        page(pad);
        await tick();
        sized(pad);
        sign(pad);
        expect(pad.isEmpty).toBe(false);
        expect(pad.value).toHaveLength(1);
        const points = pad.value[0].points;
        expect(points[0]).toMatchObject({ x: 0.05, y: 0.5 });
        expect(points[points.length - 1]).toMatchObject({ x: 0.45, y: 0.5 });
        expect(changed).toHaveBeenCalledTimes(1);
        expect(pad.placeholderPart.hidden).toBe(true);
        expect(pad.undoButton.enabled).toBe(true);
        expect(pad.padPart.element.getAttribute('aria-description')).toBe(enStrings.signatureSigned);
    });

    it('takes a tap as a dot, and drops points too close to the last one', async () => {
        const pad = new Signature();
        page(pad);
        await tick();
        sized(pad);
        pen(pad, 'pointerdown', 50, 50);
        pen(pad, 'pointermove', 50.2, 50.2);
        pen(pad, 'pointerup', 50.2, 50.2);
        expect(pad.value[0].points).toHaveLength(1);
    });

    it('takes the pressure of a pen, and follows the speed otherwise', async () => {
        const pad = new Signature();
        page(pad);
        await tick();
        sized(pad);
        pen(pad, 'pointerdown', 10, 50, { pointerType: 'pen', pressure: 0.8 });
        pen(pad, 'pointermove', 50, 50, { pointerType: 'pen', pressure: 0.2 });
        pen(pad, 'pointerup', 50, 50, { pointerType: 'pen' });
        expect(pad.value[0].points.map(p => p.pressure)).toEqual([0.8, 0.2]);
        sign(pad);
        expect(pad.value[1].points[1].pressure).toBeGreaterThanOrEqual(0);
        expect(pad.value[1].points[1].pressure).toBeLessThanOrEqual(1);
    });

    it('keeps a point inside the pad when the pointer leaves it', async () => {
        const pad = new Signature();
        page(pad);
        await tick();
        sized(pad);
        pen(pad, 'pointerdown', 10, 50);
        pen(pad, 'pointermove', 500, -80);
        pen(pad, 'pointerup', 500, -80);
        expect(pad.value[0].points[1]).toMatchObject({ x: 1, y: 0 });
    });

    it('follows one pointer only', async () => {
        const pad = new Signature();
        page(pad);
        await tick();
        sized(pad);
        pen(pad, 'pointerdown', 10, 50);
        pen(pad, 'pointermove', 90, 50, { pointerId: 2 });
        pen(pad, 'pointerdown', 90, 50, { pointerId: 2 });
        pen(pad, 'pointerup', 90, 50, { pointerId: 2 });
        expect(pad.value).toHaveLength(0);
        pen(pad, 'pointerup', 10, 50);
        expect(pad.value).toHaveLength(1);
    });

    it('never changes the array it was given', async () => {
        const given: readonly SignatureStroke[] = Object.freeze([LINE]);
        const pad = new Signature({ value: given });
        page(pad);
        await tick();
        sized(pad);
        sign(pad);
        expect(given).toHaveLength(1);
        expect(pad.value).toHaveLength(2);
        pad.undo();
        expect(given).toHaveLength(1);
        expect(pad.value).toHaveLength(1);
    });

    it('binds x-model and follows it', async () => {
        const s = reactive({ strokes: [] as readonly SignatureStroke[] });
        let pad!: Signature;
        page(<Signature ref={(x: Signature) => (pad = x)} x-model={() => s.strokes} />);
        await tick();
        sized(pad);
        sign(pad);
        await tick();
        expect(s.strokes).toHaveLength(1);
        s.strokes = [];
        await tick();
        expect(pad.isEmpty).toBe(true);
    });

    it('removes the last stroke and the signature, by the methods and by the keys', async () => {
        const pad = new Signature({ value: [LINE, DOT] });
        page(pad);
        await tick();
        pad.undo();
        expect(pad.value).toEqual([LINE]);
        pad.padPart.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true, cancelable: true }));
        expect(pad.isEmpty).toBe(true);
        expect(pad.placeholderPart.hidden).toBe(false);
        expect(pad.undoButton.enabled).toBe(false);
        pad.value = [LINE];
        await tick();
        expect(pad.placeholderPart.hidden).toBe(true);
        expect(pad.clearButton.enabled).toBe(true);
        pad.padPart.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true }));
        expect(pad.isEmpty).toBe(true);
    });

    it('takes no strokes while read-only or disabled, and hides its buttons when read-only', async () => {
        const pad = new Signature({ readOnly: true, value: [LINE] });
        page(pad);
        await tick();
        sized(pad);
        sign(pad);
        pad.clear();
        expect(pad.value).toEqual([LINE]);
        expect(pad.actions.element.hidden).toBe(true);
        pad.readOnly = false;
        pad.enabled = false;
        await tick();
        sign(pad);
        pad.undo();
        expect(pad.value).toEqual([LINE]);
    });

    it('fails when required and empty, and passes once signed', async () => {
        const pad = new Signature({ required: true });
        page(pad);
        await tick();
        sized(pad);
        expect(await pad.validate()).toBe(false);
        sign(pad);
        expect(await pad.validate()).toBe(true);
    });

    it('has switches for its buttons, its line and its text', async () => {
        const pad = new Signature({ showClear: false, showUndo: false, showGuide: false, placeholder: '' });
        page(pad);
        await tick();
        expect(pad.actions.element.hidden).toBe(true);
        expect(pad.guidePart.element.hidden).toBe(true);
        expect(pad.placeholderPart.hidden).toBe(true);
    });

    it('reports the begin and the end of a stroke', async () => {
        const began = vi.fn();
        const ended = vi.fn();
        const pad = new Signature({ onStrokeBegan: began, onStrokeEnded: ended });
        page(pad);
        await tick();
        sized(pad);
        sign(pad);
        expect(began).toHaveBeenCalledTimes(1);
        expect(ended).toHaveBeenCalledTimes(1);
        expect(ended.mock.calls[0][0].stroke).toBe(pad.value[0]);
    });

    it('writes an SVG in the size asked for, with black ink unless told otherwise', async () => {
        const pad = new Signature({ value: [LINE] });
        page(pad);
        await tick();
        sized(pad);
        const svg = pad.toSVG({ width: 400, height: 200, background: '#ffffff' });
        expect(svg).toContain('width="400"');
        expect(svg).toContain('fill="#000000"');
        expect(svg).toContain('<rect');
    });

    it('keeps the shape of the pad in an image', async () => {
        const pad = new Signature();
        page(pad);
        await tick();
        sized(pad);
        expect(pad.exportLook({ width: 600 })).toMatchObject({ width: 600, height: 300, minWidth: 3, maxWidth: 9 });
    });

    it('draws a stroke as a closed shape, and a dot as a circle', () => {
        const look = { width: 100, height: 100, minWidth: 1, maxWidth: 3, color: '#000' };
        expect(inkPath([LINE], look).endsWith('Z')).toBe(true);
        expect(inkPath([DOT], look)).toContain('a');
        expect(inkPath([], look)).toBe('');
        expect(inkSvg([], look, null)).not.toContain('<rect');
    });
});
