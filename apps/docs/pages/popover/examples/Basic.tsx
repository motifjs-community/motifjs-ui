import { reactive } from '@motifx/core';
import { Button, Popover, Stack, TextBox } from '@motifx-community/ui';

/** A popover with a title, a close button and a small form; one made from code for a plain element. */
export default function Basic() {
    const s = reactive({ open: false, name: 'Ada', saved: '' });
    let button!: Button;
    let link!: HTMLElement;
    const coded = new Popover({ title: 'From code', content: new Button({ text: 'OK', variant: 'outline', onclick: () => coded.close() }) });

    return (
        <Stack orientation="horizontal" wrap align="center">
            <Button ref={(b: Button) => (button = b)} text="Rename" variant="outline" />
            <Popover target={() => button} title="New name" showClose x-model={() => s.open}>
                <Stack orientation="horizontal" wrap align="center">
                    <TextBox label="Name" x-model={() => s.name} />
                    <Button text="Save" tone="accent" onclick={() => ((s.saved = s.name), (s.open = false))} />
                </Stack>
            </Popover>
            <output class="po-saved">{() => (s.saved ? `Saved: ${s.saved}` : s.open ? 'Open' : 'Closed')}</output>
            <a
                href="#from-code"
                class="po-link"
                ref={(c: { element: HTMLElement }) => (link = c.element)}
                onclick={(e: Event) => {
                    e.preventDefault();
                    coded.target = link;
                    coded.toggle();
                }}
            >
                A popover from code
            </a>
        </Stack>
    );
}
