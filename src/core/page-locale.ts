/** The language of the page (`<html lang>`), else the browser's. */
export function pageLocale(): string {
  if (typeof document === 'undefined') return 'en';
  return document.documentElement.lang || navigator.language || 'en';
}
