import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import AttachedMenu from './examples/AttachedMenu';
import FileList from './examples/FileList';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const BEHAVIOR = [
  ['Opening', 'A right-click opens the menu at the pointer; the Menu key and Shift+F10 open it at the focused element, on its first item.'],
  ['Items per element', '`onOpening` receives the element (`e.target`) and sets `e.items` for it, or `e.cancel = true` to leave the browser’s own menu.'],
  ['Closing', 'Escape, a click outside or choosing an item closes the menu; focus returns to the element it opened on.'],
  ['Scrolling', 'The menu follows the element it opened on while the page scrolls, and closes once the element is out of view (`closeOnScroll`).'],
  ['Room', 'A menu taller than the window scrolls inside and keeps its scroll position.'],
];

export default function MenusContextPage() {
  return (
    <>
      <p class="lead">
        <Rich text="The menu of an element: it opens on a right-click at the pointer, and with the Menu key or Shift+F10 at the focused element. Its items are the same as those of a menu bar." />
      </p>

      <Section anchor="context" title="A menu for each row">
        <p>
          <Rich text="A `ContextMenu` placed in an element belongs to it (`target` can name another). `onOpening` builds the items for the element under the pointer, in this case a row in a list: a locked file cannot be renamed. Setting `e.cancel = true` outside a row leaves the browser’s own menu." />
        </p>
        <Example files={code('FileList.tsx')} stack>
          <FileList />
        </Example>
      </Section>

      <Section anchor="attach" title="attachContextMenu">
        <p>
          <Rich text="`attachContextMenu(target, items)` attaches a menu to an element or a component without placing a component. `items` can be a function of the opening event. It returns a function that removes the menu." />
        </p>
        <Example files={code('AttachedMenu.tsx')}>
          <AttachedMenu />
        </Example>
      </Section>

      <Section anchor="behavior" title="Behavior">
        <ApiTable head={['Topic', 'Details']} rows={BEHAVIOR} />
        <p>
          <Rich text="The props, properties and events of `ContextMenu` are in the [API reference](/menus/api)." />
        </p>
      </Section>
    </>
  );
}
