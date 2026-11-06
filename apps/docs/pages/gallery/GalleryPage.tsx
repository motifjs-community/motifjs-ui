import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import Content from './examples/Content';
import Programmatic from './examples/Programmatic';
import PerPage from './examples/PerPage';
import Slideshow from './examples/Slideshow';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['items', '`Bind<readonly (GalleryItem | string)[]>`', '`[]`', 'The slides in order: `GalleryItem` objects (`image`, `alt`, `text`, `description`, `key`, `content`, `data`) or image addresses.'],
    ['value', '`Bind<string | number | null>`', '`0`', 'The current slide, identified by its `key` or index. `x-model` provides two-way binding.'],
    ['loop', '`Bind<boolean>`', '`false`', 'The first slide follows the last, and the transition wraps around instead of running back across the slides in between.'],
    ['showNavButtons', '`Bind<boolean>`', '`true`', 'Shows previous and next buttons over the sides.'],
    ['showIndicator', '`Bind<boolean>`', '`true`', 'Shows indicator dots below the slides, one per slide.'],
    ['slideInterval', '`Bind<number>`', '`0`', 'The time each slide stays in a slideshow, in milliseconds. `0` turns it off. The slideshow pauses on hover, while focus is inside, while the page is hidden and when the user prefers reduced motion.'],
    ['pauseOnHover', '`Bind<boolean>`', '`true`', 'Pauses the slideshow while the pointer is over the gallery.'],
    ['swipeEnabled', '`Bind<boolean>`', '`true`', 'Lets a finger or pointer drag the slides. A drag that is far or fast enough moves to the next slide.'],
    ['itemsPerPage', '`Bind<number>`', '`1`', 'The number of slides side by side, with the `gap` token between them.'],
    ['stretchImages', '`Bind<boolean>`', '`false`', 'Makes an image fill its slide and crops the edges, instead of fitting the whole image inside.'],
    ['height', '`Bind<string | number | null>`', '`null`', 'A CSS length or pixels. Without it, the gallery is as tall as its tallest slide.'],
    ['label', '`Bind<string>`', 'The kit string “Gallery”', 'The accessible name.']
];

const MEMBERS = [
    ['onSlideChanging', 'event', 'Occurs before the current slide changes (`from`, `to`, `fromItem`, `toItem`, `byUser`). Set `cancel = true` to keep the current slide.'],
    ['onSlideChanged', 'event', 'Occurs after the current slide changes (`index`, `item`, `previous`, and `byUser` for a click, swipe or key, as opposed to code or the slideshow).'],
    ['onItemClick', 'event', 'Occurs when a slide is clicked without dragging (`index`, `item`, `event`).'],
    ['selectedIndex', 'read-only', 'The index of the current slide, or -1 if there is none.'],
    ['count', 'read-only', 'The number of panes.'],
    ['isPlaying', 'read-only', 'Indicates that the slideshow is running and nothing is holding it.'],
    ['next(), previous()', '`Promise<boolean>`', 'Moves to the next or previous slide. Returns `false` at an end without `loop`, or if the change was canceled.'],
    ['goTo(pane)', '`Promise<boolean>`', 'Moves to a slide by index or key. `onSlideChanging` is raised first.'],
    ['play(), pause()', '`void`', 'Starts the slideshow again, or stops it until `play()` is called. The button in the bar does the same.'],
    ['refresh()', '`void`', 'Re-reads the items after they have been changed in place.']
];

const KEYS = [
    ['Tab', 'The slideshow button, the dots (one Tab stop, on the dot of the current slide), the previous button, the slides and the next button, followed by any content in the current slide.'],
    ['Arrow keys', 'On the slides or dots, Left and Right move to the previous and next slide (reversed on right-to-left pages), and Home and End move to the first and last.'],
    ['Enter, Space', 'On a button or dot, activates it.']
];

const A11Y = [
    ['Landmark', 'A `region` with `aria-roledescription="carousel"`, named “Gallery” in the kit language. If a page has several, give each one its own `label`.'],
    ['A pane', 'A `group` with `aria-roledescription="slide"`, named “Slide 2 of 5”. Slides out of view are hidden from assistive technology and the keyboard (`inert`).'],
    ['Images', 'Give each image an `alt`. An empty value marks a decorative image. The caption is read as part of the slide.'],
    ['Slideshow', 'The slides are a live region while stopped (`polite`) and silent while running (`off`), as the carousel pattern requires. The button that stops the slideshow comes first in the Tab order.'],
    ['Dots and arrows', 'Buttons named “Slide 2 of 5”, “Previous slide” and “Next slide”. The dot of the current slide has `aria-current`, and an arrow at an end has `aria-disabled`.']
];

