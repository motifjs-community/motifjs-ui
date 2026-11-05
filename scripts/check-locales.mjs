// Checks the language packs against the built-in texts: every text of en.json in every pack, no text
// en.json does not have, the same ICU arguments, and the UiStrings interface in step with en.json.
//
//   node scripts/check-locales.mjs                 every pack in src/locales
//   node scripts/check-locales.mjs path/to/de.json  a pack of your own
import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const en = JSON.parse(readFileSync(join(root, 'src/locales/en.json'), 'utf8'));
const argsOf = (message) => [...new Set([...message.matchAll(/\{\s*(\w+)/g)].map((m) => m[1]))].sort().join(', ');

let problems = 0;
const say = (file, text) => {
    console.log(`${file}: ${text}`);
    problems++;
};

// A text in the interface and not in en.json, or the other way round, is a slip.
const typed = [...readFileSync(join(root, 'src/core/ui-strings.ts'), 'utf8').matchAll(/^\s+(\w+)\??: string;/gm)].map((m) => m[1]);
for (const key of Object.keys(en)) if (!typed.includes(key)) say('src/core/ui-strings.ts', `no "${key}", en.json has it`);
for (const key of typed) if (!(key in en)) say('src/locales/en.json', `no "${key}", UiStrings has it`);

const packs = process.argv.slice(2);
if (!packs.length) {
    for (const file of readdirSync(join(root, 'src/locales'))) {
        if (file.endsWith('.json') && file !== 'en.json') packs.push(join(root, 'src/locales', file));
    }
}
for (const path of packs) {
    const pack = JSON.parse(readFileSync(path, 'utf8'));
    const name = basename(path);
    for (const key of Object.keys(en)) if (!(key in pack)) say(name, `missing "${key}", shown in English`);
    for (const [key, message] of Object.entries(pack)) {
        if (!(key in en)) {
            say(name, `"${key}" is not a text of the kit`);
        } else if (typeof message !== 'string') {
            say(name, `"${key}" is not a string`);
        } else if (argsOf(message) !== argsOf(en[key])) {
            say(name, `"${key}" fills {${argsOf(message)}}, the kit gives {${argsOf(en[key])}}`);
        }
    }
}
console.log(problems ? `${problems} problems` : `${packs.length} packs checked, ${Object.keys(en).length} texts each`);
process.exit(problems ? 1 : 0);
