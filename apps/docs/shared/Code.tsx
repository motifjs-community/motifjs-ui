/** A code example. It may scroll sideways, so it takes focus: the keys scroll it. */
export function Code(props: { code: string }) {
  return (
    <pre tabindex="0">
      <code>{props.code.trim()}</code>
    </pre>
  );
}
