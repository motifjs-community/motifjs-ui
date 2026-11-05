import { Button, Stack, TabDocumentManager } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';

/** Floating windows by code: float a document, move, resize and maximize its window, dock it back or to a side, close it. */
export default function FloatProgrammatically() {
  const docs = new TabDocumentManager({ label: 'Files to float' });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  for (const file of FILES.slice(0, 5)) docs.open(fileDocument(file.path), { index: 99 });
  const readme = () => docs.findDocument('README.md') ?? docs.open(fileDocument('README.md'))!;
  // The manager's own lists are reactive: the window shown is the one in front.
  const front = () => docs.floatingWindows.at(-1) ?? null;
  const rect = () => {
    const w = front();
    if (!w) return 'No floating window.';
    const r = w.rect;
    return `Window at ${r.x}, ${r.y}, ${r.width} × ${r.height}${w.isMaximized ? ', maximized' : ''}.`;
  };
  const on = () => !!front();

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Float README.md" variant="outline" enabled={() => !front()} onclick={() => docs.float(readme(), { x: 80, y: 120, width: 420, height: 280 })} />
        <Button text="Move" variant="outline" enabled={on} onclick={() => front()?.move(front()!.rect.x + 40, front()!.rect.y + 20)} />
        <Button text="Wider" variant="outline" enabled={on} onclick={() => front()?.resize(front()!.rect.width + 60, front()!.rect.height)} />
        <Button text="Maximize or restore" variant="outline" enabled={on} onclick={() => (front()?.isMaximized ? front()?.restore() : front()?.maximize())} />
        <Button text="Dock back" variant="outline" enabled={on} onclick={() => front()?.dock()} />
        <Button text="Dock right" variant="outline" enabled={on} onclick={() => front()?.dock('right', '35%')} />
        <Button text="Close window" variant="outline" enabled={on} onclick={() => void front()?.close()} />
      </Stack>
      {docs}
      <output class="td-state">{() => rect()}</output>
    </>
  );
}
