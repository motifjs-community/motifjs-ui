import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import Highlighting from './examples/Highlighting';
import Streaming from './examples/Streaming';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const SUPPORTED = [
  ['Headings', '`#` to `######` and a space. A heading underlined with `===` or `---` is not supported: it would turn a finished paragraph into a heading.'],
  ['Emphasis', '`*em*`, `**strong**`, `***both***`, `~~deleted~~`, with CommonMark’s rules for where a run can open and close. `snake_case` stays text.'],
  ['Code', 'Inline `` `code` ``, and fenced blocks with ```` ``` ```` or `~~~` and a language.'],
  ['Lists', 'Bullet (`-`, `*`, `+`) and ordered (`1.`, `1)`) lists, nested by indentation, with task items `- [ ]` and `- [x]`.'],
  ['Quotes', '`>`, with any block inside, nested quotes included.'],
  ['Tables', 'Lines starting with `|`, a delimiter line with `:` for the alignment, and `\\|` for a pipe in a cell.'],
  ['Links', '`[text](address "title")`, and bare addresses that start with `https://`, `http://` or `www.`.'],
  ['Images', '`![alt](address)`: shown only when `images` is on (see Links and images).'],
  ['Footnotes', '`[^label]` refers to a note written as `[^label]: text` at a line’s start; lines indented under it go on in it. References are numbered by the order they first appear.'],
  ['Math, diagrams', '`$…$`, `$$…$$` and ```` ```math ````, and fenced blocks in a diagram language, with a door (see Footnotes, math and diagrams). Without one, `$` is text and a diagram stays code.'],
  ['Other', 'Horizontal rules (`---`, `***`, `___`), hard line breaks (two spaces or `\\` at the end of a line), escapes and entities (`&amp;`, `&#39;`). HTML is shown as text.'],
];

const PROPS = [
  ['text', '`Bind<string>`', "`''`", 'The markdown. A new value that goes on from the last one adds only what is new; any other value is a new text.'],
  ['streaming', '`Bind<boolean>`', '`false`', 'While `true`, `text` is still arriving. When it turns `false`, the text ends. Without it, a given text ends at once.'],
  ['highlighter', '`Bind<CodeHighlighter | null>`', 'None', 'The door for any highlighter. Code stays plain without one.'],
  ['mathRenderer', '`Bind<MathRenderer | null>`', 'None', 'The door for math: draws TeX once it is complete. Without one, `$` is text.'],
  ['diagramRenderer', '`Bind<DiagramRenderer | null>`', 'None', 'The door for diagrams: draws a fenced block in a language it draws once its code is complete.'],
  ['images', '`Bind<boolean>`', '`false`', 'Shows images. While off, an image is a link to its address.'],
  ['allowImage', '`Bind<((src: string) => boolean) | null>`', 'Every safe address', 'With `images`, decides which addresses are shown. The others stay text.'],
  ['linkTarget', '`Bind<string>`', "`'_blank'`", 'Where links open. `rel="noopener noreferrer"` comes with a target. Use `\'\'` for the same tab.'],
  ['copyButton', '`Bind<boolean>`', '`true`', 'Shows a copy button on code blocks.'],
  ['onLinkClick', '`(e: MarkdownLinkClickEventArgs) => void`', '', 'A link was clicked. `e.href`, `e.event`. Set `e.cancel` to handle it yourself.'],
  ['visible', 'see Control', '', 'Properties shared by all controls.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write', 'Accepts a value or a function, the same as the prop. A changed setting reaches what is drawn after it.'],
  ['isEnded', 'read-only', '`true` once the text is complete.'],
];

const METHODS = [
  ['append(delta)', 'Adds `delta`. What it completes takes its form, and the rest is on screen as text at once.'],
  ['end()', 'The text is complete. What waits at the end is decided as at the end of a line. Nothing drawn is drawn again.'],
  ['clear()', 'Removes everything, to start a new text.'],
  ['blockAt(index)', 'The block drawn for the character at `index` of the text: a paragraph, heading, code block, rule, table row or footnote. `null` before the first block, or past what is written. A search uses it to show where it found a text.'],
];

const DOORS = [
  ['MathRenderer.render(tex, display)', 'Draws `tex`, a block of its own when `display` (`$$…$$`, ```` ```math ````), in the line otherwise. Return an element, which is placed as it is, or `null` to keep the TeX as written.'],
  ['DiagramRenderer.draws(language)', 'Whether it draws code fenced as `language` (`mermaid`).'],
  ['DiagramRenderer.render(code, language)', 'Draws the code once it is complete. Return an element, a promise of one, or `null` to keep the code.'],
];