const HOOKS = [
    ['.mx-gallery', 'The gallery. `data-swipe` when dragging is enabled, `data-dragging` during a drag, `data-playing` while the slideshow runs, and `data-stretch`.'],
    ['.mx-gallery__viewport, .mx-gallery__track', 'The frame that clips the slides and the track that moves inside it (`data-dragging`, `data-no-motion`).'],
    ['.mx-gallery__item, .mx-gallery__figure, .mx-gallery__image', 'A slide (`data-current`, `aria-hidden`), its content and the image.'],
    ['.mx-gallery__caption, .mx-gallery__title, .mx-gallery__description', 'The caption band over the bottom of a slide and its two lines.'],
    ['.mx-gallery__nav, .mx-gallery__arrow', 'The previous and next buttons (`data-direction`, `aria-disabled`) and their glyphs.'],
    ['.mx-gallery__bar, .mx-gallery__indicator, .mx-gallery__dot, .mx-gallery__play, .mx-gallery__play-glyph', 'The bar along the bottom, the dots (`aria-current`), the slideshow button and its glyph.']
];

const TOKENS = [
    ['gallery.frame, .item, .caption, .title, .description', 'Units: the frame (`focus`, `swipeable`, `dragging`), a slide (`current`), the caption and its text.'],
    ['gallery.nav, .arrow, .dot, .play, .play-glyph, .bar', 'Units: the side buttons (`hover`, `pressed`, `focus`, `disabled`), their glyphs (`icon` per direction), the dots (`current`, `hover`, `pressed`, `focus`), the slideshow button and its glyph (`icon` while `playing`), and the bar.'],
    ['gallery.gap, .nav-inset, .bar-inset, .indicator-gap, .caption-padding', 'The gap between side-by-side slides, the offset of overlaid parts from the sides and bottom, the gap between dots, and the caption padding.']
];

export default function GalleryPage() {
    return (
        <>
            <p class="lead">
              <Rich text="Displays a horizontal set of slides, one or several at a time. Users navigate with the side buttons, the indicator dots, swipe gestures or the arrow keys, and it can run as an automatic slideshow. A slide can be an image with a caption or any other content." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { Gallery } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Images with captions">
                <p>
                    <Rich text="`items` defines the slides. Each one is an address or an item with `image`, `alt`, `text` and `description`. `value` is the visible slide, identified by its `key` or index, and `x-model` provides two-way binding. Users can drag a slide with a finger or the mouse, press an arrow or a dot, or use the keyboard." />
                </p>
                <Example stack files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>

            <Section anchor="slideshow" title="Looping and slideshow">
                <p>
                    <Rich text="`loop` wraps around at the ends. The slide on the other side moves next to the outgoing one, so the transition never runs back across the slides in between. `slideInterval` starts a slideshow, which pauses while the pointer is over the gallery, while focus is inside it, while the page is hidden, and when the user prefers reduced motion. The button in the bar pauses it manually. `stretchImages` makes images fill the slides." />
                </p>
                <Example stack files={code('Slideshow.tsx')}>
                    <Slideshow />
                </Example>
            </Section>

            <Section anchor="perpage" title="Multiple slides per view">
                <p>
                    <Rich text="`itemsPerPage` sets how many slides fit in the width, separated by the `gap` token. The buttons and keys move one slide at a time and stop when the last slide is in view. The current slide is the first visible one." />
                </p>
                <Example stack files={code('PerPage.tsx')}>
                    <PerPage />
                </Example>
            </Section>

            <Section anchor="content" title="Any content">
                <p>
                    <Rich text="An item's `content` creates the slide content when the slide is created, and it behaves the same as anywhere else. `onItemClick` reports a click on a slide that was not a drag." />
                </p>
                <Example stack files={code('Content.tsx')}>
                    <Content />
                </Example>
            </Section>

            <Section anchor="programmatic" title="Programmatic use">
                <p>
                    <Rich text="Create the gallery with `new` and navigate with `next()`, `previous()` and `goTo()`. With `showNavButtons` and `showIndicator` off, you can use your own buttons, and `onSlideChanged` reports the position." />
                </p>
                <Example stack files={code('Programmatic.tsx')}>
                    <Programmatic />
                </Example>
            </Section>

            <Section anchor="keyboard" title="Keyboard">
                <ApiTable head={['Key', 'Description']} rows={KEYS} />
            </Section>

            <Section anchor="a11y" title="Accessibility">
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>

            <Section anchor="styling" title="Styling">
                <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
                <h3>
                  <Rich text="Component tokens" />
                </h3>
                <ApiTable head={['Token', 'Description']} rows={TOKENS} />
            </Section>

            <Section anchor="api" title="API reference">
                <h3>
                  <Rich text="Props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                  <Rich text="Events, properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Type', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
