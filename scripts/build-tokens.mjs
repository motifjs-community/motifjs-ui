// Component tokens → CSS custom properties, a typed TS map and docs data.
//
//   tokens/schema/<component>.json                every token of a component: its type, what it is for; its places
//   tokens/languages/<language>/<component>.json  that language's value for every token of the schema
//     → src/generated/components.css  --mx-<component>-*: the default language on every scope, then each
//                                     language under its own scope, in @layer mx.components
//     → src/generated/slots.css       on a component's root ($selector), each of its tokens in a slot of its own
//     → src/generated/places.css      inside a component's places, a part's slots pointing at the place's tokens
//     → src/generated/units.css       the paint of every unit, in each of its states, from its slots
//     → src/generated/tokens.ts       typed component token names
//     → src/generated/token-docs.json name, variable, type, reference and value, for the docs site
//
// Every language is complete: a token missing from a language, or one the schema lacks, fails the
// build. No language takes anything from another; the default language is only the set that stands
// where no `data-design-language` is written.
//
// A value is a design-system token (`{color.accent.solid}`), another token of the same language
// (`{field.radius}`, resolved here to what that one holds) or a literal. The design system's source
// is included, so a reference to a token that does not exist, or a `$type` that differs from the
// referenced token's, fails the build; only the component tokens are written.
//
// A slot is a component's token taken in on its own root: `--_<component>-<token>`. A component's CSS
// reads its slots only, so a value given to one instance does not flow into another of the same
// kind inside it (a list's search box is a field inside a field): each root takes its slots again.
//
// A place is where a component holds another part (a list in a window, a search box in a list). The
// component's schema names its selector (the part's root there), the part and the part's tokens it
// decides there; each language gives them values like any token (`<component>.<place>.<token>`), and
// places.css points the part's slots at them inside that selector. The part's own CSS does not change.
//
// A unit is one piece of a component a design draws on its own (a slider's track before the thumb, the
// thumb, the dot inside it, a stop at the end). The schema names it (`$units`: its selector, the states
// it can be in, each with its own selector) and every unit has the same box: display, size, margin and
// padding per side, fill, frame per side, corners, shadow, opacity, scale, text and outline, each also
// per state (`<component>.<unit>.<token>`, `<component>.<unit>.<state>.<token>`). A language writes only
// what its design draws; what it leaves out is neutral (no fill, no frame, no space) wherever another
// language writes it. Pieces a design shows as one are units with the space and the corners between
// them at 0; a piece a design does not have is a unit it does not show. units.css paints them: a side
// falls back to its axis and then to the whole (`margin-start` → `margin-inline` → `margin`), a state
// to the state it comes from and then to rest. The component's own CSS only places the units. What the
// schema gives as a unit's default is always drawn (a part shown or hidden unless a language says
// otherwise, a size the component's layout decides). A unit that turns (`turn.where`: where its
// component stands upright, a vertical slider) is written lying: width along, height across; standing,
// the build turns what `turn.what` names a quarter (size, radius, margin, padding, border: its width
// becomes its height, its sides and corners go round). What follows the light, such as a key's lower
// edge, is left out of `what`. A unit's shadow and glow are drawn together (a focus halo over a shadow).
//
// The tokens are declared again on every theme, language and density scope: a custom property
// holding var() is resolved where it is declared, so tokens declared on :root alone would keep the
// root's values inside a nested scope.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import StyleDictionary from 'style-dictionary';
import { formattedVariables } from 'style-dictionary/utils';

const slash = (p) => p.replace(/\\/g, '/');
const root = slash(join(dirname(fileURLToPath(import.meta.url)), '..'));
const ds = slash(dirname(createRequire(import.meta.url).resolve('@motifx-community/design-system/package.json')));

/** Component declarations live in this cascade layer, after the design system's `mx.base`. */
export const LAYER = 'mx.components';
export const PREFIX = 'mx';
export const SCHEMA_DIR = `${root}/tokens/schema`;
export const LANGUAGES_DIR = `${root}/tokens/languages`;
/** The language whose values stand where no `data-design-language` is written (the design system's default too). */
export const DEFAULT_LANGUAGE = 'tactile';
/** Every scope where the design system's values can change. */
export const SCOPES = ':root, [data-theme], [data-design-language], [data-density]';
/** A language's scope, and theme and density scopes inside it. */
export const designLanguageScope = (language) => `[data-design-language="${language}"], :where([data-design-language="${language}"]) :is([data-theme], [data-density])`;

