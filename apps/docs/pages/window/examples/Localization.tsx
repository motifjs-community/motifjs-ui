import { reactive } from '@motifx/core';
import { Button, enStrings, messageBox, trStrings, uiLocale } from '@motifx-community/ui';

/** Switches the names of the title bar buttons and of the message box buttons. */
export default function Localization() {
  const s = reactive({ lang: 'en' });

  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
  };

  const ask = () =>
    messageBox({ title: 'Unsaved changes', text: 'Save the changes before closing?', buttons: ['yes', 'no', 'cancel'], tone: 'caution' });

  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <Button text="Ask" variant="outline" onclick={ask} />
    </>
  );
}
