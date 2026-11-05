import { Gallery } from '@motifx-community/ui';
import { scene } from './scenes';

/** Three panes share the width; next and previous move one pane at a time and stop when the last is in view. */
export default function PerPage() {
    const places = ['Pier', 'Lane', 'Roof', 'Park', 'Bridge', 'Shore', 'Tower'];
    return (
        <Gallery
            class="ga-wide"
            label="Places"
            height={150}
            itemsPerPage={3}
            stretchImages
            items={places.map((place, i) => ({ image: scene(i * 48), alt: `The ${i + 1}. picture of the walk`, text: place }))}
        />
    );
}
