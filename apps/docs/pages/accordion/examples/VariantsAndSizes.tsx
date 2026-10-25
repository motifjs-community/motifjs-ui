import { reactive } from '@motifx/core';
import { Accordion, AccordionItem, Button, Stack, type AccordionChevron, type AccordionVariant } from '@motifx-community/ui';

const VARIANTS: AccordionVariant[] = ['list', 'separated', 'flush'];
const CHEVRONS: AccordionChevron[] = ['end', 'start', 'none'];

/** The three variants in the three sizes, with the chevron at either side or none. */
export default function VariantsAndSizes() {
  const s = reactive({ variant: 'list' as AccordionVariant, chevron: 'end' as AccordionChevron });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Variant">
        {VARIANTS.map((variant) => (
          <Button
            key={variant}
            text={variant}
            size="sm"
            variant={() => (s.variant === variant ? 'solid' : 'ghost')}
            aria-pressed={() => s.variant === variant}
            onclick={() => (s.variant = variant)}
          />
        ))}
      </Stack>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Chevron">
        {CHEVRONS.map((chevron) => (
          <Button
            key={chevron}
            text={`chevron ${chevron}`}
            size="sm"
            variant={() => (s.chevron === chevron ? 'solid' : 'ghost')}
            aria-pressed={() => s.chevron === chevron}
            onclick={() => (s.chevron = chevron)}
          />
        ))}
      </Stack>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Accordion key={size} class="acc-look" size={size} variant={() => s.variant} chevron={() => s.chevron}>
          <AccordionItem title={`Size ${size}`} expanded>
            <p>The section of a {size} accordion.</p>
          </AccordionItem>
          <AccordionItem title="Another">
            <p>Another section.</p>
          </AccordionItem>
        </Accordion>
      ))}
    </>
  );
}
