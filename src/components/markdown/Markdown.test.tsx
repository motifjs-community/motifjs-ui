import { Component, errorHandler, reactive, type ComponentBase } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import type { CodeHighlighter } from './code-highlighter';
import { Markdown } from './Markdown';
import type { MarkdownProps } from './markdown-props';

const hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  await uiLocale.use('en');
  uiLocale.strings = enStrings;
  vi.restoreAllMocks();
});

function view(props: MarkdownProps = {}): Markdown {
  const md = new Markdown(props);
  hosts.push(mountHost(md));
  return md;
}

/** `text` given at once. */
const whole = (text: string, props: MarkdownProps = {}) => view({ text, ...props });

/** `text` appended in pieces of `size` characters, then ended. */
function streamed(text: string, size: number, props: MarkdownProps = {}): Markdown {
  const md = view(props);
  const chars = [...text];
  for (let i = 0; i < chars.length; i += size) md.append(chars.slice(i, i + size).join(''));
  md.end();
  return md;
}

const $ = (md: Markdown, selector: string) => md.element.querySelector(selector);
const $$ = (md: Markdown, selector: string) => Array.from(md.element.querySelectorAll(selector));
const text = (md: Markdown, selector: string) => $(md, selector)?.textContent ?? null;
const alnum = (s: string) => (s.match(/[\p{L}\p{N}]/gu) ?? []).length;

const SAMPLES = [
  '# Title\n\nSome *em*, **strong**, ***both***, ~~gone~~ and `code`.\nA soft break, and a hard one  \nhere.',
  '- one\n- two\n  - nested\n  - more\n- three\n\n1. first\n2. second\n\n3) third\n',
  '- [ ] open task\n- [x] done task\n\nafter',
  '> a quote\n> - with a list\n> - of two\n\n> another\nlazy line',
  '```ts\nconst a = 1;\n\nif (a) {\n  run();\n}\n```\nafter the code',
  '| Name | Count |\n|:-----|------:|\n| apples | 3 |\n| pears | \\| 4 |\n\nnext',
  'A [link](https://example.com "Title") and https://motifjs.com/docs. and www.example.org!\n\n![alt *text*](https://e.com/a.png)',
  '\\*not em\\* &amp; &copy; &#39; &bogus; 2 * 3 * 4 and snake_case_name\n\n---\n\n***\n\n___\nend',
  'Unclosed **bold at the end',
  '```\nno closing fence\nstill code',
  '## Heading ##\n\n#nospace\n\n####### seven\n\n10. ten\n11. eleven\n\npara\n2. not a list',
  '| not | a table |\njust text\n\n| a |\n|---|---|\nmismatch',
  'text\n| h1 | h2 |\n| --- | --- |\n| c1 | c2 |\nafter table',
  '- item\n\n  continued in the item\n\n  ```js\n  let x = 1;\n  ```\n- next',
  'Emoji 😀 and **bold 😀** stay whole.'
];

