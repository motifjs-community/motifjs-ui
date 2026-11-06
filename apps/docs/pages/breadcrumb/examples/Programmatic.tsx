import { reactive } from '@motifx/core';
import { Breadcrumb, Stack } from '@motifx-community/ui';

/** Links handled by the router (`rel="router"`), a step that is a button, the current page last, and one created programmatically. */
export default function Programmatic() {
  const s = reactive({ last: '' });
  const coded = new Breadcrumb({ label: 'Settings path', items: ['Settings', 'Account', 'Security'] });

  // Several on one page: each gets a name of its own.
  return (
    <Stack gap="lg">
      <Breadcrumb
        label="Docs path"
        rel="router"
        items={[{ text: 'Docs', href: '/' }, { text: 'Components', href: '/button' }, 'Display', { text: 'Breadcrumb' }]}
        onItemClick={(e) => (s.last = String((e.item as { text?: string }).text ?? e.item))}
      />
      <span>{() => (s.last ? `Pressed: ${s.last}` : 'Press a step')}</span>
      <span onConfig={(c) => c.controls.add(coded)} />
    </Stack>
  );
}
