import { reactive } from '@motifx/core';
import { Accordion, AccordionItem, Button, Stack } from '@motifx-community/ui';

/** One item open at a time or several, kept open or not, with a disabled item. */
export default function OneOrSeveral() {
  const s = reactive({ multiple: false, collapsible: true });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Multiple" size="sm" variant="outline" toggle x-model={() => s.multiple} />
        <Button text="Collapsible" size="sm" variant="outline" toggle x-model={() => s.collapsible} />
      </Stack>
      <Accordion class="acc-multiple" multiple={() => s.multiple} collapsible={() => s.collapsible}>
        <AccordionItem title="Monday">
          <p>Monday.</p>
        </AccordionItem>
        <AccordionItem title="Tuesday">
          <p>Tuesday.</p>
        </AccordionItem>
        <AccordionItem title="Wednesday" enabled={false}>
          <p>Wednesday.</p>
        </AccordionItem>
        <AccordionItem title="Thursday">
          <p>Thursday.</p>
        </AccordionItem>
      </Accordion>
    </>
  );
}