describe('Markdown: blocks and inline content', () => {
  it('draws headings, paragraphs and inline elements', () => {
    const md = whole(SAMPLES[0]);
    expect(text(md, 'h1.mx-markdown__h1')).toBe('Title');
    expect(text(md, 'em.mx-markdown__em')).toBe('em');
    expect(text(md, 'strong.mx-markdown__strong')).toBe('strong');
    expect(text(md, 'em > strong')).toBe('both');
    expect(text(md, 'del.mx-markdown__del')).toBe('gone');
    expect(text(md, 'code.mx-markdown__code')).toBe('code');
    expect($$(md, 'br').length).toBe(1);
    expect($$(md, 'p').length).toBe(1);
  });

  it('draws bullet, nested and ordered lists', () => {
    const md = whole(SAMPLES[1]);
    const lists = $$(md, ':scope > .mx-markdown__list');
    expect(lists.map((l) => l.tagName)).toEqual(['UL', 'OL', 'OL']);
    expect(lists[0].querySelectorAll(':scope > li').length).toBe(3);
    expect(lists[0].querySelector('li ul')?.querySelectorAll('li').length).toBe(2);
    expect(lists[2].getAttribute('start')).toBe('3');
  });

  it('draws task items with a named box', () => {
    const md = whole(SAMPLES[2]);
    const items = $$(md, 'li');
    expect(items.map((li) => li.getAttribute('data-task'))).toEqual(['open', 'done']);
    const boxes = $$(md, '.mx-markdown__task');
    expect(boxes.map((b) => b.getAttribute('aria-label'))).toEqual([enStrings.markdownTaskOpen, enStrings.markdownTaskDone]);
    expect(boxes[1].hasAttribute('data-done')).toBe(true);
    expect(items[0].textContent).toBe('open task');
  });

  it('draws quotes with blocks inside, and a lazy line goes on in the quote', () => {
    const md = whole(SAMPLES[3]);
    const quotes = $$(md, 'blockquote');
    expect(quotes.length).toBe(2);
    expect(quotes[0].querySelectorAll('li').length).toBe(2);
    expect(quotes[1].textContent).toBe('another\nlazy line');
  });

  it('draws a fenced code block: the language, the code, no fences', () => {
    const md = whole(SAMPLES[4]);
    expect(text(md, '.mx-markdown__language')).toBe('ts');
    expect(text(md, 'pre > code')).toBe('const a = 1;\n\nif (a) {\n  run();\n}\n');
    expect($(md, 'pre > code')?.getAttribute('data-language')).toBe('ts');
    expect(text(md, ':scope > p')).toBe('after the code');
  });

  it('draws a table with its alignments and an escaped pipe', () => {
    const md = whole(SAMPLES[5]);
    expect($$(md, 'th').map((c) => [c.textContent, c.getAttribute('data-align')])).toEqual([
      ['Name', 'start'],
      ['Count', 'end']
    ]);
    expect($$(md, 'tbody tr').map((r) => Array.from(r.children).map((c) => c.textContent))).toEqual([
      ['apples', '3'],
      ['pears', '| 4']
    ]);
  });

  it('draws links, bare addresses without their closing punctuation, and images as links while images are off', () => {
    const md = whole(SAMPLES[6]);
    const links = $$(md, 'a') as HTMLAnchorElement[];
    expect(links.map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['link', 'https://example.com'],
      ['https://motifjs.com/docs', 'https://motifjs.com/docs'],
      ['www.example.org', 'http://www.example.org'],
      ['alt text', 'https://e.com/a.png']
    ]);
    expect(links[0].getAttribute('title')).toBe('Title');
    expect(links[0].getAttribute('target')).toBe('_blank');
    expect(links[0].getAttribute('rel')).toBe('noopener noreferrer');
    expect(md.element.textContent).toContain('docs. and');
    expect($(md, 'img')).toBeNull();
  });

  it('keeps escapes, entities and lone delimiters as text, and draws rules', () => {
    const md = whole(SAMPLES[7]);
    expect($(md, 'em')).toBeNull();
    expect(text(md, 'p')).toBe("*not em* & © ' &bogus; 2 * 3 * 4 and snake_case_name");
    expect($$(md, 'hr').length).toBe(3);
  });

  it('keeps what it made open when the text ends: an unclosed strong stays strong, unclosed code stays code', () => {
    expect(text(whole(SAMPLES[8]), 'strong')).toBe('bold at the end');
    expect(text(whole(SAMPLES[9]), 'pre > code')).toBe('no closing fence\nstill code\n');
  });

  it('knows what is not a heading, a list or a table', () => {
    const md = whole(SAMPLES[10]);
    expect(text(md, 'h2')).toBe('Heading');
    expect($$(md, ':scope > p').map((p) => p.textContent)).toEqual(['#nospace', '####### seven', 'para\n2. not a list']);
    expect($(md, 'ol')?.getAttribute('start')).toBe('10');
    expect($$(md, 'ol > li').map((li) => li.textContent)).toEqual(['ten', 'eleven']);
    const other = whole(SAMPLES[11]);
    expect($(other, 'table')).toBeNull();
    expect($$(other, 'p').map((p) => p.textContent)).toEqual(['| not | a table |\njust text', '| a |\n|---|---|\nmismatch']);
  });

  it('lets a table break into a paragraph, and keeps code inside a list item', () => {
    const md = whole(SAMPLES[12]);
    expect(text(md, ':scope > p')).toBe('text');
    expect($$(md, 'td').map((c) => c.textContent)).toEqual(['c1', 'c2']);
    expect($$(md, ':scope > p').map((p) => p.textContent)).toEqual(['text', 'after table']);
    const items = whole(SAMPLES[13]);
    const first = $$(items, 'li')[0];
    expect(first.querySelectorAll('p').length).toBe(2);
    expect(first.querySelector('pre > code')?.textContent).toBe('let x = 1;\n');
    expect($$(items, 'li').length).toBe(2);
  });
});

