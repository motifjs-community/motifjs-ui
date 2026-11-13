import { Component } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import type { ReachBottomEventArgs } from './reach-bottom-event-args';
import { ScrollView } from './ScrollView';

const hosts: Component[] = [];

afterEach(async () => {
    vi.restoreAllMocks();
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

/** Gives the box a size and its content a height: jsdom lays nothing out. */
function sized(view: ScrollView, content: number, client = 100) {
    Object.defineProperty(view.element, 'scrollHeight', { configurable: true, get: () => content });
    Object.defineProperty(view.element, 'clientHeight', { configurable: true, get: () => client });
    vi.spyOn(view.pullPanel.element, 'offsetHeight', 'get').mockReturnValue(48);
}

const pointer = (el: EventTarget, type: string, y: number, extra: PointerEventInit = {}) =>
    el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, clientX: 10, clientY: y, button: 0, pointerType: 'mouse', ...extra }));

describe('ScrollView', () => {
    it('is a focusable region with its content inside, the bars as told, and scrolls programmatically', async () => {
        let view!: ScrollView;
        page(
            <ScrollView ref={(v: ScrollView) => (view = v)} label="Orders" showScrollbar="always" direction="both">
                <p>one</p>
                <p>two</p>
            </ScrollView>
        );
        await settle();
        expect(view.element.tabIndex).toBe(0);
        expect(view.element.getAttribute('aria-label')).toBe('Orders');
        expect(view.element.dataset.bars).toBe('always');
        expect(view.element.dataset.direction).toBe('both');
        expect(view.content.element.querySelectorAll('p').length).toBe(2);
        expect(view.pullPanel.element.hidden).toBe(true);
        const to = vi.fn();
        view.element.scrollTo = to;
        // A scroll written through the layer lands a moment later.
        view.scrollTo(120);
        await settle();
        expect(to).toHaveBeenCalledWith({ top: 120, left: undefined, behavior: 'auto' });
        view.scrollTo({ left: 5 }, true);
        await settle();
        expect(to).toHaveBeenLastCalledWith({ top: undefined, left: 5, behavior: 'smooth' });
    });

    it('asks for more near the end, once at a time, and stops when told there is no more', async () => {
        const asked: number[] = [];
        let last: ReachBottomEventArgs | null = null;
        const view = new ScrollView({
            loadOnReachBottom: true,
            reachBottomOffset: 50,
            onReachBottom: e => {
                asked.push(asked.length);
                last = e;
            }
        });
        page(view);
        await settle();
        sized(view, 400);
        view.element.scrollTop = 100;
        view.element.dispatchEvent(new Event('scroll'));
        expect(asked).toEqual([]);
        view.element.scrollTop = 260;
        view.element.dispatchEvent(new Event('scroll'));
        expect(asked).toEqual([0]);
        expect(view.isLoading).toBe(true);
        expect(view.bottomPanel.element.hidden).toBe(false);
        expect(view.bottomText.element.textContent).toBe(enStrings.loading);
        view.element.dispatchEvent(new Event('scroll'));
        expect(asked).toEqual([0]);
        last!.release();
        expect(view.isLoading).toBe(false);
        view.element.dispatchEvent(new Event('scroll'));
        expect(asked).toEqual([0, 1]);
        last!.release(true);
        view.element.dispatchEvent(new Event('scroll'));
        expect(asked).toEqual([0, 1]);
        expect(view.loadMore()).toBe(false);
        sized(view, 800);
        view.update();
        expect(asked).toEqual([0, 1]);
        view.element.scrollTop = 700;
        view.element.dispatchEvent(new Event('scroll'));
        expect(asked).toEqual([0, 1, 2]);
        expect(view.isLoading).toBe(true);
    });

    it('is pulled down from the top: the panel says pull, then release, then refreshes until released', async () => {
        let release: (() => void) | null = null;
        const view = new ScrollView({ pullToRefresh: true, onPullDown: e => (release = e.release) });
        page(view);
        await settle();
        sized(view, 400);
        expect(view.pullPanel.element.hidden).toBe(false);
        expect(view.pullText.element.textContent).toBe(enStrings.scrollPullDown);
        pointer(view.element, 'pointerdown', 10);
        pointer(window, 'pointermove', 40);
        expect(view.element.dataset.pullState).toBe('pull');
        expect(view.content.element.style.translate).toBe('0 15px');
        pointer(window, 'pointermove', 130);
        expect(view.element.dataset.pullState).toBe('release');
        expect(view.pullText.element.textContent).toBe(enStrings.scrollRelease);
        pointer(window, 'pointerup', 130);
        expect(view.isRefreshing).toBe(true);
        expect(view.pullText.element.textContent).toBe(enStrings.scrollRefreshing);
        expect(view.pullSpinner.element.hidden).toBe(false);
        release!();
        expect(view.isRefreshing).toBe(false);
        expect(view.content.element.style.translate).toBe('');
        expect(view.element.dataset.pullState).toBe(undefined);
        // A short pull goes back; a promise ends a refresh started programmatically.
        pointer(view.element, 'pointerdown', 10);
        pointer(window, 'pointermove', 30);
        pointer(window, 'pointerup', 30);
        expect(view.isRefreshing).toBe(false);
        let done!: () => void;
        view.onPullDown(e => (e.promise = new Promise<void>(r => (done = r))));
        view.refresh();
        expect(view.isRefreshing).toBe(true);
        done();
        await settle();
        expect(view.isRefreshing).toBe(false);
        await uiLocale.use('tr');
        expect(view.pullText.element.textContent).not.toBe(enStrings.scrollPullDown);
    });
});
