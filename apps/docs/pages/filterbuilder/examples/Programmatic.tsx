import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, FilterBuilder, Stack } from '@motifx-community/ui';
import { saleFields } from './sales';

/** Created with `new` and controlled programmatically. Every change raises an event first, and a handler can cancel it. */
export default function Programmatic() {
  const log = reactive({ lines: [] as { id: number; text: string }[], next: 0 });
  const write = (text: string) => {
    log.lines.unshift({ id: log.next++, text });
    if (log.lines.length > 6) log.lines.pop();
  };
  const builder = new FilterBuilder({ fields: saleFields, locale: 'en', label: 'Built programmatically' });
  builder.element.classList.add('fb-code');
  builder.onItemAdding((e) => write(`adding a ${e.item.kind}${e.byUser ? ' (user)' : ''}`));
  builder.onItemRemoving((e) => {
    // The last condition stays.
    if (e.group === builder.root && builder.root.items.length === 1) {
      e.cancel = true;
      write('removing the last condition: cancelled');
    }
  });
  builder.onItemChanged((e) => write(`${e.change} → ${JSON.stringify(e.value)}`));
  builder.onValueChanged((e) => write(`value: ${JSON.stringify(e.value)}`));

  const addPaid = () => {
    const c = builder.addCondition(builder.root, 'paid');
    if (c) builder.setConditionValue(c, true);
  };
  const addRange = () => {
    const g = builder.addGroup();
    const c = g?.items[0];
    if (!g || !c || c.kind !== 'condition') return;
    builder.setField(c, 'amount');
    builder.setOperation(c, 'between');
    builder.setConditionValue(c, [100, 400]);
    builder.setGroupOperation(g, 'or');
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add “Paid”" variant="outline" onclick={addPaid} />
        <Button text="Add a range group" variant="outline" onclick={addRange} />
        <Button text="Set a value" variant="outline" onclick={() => (builder.value = data.where('product', 'startswith', 'Ch'))} />
        <Button text="Clear" variant="ghost" onclick={() => builder.clear()} />
      </Stack>
      {builder}
      <ul class="fb-code-log">
        {log.lines.map((line) => (
          <li key={line.id}>{line.text}</li>
        ))}
      </ul>
    </>
  );
}
