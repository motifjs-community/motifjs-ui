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
