import { reactive } from '@motifx/core';
import { Button, MultiView, Stack, View } from '@motifx-community/ui';

/** Each page is created when first visible. With `keepAlive` off, the output of `content` is disposed while hidden and recreated. */
export default function Lazy() {
    const s = reactive({ made: 0, keep: true });
    let views!: MultiView;
    const report = (name: string) => () => {
        s.made++;
        return <p class="mv-lazy-page">{`${name}, made as number ${s.made}`}</p>;
    };
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Stack orientation="horizontal" wrap align="center">
                <Button text="Previous" variant="outline" onclick={() => void views.previous()} />
                <Button text="Next" variant="outline" onclick={() => void views.next()} />
                <Button text="Keep alive" variant="outline" toggle x-model={() => s.keep} />
                <output class="mv-lazy-made">{() => `made ${s.made} times`}</output>
            </Stack>
            <MultiView ref={(m: MultiView) => (views = m)} class="mv-lazy" label="Reports" keepAlive={() => s.keep}>
                <View title="Sales" content={report('Sales')} />
                <View title="Stock" content={report('Stock')} />
                <View title="Staff" content={report('Staff')} />
            </MultiView>
        </Stack>
    );
}
