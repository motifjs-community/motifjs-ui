import { format } from '@motifx-community/i18n';
import { fillTemplate } from './fill-template';

/**
 * A text of the kit with its values, in ICU: `{name}`, `{count, number}`,
 * `{count, plural, one {# row} other {# rows}}`, numbers written the way of `locale`. A text that is not valid ICU
 * (an app's own) is filled as plain `{name}` parts.
 */
export function fillText(message: string, locale: string, values?: Record<string, unknown>): string {
  if (!values || !/[{']/.test(message)) return message;
  try {
    return format(message, locale, values);
  } catch {
    return fillTemplate(message, values);
  }
}