/** The design-system layers references resolve against: the default language, light theme, comfortable density (names are the same in every language and theme). */
export const INCLUDE = [
  `${ds}/tokens/primitive/*.json`,
  `${ds}/tokens/design-language/tactile/base.json`,
  `${ds}/tokens/design-language/tactile/light.json`,
  `${ds}/tokens/design-language/tactile/density/comfortable.json`,
];

/** What a language leaves out of a unit: the guaranteed-invalid value, so the unit's paint falls back. */
const UNSET = 'initial';

// ---- value renderers (DTCG 2025.10 objects to CSS) ----------------------------------------
// The same rendering the design system uses, so a literal value here and a
// referenced value there print the same way. References are written as var()
// (outputReferences), so these matter for the literal values only.

const to255 = (c) => Math.round(c * 255);
const hex2 = (n) => n.toString(16).padStart(2, '0');

const colorToCss = (v) => {
  if (typeof v === 'string') return v;
  const a = v.alpha === undefined ? 1 : v.alpha;
  const comps = v.components.map((c) => (c === 'none' ? 0 : c));
  if (v.colorSpace === 'srgb') {
    const [r, g, b] = comps.map(to255);
    return a >= 1 ? (v.hex ?? `#${hex2(r)}${hex2(g)}${hex2(b)}`) : `rgb(${r} ${g} ${b} / ${a})`;
  }
  const fn = { oklch: 'oklch', oklab: 'oklab', lab: 'lab', lch: 'lch' }[v.colorSpace];
  const body = fn ? `${fn}(${comps.join(' ')}` : `color(${v.colorSpace} ${comps.join(' ')}`;
  return a >= 1 ? `${body})` : `${body} / ${a})`;
};
const unitToCss = (v) => (typeof v === 'object' && v !== null ? `${v.value}${v.unit}` : String(v));
const WEIGHTS = { thin: 100, 'extra-light': 200, light: 300, normal: 400, regular: 400, medium: 500, 'semi-bold': 600, bold: 700, 'extra-bold': 800, black: 900 };
const fontWeightToCss = (v) => (typeof v === 'string' && v in WEIGHTS ? String(WEIGHTS[v]) : String(v));
// A referencing token sees the referenced token's rendered string (transitive transforms): pass it through.
const shadowToCss = (v) =>
  typeof v === 'string'
    ? v
    : (Array.isArray(v) ? v : [v])
        .map((s) => `${s.inset ? 'inset ' : ''}${unitToCss(s.offsetX)} ${unitToCss(s.offsetY)} ${unitToCss(s.blur)} ${unitToCss(s.spread)} ${colorToCss(s.color)}`)
        .join(', ');

// An icon is a name of the kit's icon set; an angle a DTCG-like `{ value, unit: 'deg' | 'turn' }`.
const iconToCss = (v) => (typeof v === 'string' && !v.startsWith('var(') && v !== UNSET ? `var(--${PREFIX}-icon-${v})` : String(v));
const angleToCss = (v) => unitToCss(v);
// A shape is a name of the kit's shapes (scripts/build-shapes.mjs).
const shapeToCss = (v) => (typeof v === 'string' && !v.startsWith('var(') && v !== UNSET ? `var(--${PREFIX}-shape-${v})` : String(v));

const typeOf = (t) => t.$type ?? t.type;
const valueOf = (t) => t.$value ?? t.value;

for (const [name, type, render] of [
  ['mx/color', 'color', colorToCss],
  ['mx/dimension', 'dimension', unitToCss],
  ['mx/duration', 'duration', unitToCss],
  ['mx/fontWeight', 'fontWeight', fontWeightToCss],
  ['mx/shadow', 'shadow', shadowToCss],
  ['mx/icon', 'icon', iconToCss],
  ['mx/angle', 'angle', angleToCss],
  ['mx/shape', 'shape', shapeToCss],
]) {
  StyleDictionary.registerTransform({ name, type: 'value', transitive: true, filter: (t) => typeOf(t) === type, transform: (t) => render(valueOf(t)) });
}

export const TRANSFORMS = ['name/kebab', 'mx/color', 'mx/dimension', 'mx/duration', 'mx/fontWeight', 'mx/shadow', 'mx/icon', 'mx/angle', 'mx/shape', 'fontFamily/css', 'cubicBezier/css'];

