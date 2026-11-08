import { reactive } from '@motifx/core';
import { AppMenu, Button, Stack, type AppMenuItem } from '@motifx-community/ui';

const START: AppMenuItem[] = [
    { key: 'home', text: '&Home', glyph: 'star', page: () => <h2>Home</h2> },
    { key: 'open', text: '&Open', glyph: 'file', page: () => <h2>Open</h2> },
    { key: 'save', text: '&Save', glyph: 'save', group: 'file', click: () => {} },
    { key: 'account', text: '&Account', glyph: 'person', bottom: true, page: () => <h2>Account</h2> }
];

/** Items added, removed, moved and changed by key; a page that was opened stays as it was. */
export default function Programmatic() {
    const s = reactive({ open: false, changes: 0, unread: 0 });
    let menu!: AppMenu;

    return (
        <Stack gap="md">
            <Stack orientation="horizontal" gap="sm" wrap>
                <Button text="Open the menu" onclick={() => (s.open = true)} />
                <Button text="Add Print" variant="outline" onclick={() => menu.addItem({ key: 'print', text: '&Print', glyph: 'file', group: 'file', page: () => <h2>Print</h2> }, 3)} />
                <Button
                    text="New message on Account"
                    variant="outline"
                    onclick={() => {
                        s.unread++;
                        menu.updateItem('account', { badge: s.unread });
                    }}
                />
                <Button text="Move Save first" variant="outline" onclick={() => menu.moveItem('save', 0)} />
                <Button text="Remove Open" variant="outline" onclick={() => menu.removeItem('open')} />
                <Button
                    text="Start again"
                    variant="outline"
                    onclick={() => {
                        menu.items = START;
                        s.unread = 0;
                    }}
                />
            </Stack>
            <output class="am-programmatic-told">{() => `${s.changes} changes`}</output>
            <AppMenu class="am-programmatic" ref={(m: AppMenu) => (menu = m)} label="File" items={START} x-model={() => s.open} onItemsChanged={() => s.changes++} />
        </Stack>
    );
}
