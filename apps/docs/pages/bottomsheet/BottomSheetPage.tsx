import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Detents from './examples/Detents';
import Events from './examples/Events';
import JsxAndCode from './examples/JsxAndCode';
import Localization from './examples/Localization';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<boolean>`', '`false`', 'Whether it is open. `x-model` binds it two-way: the user closing it writes `false`.'],
  ['title', '`Bind<string>`', "`''`", 'A title at the top; it names the dialog. The same property as `text`.'],
  ['label', '`Bind<string>`', "`''`", 'Names it for screen readers when it has no title (else "Sheet", from `uiLocale`).'],
  ['detents', '`Bind<readonly BottomSheetDetent[]>`', "`['half', 'full']`", "The heights it stops at: `'peek'` (`sheet.peek-height`), `'half'`, `'full'` (the room but `sheet.top-gap`), `'fit'` (as tall as its content), pixels, or a share such as `'40%'`."],
  ['detent', '`Bind<BottomSheetDetent>`', 'the first of `detents`', 'The height it opens at and is at now; the user moving it writes it, setting it moves the sheet.'],
  ['modal', '`Bind<boolean>`', '`true`', 'Nothing around it can be used: inside its container, or on the whole page. Tab stays inside.'],
  ['scrim', '`Bind<boolean>`', 'when modal', 'A dimmed layer under it.'],
  ['container', '`Bind<HTMLElement | ComponentBase | null>`', '`null`', 'Opens over this element (a static one is made relative while it is open); `null` over the page, in the top layer.'],
  ['content, footer', '`Bind<ComponentBase | null>`', '—', 'What fills it, next to JSX children, and a row under it that does not scroll.'],
  ['showClose', '`Bind<boolean>`', '`false`', 'A close button beside the title.'],
  ['showHandle', '`Bind<boolean>`', '`true`', 'The handle at the top: a grip for the finger and the mouse, a slider for the keys.'],
  ['draggable', '`Bind<boolean>`', '`true`', 'The finger and the mouse move it between its heights by the handle and the title.'],
  ['dragContent', '`Bind<boolean>`', '`true`', 'A finger on the content takes the sheet along when the content cannot scroll that way: down from its top, up while the sheet is not at its tallest.'],
  ['swipeToClose', '`Bind<boolean>`', '`true`', 'Dragged or flicked down below its lowest height, it closes.'],
  ['flickSpeed', '`Bind<number>`', '`0.4`', 'How fast a flick goes on to the next height, in pixels per millisecond.'],
  ['closeOnEscape, closeOnScrim', '`Bind<boolean>`', '`true`', 'Escape and a press on the scrim close it.'],
  ['closeOnBack', '`Bind<boolean>`', '`true`', "The browser's back (Android's back button, the back gesture) closes it: it holds one history entry while open and takes it back when it closes otherwise, so no entry is left behind."],
  ['focusOnOpen', '`Bind<boolean>`', 'when modal', 'Focus moves in when it opens: `[autofocus]`, the first field, the first control, else the panel.'],
  ['returnFocus', '`Bind<boolean>`', '`true`', 'Focus goes back where it was when it closes.'],
  ['disposeOnClose', '`Bind<boolean>`', 'see text', 'Disposed when it closes: by default when `show` put it in its host.'],
  ['enabled, visible', 'see Control', '', 'The shared properties of every control.'],
];

const MEMBERS = [
  ['open()', '`boolean`', 'Opens it at `detent`; `false` when `onOpening` said no. Placed nowhere, it opens from the end of the page (or in its container).'],
  ['close(reason?)', '`boolean`', 'Closes it; `false` when `onClosing` kept it open.'],
  ['toggle()', '`boolean`', 'Opens or closes it.'],
  ['show(host, disposeRef?)', '`boolean`', 'Adds it to `host` (a component or the application) unless it is placed, and opens it; it is disposed when it closes.'],
  ['snapTo(detent)', '`boolean`', 'Moves it to a height (and opens it there when closed).'],
  ['expand(), collapse()', '`boolean`', 'To the next taller or lower height; `false` at the end.'],
  ['isOpen, height', 'read-only', 'Whether it is open (reactive), and its height now in pixels.'],
  ['panelElement, contentElement', 'read-only', 'The surface with `role="dialog"`, and the area that scrolls.'],
  ['onOpening / onOpened', 'events', '`{ cancel, source }` / `{ source }`; opened comes after it slid in.'],
  ['onClosing / onClosed', 'events', "`{ cancel, reason, source }` / `{ reason, source }`: `'code'`, `'escape'`, `'scrim'`, `'swipe'`, `'back'`, `'button'`, `'owner'`. The owner going away cannot be refused."],
  ['onDetentChanging / onDetentChanged', 'events', '`{ from, to, byUser, cancel, source }`: `to` can be changed; refused, the sheet goes back where it was.'],
];

const KEYS = [
  ['Escape', 'Closes it (`closeOnEscape`).'],
  ['Tab, Shift+Tab', 'Through its controls; modal, it goes round inside.'],
  ['Up, Right, Page Up (on the handle)', 'The next taller height.'],
  ['Down, Left, Page Down (on the handle)', 'The next lower height; it does not close it.'],
  ['Home, End (on the handle)', 'The lowest and the tallest height.'],
];

const TOUCH = [
  ['Drag the handle or the title', 'The sheet follows the finger or the mouse; let go, it goes to the nearest height. Past the tallest it gives a little.'],
  ['Flick', 'Faster than `flickSpeed`: on to the next height that way, however far it went.'],
  ['Drag or flick down past the lowest height', 'It closes (`swipeToClose`), with `reason: \'swipe\'`.'],
  ['Drag the content', 'Down from its top, or up while the sheet is not at its tallest, the sheet moves; otherwise the content scrolls. A sideways swipe is the content\'s.'],
  ['Tap the handle', 'The next height, round to the lowest.'],
];

