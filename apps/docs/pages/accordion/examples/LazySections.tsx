import { reactive } from '@motifx/core';
import { Accordion, AccordionItem, TextBox } from '@motifx-community/ui';

/** Sections created when first opened: one is kept, and one is recreated each time it opens. */
export default function LazySections() {
  const s = reactive({ builds: 0 });
  return (
    <>
      <Accordion class="acc-lazy" multiple>
        <AccordionItem
          title="Kept"
          content={() => {
            s.builds++;
            return <TextBox label="Type, close, open again" />;
          }}
        />
        <AccordionItem
          title="Made each time"
          keepAlive={false}
          content={() => {
            s.builds++;
            return <TextBox label="Starts empty each time" />;
          }}
        />
      </Accordion>
      <output class="acc-builds">{() => `Sections built: ${s.builds}`}</output>
    </>
  );
}
