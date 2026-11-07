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