/** `{radius.md}` becomes `radius.md`; null when the source value is not a plain reference. */
export function referenceOf(token) {
  const original = token.original?.$value ?? token.original?.value;
  return plainReference(original);
}
const plainReference = (value) => {
  const m = typeof value === 'string' ? /^\{([^{}]+)\}$/.exec(value) : null;
  return m ? m[1] : null;
};
const cssName = (path) => `--${PREFIX}-${path.replace(/\./g, '-')}`;
const slotName = (path) => `--_${path.replace(/\./g, '-')}`;

// ---- units ---------------------------------------------------------------------------------

/**
 * A unit's box: each CSS property, the tokens that give it from the most to the least specific, the
 * value where none is written, and the tokens' type.
 */
const BOX = (() => {
  const box = [];
  const add = (css, chain, neutral, type) => box.push({ css, chain, neutral, type });
  const SIDES = [
    ['top', 'block-start', 'block'],
    ['end', 'inline-end', 'inline'],
    ['bottom', 'block-end', 'block'],
    ['start', 'inline-start', 'inline'],
  ];
  add('display', ['display'], null, 'keyword');
  add('inline-size', ['width', 'size'], 'auto', 'dimension');
  add('block-size', ['height', 'size'], 'auto', 'dimension');
  add('min-inline-size', ['min-width'], 'auto', 'dimension');
  add('min-block-size', ['min-height'], 'auto', 'dimension');
  add('max-inline-size', ['max-width'], 'none', 'dimension');
  add('max-block-size', ['max-height'], 'none', 'dimension');
  for (const what of ['margin', 'padding']) for (const [side, logical, axis] of SIDES) add(`${what}-${logical}`, [`${what}-${side}`, `${what}-${axis}`, what], '0px', 'dimension');
  add('gap', ['gap'], 'normal', 'dimension');
  add('background-color', ['bg'], 'transparent', 'color');
  add('background-image', ['image'], 'none', 'keyword');
  add('border-style', ['border-style'], 'solid', 'keyword');
  for (const [side, logical, axis] of SIDES) add(`border-${logical}-width`, [`border-${side}-width`, `border-${axis}-width`, 'border-width'], '0px', 'dimension');
  for (const [side, logical, axis] of SIDES) add(`border-${logical}-color`, [`border-${side}-color`, `border-${axis}-color`, 'border-color'], 'currentcolor', 'color');
  for (const [block, inline, logical] of [
    ['top', 'start', 'start-start'],
    ['top', 'end', 'start-end'],
    ['bottom', 'start', 'end-start'],
    ['bottom', 'end', 'end-end'],
  ]) {
    add(`border-${logical}-radius`, [`radius-${block}-${inline}`, `radius-${block}`, `radius-${inline}`, 'radius'], '0px', 'dimension');
  }
  add('box-shadow', ['shadow', 'glow'], 'none', 'shadow');
  add('backdrop-filter', ['backdrop'], 'none', 'keyword');
  add('opacity', ['opacity'], '1', 'number');
  add('scale', ['scale'], 'none', 'number');
  add('color', ['color'], 'inherit', 'color');
  add('font-size', ['font-size'], 'inherit', 'dimension');
  add('font-weight', ['font-weight'], 'inherit', 'fontWeight');
  add('line-height', ['line-height'], 'inherit', 'dimension');
  add('letter-spacing', ['letter-spacing'], 'inherit', 'dimension');
  add('text-transform', ['text-transform'], 'inherit', 'keyword');
  add('text-decoration-line', ['text-decoration'], 'none', 'keyword');
  add('rotate', ['rotate'], 'none', 'angle');
  add('translate', ['translate'], 'none', 'keyword');
  add('white-space', ['white-space'], 'inherit', 'keyword');
  add('text-box', ['text-box'], 'normal', 'keyword');
  add('outline-style', ['outline-style'], 'solid', 'keyword');
  add('outline-width', ['outline-width'], '0px', 'dimension');
  add('outline-color', ['outline-color'], 'currentcolor', 'color');
  add('outline-offset', ['outline-offset'], '0px', 'dimension');
  add('cursor', ['cursor'], 'inherit', 'keyword');
  add('--_icon', ['icon'], 'none', 'icon');
  return box;
})();
// A quarter turn: lying, the inline axis runs along (start → end) and the block axis across (top → bottom);
// standing, along runs bottom → top and across left → right.
const QUARTER = { 'block-start': 'inline-start', 'block-end': 'inline-end', 'inline-start': 'block-end', 'inline-end': 'block-start' };
const turned = (css) => {
  const size = /^((?:min-|max-)?)(inline|block)-size$/.exec(css);
  if (size) return `${size[1]}${size[2] === 'inline' ? 'block' : 'inline'}-size`;
  let m = /^(margin|padding|border)-((?:block|inline)-(?:start|end))(-.+)?$/.exec(css);
  if (m) return `${m[1]}-${QUARTER[m[2]]}${m[3] ?? ''}`;
  m = /^border-(start|end)-(start|end)-radius$/.exec(css);
  if (m) {
    const inline = QUARTER[`block-${m[1]}`].split('-')[1];
    const block = QUARTER[`inline-${m[2]}`].split('-')[1];
    return `border-${block}-${inline}-radius`;
  }
  return null;
};
/** For each property of the box that turns: the property it becomes, and the one that becomes it. */
const TURNS = new Map(BOX.filter((p) => turned(p.css)).map((p) => [p.css, turned(p.css)]));
const TURNED_FROM = new Map([...TURNS].map(([from, to]) => [to, from]));
/** What a property of the box is, for `turn.what`. */
const TURN_GROUP = (css) => (css.endsWith('-size') ? 'size' : css.endsWith('-radius') ? 'radius' : css.split('-')[0]);
const TURN_WHAT = ['size', 'radius', 'margin', 'padding', 'border'];
/** The selector of a standing unit: each of its selectors, inside `turn`, before its pseudo-element. */
const standing = (selector, turn) => {
  const parts = [];
  let depth = 0;
  let at = 0;
  for (let i = 0; i < selector.length; i++) {
    if (selector[i] === '(') depth++;
    else if (selector[i] === ')') depth--;
    else if (selector[i] === ',' && !depth) {
      parts.push(selector.slice(at, i).trim());
      at = i + 1;
    }
  }
  parts.push(selector.slice(at).trim());
  return parts.map((part) => part.replace(/(::[\w-]+)?$/, (pseudo) => `:where(${turn} *)${pseudo}`)).join(',\n  ');
};

