import { reactive } from '@motifx/core';
import { Gallery, Stack } from '@motifx-community/ui';
import { scene } from './scenes';

/** A slideshow around the ends: it moves on every 2.5 s, waits while the pointer or focus is on it, and its button pauses it. */
export default function Slideshow() {
    const s = reactive({ shown: 0 as string | number | null, told: '' });
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Gallery
                class="ga-show"
                label="Slideshow"
                height={240}
                loop
                stretchImages
                slideInterval={2500}
                x-model={() => s.shown}
                onSlideChanged={e => (s.told = e.byUser ? 'moved by you' : 'moved by the slideshow')}
                items={[
                    { image: scene(190), alt: 'Dawn over the sea', text: 'Dawn' },
                    { image: scene(50), alt: 'Noon in the square', text: 'Noon' },
                    { image: scene(260), alt: 'Dusk on the hill', text: 'Dusk' }
                ]}
            />
            <output class="ga-show-told">{() => `in view: ${s.shown}${s.told ? `, ${s.told}` : ''}`}</output>
        </Stack>
    );
}
