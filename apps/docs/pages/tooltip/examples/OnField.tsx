import { reactive } from '@motifx/core';
import { TextBox, Tooltip } from '@motifx-community/ui';

/** A tooltip on a TextBox: the field shows it on hover, its input is described by it. */
export default function OnField() {
  const s = reactive({ email: '' });
  let email: TextBox | null = null;
  return (
    <>
      <TextBox ref={(b: TextBox) => (email = b)} label="Email" type="email" x-model={() => s.email} />
      <Tooltip target={() => email} text="We send the receipt here." placement="end" />
    </>
  );
}
