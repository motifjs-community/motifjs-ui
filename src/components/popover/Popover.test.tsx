import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { Button } from '../button/Button';
import { Popover } from './Popover';

const hosts: Component[] = [];

afterEach(async () => {
    vi.useRealTimers();
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

const key = (el: Element, key: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

describe('Popover', () => {
    it('leaves an iframe out of the focus on open, so that Escape still closes it', async () => {
        const s = reactive({ open: false });
        let button!: Button;
        let pop!: Popover;
        page(
            <div>
                <Button ref={(b: Button) => (button = b)} text="Help" />
                <Popover ref={(p: Popover) => (pop = p)} target={() => button} title="Help" x-model={() => s.open}>
                    <iframe srcdoc="<p>Help</p>" />
                </Popover>
            </div>,
        );
        await settle();
        (button.element as HTMLButtonElement).click();
        await settle();
        expect(s.open).toBe(true);
        expect(document.activeElement?.localName).not.toBe('iframe');
        key(pop.element, 'Escape');
        await settle();
        expect(s.open).toBe(false);
    });

    it('opens on a press on its target, takes focus, closes on Escape and gives focus back; x-model follows', async () => {
        const s = reactive({ open: false });
        let button!: Button;
        let pop!: Popover;
        page(
            <div>
                <Button ref={(b: Button) => (button = b)} text="Details" />
                <Popover ref={(p: Popover) => (pop = p)} target={() => button} title="Order 42" x-model={() => s.open}>
                    <button type="button" class="inside">Track</button>
                </Popover>
            </div>
        );
        await settle();
        const trigger = button.element as HTMLButtonElement;
        expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
        expect(trigger.getAttribute('aria-expanded')).toBe('false');
        expect(trigger.getAttribute('aria-controls')).toBe(pop.element.id);
        expect(pop.element.isConnected).toBe(false);
        trigger.focus();
        trigger.click();
        await settle();
        expect(pop.isOpen).toBe(true);
        expect(s.open).toBe(true);
        expect(pop.element.isConnected).toBe(true);
        expect(pop.element.getAttribute('role')).toBe('dialog');
        expect(pop.element.getAttribute('aria-labelledby')).toBe(pop.titlePart.element.id);
        expect(pop.titlePart.element.textContent).toBe('Order 42');
        expect(trigger.getAttribute('aria-expanded')).toBe('true');
        expect(document.activeElement).toBe(pop.element.querySelector('.inside'));
        key(pop.element, 'Escape');
        await settle();
        expect(pop.isOpen).toBe(false);
        expect(s.open).toBe(false);
        expect(document.activeElement).toBe(trigger);
        s.open = true;
        await settle();
        expect(pop.isOpen).toBe(true);
        trigger.click();
        await settle();
        expect(pop.isOpen).toBe(false);
    });

    it('opens programmatically next to a component, closes on a press outside unless told not to, and on its close button', async () => {
        const anchor = new Component<HTMLButtonElement>('button');
        const otherPart = new Component<HTMLInputElement>('input');
        page(anchor, otherPart);
        const other = otherPart.element;
        const reasons: string[] = [];
        const pop = new Popover({ target: anchor, label: 'Help', showClose: true, onClosed: reason => reasons.push(String(reason)) });
        hosts.push(pop);
        expect(pop.open()).toBe(true);
        expect(pop.element.isConnected).toBe(true);
        expect(pop.element.getAttribute('aria-label')).toBe('Help');
        expect(pop.closeButton.hint).toBe(enStrings.close);
        other.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        expect(pop.isOpen).toBe(false);
        pop.closeOnOutside = false;
        pop.open();
        other.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        expect(pop.isOpen).toBe(true);
        (pop.closeButton.element as HTMLButtonElement).click();
        await settle();
        expect(pop.isOpen).toBe(false);
        expect(reasons).toEqual(['outside', 'close-button']);
    });

    it('opens while the pointer rests on the target, stays while the pointer is on it, and goes when both are left', async () => {
        vi.useFakeTimers();
        const anchorPart = new Component<HTMLSpanElement>('span');
        page(anchorPart);
        const anchor = anchorPart.element;
        const pop = new Popover({ target: anchorPart, showOn: 'hover', delay: 100, hideDelay: 50, content: new Component('p') });
        hosts.push(pop);
        expect(anchor.getAttribute('aria-haspopup')).toBe(null);
        anchor.dispatchEvent(new PointerEvent('pointerenter'));
        expect(pop.isOpen).toBe(false);
        await vi.advanceTimersByTimeAsync(100);
        expect(pop.isOpen).toBe(true);
        expect(pop.element.querySelector('p')).not.toBe(null);
        anchor.dispatchEvent(new PointerEvent('pointerleave'));
        pop.element.dispatchEvent(new PointerEvent('pointerenter'));
        await vi.advanceTimersByTimeAsync(60);
        expect(pop.isOpen).toBe(true);
        pop.element.dispatchEvent(new PointerEvent('pointerleave'));
        await vi.advanceTimersByTimeAsync(60);
        expect(pop.isOpen).toBe(false);
        anchor.dispatchEvent(new FocusEvent('focusin'));
        expect(pop.isOpen).toBe(true);
    });

    it('may be kept open by onClosing, and closes when disabled', async () => {
        const anchor = new Component<HTMLButtonElement>('button');
        page(anchor);
        let keep = true;
        const pop = new Popover({ target: anchor, onClosing: e => (e.cancel = keep) });
        hosts.push(pop);
        pop.open();
        expect(pop.close('code')).toBe(false);
        expect(pop.isOpen).toBe(true);
        keep = false;
        pop.enabled = false;
        expect(pop.isOpen).toBe(false);
        expect(pop.open()).toBe(false);
    });
});
