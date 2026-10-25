import { reactive } from '@motifx/core';
import { Button } from '@motifx-community/ui';

/** A button that shows a spinner while its work runs. */
export default function Busy() {
  const s = reactive({ sending: false });

  const send = () => {
    s.sending = true;
    setTimeout(() => (s.sending = false), 1500);
  };

  return <Button text="Send" tone="accent" busy={() => s.sending} onclick={send} />;
}
