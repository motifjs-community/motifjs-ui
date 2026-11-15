const NAMED: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  copy: '©',
  reg: '®',
  trade: '™',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  laquo: '«',
  raquo: '»',
  middot: '·',
  bull: '•',
  deg: '°',
  plusmn: '±',
  times: '×',
  divide: '÷',
  euro: '€',
  pound: '£',
  yen: '¥',
  cent: '¢',
  sect: '§',
  para: '¶',
  larr: '←',
  rarr: '→',
  uarr: '↑',
  darr: '↓',
  harr: '↔'
};

/** The character of an entity written without its `;` (`&amp`, `&#39`, `&#x27`); null when it is not one. */
export function decodeEntity(entity: string): string | null {
  const body = entity.slice(1);
  if (body.startsWith('#')) {
    const hex = /^#[xX]([0-9a-fA-F]{1,6})$/.exec(body);
    const dec = /^#([0-9]{1,7})$/.exec(body);
    const code = hex ? parseInt(hex[1], 16) : dec ? parseInt(dec[1], 10) : NaN;
    if (Number.isNaN(code)) return null;
    return code === 0 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff) ? '�' : String.fromCodePoint(code);
  }
  return Object.prototype.hasOwnProperty.call(NAMED, body) ? NAMED[body] : null;
}
