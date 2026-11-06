import { reactive } from '@motifx/core';
import { CheckBox, MultiView, Stack, Stepper, TextBox, View } from '@motifx-community/ui';

/** A stepper and a multi-view bound to the same value: clicking a step or swiping a page updates both. */
export default function Pages() {
    const s = reactive({ page: 0 as string | number | null });
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Stepper class="mv-steps" label="Order" linear={false} items={['Address', 'Delivery', 'Payment']} x-model={() => s.page} />
            <MultiView class="mv-order" label="Order" x-model={() => s.page}>
                <View title="Address">
                    <Stack gap="sm">
                        <TextBox label="Street" />
                        <TextBox label="Town" />
                    </Stack>
                </View>
                <View title="Delivery">
                    <Stack gap="sm">
                        <CheckBox text="Leave it at the door" />
                        <CheckBox text="Send a message before" />
                    </Stack>
                </View>
                <View title="Payment">
                    <Stack gap="sm">
                        <TextBox label="Card number" />
                        <TextBox label="Name on the card" />
                    </Stack>
                </View>
            </MultiView>
            <output class="mv-order-page">{() => `page: ${s.page}`}</output>
        </Stack>
    );
}
