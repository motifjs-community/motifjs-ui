import { AppBar, Stack } from '@motifx-community/ui';

const icon = (name: string) => () => <span class="mx-glyph" data-icon={name} />;

/** A centered title, the accent tone, and a prominent title on a row of its own. */
export default function Looks() {
    const actions = [{ icon: icon('search'), hint: 'Search' }];
    return (
        <Stack gap="md" style="inline-size: 100%">
            <AppBar class="ab-center" position="static" title="Invoice" navigation="back" titleAlign="center" actions={actions} />
            <AppBar class="ab-accent" position="static" title="Inbox" tone="accent" navigation="menu" actions={actions} />
            <AppBar class="ab-prominent" position="static" title="Reports" prominent navigation="back" actions={actions} />
        </Stack>
    );
}
