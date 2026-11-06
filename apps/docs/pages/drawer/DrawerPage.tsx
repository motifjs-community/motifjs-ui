import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Events from './examples/Events';
import Navigation from './examples/Navigation';
import Options from './examples/Options';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<boolean>`', '`false`', 'Indicates whether it is open. `x-model` provides two-way binding.'],
  ['side', "`Bind<'start' | 'end' | 'left' | 'right' | 'top' | 'bottom'>`", "`'start'`", 'The edge it slides in from. `start` and `end` follow the reading direction, and `left` and `right` do not.'],
  ['mode', "`Bind<'over' | 'push'>`", "`'over'`", 'Over the content, or pushing `pushTarget` aside by its size.'],
  ['pushTarget', '`Bind<HTMLElement | ComponentBase | null>`', '—', 'The element `push` moves aside. Without it, `push` behaves like `over`.'],
  ['size', '`Bind<number | string | null>`', '`null`', 'Its width, or its height from the top or bottom, in pixels or as a CSS length. `null` uses `drawer.size`. It never exceeds 85% of the available space.'],
  ['edgeSwipe', '`Bind<boolean>`', '`false`', 'A finger swiping in from the edge of the container or page opens it, and it follows the finger.'],
  ['edgeSize', '`Bind<number>`', '`24`', 'The distance from the edge, in pixels, where that swipe can start.'],
  ['swipeToClose', '`Bind<boolean>`', '`true`', 'A finger swiping it back toward its edge closes it.'],
  ['flickSpeed', '`Bind<number>`', '`0.4`', 'A flick faster than this, in pixels per millisecond, opens or closes it regardless of distance.'],
  ['modal', '`Bind<boolean>`', "`true` for over, `false` for push", 'Blocks everything around it, and Tab stays inside.'],
  ['title, label, container, content, footer, showClose, scrim, closeOnEscape, closeOnScrim, closeOnBack, focusOnOpen, returnFocus, disposeOnClose', 'see BottomSheet', '', 'Props shared by all overlay panels, as listed on the [BottomSheet page](/bottomsheet#api).'],
];

const MEMBERS = [
  ['open(), close(reason?), toggle(), show(host)', '`boolean`', 'Same as on a bottom sheet.'],
  ['isOpen', 'read-only, reactive', 'Indicates whether it is open.'],
  ['onOpening / onOpened / onClosing / onClosed', 'events', "Same as on a bottom sheet. A swipe back closes it with `reason: 'swipe'`, and an edge swipe canceled by `onOpening` does not move it."],
];

const GESTURES = [
  ['Swipe in from the edge (`edgeSwipe`)', 'The drawer follows the finger. Releasing past half its size, or flicking it, leaves it open. Otherwise, it slides back.'],
  ['Swipe it back towards its edge', 'It follows the finger. Releasing past halfway, or flicking it, closes it. A swipe on content that scrolls horizontally goes to that content.'],
  ['A press on the scrim, Escape, the back button', 'It closes, and each of these has an option.'],
];

const A11Y = [
  ['Dialog', 'The panel has `role="dialog"` and is named by its title, `label` or "Side panel". It has `aria-modal` when modal, and the surrounding content is `inert`.'],
  ['Focus', 'Moves in when it opens as a modal, and returns to where it was when it closes.'],
  ['Reading direction', '`start` is the left edge in left-to-right pages and the right edge in right-to-left pages, and the animation follows.'],
  ['Motion', 'Slides in using the motion tokens. When the user prefers reduced motion, it appears without animation.'],
];

const HOOKS = [
  ['.mx-drawer', 'The layer. `data-side` (`start`, `end`, `top`, `bottom`), `data-mode`, `data-open`, `data-modal`, `data-scrim`, `data-contained`, `data-dragging`.'],
  ['.mx-drawer__panel', 'The dialog. `--_size`, plus `--_shift-x` and `--_shift-y` during a drag.'],
  ['.mx-drawer__scrim, __header, __title, __tools, __close, __body, __footer', 'The parts of the component.'],
  ['[data-mx-drawer-push]', 'The element a push drawer moves aside, using `--_mx-push`.'],
];

const TOKENS = [
  ['drawer.scrim, drawer.panel', 'Units: the dimmed layer, the surface at each edge (`start`, `end`, `top`, `bottom`, which differ in the sides facing the content and the available space), and the surface when pushing content (`push`).'],
  ['drawer.header, drawer.title, drawer.tools, drawer.body, drawer.footer', 'Units: the content area (`body.focus`: a focus ring inside the content).'],
  ['drawer.size, drawer.max-size, drawer.inset, drawer.font-family', 'The opening size, the maximum share of the available space, the margin around it, and the font family.'],
];

export default function DrawerPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A panel that slides in from an edge of the page or a container, either over the content or pushing it aside. Users can swipe it in from the edge and back out, and Escape, the scrim and the browser's back action close it." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Drawer, type DrawerSide, type DrawerMode } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Page-level drawer">
        <p>
          <Rich text="Bind it with `x-model`, or open it with `open()` and `show(host)` as with a bottom sheet. Over the page, it opens in the top layer as a modal with a scrim." />
        </p>
        <Example files={code('Navigation.tsx')}>
          <Navigation />
        </Example>
      </Section>

      <Section anchor="options" title="Edges, push mode and swipe gestures">
        <p>
          <Rich text="This example opens over a frame (`container`) from any edge. `push` moves the frame's content aside (`pushTarget`) and is not modal unless requested. With `edgeSwipe`, a finger on a touch screen opens it from the edge. Every option can be changed live." />
        </p>
        <Example files={code('Options.tsx')}>
          <Options />
        </Example>
      </Section>

      <Section anchor="events" title="Events">
        <Example files={code('Events.tsx')}>
          <Events />
        </Example>
      </Section>

      <Section anchor="touch" title="Touch and keyboard">
        <ApiTable head={['Gesture or key', 'Description']} rows={[...GESTURES, ['Escape', 'Closes it.'], ['Tab, Shift+Tab', 'Moves through its controls. In a modal, focus cycles within it.']]} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'Details']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="Its default name and the close button come from `uiLocale.strings` (`drawerLabel`, `close`)." />
        </p>
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
          <Rich text="Members and events" />
        </h3>
        <ApiTable head={['Member', 'Returns', 'Description']} rows={MEMBERS} />
      </Section>
    </>
  );
}
