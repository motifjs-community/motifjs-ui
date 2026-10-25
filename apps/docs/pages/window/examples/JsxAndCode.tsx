import { reactive, type Component } from '@motifx/core';
import { Button, MxForm, Stack, TextBox, type FormResult } from '@motifx-community/ui';
import { RenameForm } from './RenameForm';

/** A modeless form in JSX shown through x-model, and a form class shown modal from code. */
export default function JsxAndCode() {
  const s = reactive({ find: false, query: '', found: '', renamed: '' });
  let host: Component<HTMLDivElement> | null = null;
  let findForm: MxForm | null = null;

  const findOk = new Button({ text: 'Find', tone: 'accent' });
  findOk.element.addEventListener('click', () => findForm?.close('ok'));
  const findClose = new Button({ text: 'Close' });
  findClose.element.addEventListener('click', () => (s.find = false));
  const findButtons = new Stack({ orientation: 'horizontal', wrap: true, justify: 'end' });
  findButtons.controls.add(findOk, findClose);

  const rename = async () => {
    const form = new RenameForm();
    const result: FormResult = await form.showDialog(host!);
    s.renamed = result === 'ok' ? `Renamed to “${form.name}”.` : 'Kept the old name.';
  };

  return (
    <>
      <Button text="Find…" variant="outline" onclick={() => (s.find = true)} />
      <MxForm
        class="win-find"
        title="Find"
        x-model={() => s.find}
        footer={findButtons}
        acceptButton={findOk}
        cancelButton={findClose}
        ref={(f: MxForm) => (findForm = f)}
        onClosed={(e) => e.result === 'ok' && (s.found = `Searched for “${s.query}”.`)}
      >
        <TextBox label="&Find what" x-model={() => s.query} />
      </MxForm>
      <output class="win-found">{() => s.found}</output>
      <Button text="Rename… (class, modal)" variant="outline" onclick={rename} />
      <output class="win-renamed">{() => s.renamed}</output>
      <div ref={(c: Component<HTMLDivElement>) => (host = c)} />
    </>
  );
}