const HIGHLIGHTER = [
  ['CodeHighlighter.open(language)', 'Called when a code block starts, with the first word of its fence (`\'\'` for none). Return a `CodeColorer`, or `null` to keep the block plain.'],
  ['CodeColorer.line(text)', 'Called once for each line as it ends. Return runs `{ text, className?, color? }`. Their texts joined must be the line exactly, or the line stays plain.'],
  ['CodeColorer.close()', 'Optional. The block ended.'],
];

const A11Y = [
  ['Structure', 'Real headings, lists, quotes, tables and links, so screen readers navigate them as usual.'],
  ['Task items', 'The box has the role `img` and a name in the kit language: “Done” or “Not done”.'],
  ['Copy button', 'A button named “Copy”, which says “Copied” for a moment after copying.'],
  ['Footnotes', 'A reference is a link named “Footnote 1”; it moves the focus to its note, and the note’s first link, “Back to reference 1”, moves it back. The page’s address does not change.'],
  ['Motion', 'Nothing moves. Text appears where it belongs.'],
];

const LOCALE = [
  ['markdownCopy, markdownCopied', 'The copy button and what it says after copying.'],
  ['markdownTaskDone, markdownTaskOpen', 'The names of the task boxes.'],
  ['markdownFootnote, markdownFootnoteBack', 'The names of a footnote’s reference and of the link back to it.'],
];

const HOOKS = [
  ['.mx-markdown', 'The component.'],
  ['.mx-markdown__paragraph, .mx-markdown__h1 … __h6', 'Paragraphs and headings.'],
  ['.mx-markdown__strong, __em, __del, __code, __link, __break', 'Inline elements.'],
  ['.mx-markdown__list, __item, __task', 'Lists, their items (`data-task` on task items) and task boxes (`data-done`).'],
  ['.mx-markdown__quote, __rule', 'Quotes and horizontal rules.'],
  ['.mx-markdown__block, __code-header, __language, __copy, __pre, __code-text', 'A code block, its header, language, copy button, and code (`data-language`).'],
  ['.mx-markdown__table, __head, __body, __row, __cell', 'Tables. Cells carry `data-align` (`start`, `center`, `end`).'],
  ['.mx-markdown__image, __img', 'An image and its alternative text.'],
  ['.mx-markdown__footnote-ref, __footnote-link, __footnotes, __footnote, __footnote-back', 'A footnote’s reference, the list of notes, a note and its link back.'],
  ['.mx-markdown__math, __math-block, __math-text', 'Math in a line and in a block, and its TeX until it is drawn; `data-drawn` once the door drew it. A code block drawn by a door has `data-drawn` (`math`, `diagram`).'],
];

const TOKENS = [
  ['markdown.flow-gap, markdown.item-gap', 'The space between blocks, and between list items.'],
  ['markdown.h1 … markdown.h6, markdown.paragraph, markdown.strong, markdown.link', 'Units: the type of headings, paragraphs, strong text and links (`hover`).'],
  ['markdown.inline-code, markdown.quote, markdown.list, markdown.task, markdown.rule', 'Units: inline code, the quote bar, the list indent, the task box (`done`) and rules.'],
  ['markdown.code-block, markdown.code-header, markdown.code-language, markdown.code-text', 'Units: a code block’s frame, header, language and code. Use `white-space` on `code-text` to decide whether long lines wrap.'],
  ['markdown.table, markdown.cell, markdown.image', 'Units: the table frame, cells (`head`) and images.'],
  ['markdown.footnote-ref, markdown.footnotes, markdown.footnote, markdown.footnote-back', 'Units: a reference’s number, the list of notes, a note (`focus`) and its link back.'],
  ['markdown.math-block, markdown.math-text', 'Units: display math, and TeX not drawn yet. `code-block` has `drawn` for math drawn in its place.'],
  ['markdown.copy (place)', 'The variant, tone and size of the copy button.'],
];

