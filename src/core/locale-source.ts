/** What `connectI18n` needs of an app's translations (`@motifx-community/i18n`): the locale, and the event of a change. */
export interface LocaleSource {
  readonly locale: string;
  readonly onLocaleChanged: (listener: (e: { locale: string }) => unknown) => { dispose(): void };
}
