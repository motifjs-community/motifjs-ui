import { Component } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { ValidationGroup } from '../../parts/validation/ValidationGroup';
import { TextBox } from '../textbox/TextBox';
import { ValidationSummary } from './ValidationSummary';

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

const lines = (s: ValidationSummary) => Array.from(s.element.querySelectorAll<HTMLButtonElement>('.mx-validation-summary__item')).map(b => b.textContent);

describe('ValidationSummary', () => {
    it('stays out of sight until the group is checked, then lists the failed fields; a press on a line focuses the field', async () => {
        const group = new ValidationGroup();
        let s!: ValidationSummary;
        let email!: TextBox;
        const told: string[] = [];
        page(
            <div>
                <ValidationSummary ref={(x: ValidationSummary) => (s = x)} group={group} onItemClick={e => told.push(e.text)} />
                <TextBox label="Name" required validationGroup={group} />
                <TextBox ref={(x: TextBox) => (email = x)} label="E-mail" required validationGroup={group} />
                <TextBox label="Town" validationGroup={group} />
            </div>
        );
        await settle();
        expect(s.element.hasAttribute('data-empty')).toBe(true);
        expect(s.element.getAttribute('aria-live')).toBe('polite');
        expect(s.count).toBe(0);
        await group.validate({ focus: false });
        await settle();
        expect(s.element.hasAttribute('data-empty')).toBe(false);
        expect(s.count).toBe(2);
        expect(lines(s).map(l => l!.split(':')[0])).toEqual(['Name', 'E-mail']);
        expect(lines(s).every(l => l!.includes(': ') && l!.split(': ')[1].length > 0)).toBe(true);
        expect(s.element.querySelector('.mx-validation-summary__header-text')!.textContent).toBe(enStrings.validationSummary);
        s.element.querySelectorAll<HTMLButtonElement>('.mx-validation-summary__item')[1].click();
        expect(email.element.contains(document.activeElement)).toBe(true);
        expect(told.length).toBe(1);
        expect(told[0].startsWith('E-mail:')).toBe(true);
        email.value = 'a@b.c';
        await email.validate();
        await settle();
        expect(lines(s).length).toBe(1);
        expect(s.failed.length).toBe(1);
        group.reset();
        await settle();
        expect(s.element.hasAttribute('data-empty')).toBe(true);
    });

    it('keeps a line, and the focus on it, while other fields change; a line that goes hands focus to its neighbour', async () => {
        const group = new ValidationGroup();
        let s!: ValidationSummary;
        let name!: TextBox;
        let email!: TextBox;
        let town!: TextBox;
        page(
            <div>
                <ValidationSummary ref={(x: ValidationSummary) => (s = x)} group={group} focusOnClick={false} />
                <TextBox ref={(x: TextBox) => (name = x)} label="Name" required validationGroup={group} />
                <TextBox ref={(x: TextBox) => (email = x)} label="E-mail" required validationGroup={group} />
                <TextBox ref={(x: TextBox) => (town = x)} label="Town" required validationGroup={group} />
            </div>
        );
        await settle();
        town.value = 'Ankara';
        await group.validate({ focus: false });
        await settle();
        const items = () => Array.from(s.element.querySelectorAll<HTMLButtonElement>('.mx-validation-summary__item'));
        const emailLine = items()[1];
        emailLine.focus();

        // Another field fails: its line comes in its own place, the focused line is the same element.
        town.value = '';
        await town.validate();
        await settle();
        expect(lines(s).map(l => l!.split(':')[0])).toEqual(['Name', 'E-mail', 'Town']);
        expect(items()[1]).toBe(emailLine);
        expect(document.activeElement).toBe(emailLine);

        // Another field is fixed: its line goes, focus stays.
        name.value = 'Ada';
        await name.validate();
        await settle();
        expect(lines(s).map(l => l!.split(':')[0])).toEqual(['E-mail', 'Town']);
        expect(document.activeElement).toBe(emailLine);

        // The focused field is fixed: the next line takes focus.
        email.value = 'a@b.c';
        await email.validate();
        await settle();
        expect(lines(s).map(l => l!.split(':')[0])).toEqual(['Town']);
        expect(document.activeElement).toBe(items()[0]);
    });

    it('writes a label without its access key marker', async () => {
        const group = new ValidationGroup();
        let s!: ValidationSummary;
        page(
            <div>
                <ValidationSummary ref={(x: ValidationSummary) => (s = x)} group={group} />
                <TextBox label="&Name" required validationGroup={group} />
                <TextBox label="E-&mail" required validationGroup={group} />
                <TextBox label="Q&&A" required validationGroup={group} />
            </div>
        );
        await settle();
        await group.validate({ focus: false });
        await settle();
        expect(lines(s).map(l => l!.split(':')[0])).toEqual(['Name', 'E-mail', 'Q&A']);
    });

    it('its own header, no header, another group, and the texts of the language', async () => {
        const one = new ValidationGroup();
        const two = new ValidationGroup();
        let s!: ValidationSummary;
        page(
            <div>
                <ValidationSummary ref={(x: ValidationSummary) => (s = x)} group={one} header="Check these" />
                <TextBox label="A" required validationGroup={one} />
                <TextBox label="B" required validationGroup={two} />
            </div>
        );
        await settle();
        await one.validate({ focus: false });
        await settle();
        expect(s.element.querySelector('.mx-validation-summary__header-text')!.textContent).toBe('Check these');
        expect(lines(s).map(l => l!.split(':')[0])).toEqual(['A']);
        s.showHeader = false;
        await settle();
        expect(s.element.querySelector('.mx-validation-summary__header')).toBeNull();
        s.group = two;
        await settle();
        expect(s.count).toBe(0);
        await two.validate({ focus: false });
        await settle();
        expect(lines(s).map(l => l!.split(':')[0])).toEqual(['B']);
        s.header = '';
        s.showHeader = true;
        await uiLocale.use('tr');
        await settle();
        expect(s.element.querySelector('.mx-validation-summary__header-text')!.textContent).not.toBe(enStrings.validationSummary);
    });
});
