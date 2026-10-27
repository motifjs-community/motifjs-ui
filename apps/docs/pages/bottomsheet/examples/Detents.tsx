import { reactive, type Component } from '@motifx/core';
import { BottomSheet, Button, RadioGroup, Stack, Switch, type BottomSheetDetent } from '@motifx-community/ui';

const ROWS = Array.from({ length: 30 }, (_, i) => ({ id: i + 1, text: `Place ${i + 1}` }));

/** A sheet over a frame, at a peek, half or full height: drag the handle or the title, flick, use the arrow keys on the handle. Every behaviour is a switch. */
export default function Detents() {
  const s = reactive({
    open: true,
    detent: 'peek' as BottomSheetDetent,
    modal: false,
    handle: true,
    draggable: true,
    content: true,
    swipe: true,
    back: true,
  });
  let frame!: Component<HTMLDivElement>;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Switch label="Modal" x-model={() => s.modal} />
        <Switch label="Handle" x-model={() => s.handle} />
        <Switch label="Draggable" x-model={() => s.draggable} />
        <Switch label="Content drags it" x-model={() => s.content} />
        <Switch label="Swipe down closes" x-model={() => s.swipe} />
        <Switch label="Back button closes" x-model={() => s.back} />
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <RadioGroup
          label="Height"
          orientation="horizontal"
          items={[
            { value: 'peek', text: 'Peek' },
            { value: 'half', text: 'Half' },
            { value: 'full', text: 'Full' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.detent}
        />
        <Button text="Open" variant="outline" enabled={() => !s.open} onclick={() => (s.open = true)} />
      </Stack>
      <div ref={(c: Component<HTMLDivElement>) => (frame = c)} class="sheet-frame" style="position: relative; block-size: 28rem; overflow: hidden; border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg); background: var(--mx-color-bg-layer)">
        <p style="padding: var(--mx-space-4)">The page under the sheet. Non-modal, it stays usable.</p>
      </div>
      <BottomSheet
        title="Nearby"
        label="Nearby places"
        container={() => frame}
        detents={['peek', 'half', 'full']}
        x-model={() => s.open}
        detent={() => s.detent}
        onDetentChanged={(e) => (s.detent = e.to)}
        modal={() => s.modal}
        showHandle={() => s.handle}
        draggable={() => s.draggable}
        dragContent={() => s.content}
        swipeToClose={() => s.swipe}
        closeOnBack={() => s.back}
      >
        <ul style="margin: 0; padding: 0; list-style: none">
          {ROWS.map((row) => (
            <li key={row.id} style="padding-block: var(--mx-space-2); border-block-end: var(--mx-border-width-1) solid var(--mx-color-stroke-divider)">
              {row.text}
            </li>
          ))}
        </ul>
      </BottomSheet>
    </>
  );
}
