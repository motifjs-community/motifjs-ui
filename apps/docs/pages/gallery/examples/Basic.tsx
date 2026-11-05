import { Gallery } from '@motifx-community/ui';
import { scene } from './scenes';

/** Five pictures with captions: the buttons at the sides, the dots under them, a swipe or the arrow keys move them. */
export default function Basic() {
    return (
        <Gallery
            class="ga-trip"
            label="A trip"
            height={300}
            items={[
                { image: scene(205), alt: 'Boats in a harbour', text: 'Harbour', description: 'Early morning' },
                { image: scene(30), alt: 'Market stalls', text: 'Market' },
                { image: scene(120), alt: 'Hills under cloud', text: 'Hills', description: 'After the rain' },
                { image: scene(280), alt: 'The town at night', text: 'Night' },
                { image: scene(345), alt: 'The way home', text: 'Home', description: 'Last day' }
            ]}
        />
    );
}
