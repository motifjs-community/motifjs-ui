import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import FollowsWidth from './examples/FollowsWidth';
import PresentationEvents from './examples/PresentationEvents';
import Presentations from './examples/Presentations';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const WAYS = [
  ['Desktop', 'The full layout: groups side by side and one above the other, dock areas around them, floating windows and new browser windows.'],
  ['Tablet', 'Up to two groups side by side, with the first branch of the layout on one side and the rest on the other, each showing its most recently used group. Groups that do not fit collapse as tabs into the strip of the adjacent group. Their tabs keep their own group, and tapping one activates that group there. Dock areas become drawers from their edge, with the bottom area as a sheet, and open from their titles along the edges or by swiping in from the edge. A floating window is a large sheet.'],
  ['Phone', 'One document at full screen. The bar above it shows its title (swipe left or right to move to the adjacent document, or tap to open its commands in an action sheet), its close button, and the number of open documents, which opens the document list. Dock area tools are buttons in a bottom bar. Tapping one opens a sheet (peek, half or full with its handle, and swipe down to close), or a drawer for an area configured to use one. A floating window is a full-screen sheet. New browser windows are disabled, and the tab menu is an action sheet.'],
];

const LIST = [
  ['Tap a row', 'Shows that document and closes the list.'],
  ['Swipe a row sideways', 'Closes the document, as determined by `onClosing`. A document that can only be hidden is hidden. Releasing early returns it to its place.'],
  ['Long press, then drag', 'Lifts the row. Drag it up or down within its group, or into the section of another group, and release to move the document there (`onMoving`, `onMoved`).'],
  ['Long press, let go', 'Opens the document\'s commands in an action sheet.'],
  ['Search', 'Filters by title and description.'],
  ['Up, Down, Home, End; Enter', 'Moves between rows, and Enter shows the document.'],
  ['Delete; Alt+Up, Alt+Down; the Menu key', 'Closes it, moves it one position up or down (past an end, into the previous or next group), or opens its commands.'],
];

const BACK = [
  ['A sheet or a drawer is open (a tool, a window, the list, an action sheet)', 'The Back button closes the topmost one.'],
  ['Nothing is open, and the manager has gone through documents', 'Goes back to the previous document (`goBack`), as long as there is one.'],
  ['Nothing to go back to', 'The browser handles it, and the page goes back.'],
];

const PROPS = [
  ['presentation', "`Bind<'auto' | 'desktop' | 'tablet' | 'phone'>`", "`'auto'`", 'How the layout is presented: based on the manager\'s own width, or always the same way.'],
  ['phoneWidth', '`Bind<number>`', '`560`', 'Below this width (of the manager, not the screen, in pixels), `auto` uses the phone presentation regardless of the pointer type.'],
  ['tabletWidth', '`Bind<number>`', '`1024`', 'Below this width, `auto` uses the tablet presentation on touch screens (see `tabletWhen`).'],
  ['tabletWhen', "`Bind<'touch' | 'width'>`", "`'touch'`", "With `'touch'`, the tablet presentation applies only when the device's pointer is a finger (`(pointer: coarse)`, tracked live). With a mouse, a narrow manager stays in the desktop presentation until it is below `phoneWidth`. With `'width'`, only the width is considered."],
  ['narrowBars', "`Bind<'compact' | 'documents'>`", "`'compact'`", "The appearance of the document group bars on a tablet or phone. By default, they use the `compact…` settings (no scroll buttons, shrinking tabs, small buttons, and a single document as a title), like the dock areas. `'documents'` keeps the desktop bar. Change the `compact…` props to adjust this appearance."],
  ['phoneDockMode', "`Bind<'auto' | 'sheet' | 'drawer' | 'hidden'>`", "`'sheet'`", 'How dock areas appear on a phone. An area\'s own `phoneDockMode` takes precedence.'],
  ['tabletDockMode', "`Bind<'auto' | 'sheet' | 'drawer' | 'hidden'>`", "`'auto'`", 'How dock areas appear on a tablet. `auto` uses a drawer for the sides and top, and a sheet for the bottom. An area\'s own `tabletDockMode` takes precedence.'],
  ['edgeSwipe', '`Bind<boolean>`', '`true`', 'On a tablet or phone, swiping in from an edge opens the dock area there as a drawer.'],
  ['backButton', '`Bind<boolean>`', '`true`', 'On a phone, the browser\'s back action goes back through the documents once nothing is open on top.'],
  ['menuPresentation', "`Bind<'menu' | 'sheet' | 'auto' | null>`", '`null`', 'How tab menus appear. `null` uses an action sheet on a phone, a sheet for touch on a tablet, and a menu in the desktop presentation.'],
  ['onPresentationChanging', '`(e: PresentationChangingEventArgs) => void`', '—', '`{ from, to, width, cancel }`. If canceled, the presentation stays the same until the width or the setting changes again.'],
  ['onPresentationChanged', '`(e: PresentationChangedEventArgs) => void`', '—', '`{ from, to, width }`.'],
];

