import { reactive } from '@motifx/core';

// The site's content in other languages. English is the source and the key: a text without a translation stays
// English, so a new paragraph never breaks a page. Each language has a file of its own per page, plus site.json for
// the frame of the site; a page's file is read when the page opens (`npm run docs:texts` lists what is missing).
const FILES = import.meta.glob<Record<string, string>>('../locales/*/*.json', { import: 'default' });

const state = reactive({ language: 'en', revision: 0 });
const texts = new Map<string, string>();
const read = new Set<string>();
let page = 'site';

async function load(file: string): Promise<void> {
  const language = state.language;
  const path = `../locales/${language}/${file}.json`;
  if (language === 'en' || read.has(path) || !FILES[path]) return;
  const found = await FILES[path]();
  if (language !== state.language) return;
  read.add(path);
  for (const [source, text] of Object.entries(found)) if (text) texts.set(source, text);
  state.revision++;
}

/** A text of the site in the reader's language. Read in a binding, it follows a change of language. */
export function tx(source: string): string {
  void state.revision;
  (window as unknown as { __docsTexts?: Set<string> }).__docsTexts?.add(source);
  return texts.get(source) ?? source;
}

/** Changes the language of the content: the frame and the page on screen are read first, so nothing flashes. */
export async function useLanguage(language: string): Promise<void> {
  texts.clear();
  read.clear();
  state.language = language;
  await Promise.all([load('site'), load(page)]);
  state.revision++;
}

/** Reads a page's texts before it opens. */
export function loadPage(id: string): Promise<void> {
  page = id;
  return load(id);
}
