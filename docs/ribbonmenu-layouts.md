# RibbonMenu: Layouts and room

> RibbonMenu · @motifx-community/ui 0.1.0-beta.11

The menu has two layouts, and gives way step by step when its room shrinks: commands become smaller, groups fold, and what is left scrolls. Narrow enough, it turns compact.

## Less and less room

Move the slider to narrow the menu. Every group takes a step before any group takes the next. Groups with a lower `priority` give way first, and of equals, the last one first; here Editing has a higher priority. A group with `collapsible: false` never takes the last step, and `adaptive: false` turns giving way off, leaving only the scroll.

```tsx
import { reactive } from '@motifx/core';
import { ButtonGroup, RibbonMenu, Slider, Stack, Switch, type RibbonMenuLayout } from '@motifx-community/ui';
import { documentTabs } from './document-tabs';

/** The same menu in less and less room: the groups give way, then the commands scroll. */
export default function Room() {
    const s = reactive({ width: 720, layout: 'classic' as RibbonMenuLayout, adaptive: true, told: 'nothing yet' });
    const run = (what: string) => () => (s.told = what);

    return (
        <Stack gap="md" style="inline-size: 100%">
            <Stack orientation="horizontal" gap="lg" wrap align="center">
                <Slider label="Width" min={220} max={900} step={10} x-model={() => s.width} style="inline-size: 16rem" />
                <ButtonGroup
                    label="Layout"
                    x-model={() => s.layout}
                    items={[
                        { value: 'classic', text: 'Classic' },
                        { value: 'simple', text: 'Simplified' }
                    ]}
                />
                <Switch label="Give way" x-model={() => s.adaptive} />
            </Stack>
            <RibbonMenu class="rb-room" items={documentTabs(run)} style={() => `inline-size: ${s.width}px`} layout={() => s.layout} adaptive={() => s.adaptive} onLayoutChanged={e => (s.layout = e.layout)} />
            <output class="rb-room-told">{() => `${s.width} pixels · last command: ${s.told}`}</output>
        </Stack>
    );
}
```

| Step | What changes |
| --- | --- |
| `1` | Large commands become medium. |
| `2` | All commands become small: the icon alone, the text as the tooltip. A gallery becomes its button alone. |
| `3` | The group folds into one large button with its name and glyph, which opens the group in a popup. In the simplified layout, the group moves into the “more” menu at the end of the row instead. |
| `Then` | What still does not fit scrolls: by the buttons over the ends of the commands, the mouse wheel and a finger. |

## Classic and simplified

The classic layout (`layout: 'classic'`) shows the commands in columns under the names of their groups. The simplified layout (`layout: 'simple'`) shows them in a single row, without the names; a command with `simple: false` waits in the “more” menu. The button at the end of the commands switches between them (`layoutSwitch`), and `onLayoutChanged` reports the user’s choice.

## Compact

Narrower than the `ribbon-menu.compact-size` token, the menu shows a tab picker in place of its tabs and its commands in the simplified layout, as on a phone. `isCompact` tells whether it is compact; `layout` keeps the layout the user chose for when there is room again.

## Feedback

Loading issues…
