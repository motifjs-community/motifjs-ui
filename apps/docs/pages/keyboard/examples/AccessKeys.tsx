import { reactive } from '@motifx/core';
import { Button } from '@motifx-community/ui';

/** `&` in a button text: Alt+S saves, Alt+O opens, Alt+P exports. */
export default function AccessKeys() {
  const s = reactive({ saves: 0, opens: 0, exports: 0 });
  return (
    <>
      <Button text="&Save" onclick={() => s.saves++} />
      <Button text="&Open" onclick={() => s.opens++} />
      <Button text="Ex&port" onclick={() => s.exports++} />
      <span>
        Saved <output class="saves">{() => s.saves}</output> · opened <output class="opens">{() => s.opens}</output> · exported{' '}
        <output>{() => s.exports}</output>
      </span>
    </>
  );
}
