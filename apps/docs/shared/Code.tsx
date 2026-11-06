import { highlight, type CodeLanguage } from './highlight';

/** A code example, in colour. It may scroll sideways, so it takes focus: the keys scroll it. */
export function Code(props: { code: string; lang?: CodeLanguage }) {
  const code = props.code.trim();
  return (
    <pre tabindex="0">
      <code onBuilt={(c) => void highlight(c.element as HTMLElement, code, props.lang ?? 'tsx')}>{code}</code>
    </pre>
  );
}
