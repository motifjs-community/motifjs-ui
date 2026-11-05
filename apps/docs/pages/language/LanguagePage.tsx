import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Connect from './examples/Connect';
import Formats from './examples/Formats';
import OwnPack from './examples/OwnPack';
import OwnTexts from './examples/OwnTexts';
import Switch from './examples/Switch';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const RULES = [
    ['Start', 'The page’s `<html lang>`, else the browser’s language. Set `lang` before the first control is made; `uiLocale.ready` settles once that language is in.'],
    ['Texts', 'Every text a control writes itself (a button’s name, a message, “No items”) comes from the pack of the language in use; English fills what the pack leaves out.'],
    ['Formats', 'Dates, numbers, the first day of the week and 12 or 24 hours follow `uiLocale.locale`; a control’s own `locale` prop wins for that control.'],
    ['Direction', '`uiLocale.dir` is `rtl` for Arabic, Hebrew, Persian, Urdu…; the controls lay themselves out from `<html dir>`, which `@motifx-community/i18n` keeps in step.'],
    ['Nothing follows', 'A change is one event, `onChanged`: the controls draw again on it, and so can your own texts. No binding reads `uiLocale`.'],
    ['Plurals', 'A text with a count is an ICU message, `{count, plural, one {# record} other {# records}}`; a pack writes it the way its language counts.'],
];

const PACKS = [
    ['English', 'Built in. What a pack leaves out is shown in English.'],
    ['Turkish', '`uiLocale.use(\'tr\')` loads it the first time, as a chunk of the package.'],
    ['@motifx-community/ui/locales/<language>.json', 'The same packs as files, for an app that bundles or serves them its own way: `uiLocale.add(\'tr\', pack)`.'],
    ['uiLocale.loader', 'Where the kit asks for a pack it does not have: `(language) => fetch(`/i18n/ui/${language}.json`).then((r) => r.json())`. A language without a pack keeps the English texts.'],
];

const MEMBERS = [
    ['uiLocale.use(locale)', '`Promise<void>`', 'Switches to `locale` (`tr`, `tr-TR`): its pack is loaded first when it is not there, then every control draws again. A later call wins over one still loading.'],
    ['uiLocale.locale', '`string`', 'The locale in use.'],
    ['uiLocale.dir', '`\'ltr\' | \'rtl\'`', 'The direction of the locale in use.'],
    ['uiLocale.strings', '`UiStrings`', 'The texts in use. Assigning a set changes the texts and keeps the locale: `uiLocale.strings = { ...uiLocale.strings, close: \'Shut\' }`.'],
    ['uiLocale.text(key, values)', '`string`', 'A text of the kit with its values filled in: `uiLocale.text(\'gridRecords\', { count: 3 })`.'],
    ['uiLocale.add(language, pack)', '`void`', 'Adds the pack of a language, or more texts to it; a language in use shows them at once.'],
    ['uiLocale.loader', '`(language) => Promise<UiPackModule>`', 'Where packs come from; the package by default.'],
    ['uiLocale.ready', '`Promise<void>`', 'Settles once the starting language is in.'],
    ['uiLocale.onChanged', 'event', 'Raised once the language changed, with `locale` and `previous`.'],
    ['connectI18n(i18n)', '`() => void`', 'Keeps the kit’s language with your app’s translations (`@motifx-community/i18n`, or anything with `locale` and `onLocaleChanged`); returns what stops it.'],
];

const CHECKS = [
    ['Every text', 'A pack names every text of `en.json`; one it leaves out is shown in English, and the check says which.'],
    ['Only the kit’s texts', 'A key `en.json` does not have is a typo.'],
    ['The same arguments', 'A text fills the same `{values}` as the English one, in ICU; the plural forms are the language’s own.'],
    ['The interface', '`UiStrings` and `en.json` name the same keys.'],
];

export default function LanguagePage() {
    return (
        <>
            <p class="lead">
                The texts the controls write, the locale their dates and numbers follow, and the direction: one <code>uiLocale</code> for the
                kit, with a pack per language loaded as it is asked for.
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { uiLocale, connectI18n } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="switch" title="Switching the language">
                <p>
                    <Rich text="`uiLocale.use('tr')` loads the Turkish pack the first time, then every control on the page draws its texts and formats again. The Language menu in the header of these docs does the same." />
                </p>
                <Example files={code('Switch.tsx')}>
                    <Switch />
                </Example>
            </Section>

            <Section anchor="rules" title="The rules">
                <ApiTable head={['Rule', 'How']} rows={RULES} />
            </Section>

            <Section anchor="packs" title="Packs">
                <ApiTable head={['Pack', 'Where it comes from']} rows={PACKS} />
                <p>
                    <Rich text="A pack of your own is a plain object of the kit’s texts: `uiLocale.add` gives a language its texts, `use` switches to it. A few texts are enough to start; the rest stay English until the pack has them." />
                </p>
                <Example files={code('OwnPack.tsx')}>
                    <OwnPack />
                </Example>
            </Section>

            <Section anchor="connect" title="With your app’s translations">
                <p>
                    <Rich text="An app translated with `@motifx-community/i18n` has one locale already. `connectI18n(i18n)` makes the kit follow it: when the app switches, the kit loads its own pack and switches too. The link is undone by what it returns." />
                </p>
                <Example files={code('Connect.tsx')}>
                    <Connect />
                </Example>
            </Section>

            <Section anchor="own-texts" title="Your own texts that follow">
                <p>
                    <Rich text="The kit follows nothing: a change of language is told once, through `uiLocale.onChanged`. Keep your own texts with it, and fill the kit’s own texts with `uiLocale.text`, plurals included." />
                </p>
                <Example files={code('OwnTexts.tsx')}>
                    <OwnTexts />
                </Example>
            </Section>

            <Section anchor="formats" title="Formats of one control">
                <p>
                    <Rich text="Dates and numbers follow the kit’s locale. A control given a `locale` of its own writes that one, whatever the kit’s language is." />
                </p>
                <Example files={code('Formats.tsx')}>
                    <Formats />
                </Example>
            </Section>

            <Section anchor="checking" title="Checking a pack">
                <p>
                    <Rich text="In the repository, `npm run locales` checks every pack the kit ships, and `npm run locales -- path/to/de.json` one of your own. The texts themselves are in `src/locales/en.json`; a pack is the same keys in another language." />
                </p>
                <ApiTable head={['Check', 'What it means']} rows={CHECKS} />
            </Section>

            <Section anchor="api" title="API reference">
                <ApiTable head={['Member', 'Type', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
