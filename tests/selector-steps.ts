// Reading the kit's selectors as they are written, for the tests that check what a rule can reach.

/** A selector list split at its top level. */
export function split(list: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let at = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i] === '(' || list[i] === '[') depth++;
    else if (list[i] === ')' || list[i] === ']') depth--;
    else if (list[i] === ',' && !depth) {
      out.push(list.slice(at, i).trim());
      at = i + 1;
    }
  }
  out.push(list.slice(at).trim());
  return out.filter(Boolean);
}

/** Every selector of a stylesheet's rules, a list as its selectors. */
export function selectorsOf(css: string): string[] {
  const out: string[] = [];
  for (const [, prelude] of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{/g)) {
    const selector = prelude.trim();
    if (selector && !selector.startsWith('@')) out.push(...split(selector));
  }
  return out;
}

/** A selector as its compounds, each with the combinator that leads to it (' ' for a descendant). */
export function steps(selector: string): { compound: string; by: string }[] {
  const out: { compound: string; by: string }[] = [];
  let depth = 0;
  let compound = '';
  let by = '';
  for (const ch of selector.trim()) {
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    if (!depth && /[\s>+~]/.test(ch)) {
      if (compound) {
        out.push({ compound, by });
        compound = '';
        by = ' ';
      }
      if (ch.trim()) by = ch;
      continue;
    }
    compound += ch;
  }
  if (compound) out.push({ compound, by });
  return out;
}

/** The arguments of the pseudo-classes that take selectors (`:is`, `:where`, `:not`, `:has`), each a selector of its own. */
export function inner(compound: string): string[] {
  const out: string[] = [];
  for (const m of compound.matchAll(/:(?:is|where|not|has)\(/g)) {
    let depth = 1;
    let i = m.index + m[0].length;
    const from = i;
    for (; i < compound.length && depth; i++) {
      if (compound[i] === '(') depth++;
      else if (compound[i] === ')') depth--;
    }
    out.push(...split(compound.slice(from, i - 1)));
  }
  return out;
}

/** Whether a compound depends on a state: an attribute, or a pseudo-class (a list of plain classes and `:root` are none). */
export const stateful = (compound: string) =>
  /[[:]/.test(compound.replace(/::[\w-]+/g, '').replace(/:root\b/g, '').replace(/:(?:is|where)\(([^()]*)\)/g, (all, list) => (/[[:]/.test(list) ? all : '')));

/** The classes of a compound, outside its pseudo-classes. */
export const classesOf = (compound: string) => Array.from(compound.replace(/:(?:is|where|not|has)\(.*\)/g, '').matchAll(/\.([\w-]+)/g)).map(([, name]) => name);
