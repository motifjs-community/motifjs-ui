# RibbonMenu: Commands

> RibbonMenu · @motifx-community/ui 0.1.0-beta.11

A group holds commands of three sizes and eight types. Every field of a command is a value or a function the menu follows, so the commands change with the application’s state.

## Every command

This menu does not give way (`adaptive: false`), so every command keeps the size it is given; scroll the commands to see them all.

```tsx
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
```

## Sizes

| Size | Description |
| --- | --- |
| ``large`` | The icon above the text, as high as the group. A gallery is large by default. |
| ``medium`` | The icon beside the text. Medium and small commands stand three to a column. The default. |
| ``small`` | The icon alone. The text names it and appears as its tooltip. |

Every row has the same height in every tab, whatever stands in it: a field or a button. The menu keeps its height when the user moves between tabs.

## Types

| Type | Description |
| --- | --- |
| ``button`` | Runs `click`. The default. |
| ``toggle`` | Stays pressed while `pressed` is `true`. As a function, `pressed` is followed, and `click` changes the value it reads. |
| ``split`` | Runs `click` from its own part, and opens `menu` from the arrow beside it. |
| ``menu`` | Opens `menu`. |
| ``row`` | A row of small commands (`commands`), such as the commands that style text. |
| ``content`` | Any content of the application (`content`), such as a drop-down or a number box. Made once, and kept. Give it the small size of fields, so it fits the row. |
| ``gallery`` | Its first choices (`items`) in a row and a button that opens all of them in a grid. `value` marks the chosen one, `columns` sets how many stand in a row, and `click` receives the choice as `e.item`. |
| ``separator`` | A line between commands. |

## Groups

A group has a name under its commands. With `more`, a button beside the name opens more options of the group, such as a window; `onGroupMore` reports it too. Its `glyph` or `icon` is shown on the button the group folds into when there is no room.

## Tabs of a context

A tab with `context`, such as one for a picture being edited, is drawn in the context color with a band over it. Show it with `visible` while the context lasts. Its context’s name is told to assistive technology, not shown.

## Feedback

Loading issues…
