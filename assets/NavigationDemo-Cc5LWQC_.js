var e=`import { reactive, type Component } from '@motifx/core';\r
import { Button, ButtonGroup, MenuBar, SpeedDial, Toolbar, attachContextMenu, type MenuItem, type ToolbarItem } from '@motifx-community/ui';\r
\r
const icon = (name: string) => () => <span class="mx-glyph" data-icon={name} />;\r
\r
/** The commands of a small editor: a menu bar, a toolbar, a segmented choice, a split button, a context menu and a speed dial. */\r
export default function ButtonsDemo() {\r
    const s = reactive({ bold: false, italic: false, view: 'edit' as unknown, saved: 0, log: 'Ready.' });\r
    const did = (what: string) => (s.log = what);\r
    const save = () => {\r
        s.saved++;\r
        did(\`Saved, version \${s.saved}.\`);\r
    };\r
\r
    const menus: MenuItem[] = [\r
        {\r
            text: '&File',\r
            items: [\r
                { text: '&New', shortcut: 'Ctrl+N', click: () => did('A new document.') },\r
                { text: '&Save', shortcut: 'Ctrl+S', click: save },\r
                { text: 'Export as &PDF', beginGroup: true, click: () => did('Exported as PDF.') }\r
            ]\r
        },\r
        {\r
            text: '&Edit',\r
            items: [\r
                { text: '&Undo', shortcut: 'Ctrl+Z', click: () => did('Undone.') },\r
                { text: '&Redo', shortcut: 'Ctrl+Y', click: () => did('Done again.') }\r
            ]\r
        },\r
        {\r
            text: '&View',\r
            items: [\r
                { text: '&Edit', group: 'view', checked: () => s.view === 'edit', click: () => (s.view = 'edit') },\r
                { text: '&Preview', group: 'view', checked: () => s.view === 'preview', click: () => (s.view = 'preview') }\r
            ]\r
        }\r
    ];\r
\r
    const tools: ToolbarItem[] = [\r
        { icon: icon('undo'), hint: 'Undo', click: () => did('Undone.') },\r
        { icon: icon('search'), hint: 'Find', click: () => did('Find.') },\r
        { type: 'separator' },\r
        { type: 'toggle', text: 'Bold', pressed: () => s.bold, click: () => (s.bold = !s.bold) },\r
        { type: 'toggle', text: 'Italic', pressed: () => s.italic, click: () => (s.italic = !s.italic) },\r
        { type: 'separator' },\r
        {\r
            type: 'menu',\r
            text: 'Insert',\r
            menu: [\r
                { text: '&Table', click: () => did('A table inserted.') },\r
                { text: '&Chart', click: () => did('A chart inserted.') },\r
                { text: '&Picture', click: () => did('A picture inserted.') }\r
            ]\r
        }\r
    ];\r
\r
    const attach = (page: Component<HTMLDivElement>) =>\r
        page.motif.setDisposable(\r
            attachContextMenu(page, () => [\r
                { text: 'Cu&t', shortcut: 'Ctrl+X', click: () => did('Cut.') },\r
                { text: '&Copy', shortcut: 'Ctrl+C', click: () => did('Copied.') },\r
                { text: '&Paste', shortcut: 'Ctrl+V', click: () => did('Pasted.') },\r
                { text: '&Bold', beginGroup: true, checked: () => s.bold, click: () => (s.bold = !s.bold) }\r
            ])\r
        );\r
\r
    return (\r
        <div class="ov-frame ov-buttons">\r
            <MenuBar label="Editor" items={menus} />\r
            <div class="ov-bar">\r
                <Toolbar label="Format" items={tools} style="flex: 1 1 18rem" />\r
                <ButtonGroup label="View" items={[{ value: 'edit', text: 'Edit' }, { value: 'preview', text: 'Preview' }]} x-model={() => s.view} size="sm" />\r
                <Button\r
                    text="Sa&ve"\r
                    tone="accent"\r
                    split\r
                    onclick={save}\r
                    menu={[\r
                        { text: 'Save &as…', click: () => did('Save as…') },\r
                        { text: 'Save a &copy', click: () => did('A copy saved.') }\r
                    ]}\r
                />\r
            </div>\r
            <div\r
                class="ov-page"\r
                tabindex="0"\r
                onBuilt={attach}\r
                style={() => \`font-weight: \${s.bold ? 600 : 400}; font-style: \${s.italic ? 'italic' : 'normal'}\`}\r
            >\r
                {() =>\r
                    s.view === 'edit'\r
                        ? 'Quarterly report. Right-click here, or focus this text and press the Menu key, for the context menu. Bold and Italic in the toolbar change this text.'\r
                        : 'Preview of the quarterly report: the page as it will print.'\r
                }\r
            </div>\r
            <div class="ov-status">\r
                <output class="ov-buttons-log">{() => s.log}</output>\r
                <SpeedDial\r
                    position="inline"\r
                    direction="start"\r
                    text="New"\r
                    actions={[\r
                        { text: 'New page', glyph: 'file', click: () => did('A new page.') },\r
                        { text: 'New comment', glyph: 'pencil', click: () => did('A new comment.') },\r
                        { text: 'Upload', glyph: 'upload', click: () => did('Upload.') }\r
                    ]}\r
                />\r
            </div>\r
        </div>\r
    );\r
}\r
`,t=`import { reactive } from '@motifx/core';\r
import { CheckBox, ComboBox, DropDown, Lookup, RadioGroup, Switch } from '@motifx-community/ui';\r
\r
const TOPICS = ['Orders', 'Invoices', 'Comments', 'Releases'];\r
\r
const CITIES = ['Ankara', 'Antalya', 'Berlin', 'Bursa', 'İstanbul', 'İzmir', 'Lisbon', 'London', 'Madrid', 'Paris', 'Rome', 'Vienna'].map(name => ({ id: name, name }));\r
\r
const PEOPLE = [\r
    { id: 1, name: 'Ada Yılmaz', team: 'Design', city: 'Ankara' },\r
    { id: 2, name: 'Deniz Kaya', team: 'Web', city: 'İzmir' },\r
    { id: 3, name: 'Elif Demir', team: 'Mobile', city: 'İstanbul' },\r
    { id: 4, name: 'Mert Şahin', team: 'Web', city: 'Bursa' },\r
    { id: 5, name: 'Selin Aydın', team: 'Support', city: 'Antalya' }\r
];\r
\r
/** Notification settings: one of a few, on or off, several of a list with all of them at once, one of many with search, and a pick from a table. */\r
export default function ChoiceDemo() {\r
    const s = reactive({\r
        channel: 'mail' as unknown,\r
        quiet: false,\r
        topics: { Orders: true, Invoices: true, Comments: false, Releases: false } as Record<string, boolean>,\r
        language: 'en' as unknown,\r
        city: 'İzmir' as unknown,\r
        deputy: 2 as unknown\r
    });\r
    const chosen = () => TOPICS.filter(t => s.topics[t]);\r
    const all = () => (chosen().length === TOPICS.length ? true : chosen().length === 0 ? false : null);\r
\r
    return (\r
        <div class="ov-frame ov-choice">\r
            <h3 class="ov-title">Notifications</h3>\r
            <div class="ov-grid">\r
                <RadioGroup\r
                    label="Send them by"\r
                    items={[\r
                        { value: 'mail', text: 'E-mail' },\r
                        { value: 'sms', text: 'Text message' },\r
                        { value: 'push', text: 'Phone notification', helpText: 'Needs the app.' }\r
                    ]}\r
                    x-model={() => s.channel}\r
                />\r
                <div class="ov-stack">\r
                    <Switch label="Do not disturb at night" x-model={() => s.quiet} />\r
                    <CheckBox\r
                        class="ov-all-topics"\r
                        label="All topics"\r
                        threeState\r
                        value={all}\r
                        onValueChanged={e => {\r
                            // Partly on or all off, a press turns them all on; all on, it turns them off.\r
                            if (!e.byUser) return;\r
                            const on = chosen().length < TOPICS.length;\r
                            for (const t of TOPICS) s.topics[t] = on;\r
                        }}\r
                    />\r
                    <div class="ov-indent">\r
                        {TOPICS.map(t => (\r
                            <CheckBox label={t} x-model={() => s.topics[t]} />\r
                        ))}\r
                    </div>\r
                </div>\r
                <div class="ov-stack">\r
                    <DropDown\r
                        label="Language"\r
                        items={[\r
                            { value: 'en', text: 'English' },\r
                            { value: 'tr', text: 'Türkçe' },\r
                            { value: 'de', text: 'Deutsch' }\r
                        ]}\r
                        x-model={() => s.language}\r
                    />\r
                    <ComboBox label="Office" items={CITIES} textField="name" valueField="id" x-model={() => s.city} helpText="Type to search." />\r
                    <Lookup\r
                        label="Deputy while away"\r
                        items={PEOPLE}\r
                        textField="name"\r
                        valueField="id"\r
                        columns={[\r
                            { field: 'name', caption: 'Name', width: '2fr' },\r
                            { field: 'team', caption: 'Team' },\r
                            { field: 'city', caption: 'City' }\r
                        ]}\r
                        x-model={() => s.deputy}\r
                    />\r
                </div>\r
            </div>\r
            <output class="ov-status ov-choice-sum">\r
                {() =>\r
                    \`By \${s.channel}\${s.quiet ? ', quiet at night' : ''}; \${chosen().join(', ') || 'no topics'}; \${s.language}; \${s.city}; deputy \${PEOPLE.find(p => p.id === s.deputy)?.name ?? 'none'}.\`\r
                }\r
            </output>\r
        </div>\r
    );\r
}\r
`,n=`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { FilterBuilder, ListBox, TagBox, TreeView, filterText, type FilterBuilderField } from '@motifx-community/ui';\r
\r
interface Doc {\r
    id: number;\r
    name: string;\r
    folder: string;\r
    size: number;\r
    tags: string[];\r
}\r
\r
const FOLDERS = [\r
    {\r
        id: 'all',\r
        text: 'All files',\r
        children: [\r
            { id: 'invoices', text: 'Invoices', children: [{ id: 'invoices-2025', text: '2025' }, { id: 'invoices-2026', text: '2026' }] },\r
            { id: 'letters', text: 'Letters' },\r
            { id: 'pictures', text: 'Pictures' }\r
        ]\r
    }\r
];\r
\r
const DOCS: Doc[] = [\r
    { id: 1, name: 'january.pdf', folder: 'invoices-2025', size: 120, tags: ['paid'] },\r
    { id: 2, name: 'february.pdf', folder: 'invoices-2025', size: 98, tags: ['paid'] },\r
    { id: 3, name: 'march.pdf', folder: 'invoices-2026', size: 140, tags: ['open'] },\r
    { id: 4, name: 'april.pdf', folder: 'invoices-2026', size: 310, tags: ['open', 'urgent'] },\r
    { id: 5, name: 'bank.docx', folder: 'letters', size: 45, tags: ['sent'] },\r
    { id: 6, name: 'landlord.docx', folder: 'letters', size: 38, tags: ['draft'] },\r
    { id: 7, name: 'holiday.jpg', folder: 'pictures', size: 2400, tags: [] },\r
    { id: 8, name: 'team.png', folder: 'pictures', size: 860, tags: ['shared'] }\r
];\r
\r
const FIELDS: FilterBuilderField[] = [\r
    { dataField: 'name', caption: 'Name' },\r
    { dataField: 'size', caption: 'Size (KB)', dataType: 'number' }\r
];\r
\r
const TAGS = ['paid', 'open', 'urgent', 'sent', 'draft', 'shared'];\r
\r
/** A file library: folders in a tree, the files of the folder in a list, tags to narrow them down, and a filter of your own. */\r
export default function DataDemo() {\r
    const s = reactive({\r
        folder: 'all' as unknown,\r
        file: null as unknown,\r
        tags: [] as unknown,\r
        filter: null as data.FilterExpression | null\r
    });\r
    const inFolder = (doc: Doc, folder: string) => folder === 'all' || doc.folder === folder || doc.folder.startsWith(folder + '-');\r
    const files = () => {\r
        const folder = String((Array.isArray(s.folder) ? s.folder[0] : s.folder) ?? 'all');\r
        const tags = s.tags as string[];\r
        const own = data.createRowFilter(s.filter);\r
        return DOCS.filter(d => inFolder(d, folder) && tags.every(t => d.tags.includes(t))).filter(own);\r
    };\r
    const chosen = () => DOCS.find(d => d.id === s.file);\r
\r
    return (\r
        <div class="ov-frame ov-data">\r
            <div class="ov-split">\r
                <TreeView label="Folders" items={FOLDERS} expandedKeys={['all', 'invoices']} selectionMode="single" x-model={() => s.folder} />\r
                <div class="ov-stack">\r
                    <TagBox label="Tags" items={TAGS} x-model={() => s.tags} placeholder="Any tag" />\r
                    <FilterBuilder label="Filter" fields={FIELDS} locale="en" x-model={() => s.filter} />\r
                    <output class="ov-muted">{() => filterText(s.filter, { fields: FIELDS, locale: 'en' }) || 'No filter of your own.'}</output>\r
                    <ListBox class="ov-files-list" label="Files" items={files} textField="name" valueField="id" searchEnabled height={6} noItemsText="No files match." x-model={() => s.file} />\r
                </div>\r
            </div>\r
            <output class="ov-status ov-data-sum">{() => (chosen() ? \`\${chosen()!.name}, \${chosen()!.size} KB, \${chosen()!.tags.join(', ') || 'no tags'}\` : \`\${files().length} file(s)\`)}</output>\r
        </div>\r
    );\r
}\r
`,r=`import { reactive } from '@motifx/core';\r
import { Avatar, AvatarGroup, Badge, Barcode, Button, Card, Chip, ChipGroup, Gallery, QRCode, Skeleton, Switch, TileView, Timeline } from '@motifx-community/ui';\r
\r
/** A picture for the gallery: a coloured scene as a data address, so nothing is fetched. */\r
function scene(hue: number): string {\r
    const svg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(\${hue} 55% 58%)"/><stop offset="1" stop-color="hsl(\${hue + 40} 60% 32%)"/></linearGradient></defs><rect width="800" height="450" fill="url(#g)"/><circle cx="640" cy="120" r="64" fill="hsl(\${hue + 180} 70% 88% / 0.55)"/><path d="M0 330 Q200 250 400 330 T800 330 V450 H0 Z" fill="hsl(\${hue + 20} 50% 25% / 0.5)"/></svg>\`;\r
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);\r
}\r
\r
const SKILLS = ['Design systems', 'Accessibility', 'Motion', 'Research', 'Prototyping'];\r
\r
const STATS = [\r
    { key: 'projects', text: 'Projects', value: '18', wide: 2 },\r
    { key: 'reviews', text: 'Reviews', value: '124', wide: 1 },\r
    { key: 'talks', text: 'Talks', value: '6', wide: 1 }\r
];\r
\r
/** A profile: a card with an avatar and a badge, skills as chips, figures as tiles, projects in a gallery, the year on a timeline, and codes to share; with placeholders while it loads. */\r
export default function DisplayDemo() {\r
    const s = reactive({ loading: false, skills: ['Design systems', 'Accessibility'] as unknown, messages: 3 });\r
    const tile = (stat: (typeof STATS)[number]) => () => (\r
        <div class="ov-stat">\r
            <strong>{stat.value}</strong>\r
            <span>{stat.text}</span>\r
        </div>\r
    );\r
\r
    return (\r
        <div class="ov-frame ov-display">\r
            <div class="ov-bar">\r
                <Switch label="Show as loading" x-model={() => s.loading} />\r
                <span style="flex: 1 1 auto" />\r
                <Button text="Messages" variant="outline" onclick={() => (s.messages = 0)}>\r
                    <Badge count={() => s.messages} position="top-end" label="Unread messages" />\r
                </Button>\r
            </div>\r
            <div class="ov-grid">\r
                <Card title="Ada Yılmaz" subtitle="Lead designer, Ankara" avatar={{ name: 'Ada Yılmaz', status: 'online' }}>\r
                    <Skeleton lines={3} loading={() => s.loading}>\r
                        <p class="ov-copy">Works on the design system and its five design languages, and leads the accessibility reviews.</p>\r
                    </Skeleton>\r
                    <ChipGroup selection="multiple" label="Skills" x-model={() => s.skills}>\r
                        {SKILLS.map(skill => (\r
                            <Chip text={skill} />\r
                        ))}\r
                    </ChipGroup>\r
                    <div class="ov-bar">\r
                        <span class="ov-muted">Works with</span>\r
                        <AvatarGroup max={3} total={7} label="Team">\r
                            <Avatar name="Deniz Kaya" />\r
                            <Avatar name="Elif Demir" />\r
                            <Avatar name="Mert Şahin" />\r
                            <Avatar name="Selin Aydın" />\r
                        </AvatarGroup>\r
                    </div>\r
                </Card>\r
                <div class="ov-stack">\r
                    <TileView label="Figures" height={150} baseItemWidth={110} baseItemHeight={64} items={STATS.map(st => ({ key: st.key, widthRatio: st.wide, content: tile(st) }))} />\r
                    <Gallery\r
                        label="Projects"\r
                        height={180}\r
                        items={[\r
                            { image: scene(205), alt: 'The booking app', text: 'Booking app' },\r
                            { image: scene(30), alt: 'The new store', text: 'Store' },\r
                            { image: scene(280), alt: 'The dashboard', text: 'Dashboard' }\r
                        ]}\r
                    />\r
                </div>\r
                <Timeline\r
                    label="This year"\r
                    items={[\r
                        { date: '2026-02-10', title: 'Joined the design system team', tone: 'info' },\r
                        { date: '2026-05-21', title: 'Shipped the new color tokens', tone: 'success' },\r
                        { date: '2026-09-03', title: 'Spoke at the accessibility meetup', glyph: 'person' },\r
                        { date: '2026-11-07', title: 'Leads the gauge review' }\r
                    ]}\r
                />\r
                <div class="ov-codes">\r
                    <QRCode value="https://ui.motifjs.com/display" size={120} label="Profile address" />\r
                    <Barcode value="EMP-20460" format="code128" height={56} label="Staff number" />\r
                </div>\r
            </div>\r
        </div>\r
    );\r
}\r
`,i=`import { reactive } from '@motifx/core';\r
import {\r
    Button,\r
    Calendar,\r
    ColorBox,\r
    DateBox,\r
    DateRangeBox,\r
    FileUploader,\r
    NumberBox,\r
    OtpInput,\r
    Rating,\r
    Signature,\r
    Slider,\r
    TextArea,\r
    TextBox,\r
    ValidationGroup,\r
    ValidationSummary,\r
    toast,\r
    type DateRange\r
} from '@motifx-community/ui';\r
\r
// Stands in for a server: takes a file in a second and reports how far it is.\r
const send = (file: File, report: (fraction: number) => void) =>\r
    new Promise<string>(resolve => {\r
        let step = 0;\r
        const timer = setInterval(() => {\r
            report(++step / 10);\r
            if (step === 10) {\r
                clearInterval(timer);\r
                resolve(file.name);\r
            }\r
        }, 100);\r
    });\r
\r
/** A room booking: text, numbers, dates, a range, a choice of color, files, a code and a signature, checked together on Book. */\r
export default function EditorsDemo() {\r
    const group = new ValidationGroup();\r
    const today = new Date();\r
    const b = reactive({\r
        name: '',\r
        email: '',\r
        phone: '',\r
        guests: 2,\r
        stay: [null, null] as DateRange,\r
        arrival: null as Date | null,\r
        budget: [80, 180] as number[],\r
        accent: '#2f7d6d' as string | null,\r
        rating: 4,\r
        notes: '',\r
        code: '',\r
        strokes: null as unknown,\r
        day: today as Date | null\r
    });\r
\r
    const book = async () => {\r
        if (!(await group.validate())) return;\r
        toast.success(\`\${b.name}, your room for \${b.guests} is booked.\`, { title: 'Booked' });\r
    };\r
\r
    return (\r
        <div class="ov-frame ov-editors">\r
            <h3 class="ov-title">Book a room</h3>\r
            <ValidationSummary group={group} />\r
            <div class="ov-grid">\r
                <TextBox label="&Name" required x-model={() => b.name} validationGroup={group} />\r
                <TextBox label="E-&mail" type="email" required rules={[{ type: 'email' }]} x-model={() => b.email} validationGroup={group} />\r
                <TextBox label="&Phone" mask="(000) 000 00 00" x-model={() => b.phone} helpText="Only if we need to call you." />\r
                <NumberBox label="&Guests" min={1} max={6} required x-model={() => b.guests} validationGroup={group} />\r
                <DateRangeBox label="&Stay" required min={today} minDays={1} x-model={() => b.stay} validationGroup={group} />\r
                <DateBox label="&Arrival time" type="time" timeStep={30} x-model={() => b.arrival} />\r
                <Slider label="Budget a night" range min={40} max={300} step={10} x-model={() => b.budget} format={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }} showValue="drag" />\r
                <ColorBox label="Room light" x-model={() => b.accent} />\r
                <Rating label="Your last stay" x-model={() => b.rating} />\r
                <OtpInput label="Member code" length={6} x-model={() => b.code} helpText="Six digits from the member card." />\r
                <TextArea class="ov-wide" stretch label="Wishes" autoGrow maxLength={300} showCounter x-model={() => b.notes} />\r
                <FileUploader class="ov-wide" stretch label="Identity document" accept="image/*,.pdf" maxFiles={1} upload={send} />\r
                <Signature label="Signature" height={140} x-model={() => b.strokes} />\r
                <Calendar x-model={() => b.day} min={today} />\r
            </div>\r
            <div class="ov-status">\r
                <output class="ov-editors-sum">{() => \`\${b.guests} guest(s), \${b.budget[0]} to \${b.budget[1]} EUR a night\`}</output>\r
                <div class="ov-bar">\r
                    <Button text="Start again" variant="outline" onclick={() => group.reset()} />\r
                    <Button class="ov-book" text="&Book" tone="accent" onclick={() => void book()} />\r
                </div>\r
            </div>\r
        </div>\r
    );\r
}\r
`,a=`import { reactive } from '@motifx/core';\r
import { Button, LoadPanel, Panel, Popover, ProgressBar, Spinner, Tooltip, toast } from '@motifx-community/ui';\r
\r
const FILES = ['report.pdf', 'budget.xlsx', 'logo.svg', 'notes.md', 'photos.zip', 'plan.docx'];\r
\r
/** Syncing files: a spinner while it connects, a bar while it copies, a panel that blocks the list while it refreshes, a tooltip, a popover and toasts. */\r
export default function FeedbackDemo() {\r
    const s = reactive({ state: 'idle' as 'idle' | 'connecting' | 'copying' | 'done', copied: 0, refreshing: false, details: false, files: [...FILES] });\r
    let sync!: Button;\r
    let info!: Button;\r
    let list!: Panel;\r
    let timer = 0;\r
\r
    const start = () => {\r
        s.state = 'connecting';\r
        s.copied = 0;\r
        timer = window.setTimeout(() => {\r
            s.state = 'copying';\r
            timer = window.setInterval(() => {\r
                s.copied++;\r
                if (s.copied < FILES.length) return;\r
                clearInterval(timer);\r
                s.state = 'done';\r
                toast.success(\`\${FILES.length} files are up to date.\`, { title: 'Synced' });\r
            }, 450);\r
        }, 900);\r
    };\r
    const stop = () => {\r
        clearTimeout(timer);\r
        clearInterval(timer);\r
        s.state = 'idle';\r
        toast.caution('Syncing stopped. Files copied so far are kept.', { action: { text: 'Go on', click: start } });\r
    };\r
    const refresh = () => {\r
        s.refreshing = true;\r
        setTimeout(() => (s.refreshing = false), 1500);\r
    };\r
    const remove = () => {\r
        const file = s.files.pop();\r
        if (file) toast.info(\`\${file} removed.\`, { action: { text: 'Undo', click: () => s.files.push(file) } });\r
    };\r
\r
    return (\r
        <div class="ov-frame ov-feedback" onDisposing={() => (clearTimeout(timer), clearInterval(timer))}>\r
            <div class="ov-bar">\r
                <h3 class="ov-title" style="flex: 1 1 auto">Shared folder</h3>\r
                <Button ref={(b: Button) => (info = b)} icon={() => <span class="mx-glyph" data-icon="info" />} variant="ghost" aria-label="About syncing" />\r
                <Button ref={(b: Button) => (sync = b)} text={() => (s.state === 'connecting' || s.state === 'copying' ? 'Stop' : 'Sync now')} tone="accent" onclick={() => (s.state === 'connecting' || s.state === 'copying' ? stop() : start())} />\r
            </div>\r
            <Tooltip target={() => sync} text="Copies the changed files to the shared folder." />\r
            <Popover target={() => info} title="About syncing" showClose x-model={() => s.details}>\r
                Files you change on this computer are copied to the shared folder. A file changed in both places keeps both copies.\r
            </Popover>\r
            <div class="ov-sync">\r
                {s.state === 'connecting' ? (\r
                    <Spinner label="Connecting to the server" labelPosition="side" />\r
                ) : (\r
                    <ProgressBar\r
                        class="ov-sync-bar"\r
                        label={() => (s.state === 'done' ? 'Up to date' : s.state === 'copying' ? 'Copying files' : 'Not synced yet')}\r
                        value={() => s.copied}\r
                        max={FILES.length}\r
                        showValue\r
                        stretch\r
                        tone={() => (s.state === 'done' ? 'success' : 'accent')}\r
                    />\r
                )}\r
            </div>\r
            <Panel ref={(p: Panel) => (list = p)} variant="outline" padding="md" class="ov-files">\r
                <ul class="ov-file-list">\r
                    {s.files.map(f => (\r
                        <li>{f}</li>\r
                    ))}\r
                </ul>\r
            </Panel>\r
            <LoadPanel target={() => list} message="Refreshing the list" x-model={() => s.refreshing} />\r
            <div class="ov-bar">\r
                <Button text="Refresh the list" variant="outline" onclick={refresh} />\r
                <Button text="Remove the last file" variant="outline" enabled={() => s.files.length > 0} onclick={remove} />\r
            </div>\r
        </div>\r
    );\r
}\r
`,o=`import { reactive } from '@motifx/core';\r
import { Button, DateBox, NumberBox, Pagination, Panel, Switch, uiLocale } from '@motifx-community/ui';\r
import { kitTexts } from '../../../shared/kit-texts';\r
\r
/** What every control shares: access keys with Alt, one Tab stop per control, a panel that turns everything inside off, and the kit's language switched live. */\r
export default function FoundationsDemo() {\r
    const s = reactive({ price: 1234.5, when: new Date(2026, 2, 18) as Date | null, locked: false, log: 'Press Alt with an underlined letter.' });\r
    let panel!: Panel;\r
\r
    return (\r
        <div class="ov-frame ov-foundations">\r
            <div class="ov-bar">\r
                <Button text="&English" variant="outline" onclick={() => void uiLocale.use('en')} />\r
                <Button text="&Türkçe" variant="outline" onclick={() => void uiLocale.use('tr')} />\r
                <span class="ov-muted">\r
                    In use: <output class="ov-locale">{() => kitTexts.locale}</output>\r
                </span>\r
                <span style="flex: 1 1 auto" />\r
                <Switch label="&Lock the form" x-model={() => s.locked} onValueChanged={e => (panel.enabled = !e.value)} />\r
            </div>\r
            <Panel ref={(p: Panel) => (panel = p)} variant="outline" padding="md">\r
                <div class="ov-stack">\r
                <div class="ov-grid">\r
                    <NumberBox label="&Price" x-model={() => s.price} format={{ style: 'currency', currency: 'EUR' }} />\r
                    <DateBox label="&Date" x-model={() => s.when} clearButton />\r
                    <Pagination class="ov-wide" total={95} pageSizes={[10, 20, 50]} label="Orders" />\r
                </div>\r
                <div class="ov-bar">\r
                    <Button text="&Save" tone="accent" onclick={() => (s.log = 'Saved with Alt+S or a click.')} />\r
                    <Button text="&Reset" variant="outline" onclick={() => (s.log = 'Reset with Alt+R or a click.')} />\r
                </div>\r
                </div>\r
            </Panel>\r
            <output class="ov-status ov-foundations-log">{() => s.log}</output>\r
        </div>\r
    );\r
}\r
`,s=`import { reactive } from '@motifx/core';\r
import { Accordion, AccordionItem, AppBar, BottomNavigation, Breadcrumb, Drawer, ListBox, Pagination, Stepper, Tab, Tabs } from '@motifx-community/ui';\r
\r
const icon = (name: string) => () => <span class="mx-glyph" data-icon={name} />;\r
\r
const PROJECTS = [\r
    { id: 'web', text: 'Web shop' },\r
    { id: 'mobile', text: 'Mobile app' },\r
    { id: 'design', text: 'Design system' }\r
];\r
\r
const MEMBERS = Array.from({ length: 46 }, (_, i) => \`Member \${i + 1}\`);\r
\r
/** A project app: a top bar with a menu that opens a drawer, a path, tabs with steps, questions and pages, and a bar at the bottom. */\r
export default function NavigationDemo() {\r
    const s = reactive({ open: false, project: 'web' as unknown, step: 1, page: 1, place: 'projects' as unknown, told: 'nothing yet' });\r
    const project = () => PROJECTS.find(p => p.id === s.project)?.text ?? '';\r
    const pageOf = () => MEMBERS.slice((s.page - 1) * 8, s.page * 8);\r
\r
    return (\r
        <div class="ov-frame ov-frame--flush ov-navigation">\r
            <AppBar\r
                position="static"\r
                title={project}\r
                subtitle="Projects"\r
                navigation="menu"\r
                onNavigationClick={() => (s.open = true)}\r
                actions={[\r
                    { icon: icon('search'), hint: 'Search', click: () => (s.told = 'search') },\r
                    { icon: icon('download'), hint: 'Download', click: () => (s.told = 'download') },\r
                    { icon: icon('trash'), hint: 'Delete', click: () => (s.told = 'delete') }\r
                ]}\r
            />\r
            <Drawer title="Projects" showClose x-model={() => s.open}>\r
                <ListBox label="Projects" items={PROJECTS} textField="text" valueField="id" x-model={() => s.project} onclick={() => (s.open = false)} />\r
            </Drawer>\r
            <div class="ov-body">\r
                <Breadcrumb label="Path" items={() => [{ text: 'Home' }, { text: 'Projects' }, { text: project() }]} onItemClick={e => (s.told = String((e.item as { text?: string }).text ?? ''))} />\r
                <Tabs label="Project">\r
                    <Tab title="&Progress">\r
                        <div class="ov-stack ov-pad">\r
                            <Stepper label="Release" items={['Plan', 'Build', 'Test', 'Release']} x-model={() => s.step} clickable />\r
                            <Accordion>\r
                                <AccordionItem title="What happens in this step?" expanded>\r
                                    {() => ['The scope is agreed.', 'The features are built.', 'Every feature is tested.', 'The release goes out.'][s.step]}\r
                                </AccordionItem>\r
                                <AccordionItem title="Who signs it off?">The project lead and the product owner.</AccordionItem>\r
                            </Accordion>\r
                        </div>\r
                    </Tab>\r
                    <Tab title="&Members" badge={MEMBERS.length}>\r
                        <div class="ov-stack ov-pad">\r
                            <ul class="ov-file-list">\r
                                {pageOf().map(m => (\r
                                    <li>{m}</li>\r
                                ))}\r
                            </ul>\r
                            <Pagination label="Members" total={MEMBERS.length} pageSize={8} x-model={() => s.page} showInfo />\r
                        </div>\r
                    </Tab>\r
                    <Tab title="&Settings">\r
                        <p class="ov-pad ov-copy">Settings of the project go here.</p>\r
                    </Tab>\r
                </Tabs>\r
            </div>\r
            <BottomNavigation\r
                position="static"\r
                label="Sections"\r
                x-model={() => s.place}\r
                items={[\r
                    { value: 'projects', text: 'Projects', glyph: 'star', activeGlyph: 'star-filled' },\r
                    { value: 'inbox', text: 'Inbox', glyph: 'file', badge: 4 },\r
                    { value: 'calendar', text: 'Calendar', glyph: 'calendar' },\r
                    { value: 'profile', text: 'Profile', glyph: 'person' }\r
                ]}\r
            />\r
        </div>\r
    );\r
}\r
`;export{r as a,e as c,i,o as n,n as o,a as r,t as s,s as t};