import { reactive } from '@motifx/core';
import { DateBox } from '@motifx-community/ui';

/** One date in three locales: each types and shows it in its own order and separators. */
export default function Locales() {
  const s = reactive({ trip: null as Date | null });
  return (
    <>
      <DateBox label="Türkçe" locale="tr-TR" x-model={() => s.trip} />
      <DateBox label="English (US)" locale="en-US" x-model={() => s.trip} />
      <DateBox label="日本語" locale="ja-JP" x-model={() => s.trip} />
    </>
  );
}
