import { reactive } from '@motifx/core';
import { Button, RadioGroup, type RadioItem } from '@motifx-community/ui';

/** Options with their own help line and hint, and one that is enabled only while state allows it. */
export default function OptionDetails() {
  const s = reactive({ shipping: 'std' as string | null, expressOpen: false });
  const shipping: RadioItem<string>[] = [
    { value: 'std', text: 'Standard', helpText: '3–5 working days', hint: 'Free over 50 €' },
    { value: 'exp', text: 'Express', helpText: () => (s.expressOpen ? 'Tomorrow' : 'Not before the weekend'), enabled: () => s.expressOpen },
    { value: 'pick', text: 'Pick up in store', helpText: 'Ready in 2 hours' },
  ];

  return (
    <>
      <Button text={() => (s.expressOpen ? 'Close express' : 'Open express')} variant="outline" onclick={() => (s.expressOpen = !s.expressOpen)} />
      <RadioGroup label="S&hipping" class="rg-shipping" items={shipping} x-model={() => s.shipping} />
    </>
  );
}
