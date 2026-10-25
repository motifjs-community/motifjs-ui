import { Button, toast, type ToastPosition } from '@motifx-community/ui';

const POSITIONS: ToastPosition[] = ['top-start', 'top', 'top-end', 'bottom-start', 'bottom', 'bottom-end'];

/** A toast at each of the six positions. */
export default function Positions() {
  return (
    <>
      {POSITIONS.map((position) => (
        <Button key={position} text={position} size="sm" variant="outline" onclick={() => toast.info(`At ${position}.`, { position })} />
      ))}
    </>
  );
}
