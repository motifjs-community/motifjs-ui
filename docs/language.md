# Language

> Foundations · @motifx-community/ui 0.1.0-beta.3

The texts the controls write, the locale their dates and numbers follow, and the direction: one `uiLocale` for the kit, with a pack per language loaded as it is asked for.

## Import

```tsx
import { uiLocale, connectI18n } from '@motifx-community/ui';
```

## Switching the language

`uiLocale.use('tr')` loads the Turkish pack the first time, then every control on the page draws its texts and formats again. The Language menu in the header of these docs does the same.

```tsx
import { reactive } from '@motifx/core';
import { Button, DateBox, NumberBox, Pagination, Stack, uiLocale } from '@motifx-community/ui';
import { kitTexts } from '../../../shared/kit-texts';

/** The kit's language switched live: the pack is loaded first, then every control draws its texts and formats again. */
export default function Switch() {
    const s = reactive({ price: 1234.5, when: new Date(2026, 2, 18) as Date | null });
    return (
        <Stack gap="md">
            <Stack orientation="horizontal" wrap align="center">
                <Button text="English" variant="outline" onclick={() => void uiLocale.use('en')} />
                <Button text="Türkçe" variant="outline" onclick={() => void uiLocale.use('tr')} />
                <span>
                    In use: <output class="lang-locale">{() => kitTexts.locale}</output>
                </span>
            </Stack>
            <Stack orientation="horizontal" wrap align="center">
                <NumberBox label="Price" x-model={() => s.price} format={{ style: 'currency', currency: 'EUR' }} />
                <DateBox label="When" x-model={() => s.when} clearButton />
            </Stack>
            <Pagination total={95} pageSizes={[10, 20, 50]} label="Orders" />
        </Stack>
    );
}
```

## The rules

| Rule | How |
| --- | --- |
| `Start` | The page’s `<html lang>`, else the browser’s language. Set `lang` before the first control is made; `uiLocale.ready` settles once that language is in. |
| `Texts` | Every text a control writes itself (a button’s name, a message, “No items”) comes from the pack of the language in use; English fills what the pack leaves out. |
| `Formats` | Dates, numbers, the first day of the week and 12 or 24 hours follow `uiLocale.locale`; a control’s own `locale` prop wins for that control. |
| `Direction` | `uiLocale.dir` is `rtl` for Arabic, Hebrew, Persian, Urdu…; the controls lay themselves out from `<html dir>`, which `@motifx-community/i18n` keeps in step. |
| `Nothing follows` | A change is one event, `onChanged`: the controls draw again on it, and so can your own texts. No binding reads `uiLocale`. |
| `Plurals` | A text with a count is an ICU message, `{count, plural, one {# record} other {# records}}`; a pack writes it the way its language counts. |

## Packs

| Pack | Where it comes from |
| --- | --- |
| `English` | Built in. What a pack leaves out is shown in English. |
| `Turkish` | `uiLocale.use('tr')` loads it the first time, as a chunk of the package. |
| `@motifx-community/ui/locales/<language>.json` | The same packs as files, for an app that bundles or serves them its own way: `uiLocale.add('tr', pack)`. |
| `uiLocale.loader` | Where the kit asks for a pack it does not have: `(language) => fetch(`/i18n/ui/${language}.json`).then((r) => r.json())`. A language without a pack keeps the English texts. |

A pack of your own is a plain object of the kit’s texts: `uiLocale.add` gives a language its texts, `use` switches to it. A few texts are enough to start; the rest stay English until the pack has them.

```tsx
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
```

## With your app’s translations

An app translated with `@motifx-community/i18n` has one locale already. `connectI18n(i18n)` makes the kit follow it: when the app switches, the kit loads its own pack and switches too. The link is undone by what it returns.

```tsx
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
```

## Your own texts that follow

The kit follows nothing: a change of language is told once, through `uiLocale.onChanged`. Keep your own texts with it, and fill the kit’s own texts with `uiLocale.text`, plurals included.

```tsx
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
```

## Formats of one control

Dates and numbers follow the kit’s locale. A control given a `locale` of its own writes that one, whatever the kit’s language is.

```tsx
import { reactive } from '@motifx/core';
import { DateBox, NumberBox, Stack } from '@motifx-community/ui';

/** A control's own `locale` wins over the kit's: these write German and Japanese whatever the kit's language is. */
export default function Formats() {
    const s = reactive({ amount: 98765.43, day: new Date(2026, 2, 18) as Date | null });
    return (
        <Stack orientation="horizontal" wrap align="center">
            <NumberBox label="Betrag" locale="de-DE" format={{ style: 'currency', currency: 'EUR' }} x-model={() => s.amount} />
            <DateBox label="日付" locale="ja-JP" x-model={() => s.day} />
            <NumberBox label="The kit's locale" format={{ style: 'currency', currency: 'EUR' }} x-model={() => s.amount} />
        </Stack>
    );
}
```

## Checking a pack

In the repository, `npm run locales` checks every pack the kit ships, and `npm run locales -- path/to/de.json` one of your own. The texts themselves are in `src/locales/en.json`; a pack is the same keys in another language.

| Check | What it means |
| --- | --- |
| `Every text` | A pack names every text of `en.json`; one it leaves out is shown in English, and the check says which. |
| `Only the kit’s texts` | A key `en.json` does not have is a typo. |
| `The same arguments` | A text fills the same `{values}` as the English one, in ICU; the plural forms are the language’s own. |
| `The interface` | `UiStrings` and `en.json` name the same keys. |

## API reference

| Member | Type | Description |
| --- | --- | --- |
| `uiLocale.use(locale)` | `Promise<void>` | Switches to `locale` (`tr`, `tr-TR`): its pack is loaded first when it is not there, then every control draws again. A later call wins over one still loading. |
| `uiLocale.locale` | `string` | The locale in use. |
| `uiLocale.dir` | `'ltr' \| 'rtl'` | The direction of the locale in use. |
| `uiLocale.strings` | `UiStrings` | The texts in use. Assigning a set changes the texts and keeps the locale: `uiLocale.strings = { ...uiLocale.strings, close: 'Shut' }`. |
| `uiLocale.text(key, values)` | `string` | A text of the kit with its values filled in: `uiLocale.text('gridRecords', { count: 3 })`. |
| `uiLocale.add(language, pack)` | `void` | Adds the pack of a language, or more texts to it; a language in use shows them at once. |
| `uiLocale.loader` | `(language) => Promise<UiPackModule>` | Where packs come from; the package by default. |
| `uiLocale.ready` | `Promise<void>` | Settles once the starting language is in. |
| `uiLocale.onChanged` | event | Raised once the language changed, with `locale` and `previous`. |
| `connectI18n(i18n)` | `() => void` | Keeps the kit’s language with your app’s translations (`@motifx-community/i18n`, or anything with `locale` and `onLocaleChanged`); returns what stops it. |
