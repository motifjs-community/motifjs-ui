import { reactive, type Component } from '@motifx/core';
import { Button, Drawer, RadioGroup, Stack, Switch, type DrawerMode, type DrawerSide } from '@motifx-community/ui';

/** A drawer over a frame: its edge, over or pushing the content, a swipe in from the edge, modal or not. Every option is live. */
export default function Options() {
  const s = reactive({ open: false, side: 'start' as DrawerSide, mode: 'over' as DrawerMode, edge: true, modal: true, swipe: true, back: true });
  let frame!: Component<HTMLDivElement>;
  let content!: Component<HTMLDivElement>;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Switch label="Swipe in from the edge" x-model={() => s.edge} />
        <Switch label="Modal" x-model={() => s.modal} />
        <Switch label="Swipe back closes" x-model={() => s.swipe} />
        <Switch label="Back button closes" x-model={() => s.back} />
      </Stack>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <RadioGroup
          label="Edge"
          orientation="horizontal"
          items={[
            { value: 'start', text: 'Start' },
            { value: 'end', text: 'End' },
            { value: 'top', text: 'Top' },
            { value: 'bottom', text: 'Bottom' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.side}
        />
        <RadioGroup
          label="Mode"
          orientation="horizontal"
          items={[
            { value: 'over', text: 'Over' },
            { value: 'push', text: 'Push' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.mode}
        />
        <Button text="Open" variant="outline" onclick={() => (s.open = true)} />
      </Stack>
      <div ref={(c: Component<HTMLDivElement>) => (frame = c)} style="position: relative; block-size: 28rem; overflow: hidden; border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg); background: var(--mx-color-bg-layer)">
        <div ref={(c: Component<HTMLDivElement>) => (content = c)} style="block-size: 100%; padding: var(--mx-space-4); box-sizing: border-box">
          <p>The content of the frame. On a touch screen, swipe in from its edge.</p>
        </div>
      </div>
      <Drawer
        title="Filters"
        showClose
        container={() => frame}
        side={() => s.side}
        mode={() => s.mode}
        pushTarget={() => content}
        edgeSwipe={() => s.edge}
        modal={() => s.modal}
        swipeToClose={() => s.swipe}
        closeOnBack={() => s.back}
        size={() => (s.side === 'top' || s.side === 'bottom' ? '12rem' : null)}
        x-model={() => s.open}
      >
        <Stack gap="sm">
          <Switch label="Only unread" />
          <Switch label="With attachments" />
          <Button text="Apply" onclick={() => (s.open = false)} />
        </Stack>
      </Drawer>
    </>
  );
}
