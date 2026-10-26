// Compares two records of e2e/fingerprint.mjs: prints every element whose computed look differs,
// property by property, and exits with 1 when anything differs.
//
//   node e2e/fingerprint-compare.mjs <before.json> <after.json> [--skip <page regexp>] [--max <lines>]
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const [a, b] = args.slice(0, 2).map((f) => JSON.parse(readFileSync(f, 'utf8')));
const max = Number(option('--max') ?? 40);
const skip = option('--skip') ? new RegExp(option('--skip')) : null;
const props = a.props;

let differences = 0;
const lines = [];
const show = (where, before, after) => {
  const pa = before.split('|');
  const pb = after.split('|');
  const changed = props.map((p, i) => (pa[i] !== pb[i] ? `${p}: ${pa[i]} -> ${pb[i]}` : null)).filter(Boolean);
  lines.push(`${where}\n    ${changed.join('\n    ')}`);
};

for (const run of Object.keys(a.data)) {
  for (const page of Object.keys(a.data[run])) {
    if (skip?.test(page)) continue;
    const ea = a.data[run][page];
    const eb = b.data[run]?.[page];
    if (!eb) {
      differences++;
      lines.push(`${run} ${page}: missing in the second record`);
      continue;
    }
    for (const key of new Set([...Object.keys(ea.rest), ...Object.keys(eb.rest)])) {
      if (ea.rest[key] === eb.rest[key]) continue;
      differences++;
      if (ea.rest[key] === undefined || eb.rest[key] === undefined) lines.push(`${run} ${page} ${key}: ${ea.rest[key] === undefined ? 'new' : 'gone'}`);
      else show(`${run} ${page} ${key}`, ea.rest[key], eb.rest[key]);
    }
    for (const kind of ['focus', 'hover']) {
      const la = ea[kind] ?? [];
      const lb = eb[kind] ?? [];
      for (let i = 0; i < Math.max(la.length, lb.length); i++) {
        if (la[i] === lb[i]) continue;
        differences++;
        lines.push(`${run} ${page} ${kind}[${i}]:\n    before ${String(la[i]).slice(0, 400)}\n    after  ${String(lb[i]).slice(0, 400)}`);
      }
    }
  }
}
console.log(lines.slice(0, max).join('\n'));
console.log(differences ? `\n${differences} differences` : 'identical');
process.exitCode = differences ? 1 : 0;
