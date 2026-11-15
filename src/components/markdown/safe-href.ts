const SCHEMES = ['http', 'https', 'mailto', 'tel'];

/**
 * The address a link or an image may take: a relative one, `#…`, or one of `http:`, `https:`, `mailto:`, `tel:`.
 * Anything else (`javascript:`, `data:`, `vbscript:` …) gives `null`, and the link stays text.
 */
export function safeHref(url: string): string | null {
  // Control characters inside a scheme (`java\tscript:`) are dropped by the browser: they are dropped first here.
  const value = url.replace(/[\u0000-\u001F\u007F]/g, '').trim();
  if (!value) return null;
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(value);
  if (!scheme) return value;
  return SCHEMES.includes(scheme[1].toLowerCase()) ? value : null;
}
