/** The arguments of `uiLocale.onChanged`: the current locale and the previous one (the same if only the strings changed). */
export interface UiLocaleChangedEventArgs {
  locale: string;
  previous: string;
}
