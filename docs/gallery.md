# Gallery

> Display · @motifx-community/ui 0.1.0-beta.3

Displays a horizontal set of slides, one or several at a time. Users navigate with the side buttons, the indicator dots, swipe gestures or the arrow keys, and it can run as an automatic slideshow. A slide can be an image with a caption or any other content.

## Import

```tsx
import { Gallery } from '@motifx-community/ui';
```

## Images with captions

`items` defines the slides. Each one is an address or an item with `image`, `alt`, `text` and `description`. `value` is the visible slide, identified by its `key` or index, and `x-model` provides two-way binding. Users can drag a slide with a finger or the mouse, press an arrow or a dot, or use the keyboard.

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

## Looping and slideshow

`loop` wraps around at the ends. The slide on the other side moves next to the outgoing one, so the transition never runs back across the slides in between. `slideInterval` starts a slideshow, which pauses while the pointer is over the gallery, while focus is inside it, while the page is hidden, and when the user prefers reduced motion. The button in the bar pauses it manually. `stretchImages` makes images fill the slides.

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

## Multiple slides per view

`itemsPerPage` sets how many slides fit in the width, separated by the `gap` token. The buttons and keys move one slide at a time and stop when the last slide is in view. The current slide is the first visible one.

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

An item's `content` creates the slide content when the slide is created, and it behaves the same as anywhere else. `onItemClick` reports a click on a slide that was not a drag.

