import { reactive } from '@motifx/core';
import { Button, LoadPanel, Panel, Stack, TextBox } from '@motifx-community/ui';

/** A load panel over a panel while its orders load: bound with x-model, shown after a short delay. */
export default function Container() {
    const s = reactive({ loading: false, result: '' });
    let panel!: Panel;

    // Stands in for a call to the server.
    const load = () => {
        s.loading = true;
        s.result = '';
        setTimeout(() => {
            s.loading = false;
            s.result = 'Orders loaded.';
        }, 1800);
    };

    return (
        <Stack gap="md" style="inline-size: 100%">
            <Panel class="lp-panel" variant="outline" padding="md" style="min-block-size: 10rem" ref={(c: Panel) => (panel = c)}>
                <Stack orientation="horizontal" wrap align="center">
                    <TextBox label="Customer" value="Ada" />
                    <Button text="Load orders" tone="accent" onclick={load} />
                </Stack>
            </Panel>
            <LoadPanel target={() => panel} message="Loading orders" delay={200} x-model={() => s.loading} />
            <output class="lp-result">{() => s.result}</output>
        </Stack>
    );
}
