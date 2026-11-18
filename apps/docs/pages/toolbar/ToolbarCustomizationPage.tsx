import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import CustomizableToolbar from './examples/CustomizableToolbar';
import SendToToolbar from './examples/SendToToolbar';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const MENU = [
  ['Hide “Bold”', 'Hides an item of the app. On a command or separator the user added, “Remove” takes it away instead.'],
  ['Move left / Move right', 'Moves the item one place along the bar, past hidden items (Move up and Move down in a vertical toolbar; left and right follow the page’s direction).'],
  ['Add a separator before', 'Puts a separator before the item, unless one is there already. On a separator: “Remove the separator”.'],
  ['Display', 'Icon only, text only, or icon and text, for a button that has both.'],
  ['Show the hidden items', 'Shows every item the user hid.'],
  ['Customize…', 'Opens the customizer (`customizer: false` leaves it out).'],
  ['Undo all changes', 'Forgets everything the user changed.'],
];

const WINDOW = [
  ['Items', 'Every item in a list. Its check box shows or hides it; the toolbar adds a separator after the selected item, renames, deletes what the user added, moves items up and down, chooses what a button shows, and resets. Alt with an arrow moves the selected item, F2 renames it, Delete deletes it.'],
  ['Commands', 'The commands given as `commands`, or the app’s commands (`commands.add`) that have a text when none are given. “Add” puts the chosen one after the item selected on the first page.'],
  ['Keyboard', 'A [ShortcutEditor](/shortcuteditor): the app’s keyboard shortcuts, to assign other keys. `customizerKeyboard: false` leaves the page out.'],
];

const CUSTOMIZATION = [
  ['hidden', '`string[]`', 'The items the user hid.'],
  ['order', '`Record<string, string[]>`', 'The order the user gave, by key, under `\'\'`.'],
  ['texts', '`Record<string, string>`', 'The names the user gave to items.'],
  ['added', '`ToolbarAddedItem[]`', 'The commands (`{ id, command }`) and separators (`{ id, separator: true }`) the user added, each with its `id` (`user:1`).'],
  ['display', "`Record<string, 'icon' | 'text' | 'both'>`", 'What the user chose a button shows.'],
];

export default function ToolbarCustomizationPage() {
  return (
    <>
      <p class="lead">
        <Rich text="With `customizable`, the user arranges a toolbar: hides, moves and renames its items, adds commands and separators, chooses what a button shows, sends commands to it from the menus of the page, and changes keyboard shortcuts. The items you give stay as they are; what the user changed is one object for the app to save." />
      </p>

      <Section anchor="customization" title="Changes by the user">
        <p>
          <Rich text="The user right-clicks an item, or presses Shift+F10 or the Menu key on it, and the toolbar’s menu opens with what can be done there. An item with `customizable: false` stays shown and in its place, and nothing moves past it. JSX children (a text field, for example) are not part of the customization: they stay where they are and keep the browser’s own menu. The overflow menu follows the bar as the user arranged it." />
        </p>
        <Example files={code('CustomizableToolbar.tsx', 'icons.tsx')} stack>
          <CustomizableToolbar />
        </Example>
        <ApiTable head={['Command of the menu', 'What it does']} rows={MENU} />
        <p>
          <Rich text="“Customize…” in that menu, or `openCustomizer()`, opens the customizer window. On a touch screen the window takes the whole screen." />
        </p>
        <ApiTable head={['Page of the window', 'Content']} rows={WINDOW} />
      </Section>

      <Section anchor="display" title="What a button shows">
        <p>
          <Rich text="An item’s `display` says what its button shows: `icon`, `text`, or `both` (the default: whatever it is given). The user’s choice takes its place. A button that shows only its icon is named by its text, which also shows as its tooltip unless the item has a `hint`; in the overflow menu it keeps its text. A choice the button cannot follow (only the icon of a button without one) shows both." />
        </p>
        <Code
          code={`
{ key: 'bold', type: 'toggle', text: '&Bold', icon: BoldIcon, display: 'icon' }
`}
        />
      </Section>

      <Section anchor="saving" title="Saving the changes">
        <p>
          <Rich text="`onCustomized` reports everything the user changed so far as one plain object; assigning it to `customization` restores the changes, and `null` forgets them. An item of the app is named by its `key`, else by its position in `items`: give items a `key`, so a saved object still applies after the app adds or removes items. How the object is stored is up to the app." />
        </p>
        <Code
          code={`
bar.customization = JSON.parse(localStorage.getItem('format-bar') ?? 'null');
bar.onCustomized((e) => localStorage.setItem('format-bar', JSON.stringify(e.customization)));
`}
        />
        <ApiTable head={['Field', 'Type', 'Description']} rows={CUSTOMIZATION} />
      </Section>

      <Section anchor="send" title="Sending commands from menus">
        <p>
          <Rich text="A menu item and a toolbar button that name the same command of the app (`command: 'save'`, see [Commands and shortcuts](/commands)) are the same command: the button takes its text, icon, state and action from it. A customizable toolbar takes commands from the menus of the page: right-click an item of a [MenuBar](/menus) that names a command, and its menu offers “Add to the “Quick access” toolbar” for every such toolbar, or “Remove from…” where the command is shown already. Adding shows the toolbar’s own item of that command again when the user hid it, else adds the command as an item of the user’s; removing hides an item of the app and takes away one the user added. The saved object keeps only the command’s key, so it does not depend on the menus." />
        </p>
        <p>
          <Rich text="`acceptCommands: false` keeps a toolbar out of the menus. On the menu bar, `toolbarTargets: false` leaves the lines out; they are there whether or not the bar itself is `customizable`. A toolbar takes only commands it could offer in its customizer: those of `commands` when it is given, else the app’s." />
        </p>
        <Example files={code('SendToToolbar.tsx', 'icons.tsx')} stack>
          <SendToToolbar />
        </Example>
      </Section>

      <Section anchor="own-commands" title="Commands of your own in the menu">
        <p>
          <Rich text="`onCustomMenuOpening` occurs before the menu of a right-click opens, with the item, its name in the customization (`path`) and the commands about to be shown: add commands of your own, leave some out, or set `cancel`. It occurs without `customizable` too, with no commands of the toolbar, so a toolbar can have a right-click menu of the app’s own." />
        </p>
        <Code
          code={`
<Toolbar
  label="Format"
  items={items}
  onCustomMenuOpening={(e) => {
    if (e.path === 'bold') e.items.push({ text: 'Bold settings…', click: () => this.openBoldSettings() });
  }}
/>
`}
        />
      </Section>
    </>
  );
}
