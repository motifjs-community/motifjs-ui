import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Connect from './examples/Connect';
import Formats from './examples/Formats';
import OwnPack from './examples/OwnPack';
import OwnTexts from './examples/OwnTexts';
import Switch from './examples/Switch';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const RULES = [
    ['Start', 'The initial language comes from the page\'s `<html lang>` attribute, or from the browser language if it is not set. Set `lang` before creating the first control. `uiLocale.ready` resolves once that language has loaded.'],
    ['Texts', 'Every string a control displays on its own, such as a button name, a message or “No items”, comes from the active language pack. English is used for anything the pack does not include.'],
    ['Formats', 'Dates, numbers, the first day of the week and the 12 or 24-hour clock follow `uiLocale.locale`. A control\'s own `locale` prop takes precedence for that control.'],
    ['Direction', '`uiLocale.dir` is `rtl` for Arabic, Hebrew, Persian, Urdu and similar languages. Controls lay themselves out based on `<html dir>`, which `@motifx-community/i18n` keeps in sync.'],
    ['Nothing follows', 'A language change raises a single event, `onChanged`. Controls redraw in response, and your own strings can do the same. No binding reads `uiLocale`.'],
    ['Plurals', 'A string with a count is an ICU message, such as `{count, plural, one {# record} other {# records}}`. Each pack writes it according to the plural rules of its language.'],
];

const PACKS = [
    ['English', 'Built in. Anything a pack does not include appears in English.'],
    ['Turkish', '`uiLocale.use(\'tr\')` loads it on first use as a chunk of the package.'],
    ['@motifx-community/ui/locales/<language>.json', 'The same packs as files, for applications that bundle or serve them separately: `uiLocale.add(\'tr\', pack)`.'],
    ['uiLocale.loader', 'Sets where the kit requests packs it does not have: `(language) => fetch(`/i18n/ui/${language}.json`).then((r) => r.json())`. A language without a pack keeps the English strings.'],
];

const MEMBERS = [
    ['uiLocale.use(locale)', '`Promise<void>`', 'Switches to `locale` (`tr`, `tr-TR`). The pack is loaded first if needed, and then every control redraws. A later call takes precedence over one that is still loading.'],
    ['uiLocale.locale', '`string`', 'The active locale.'],
    ['uiLocale.dir', '`\'ltr\' | \'rtl\'`', 'The text direction of the active locale.'],
    ['uiLocale.strings', '`UiStrings`', 'The active strings. Assigning a set changes the strings and keeps the locale: `uiLocale.strings = { ...uiLocale.strings, close: \'Shut\' }`.'],
    ['uiLocale.text(key, values)', '`string`', 'Returns a kit string with its values filled in: `uiLocale.text(\'gridRecords\', { count: 3 })`.'],
    ['uiLocale.add(language, pack)', '`void`', 'Adds the pack for a language, or adds strings to it. The active language shows them immediately.'],
    ['uiLocale.loader', '`(language) => Promise<UiPackModule>`', 'Sets where packs are loaded from. By default, this is the package.'],
    ['uiLocale.ready', '`Promise<void>`', 'Resolves once the initial language has loaded.'],
    ['uiLocale.onChanged', 'event', 'Occurs after the language changes, with `locale` and `previous`.'],
    ['connectI18n(i18n)', '`() => void`', 'Keeps the kit language in sync with your application\'s translations (`@motifx-community/i18n`, or any object with `locale` and `onLocaleChanged`). Returns a function that stops it.'],
];

const CHECKS = [
    ['Every text', 'A pack includes every string in `en.json`. A missing string appears in English, and the check reports which one.'],
    ['Only the kit’s texts', 'A key that does not exist in `en.json` is a typo.'],
    ['The same arguments', 'A string uses the same `{values}` as the English string, in ICU format. Plural forms follow the language.'],
    ['The interface', '`UiStrings` and `en.json` declare the same keys.'],
];

export default function LanguagePage() {
    return (
        <>
            <p class="lead">
              <Rich text="`uiLocale` controls the strings that controls display, the locale used for dates and numbers, and the text direction. The kit has one `uiLocale`, and each language pack is loaded on demand." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { uiLocale, connectI18n } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="switch" title="Changing the language">
                <p>
                    <Rich text="`uiLocale.use('tr')` loads the Turkish pack the first time it is requested. Every control on the page then redraws its strings and formats. The Language menu in the header of these docs does the same thing." />
                </p>
                <Example files={code('Switch.tsx')}>
                    <Switch />
                </Example>
            </Section>

            <Section anchor="rules" title="Rules">
                <ApiTable head={['Rule', 'Details']} rows={RULES} />
            </Section>

            <Section anchor="packs" title="Language packs">
                <ApiTable head={['Pack', 'Source']} rows={PACKS} />
                <p>
                    <Rich text="A custom pack is a plain object of kit strings. `uiLocale.add` registers strings for a language, and `use` switches to it. You can start with a few strings. The rest stay in English until the pack includes them." />
                </p>
                <Example files={code('OwnPack.tsx')}>
                    <OwnPack />
                </Example>
            </Section>

            <Section anchor="connect" title="Using your application's translations">
                <p>
                    <Rich text="An application translated with `@motifx-community/i18n` already has a locale. `connectI18n(i18n)` makes the kit follow it: when the application switches language, the kit loads its own pack and switches too. Call the function it returns to disconnect." />
                </p>
                <Example files={code('Connect.tsx')}>
                    <Connect />
                </Example>
            </Section>

            <Section anchor="own-texts" title="Keeping your own strings in sync">
                <p>
                    <Rich text="The kit does not track anything for you. A language change is reported once, through `uiLocale.onChanged`. Update your own strings there, and use `uiLocale.text` to fill in kit strings, including plurals." />
                </p>
                <Example files={code('OwnTexts.tsx')}>
                    <OwnTexts />
                </Example>
            </Section>

            <Section anchor="formats" title="Formats for a single control">
                <p>
                    <Rich text="Dates and numbers follow the kit locale. A control with its own `locale` uses that locale, regardless of the kit language." />
                </p>
                <Example files={code('Formats.tsx')}>
                    <Formats />
                </Example>
            </Section>

            <Section anchor="checking" title="Validating a pack">
                <p>
                    <Rich text="In the repository, `npm run locales` validates every pack the kit ships, and `npm run locales -- path/to/de.json` validates one of your own. The strings are defined in `src/locales/en.json`, and a pack uses the same keys in another language." />
                </p>
                <ApiTable head={['Check', 'Meaning']} rows={CHECKS} />
            </Section>

            <Section anchor="api" title="API reference">
                <ApiTable head={['Member', 'Type', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
