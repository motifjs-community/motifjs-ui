import { reactive } from '@motifx/core';
import { Button, Stack, toast } from '@motifx-community/ui';

/** Archiving a mail at once, with an Undo button in the toast that brings it back. */
export default function Undo() {
  const s = reactive({ mails: ['Invoice #1042', 'Team lunch on Friday', 'Your order shipped'] });

  const archive = () => {
    const mail = s.mails.shift();
    if (!mail) return;
    toast.info(`“${mail}” archived.`, { action: { text: 'Undo', click: () => s.mails.unshift(mail) } });
  };

  return (
    <>
      <p class="toast-mails">{() => (s.mails.length ? `Inbox: ${s.mails.join(' · ')}` : 'The inbox is empty.')}</p>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Archive the first" variant="outline" enabled={() => s.mails.length > 0} onclick={archive} />
      </Stack>
    </>
  );
}
