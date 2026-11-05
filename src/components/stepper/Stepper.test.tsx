import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { Stepper } from './Stepper';

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

const faces = (s: Stepper) => Array.from(s.element.querySelectorAll<HTMLElement>('.mx-stepper__step'));
const key = (el: HTMLElement, key: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

describe('Stepper', () => {
    it('draws the steps with their numbers, the completed ones and the current one, from JSX and from code', async () => {
        let jsx!: Stepper;
        page(<Stepper ref={(s: Stepper) => (jsx = s)} items={['Account', { text: 'Address', description: 'Where to send it' }, { text: 'Review', optional: true }]} value={1} />);
        const coded = new Stepper({ items: ['One', 'Two'] });
        page(coded);
        await settle();
        expect(jsx.element.tagName).toBe('NAV');
        expect(jsx.element.getAttribute('aria-label')).toBe(enStrings.steps);
        const [a, b, c] = faces(jsx);
        expect([a, b, c].map(f => f.dataset.status)).toEqual(['done', 'current', 'pending']);
        expect(b.getAttribute('aria-current')).toBe('step');
        expect(a.querySelector<HTMLElement>('.mx-stepper__mark')!.hidden).toBe(false);
        expect(a.querySelector<HTMLElement>('.mx-stepper__number')!.hidden).toBe(true);
        expect(c.querySelector('.mx-stepper__number')!.textContent).toBe('3');
        expect(b.querySelector('.mx-stepper__description')!.textContent).toBe('Where to send it');
        expect(c.querySelector('.mx-stepper__note')!.textContent).toBe(enStrings.stepOptional);
        expect(a.textContent).toContain(enStrings.stepDone);
        expect(jsx.element.querySelectorAll('.mx-stepper__line:not([hidden])').length).toBe(2);
        expect(coded.selectedIndex).toBe(0);
        expect(faces(coded)[0].dataset.status).toBe('current');
        await uiLocale.use('tr');
        expect(jsx.element.getAttribute('aria-label')).not.toBe(enStrings.steps);
    });

    it('in linear order a press reaches the completed steps and the next one, not beyond; a press writes x-model', async () => {
        const s = reactive({ step: 0 as string | number | null });
        let st!: Stepper;
        page(<Stepper ref={(x: Stepper) => (st = x)} items={['One', 'Two', 'Three', 'Four']} x-model={() => s.step} />);
        await settle();
        const [one, two, three] = faces(st);
        expect(two.getAttribute('aria-disabled')).toBe(null);
        expect(three.getAttribute('aria-disabled')).toBe('true');
        three.click();
        await settle();
        expect(s.step).toBe(0);
        two.click();
        await settle();
        expect(s.step).toBe(1);
        expect(st.statusOf(0)).toBe('done');
        expect(faces(st)[2].getAttribute('aria-disabled')).toBe(null);
        one.click();
        await settle();
        expect(s.step).toBe(0);
        st.linear = false;
        expect(faces(st)[3].getAttribute('aria-disabled')).toBe(null);
    });

    it('names steps by key, skips optional steps in linear order, and tells a change that may be refused or waited for', async () => {
        const seen: string[] = [];
        let waitFor: Promise<boolean> | null = null;
        const stepper = new Stepper({
            items: [{ key: 'a', text: 'A' }, { key: 'b', text: 'B', optional: true }, { key: 'c', text: 'C' }],
            value: 'a',
            onStepChanging: e => {
                seen.push(`${e.from}>${e.to}`);
                if (waitFor) e.promise = waitFor;
                else if (e.to === 2) e.cancel = true;
            }
        });
        page(stepper);
        await settle();
        expect(stepper.selectedIndex).toBe(0);
        expect(stepper.canReach(2)).toBe(true);
        faces(stepper)[2].click();
        await settle();
        expect(stepper.value).toBe('a');
        waitFor = Promise.resolve(true);
        expect(await stepper.goTo('c')).toBe(true);
        expect(stepper.value).toBe('c');
        waitFor = Promise.resolve(false);
        expect(await stepper.previous()).toBe(false);
        expect(stepper.value).toBe('c');
        expect(seen).toEqual(['0>2', '0>2', '2>1']);
    });

    it('is one Tab stop; the arrow keys move between the steps that can be reached', async () => {
        let st!: Stepper;
        page(<Stepper ref={(x: Stepper) => (st = x)} items={['One', 'Two', 'Three']} value={1} linear={false} />);
        await settle();
        const [one, two, three] = faces(st) as HTMLButtonElement[];
        expect([one, two, three].map(f => f.tabIndex)).toEqual([-1, 0, -1]);
        two.focus();
        key(two, 'ArrowRight');
        expect(document.activeElement).toBe(three);
        key(three, 'ArrowRight');
        expect(document.activeElement).toBe(one);
        key(one, 'End');
        expect(document.activeElement).toBe(three);
        expect([one, two, three].map(f => f.tabIndex)).toEqual([-1, -1, 0]);
    });

    it('shows the way only when it is not clickable, and follows items given as functions', async () => {
        const s = reactive({ second: 'Two', error: false });
        const stepper = new Stepper({ clickable: false, items: ['One', { text: () => s.second, status: () => (s.error ? 'error' : null) }] });
        page(stepper);
        await settle();
        expect(faces(stepper)[0].tagName).toBe('DIV');
        s.second = 'Zwei';
        s.error = true;
        await settle();
        expect(faces(stepper)[1].querySelector('.mx-stepper__label')!.textContent).toBe('Zwei');
        expect(faces(stepper)[1].dataset.status).toBe('error');
        expect(faces(stepper)[1].querySelector<HTMLElement>('.mx-stepper__mark')!.hidden).toBe(false);
        stepper.clickable = true;
        expect(faces(stepper)[0].tagName).toBe('BUTTON');
    });

    it('goes forward and back from code, over disabled steps, and tells the change', async () => {
        const changes: string[] = [];
        const stepper = new Stepper({ items: ['One', { text: 'Two', enabled: false }, 'Three'], onStepChanged: e => changes.push(`${e.previous}>${e.index}:${e.byUser}`) });
        page(stepper);
        await settle();
        expect(stepper.canGoNext).toBe(true);
        expect(await stepper.next()).toBe(true);
        expect(stepper.selectedIndex).toBe(2);
        expect(stepper.canGoNext).toBe(false);
        expect(await stepper.previous()).toBe(true);
        expect(stepper.selectedIndex).toBe(0);
        expect(changes).toEqual(['0>2:false', '2>0:false']);
    });
});
