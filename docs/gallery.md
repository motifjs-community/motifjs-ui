# Gallery

> Display · @motifx-community/ui 0.1.0-beta.3

Panes side by side, one in view or several, moved by the buttons at the sides, the dots under them, a swipe or the arrow keys; a slideshow when told. A pane is an image with a caption, or any content.

## Import

```tsx
import { Gallery } from '@motifx-community/ui';
```

## Pictures with captions

`items` are the panes: an address, or an item with `image`, `alt`, `text` and `description`. The pane in view is `value` (a pane’s `key`, else its index), `x-model` binds it two-way. Drag a pane with a finger or the mouse, press an arrow or a dot, or use the keys on the panes.

```tsx
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
```

## Loop and slideshow

`loop` goes around the ends: the pane on the other side is brought next to the one leaving, so the move never runs back across the panes between. `slideInterval` makes a slideshow; it waits while the pointer rests on the gallery, while focus is inside, while the page is out of sight and under reduced motion, and the button in the bar pauses it. `stretchImages` fills the panes.

```tsx
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
```

## Several panes side by side

`itemsPerPage` puts that many panes in the width, the `gap` token between them. The buttons and the keys move one pane at a time and stop when the last pane is in view; the pane in view is the first of them.

```tsx
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
```

## Any content

An item’s `content` makes the pane’s content when the pane is made; what is in it works as anywhere else. `onItemClick` tells a press on the pane that was not a drag.

```tsx
import { reactive } from '@motifx/core';
import { Button, Gallery, Stack } from '@motifx-community/ui';

const PLANS = [
    { name: 'Starter', price: '€9', line: 'One project, two people' },
    { name: 'Team', price: '€29', line: 'Ten projects, your whole team' },
    { name: 'Company', price: '€79', line: 'No limits, a person to call' }
];

/** Any content in a pane: a plan each, with its own button; a press on the pane itself is told too. */
export default function Content() {
    const s = reactive({ told: '' });
    const plan = (p: (typeof PLANS)[number]) => (
        <Stack class="ga-plan" gap="xs" align="center" justify="center" style="block-size: 100%">
            <strong>{p.name}</strong>
            <span class="ga-plan-price">{p.price} a month</span>
            <span>{p.line}</span>
            <Button text="Choose" variant="outline" onclick={() => (s.told = `${p.name} chosen`)} />
        </Stack>
    );
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Gallery class="ga-plans" label="Plans" height={200} swipeEnabled={false} items={PLANS.map(p => ({ key: p.name, content: () => plan(p) }))} onItemClick={e => (s.told = `pane ${e.index + 1} pressed`)} />
            <output class="ga-plans-told">{() => s.told}</output>
        </Stack>
    );
}
```

## Programmatic use

Made with `new`, moved with `next()`, `previous()` and `goTo()`; `showNavButtons` and `showIndicator` off leave the moving to your own buttons, `onSlideChanged` tells where it stands.

```tsx
import { reactive } from '@motifx/core';
import { Button, Gallery, Stack } from '@motifx-community/ui';
import { scene } from './scenes';

/** A gallery made programmatically without its own buttons or dots: yours move it, and `onSlideChanged` tells where it is. */
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
```

## Keyboard

| Key | What it does |
| --- | --- |
| `Tab` | The slideshow button, the dots (one stop: the dot of the pane in view), the previous button, the panes, the next button; what is in the pane in view after it. |
| `Arrow keys` | On the panes or the dots: Left and Right (the other way round in a right-to-left page) move to the previous and the next pane, Home and End to the first and the last. |
| `Enter, Space` | On a button or a dot: press it. |

## Accessibility

