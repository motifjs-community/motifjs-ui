import { reactive } from '@motifx/core';
import { Button, MxForm, Stack } from '@motifx-community/ui';

const NoteIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3.5 2.5h9v11h-9zM5.5 5.5h5M5.5 8h5M5.5 10.5h3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

const SWITCHES = ['showMinimize', 'showMaximize', 'resizable', 'movable', 'useDock'] as const;

/** A form with an icon, minimize and maximize, that moves and resizes; every part has its switch. */
export default function Frame() {
  const s = reactive({ notes: false, showMinimize: true, showMaximize: true, resizable: true, movable: true, useDock: true });
  let dock: Stack | null = null;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Frame switches">
        {SWITCHES.map((key) => (
          <Button key={key} text={key === 'useDock' ? 'minimize to the strip' : key} size="sm" toggle x-model={() => s[key]} />
        ))}
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Open notes" variant="outline" onclick={() => (s.notes = true)} />
      </Stack>
      <Stack
        class="win-dock"
        orientation="horizontal"
        wrap
        align="center"
        ref={(c: Stack) => (dock = c)}
        aria-label="Minimized windows"
        role="group"
        style="inline-size: 100%; min-block-size: var(--mx-control-height-md); padding: var(--mx-space-2); border: var(--mx-border-width-1) dashed var(--mx-color-stroke-card); border-radius: var(--mx-radius-md)"
      />
      <MxForm
        class="win-notes"
        title="Notes"
        icon={() => <NoteIcon />}
        width="22rem"
        showMinimize={() => s.showMinimize}
        showMaximize={() => s.showMaximize}
        resizable={() => s.resizable}
        movable={() => s.movable}
        x-model={() => s.notes}
        onLoaded={(e) => (e.source.minimizeTarget = () => (s.useDock ? dock : null))}
      >
        <p>Drag the title bar, pull an edge, double-click the title bar.</p>
      </MxForm>
    </>
  );
}
