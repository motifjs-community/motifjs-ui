# AppMenu

> AppMenu · @motifx-community/ui 0.1.0-beta.10

The main menu of an application. It slides in from the start edge with a list of items, and each item shows its own page beside the list or runs a command. The menu holds nothing of its own: the items, the pages and the commands are given by the application.

## Import

```tsx
import { AppMenu, type AppMenuItem } from '@motifx-community/ui';
```

## Pages and commands

An item with `page` shows that page beside the list. The page is created the first time it is shown, and kept. Any other item is a command (`click`) and closes the menu. Items with the same `group` stand together, and items with `bottom` stand at the bottom of the list.

```tsx
import { reactive } from '@motifx/core';
import { AppMenu, Button, ListBox, Stack, Switch, type AppMenuItem } from '@motifx-community/ui';

const RECENT = [
    { id: 'q3', text: 'Quarterly report.docx' },
    { id: 'budget', text: 'Budget 2027.xlsx' },
    { id: 'notes', text: 'Meeting notes.docx' },
    { id: 'plan', text: 'Launch plan.pptx' }
];

const TEMPLATES = ['Blank document', 'Letter', 'Report', 'Resume'];

/** The main menu of a document editor: every page and command is given by the app. */
export default function FileMenu() {
    const s = reactive({ open: false, told: 'nothing yet', file: 'q3', autosave: true });
    const run = (what: string) => () => (s.told = what);

    const items: AppMenuItem[] = [
        {
            key: 'home',
            text: '&Home',
            glyph: 'star',
            page: () => (
                <Stack gap="md">
                    <h2>Good morning</h2>
                    <Stack orientation="horizontal" gap="sm" wrap>
                        {TEMPLATES.map(t => <Button key={t} text={t} variant="outline" onclick={() => { s.told = `new: ${t}`; s.open = false; }} />)}
                    </Stack>
                    <h3>Recent</h3>
                    <ListBox label="Recent files" items={RECENT} itemText="text" itemValue="id" x-model={() => s.file} />
                </Stack>
            )
        },
        {
            key: 'new',
            text: '&New',
            glyph: 'plus',
            page: () => (
                <Stack gap="md">
                    <h2>New</h2>
                    <Stack orientation="horizontal" gap="sm" wrap>
                        {TEMPLATES.map(t => <Button text={t} onclick={() => { s.told = `new: ${t}`; s.open = false; }} />)}
                    </Stack>
                </Stack>
            )
        },
        {
            key: 'open',
            text: '&Open',
            glyph: 'file',
            page: () => (
                <Stack gap="md">
                    <h2>Open</h2>
                    <ListBox label="Files" items={RECENT} itemText="text" itemValue="id" x-model={() => s.file} />
                    <Button text="Open" onclick={() => { s.told = `open: ${s.file}`; s.open = false; }} />
                </Stack>
            )
        },
        { key: 'info', text: '&Info', glyph: 'info', page: () => <Stack gap="md"><h2>Info</h2><p>{() => `Selected file: ${RECENT.find(r => r.id === s.file)?.text}`}</p></Stack> },
        { key: 'save', text: '&Save', glyph: 'save', group: 'file', click: run('save') },
        { key: 'copy', text: 'Save a &copy', group: 'file', page: () => <Stack gap="md"><h2>Save a copy</h2><Button text="Save a copy" onclick={run('save a copy')} /></Stack> },
        { key: 'export', text: '&Export', glyph: 'download', group: 'file', page: () => <Stack gap="md"><h2>Export</h2><Button text="Export as PDF" onclick={run('export as PDF')} /></Stack> },
        { key: 'share', text: 'S&hare', glyph: 'upload', group: 'file', click: run('share') },
        { key: 'account', text: '&Account', glyph: 'person', bottom: true, page: () => <Stack gap="md"><h2>Account</h2><p>Signed in as Ada Lovelace</p></Stack> },
        {
            key: 'options',
            text: 'O&ptions',
            glyph: 'more',
            bottom: true,
            page: () => (
                <Stack gap="md">
                    <h2>Options</h2>
                    <Switch label="Save automatically" x-model={() => s.autosave} />
                </Stack>
            )
        }
    ];

    return (
        <>
            <Button text="File" variant="outline" onclick={() => (s.open = true)} />
            <output class="am-file-told">{() => `Last command: ${s.told}`}</output>
            <AppMenu class="am-file" label="File" items={items} x-model={() => s.open} />
        </>
    );
}
```

## Topics

| Page | What it covers |
| --- | --- |
| `[Slots and search](appmenu-search.md)` | The app’s own content above and under the items, and a search over them. |
| `[Programmatic changes](appmenu-programmatic.md)` | Adding, removing, moving and changing items by key. |
| `[API reference](appmenu-api.md)` | Props, item fields, members, events, styling hooks and tokens. |

## Layout

| Room | Layout |
| --- | --- |
| `Wide window` | The menu covers half of the window (`app-menu.share`), with the list beside the page. |
| `Half the window is too narrow` | When half the window is narrower than `app-menu.min-size`, the menu covers the whole window. |
| `The menu is too narrow for both` | When the menu is narrower than `app-menu.split-size`, the list and the page take turns, the one coming in pushing the other out. Choosing a page shows it, and Back or Escape returns to the list. |

## Keyboard

| Key | Action |
| --- | --- |
| `Arrow Down, Arrow Up` | Moves between the items of both lists, wrapping at the ends. |
| `Home, End` | Moves to the first or the last item. |
| `Enter, Space` | Shows the page of the item, or runs its command. |
| `A letter` | Chooses the item with that access key. Without one, moves to the next item whose text starts with the letters typed. |
| `Escape` | Clears the search, returns to the list when the page is shown alone, and otherwise closes the menu. |
| `Tab, Shift+Tab` | Moves between the list and the page. Focus stays inside the menu. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Dialog` | The panel is a modal `dialog` named by `label` or by the language pack; the page around it is `inert`. |
| `List` | The list is a `nav` named like the menu. The item whose page is shown has `aria-current="page"`, a disabled one `aria-disabled`. |
| `Pages` | Each page is a `region` named by its item. Shown in place of the list, it takes focus. |
| `Focus` | It goes to the item shown when the menu opens, and back where it was when the menu closes. |
| `Reading direction` | The panel comes from the start edge and the arrows point to it, on the right in right-to-left pages. |
| `Motion` | The panel and the turns between list and page move with the motion tokens, and without motion when the user prefers reduced motion. |

## Localization

Its own texts come from `uiLocale.strings`: its name when it has none (`appMenuLabel`), the close and back buttons (`appMenuClose`, `appMenuBack`), the search (`search`) and what it says when nothing matches (`appMenuNoMatch`). They change with the language at once.

## Feedback

Loading issues…
