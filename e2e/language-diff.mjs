// How far apart the design languages are, from a record of e2e/fingerprint.mjs: colours aside, for
// each component, how many of its parts look the same (sizes, corners, frames, spacing, type,
// shadows by their shape) in every language, and which properties are the ones that differ.
//
//   node e2e/language-diff.mjs <fingerprint.json> [--theme light] [--fonts] [--shape]
//
// `--fonts` counts the font family as a difference (by default it is left out with the colours);
// `--shape` leaves the type out too (size, line height, weight), to see the shapes alone.
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const option = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const record = JSON.parse(readFileSync(args[0], 'utf8'));
const theme = option('--theme', 'light');
const fonts = args.includes('--fonts');
const shapeOnly = args.includes('--shape');

const props = record.props;
const COLOURS = new Set(['color', 'background-color', 'background-image', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'outline-color']);
if (!fonts) COLOURS.add('font-family');
if (shapeOnly) for (const p of ['font-size', 'line-height', 'font-weight']) COLOURS.add(p);
const keep = props.map((p, i) => [p, i]).filter(([p]) => !COLOURS.has(p));
/** A shadow by its shape: offsets, blur and spread, without its colours. */
const shape = (value) => value.replace(/rgba?\([^)]*\)|#[0-9a-f]{3,8}\b|oklch\([^)]*\)|color-mix\([^)]*\)/gi, 'C');

const runs = Object.keys(record.data).filter((name) => name.endsWith(` ${theme}`));
const languages = runs.map((name) => name.slice(0, -theme.length - 1));
const componentOf = (key) => {
  const last = key.split('#')[0].split('>').pop();
  const cls = last.split('.').find((c) => c.startsWith('mx-'));
  return cls ? cls.replace(/^mx-/, '').split('__')[0] : null;
};

const stats = new Map();
const pairs = new Map();
for (const page of Object.keys(record.data[runs[0]])) {
  const first = record.data[runs[0]][page].rest;
  for (const key of Object.keys(first)) {
    const component = componentOf(key);
    if (!component) continue;
    const values = runs.map((run) => record.data[run][page]?.rest[key]?.split('|'));
    if (values.some((v) => !v)) continue;
    const s = stats.get(component) ?? { parts: 0, same: 0, differs: new Map() };
    let allSame = true;
    for (const [p, i] of keep) {
      const seen = new Set(values.map((v) => (p === 'box-shadow' ? shape(v[i]) : v[i])));
      if (seen.size > 1) {
        allSame = false;
        s.differs.set(p, (s.differs.get(p) ?? 0) + 1);
      }
    }
    s.parts++;
    if (allSame) s.same++;
    stats.set(component, s);
    for (let a = 0; a < runs.length; a++) {
      for (let b = a + 1; b < runs.length; b++) {
        const id = `${languages[a]} / ${languages[b]}`;
        const pair = pairs.get(id) ?? { props: 0, equal: 0 };
        for (const [p, i] of keep) {
          pair.props++;
          if ((p === 'box-shadow' ? shape(values[a][i]) : values[a][i]) === (p === 'box-shadow' ? shape(values[b][i]) : values[b][i])) pair.equal++;
        }
        pairs.set(id, pair);
      }
    }
  }
}

const rows = [...stats.entries()].sort((x, y) => y[1].same / y[1].parts - x[1].same / x[1].parts || y[1].parts - x[1].parts);
console.log(`Theme ${theme}; languages: ${languages.join(', ')}; colours${fonts ? '' : ' and font family'} left out.\n`);
console.log('| component | parts | same in every language | what differs most |');
console.log('|---|---:|---:|---|');
for (const [component, s] of rows) {
  const top = [...s.differs.entries()].sort((x, y) => y[1] - x[1]).slice(0, 4).map(([p, n]) => `${p} (${n})`).join(', ');
  console.log(`| ${component} | ${s.parts} | ${Math.round((s.same / s.parts) * 100)}% | ${top || '—'} |`);
}
console.log('\n| languages | properties equal |');
console.log('|---|---:|');
for (const [id, pair] of [...pairs.entries()].sort((x, y) => y[1].equal / y[1].props - x[1].equal / x[1].props)) {
  console.log(`| ${id} | ${Math.round((pair.equal / pair.props) * 100)}% |`);
}
