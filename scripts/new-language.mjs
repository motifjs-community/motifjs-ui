// A new design language in the kit: `npm run language -- <name> [--from <language>]` copies a language's
// token files (tactile by default) to tokens/languages/<name>, so the new one builds at once and only the
// values that differ are changed. The design system needs the language too (tokens/identity/<name>): the
// token tests say when one side is missing.
import { cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--from');
const from = args.includes('--from') ? args[args.indexOf('--from') + 1] : 'tactile';
if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error('usage: npm run language -- <name> [--from <language>]   (a name in lowercase letters, digits and dashes)');
  process.exit(1);
}
const source = join(root, 'tokens', 'languages', from);
const target = join(root, 'tokens', 'languages', name);
if (!existsSync(source)) {
  console.error(`there is no language "${from}" to start from`);
  process.exit(1);
}
if (existsSync(target)) {
  console.error(`the language "${name}" is there already`);
  process.exit(1);
}
cpSync(source, target, { recursive: true });
console.log(`tokens/languages/${name}: ${from}'s values to start from. Run \`npm run tokens\`, then change what the new language draws differently.`);
