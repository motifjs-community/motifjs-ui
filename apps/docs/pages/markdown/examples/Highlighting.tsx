import { Markdown, type CodeHighlighter, type CodeRun } from '@motifx-community/ui';

const KEYWORDS = /\b(?:const|let|function|return|if|else|import|from|export|new|await|async)\b/g;

/** A small highlighter through the door: keywords in the accent colour. Any highlighter fits the same way. */
const keywords: CodeHighlighter = {
  open: (language) =>
    ['ts', 'js', 'tsx'].includes(language)
      ? {
          line(text) {
            const runs: CodeRun[] = [];
            let at = 0;
            for (const m of text.matchAll(KEYWORDS)) {
              if (m.index > at) runs.push({ text: text.slice(at, m.index) });
              runs.push({ text: m[0], color: 'var(--mx-color-accent-fg)' });
              at = m.index + m[0].length;
            }
            if (at < text.length) runs.push({ text: text.slice(at) });
            return runs;
          }
        }
      : null
};

const TEXT = `\`\`\`ts
import { Markdown } from '@motifx-community/ui';

export function answer(text: string) {
  const view = new Markdown({ text });
  return view;
}
\`\`\``;

/** Each line takes its colours when it ends; the copy button copies the code as written. */
export default function Highlighting() {
  return <Markdown text={TEXT} highlighter={keywords} />;
}
