/** What `connectI18n` needs from an app's translations (`@motifx-community/i18n`): the locale and its change event. */
export interface LocaleSource {
  readonly locale: string;
  readonly onLocaleChanged: (listener: (e: { locale: string }) => unknown) => { dispose(): void };
}
