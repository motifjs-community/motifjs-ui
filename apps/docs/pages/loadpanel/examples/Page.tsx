import { reactive } from '@motifx/core';
import { Button, LoadPanel, Stack } from '@motifx-community/ui';

/** Over the whole page, with a Cancel button: the work stops when it is pressed (or on Escape). */
export default function Page() {
    const s = reactive({ told: '' });
    let timer: ReturnType<typeof setTimeout> | null = null;
    const panel = new LoadPanel({
        message: 'Building the report…',
        cancelable: true,
        onCancel: () => {
            if (timer) clearTimeout(timer);
            timer = null;
            s.told = 'Cancelled.';
        }
    });
    const start = () => {
        s.told = '';
        panel.show();
        timer = setTimeout(() => {
            timer = null;
            panel.hide();
            s.told = 'The report is ready.';
        }, 4000);
    };
    return (
        <Stack orientation="horizontal" wrap align="center">
            <Button text="Build the report" variant="outline" onclick={start} />
            <span onConfig={c => c.controls.add(panel)} />
            <output class="lp-told">{() => s.told}</output>
        </Stack>
    );
}
