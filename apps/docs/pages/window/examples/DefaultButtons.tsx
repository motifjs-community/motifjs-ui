import { reactive, type Component } from '@motifx/core';
import { Button } from '@motifx-community/ui';
import { RenameForm } from './RenameForm';

/** Enter clicks the form's accept button, Escape its cancel button; see RenameForm.tsx. */
export default function DefaultButtons() {
  const s = reactive({ renamed: '' });
  let host: Component<HTMLDivElement> | null = null;

  const rename = async () => {
    const form = new RenameForm();
    const result = await form.showDialog(host!);
    s.renamed = result === 'ok' ? `Renamed to “${form.name}”.` : 'Kept the old name.';
  };

  return (
    <>
      <Button text="Rename…" variant="outline" onclick={rename} />
      <output>{() => s.renamed}</output>
      <div ref={(c: Component<HTMLDivElement>) => (host = c)} />
    </>
  );
}
