import { reactive } from '@motifx/core';
import { Button, Stack, TabDocumentManager, type SplitDirection } from '@motifx-community/ui';
import { notes } from './contents';

/** Everything the user does is a method too; the events report each change, by the user or by code. */
export default function Programmatic() {
  const log = reactive({ lines: [] as { id: number; text: string }[], next: 0, opened: 0 });
  const write = (text: string) => {
    log.lines.unshift({ id: log.next++, text });
    if (log.lines.length > 6) log.lines.pop();
  };

  const docs = new TabDocumentManager({ label: 'Driven programmatically' });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  docs.onOpened((e) => write(`opened ${e.document.title} in group ${e.group.index + 1}`));
  docs.onClosed((e) => write(`closed ${e.document.title}${e.byUser ? ' (user)' : ''}`));
  docs.onDocumentActivated((e) => write(`active: ${e.document?.title ?? 'none'}${e.byUser ? ' (user)' : ''}`));
  docs.onMoved((e) => write(`moved ${e.document.title} to group ${e.to.index + 1}`));
  docs.onLayoutChanged((e) => write(`layout: ${e.change}${e.byUser ? ' (user)' : ''}`));

  const open = () => {
    const n = ++log.opened;
    docs.open({ id: `page-${n}`, type: 'page', title: `Page ${n}`, content: () => notes(`Page ${n}`) });
  };
  const split = (direction: SplitDirection) => {
    const group = docs.activeGroup;
    if (group) docs.split(group, direction, group.documents.length > 1 ? (group.activeDocument ?? undefined) : undefined);
  };
  const moveOn = () => {
    const doc = docs.activeDocument;
    const groups = docs.groups;
    if (doc?.group && groups.length > 1) docs.move(doc, groups[(groups.indexOf(doc.group) + 1) % groups.length]);
  };
  const toggleMaximize = () => {
    const group = docs.activeGroup;
    if (docs.maximizedGroup) docs.restoreGroups();
    else if (group) docs.maximizeGroup(group);
  };

  open();
  open();

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Open" variant="outline" onclick={open} />
        <Button text="Close active" variant="outline" onclick={() => docs.activeDocument && docs.close(docs.activeDocument)} />
        <Button text="Split right" variant="outline" onclick={() => split('right')} />
        <Button text="Split down" variant="outline" onclick={() => split('down')} />
        <Button text="Move to next group" variant="outline" onclick={moveOn} />
        <Button text={() => (docs.maximizedGroup ? 'Restore groups' : 'Maximize group')} variant="outline" onclick={toggleMaximize} />
        <Button text="Even sizes" variant="outline" onclick={() => docs.evenSizes()} />
        <Button text="Next tab" variant="ghost" onclick={() => docs.activateNext(null, true)} />
        <Button text="Focus group 1" variant="ghost" onclick={() => docs.focusGroup(0)} />
      </Stack>
      {docs}
      <output class="td-state">{() => `${docs.groups.length} group(s), ${docs.documents.length} document(s), active: ${docs.activeDocument?.title ?? 'none'}`}</output>
      <ul class="td-log">
        {log.lines.map((line) => (
          <li key={line.id}>{line.text}</li>
        ))}
      </ul>
    </>
  );
}