const MEMBERS = [
  ['currentPresentation', 'read-only, reactive', "The current presentation: `'desktop'`, `'tablet'` or `'phone'`."],
  ['showDocumentList(), hideDocumentList()', '`boolean`', 'On a phone, opens or closes the list of open documents. `documentListOpen` is reactive.'],
  ['showTool(doc), hideTool(area)', '`boolean`', 'On a tablet or phone, opens a dock area\'s drawer or sheet with that document shown, or closes it. `activate(doc)` on a tool, or on a document in a floating window, also opens its drawer or sheet.'],
  ['TabDockArea.phoneDockMode, tabletDockMode', 'read/write, reactive', 'The area\'s own setting. `null` uses the manager\'s setting.'],
  ['split, move, float, dock, saveLayout…', 'unchanged', 'These work as in the desktop presentation and change the layout, which appears as the current presentation allows. `moveToNewWindow` returns `null` on a phone.'],
];

export default function TabDocsMobilePage() {
  return (
    <>
      <p class="lead">
        <Rich text="On tablets and phones, a layout of groups, splits and dock areas does not fit as designed. The manager keeps the layout and changes how it is presented: the documents, groups, areas and saved JSON stay the same, and content is moved rather than recreated. The presentation depends on the manager's own width rather than the device, and on touch screens its tabs and buttons are larger." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { TabDocumentManager, type TabPresentation, type TabDockPresentation } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Three presentations of one layout">
        <ApiTable head={['Presentation', 'Displayed content']} rows={WAYS} />
        <p>
          <Rich text="Choose one, and the underlying layout does not change. Save the layout in each presentation, and the JSON is identical." />
        </p>
        <Example files={code('Presentations.tsx')}>
          <Presentations />
        </Example>
      </Section>

      <Section anchor="width" title="Based on its own width">
        <p>
          <Rich text="With `presentation: 'auto'` (the default), the manager monitors its own width and the device's pointer type. Below `phoneWidth` (560), it uses the phone presentation regardless of the pointer. Phones are typically 360 to 430 pixels wide, so a manager of about 590 pixels next to a page's side column stays in the desktop presentation. Below `tabletWidth` (1024), it uses the tablet presentation on touch screens and stays in the desktop presentation with a mouse (`tabletWhen: 'width'` uses the width alone). An application can change both limits to fit its layout. Drag the corner of the frame in this example, and the text you typed in the note and the scroll position of a file are kept." />
        </p>
        <Example files={code('FollowsWidth.tsx')}>
          <FollowsWidth />
        </Example>
      </Section>

      <Section anchor="settings" title="Settings and events">
        <p>
          <Rich text="Every part is a setting that can change at runtime, including how dock areas appear in each presentation (an area can set its own), swiping from an edge, the Back button, and how tab menus appear. `onPresentationChanging` can refuse a change." />
        </p>
        <Example files={code('PresentationEvents.tsx')}>
          <PresentationEvents />
        </Example>
      </Section>

      <Section anchor="list" title="The document list on phones">
        <ApiTable head={['Gesture or key', 'Description']} rows={LIST} />
      </Section>

      <Section anchor="back" title="The Back button">
        <p>
          <Rich text="Android's Back button and the browser's back gesture use the session history. Each sheet, drawer and list holds one entry while it is open and removes it when it closes another way, so no entries are left behind. The manager holds one entry while it can go back through its documents." />
        </p>
        <ApiTable head={['When', 'Back']} rows={BACK} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="Props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>
          <Rich text="Members" />
        </h3>
        <ApiTable head={['Member', 'Returns', 'Description']} rows={MEMBERS} />
        <p>
          <Rich text="The drawers and sheets are the kit's [Drawer](/drawer) and [BottomSheet](/bottomsheet), and the action sheet is its [ActionSheet](/actionsheet)." />
        </p>
      </Section>
    </>
  );
}
