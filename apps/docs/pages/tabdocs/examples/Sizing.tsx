import { reactive } from '@motifx/core';
import { RadioGroup, Stack, Switch, TabDocumentManager, type TabSize } from '@motifx-community/ui';
import { notes } from './contents';

/** More tabs than fit: they scroll (wheel or buttons), shrink, take one width, or go on to more rows. */
export default function Sizing() {
  const s = reactive({ size: 'fit' as TabSize, wrap: false, buttons: true });
  const docs = new TabDocumentManager({
    label: 'Tab sizes',
    tabSize: () => s.size,
    wrapTabs: () => s.wrap,
    scrollButtons: () => s.buttons,
    tabMinWidth: 72,
    tabFixedWidth: 140,
  });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  const names = ['Overview', 'Customers', 'Orders', 'Invoices', 'Payments', 'Shipping', 'Returns', 'Products', 'Stock', 'Suppliers', 'Reports', 'Settings'];
  for (const name of names) docs.open({ id: name, title: name, content: () => notes(name) }, { index: 99 });

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <RadioGroup
          label="Tab size"
          orientation="horizontal"
          items={[
            { value: 'fit', text: 'Fit' },
            { value: 'shrink', text: 'Shrink' },
            { value: 'fixed', text: 'Fixed' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.size}
        />
        <Switch label="More rows" x-model={() => s.wrap} />
        <Switch label="Scroll buttons" x-model={() => s.buttons} />
      </Stack>
      {docs}
    </>
  );
}
