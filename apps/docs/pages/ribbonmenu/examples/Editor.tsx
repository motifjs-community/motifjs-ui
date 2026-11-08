import { reactive } from '@motifx/core';
import { AppMenu, Button, DropDown, NumberBox, RibbonMenu, Stack, Switch, TextBox, type RibbonCommand, type RibbonTab } from '@motifx-community/ui';

const FONTS = ['Sans', 'Serif', 'Mono'];

const STYLES = [
    { key: 'normal', text: 'Normal', look: 'font-size: 0.875rem' },
    { key: 'heading1', text: 'Heading 1', look: 'font-size: 1.125rem; font-weight: 700' },
    { key: 'heading2', text: 'Heading 2', look: 'font-size: 1rem; font-weight: 600' },
    { key: 'title', text: 'Title', look: 'font-size: 1.25rem' },
    { key: 'quote', text: 'Quote', look: 'font-style: italic' },
    { key: 'code', text: 'Code', look: 'font-family: monospace' }
];

const letter = (text: string, style: string) => () => <span class="rb-letter" style={style}>{text}</span>;

/** The commands of a document editor: every tab, group and command is given by the app. */
export default function Editor() {
    const s = reactive({ style: 'normal', menu: false, tab: 'home', told: 'nothing yet', bold: false, italic: false, underline: false, ruler: true, grid: false, picture: false, font: 'Sans', size: 11 });
    const run = (what: string) => () => (s.told = what);

    const items: RibbonTab[] = [
        {
            key: 'home',
            text: '&Home',
            groups: [
                {
                    text: 'Clipboard',
                    glyph: 'file',
                    more: run('clipboard options'),
                    commands: [
                        { text: 'Paste', glyph: 'file', size: 'large', type: 'split', click: run('paste'), menu: [{ text: 'Keep source look', click: run('paste: keep look') }, { text: 'Keep text only', click: run('paste: text only') }] },
                        { text: 'Cut', glyph: 'trash', click: run('cut') },
                        { text: 'Copy', glyph: 'file', click: run('copy') },
                        { text: 'Copy look', glyph: 'eyedropper', click: run('copy look') }
                    ]
                },
                {
                    text: 'Font',
                    glyph: 'pencil',
                    more: run('font options'),
                    commands: [
                        { type: 'content', content: () => <DropDown label="Font" labelMode="hidden" size="sm" style="inline-size: 9rem" items={FONTS} x-model={() => s.font} /> },
                        { type: 'content', content: () => <NumberBox label="Size" labelMode="hidden" size="sm" style="inline-size: 6.5rem" min={6} max={96} x-model={() => s.size} /> },
                        {
                            type: 'row',
                            commands: [
                                { text: 'Bold', icon: letter('B', 'font-weight: 700'), type: 'toggle', pressed: () => s.bold, click: () => (s.bold = !s.bold) },
                                { text: 'Italic', icon: letter('I', 'font-style: italic'), type: 'toggle', pressed: () => s.italic, click: () => (s.italic = !s.italic) },
                                { text: 'Underline', icon: letter('U', 'text-decoration: underline'), type: 'toggle', pressed: () => s.underline, click: () => (s.underline = !s.underline) }
                            ]
                        }
                    ]
                },
                {
                    text: 'Styles',
                    glyph: 'star',
                    priority: 2,
                    commands: [
                        {
                            type: 'gallery',
                            text: 'Styles',
                            columns: 3,
                            value: () => s.style,
                            items: STYLES.map(st => ({ key: st.key, text: st.text, icon: () => <span class="rb-style" style={st.look}>Aa</span> })),
                            click: e => {
                                s.style = String(e.item?.key);
                                s.told = `style: ${e.item?.text}`;
                            }
                        }
                    ]
                },
                {
                    text: 'Editing',
                    glyph: 'search',
                    priority: 1,
                    commands: [
                        { text: 'Find', glyph: 'search', click: run('find') },
                        { text: 'Replace', glyph: 'pencil', click: run('replace') },
                        { text: 'Select', glyph: 'check', type: 'menu', menu: [{ text: 'Select all', click: run('select all') }, { text: 'Select similar', click: run('select similar') }] }
                    ]
                }
            ]
        },
        {
            key: 'insert',
            text: '&Insert',
            groups: [
                {
                    text: 'Tables',
                    commands: [{ text: 'Table', glyph: 'table', size: 'large', type: 'menu', menu: [{ text: 'Insert a table', click: run('insert table') }, { text: 'Draw a table', click: run('draw table') }] }]
                },
                {
                    text: 'Illustrations',
                    commands: [
                        { text: 'Chart', glyph: 'chart', size: 'large', click: run('chart') },
                        { type: 'separator' },
                        { text: 'Picture', glyph: 'file', click: run('picture') },
                        { text: 'Date', glyph: 'calendar', click: run('date') },
                        { text: 'Time', glyph: 'clock', click: run('time') }
                    ]
                }
            ]
        },
        {
            key: 'view',
            text: '&View',
            groups: [
                {
                    text: 'Show',
                    commands: [
                        { text: 'Ruler', glyph: 'columns', type: 'toggle', pressed: () => s.ruler, click: () => (s.ruler = !s.ruler) },
                        { text: 'Grid', glyph: 'table', type: 'toggle', pressed: () => s.grid, click: () => (s.grid = !s.grid) }
                    ]
                },
                { text: 'Zoom', commands: [{ text: 'Zoom out', glyph: 'zoom-out', size: 'large', click: run('zoom out') }] }
            ]
        },
        {
            key: 'picture',
            text: 'Picture &format',
            context: 'Picture',
            visible: () => s.picture,
            groups: [
                {
                    text: 'Adjust',
                    commands: [
                        { text: 'Crop', glyph: 'split', size: 'large', click: run('crop') },
                        { text: 'Rotate', glyph: 'repeat', click: run('rotate') },
                        { text: 'Lock', glyph: 'lock', click: run('lock') }
                    ]
                }
            ]
        }
    ];

    const quick: RibbonCommand[] = [
        { key: 'save', text: 'Save', glyph: 'save', click: run('save') },
        { key: 'undo', text: 'Undo', glyph: 'undo', click: run('undo') }
    ];

    return (
        <Stack gap="md" style="inline-size: 100%">
            <RibbonMenu
                class="rb-editor"
                items={items}
                x-model={() => s.tab}
                appButton="&File"
                onAppButton={() => (s.menu = true)}
                quickCommands={quick}
                barEnd={
                    <Stack orientation="horizontal" gap="sm" align="center">
                        <TextBox label="Search" labelMode="hidden" placeholder="Search" size="sm" style="inline-size: 12rem" />
                        <Button text="Share" size="sm" onclick={run('share')} />
                    </Stack>
                }
            />
            <Stack orientation="horizontal" gap="md" wrap align="center">
                <Switch label="A picture is chosen" x-model={() => s.picture} />
                <output class="rb-editor-told">{() => `Last command: ${s.told}`}</output>
            </Stack>
            <AppMenu
                label="File"
                x-model={() => s.menu}
                items={[
                    { key: 'info', text: '&Info', glyph: 'info', page: () => <p>Quarterly report.docx</p> },
                    { key: 'save', text: '&Save', glyph: 'save', click: run('save') }
                ]}
            />
        </Stack>
    );
}
