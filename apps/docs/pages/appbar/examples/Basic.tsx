import { reactive } from '@motifx/core';
import { AppBar, Stack } from '@motifx-community/ui';

const icon = (name: string) => () => <span class="mx-glyph" data-icon={name} />;

/** A title, a menu button and commands. Commands that do not fit move into the "more" menu. */
export default function Basic() {
    const s = reactive({ told: 'nothing yet' });
    const actions = [
        { icon: icon('search'), hint: 'Search', click: () => (s.told = 'search') },
        { icon: icon('download'), hint: 'Download', click: () => (s.told = 'download') },
        { icon: icon('trash'), hint: 'Delete', click: () => (s.told = 'delete') }
    ];
    return (
        <Stack gap="md" style="inline-size: 100%">
            <AppBar class="ab-basic" position="static" title="Orders" subtitle="This week" navigation="menu" actions={actions} onNavigationClick={() => (s.told = 'the menu')} />
            <output class="ab-told">{() => `Pressed: ${s.told}`}</output>
        </Stack>
    );
}
