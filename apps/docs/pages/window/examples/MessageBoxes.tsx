import { reactive } from '@motifx/core';
import { Button, confirm, messageBox } from '@motifx-community/ui';

/** A message, a question with three answers, a confirmation, and buttons of your own. */
export default function MessageBoxes() {
  const answer = reactive({ text: '' });

  const info = async () => {
    const result = await messageBox({ title: 'Saved', text: 'The file was saved.', tone: 'success' });
    answer.text = `Answer: ${result}`;
  };

  const yesNoCancel = async () => {
    const result = await messageBox({ title: 'Unsaved changes', text: 'Save the changes before closing?', buttons: ['yes', 'no', 'cancel'], tone: 'caution' });
    answer.text = `Answer: ${result}`;
  };

  const confirmDelete = async () => {
    const ok = await confirm('Delete “Report.docx”? This cannot be undone.', { title: 'Delete file', tone: 'danger' });
    answer.text = `Answer: ${ok}`;
  };

  const ownButtons = async () => {
    const result = await messageBox({
      title: 'Update',
      text: 'A new version is ready.',
      buttons: [
        { text: 'Restart now', result: 'restart' },
        { text: 'Later', result: 'later' },
      ],
      tone: 'info',
    });
    answer.text = `Answer: ${result}`;
  };

  return (
    <>
      <Button text="Info" variant="outline" onclick={info} />
      <Button text="Yes / No / Cancel" variant="outline" onclick={yesNoCancel} />
      <Button text="Confirm delete" variant="outline" onclick={confirmDelete} />
      <Button text="Own buttons" variant="outline" onclick={ownButtons} />
      <output class="win-answer">{() => answer.text}</output>
    </>
  );
}