```tsx
import { reactive } from '@motifx/core';
import { Button, Gallery, Stack } from '@motifx-community/ui';

const PLANS = [
    { name: 'Starter', price: '€9', line: 'One project, two people' },
    { name: 'Team', price: '€29', line: 'Ten projects, your whole team' },
    { name: 'Company', price: '€79', line: 'No limits, a person to call' }
];

/** Any content in a slide: a plan each, with its own button. A click on the slide itself is also reported. */
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

Create the gallery with `new` and navigate with `next()`, `previous()` and `goTo()`. With `showNavButtons` and `showIndicator` off, you can use your own buttons, and `onSlideChanged` reports the position.

```tsx
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
```

## Keyboard

| Key | Description |
| --- | --- |
| `Tab` | The slideshow button, the dots (one Tab stop, on the dot of the current slide), the previous button, the slides and the next button, followed by any content in the current slide. |
| `Arrow keys` | On the slides or dots, Left and Right move to the previous and next slide (reversed on right-to-left pages), and Home and End move to the first and last. |
| `Enter, Space` | On a button or dot, activates it. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Landmark` | A `region` with `aria-roledescription="carousel"`, named “Gallery” in the kit language. If a page has several, give each one its own `label`. |
| `A pane` | A `group` with `aria-roledescription="slide"`, named “Slide 2 of 5”. Slides out of view are hidden from assistive technology and the keyboard (`inert`). |
| `Images` | Give each image an `alt`. An empty value marks a decorative image. The caption is read as part of the slide. |
| `Slideshow` | The slides are a live region while stopped (`polite`) and silent while running (`off`), as the carousel pattern requires. The button that stops the slideshow comes first in the Tab order. |
| `Dots and arrows` | Buttons named “Slide 2 of 5”, “Previous slide” and “Next slide”. The dot of the current slide has `aria-current`, and an arrow at an end has `aria-disabled`. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-gallery` | The gallery. `data-swipe` when dragging is enabled, `data-dragging` during a drag, `data-playing` while the slideshow runs, and `data-stretch`. |
| `.mx-gallery__viewport, .mx-gallery__track` | The frame that clips the slides and the track that moves inside it (`data-dragging`, `data-no-motion`). |
| `.mx-gallery__item, .mx-gallery__figure, .mx-gallery__image` | A slide (`data-current`, `aria-hidden`), its content and the image. |
| `.mx-gallery__caption, .mx-gallery__title, .mx-gallery__description` | The caption band over the bottom of a slide and its two lines. |
| `.mx-gallery__nav, .mx-gallery__arrow` | The previous and next buttons (`data-direction`, `aria-disabled`) and their glyphs. |
| `.mx-gallery__bar, .mx-gallery__indicator, .mx-gallery__dot, .mx-gallery__play, .mx-gallery__play-glyph` | The bar along the bottom, the dots (`aria-current`), the slideshow button and its glyph. |

### Component tokens

| Token | Description |
| --- | --- |
| `gallery.frame, .item, .caption, .title, .description` | Units: the frame (`focus`, `swipeable`, `dragging`), a slide (`current`), the caption and its text. |
| `gallery.nav, .arrow, .dot, .play, .play-glyph, .bar` | Units: the side buttons (`hover`, `pressed`, `focus`, `disabled`), their glyphs (`icon` per direction), the dots (`current`, `hover`, `pressed`, `focus`), the slideshow button and its glyph (`icon` while `playing`), and the bar. |
| `gallery.gap, .nav-inset, .bar-inset, .indicator-gap, .caption-padding` | The gap between side-by-side slides, the offset of overlaid parts from the sides and bottom, the gap between dots, and the caption padding. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly (GalleryItem \| string)[]>` | `[]` | The slides in order: `GalleryItem` objects (`image`, `alt`, `text`, `description`, `key`, `content`, `data`) or image addresses. |
| `value` | `Bind<string \| number \| null>` | `0` | The current slide, identified by its `key` or index. `x-model` provides two-way binding. |
| `loop` | `Bind<boolean>` | `false` | The first slide follows the last, and the transition wraps around instead of running back across the slides in between. |
| `showNavButtons` | `Bind<boolean>` | `true` | Shows previous and next buttons over the sides. |
| `showIndicator` | `Bind<boolean>` | `true` | Shows indicator dots below the slides, one per slide. |
| `slideInterval` | `Bind<number>` | `0` | The time each slide stays in a slideshow, in milliseconds. `0` turns it off. The slideshow pauses on hover, while focus is inside, while the page is hidden and when the user prefers reduced motion. |
| `pauseOnHover` | `Bind<boolean>` | `true` | Pauses the slideshow while the pointer is over the gallery. |
| `swipeEnabled` | `Bind<boolean>` | `true` | Lets a finger or pointer drag the slides. A drag that is far or fast enough moves to the next slide. |
| `itemsPerPage` | `Bind<number>` | `1` | The number of slides side by side, with the `gap` token between them. |
| `stretchImages` | `Bind<boolean>` | `false` | Makes an image fill its slide and crops the edges, instead of fitting the whole image inside. |
| `height` | `Bind<string \| number \| null>` | `null` | A CSS length or pixels. Without it, the gallery is as tall as its tallest slide. |
| `label` | `Bind<string>` | The kit string “Gallery” | The accessible name. |

### Events, properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `onSlideChanging` | event | Occurs before the current slide changes (`from`, `to`, `fromItem`, `toItem`, `byUser`). Set `cancel = true` to keep the current slide. |
| `onSlideChanged` | event | Occurs after the current slide changes (`index`, `item`, `previous`, and `byUser` for a click, swipe or key, as opposed to code or the slideshow). |
| `onItemClick` | event | Occurs when a slide is clicked without dragging (`index`, `item`, `event`). |
| `selectedIndex` | read-only | The index of the current slide, or -1 if there is none. |
| `count` | read-only | The number of panes. |
| `isPlaying` | read-only | Indicates that the slideshow is running and nothing is holding it. |
| `next(), previous()` | `Promise<boolean>` | Moves to the next or previous slide. Returns `false` at an end without `loop`, or if the change was canceled. |
| `goTo(pane)` | `Promise<boolean>` | Moves to a slide by index or key. `onSlideChanging` is raised first. |
| `play(), pause()` | `void` | Starts the slideshow again, or stops it until `play()` is called. The button in the bar does the same. |
| `refresh()` | `void` | Re-reads the items after they have been changed in place. |
