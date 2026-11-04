import { reactive } from '@motifx/core';
import { Rating, Stack } from '@motifx-community/ui';

/** A rating bound with `x-model`, with a label and a help line like any field; one made with `new` from code. */
export default function FromCode() {
  const s = reactive({ stars: 3 as number | null });
  const coded = new Rating({ label: 'Made in code', max: 10, value: 7 });

  return (
    <Stack gap="lg">
      <Rating label="Your rating" x-model={() => s.stars} helpText={() => (s.stars ? `You gave ${s.stars}` : 'Not rated yet')} />
      <span onConfig={(c) => c.controls.add(coded)} />
    </Stack>
  );
}