describe('Markdown: safety', () => {
  it('writes HTML as text', () => {
    const md = whole('<script>alert(1)</script> <img src=x onerror=alert(1)>\n\n<b>bold</b>');
    expect($(md, 'script')).toBeNull();
    expect($(md, 'img')).toBeNull();
    expect($(md, 'b')).toBeNull();
    expect(md.element.textContent).toContain('<script>alert(1)</script>');
  });

  it('gives a link no address that is not a safe one', () => {
    const md = whole('[a](javascript:alert(1)) [b](JaVaScRiPt:alert(1)) [c](data:text/html,x) [d](vbscript:x) [e](mailto:x@y.z) [f](/docs#x)');
    expect(($$(md, 'a') as HTMLAnchorElement[]).map((a) => a.getAttribute('href'))).toEqual([null, null, null, null, 'mailto:x@y.z', '/docs#x']);
  });

  it('shows images only when allowed, and only the addresses allowImage lets through', () => {
    const src = '![logo](https://e.com/logo.png) ![other](https://bad.example/x.png) ![x](javascript:alert(1))';
    expect($$(whole(src), 'img').length).toBe(0);
    const md = whole(src, { images: true, allowImage: (s: string) => s.startsWith('https://e.com/') });
    const images = $$(md, 'img');
    expect(images.map((i) => [i.getAttribute('src'), i.getAttribute('alt')])).toEqual([['https://e.com/logo.png', 'logo']]);
    expect($$(md, '.mx-markdown__image').map((s) => s.textContent)).toEqual(['', 'other', 'x']);
  });
});

describe('Markdown: streaming', () => {
  it('draws the same whatever the pieces the text arrives in', () => {
    for (const sample of SAMPLES) {
      const expected = whole(sample, { copyButton: false }).element.innerHTML;
      for (const size of [1, 2, 3, 7, 50]) expect(streamed(sample, size, { copyButton: false }).element.innerHTML, `${size}: ${sample}`).toBe(expected);
    }
  });

  it('has every letter and digit on screen the moment it is appended', () => {
    const sample = '# Head\n\nText with **bold**, *em* and `code`.\n\n- one\n- two\n\n> quote\n\n| a | b |\n|---|---|\n| c | d |\n\n```js\nlet x\n```\nend';
    const md = view({ copyButton: false });
    const chars = [...sample];
    let given = '';
    for (const c of chars) {
      md.append(c);
      given += c;
      expect(alnum(md.element.textContent ?? ''), JSON.stringify(given)).toBe(alnum(given));
    }
  });

  it('never removes an element it made: a part moved into a link is still on the page', () => {
    const md = view({ copyButton: false });
    const removed: Element[] = [];
    const watch = new MutationObserver((records) => {
      for (const r of records) for (const node of r.removedNodes) if (node instanceof Element) removed.push(node);
    });
    watch.observe(md.element, { childList: true, subtree: true });
    for (const c of SAMPLES.filter((s) => !s.includes('![')).join('\n\n')) md.append(c);
    md.end();
    watch.takeRecords().forEach((r) => r.removedNodes.forEach((node) => node instanceof Element && removed.push(node)));
    watch.disconnect();
    expect(removed.filter((el) => !md.element.contains(el)).map((el) => el.outerHTML)).toEqual([]);
  });

  it('shows a mark as text until it is understood, then makes its element and goes on in it', () => {
    const md = view();
    md.append('Say **');
    expect(text(md, 'p')).toBe('Say **');
    md.append('h');
    const strong = $(md, 'strong');
    expect(strong?.textContent).toBe('h');
    expect(text(md, 'p')).toBe('Say h');
    md.append('i** there\n\n#');
    expect(md.element.textContent).toContain('#');
    md.append(' T');
    expect(text(md, 'h1')).toBe('T');
    expect($(md, 'strong')).toBe(strong);
    md.append('\n\n| a | b |\n');
    expect(md.element.textContent).toContain('| a | b |');
    expect($(md, 'table')).toBeNull();
    md.append('|---|---|\n');
    expect($$(md, 'th').map((c) => c.textContent)).toEqual(['a', 'b']);
    expect(md.element.textContent).not.toContain('|');
    md.append('| 1 ');
    expect(text(md, 'td')?.trim()).toBe('1');
    expect($(md, 'strong')).toBe(strong);
  });

  it('changes nothing at the end when nothing waits', () => {
    const md = view();
    md.append('Text **bold** and a [link](https://x.y)\n\n```\ncode\n```\n');
    const before = md.element.innerHTML;
    md.end();
    expect(md.element.innerHTML).toBe(before);
    expect(md.isEnded).toBe(true);
  });

  it('makes no binding on its parts', () => {
    const md = whole(SAMPLES.join('\n\n'), { copyButton: false });
    const bound: string[] = [];
    const walk = (c: ComponentBase) => {
      for (const child of c.controls.items) {
        if (child.bindings.items.length) bound.push(child.element instanceof Element ? child.element.tagName : '#text');
        walk(child);
      }
    };
    walk(md);
    expect(bound).toEqual([]);
  });

  it('follows a growing text and a streaming flag, adding only what is new', async () => {
    const s = reactive({ text: '', busy: true });
    const md = view({ text: () => s.text, streaming: () => s.busy });
    s.text = 'Hello **wo';
    await tick();
    const strong = $(md, 'strong');
    expect(strong?.textContent).toBe('wo');
    s.text = 'Hello **world** and more';
    await tick();
    expect($(md, 'strong')).toBe(strong);
    expect(md.isEnded).toBe(false);
    s.busy = false;
    await tick();
    expect(md.isEnded).toBe(true);
    s.text = 'Another text';
    await tick();
    expect($(md, 'strong')).toBeNull();
    expect(text(md, 'p')).toBe('Another text');
  });

  it('says so when text is appended after the end, and starts again after clear()', () => {
    const report = vi.spyOn(errorHandler, 'reportSuppressed').mockImplementation(() => {});
    const md = whole('done');
    md.append(' more');
    expect(report).toHaveBeenCalled();
    expect(md.element.textContent).toBe('done');
    md.clear();
    expect(md.element.childNodes.length).toBe(0);
    md.append('again');
    expect(text(md, 'p')).toBe('again');
    expect(md.text).toBe('again');
  });
});

