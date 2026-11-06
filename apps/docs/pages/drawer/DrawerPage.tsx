import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Events from './examples/Events';
import Navigation from './examples/Navigation';
import Options from './examples/Options';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<boolean>`', '`false`', 'Whether it is open. `x-model` binds it two-way.'],
  ['side', "`Bind<'start' | 'end' | 'left' | 'right' | 'top' | 'bottom'>`", "`'start'`", 'The edge it slides in from. `start` and `end` follow the reading direction; `left` and `right` do not.'],
  ['mode', "`Bind<'over' | 'push'>`", "`'over'`", 'Over the content, or moving `pushTarget` aside by its size.'],
  ['pushTarget', '`Bind<HTMLElement | ComponentBase | null>`', '—', 'What `push` moves aside. Without it, `push` works as `over`.'],
  ['size', '`Bind<number | string | null>`', '`null`', 'Its width (its height from the top or the bottom): pixels or a CSS length; `null` for `drawer.size`. Never more than 85% of the room.'],
  ['edgeSwipe', '`Bind<boolean>`', '`false`', 'A finger swiping in from the edge of the container (or the page) opens it, following the finger.'],
  ['edgeSize', '`Bind<number>`', '`24`', 'How far from the edge, in pixels, that swipe may start.'],
  ['swipeToClose', '`Bind<boolean>`', '`true`', 'A finger swiping it back towards its edge closes it.'],
  ['flickSpeed', '`Bind<number>`', '`0.4`', 'A flick faster than this, in pixels per millisecond, opens or closes it however far it went.'],
  ['modal', '`Bind<boolean>`', "`true` over, `false` in push", 'Nothing around it can be used; Tab stays inside.'],
  ['title, label, container, content, footer, showClose, scrim, closeOnEscape, closeOnScrim, closeOnBack, focusOnOpen, returnFocus, disposeOnClose', 'see BottomSheet', '', 'The props every overlay panel shares, as on the [BottomSheet page](/bottomsheet#api).'],
];

const MEMBERS = [
  ['open(), close(reason?), toggle(), show(host)', '`boolean`', 'As on a bottom sheet.'],
  ['isOpen', 'read-only, reactive', 'Whether it is open.'],
  ['onOpening / onOpened / onClosing / onClosed', 'events', "As on a bottom sheet; a swipe back closes with `reason: 'swipe'`. A swipe from the edge that `onOpening` refuses does not move it."],
];

const GESTURES = [
  ['Swipe in from the edge (`edgeSwipe`)', 'The drawer follows the finger; let go past half its size (or flicked), it stays open, else it goes back.'],
  ['Swipe it back towards its edge', 'It follows; let go past half (or flicked), it closes. A swipe on something inside that scrolls sideways is that thing\'s.'],
  ['A press on the scrim, Escape, the back button', 'It closes (each an option).'],
];

const A11Y = [
  ['Dialog', 'The panel is `role="dialog"`, named by its title, else `label`, else "Side panel"; `aria-modal` when modal, and what is around it is `inert`.'],
  ['Focus', 'Moves in when it opens modal, back where it was when it closes.'],
  ['Reading direction', '`start` is the left edge left to right and the right edge right to left; the slide follows.'],
  ['Motion', 'It slides with the motion tokens; with reduced motion it just appears.'],
];

const HOOKS = [
  ['.mx-drawer', 'The layer. `data-side` (`start`, `end`, `top`, `bottom`), `data-mode`, `data-open`, `data-modal`, `data-scrim`, `data-contained`, `data-dragging`.'],
  ['.mx-drawer__panel', 'The dialog. `--_size`, and `--_shift-x` / `--_shift-y` while a finger moves it.'],
  ['.mx-drawer__scrim, __header, __title, __tools, __close, __body, __footer', 'Its parts.'],
  ['[data-mx-drawer-push]', 'The element a push drawer moves aside, by `--_mx-push`.'],
];

const TOKENS = [
  ['drawer.scrim, drawer.panel', 'Units: the dimmed layer; the surface at each edge (`start`, `end`, `top`, `bottom`: its sides towards the content and the room differ) and pushing the content (`push`).'],
  ['drawer.header, drawer.title, drawer.tools, drawer.body, drawer.footer', 'Units: inside (`body.focus`: a ring inside the content).'],
  ['drawer.size, drawer.max-size, drawer.inset, drawer.font-family', 'The size it opens at, the most of the room it takes, the room around it; the type’s family.'],
];

export default function DrawerPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A panel that slides in from an edge of the page or of a container, over the content or pushing it aside. A finger swipes it in from the edge and back again; Escape, the scrim and the browser's back close it." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Drawer, type DrawerSide, type DrawerMode } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="A drawer over the page">
        <p>
          <Rich text="Bound with `x-model`, or opened with `open()` and `show(host)` as a bottom sheet is. Over the page it opens in the top layer, modal, with a scrim." />
        </p>
        <Example files={code('Navigation.tsx')}>
          <Navigation />
        </Example>
      </Section>

      <Section anchor="options" title="Edges, push and swipes">
        <p>
          <Rich text="Over a frame (`container`), from any edge. `push` moves the frame's content aside (`pushTarget`) and is not modal unless asked. With `edgeSwipe` a finger on a touch screen opens it from the edge; every option is live." />
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

      <Section anchor="touch" title="Finger and keys">
        <ApiTable head={['Gesture or key', 'What it does']} rows={[...GESTURES, ['Escape', 'Closes it.'], ['Tab, Shift+Tab', 'Through its controls; modal, it goes round inside.']]} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="Its default name and the close button come from `uiLocale.strings` (`drawerLabel`, `close`)." />
        </p>
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
          <Rich text="Members and events" />
        </h3>
        <ApiTable head={['Member', 'Returns', 'Description']} rows={MEMBERS} />
      </Section>
    </>
  );
}
