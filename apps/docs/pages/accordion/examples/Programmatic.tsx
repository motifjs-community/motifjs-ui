import { reactive } from '@motifx/core';
import { Accordion, AccordionItem, Button, Stack, TextBox } from '@motifx-community/ui';

const TruckIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M1.5 4.5h8v6h-8zM9.5 6.5h3l2 2v2h-5M4 12.5a1 1 0 1 0 0-.01M12 12.5a1 1 0 1 0 0-.01" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
  </svg>
);

const FAQ = [
  { q: 'Can I pay later?', a: 'Yes, within 30 days of the invoice.' },
  { q: 'Do you ship abroad?', a: 'To most countries in Europe.' },
  { q: 'How do I return an item?', a: 'Send it back within 14 days with the slip in the box.' },
];

/** An accordion from JSX bound with x-model, and one created with `new` that gets items programmatically. */
export default function Programmatic() {
  const s = reactive({ open: ['shipping'] as (string | number)[], address: '', log: '' });
  let added = 0;

  const faq = new Accordion({ variant: 'separated', multiple: true });
  for (const entry of FAQ) faq.add(new AccordionItem({ title: entry.q, content: () => <p>{entry.a}</p> }));
  faq.onExpanded((e) => (s.log = `Opened “${e.item.title}”${e.byUser ? ' by the user' : ' programmatically'}.`));

  const addQuestion = () => {
    const n = ++added;
    const item = faq.add(new AccordionItem({ title: `Question ${n}`, content: () => <p>Answer {n}.</p> }));
    item.expanded = true;
  };

  return (
    <>
      <Accordion class="acc-ways" x-model={() => s.open}>
        <AccordionItem key="shipping" title="&Shipping" icon={() => <TruckIcon />}>
          <TextBox label="Address" x-model={() => s.address} />
        </AccordionItem>
        <AccordionItem key="payment" title="&Payment">
          <p>Card or bank transfer.</p>
        </AccordionItem>
        <AccordionItem key="review" title="&Review">
          <p>{() => `Ship to: ${s.address || '—'}`}</p>
        </AccordionItem>
      </Accordion>
      <output class="acc-value">{() => `value: [${s.open.map((k) => JSON.stringify(k)).join(', ')}]`}</output>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a question programmatically" variant="outline" onclick={addQuestion} />
        <output class="acc-log">{() => s.log}</output>
      </Stack>
      <Stack style="inline-size: 100%" onBuilt={(c) => c.controls.add(faq)} />
    </>
  );
}
