import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { TextBox } from '../textbox/TextBox';
import { Wizard } from './Wizard';
import { WizardStep } from './WizardStep';

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
    for (let i = 0; i < 6; i++) await tick();
}

const faces = (w: Wizard) => Array.from(w.element.querySelectorAll<HTMLElement>('.mx-stepper__step'));
const pages = (w: Wizard) => Array.from(w.element.querySelectorAll<HTMLElement>('.mx-wizard__page'));
const next = (w: Wizard) => w.nextButton.element as HTMLButtonElement;
const back = (w: Wizard) => w.previousButton.element as HTMLButtonElement;

describe('Wizard', () => {
    it('shows one page at a time, the steps in the stepper, the buttons named in the kit language', async () => {
        let w!: Wizard;
        page(
            <Wizard ref={(x: Wizard) => (w = x)} lazy={false}>
                <WizardStep title="Account" description="Who you are">
                    <p>one</p>
                </WizardStep>
                <WizardStep title="Address">
                    <p>two</p>
                </WizardStep>
                <WizardStep title="Review">
                    <p>three</p>
                </WizardStep>
            </Wizard>
        );
        await settle();
        expect(faces(w).map(f => f.querySelector('.mx-stepper__label')!.textContent)).toEqual(['Account', 'Address', 'Review']);
        expect(faces(w)[0].querySelector('.mx-stepper__description')!.textContent).toBe('Who you are');
        expect(pages(w).map(p => p.hidden)).toEqual([false, true, true]);
        expect(pages(w)[0].getAttribute('aria-label')).toBe('Account');
        expect(w.nextButton.text).toBe(enStrings.wizardNext);
        expect(w.previousButton.text).toBe(enStrings.wizardPrevious);
        expect(w.previousButton.isEnabled).toBe(false);
        next(w).click();
        await settle();
        expect(w.selectedIndex).toBe(1);
        expect(pages(w).map(p => p.hidden)).toEqual([true, false, true]);
        expect(w.previousButton.isEnabled).toBe(true);
        next(w).click();
        await settle();
        expect(w.nextButton.text).toBe(enStrings.wizardFinish);
        expect(w.isLast).toBe(true);
        await uiLocale.use('tr');
        expect(w.nextButton.text).not.toBe(enStrings.wizardFinish);
        back(w).click();
        await settle();
        expect(w.selectedIndex).toBe(1);
    });

    it('validates the page before moving on: an empty required field keeps the page and marks the step', async () => {
        let w!: Wizard;
        let box!: TextBox;
        page(
            <Wizard ref={(x: Wizard) => (w = x)}>
                <WizardStep title="Account">
                    <TextBox ref={(b: TextBox) => (box = b)} label="E-mail" required />
                </WizardStep>
                <WizardStep title="Done">
                    <p>done</p>
                </WizardStep>
            </Wizard>
        );
        await settle();
        expect(await w.next()).toBe(false);
        expect(w.selectedIndex).toBe(0);
        expect(faces(w)[0].dataset.status).toBe('error');
        expect(document.activeElement).toBe(box.inputElement);
        box.value = 'ada@example.com';
        await settle();
        expect(await w.next()).toBe(true);
        expect(w.selectedIndex).toBe(1);
        expect(faces(w)[0].dataset.status).toBe('done');
        // A press on a completed step goes back without a check; forward goes through the page again.
        faces(w)[0].click();
        await settle();
        expect(w.selectedIndex).toBe(0);
        box.value = '';
        await settle();
        faces(w)[1].click();
        await settle();
        expect(w.selectedIndex).toBe(0);
        expect(faces(w)[0].dataset.status).toBe('error');
    });

    it('is made programmatically with content factories, asks the step and onFinishing, then finishes with every step done', async () => {
        const made: string[] = [];
        const told: string[] = [];
        let allow = false;
        const w = new Wizard({
            steps: [
                { title: 'One', content: () => new Component('p'), validate: () => allow },
                { title: 'Two', content: () => (made.push('two'), new Component('p')) }
            ],
            onFinishing: e => {
                told.push('finishing');
                e.promise = Promise.resolve(true);
            },
            onFinished: () => told.push('finished')
        });
        page(w);
        await settle();
        expect(made).toEqual([]);
        expect(await w.next()).toBe(false);
        expect(w.steps[0].error).toBe(true);
        allow = true;
        expect(await w.next()).toBe(true);
        expect(made).toEqual(['two']);
        expect(w.steps[0].error).toBe(false);
        expect(w.isLast).toBe(true);
        expect(await w.finish()).toBe(true);
        expect(told).toEqual(['finishing', 'finished']);
        expect(w.isFinished).toBe(true);
        expect(faces(w).map(f => f.dataset.status)).toEqual(['done', 'done']);
    });

    it('writes x-model, names steps by key, and takes steps added and removed programmatically', async () => {
        const s = reactive({ at: 'a' as string | number | null });
        let w!: Wizard;
        page(
            <Wizard ref={(x: Wizard) => (w = x)} x-model={() => s.at} linear={false} keepAlive={false}>
                <WizardStep key="a" title="A" content={() => new Component('p')} />
                <WizardStep key="b" title="B" content={() => new Component('p')} />
            </Wizard>
        );
        await settle();
        const c = w.add(new WizardStep({ key: 'c', title: 'C', content: () => new Component('p') }));
        expect(w.steps.length).toBe(3);
        faces(w)[2].click();
        await settle();
        expect(s.at).toBe('c');
        expect(w.currentStep).toBe(c);
        expect(pages(w)[0].querySelector('p')).toBe(null);
        s.at = 'a';
        await settle();
        expect(w.selectedIndex).toBe(0);
        expect(pages(w)[0].querySelector('p')).not.toBe(null);
        w.remove(c);
        expect(w.steps.length).toBe(2);
        expect(faces(w).length).toBe(2);
    });
});
