import { reactive, type Component } from '@motifx/core';
import { attachContextMenu } from '@motifx-community/ui';

const START = 'Right-click here, or focus me and press the Menu key.';
const BOX = 'padding: var(--mx-space-4); background: var(--mx-color-bg-card); border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg)';

/** A menu given to an element with `attachContextMenu`, its items built from the opening. */
export default function AttachedMenu() {
  const s = reactive({ zone: START });

  const attach = (c: Component<HTMLDivElement>) => {
    const remove = attachContextMenu(c, (e) => [
      { text: '&Say where', click: () => (s.zone = `Opened ${e.byKeyboard ? 'from the keyboard' : 'with the pointer'} on <${e.target.tagName.toLowerCase()}>.`) },
      { text: '&Reset', click: () => (s.zone = START) },
    ]);
    c.motif.setDisposable(remove);
  };

  return (
    <div class="cm-zone" tabindex="0" style={BOX} onBuilt={attach}>
      {() => s.zone}
    </div>
  );
}
