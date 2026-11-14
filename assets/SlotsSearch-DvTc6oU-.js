var e=`import { reactive } from '@motifx/core';\r
import { AppMenu, Button, ListBox, Stack, Switch, type AppMenuItem } from '@motifx-community/ui';\r
\r
const RECENT = [\r
    { id: 'q3', text: 'Quarterly report.docx' },\r
    { id: 'budget', text: 'Budget 2027.xlsx' },\r
    { id: 'notes', text: 'Meeting notes.docx' },\r
    { id: 'plan', text: 'Launch plan.pptx' }\r
];\r
\r
const TEMPLATES = ['Blank document', 'Letter', 'Report', 'Resume'];\r
\r
/** The main menu of a document editor: every page and command is given by the app. */\r
export default function FileMenu() {\r
    const s = reactive({ open: false, told: 'nothing yet', file: 'q3', autosave: true });\r
    const run = (what: string) => () => (s.told = what);\r
\r
    const items: AppMenuItem[] = [\r
        {\r
            key: 'home',\r
            text: '&Home',\r
            glyph: 'star',\r
            page: () => (\r
                <Stack gap="md">\r
                    <h2>Good morning</h2>\r
                    <Stack orientation="horizontal" gap="sm" wrap>\r
                        {TEMPLATES.map(t => <Button key={t} text={t} variant="outline" onclick={() => { s.told = \`new: \${t}\`; s.open = false; }} />)}\r
                    </Stack>\r
                    <h3>Recent</h3>\r
                    <ListBox label="Recent files" items={RECENT} itemText="text" itemValue="id" x-model={() => s.file} />\r
                </Stack>\r
            )\r
        },\r
        {\r
            key: 'new',\r
            text: '&New',\r
            glyph: 'plus',\r
            page: () => (\r
                <Stack gap="md">\r
                    <h2>New</h2>\r
                    <Stack orientation="horizontal" gap="sm" wrap>\r
                        {TEMPLATES.map(t => <Button text={t} onclick={() => { s.told = \`new: \${t}\`; s.open = false; }} />)}\r
                    </Stack>\r
                </Stack>\r
            )\r
        },\r
        {\r
            key: 'open',\r
            text: '&Open',\r
            glyph: 'file',\r
            page: () => (\r
                <Stack gap="md">\r
                    <h2>Open</h2>\r
                    <ListBox label="Files" items={RECENT} itemText="text" itemValue="id" x-model={() => s.file} />\r
                    <Button text="Open" onclick={() => { s.told = \`open: \${s.file}\`; s.open = false; }} />\r
                </Stack>\r
            )\r
        },\r
        { key: 'info', text: '&Info', glyph: 'info', page: () => <Stack gap="md"><h2>Info</h2><p>{() => \`Selected file: \${RECENT.find(r => r.id === s.file)?.text}\`}</p></Stack> },\r
        { key: 'save', text: '&Save', glyph: 'save', group: 'file', click: run('save') },\r
        { key: 'copy', text: 'Save a &copy', group: 'file', page: () => <Stack gap="md"><h2>Save a copy</h2><Button text="Save a copy" onclick={run('save a copy')} /></Stack> },\r
        { key: 'export', text: '&Export', glyph: 'download', group: 'file', page: () => <Stack gap="md"><h2>Export</h2><Button text="Export as PDF" onclick={run('export as PDF')} /></Stack> },\r
        { key: 'share', text: 'S&hare', glyph: 'upload', group: 'file', click: run('share') },\r
        { key: 'account', text: '&Account', glyph: 'person', bottom: true, page: () => <Stack gap="md"><h2>Account</h2><p>Signed in as Ada Lovelace</p></Stack> },\r
        {\r
            key: 'options',\r
            text: 'O&ptions',\r
            glyph: 'more',\r
            bottom: true,\r
            page: () => (\r
                <Stack gap="md">\r
                    <h2>Options</h2>\r
                    <Switch label="Save automatically" x-model={() => s.autosave} />\r
                </Stack>\r
            )\r
        }\r
    ];\r
\r
    return (\r
        <>\r
            <Button text="File" variant="outline" onclick={() => (s.open = true)} />\r
            <output class="am-file-told">{() => \`Last command: \${s.told}\`}</output>\r
            <AppMenu class="am-file" label="File" items={items} x-model={() => s.open} />\r
        </>\r
    );\r
}\r
`,t=`import { reactive } from '@motifx/core';\r
import { AppMenu, Button, Stack, type AppMenuItem } from '@motifx-community/ui';\r
\r
const START: AppMenuItem[] = [\r
    { key: 'home', text: '&Home', glyph: 'star', page: () => <h2>Home</h2> },\r
    { key: 'open', text: '&Open', glyph: 'file', page: () => <h2>Open</h2> },\r
    { key: 'save', text: '&Save', glyph: 'save', group: 'file', click: () => {} },\r
    { key: 'account', text: '&Account', glyph: 'person', bottom: true, page: () => <h2>Account</h2> }\r
];\r
\r
/** Items added, removed, moved and changed by key; a page that was opened stays as it was. */\r
export default function Programmatic() {\r
    const s = reactive({ open: false, changes: 0, unread: 0 });\r
    let menu!: AppMenu;\r
\r
    return (\r
        <Stack gap="md">\r
            <Stack orientation="horizontal" gap="sm" wrap>\r
                <Button text="Open the menu" onclick={() => (s.open = true)} />\r
                <Button text="Add Print" variant="outline" onclick={() => menu.addItem({ key: 'print', text: '&Print', glyph: 'file', group: 'file', page: () => <h2>Print</h2> }, 3)} />\r
                <Button\r
                    text="New message on Account"\r
                    variant="outline"\r
                    onclick={() => {\r
                        s.unread++;\r
                        menu.updateItem('account', { badge: s.unread });\r
                    }}\r
                />\r
                <Button text="Move Save first" variant="outline" onclick={() => menu.moveItem('save', 0)} />\r
                <Button text="Remove Open" variant="outline" onclick={() => menu.removeItem('open')} />\r
                <Button\r
                    text="Start again"\r
                    variant="outline"\r
                    onclick={() => {\r
                        menu.items = START;\r
                        s.unread = 0;\r
                    }}\r
                />\r
            </Stack>\r
            <output class="am-programmatic-told">{() => \`\${s.changes} changes\`}</output>\r
            <AppMenu class="am-programmatic" ref={(m: AppMenu) => (menu = m)} label="File" items={START} x-model={() => s.open} onItemsChanged={() => s.changes++} />\r
        </Stack>\r
    );\r
}\r
`,n=`import { reactive } from '@motifx/core';\r
import { AppMenu, Avatar, Button, Stack, type AppMenuItem } from '@motifx-community/ui';\r
\r
const SETTINGS = ['General', 'Display', 'Proofing', 'Save', 'Language', 'Accessibility', 'Advanced', 'Add-ins', 'Trust'];\r
\r
/** The user at the top of the list, the version at the bottom, and a search over many items. */\r
export default function SlotsSearch() {\r
    const s = reactive({ open: false, search: '' });\r
    const items: AppMenuItem[] = SETTINGS.map((name, i) => ({\r
        key: name.toLowerCase(),\r
        text: name,\r
        hint: \`\${name} settings\`,\r
        group: i < 3 ? 'main' : 'more',\r
        page: () => (\r
            <Stack gap="md">\r
                <h2>{name}</h2>\r
                <p>The {name.toLowerCase()} settings of the app.</p>\r
            </Stack>\r
        )\r
    }));\r
\r
    return (\r
        <>\r
            <Button text="Settings" variant="outline" onclick={() => (s.open = true)} />\r
            <output class="am-slots-told">{() => (s.search ? \`Searching for “\${s.search}”\` : 'Not searching')}</output>\r
            <AppMenu\r
                class="am-slots"\r
                label="Settings"\r
                items={items}\r
                x-model={() => s.open}\r
                searchEnabled\r
                searchText={() => s.search}\r
                onSearchTextChanged={e => (s.search = e.text)}\r
                listHeader={\r
                    <Stack orientation="horizontal" gap="sm" align="center">\r
                        <Avatar name="Ada Lovelace" size="sm" />\r
                        <span>Ada Lovelace</span>\r
                    </Stack>\r
                }\r
                listFooter={<small>Version 2.4.1</small>}\r
            />\r
        </>\r
    );\r
}\r
`;export{t as n,e as r,n as t};