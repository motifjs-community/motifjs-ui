import { reactive } from '@motifx/core';
import { BottomSheet, Button, uiLocale } from '@motifx-community/ui';

/** The handle name, height names and close button name come from uiLocale. */
export default function Localization() {
  const s = reactive({ open: false, lang: 'en' });

  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    void uiLocale.use(s.lang);
  };

  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <Button text="Open" variant="outline" onclick={() => (s.open = true)} />
      <BottomSheet showClose detents={['peek', 'half', 'full']} detent="half" x-model={() => s.open}>
        <p>Focus the handle: a screen reader reads its name and the height it is at.</p>
      </BottomSheet>
    </>
  );
}
