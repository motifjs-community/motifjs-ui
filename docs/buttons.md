# Buttons

> Buttons · @motifx-community/ui 0.1.0-beta.11

Buttons start commands. The group covers single buttons, groups of them and a floating button for the main action of a screen. Toolbars and menus, which hold the many commands of an application, are in [Navigation](navigation.md).

## Commands of an editor

A menu bar, a toolbar with toggles and a menu, a segmented choice for the view, a split button for saving, a context menu on the text and a speed dial for new items, all working on one document. Alt with an underlined letter runs a command.

```tsx
import { reactive, type Component } from '@motifx/core';
import { Button, ButtonGroup, MenuBar, SpeedDial, Toolbar, attachContextMenu, type MenuItem, type ToolbarItem } from '@motifx-community/ui';

const icon = (name: string) => () => <span class="mx-glyph" data-icon={name} />;

/** The commands of a small editor: a menu bar, a toolbar, a segmented choice, a split button, a context menu and a speed dial. */
export default function ButtonsDemo() {
    const s = reactive({ bold: false, italic: false, view: 'edit' as unknown, saved: 0, log: 'Ready.' });
    const did = (what: string) => (s.log = what);
    const save = () => {
        s.saved++;
        did(`Saved, version ${s.saved}.`);
    };

    const menus: MenuItem[] = [
        {
            text: '&File',
            items: [
                { text: '&New', shortcut: 'Ctrl+N', click: () => did('A new document.') },
                { text: '&Save', shortcut: 'Ctrl+S', click: save },
                { text: 'Export as &PDF', beginGroup: true, click: () => did('Exported as PDF.') }
            ]
        },
        {
            text: '&Edit',
            items: [
                { text: '&Undo', shortcut: 'Ctrl+Z', click: () => did('Undone.') },
                { text: '&Redo', shortcut: 'Ctrl+Y', click: () => did('Done again.') }
            ]
        },
        {
            text: '&View',
            items: [
                { text: '&Edit', group: 'view', checked: () => s.view === 'edit', click: () => (s.view = 'edit') },
                { text: '&Preview', group: 'view', checked: () => s.view === 'preview', click: () => (s.view = 'preview') }
            ]
        }
    ];

    const tools: ToolbarItem[] = [
        { icon: icon('undo'), hint: 'Undo', click: () => did('Undone.') },
        { icon: icon('search'), hint: 'Find', click: () => did('Find.') },
        { type: 'separator' },
        { type: 'toggle', text: 'Bold', pressed: () => s.bold, click: () => (s.bold = !s.bold) },
        { type: 'toggle', text: 'Italic', pressed: () => s.italic, click: () => (s.italic = !s.italic) },
        { type: 'separator' },
        {
            type: 'menu',
            text: 'Insert',
            menu: [
                { text: '&Table', click: () => did('A table inserted.') },
                { text: '&Chart', click: () => did('A chart inserted.') },
                { text: '&Picture', click: () => did('A picture inserted.') }
            ]
        }
    ];

    const attach = (page: Component<HTMLDivElement>) =>
        page.motif.setDisposable(
            attachContextMenu(page, () => [
                { text: 'Cu&t', shortcut: 'Ctrl+X', click: () => did('Cut.') },
                { text: '&Copy', shortcut: 'Ctrl+C', click: () => did('Copied.') },
                { text: '&Paste', shortcut: 'Ctrl+V', click: () => did('Pasted.') },
                { text: '&Bold', beginGroup: true, checked: () => s.bold, click: () => (s.bold = !s.bold) }
            ])
        );

    return (
        <div class="ov-frame ov-buttons">
            <MenuBar label="Editor" items={menus} />
            <div class="ov-bar">
                <Toolbar label="Format" items={tools} style="flex: 1 1 18rem" />
                <ButtonGroup label="View" items={[{ value: 'edit', text: 'Edit' }, { value: 'preview', text: 'Preview' }]} x-model={() => s.view} size="sm" />
                <Button
                    text="Sa&ve"
                    tone="accent"
                    split
                    onclick={save}
                    menu={[
                        { text: 'Save &as…', click: () => did('Save as…') },
                        { text: 'Save a &copy', click: () => did('A copy saved.') }
                    ]}
                />
            </div>
            <div
                class="ov-page"
                tabindex="0"
                onBuilt={attach}
                style={() => `font-weight: ${s.bold ? 600 : 400}; font-style: ${s.italic ? 'italic' : 'normal'}`}
            >
                {() =>
                    s.view === 'edit'
                        ? 'Quarterly report. Right-click here, or focus this text and press the Menu key, for the context menu. Bold and Italic in the toolbar change this text.'
                        : 'Preview of the quarterly report: the page as it will print.'
                }
            </div>
            <div class="ov-status">
                <output class="ov-buttons-log">{() => s.log}</output>
                <SpeedDial
                    position="inline"
                    direction="start"
                    text="New"
                    actions={[
                        { text: 'New page', glyph: 'file', click: () => did('A new page.') },
                        { text: 'New comment', glyph: 'pencil', click: () => did('A new comment.') },
                        { text: 'Upload', glyph: 'upload', click: () => did('Upload.') }
                    ]}
                />
            </div>
        </div>
    );
}
```

## Components in this group

Each component has its own page with its examples and its full API.

| Component | For |
| --- | --- |
| `[Button](button.md)` | One command, with an icon, a menu or a split part; a toggle; a busy state while the command runs. |
| `[ButtonGroup](buttongroup.md)` | A few related buttons side by side: one or several pressed, or plain actions. |
| `[SpeedDial](speeddial.md)` | A floating button for the main action, opening related actions in a line or a circle. |

## Choosing a component

Several components can do the same job; this table points to the one that reads best for it.

| To | Use |
| --- | --- |
| `Run one command` | [Button](button.md) |
| `Show a choice of a few options at once` | [ButtonGroup](buttongroup.md), or [RadioGroup](radiogroup.md) in a form |
| `Keep many commands in one bar at any width` | [Toolbar](toolbar.md) |
| `Offer the commands of a whole application` | [MenuBar](menus.md) |
| `Act on what is under the pointer` | [ContextMenu](menus-context.md) |
| `Give a screen one main action, on a phone too` | [SpeedDial](speeddial.md) |

## What they share

A command's text takes an access key: an `&` before a letter underlines it, and Alt with that letter runs the command. Menus open from the keyboard, move with the arrow keys and close with Escape.

Icons come from any element or image address. A button with only an icon is named by its `hint`, which also shows as its tooltip.

`variant`, `tone` and `size` set the look in every component of the group, and the design language draws the rest.

## Accessibility

| Topic | Details |
| --- | --- |
| `Roles` | Buttons, toggle buttons with their pressed state, menus and menu bars, toolbars with one Tab stop. |
| `Keyboard` | Enter and Space press a button; the arrow keys move inside a toolbar, a group and a menu; Escape closes a menu. |
| `Focus` | A disabled command can stay focusable, so readers still find it and learn why it is off. |

## Feedback

Loading issues…
