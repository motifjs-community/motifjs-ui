import { Component, reactive } from '@motifx/core';
import { Button, NumberBox, Stack, uiLocale } from '@motifx-community/ui';

const OWN = {
    en: { title: 'Orders', hint: 'Written by the app, kept with the kit’s language' },
    tr: { title: 'Siparişler', hint: 'Uygulama yazar, kitin diliyle birlikte değişir' },
};

/** Your own texts drawn again on `uiLocale.onChanged`, and the kit's plural texts filled with `uiLocale.text`. */
export default class OwnTexts extends Component<HTMLDivElement> {
    s = reactive({ count: 3, title: '', hint: '', records: '' });

    override onBuilt(): void {
        this.motif.register(uiLocale.onChanged(() => this.draw()));
        this.draw();
    }

    draw(): void {
        const own = uiLocale.locale.startsWith('tr') ? OWN.tr : OWN.en;
        this.s.title = own.title;
        this.s.hint = own.hint;
        this.s.records = uiLocale.text('gridRecords', { count: this.s.count });
    }

    override view() {
        return (
            <Stack gap="md">
                <Stack orientation="horizontal" wrap align="center">
                    <Button text="English" variant="outline" onclick={() => void uiLocale.use('en')} />
                    <Button text="Türkçe" variant="outline" onclick={() => void uiLocale.use('tr')} />
                </Stack>
                <p>
                    <strong class="lang-own-title">{this.s.title}</strong>
                </p>
                <p>{this.s.hint}</p>
                <Stack orientation="horizontal" wrap align="center">
                    <NumberBox label="Count" min={0} max={99} x-model={() => this.s.count} onValueChanged={() => this.draw()} />
                    <output class="lang-records">{this.s.records}</output>
                </Stack>
            </Stack>
        );
    }
}
