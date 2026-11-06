import { Button, DropDown, Stack, uiLocale } from '@motifx-community/ui';

// A few German strings. Anything omitted stays in English.
uiLocale.add('de', {
    close: 'Schließen',
    clear: 'Leeren',
    search: 'Suchen',
    noItems: 'Keine Einträge',
    loading: 'Wird geladen…',
    ok: 'OK',
    cancel: 'Abbrechen',
});

/** A custom pack: `uiLocale.add` registers strings for a language, and `use` switches to it. */
export default function OwnPack() {
    return (
        <Stack gap="md">
            <Stack orientation="horizontal" wrap align="center">
                <Button text="Deutsch" variant="outline" onclick={() => void uiLocale.use('de')} />
                <Button text="English" variant="outline" onclick={() => void uiLocale.use('en')} />
            </Stack>
            <DropDown label="Empty list" items={[]} placeholder="Open me" />
        </Stack>
    );
}
