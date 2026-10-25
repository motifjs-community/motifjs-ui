import { reactive } from '@motifx/core';
import { ListBox, Stack, Switch } from '@motifx-community/ui';
import { cities } from './cities';

/** One list switched between one value and several, with check boxes, “Select all”, and a search box. */
export default function SeveralItems() {
  const s = reactive({ picked: ['Bursa', 'Konya'] as string[], multiple: true, checkBoxes: true, selectAll: true, follows: true, search: false });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Switch label="Multiple" x-model={() => s.multiple} />
        <Switch label="Check boxes" x-model={() => s.checkBoxes} />
        <Switch label="Select all" x-model={() => s.selectAll} />
        <Switch label="Selection follows focus" x-model={() => s.follows} />
        <Switch label="Search" x-model={() => s.search} />
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <ListBox
          label="Cities"
          items={cities}
          selectionMode={() => (s.multiple ? 'multiple' : 'single')}
          showCheckBoxes={() => s.checkBoxes}
          selectAll={() => s.selectAll}
          selectionFollowsFocus={() => s.follows}
          searchEnabled={() => s.search}
          value={() => (s.multiple ? s.picked : (s.picked[0] ?? null))}
          onValueChanged={(e) => (s.picked = Array.isArray(e.value) ? (e.value as string[]) : e.value === null ? [] : [e.value as string])}
        />
        <output class="lb-picked">{() => `value: ${JSON.stringify(s.multiple ? s.picked : (s.picked[0] ?? null))}`}</output>
      </Stack>
    </>
  );
}
