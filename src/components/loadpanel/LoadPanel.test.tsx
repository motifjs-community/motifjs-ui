import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { pageBody } from '../../core/page-layer';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { LoadPanel } from './LoadPanel';

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

describe('LoadPanel', () => {
    it('covers a container: busy, inert under it, focus waits on the panel and comes back; x-model follows', async () => {
        const s = reactive({ loading: false });
        let box!: Component<HTMLDivElement>;
        let panel!: LoadPanel;
        page(
            <div>
                <div ref={(c: Component<HTMLDivElement>) => (box = c)}>
                    <input class="field" />
                    <button type="button">Save</button>
                </div>
                <LoadPanel ref={(p: LoadPanel) => (panel = p)} target={() => box} message="Loading orders" x-model={() => s.loading} />
            </div>
        );
        await settle();
        const field = box.element.querySelector<HTMLInputElement>('.field')!;
        field.focus();
        s.loading = true;
        await settle();
        expect(panel.isShown).toBe(true);
        expect(panel.element.parentElement).toBe(box.element);
        expect(box.element.getAttribute('aria-busy')).toBe('true');
        expect(box.element.hasAttribute('data-mx-covered')).toBe(true);
        expect(field.hasAttribute('inert')).toBe(true);
        expect(panel.messagePart.element.textContent).toBe('Loading orders');
        expect(document.activeElement).toBe(panel.element);
        panel.hide();
        expect(s.loading).toBe(false);
        expect(panel.element?.isConnected ?? false).toBe(false);
        expect(box.element.hasAttribute('aria-busy')).toBe(false);
        expect(field.hasAttribute('inert')).toBe(false);
        expect(document.activeElement).toBe(field);
    });

    it('waits for its delay, and a hide before that shows nothing', async () => {
        vi.useFakeTimers();
        const box = new Component<HTMLDivElement>('div');
        page(box);
        const panel = new LoadPanel({ target: box, delay: 200 });
        hosts.push(panel);
        expect(panel.show()).toBe(true);
        expect(panel.value).toBe(true);
        await vi.advanceTimersByTimeAsync(100);
        expect(panel.isShown).toBe(false);
        panel.hide();
        await vi.advanceTimersByTimeAsync(200);
        expect(panel.isShown).toBe(false);
        panel.show();
        await vi.advanceTimersByTimeAsync(200);
        expect(panel.isShown).toBe(true);
        panel.hide();
    });

    it('covers the page without a target, and Cancel tells and hides', async () => {
        // What it makes inert are the page's components around it.
        const appPart = new Component<HTMLElement>('main');
        const buttonPart = new Component<HTMLButtonElement>('button');
        appPart.controls.add(buttonPart);
        pageBody(document).controls.add(appPart);
        hosts.push(appPart);
        const app = appPart.element;
        const button = buttonPart.element;
        button.focus();
        const told: string[] = [];
        const panel = new LoadPanel({ cancelable: true, onCancel: () => told.push('cancel'), onHidden: () => told.push('hidden'), onShown: () => told.push('shown') });
        hosts.push(panel);
        panel.show();
        expect(panel.element.hasAttribute('data-page')).toBe(true);
        expect(panel.element.parentElement).toBe(document.body);
        expect(app.hasAttribute('inert')).toBe(true);
        // With no app running, the app's root in the page is the body's component: it is busy while the panel shows.
        expect(document.body.getAttribute('aria-busy')).toBe('true');
        expect(panel.cancelButton.text).toBe(enStrings.cancel);
        expect(document.activeElement).toBe(panel.cancelButton.element);
        panel.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
        expect(panel.isShown).toBe(false);
        expect(app.hasAttribute('inert')).toBe(false);
        expect(document.body.hasAttribute('aria-busy')).toBe(false);
        expect(document.activeElement).toBe(button);
        expect(told).toEqual(['shown', 'cancel', 'hidden']);
    });

    it('says its texts in the kit language, hides the indicator or the pane when told, and closes on an outside press when allowed', async () => {
        const box = new Component<HTMLDivElement>('div');
        page(box);
        const panel = new LoadPanel({ target: box, showIndicator: false, showPane: false, closeOnOutside: true });
        hosts.push(panel);
        panel.show();
        expect(panel.messagePart.element.textContent).toBe(enStrings.loading);
        expect(panel.spinner.element?.isConnected ?? false).toBe(false);
        expect(panel.element.hasAttribute('data-pane')).toBe(false);
        expect(panel.element.hasAttribute('data-shade')).toBe(true);
        await uiLocale.use('tr');
        expect(panel.messagePart.element.textContent).not.toBe(enStrings.loading);
        panel.element.click();
        expect(panel.isShown).toBe(false);
    });
});