const A11Y = [
  ['Dialog', 'The panel is `role="dialog"`, named by its title (else `label`, else "Sheet"), `aria-modal` when modal. What is around it is made `inert`, so screen readers and the keys stay inside.'],
  ['Handle', '`role="slider"`, vertical, named "Sheet height"; its value is the share of the full height, read as the height\'s name ("Half height").'],
  ['Focus', 'Moves in when it opens (modal by default) and back to where it was when it closes.'],
  ['Motion', 'It slides with the motion tokens; with reduced motion it just appears.'],
  ['Safe areas', 'The panel keeps clear of the screen\'s rounded corners and bars (`env(safe-area-inset-*)`).'],
];

const HOOKS = [
  ['.mx-bottom-sheet', 'The layer over the page or the container. `data-open`, `data-modal`, `data-scrim`, `data-contained`, `data-dragging`.'],
  ['.mx-bottom-sheet__scrim', 'The dimmed layer.'],
  ['.mx-bottom-sheet__panel', 'The dialog. `--_size` is its height, `--_drop` how far it is pulled below its lowest height.'],
  ['.mx-bottom-sheet__handle, .mx-bottom-sheet__grip', 'The handle (the slider) and the line drawn in it.'],
  ['.mx-bottom-sheet__header, __title, __tools, __close', 'The title row and its close button.'],
  ['.mx-bottom-sheet__body, .mx-bottom-sheet__footer', 'The content that scrolls, and the row under it.'],
];

const TOKENS = [
  ['sheet.scrim, sheet.panel', 'Units: the dimmed layer; the surface (`max-width`: how wide it gets on a large screen; `full`: its top corners once it reaches the top of the room).'],
  ['sheet.handle, sheet.grip', 'Units: the handle (`focus`: the keys) and its grip.'],
  ['sheet.header, sheet.title, sheet.tools, sheet.body, sheet.footer', 'Units: inside (`body.focus`: a ring inside the content).'],
  ['sheet.top-gap, sheet.peek-height, sheet.inset', 'The gap it leaves at the top at full height, the peek height, the room around the panel.'],
  ['sheet.handle-area, sheet.font-family', 'The handle’s grab area; the type’s family.'],
];

export default function BottomSheetPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A panel that comes up from the bottom of the page or of a container and stops at a few heights: a peek, half, full, as tall as its content, or heights of your own. Dragged by its handle and its title, flicked, swiped down to close; modal or not, with the browser's back closing it on a phone." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { BottomSheet, type BottomSheetDetent } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="In JSX, `x-model` opens and closes it with the state. Programmatically, `show(host)` puts it in a component and disposes it when it closes; `open()` and `close()` work on one that stays. Without a `container` it opens over the whole page, in the browser's top layer." />
        </p>
        <Example files={code('JsxAndCode.tsx')}>
          <JsxAndCode />
        </Example>
      </Section>

      <Section anchor="detents" title="Heights, dragging and options">
        <p>
          <Rich text="`detents` are the heights it stops at, `detent` the one it is at. The handle and the title follow the finger and the mouse; the content takes the sheet along from its top. Here it opens over a frame (`container`), not modal, so the page under it stays usable. Every behaviour is a switch, live." />
        </p>
        <Example files={code('Detents.tsx')}>
          <Detents />
        </Example>
      </Section>

      <Section anchor="events" title="Events">
        <p>
          <Rich text="Each opening, closing and change of height asks first and reports after. `onClosing` tells why (`reason`) and can keep it open; `onDetentChanging` can refuse a height or pick another." />
        </p>
        <Example files={code('Events.tsx')}>
          <Events />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
      </Section>

      <Section anchor="touch" title="Finger and mouse">
        <ApiTable head={['Gesture', 'What it does']} rows={TOUCH} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="The handle's name and heights, the default name and the close button come from `uiLocale.strings` (`sheetHandle`, `sheetPeek`, `sheetHalf`, `sheetFull`, `sheetFit`, `sheetHeight`, `sheetLabel`, `close`)." />
        </p>
        <Example files={code('Localization.tsx')}>
          <Localization />
        </Example>
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
        <p>
          <Rich text="Every prop is a property too, taking a value or a function. The shared parts (the panel, the scrim, modality, focus and the back button) are `OverlayPanel`'s, which `Drawer` and `ActionSheet` build on as well." />
        </p>
      </Section>
    </>
  );
}
