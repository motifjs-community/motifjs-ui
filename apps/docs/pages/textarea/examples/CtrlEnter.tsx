import { reactive } from '@motifx/core';
import { TextArea } from '@motifx-community/ui';

/** A message box: Enter starts a new line, Ctrl+Enter sends. */
export default function CtrlEnter() {
  const s = reactive({ message: '', sent: [] as { id: number; text: string }[] });
  let sentCount = 0;

  const send = (text: string) => {
    if (!text.trim()) return;
    s.sent.push({ id: ++sentCount, text });
    s.message = '';
  };

  return (
    <>
      <ul class="ta-sent">
        {s.sent.map((m) => (
          <li key={m.id}>{m.text}</li>
        ))}
      </ul>
      <TextArea label="Message" helpText="Ctrl+Enter sends." autoGrow rows={1} maxRows={4} x-model={() => s.message} onEnter={(e) => send(e.value)} stretch />
    </>
  );
}
