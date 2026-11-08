import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import MenuChanges from './examples/MenuChanges';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PATHS = [
  ['findItem(path)', '`MenuItem | null`', 'The item at the path, as it is now.'],
  ['addItem(parentPath, item, index?)', '`boolean`', 'Adds an item to the menu at `parentPath` (the bar when empty), at the end by default.'],
  ['removeItem(path)', '`boolean`', 'Removes the item with its menu.'],
  ['moveItem(path, index, toParent?)', '`boolean`', 'Moves the item to `index` in its menu, or in the menu at `toParent`.'],
  ['updateItem(path, changes)', '`boolean`', 'Changes fields of the item; the others stay as they are.'],
  ['beginUpdate(), endUpdate()', '`void`', 'Applies the changes made between them at once, with one `onItemsChanged`.'],
  ['refresh()', '`void`', 'Reads items changed in place again: the bar, the open menu and its submenus update.'],
];

export default function MenusProgrammaticPage() {
  return (
    <>
      <p class="lead">
        <Rich text="The items of a bar can be changed while it runs: by path, without building the whole list again, or in place followed by `refresh()`. Items can also name app commands, which give them their text, keys, state and action." />
      </p>

      <Section anchor="paths" title="Changes by path">
        <p>
          <Rich text="An item is named by the keys along the way, joined with `/`: `file/save`; an item without a `key` is named by its position. Each change makes a new list, in which the items along the changed path are new objects and the others are the ones given, and `onItemsChanged` reports it. An open menu stays open with its new items." />
        </p>
        <Example files={code('MenuChanges.tsx')} stack>
          <MenuChanges />
        </Example>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={PATHS} />
      </Section>

      <Section anchor="in-place" title="Changes in place">
        <p>
          <Rich text="Your items can be plain objects or reactive ones, and the bar reads them as they are. A field given as a function is followed by itself; after changing plain items in place, call `refresh()`." />
        </p>
        <Code
          code={`
const items = [{ key: 'file', text: '&File', items: [{ key: 'save', text: '&Save', enabled: () => doc.dirty }] }];
items[0].items.push({ key: 'print', text: '&Print' });
bar.refresh();
`}
        />
      </Section>

      <Section anchor="commands" title="Items that name commands">
        <p>
          <Rich text="An item with `command: 'save'` takes what it is not given from the app command with that key: its text, icon, hint, the keys shown at its end, its state and its action. The command’s keys run it, and the user can assign other keys to them. See [Commands and shortcuts](/commands)." />
        </p>
        <Code
          code={`
commands.add({ key: 'save', text: '&Save', shortcut: 'Mod+S', enabled: () => doc.dirty, run: () => doc.save() });
<MenuBar items={[{ key: 'file', text: '&File', items: [{ command: 'save' }] }]} />
`}
        />
      </Section>
    </>
  );
}
