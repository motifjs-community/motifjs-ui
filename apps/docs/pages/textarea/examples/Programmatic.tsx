import { reactive } from '@motifx/core';
import { Button, Stack, TextArea } from '@motifx-community/ui';

/** A textarea bound with x-model, and notes created with `new` and added programmatically. */
export default function Programmatic() {
  const s = reactive({ comment: 'MotifJS keeps the DOM it builds.', log: '' });
  let added = 0;
  let host: Stack | null = null;

  const addProgrammatic = () => {
    const note = new TextArea({ label: `Note ${++added}`, rows: 2, autoGrow: true, maxRows: 5, clearButton: true });
    note.onValueChanged((e) => (s.log = `${note.label}: ${e.value.split('\n').length} line(s)`));
    host?.controls.add(note);
    note.focus();
  };

  return (
    <>
      <TextArea label="&Comment" x-model={() => s.comment} helpText={() => `${s.comment.length} characters`} stretch />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a note programmatically" variant="outline" onclick={addProgrammatic} />
        <output class="ta-log">{() => s.log}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
