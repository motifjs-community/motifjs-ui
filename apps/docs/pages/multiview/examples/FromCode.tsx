import { reactive } from '@motifx/core';
import { Button, MultiView, Stack, View } from '@motifx-community/ui';

/** A multi-view made from code around the ends: views added, inserted and removed, the sight moved with its methods. */
export default function FromCode() {
    const s = reactive({ told: '', count: 0 });
    let number = 0;
    const page = () => {
        number++;
        const n = number;
        return new View({ title: `Note ${n}`, content: () => <p class="mv-coded-note">{`Note ${n}`}</p> });
    };
    const coded = new MultiView({
        label: 'Notes',
        loop: true,
        onSelectionChanged: e => (s.told = `in sight: ${e.view?.title ?? 'none'}${e.byUser ? ', by a swipe' : ''}`)
    });
    const count = () => (s.count = coded.count);
    coded.add(page());
    coded.add(page());
    count();
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Stack orientation="horizontal" wrap align="center">
                <Button text="Previous" variant="outline" onclick={() => void coded.previous()} />
                <Button text="Next" variant="outline" onclick={() => void coded.next()} />
                <Button
                    text="Add a note"
                    variant="outline"
                    onclick={() => {
                        void coded.goTo(coded.add(page()));
                        count();
                    }}
                />
                <Button
                    text="Remove this note"
                    variant="outline"
                    enabled={() => s.count > 1}
                    onclick={() => {
                        if (coded.selectedView) coded.remove(coded.selectedView);
                        count();
                    }}
                />
                <output class="mv-coded-told">{() => `${s.count} notes${s.told ? `, ${s.told}` : ''}`}</output>
            </Stack>
            <span class="mv-coded" onConfig={c => c.controls.add(coded)} />
        </Stack>
    );
}