| Topic | How |
| --- | --- |
| `Landmark` | A `region` with `aria-roledescription="carousel"`, named “Gallery” in the kit language; several on one page: give each its own `label`. |
| `A pane` | A `group` with `aria-roledescription="slide"` named “Slide 2 of 5”; the panes out of view are hidden from readers and from the keys (`inert`). |
| `Images` | Give each an `alt`; an empty one is a decorative image. The caption is read as the pane’s content. |
| `Slideshow` | The panes are a live region while it is stopped (`polite`), silent while it runs (`off`), as the carousel pattern asks; the button to stop it comes first in the Tab order. |
| `Dots and arrows` | Buttons named “Slide 2 of 5”, “Previous slide” and “Next slide”; the dot of the pane in view is `aria-current`; an arrow at an end is `aria-disabled`. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-gallery` | The gallery. `data-swipe` when a drag moves it, `data-dragging` while one does, `data-playing` while the slideshow is on, `data-stretch`. |
| `.mx-gallery__viewport, .mx-gallery__track` | The frame that clips the panes and the track that slides in it (`data-dragging`, `data-no-motion`). |
| `.mx-gallery__item, .mx-gallery__figure, .mx-gallery__image` | A pane (`data-current`, `aria-hidden`), what it shows, the image. |
| `.mx-gallery__caption, .mx-gallery__title, .mx-gallery__description` | The band over the bottom of a pane and its two lines. |
| `.mx-gallery__nav, .mx-gallery__arrow` | The previous and next buttons (`data-direction`, `aria-disabled`) and the glyph in them. |
| `.mx-gallery__bar, .mx-gallery__indicator, .mx-gallery__dot, .mx-gallery__play, .mx-gallery__play-glyph` | The bar over the bottom, the dots (`aria-current`), the slideshow button and its glyph. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `gallery.frame, .item, .caption, .title, .description` | Units: the frame (`focus`, `swipeable`, `dragging`), a pane (`current`), the caption and its texts. |
| `gallery.nav, .arrow, .dot, .play, .play-glyph, .bar` | Units: the side buttons (`hover`, `pressed`, `focus`, `disabled`), their glyph (`icon` per direction), the dots (`current`, `hover`, `pressed`, `focus`), the slideshow button and its glyph (`icon` while `playing`), the bar. |
| `gallery.gap, .nav-inset, .bar-inset, .indicator-gap, .caption-padding` | Between panes side by side, from the sides and the bottom to what lies over them, between the dots, inside a caption. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly (GalleryItem \| string)[]>` | `[]` | The panes in order: `GalleryItem`s (`image`, `alt`, `text`, `description`, `key`, `content`, `data`) or image addresses. |
| `value` | `Bind<string \| number \| null>` | `0` | The pane in view: its `key`, else its index. `x-model` binds it two-way. |
| `loop` | `Bind<boolean>` | `false` | After the last pane comes the first; the move goes around the ends, not back across the panes between. |
| `showNavButtons` | `Bind<boolean>` | `true` | The previous and next buttons over the sides. |
| `showIndicator` | `Bind<boolean>` | `true` | The dots under the panes, one per pane. |
| `slideInterval` | `Bind<number>` | `0` | Milliseconds a pane stays in a slideshow; `0` for none. It pauses under the pointer, while focus is inside, out of sight and under reduced motion. |
| `pauseOnHover` | `Bind<boolean>` | `true` | The slideshow waits while the pointer rests on the gallery. |
| `swipeEnabled` | `Bind<boolean>` | `true` | A finger or a pointer drags the panes; a drag far or fast enough lands on the next one. |
| `itemsPerPage` | `Bind<number>` | `1` | Panes side by side in the width, with the `gap` token between them. |
| `stretchImages` | `Bind<boolean>` | `false` | An image fills its pane, cut at the edges, instead of fitting inside it whole. |
| `height` | `Bind<string \| number \| null>` | `null` | A CSS length or pixels. Without one the gallery is as tall as its tallest pane. |
| `label` | `Bind<string>` | the kit’s “Gallery” | What screen readers call it. |

### Events, properties and methods

| Member | Kind | Description |
| --- | --- | --- |
| `onSlideChanging` | event | The pane in view is about to change (`from`, `to`, `fromItem`, `toItem`, `byUser`); `cancel = true` keeps the one there. |
| `onSlideChanged` | event | The pane in view changed (`index`, `item`, `previous`, `byUser`: by a press, a swipe or a key, else programmatically or the slideshow). |
| `onItemClick` | event | A press on a pane that was not a drag (`index`, `item`, `event`). |
| `selectedIndex` | read-only | The index of the pane in view; -1 when there is none. |
| `count` | read-only | How many panes there are. |
| `isPlaying` | read-only | The slideshow runs now: not paused, and nothing holds it. |
| `next(), previous()` | `Promise<boolean>` | Goes to the next or the previous pane; `false` at an end without `loop`, or when the change was refused. |
| `goTo(pane)` | `Promise<boolean>` | Goes to a pane by index or key; `onSlideChanging` is asked first. |
| `play(), pause()` | `void` | Starts the slideshow again, or stops it until `play()`; the button in the bar does the same. |
| `refresh()` | `void` | Reads the items again after they were changed in place. |
