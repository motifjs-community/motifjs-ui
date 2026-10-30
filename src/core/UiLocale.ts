import { Emitter, type Event as MotifEvent } from '@motifx/core';
import { directionOf } from '@motifx-community/i18n';
import { fillText } from './fill-text';
import type { UiLocaleChangedEventArgs } from './ui-locale-changed-event-args';
import type { UiPack } from './ui-pack';
import type { UiPackModule } from './ui-pack-module';
import type { UiStrings } from './ui-strings';

/**
 * The language of the kit's controls: their texts, the locale their dates and numbers are written in, the direction.
 * A language is switched with `use`, its pack loaded first when it is not there yet; then `onChanged` is raised once
 * and every control draws its texts and formats again. Nothing follows it: a control listens to `onChanged`.
 */
export class UiLocale {
  /** Loads the pack of a language (`'tr'`, `'pt-br'`); a pack it does not have is a rejected promise. */
  loader: (language: string) => Promise<UiPackModule>;
  /** Settles once the starting language is in. */
  readonly ready: Promise<void>;
  private current: { locale: string; strings: UiStrings };
  private readonly packs = new Map<string, UiPack>();
  private readonly loading = new Map<string, Promise<UiPack | null>>();
  /** Languages the loader has no pack for: not asked again. */
  private readonly missing = new Set<string>();
  private readonly changed = new Emitter<UiLocaleChangedEventArgs>();
  private turn = 0;

  constructor(
    private readonly builtIn: UiStrings,
    loader: (language: string) => Promise<UiPackModule>,
    locale: string,
  ) {
    this.loader = loader;
    this.current = { locale, strings: builtIn };
    this.ready = this.use(locale).catch(() => {});
  }

  /** The locale in use (`'tr-TR'`). A change is told by `onChanged`; nothing follows it. */
  get locale(): string {
    return this.current.locale;
  }

  /** `'rtl'` or `'ltr'` for the locale in use. */
  get dir(): 'ltr' | 'rtl' {
    return directionOf(this.locale);
  }

  /**
   * The texts in use. Assigning a set changes the texts and keeps the locale: for an app's own wording
   * (`uiLocale.strings = { ...uiLocale.strings, close: 'Kapat' }`). The set is kept as given.
   */
  get strings(): UiStrings {
    return this.current.strings;
  }
  set strings(value: UiStrings) {
    if (value === this.current.strings) return;
    this.apply(this.current.locale, value);
  }

  /** Raised once the language changed, with the locale before. */
  get onChanged(): MotifEvent<UiLocaleChangedEventArgs> {
    return this.changed.event;
  }

  /**
   * Switches to `locale`: its pack (`tr-TR`, else `tr`) is loaded first when it is not there, so no control shows
   * half its texts in the old language; until then the old one stays. A later call wins over one still loading.
   * A language without a pack keeps the built-in texts and still writes dates and numbers its way.
   */
  async use(locale: string): Promise<void> {
    const turn = ++this.turn;
    const pack = await this.packOf(locale);
    if (turn !== this.turn) return;
    this.apply(locale, pack ? { ...this.builtIn, ...pack } : this.builtIn);
  }

  /** Adds the pack of a language, or more texts to it; a language in use shows them at once. */
  add(language: string, pack: UiPack) {
    const key = language.toLowerCase();
    this.packs.set(key, { ...this.packs.get(key), ...pack });
    this.missing.delete(key);
    if (languagesOf(this.current.locale).includes(key)) void this.use(this.current.locale);
  }

  /** A text of the kit with its values filled in (ICU: `{count, plural, one {# row} other {# rows}}`). */
  text(key: keyof UiStrings, values?: Record<string, unknown>): string {
    const message = this.current.strings[key];
    return fillText(message, this.current.locale, values);
  }

  private apply(locale: string, strings: UiStrings) {
    const previous = this.current.locale;
    if (locale === previous && strings === this.current.strings) return;
    this.current = { locale, strings };
    this.changed.fire({ locale, previous });
  }

  /** The pack of the most precise language that has one; `null` for the built-in language or none. */
  private async packOf(locale: string): Promise<UiPack | null> {
    for (const language of languagesOf(locale)) {
      if (this.builtInLanguage(language)) return null;
      const pack = await this.load(language);
      if (pack) return pack;
    }
    return null;
  }

  private builtInLanguage(language: string): boolean {
    return language === 'en' && !this.packs.has('en');
  }

  private load(language: string): Promise<UiPack | null> {
    const known = this.packs.get(language);
    if (known) return Promise.resolve(known);
    if (this.missing.has(language)) return Promise.resolve(null);
    let job = this.loading.get(language);
    if (!job) {
      job = Promise.resolve()
        .then(() => this.loader(language))
        .then((module) => {
          const pack = ('default' in module && typeof module.default === 'object' ? module.default : module) as UiPack;
          this.packs.set(language, pack);
          return pack;
        })
        .catch(() => {
          this.missing.add(language);
          return null;
        })
        .finally(() => this.loading.delete(language));
      this.loading.set(language, job);
    }
    return job;
  }
}

/** `tr-TR` -> `['tr-tr', 'tr']`. */
function languagesOf(locale: string): string[] {
  const full = locale.toLowerCase();
  const base = full.split('-')[0];
  return base === full ? [full] : [full, base];
}
