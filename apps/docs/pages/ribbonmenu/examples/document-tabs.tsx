import type { RibbonTab } from '@motifx-community/ui';

/** The tabs of a document editor, shared by the examples; `run` reports the command pressed. Paste is fixed: it cannot be hidden or moved. */
export function documentTabs(run: (what: string) => () => void): RibbonTab[] {
    return [
        {
            key: 'home',
            text: '&Home',
            groups: [
                {
                    key: 'clipboard',
                    text: 'Clipboard',
                    glyph: 'file',
                    commands: [
                        { key: 'paste', text: 'Paste', glyph: 'file', size: 'large', type: 'split', fixed: true, click: run('paste'), menu: [{ text: 'Keep text only', click: run('paste: text only') }] },
                        { key: 'cut', text: 'Cut', glyph: 'trash', click: run('cut') },
                        { key: 'copy', text: 'Copy', glyph: 'file', click: run('copy') }
                    ]
                },
                {
                    key: 'insert',
                    text: 'Insert',
                    glyph: 'plus',
                    commands: [
                        { key: 'table', text: 'Table', glyph: 'table', size: 'large', click: run('table') },
                        { key: 'chart', text: 'Chart', glyph: 'chart', size: 'large', click: run('chart') },
                        { key: 'date', text: 'Date', glyph: 'calendar', click: run('date') },
                        { key: 'time', text: 'Time', glyph: 'clock', click: run('time') }
                    ]
                },
                {
                    key: 'editing',
                    text: 'Editing',
                    glyph: 'search',
                    priority: 1,
                    commands: [
                        { key: 'find', text: 'Find', glyph: 'search', click: run('find') },
                        { key: 'replace', text: 'Replace', glyph: 'pencil', click: run('replace') },
                        { key: 'filter', text: 'Filter', glyph: 'filter', click: run('filter') }
                    ]
                }
            ]
        },
        {
            key: 'view',
            text: '&View',
            groups: [
                {
                    key: 'show',
                    text: 'Show',
                    commands: [
                        { key: 'columns', text: 'Columns', glyph: 'columns', size: 'large', click: run('columns') },
                        { key: 'zoom', text: 'Zoom out', glyph: 'zoom-out', click: run('zoom out') },
                        { key: 'full', text: 'Full screen', glyph: 'maximize', click: run('full screen') }
                    ]
                }
            ]
        }
    ];
}
