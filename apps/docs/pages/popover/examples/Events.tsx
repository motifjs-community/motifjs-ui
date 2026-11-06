import { reactive } from '@motifx/core';
import { Button, Popover, Stack, TextArea } from '@motifx-community/ui';

/** A click outside does not close it, and onClosing keeps it open while there is unsaved text. Escape and the button close it. */
export default function Events() {
    const s = reactive({ note: '', told: '' });
    let button!: Button;
    let pop!: Popover;
    return (
        <Stack orientation="horizontal" wrap align="center">
            <Button ref={(b: Button) => (button = b)} text="Add a note" variant="outline" />
            <Popover
                ref={(p: Popover) => (pop = p)}
                target={() => button}
                title="Note"
                closeOnOutside={false}
                onClosing={e => {
                    if (e.reason === 'escape' && s.note.trim() !== '') {
                        e.cancel = true;
                        s.told = 'Save or clear the note first.';
                    }
                }}
                onClosed={reason => (s.told = `Closed: ${String(reason)}`)}
            >
                <Stack gap="sm">
                    <TextArea label="Text" x-model={() => s.note} rows={3} />
                    <Button text="Save" tone="accent" onclick={() => ((s.note = ''), pop.close())} />
                </Stack>
            </Popover>
            <output class="po-told">{() => s.told}</output>
        </Stack>
    );
}
