import { reactive, type ComponentBase } from '@motifx/core';
import { Button, Markdown, Stack } from '@motifx-community/ui';

const ANSWER = `Sure. A **debounced** search waits until typing pauses:

\`\`\`ts
let timer: number | undefined;
input.oninput = () => {
  clearTimeout(timer);
  timer = setTimeout(() => search(input.value), 300);
};
\`\`\`

| Delay | Feels |
|------:|:------|
| 100 ms | instant, many requests |
| 300 ms | the usual choice |

1. Keep the delay short.
2. Cancel the request a newer one replaces.

See [MDN on setTimeout](https://developer.mozilla.org/docs/Web/API/setTimeout) for details.`;

/**
 * An answer that arrives a few characters at a time, as a model streams it. Every piece shows the moment it comes;
 * a mark not understood yet (\`**\`, \`|\`, a fence) shows as text until it is, then takes its form.
 */
export default function Streaming() {
  const s = reactive({ busy: false });
  let view!: Markdown;
  let timer: ReturnType<typeof setInterval> | undefined;
  let at = 0;

  const stop = () => {
    clearInterval(timer);
    timer = undefined;
    s.busy = false;
  };
  const start = () => {
    stop();
    view.clear();
    at = 0;
    s.busy = true;
    timer = setInterval(() => {
      const piece = ANSWER.slice(at, at + 1 + Math.floor(Math.random() * 6));
      at += piece.length;
      view.append(piece);
      if (at >= ANSWER.length) {
        view.end();
        stop();
      }
    }, 40);
  };

  return (
    <Stack gap="md" ref={(c: ComponentBase) => c.motif.setDisposable(stop)}>
      <Stack orientation="horizontal" gap="sm">
        <Button text={() => (s.busy ? 'Streaming…' : 'Stream the answer')} enabled={() => !s.busy} onclick={start} />
        <Button
          text="Stop"
          variant="outline"
          enabled={() => s.busy}
          onclick={() => {
            stop();
            view.end();
          }}
        />
      </Stack>
      <Markdown ref={(m: Markdown) => (view = m)} />
    </Stack>
  );
}
