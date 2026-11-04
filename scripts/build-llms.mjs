// The docs for readers that are not a browser (an AI assistant, a search over the package): every page of the docs
// site as Markdown in docs/, an index in llms.txt and every page in one file, llms-full.txt (https://llmstxt.org).
// The pages are read as they render, from the built site: headings, text, API tables and each example's code (its
// live part is left out). Run against a server of the built docs site:
//
//   npm run docs:build && npx vite preview apps/docs --port 4510
//   BASE=http://localhost:4510 node scripts/build-llms.mjs
//
// Env: BASE (default http://localhost:4510), CHROME_PATH, PW_CORE (as e2e/docs-smoke.mjs).
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = (process.env.BASE ?? 'http://localhost:4510').replace(/\/$/, '');
const chromePath = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const pwPath = process.env.PW_CORE ?? 'playwright-core';
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require(pwPath));
} catch {
  ({ chromium } = await import(pathToFileURL(pwPath).href));
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

/** The site's pages, in its order: group, id, title and address, read from apps/docs/app/pages.ts. */
function pages() {
  const source = readFileSync(join(root, 'apps/docs/app/pages.ts'), 'utf8').replace(/\r\n/g, '\n');
  const out = [];
  for (const group of source.matchAll(/title: '([^']+)',\s*section: '([^']+)',\s*pages: \[([\s\S]*?)\n\s*\],?\n\s*\}/g)) {
    for (const p of group[3].matchAll(/\{ id: '([^']+)', label: '([^']+)', title: '([^']+)', path: '([^']+)'/g)) {
      out.push({ group: group[1], section: group[2], id: p[1], label: p[2], title: p[3], path: p[4] });
    }
  }
  return out;
}

const fileOf = (id) => `${id.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'}.md`;

/** The page as Markdown, written in the page itself from what it shows. */
function pageMarkdown() {
  const article = document.querySelector('.docs-article');
  const out = [];
  const inline = (node) => {
    let s = '';
    for (const n of node.childNodes) {
      if (n.nodeType === 3) s += n.textContent.replace(/\s+/g, ' ');
      else if (n.nodeType === 1) {
        const el = n;
        if (el.tagName === 'CODE') s += '`' + el.textContent + '`';
        else if (el.tagName === 'A') s += `[${inline(el).trim()}](${el.getAttribute('href') ?? ''})`;
        else if (el.tagName === 'STRONG' || el.tagName === 'B') s += `**${inline(el).trim()}**`;
        else if (el.tagName === 'BR') s += ' ';
        else s += inline(el);
      }
    }
    return s;
  };
  const cell = (td) => inline(td).trim().replace(/\|/g, '\\|');
  const walk = (node) => {
    for (const el of node.children) {
      const tag = el.tagName;
      if (el.classList.contains('docs-pager') || el.classList.contains('docs-example__stage') || el.classList.contains('docs-example__bar')) continue;
      if (el.hidden || getComputedStyle(el).display === 'none') {
        // An example's code is shown on asking; it is read even so.
        if (!el.classList.contains('docs-example__code')) continue;
      }
      if (tag === 'H2') out.push(`## ${el.textContent.trim()}`);
      else if (tag === 'H3') out.push(`### ${el.textContent.trim()}`);
      else if (tag === 'H4') out.push(`#### ${el.textContent.trim()}`);
      else if (tag === 'P') {
        const text = inline(el).trim();
        if (text) out.push(text);
      } else if (tag === 'UL' || tag === 'OL') {
        [...el.children].forEach((li, i) => out.push(`${tag === 'OL' ? `${i + 1}.` : '-'} ${inline(li).trim()}`));
      } else if (tag === 'TABLE') {
        const head = [...el.querySelectorAll('thead th')].map(cell);
        const rows = [...el.querySelectorAll('tbody tr')].map((tr) => [...tr.children].map(cell));
        if (head.length) out.push([`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n'));
      } else if (tag === 'PRE') {
        out.push('```tsx\n' + el.textContent.replace(/\n+$/, '') + '\n```');
      } else if (el.classList.contains('docs-code-file')) {
        const name = el.querySelector('.docs-code-file__name')?.textContent?.trim();
        const code = el.querySelector('pre')?.textContent ?? '';
        out.push(`${name ? `\`${name}\`\n\n` : ''}\`\`\`tsx\n${code.replace(/\n+$/, '')}\n\`\`\``);
      } else walk(el);
    }
  };
  walk(article);
  return out.join('\n\n');
}

const browser = await chromium.launch({ executablePath: chromePath });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
const list = pages();
const docsDir = join(root, 'docs');
rmSync(docsDir, { recursive: true, force: true });
mkdirSync(docsDir, { recursive: true });
const written = [];
for (const p of list) {
  await page.goto(`${base}${p.path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  // An example's code is made when it is first shown: every "Show code" is pressed.
  await page.evaluate(() => {
    for (const button of document.querySelectorAll('.docs-example__bar [aria-pressed="false"]')) button.click();
  });
  await page.waitForTimeout(400);
  // Every file of a several-file example: each tab's code is read in turn.
  const files = await page.evaluate(async () => {
    const found = new Map();
    for (const tabs of document.querySelectorAll('.docs-code-files')) {
      for (const tab of tabs.querySelectorAll('[role="tab"]')) {
        tab.click();
        await new Promise((r) => setTimeout(r, 30));
        const panel = tabs.querySelector('[role="tabpanel"]:not([hidden]) pre');
        if (panel) found.set(`${tab.textContent.trim()}`, panel.textContent);
      }
    }
    return [...found];
  });
  let body = await page.evaluate(pageMarkdown);
  if (files.length) body += '\n\n## Example files\n\n' + files.map(([name, code]) => `\`${name}\`\n\n\`\`\`tsx\n${code.replace(/\n+$/, '')}\n\`\`\``).join('\n\n');
  // Links between pages point at the Markdown files.
  body = body.replace(/\]\((\/[^)#\s]*)(#[^)\s]*)?\)/g, (all, path, hash = '') => {
    const target = list.find((x) => x.path === path);
    return target ? `](${fileOf(target.id)}${hash})` : all;
  });
  const lead = (body.split('\n\n').find((b) => !b.startsWith('#') && !b.startsWith('|') && !b.startsWith('```')) ?? '').replace(/\s+/g, ' ').trim();
  const md = `# ${p.title}\n\n> ${p.group} · @motifx-community/ui ${pkg.version}\n\n${body}\n`;
  writeFileSync(join(docsDir, fileOf(p.id)), md);
  written.push({ ...p, file: `docs/${fileOf(p.id)}`, lead, md });
  console.log('page', p.path);
}
await browser.close();

const start = readFileSync(join(root, 'scripts/llms-start.md'), 'utf8').replace(/\r\n/g, '\n');
writeFileSync(join(docsDir, 'getting-started.md'), start);
const groups = [...new Set(written.map((p) => `${p.section}: ${p.group}`))];
const short = (text) => (text.length > 160 ? `${text.slice(0, 157).replace(/\s+\S*$/, '')}…` : text);
const index = [
  `# ${pkg.name}`,
  '',
  `> ${pkg.description}. Version ${pkg.version}: a preview, its API may still change before 1.0.`,
  '',
  'Built on MotifJS (`@motifx/core`): a component is an object, made in JSX or with `new`, whose every prop takes a value or a function (`Bind<T>`); `x-model` binds a value two-way. The look is the design system’s (`@motifx-community/design-system`): five design languages (`data-identity`), light and dark themes, density.',
  '',
  '## Start',
  '',
  '- [Getting started](docs/getting-started.md): install, set up Vite, styles, design languages, the kit’s languages',
  '',
  ...groups.flatMap((g) => [
    `## ${g.split(': ')[1]}`,
    '',
    ...written.filter((p) => `${p.section}: ${p.group}` === g).map((p) => `- [${p.title}](${p.file})${p.lead ? `: ${short(p.lead)}` : ''}`),
    '',
  ]),
  '## Optional',
  '',
  '- [Every page in one file](llms-full.txt)',
  '- [MotifJS](https://motifjs.com): the framework the components are made for',
  '',
].join('\n');
writeFileSync(join(root, 'llms.txt'), index);
writeFileSync(join(root, 'llms-full.txt'), [index, start, ...written.map((p) => p.md)].join('\n\n---\n\n'));
console.log(`${written.length} pages → docs/, llms.txt, llms-full.txt`);
