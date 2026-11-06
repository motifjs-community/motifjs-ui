import type { HighlighterCore } from 'shiki/core';

/** The languages the docs' code is written in. */
export type CodeLanguage = 'tsx' | 'css' | 'html' | 'bash' | 'json';

// The colours are variables (--shiki-*), set in docs.css from the design language's roles: they follow it and the theme.
const THEME = 'kit';
let loading: Promise<HighlighterCore> | null = null;

// The highlighter and its grammars are a chunk of their own: a page reads as plain code until it arrives.
function highlighter(): Promise<HighlighterCore> {
  return (loading ??= load());
}

async function load(): Promise<HighlighterCore> {
  const [{ createHighlighterCore, createCssVariablesTheme }, { createJavaScriptRegexEngine }, tsx, css, html, bash, json] = await Promise.all([
    import('shiki/core'),
    import('shiki/engine/javascript'),
    import('shiki/langs/tsx.mjs'),
    import('shiki/langs/css.mjs'),
    import('shiki/langs/html.mjs'),
    import('shiki/langs/bash.mjs'),
    import('shiki/langs/json.mjs'),
  ]);
  return createHighlighterCore({
    themes: [createCssVariablesTheme({ name: THEME, variablePrefix: '--shiki-' })],
    langs: [tsx.default, css.default, html.default, bash.default, json.default],
    engine: createJavaScriptRegexEngine(),
  });
}

/** Puts `code` into `target` in colour. The text stays exactly the same, so reading and copying it do not change. */
export async function highlight(target: HTMLElement, code: string, lang: CodeLanguage): Promise<void> {
  const { tokens } = (await highlighter()).codeToTokens(code, { lang, theme: THEME });
  const doc = target.ownerDocument;
  const out = doc.createDocumentFragment();
  tokens.forEach((line, i) => {
    if (i > 0) out.append('\n');
    for (const token of line) {
      const span = doc.createElement('span');
      span.textContent = token.content;
      if (token.color) span.style.color = token.color;
      out.append(span);
    }
  });
  target.replaceChildren(out);
}
