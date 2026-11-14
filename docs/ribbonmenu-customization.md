# RibbonMenu: Customization

> RibbonMenu · @motifx-community/ui 0.1.0-beta.10

Users arrange the menu from its context menu: they hide what they never use, move what they use most, and add commands to the quick commands. Everything they change is one plain object, to save and give back.

## Arranging and saving

Right-click a command or a group, or press Shift+F10 on it. Here each change is saved in the browser and given back when the page opens again. Paste is `fixed`: it cannot be hidden or moved.

```tsx
import { reactive } from '@motifx/core';
import { Button, RibbonMenu, Stack, type RibbonMenuCustomization } from '@motifx-community/ui';
import { documentTabs } from './document-tabs';

const KEY = 'docs.ribbon.customization';

function load(): RibbonMenuCustomization | null {
    try {
        return JSON.parse(localStorage.getItem(KEY) ?? 'null') as RibbonMenuCustomization | null;
    } catch {
        return null;
    }
}

/** What the user changes with the context menu is saved, and given back when the page opens again. */
export default function Customize() {
    const s = reactive({ saved: load(), told: 'nothing yet' });
    const run = (what: string) => () => (s.told = what);

    return (
        <Stack gap="md" style="inline-size: 100%">
            <RibbonMenu
                class="rb-customize"
                items={documentTabs(run)}
                customization={() => s.saved}
                onCustomized={e => {
                    localStorage.setItem(KEY, JSON.stringify(e.customization));
                    s.saved = e.customization;
                }}
            />
            <Stack orientation="horizontal" gap="md" wrap align="center">
                <Button
                    text="Forget the changes"
                    variant="outline"
                    onclick={() => {
                        localStorage.removeItem(KEY);
                        s.saved = {};
                    }}
                />
                <output class="rb-customize-told">{() => `Last command: ${s.told}`}</output>
            </Stack>
            <pre class="rb-customize-json" style="margin: 0; white-space: pre-wrap">{() => JSON.stringify(s.saved ?? {}, null, 2)}</pre>
        </Stack>
    );
}
```

## The context menu

| Where | What the user can do |
| --- | --- |
| `On a command` | Add it to the quick commands or remove it, hide it, move it earlier or later in its group. |
| `On a group` | Hide the group, move it earlier or later in its tab. |
| `Always` | Show the hidden commands again, choose the layout, how the commands are shown and where the quick commands stand, and undo all changes. |

`customizable: false` leaves the browser’s own context menu. A group or a command with `fixed: true` cannot be hidden or moved.

## Saving

`onCustomized` reports everything the user changed so far as a `RibbonMenuCustomization`; give it back with `customization` and the menu starts from it. Groups and commands are named by their keys joined with `/`, so give them keys: a missing key is the position, which changes when the app adds items.

```tsx
{
  "hidden": ["home/editing/filter"],
  "order": { "home/clipboard": ["copy", "cut", "paste"] },
  "quick": ["home/insert/table"],
  "display": "tabs"
}
```

| Field | Type | Description |
| --- | --- | --- |
| `hidden` | `string[]` | The groups and commands the user hid. |
| `order` | `Record<string, string[]>` | The order the user gave: a tab’s groups under its key, a group’s commands under its path. |
| `quick` | `string[]` | The commands the user added to the quick commands. |
| `layout, display, quickBar` |  | The layout, the way the commands are shown and the place of the quick commands, as the user chose them. |

The menu never changes the tabs, groups and commands the app gives: hidden and moved items are drawn from its own copy of the user’s changes. `findCommand(path)` finds a command by its path.

## Feedback

Loading issues…