/** Every token of a unit's box, and its type. */
const BOX_TOKENS = new Map(BOX.flatMap((p) => p.chain.map((t) => [t, p.type])));

/** The unit a path names, its state and token: `slider.thumb.hover.bg` → thumb, hover, bg; null when it names no unit. */
function unitPath(units, path) {
  const [component, unit, ...rest] = path.split('.');
  const u = units.find((x) => x.component === component && x.unit === unit);
  if (!u || !rest.length || rest.length > 2) return null;
  const [state, token] = rest.length === 2 ? rest : [null, rest[0]];
  if (!BOX_TOKENS.has(token)) throw new Error(`${path}: "${token}" is not a token of a unit's box (${[...BOX_TOKENS.keys()].join(', ')})`);
  if (state && !u.states.some((s) => s.name === state)) throw new Error(`${path}: ${component}'s ${unit} has no state "${state}"`);
  return { unit: u, state, token, type: BOX_TOKENS.get(token) };
}

// ---- schema and languages -----------------------------------------------------------------

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const jsonFiles = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).sort() : []);
const isGroupKey = (k) => !k.startsWith('$');

/** Leaves of a token tree, by dotted path; a leaf is an object with `$value` (languages) or a `$type` and nothing else (schema). */
function leaves(tree, leaf, path = '', out = new Map()) {
  for (const [k, v] of Object.entries(tree)) {
    if (!isGroupKey(k)) continue;
    const at = path ? `${path}.${k}` : k;
    if (leaf(v)) out.set(at, v);
    else if (v && typeof v === 'object') leaves(v, leaf, at, out);
    else throw new Error(`${at}: neither a token nor a group`);
  }
  return out;
}
const schemaLeaf = (v) => v && typeof v === 'object' && '$type' in v && !Object.keys(v).some(isGroupKey);
const valueLeaf = (v) => v && typeof v === 'object' && '$value' in v;

let schemaCache;
/**
 * Every component token: its type and description, the tokens of every place included. A place
 * (`$places` in a component's schema) is `{ selector, part, tokens: [part token names], $description }`.
 */
