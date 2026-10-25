/** The day a week starts on where `locale` is used: 0 Sunday … 6 Saturday. */
export function firstDayOfWeek(locale: string): number {
  try {
    const info = new Intl.Locale(locale) as Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };
    const day = (info.getWeekInfo?.() ?? info.weekInfo)?.firstDay;
    if (day) return day % 7;
  } catch {
    // An unknown tag: the default below.
  }
  return /^(en-US|en-CA|ja|ko|zh-TW|he|pt-BR)\b/i.test(locale) || locale === 'en' ? 0 : 1;
}
