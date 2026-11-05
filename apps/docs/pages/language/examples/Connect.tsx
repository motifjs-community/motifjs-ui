import { Component } from '@motifx/core';
import { createI18n } from '@motifx-community/i18n';
import { Button, connectI18n, Stack, TextBox } from '@motifx-community/ui';

// The app's own translations; the kit follows their locale.
const i18n = createI18n({
    locale: 'en',
    messages: {
        en: { greeting: 'Hello {name}', hint: 'The clear button is named by the kit' },
        tr: { greeting: 'Merhaba {name}', hint: 'Temizle düğmesini kit adlandırır' },
    },
    dom: false,
});

/** One locale for the app and the kit: `connectI18n` switches the kit whenever the app's translations switch. */
export default class Connect extends Component<HTMLDivElement> {
    override onBuilt(): void {
        this.motif.setDisposable(connectI18n(i18n));
    }

    override view() {
        return (
            <Stack gap="md">
                <Stack orientation="horizontal" wrap align="center">
                    <Button text="English" variant="outline" onclick={() => void i18n.setLocale('en')} />
                    <Button text="Türkçe" variant="outline" onclick={() => void i18n.setLocale('tr')} />
                </Stack>
                <p class="lang-greeting">{() => i18n.t('greeting', { name: 'Ada' })}</p>
                <TextBox label={() => i18n.t('hint')} value="Clear me" clearButton />
            </Stack>
        );
    }
}