export function schema() {
  if (schemaCache) return schemaCache;
  const tokens = new Map();
  const places = [];
  const units = [];
  const descriptions = new Map();
  const selectors = new Map();
  for (const file of jsonFiles(SCHEMA_DIR)) {
    const tree = readJson(`${SCHEMA_DIR}/${file}`);
    const name = file.replace(/\.json$/, '');
    const keys = Object.keys(tree);
    if (keys.length !== 1 || keys[0] !== name) throw new Error(`tokens/schema/${file}: holds one group, "${name}"`);
    descriptions.set(name, tree[name].$description ?? '');
    if (tree[name].$selector) selectors.set(name, tree[name].$selector);
    for (const [path, leaf] of leaves({ [name]: tree[name] }, schemaLeaf)) tokens.set(path, { type: leaf.$type, description: leaf.$description ?? '' });
    for (const [place, spec] of Object.entries(tree[name].$places ?? {})) places.push({ component: name, place, ...spec });
    for (const [unit, spec] of Object.entries(tree[name].$units ?? {})) {
      if (!tree[name].$selector) throw new Error(`${name}.$units.${unit}: ${name} has no $selector, so no slots`);
      const states = Object.entries(spec.states ?? {}).map(([state, v]) => (typeof v === 'string' ? { name: state, selector: v } : { name: state, ...v }));
      const turn = spec.turn ? { where: spec.turn.where, what: spec.turn.what ?? TURN_WHAT } : null;
      for (const what of turn?.what ?? []) if (!TURN_WHAT.includes(what)) throw new Error(`${name}.$units.${unit}.turn.what: "${what}" is not one of ${TURN_WHAT.join(', ')}`);
      units.push({ component: name, unit, selector: spec.selector, states, defaults: spec.defaults ?? {}, turn, $description: spec.$description ?? '' });
    }
  }
  // A unit's tokens are the ones some language writes (or a place decides): the others need no slot and no paint.
  const unitToken = (path) => {
    const found = unitPath(units, path);
    if (!found) return;
    tokens.set(path, { type: found.type, description: `${found.unit.unit}${found.state ? ` (${found.state})` : ''}: ${found.token}`, unit: true });
  };
  for (const language of existsSync(LANGUAGES_DIR) ? readdirSync(LANGUAGES_DIR) : []) {
    for (const file of jsonFiles(`${LANGUAGES_DIR}/${language}`)) {
      for (const path of leaves(readJson(`${LANGUAGES_DIR}/${language}/${file}`), valueLeaf).keys()) if (!tokens.has(path)) unitToken(path);
    }
  }
  for (const p of places) {
    for (const t of p.tokens) {
      if (!tokens.has(`${p.part}.${t}`)) unitToken(`${p.part}.${t}`);
      const target = tokens.get(`${p.part}.${t}`);
      if (!target) throw new Error(`${p.component}.$places.${p.place}: ${p.part}.${t} is not a token`);
      if (!selectors.has(p.part)) throw new Error(`${p.component}.$places.${p.place}: ${p.part} has no $selector, so no slots`);
      const path = `${p.component}.${p.place}.${t}`;
      if (tokens.has(path)) throw new Error(`${path}: a place token and a token of the same name`);
      tokens.set(path, { type: target.type, description: `${p.part}.${t} in ${p.component}'s ${p.place}` });
    }
  }
  const names = new Map();
  for (const path of tokens.keys()) {
    const css = cssName(path);
    if (names.has(css)) throw new Error(`${path} and ${names.get(css)} are both ${css}`);
    names.set(css, path);
  }
  schemaCache = { tokens, places, units, descriptions, selectors };
  return schemaCache;
}

