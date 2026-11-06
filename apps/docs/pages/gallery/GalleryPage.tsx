import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import Content from './examples/Content';
import Programmatic from './examples/Programmatic';
import PerPage from './examples/PerPage';
import Slideshow from './examples/Slideshow';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['items', '`Bind<readonly (GalleryItem | string)[]>`', '`[]`', 'The panes in order: `GalleryItem`s (`image`, `alt`, `text`, `description`, `key`, `content`, `data`) or image addresses.'],
    ['value', '`Bind<string | number | null>`', '`0`', 'The pane in view: its `key`, else its index. `x-model` binds it two-way.'],
    ['loop', '`Bind<boolean>`', '`false`', 'After the last pane comes the first; the move goes around the ends, not back across the panes between.'],
    ['showNavButtons', '`Bind<boolean>`', '`true`', 'The previous and next buttons over the sides.'],
    ['showIndicator', '`Bind<boolean>`', '`true`', 'The dots under the panes, one per pane.'],
    ['slideInterval', '`Bind<number>`', '`0`', 'Milliseconds a pane stays in a slideshow; `0` for none. It pauses under the pointer, while focus is inside, out of sight and under reduced motion.'],
    ['pauseOnHover', '`Bind<boolean>`', '`true`', 'The slideshow waits while the pointer rests on the gallery.'],
    ['swipeEnabled', '`Bind<boolean>`', '`true`', 'A finger or a pointer drags the panes; a drag far or fast enough lands on the next one.'],
    ['itemsPerPage', '`Bind<number>`', '`1`', 'Panes side by side in the width, with the `gap` token between them.'],
    ['stretchImages', '`Bind<boolean>`', '`false`', 'An image fills its pane, cut at the edges, instead of fitting inside it whole.'],
    ['height', '`Bind<string | number | null>`', '`null`', 'A CSS length or pixels. Without one the gallery is as tall as its tallest pane.'],
    ['label', '`Bind<string>`', 'the kit’s “Gallery”', 'What screen readers call it.']
];

const MEMBERS = [
    ['onSlideChanging', 'event', 'The pane in view is about to change (`from`, `to`, `fromItem`, `toItem`, `byUser`); `cancel = true` keeps the one there.'],
    ['onSlideChanged', 'event', 'The pane in view changed (`index`, `item`, `previous`, `byUser`: by a press, a swipe or a key, else programmatically or the slideshow).'],
    ['onItemClick', 'event', 'A press on a pane that was not a drag (`index`, `item`, `event`).'],
    ['selectedIndex', 'read-only', 'The index of the pane in view; -1 when there is none.'],
    ['count', 'read-only', 'How many panes there are.'],
    ['isPlaying', 'read-only', 'The slideshow runs now: not paused, and nothing holds it.'],
    ['next(), previous()', '`Promise<boolean>`', 'Goes to the next or the previous pane; `false` at an end without `loop`, or when the change was refused.'],
    ['goTo(pane)', '`Promise<boolean>`', 'Goes to a pane by index or key; `onSlideChanging` is asked first.'],
    ['play(), pause()', '`void`', 'Starts the slideshow again, or stops it until `play()`; the button in the bar does the same.'],
    ['refresh()', '`void`', 'Reads the items again after they were changed in place.']
];

const KEYS = [
    ['Tab', 'The slideshow button, the dots (one stop: the dot of the pane in view), the previous button, the panes, the next button; what is in the pane in view after it.'],
    ['Arrow keys', 'On the panes or the dots: Left and Right (the other way round in a right-to-left page) move to the previous and the next pane, Home and End to the first and the last.'],
    ['Enter, Space', 'On a button or a dot: press it.']
];

const A11Y = [
    ['Landmark', 'A `region` with `aria-roledescription="carousel"`, named “Gallery” in the kit language; several on one page: give each its own `label`.'],
    ['A pane', 'A `group` with `aria-roledescription="slide"` named “Slide 2 of 5”; the panes out of view are hidden from readers and from the keys (`inert`).'],
    ['Images', 'Give each an `alt`; an empty one is a decorative image. The caption is read as the pane’s content.'],
    ['Slideshow', 'The panes are a live region while it is stopped (`polite`), silent while it runs (`off`), as the carousel pattern asks; the button to stop it comes first in the Tab order.'],
    ['Dots and arrows', 'Buttons named “Slide 2 of 5”, “Previous slide” and “Next slide”; the dot of the pane in view is `aria-current`; an arrow at an end is `aria-disabled`.']
];