describe('Markdown: code blocks, links and language', () => {
  it('colours each line as it ends through the highlighter door, and keeps a line plain when its runs change it', () => {
    const report = vi.spyOn(errorHandler, 'reportSuppressed').mockImplementation(() => {});
    const opened: string[] = [];
    const highlighter: CodeHighlighter = {
      open: (language) => {
        opened.push(language);
        if (language === 'bad') return { line: () => [{ text: 'changed' }] };
        return { line: (t) => (t ? [{ text: t.slice(0, 3), className: 'kw' }, { text: t.slice(3), color: 'red' }] : []) };
      }
    };
    const md = view({ highlighter, copyButton: false });
    md.append('```js\nlet a');
    expect($(md, '.kw')).toBeNull();
    expect(text(md, 'pre > code')).toBe('let a');
    md.append('\nlet b\n```\n\n```bad\nplain\n```');
    md.end();
    expect(opened).toEqual(['js', 'bad']);
    const codes = $$(md, 'pre > code');
    expect(codes[0].textContent).toBe('let a\nlet b\n');
    expect(Array.from(codes[0].querySelectorAll('.kw')).map((s) => s.textContent)).toEqual(['let', 'let']);
    expect((codes[0].querySelector('span[style]') as HTMLElement).style.color).toBe('red');
    expect(codes[1].textContent).toBe('plain\n');
    expect(codes[1].querySelector('span')).toBeNull();
    expect(report).toHaveBeenCalled();
  });

  it('copies the code with its button and says it copied, in the kit language', async () => {
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    const md = whole('```\nline 1\nline 2\n```');
    const button = $(md, '.mx-markdown__copy') as HTMLElement;
    expect(button.textContent).toBe(enStrings.markdownCopy);
    button.click();
    expect(writeText).toHaveBeenCalledWith('line 1\nline 2\n');
    expect(button.textContent).toBe(enStrings.markdownCopied);
    await uiLocale.use('tr');
    expect(button.textContent).toBe(uiLocale.strings.markdownCopied);
    expect(uiLocale.strings.markdownCopied).toBe('Kopyalandı');
    delete (navigator as { clipboard?: unknown }).clipboard;
  });

  it('opens links where linkTarget says, and lets onLinkClick handle a click', () => {
    const clicks: string[] = [];
    const md = whole('[here](https://x.y/)', {
      linkTarget: '',
      onLinkClick: (e) => {
        clicks.push(e.href);
        e.cancel = true;
      }
    });
    const link = $(md, 'a') as HTMLAnchorElement;
    expect(link.hasAttribute('target')).toBe(false);
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(clicks).toEqual(['https://x.y/']);
    expect(event.defaultPrevented).toBe(true);
  });
});
