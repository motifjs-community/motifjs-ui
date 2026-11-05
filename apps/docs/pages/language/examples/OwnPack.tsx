import { Button, DropDown, Stack, uiLocale } from '@motifx-community/ui';

// A few German texts; what is left out stays English.
uiLocale.add('de', {
    close: 'Schließen',
    clear: 'Leeren',
    search: 'Suchen',
    noItems: 'Keine Einträge',
    loading: 'Wird geladen…',
    ok: 'OK',
    cancel: 'Abbrechen',
});

/** A pack of your own: `uiLocale.add` gives a language its texts, `use` switches to it. */
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
