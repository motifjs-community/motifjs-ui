import { reactive } from '@motifx/core';
import { Button, Gallery, Stack } from '@motifx-community/ui';
import { scene } from './scenes';

/** A gallery created programmatically without its own buttons or dots: custom buttons navigate, and `onSlideChanged` reports the position. */
export default function Programmatic() {
    const s = reactive({ at: 0, told: '' });
    const coded = new Gallery({
        label: 'Rooms',
        height: 200,
        showNavButtons: false,
        showIndicator: false,
        swipeEnabled: false,
        items: [
            { key: 'hall', image: scene(20), alt: 'The hall', text: 'Hall' },
            { key: 'study', image: scene(200), alt: 'The study', text: 'Study' },
            { key: 'garden', image: scene(110), alt: 'The garden', text: 'Garden' }
        ],
        onSlideChanged: e => {
            s.at = e.index;
            s.told = `slide ${e.index + 1} of ${coded.count}`;
        }
    });
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <span class="ga-rooms" onConfig={c => c.controls.add(coded)} />
            <Stack orientation="horizontal" wrap align="center">
                <Button text="Previous" variant="outline" enabled={() => s.at > 0} onclick={() => void coded.previous()} />
                <Button text="Next" variant="outline" enabled={() => s.at < 2} onclick={() => void coded.next()} />
                <Button text="Garden" variant="outline" onclick={() => void coded.goTo('garden')} />
                <output class="ga-rooms-told">{() => s.told}</output>
            </Stack>
        </Stack>
    );
}
