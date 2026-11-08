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
