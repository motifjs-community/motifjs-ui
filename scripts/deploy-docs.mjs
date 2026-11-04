// Publishes the built docs site as ui.motifjs.com. GitHub Pages by default: the site goes to this repo's `gh-pages`
// branch as one fresh commit (the branch is a build, not history), with the app's page under every route's name
// (Pages answers /button from button.html, no redirect), 404.html for the rest, the Markdown docs with llms.txt and
// a site map beside the app. With DOCS_SITE the IIS folder is mirrored instead: its web.config does the routing.
//
//   npm run docs:deploy                                      → gh-pages, pushed
//   DOCS_SITE=C:\inetpub\ui.motifjs.com npm run docs:deploy  → IIS
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'apps', 'docs', 'dist');
const origin = 'https://ui.motifjs.com';
const iis = process.env.DOCS_SITE;

if (!existsSync(join(dist, 'index.html'))) throw new Error('apps/docs/dist has no index.html: run `npm run docs:build` first.');
if (iis && !existsSync(iis)) throw new Error(`${iis} does not exist: make the IIS site first.`);

const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
// The site's pages, from apps/docs/app/pages.ts (as scripts/build-llms.mjs reads them).
const source = readFileSync(join(root, 'apps/docs/app/pages.ts'), 'utf8');
const paths = [...new Set(['/', ...[...source.matchAll(/path: '([^']+)'/g)].map((m) => m[1])])];

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...paths.map((p) => `  <url><loc>${origin}${p}</loc></url>`),
  '</urlset>',
  '',
].join('\n');
writeFileSync(join(dist, 'sitemap.xml'), sitemap);

// The docs for readers that are not a browser (llms.txt links docs/<page>.md).
for (const name of ['llms.txt', 'llms-full.txt']) cpSync(join(root, name), join(dist, name));
cpSync(join(root, 'docs'), join(dist, 'docs'), { recursive: true });

if (iis) {
  cpSync(join(root, 'apps/docs/public/web.config'), join(dist, 'web.config'));
  // A mirror: what dist no longer has leaves the site too. robocopy: any code below 8 is success.
  const copy = spawnSync('robocopy', [dist, iis, '/MIR', '/NFL', '/NDL', '/NJH', '/NP', '/R:3', '/W:2'], { stdio: 'inherit' });
  if (copy.status === null || copy.status >= 8) throw new Error(`robocopy failed (${copy.status ?? copy.error?.message})`);
  // robocopy says little when it may not write there: the page on the site must be the one just built.
  const built = readFileSync(join(dist, 'index.html'));
  if (!existsSync(join(iis, 'index.html')) || !built.equals(readFileSync(join(iis, 'index.html')))) {
    throw new Error(`${iis} did not take the files: is the folder writable for this user?`);
  }
  console.log(`${paths.length} pages → ${iis}`);
} else {
  // A route that has routes under it (/datagrid, /datagrid/api) is a folder too: its page goes in there as well,
  // for the address with a slash at its end.
  const page = readFileSync(join(dist, 'index.html'));
  for (const p of paths.filter((p) => p !== '/')) {
    const file = join(dist, `${p.slice(1)}.html`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, page);
    if (paths.some((other) => other.startsWith(`${p}/`))) {
      mkdirSync(join(dist, p.slice(1)), { recursive: true });
      writeFileSync(join(dist, p.slice(1), 'index.html'), page);
    }
  }
  writeFileSync(join(dist, '404.html'), page);
  writeFileSync(join(dist, 'CNAME'), 'ui.motifjs.com\n');
  writeFileSync(join(dist, '.nojekyll'), '');
  rmSync(join(dist, 'web.config'), { force: true });

  // One commit of the site, made in dist itself and pushed over what the branch had.
  const remote = spawnSync('git', ['remote', 'get-url', 'origin'], { cwd: root, encoding: 'utf8' }).stdout.trim();
  if (!remote) throw new Error('this repo has no origin to push the site to.');
  const git = (...args) => spawnSync('git', args, { cwd: dist, stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8' });
  rmSync(join(dist, '.git'), { recursive: true, force: true });
  for (const step of [['init', '-q', '-b', 'gh-pages'], ['add', '-A'], ['commit', '-q', '-m', `Docs of ${version}`], ['push', '-q', '--force', remote, 'HEAD:gh-pages']]) {
    if (git(...step).status !== 0) throw new Error(`git ${step[0]} failed${step[0] === 'push' ? ': are you signed in to GitHub?' : ''}`);
  }
  rmSync(join(dist, '.git'), { recursive: true, force: true });
  console.log(`${paths.length} pages → ${remote}, branch gh-pages`);
}