export default function MarkdownPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Shows markdown, either all at once or as it arrives from a model. Each character appears the moment it is written. A mark whose meaning is not known yet shows as text until it is, then its element is made and the text continues inside it. Nothing that has been drawn is drawn again, while the text grows or when it ends." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Markdown } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="usage" title="Usage">
        <Example files={code('Basic.tsx')}>
          <Basic />
        </Example>
        <Code
          code={`
const view = new Markdown({ text: '# Hello\\n\\nSome **markdown**.' });
`}
        />
      </Section>

      <Section anchor="streaming" title="Streaming">
        <p>
          <Rich text="Call `append` with each piece as it comes, and `end` when the answer is complete. In JSX, bind `text` to the growing answer and `streaming` to whether it is still coming. Each new value adds only what is new." />
        </p>
        <Example files={code('Streaming.tsx')}>
          <Streaming />
        </Example>
        <Code
          code={`
<Markdown text={() => this.answer.text} streaming={() => this.answer.busy} />

const view = new Markdown();
for await (const delta of stream) view.append(delta);
view.end();
`}
        />
        <p>
          <Rich text="Nothing waits to be shown. `**` appears as text until the next character says whether it opens bold text. `#` at the start of a line becomes a heading at the space that follows it. A line starting with `|` becomes a table when the delimiter line under it is complete. Once an element is made, it stays: unclosed bold text at the end of a paragraph stays bold." />
        </p>
      </Section>

      <Section anchor="supported" title="What is supported">
        <ApiTable head={['Element', 'Details']} rows={SUPPORTED} />
      </Section>

      <Section anchor="code" title="Code blocks and highlighting">
        <p>
          <Rich text="A code block shows its language and a copy button. Any highlighter can colour it through `highlighter`. Each line takes its colours when it ends, and lines that are already drawn are never coloured again. A highlighter that loads later colours the blocks that start after it is ready." />
        </p>
        <Example files={code('Highlighting.tsx')}>
          <Highlighting />
        </Example>
        <ApiTable head={['Member', 'Description']} rows={HIGHLIGHTER} />
      </Section>

      <Section anchor="doors" title="Footnotes, math and diagrams">
        <p>
          <Rich text="A footnote’s reference becomes its number, raised, as soon as its `]` is followed by anything but `(`; its note, `[^1]: text`, is drawn where it is written, in a numbered list with the notes written right after it, and opens with a link back to the first reference. Math and diagrams come through doors, as code colours do: the kit draws no TeX and no diagram itself. Their text shows as it arrives; once it is complete (the closing `$`, the closing `$$` or fence, or the end of the text) the door draws it, and what it gives takes the text’s place. A `$` opens math only when text follows it, and a `$` closes it unless a digit follows, so prices stay text; math left open at the end of its line stays as written." />
        </p>
        <Code
          code={`
import katex from 'katex';
import mermaid from 'mermaid';

const mathRenderer: MathRenderer = {
  render(tex, display) {
    const host = document.createElement('span');
    katex.render(tex, host, { displayMode: display, throwOnError: false });
    return host;
  },
};

let count = 0;
const diagramRenderer: DiagramRenderer = {
  draws: (language) => language === 'mermaid',
  async render(code) {
    const { svg } = await mermaid.render(\`diagram-\${++count}\`, code);
    const host = document.createElement('div');
    host.innerHTML = svg;
    return host;
  },
};

<Markdown text={() => this.answer.text} mathRenderer={mathRenderer} diagramRenderer={diagramRenderer} />
`}
        />
        <ApiTable head={['Member', 'Description']} rows={DOORS} />
      </Section>

      <Section anchor="links" title="Links and images">
        <p>
          <Rich text="HTML in the text is shown as text. A link takes only a safe address: a relative one, `#…`, `http:`, `https:`, `mailto:` or `tel:`. Any other address, such as `javascript:` or `data:`, leaves the link without an address. Images are off by default, because an image address in a model’s answer can send data to another site. Turn them on with `images` and limit them with `allowImage`." />
        </p>
        <Code
          code={`
<Markdown text={() => this.answer.text} images allowImage={(src) => src.startsWith('https://cdn.example.com/')} />
`}
        />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'Details']} rows={A11Y} />
      </Section>

      <Section anchor="localization" title="Localization">
        <ApiTable head={['String', 'Used for']} rows={LOCALE} />
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
        <h3>
          <Rich text="Component tokens" />
        </h3>
        <ApiTable head={['Token', 'Description']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="Props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>
          <Rich text="Properties" />
        </h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>
          <Rich text="Methods" />
        </h3>
        <ApiTable head={['Method', 'Description']} rows={METHODS} />
      </Section>
    </>
  );
}
