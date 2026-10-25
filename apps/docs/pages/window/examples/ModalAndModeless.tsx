import type { Component } from '@motifx/core';
import { Button, MxForm, Stack } from '@motifx-community/ui';

/** Modeless windows that stack and minimize to a strip, and a modal form that opens another. */
export default function ModalAndModeless() {
  let host: Component<HTMLDivElement> | null = null;
  let dock: Stack | null = null;
  let windows = 0;

  const openWindow = () => {
    const n = ++windows;
    const form = new MxForm({
      title: `Window ${n}`,
      showMinimize: true,
      showMaximize: true,
      startPosition: 'manual',
      left: 80 + n * 28,
      top: 120 + n * 28,
      width: '18rem',
      minimizeTarget: dock,
      content: <p>{`A modeless window, number ${n}.`}</p>,
    });
    form.show(host!);
  };

  const openNested = () => {
    const outer = new MxForm({ title: 'Level 1', width: '22rem' });
    const openInner = () => {
      const inner = new MxForm({ title: 'Level 2', content: <p>The form below is blocked until this one closes.</p> });
      void inner.showDialog(outer);
    };
    outer.content = (
      <Stack orientation="horizontal" wrap align="center">
        <p>A modal form.</p>
        <Button text="Open level 2" onclick={openInner} />
      </Stack>
    );
    void outer.showDialog(host!);
  };

  return (
    <>
      <Button text="Open a window" variant="outline" onclick={openWindow} />
      <Button text="Open nested modal forms" variant="outline" onclick={openNested} />
      <Stack
        orientation="horizontal"
        wrap
        align="center"
        ref={(c: Stack) => (dock = c)}
        aria-label="Minimized windows"
        role="group"
        style="inline-size: 100%; min-block-size: var(--mx-control-height-md); padding: var(--mx-space-2); border: var(--mx-border-width-1) dashed var(--mx-color-stroke-card); border-radius: var(--mx-radius-md)"
      />
      <div ref={(c: Component<HTMLDivElement>) => (host = c)} />
    </>
  );
}
