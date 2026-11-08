import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import CustomizableMenu from './examples/CustomizableMenu';
import CustomMenuCommands from './examples/CustomMenuCommands';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const CUSTOMIZATION = [
  ['hidden', '`string[]`', 'The items the user hid.'],
  ['order', '`Record<string, string[]>`', 'The order the user gave: the bar’s items under `\'\'`, a menu’s items under the name of the menu.'],
  ['moves', '`Record<string, string>`', 'The items the user moved to another menu, and the menu each went to.'],
  ['texts', '`Record<string, string>`', 'The names the user gave to items.'],
  ['added', '`MenuBarAddedItem[]`', 'The commands and menus the user added, each with its `id` (`user:1`).'],
];

const WINDOW = [
  ['Menus', 'Every item in a tree. Its check box shows or hides it; the toolbar adds a menu of the user’s own, renames, deletes what the user added, moves items up, down or into another menu, and resets. Alt with an arrow moves the selected item, F2 renames it, Delete deletes it.'],
  ['Commands', 'The commands given as `commands`, or the app’s commands (`commands.add`) when none are given, to add one to a menu.'],
  ['Keyboard', 'A [ShortcutEditor](/shortcuteditor): the app’s keyboard shortcuts, to assign other keys. `customizerKeyboard: false` leaves the page out.'],
];

export default function MenusCustomizationPage() {
  return (
    <>
      <p class="lead">
        <Rich text="With `customizable`, the user arranges the bar: hides and moves items, renames them, adds commands and menus, and changes keyboard shortcuts. The items you give stay as they are; what the user changed is one object for the app to save." />
      </p>

      <Section anchor="customization" title="Changes by the user">
        <p>
          <Rich text="The user right-clicks an item, or presses Shift+F10 on it, to hide it or move it along the bar or up and down its menu. An item with `customizable: false` stays shown and in its place, and nothing moves past it. “Customize…” in that menu, or `openCustomizer()`, opens the customizer window. On a touch screen the window takes the whole screen; `customizer: false` leaves the command out of the menu." />
        </p>
        <Example files={code('CustomizableMenu.tsx')} stack>
          <CustomizableMenu />
        </Example>
        <ApiTable head={['Page of the window', 'Content']} rows={WINDOW} />
      </Section>

      <Section anchor="saving" title="Saving the changes">
        <p>
          <Rich text="`onCustomized` reports everything the user changed so far as one plain object; assigning it to `customization` restores the changes, and `null` forgets them. An item of the app is named by its path in the items given and keeps that name wherever the user moves it, so a saved object still applies after the app adds items. How the object is stored is up to the app." />
        </p>
        <Code
          code={`
bar.customization = JSON.parse(localStorage.getItem('menu') ?? 'null');
bar.onCustomized((e) => localStorage.setItem('menu', JSON.stringify(e.customization)));
`}
        />
        <ApiTable head={['Field', 'Type', 'Description']} rows={CUSTOMIZATION} />
      </Section>

      <Section anchor="own-commands" title="Commands of your own in the menu">
        <p>
          <Rich text="`onCustomMenuOpening` occurs before the menu of a right-click opens, with the item, its path and the commands about to be shown: add commands of your own, leave some out, or set `cancel`. It occurs without `customizable` too, with no commands of the bar, so a bar can have a right-click menu of the app’s own." />
        </p>
        <Example files={code('CustomMenuCommands.tsx')} stack>
          <CustomMenuCommands />
        </Example>
      </Section>
    </>
  );
}
