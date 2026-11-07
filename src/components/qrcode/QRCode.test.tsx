import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import { Barcode } from '../barcode/Barcode';
import { QRCode } from './QRCode';

const hosts: Component[] = [];
const tick = () => new Promise(resolve => setTimeout(resolve, 20));

function page(view: Component): Component {
    const host = mountHost(view);
    hosts.push(host);
    return host;
}

afterEach(async () => {
    for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
    document.body.innerHTML = '';
    await uiLocale.use('en');
});

describe('QRCode', () => {
    it('draws the code with its quiet zone, as an image named by its text', async () => {
        const code = new QRCode({ value: 'HELLO WORLD', level: 'Q' });
        page(code);
        await tick();
        expect(code.modules).toBe(21);
        expect(code.element.getAttribute('role')).toBe('img');
        expect(code.element.getAttribute('aria-label')).toBe('QR code: HELLO WORLD');
        expect(code.svg.getAttribute('viewBox')).toBe('0 0 29 29');
        expect(code.path.getAttribute('d')).toMatch(/^M4 4h7v1h-7z/);
    });

    it('follows a reactive value and the margin', async () => {
        const s = reactive({ text: 'a', margin: 4 });
        const code = new QRCode({ value: () => s.text, margin: () => s.margin });
        page(code);
        await tick();
        const first = code.path.getAttribute('d');
        s.text = 'b';
        await tick();
        expect(code.path.getAttribute('d')).not.toBe(first);
        s.margin = 0;
        await tick();
        expect(code.svg.getAttribute('viewBox')).toBe('0 0 21 21');
    });

    it('draws nothing for an empty text, and no error', async () => {
        const failed = vi.fn();
        const code = new QRCode({ onEncodeFailed: failed });
        page(code);
        await tick();
        expect(code.svg.hasAttribute('hidden')).toBe(true);
        expect(failed).not.toHaveBeenCalled();
        expect(code.isInvalid).toBe(false);
        expect(code.toSVG()).toBe('');
    });

    it('says when a text is too long, and recovers', async () => {
        const failed = vi.fn();
        const code = new QRCode({ value: 'a'.repeat(4000), onEncodeFailed: failed });
        code.onEncodeFailed(failed);
        page(code);
        await tick();
        expect(code.isInvalid).toBe(true);
        expect(code.modules).toBe(0);
        code.value = 'ok';
        await tick();
        expect(code.isInvalid).toBe(false);
        expect(code.modules).toBeGreaterThan(0);
        code.value = 'a'.repeat(4000);
        await tick();
        expect(failed).toHaveBeenCalled();
    });

    it('clears a place for the logo, and shows it there', async () => {
        const plain = new QRCode({ value: 'https://ui.motifjs.com', level: 'H' });
        const marked = new QRCode({ value: 'https://ui.motifjs.com', level: 'H', logo: 'a.svg', logoSize: 0.3 });
        page(plain);
        page(marked);
        await tick();
        const count = (c: QRCode) => c.path.getAttribute('d')!.split('M').length;
        expect(count(marked)).toBeLessThan(count(plain));
        expect(marked.logoImage.getAttribute('src')).toBe('a.svg');
        expect(marked.logoImage.hidden).toBe(false);
        expect(plain.logoImage.hidden).toBe(true);
    });

    it('keeps the logo small enough for a code to be read', async () => {
        const code = new QRCode({ value: 'a', logo: 'a.svg', logoSize: 0.9 });
        page(code);
        await tick();
        expect(code.logoSize).toBe(0.3);
    });

    it('takes the name it is given, and writes an SVG in black on white', async () => {
        const code = new QRCode({ value: 'a', label: 'Our page' });
        page(code);
        await tick();
        expect(code.element.getAttribute('aria-label')).toBe('Our page');
        const svg = code.toSVG({ size: 290 });
        expect(svg).toContain('width="290"');
        expect(svg).toContain('fill="#000000"');
        expect(svg).toContain('fill="#ffffff"');
    });

    it('follows the language of the kit', async () => {
        const code = new QRCode({ value: 'a' });
        page(code);
        await tick();
        await uiLocale.use('tr');
        await tick();
        expect(code.element.getAttribute('aria-label')).toBe('QR kod: a');
    });
});

describe('Barcode', () => {
    it('draws its bars and text, as an image named by its value', async () => {
        const code = new Barcode({ value: 'ABC-1234' });
        page(code);
        await tick();
        expect(code.codeText).toBe('ABC-1234');
        expect(code.textPart.element.textContent).toBe('ABC-1234');
        expect(code.element.getAttribute('aria-label')).toBe('Barcode: ABC-1234');
        expect(code.path.getAttribute('d')).toMatch(/^M10 0h/);
    });

    it('shows the check digit it worked out, and names the code with it', async () => {
        const code = new Barcode({ format: 'ean13', value: '400638133393' });
        page(code);
        await tick();
        expect(code.codeText).toBe('4006381333931');
        expect(code.element.getAttribute('aria-label')).toBe('Barcode: 4006381333931');
    });

    it('sizes the bars from moduleWidth and height', async () => {
        const code = new Barcode({ value: '12', moduleWidth: 3, height: 90, margin: 0 });
        page(code);
        await tick();
        const width = Number(code.svg.getAttribute('viewBox')!.split(' ')[2]);
        const svg = code.svg as unknown as HTMLElement;
        expect(svg.style.inlineSize).toBe(`${width * 3}px`);
        expect(svg.style.blockSize).toBe('90px');
    });

    it('says when a format cannot hold a value, and recovers', async () => {
        const failed = vi.fn();
        const code = new Barcode({ format: 'ean13', value: 'abc', onEncodeFailed: failed });
        code.onEncodeFailed(failed);
        page(code);
        await tick();
        expect(code.isInvalid).toBe(true);
        expect(code.textPart.element.hidden).toBe(true);
        expect(code.svg.hasAttribute('hidden')).toBe(true);
        code.format = 'code128';
        await tick();
        expect(code.isInvalid).toBe(false);
        expect(code.codeText).toBe('abc');
        code.format = 'itf';
        await tick();
        expect(failed).toHaveBeenCalled();
    });

    it('hides its text when asked, and leaves it out of an image', async () => {
        const code = new Barcode({ value: '12', showText: false });
        page(code);
        await tick();
        expect(code.textPart.element.hidden).toBe(true);
        expect(code.toSVG()).not.toContain('<text');
    });

    it('writes its text into an SVG, safely', async () => {
        const code = new Barcode({ value: 'a<b&c' });
        page(code);
        await tick();
        const svg = code.toSVG({ color: '#112233' });
        expect(svg).toContain('a&lt;b&amp;c</text>');
        expect(svg).toContain('fill="#112233"');
    });

    it('follows a reactive value', async () => {
        const s = reactive({ value: 'A' });
        const code = new Barcode({ value: () => s.value });
        page(code);
        await tick();
        s.value = 'B';
        await tick();
        expect(code.codeText).toBe('B');
    });
});
