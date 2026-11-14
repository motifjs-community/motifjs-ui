# AppMenu: Slots and search

> AppMenu · @motifx-community/ui 0.1.0-beta.10

The list can hold the app’s own content above and under its items, such as the user’s name or the version, and a search that narrows a long list as the user types.

## Slots and search

```tsx
import { reactive } from '@motifx/core';
import { AppMenu, Avatar, Button, Stack, type AppMenuItem } from '@motifx-community/ui';

const SETTINGS = ['General', 'Display', 'Proofing', 'Save', 'Language', 'Accessibility', 'Advanced', 'Add-ins', 'Trust'];

/** The user at the top of the list, the version at the bottom, and a search over many items. */
export default function SlotsSearch() {
    const s = reactive({ open: false, search: '' });
    const items: AppMenuItem[] = SETTINGS.map((name, i) => ({
        key: name.toLowerCase(),
        text: name,
        hint: `${name} settings`,
        group: i < 3 ? 'main' : 'more',
        page: () => (
            <Stack gap="md">
                <h2>{name}</h2>
                <p>The {name.toLowerCase()} settings of the app.</p>
            </Stack>
        )
    }));

    return (
        <>
            <Button text="Settings" variant="outline" onclick={() => (s.open = true)} />
            <output class="am-slots-told">{() => (s.search ? `Searching for “${s.search}”` : 'Not searching')}</output>
            <AppMenu
                class="am-slots"
                label="Settings"
                items={items}
                x-model={() => s.open}
                searchEnabled
                searchText={() => s.search}
                onSearchTextChanged={e => (s.search = e.text)}
                listHeader={
                    <Stack orientation="horizontal" gap="sm" align="center">
                        <Avatar name="Ada Lovelace" size="sm" />
                        <span>Ada Lovelace</span>
                    </Stack>
                }
                listFooter={<small>Version 2.4.1</small>}
            />
        </>
    );
}
```

## Above and under the items

`listHeader` stands under the close button, above the items; `listFooter` stands at the bottom, after the items at the bottom. Each is any component and can be given again at any time.

## Search

`searchEnabled` adds a search field above the items. Typing leaves the items whose text or hint holds what was typed, without case and marks, in the language of the page, and says so when nothing matches. Arrow Down moves to the first item left, Enter presses it, and Escape clears the search before it closes the menu. `searchText` is the text, and `onSearchTextChanged` reports what the user typed.

## Feedback

Loading issues…
