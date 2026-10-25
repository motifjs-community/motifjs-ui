import { CheckBox, type ControlSize } from '@motifx-community/ui';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

/** A checkbox in each size. */
export default function Sizes() {
  return (
    <>
      {SIZES.map((size) => (
        <CheckBox key={size} label={size} size={size} value={size !== 'sm'} />
      ))}
    </>
  );
}
