import { Switch, type ControlSize } from '@motifx-community/ui';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

/** A switch in each size, with its on / off text. */
export default function Sizes() {
  return (
    <>
      {SIZES.map((size) => (
        <Switch key={size} label={size} size={size} value={size === 'md'} onText="On" offText="Off" />
      ))}
    </>
  );
}
