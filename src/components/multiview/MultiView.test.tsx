import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { MultiView } from './MultiView';
import { View } from './View';

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

const hidden = (m: MultiView) => m.views.map(v => v.element.getAttribute('aria-hidden'));

describe('MultiView', () => {
    it('places the JSX views side by side, the first in sight and the others hidden; lazy content is built on first sight', async () => {
        let m!: MultiView;
        page(
            <MultiView ref={(x: MultiView) => (m = x)}>
                <View title="One">
                    <span class="a" />
                </View>
                <View title="Two" content={() => new Component('b')} />
                <View key="three" />
            </MultiView>
        );
        await settle();
        expect(m.element.getAttribute('role')).toBe('group');
        expect(m.element.getAttribute('aria-label')).toBe(enStrings.multiView);
        expect(m.count).toBe(3);
        expect(m.views.map(v => v.element.parentElement!.className)).toEqual(['mx-multi-view__track', 'mx-multi-view__track', 'mx-multi-view__track']);
        expect(hidden(m)).toEqual([null, 'true', 'true']);
        expect(m.views.map(v => v.element.getAttribute('aria-label'))).toEqual(['One', 'Two', 'Page 3 of 3']);
        expect(m.views[0].element.querySelector('span.a')).not.toBe(null);
        expect(m.views[1].contentBuilt).toBe(false);
        expect(await m.goTo(1)).toBe(true);
        await settle();
        expect(m.views[1].contentBuilt).toBe(true);
        expect(m.views[1].element.querySelector('b')).not.toBe(null);
        expect(hidden(m)).toEqual(['true', null, 'true']);
        expect(m.selectedView).toBe(m.views[1]);
        expect(m.views[1].isSelected).toBe(true);
        expect(await m.goTo('three')).toBe(true);
        expect(m.selectedIndex).toBe(2);
        await uiLocale.use('tr');
        expect(m.element.getAttribute('aria-label')).not.toBe(enStrings.multiView);
    });

    it('next and previous skip hidden and disabled views, go around in a loop, write x-model and tell the events', async () => {
        const s = reactive({ page: 0 as string | number | null });
        let m!: MultiView;
        const told: string[] = [];
        page(
            <MultiView ref={(x: MultiView) => (m = x)} x-model={() => s.page} onSelectionChanged={e => told.push(`${e.previous}>${e.index}`)}>
                <View title="A" />
                <View title="B" visible={false} />
                <View title="C" enabled={false} />
                <View title="D" />
            </MultiView>
        );
        await settle();
        expect(await m.next()).toBe(true);
        await settle();
        expect(m.selectedIndex).toBe(3);
        expect(s.page).toBe(3);
        expect(await m.next()).toBe(false);
        m.loop = true;
        expect(await m.next()).toBe(true);
        expect(m.selectedIndex).toBe(0);
        expect(await m.previous()).toBe(true);
        expect(m.selectedIndex).toBe(3);
        expect(await m.goTo(1)).toBe(false);
        expect(await m.goTo(2)).toBe(false);
        s.page = 0;
        await settle();
        expect(m.selectedIndex).toBe(0);
        expect(told).toEqual(['0>3', '3>0', '0>3', '3>0']);
        expect(m.views[1].element.getAttribute('aria-label')).toBe('B');
        expect(m.views[3].element.getAttribute('aria-label')).toBe('D');
    });

    it('onSelecting may refuse; keepAlive false drops made content out of sight; lazy false builds every view at once', async () => {
        let m!: MultiView;
        let made = 0;
        page(
            <MultiView ref={(x: MultiView) => (m = x)} keepAlive={false} onSelecting={e => (e.cancel = e.to === 2)}>
                <View title="A" />
                <View
                    title="B"
                    content={() => {
                        made++;
                        return new Component('i');
                    }}
                />
                <View title="C" />
            </MultiView>
        );
        await settle();
        expect(await m.goTo(2)).toBe(false);
        expect(m.selectedIndex).toBe(0);
        await m.goTo(1);
        await settle();
        expect(made).toBe(1);
        await m.goTo(0);
        await settle();
        expect(m.views[1].element.querySelector('i')).toBe(null);
        await m.goTo(1);
        await settle();
        expect(made).toBe(2);
        let eager!: MultiView;
        page(
            <MultiView ref={(x: MultiView) => (eager = x)} lazy={false}>
                <View title="A" content={() => new Component('u')} />
                <View title="B" content={() => new Component('u')} />
            </MultiView>
        );
        await settle();
        expect(eager.views.map(v => v.contentBuilt)).toEqual([true, true]);
    });

    it('views are added, inserted and removed programmatically; removing the one in sight moves to a neighbour', async () => {
        const m = new MultiView({ loop: false });
        page(m);
        await settle();
        expect(m.count).toBe(0);
        expect(m.selectedIndex).toBe(-1);
        const a = m.add(new View({ title: 'A' }));
        const c = m.add(new View({ title: 'C' }));
        const b = m.insert(1, new View({ title: 'B' }));
        await settle();
        expect(m.views).toEqual([a, b, c]);
        expect(m.views.map(v => v.element.getAttribute('aria-label'))).toEqual(['A', 'B', 'C']);
        expect(Array.from(m.element.querySelectorAll('.mx-multi-view__view')).map(el => el.getAttribute('aria-label'))).toEqual(['A', 'B', 'C']);
        expect(m.selectedIndex).toBe(0);
        await b.select();
        expect(m.selectedIndex).toBe(1);
        expect(m.remove(b)).toBe(true);
        await settle();
        expect(b.isDisposed).toBe(true);
        expect(m.views).toEqual([a, c]);
        expect(m.selectedView).toBe(c);
        await a.dispose();
        await settle();
        expect(m.views).toEqual([c]);
        expect(m.selectedIndex).toBe(0);
        expect(hidden(m)).toEqual([null]);
    });
});