/** The languages: one directory each under tokens/languages, the default one first. */
export function languages() {
  const all = existsSync(LANGUAGES_DIR) ? readdirSync(LANGUAGES_DIR, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort() : [];
  if (!all.includes(DEFAULT_LANGUAGE)) throw new Error(`tokens/languages/${DEFAULT_LANGUAGE} is missing`);
  return [DEFAULT_LANGUAGE, ...all.filter((l) => l !== DEFAULT_LANGUAGE)];
}

/** A language's value for every token, its references to its own tokens resolved; throws listing every token missing or unknown. */
export function languageValues(language) {
  const { tokens } = schema();
  const values = new Map();
  for (const file of jsonFiles(`${LANGUAGES_DIR}/${language}`)) {
    const tree = readJson(`${LANGUAGES_DIR}/${language}/${file}`);
    const name = file.replace(/\.json$/, '');
    const keys = Object.keys(tree);
    if (keys.length !== 1 || keys[0] !== name) throw new Error(`tokens/languages/${language}/${file}: holds one group, "${name}"`);
    for (const [path, leaf] of leaves({ [name]: tree[name] }, valueLeaf)) values.set(path, leaf.$value);
  }
  for (const [path, token] of tokens) {
    if (!token.unit) continue;
    if (!values.has(path)) values.set(path, UNSET);
    // A unit's shadow is drawn with its glow in one list, where `none` cannot stand.
    else if (token.type === 'shadow' && values.get(path) === 'none') values.set(path, '0 0 #0000');
  }
  const missing = [...tokens.keys()].filter((p) => !values.has(p));
  const unknown = [...values.keys()].filter((p) => !tokens.has(p));
  if (missing.length || unknown.length) {
    const list = (title, l) => (l.length ? `\n  ${title} (${l.length}): ${l.slice(0, 40).join(', ')}${l.length > 40 ? ', …' : ''}` : '');
    throw new Error(`language "${language}" does not match the schema${list('missing', missing)}${list('not in the schema', unknown)}`);
  }
  const components = new Set([...tokens.keys()].map((p) => p.split('.')[0]));
  const resolve = (path, seen = []) => {
    const value = values.get(path);
    const ref = plainReference(value);
    if (!ref || !components.has(ref.split('.')[0])) return value;
    if (seen.includes(ref)) throw new Error(`${language}: ${[...seen, ref].join(' → ')} goes round`);
    if (!values.has(ref)) throw new Error(`${language}: ${path} refers to ${ref}, not a component token`);
    return resolve(ref, [...seen, path]);
  };
  return new Map([...values.keys()].map((p) => [p, resolve(p)]));
}

/** A language as a DTCG tree for Style Dictionary: every token with its schema type. */
function languageTree(language) {
  const { tokens } = schema();
  const tree = {};
  for (const [path, value] of languageValues(language)) {
    const parts = path.split('.');
    let at = tree;
    for (const p of parts.slice(0, -1)) at = at[p] ??= {};
    at[parts.at(-1)] = { $type: tokens.get(path).type, $value: value };
  }
  return tree;
}

// ---- formats ------------------------------------------------------------------------------

const HEADER = '/* Generated by scripts/build-tokens.mjs from tokens/schema and tokens/languages. Do not edit; edit the source and run `npm run tokens`. */\n';
const indent = (text, by) => text.split('\n').map((l) => (l ? by + l : l)).join('\n');
const tsString = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

const FORMATS = {
  'mx/components-css': ({ dictionary, options }) => {
    const header = options?.selector ? '' : HEADER;
    const skip = options?.skip ?? new Set();
    const lines = formattedVariables({ format: 'css', dictionary, outputReferences: true, formatting: { indentation: '' }, usesDtcg: true })
      .split('\n')
      .filter((l) => l && !skip.has(l));
    if (!lines.length) return header;
    return `${header}@layer ${LAYER} {\n  ${options?.selector ?? SCOPES} {\n${indent(lines.join('\n'), '    ')}\n  }\n}\n`;
  },

  'mx/components-lines': ({ dictionary }) => formattedVariables({ format: 'css', dictionary, outputReferences: true, formatting: { indentation: '' }, usesDtcg: true }),

  'mx/components-ts': ({ dictionary }) => {
    const entries = dictionary.allTokens.map((t) => `  ${tsString(t.path.join('.'))}: { cssVar: '--${t.name}', type: ${tsString(typeOf(t))}, layer: 'component' },`);
    return [
      '// Generated by scripts/build-tokens.mjs from tokens/schema and tokens/languages. Do not edit; edit the source and run `npm run tokens`.',
      '',
      "/** Every component token: its CSS custom property and DTCG type. The other layers are the design system's `tokens`. */",
      'export const componentTokens = {',
      ...entries,
      '} as const;',
      '',
      '/** A component token name, e.g. `button.radius`. */',
      'export type ComponentTokenName = keyof typeof componentTokens;',
      '',
    ].join('\n');
  },

  'mx/components-json': ({ dictionary }) =>
    JSON.stringify(
      dictionary.allTokens.map((t) => ({ name: t.path.join('.'), cssVar: `--${t.name}`, type: typeOf(t), ref: referenceOf(t), value: valueOf(t) })),
      null,
      2,
    ) + '\n',
};

for (const [name, format] of Object.entries(FORMATS)) StyleDictionary.registerFormat({ name, format });

// ---- dictionary ---------------------------------------------------------------------------

const scratch = slash(join(tmpdir(), 'mx-component-tokens'));

/**
 * One dictionary per language: the design system's tokens included, the language's component
 * tokens as source. Broken references throw. The "filtered reference" warning is off because every
 * reference points at an included token on purpose: it stays a var() that the design system's
 * stylesheet defines.
 */
function createDictionary(language, files) {
  const dir = `${scratch}/${language}`;
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/tokens.json`, JSON.stringify(languageTree(language)));
  return new StyleDictionary({
    include: INCLUDE,
    source: [`${dir}/tokens.json`],
    log: { verbosity: process.env.MX_TOKENS_VERBOSE ? 'verbose' : 'silent', warnings: 'error', errors: { brokenReferences: 'throw' } },
    platforms: {
      components: {
        transforms: TRANSFORMS,
        prefix: PREFIX,
        files: files.map((f) => ({ ...f, filter: (t) => t.isSource })),
        log: { warnings: 'disabled' },
      },
    },
  });
}

/** A language's transformed component tokens; throws when a token's `$type` differs from the design-system token it references. */
export async function componentTokens(language = DEFAULT_LANGUAGE) {
  const all = (await createDictionary(language, []).getPlatformTokens('components')).allTokens;
  const byPath = new Map(all.map((t) => [t.path.join('.'), t]));
  const source = all.filter((t) => t.isSource);
  for (const t of source) {
    const ref = referenceOf(t);
    const target = ref ? byPath.get(ref) : undefined;
    if (ref && !target) throw new Error(`${language}: ${t.path.join('.')}: "${ref}" is not a design-system token`);
    if (target && typeOf(target) !== typeOf(t)) throw new Error(`${language}: ${t.path.join('.')} is a ${typeOf(t)} but references ${ref}, a ${typeOf(target)}`);
  }
  return source;
}

async function format(language, name, options) {
  const sd = createDictionary(language, [{ destination: 'out', format: name, options }]);
  const output = (await sd.formatPlatform('components'))[0]?.output;
  return output === undefined ? FORMATS[name]({ dictionary: { allTokens: [] }, options }) : String(output);
}

/** Renders one format of the default language ('mx/components-css' | 'mx/components-ts' | 'mx/components-json') in memory. */
export async function render(name) {
  return format(DEFAULT_LANGUAGE, name);
}

/** A language's tokens under its scope; the lines it writes exactly as the default language does are left out (the default set stands on every scope). */
export async function renderLanguage(language) {
  const skip = new Set((await format(DEFAULT_LANGUAGE, 'mx/components-lines')).split('\n'));
  return format(language, 'mx/components-css', { selector: designLanguageScope(language), skip });
}

/** The whole token stylesheet: the default language on every scope, then each other language under its own. */
export async function renderCss() {
  const blocks = [await render('mx/components-css')];
  for (const language of languages().slice(1)) blocks.push(await renderLanguage(language));
  return blocks.join('\n');
}

/** On each component's root, every token of the component in its slot (place tokens aside: they fill the part's slots). */
export function renderSlots() {
  const { tokens, selectors, places } = schema();
  const placeTokens = new Set(places.flatMap((p) => p.tokens.map((t) => `${p.component}.${p.place}.${t}`)));
  const rules = [...selectors].map(([component, selector]) => {
    const own = [...tokens.keys()].filter((p) => p.split('.')[0] === component && !placeTokens.has(p));
    const lines = own.map((p) => `${slotName(p)}: var(${cssName(p)});`);
    return `  ${selector} {\n${indent(lines.join('\n'), '    ')}\n  }`;
  });
  return `${HEADER}@layer ${LAYER} {\n${rules.join('\n\n')}\n}\n`;
}

/** Inside each place, the part's slots pointing at the place's tokens. */
export function renderPlaces() {
  const rules = schema().places.map((p) => {
    const lines = p.tokens.map((t) => `${slotName(`${p.part}.${t}`)}: var(${cssName(`${p.component}.${p.place}.${t}`)});`);
    return `  /* ${p.component}: ${p.place}${p.$description ? ` — ${p.$description}` : ''} */\n  ${p.selector} {\n${indent(lines.join('\n'), '    ')}\n  }`;
  });
  return rules.length ? `${HEADER}@layer ${LAYER} {\n${rules.join('\n\n')}\n}\n` : `${HEADER}@layer ${LAYER};\n`;
}

/** Every unit's paint: at rest, then in each state in the schema's order, from the unit's slots. */
export function renderUnits() {
  const { units, tokens } = schema();
  const rules = [];
  for (const u of units) {
    const base = `${u.component}.${u.unit}`;
    const at = (state, token) => (state ? `${base}.${state}.${token}` : `${base}.${token}`);
    // A state's tokens, then the states it comes from, then rest.
    const lineage = (state) => {
      const out = [];
      for (let s = state; s; s = u.states.find((x) => x.name === s)?.from) out.push(s);
      return [...out, null];
    };
    const byCss = new Map(BOX.map((p) => [p.css, p]));
    const valueOf = (state, prop) => {
      // The glow is a layer over the shadow, each from its own chain; a unit nobody gives a glow keeps its shadow alone.
      if (prop.css === 'box-shadow' && [...tokens.keys()].some((p) => p.startsWith(`${base}.`) && p.endsWith('.glow'))) {
        const layer = (token) => valueOf(state, { ...prop, css: 'layer', chain: [token], neutral: '0 0 #0000' });
        return `${layer('glow')}, ${layer('shadow')}`;
      }
      const chain = lineage(state).flatMap((s) => prop.chain.map((t) => at(s, t))).filter((p) => tokens.has(p));
      const fallback = prop.chain.map((t) => u.defaults[t]).find((v) => v !== undefined) ?? prop.neutral;
      if (fallback === null) throw new Error(`${base}: ${prop.chain[0]} is written, so the schema gives its default ($units.${u.unit}.defaults.${prop.chain[0]})`);
      return chain.reduceRight((rest, p) => `var(${slotName(p)}, ${rest})`, String(fallback));
    };
    const rule = (selector, props, value) => rules.push(`  ${selector} {\n${indent(props.map((css) => `${css}: ${value(css)};`).join('\n'), '    ')}\n  }`);
    const block = (state, selector) => {
      // At rest, what the schema gives a default for; in a state, what a language writes for it.
      const written = new Set(BOX.filter((p) => p.chain.some((t) => tokens.has(at(state, t)) || (!state && u.defaults[t] !== undefined))).map((p) => p.css));
      // A frame or an outline written in any state is drawn in its style, solid unless a language says otherwise.
      const own = [...tokens.keys()].filter((p) => p.startsWith(`${base}.`)).map((p) => p.split('.').at(-1));
      // With its style come its widths, at 0 where nothing is written: a style alone would draw the browser's medium width.
      if (!state && own.some((t) => /^border-.*width$/.test(t))) for (const p of BOX) if (p.css === 'border-style' || /^border-.*-width$/.test(p.css)) written.add(p.css);
      if (!state && own.includes('outline-width')) written.add('outline-style').add('outline-width');
      const props = BOX.map((p) => p.css).filter((css) => written.has(css));
      if (!props.length) return;
      rule(selector, props, (css) => valueOf(state, byCss.get(css)));
      if (!u.turn) return;
      // Standing: each property that turns takes the value of the one that becomes it.
      const turns = (css) => TURNS.has(css) && u.turn.what.includes(TURN_GROUP(css));
      const turning = [...new Set(props.filter(turns).flatMap((css) => [css, TURNS.get(css)]))];
      if (turning.length) rule(standing(selector, u.turn.where), turning, (css) => valueOf(state, byCss.get(TURNED_FROM.get(css))));
    };
    block(null, u.selector);
    for (const s of u.states) block(s.name, s.selector);
  }
  return rules.length ? `${HEADER}@layer ${LAYER} {\n${rules.join('\n\n')}\n}\n` : `${HEADER}@layer ${LAYER};\n`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const all = languages();
  for (const language of all) await componentTokens(language);
  const outDir = join(root, 'src', 'generated');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'components.css'), await renderCss());
  writeFileSync(join(outDir, 'slots.css'), renderSlots());
  writeFileSync(join(outDir, 'places.css'), renderPlaces());
  writeFileSync(join(outDir, 'units.css'), renderUnits());
  writeFileSync(join(outDir, 'tokens.ts'), await render('mx/components-ts'));
  writeFileSync(join(outDir, 'token-docs.json'), await render('mx/components-json'));
  console.log(`tokens: ${schema().tokens.size} component tokens × ${all.length} languages (${all.join(', ')}) → src/generated/ (design system at ${ds})`);
}
