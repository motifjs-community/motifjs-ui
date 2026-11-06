# Language

> Foundations · @motifx-community/ui 0.1.0-beta.4

`uiLocale` controls the strings that controls display, the locale used for dates and numbers, and the text direction. The kit has one `uiLocale`, and each language pack is loaded on demand.

## Import

```tsx
import { uiLocale, connectI18n } from '@motifx-community/ui';
```

## Changing the language

`uiLocale.use('tr')` loads the Turkish pack the first time it is requested. Every control on the page then redraws its strings and formats. The Language menu in the header of these docs does the same thing.

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

## Validation rules

| Rule | Details |
| --- | --- |
| `Start` | The initial language comes from the page's `<html lang>` attribute, or from the browser language if it is not set. Set `lang` before creating the first control. `uiLocale.ready` resolves once that language has loaded. |
| `Texts` | Every string a control displays on its own, such as a button name, a message or “No items”, comes from the active language pack. English is used for anything the pack does not include. |
| `Formats` | Dates, numbers, the first day of the week and the 12 or 24-hour clock follow `uiLocale.locale`. A control's own `locale` prop takes precedence for that control. |
| `Direction` | `uiLocale.dir` is `rtl` for Arabic, Hebrew, Persian, Urdu and similar languages. Controls lay themselves out based on `<html dir>`, which `@motifx-community/i18n` keeps in sync. |
| `Nothing follows` | A language change raises a single event, `onChanged`. Controls redraw in response, and your own strings can do the same. No binding reads `uiLocale`. |
| `Plurals` | A string with a count is an ICU message, such as `{count, plural, one {# record} other {# records}}`. Each pack writes it according to the plural rules of its language. |

## Language packs

| Pack | Source |
| --- | --- |
| `English` | Built in. Anything a pack does not include appears in English. |
| `Turkish` | `uiLocale.use('tr')` loads it on first use as a chunk of the package. |
| `@motifx-community/ui/locales/<language>.json` | The same packs as files, for applications that bundle or serve them separately: `uiLocale.add('tr', pack)`. |
| `uiLocale.loader` | Sets where the kit requests packs it does not have: `(language) => fetch(`/i18n/ui/${language}.json`).then((r) => r.json())`. A language without a pack keeps the English strings. |

A custom pack is a plain object of kit strings. `uiLocale.add` registers strings for a language, and `use` switches to it. You can start with a few strings. The rest stay in English until the pack includes them.

```tsx
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
```

## Using your application's translations

An application translated with `@motifx-community/i18n` already has a locale. `connectI18n(i18n)` makes the kit follow it: when the application switches language, the kit loads its own pack and switches too. Call the function it returns to disconnect.

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

## Keeping your own strings in sync

The kit does not track anything for you. A language change is reported once, through `uiLocale.onChanged`. Update your own strings there, and use `uiLocale.text` to fill in kit strings, including plurals.

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

## Formats for a single control

Dates and numbers follow the kit locale. A control with its own `locale` uses that locale, regardless of the kit language.

```tsx
import { reactive } from '@motifx/core';
import { DateBox, NumberBox, Stack } from '@motifx-community/ui';

/** A control's own `locale` takes precedence over the kit's: these use German and Japanese regardless of the kit language. */
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

## Validating a pack

In the repository, `npm run locales` validates every pack the kit ships, and `npm run locales -- path/to/de.json` validates one of your own. The strings are defined in `src/locales/en.json`, and a pack uses the same keys in another language.

| Check | Meaning |
| --- | --- |
| `Every text` | A pack includes every string in `en.json`. A missing string appears in English, and the check reports which one. |
| `Only the kit’s texts` | A key that does not exist in `en.json` is a typo. |
| `The same arguments` | A string uses the same `{values}` as the English string, in ICU format. Plural forms follow the language. |
| `The interface` | `UiStrings` and `en.json` declare the same keys. |

## API reference

| Member | Type | Description |
| --- | --- | --- |
| `uiLocale.use(locale)` | `Promise<void>` | Switches to `locale` (`tr`, `tr-TR`). The pack is loaded first if needed, and then every control redraws. A later call takes precedence over one that is still loading. |
| `uiLocale.locale` | `string` | The active locale. |
| `uiLocale.dir` | `'ltr' \| 'rtl'` | The text direction of the active locale. |
| `uiLocale.strings` | `UiStrings` | The active strings. Assigning a set changes the strings and keeps the locale: `uiLocale.strings = { ...uiLocale.strings, close: 'Shut' }`. |
| `uiLocale.text(key, values)` | `string` | Returns a kit string with its values filled in: `uiLocale.text('gridRecords', { count: 3 })`. |
| `uiLocale.add(language, pack)` | `void` | Adds the pack for a language, or adds strings to it. The active language shows them immediately. |
| `uiLocale.loader` | `(language) => Promise<UiPackModule>` | Sets where packs are loaded from. By default, this is the package. |
| `uiLocale.ready` | `Promise<void>` | Resolves once the initial language has loaded. |
| `uiLocale.onChanged` | event | Occurs after the language changes, with `locale` and `previous`. |
| `connectI18n(i18n)` | `() => void` | Keeps the kit language in sync with your application's translations (`@motifx-community/i18n`, or any object with `locale` and `onLocaleChanged`). Returns a function that stops it. |

## Feedback

Loading issues…
