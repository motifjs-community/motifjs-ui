import { reactive } from '@motifx/core';
import { Chip, ChipGroup, Stack } from '@motifx-community/ui';

const DIETS = ['Vegan', 'Vegetarian', 'Gluten free', 'Dairy free'];
const SIZES = ['Small', 'Medium', 'Large'];

/** Several chosen (filters, bound with `x-model`) and one chosen (`value` and `onValueChanged`); the value is the chips' values. */
export default function Groups() {
  const s = reactive({ diets: ['Vegan'] as unknown, size: 'Medium' as unknown });

  return (
    <Stack gap="lg">
      <ChipGroup selection="multiple" label="Diet" x-model={() => s.diets}>
        {DIETS.map((diet) => (
          <Chip key={diet} text={diet} />
        ))}
      </ChipGroup>
      <span>{() => `Diet: ${(s.diets as string[]).join(', ') || 'any'}`}</span>
      <ChipGroup selection="single" label="Size" value={() => s.size} onValueChanged={(e) => (s.size = e.value)}>
        {SIZES.map((size) => (
          <Chip key={size} text={size} />
        ))}
      </ChipGroup>
      <span>{() => `Size: ${s.size ?? 'none'}`}</span>
    </Stack>
  );
}
