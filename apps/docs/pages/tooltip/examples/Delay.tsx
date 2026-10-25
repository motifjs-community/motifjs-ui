import { Button, Tooltip } from '@motifx-community/ui';

const DELAYS = [0, 500, 1500];

/** Three tooltips that wait a different time before they show. */
export default function Delay() {
  const targets: Button[] = [];
  return (
    <>
      {DELAYS.map((delay, i) => (
        <span key={delay}>
          <Button ref={(b: Button) => (targets[i] = b)} text={`delay ${delay}`} variant="outline" />
          <Tooltip target={() => targets[i]} text={`Shown after ${delay} ms`} delay={delay} />
        </span>
      ))}
    </>
  );
}