const HOOKS = [
    ['.mx-gallery', 'The gallery. `data-swipe` when a drag moves it, `data-dragging` while one does, `data-playing` while the slideshow is on, `data-stretch`.'],
    ['.mx-gallery__viewport, .mx-gallery__track', 'The frame that clips the panes and the track that slides in it (`data-dragging`, `data-no-motion`).'],
    ['.mx-gallery__item, .mx-gallery__figure, .mx-gallery__image', 'A pane (`data-current`, `aria-hidden`), what it shows, the image.'],
    ['.mx-gallery__caption, .mx-gallery__title, .mx-gallery__description', 'The band over the bottom of a pane and its two lines.'],
    ['.mx-gallery__nav, .mx-gallery__arrow', 'The previous and next buttons (`data-direction`, `aria-disabled`) and the glyph in them.'],
    ['.mx-gallery__bar, .mx-gallery__indicator, .mx-gallery__dot, .mx-gallery__play, .mx-gallery__play-glyph', 'The bar over the bottom, the dots (`aria-current`), the slideshow button and its glyph.']
];

const TOKENS = [
    ['gallery.frame, .item, .caption, .title, .description', 'Units: the frame (`focus`, `swipeable`, `dragging`), a pane (`current`), the caption and its texts.'],
    ['gallery.nav, .arrow, .dot, .play, .play-glyph, .bar', 'Units: the side buttons (`hover`, `pressed`, `focus`, `disabled`), their glyph (`icon` per direction), the dots (`current`, `hover`, `pressed`, `focus`), the slideshow button and its glyph (`icon` while `playing`), the bar.'],
    ['gallery.gap, .nav-inset, .bar-inset, .indicator-gap, .caption-padding', 'Between panes side by side, from the sides and the bottom to what lies over them, between the dots, inside a caption.']
];

export default function GalleryPage() {
    return (
        <>
            <p class="lead">
              <Rich text="Panes side by side, one in view or several, moved by the buttons at the sides, the dots under them, a swipe or the arrow keys; a slideshow when told. A pane is an image with a caption, or any content." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { Gallery } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Pictures with captions">
                <p>
                    <Rich text="`items` are the panes: an address, or an item with `image`, `alt`, `text` and `description`. The pane in view is `value` (a pane’s `key`, else its index), `x-model` binds it two-way. Drag a pane with a finger or the mouse, press an arrow or a dot, or use the keys on the panes." />
                </p>
                <Example stack files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>

            <Section anchor="slideshow" title="Loop and slideshow">
                <p>
                    <Rich text="`loop` goes around the ends: the pane on the other side is brought next to the one leaving, so the move never runs back across the panes between. `slideInterval` makes a slideshow; it waits while the pointer rests on the gallery, while focus is inside, while the page is out of sight and under reduced motion, and the button in the bar pauses it. `stretchImages` fills the panes." />
                </p>
                <Example stack files={code('Slideshow.tsx')}>
                    <Slideshow />
                </Example>
            </Section>

            <Section anchor="perpage" title="Several panes side by side">
                <p>
                    <Rich text="`itemsPerPage` puts that many panes in the width, the `gap` token between them. The buttons and the keys move one pane at a time and stop when the last pane is in view; the pane in view is the first of them." />
                </p>
                <Example stack files={code('PerPage.tsx')}>
                    <PerPage />
                </Example>
            </Section>

            <Section anchor="content" title="Any content">
                <p>
                    <Rich text="An item’s `content` makes the pane’s content when the pane is made; what is in it works as anywhere else. `onItemClick` tells a press on the pane that was not a drag." />
                </p>
                <Example stack files={code('Content.tsx')}>
                    <Content />
                </Example>
            </Section>

            <Section anchor="programmatic" title="Programmatic use">
                <p>
                    <Rich text="Made with `new`, moved with `next()`, `previous()` and `goTo()`; `showNavButtons` and `showIndicator` off leave the moving to your own buttons, `onSlideChanged` tells where it stands." />
                </p>
                <Example stack files={code('Programmatic.tsx')}>
                    <Programmatic />
                </Example>
            </Section>

            <Section anchor="keyboard" title="Keyboard">
                <ApiTable head={['Key', 'What it does']} rows={KEYS} />
            </Section>

            <Section anchor="a11y" title="Accessibility">
                <ApiTable head={['Topic', 'How']} rows={A11Y} />
            </Section>

            <Section anchor="styling" title="Styling">
                <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
                <h3>
                  <Rich text="Component tokens" />
                </h3>
                <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
            </Section>

            <Section anchor="api" title="API reference">
                <h3>
                  <Rich text="Props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                  <Rich text="Events, properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Kind', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
