import { reactive } from '@motifx/core';
import { DropDown, RibbonMenu, Stack, type RibbonTab } from '@motifx-community/ui';

const COLORS = [
    { key: 'ink', text: 'Ink', color: '#1f2937' },
    { key: 'sea', text: 'Sea', color: '#0e7490' },
    { key: 'leaf', text: 'Leaf', color: '#15803d' },
    { key: 'sun', text: 'Sun', color: '#b45309' },
    { key: 'rose', text: 'Rose', color: '#be123c' },
    { key: 'dusk', text: 'Dusk', color: '#6d28d9' }
];

/** Every size and type of command, in one tab. It does not give way, so every command keeps its size; what does not fit scrolls. */
export default function CommandTypes() {
    const s = reactive({ told: 'nothing yet', bold: false, wrap: true, color: 'sea', zoom: '100%' });
    const run = (what: string) => () => (s.told = what);

    const items: RibbonTab[] = [
        {
            key: 'commands',
            text: '&Commands',
            groups: [
                {
                    text: 'Sizes',
                    commands: [
                        { text: 'Large', glyph: 'star', size: 'large', click: run('large') },
                        { text: 'Medium', glyph: 'star', click: run('medium') },
                        { text: 'Medium too', glyph: 'star', click: run('medium too') },
                        { text: 'Small', glyph: 'star', size: 'small', click: run('small') }
                    ]
                },
                {
                    text: 'Types',
                    commands: [
                        { text: 'Split', glyph: 'save', size: 'large', type: 'split', click: run('split'), menu: [{ text: 'Save a copy', click: run('save a copy') }] },
                        { text: 'Bold', glyph: 'pencil', type: 'toggle', pressed: () => s.bold, click: () => (s.bold = !s.bold) },
                        { text: 'Wrap', glyph: 'columns', type: 'toggle', pressed: () => s.wrap, click: () => (s.wrap = !s.wrap) },
                        { text: 'Export', glyph: 'download', type: 'menu', menu: [{ text: 'As a PDF', click: run('pdf') }, { text: 'As a picture', click: run('picture') }] },
                        { type: 'separator' },
                        { type: 'row', commands: [{ text: 'Undo', glyph: 'undo', click: run('undo') }, { text: 'Repeat', glyph: 'repeat', click: run('repeat') }, { text: 'Delete', glyph: 'trash', click: run('delete') }] },
                        { type: 'content', content: () => <DropDown label="Zoom" labelMode="hidden" size="sm" style="inline-size: 7rem" items={['50%', '100%', '200%']} x-model={() => s.zoom} /> }
                    ]
                },
                {
                    text: 'Gallery',
                    priority: 1,
                    commands: [
                        {
                            type: 'gallery',
                            text: 'Colors',
                            columns: 3,
                            value: () => s.color,
                            items: COLORS.map(c => ({ key: c.key, text: c.text, icon: () => <span class="rb-swatch" style={`display: block; inline-size: 1.25rem; block-size: 1.25rem; border-radius: 50%; background: ${c.color}`} /> })),
                            click: e => {
                                s.color = String(e.item?.key);
                                s.told = `color: ${e.item?.text}`;
                            }
                        }
                    ]
                }
            ]
        }
    ];

    return (
        <Stack gap="md" style="inline-size: 100%">
            <RibbonMenu class="rb-types" items={items} layoutSwitch={false} adaptive={false} />
            <output class="rb-types-told">{() => `Last command: ${s.told}`}</output>
        </Stack>
    );
}
