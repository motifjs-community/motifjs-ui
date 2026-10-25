import { RadioGroup, type ControlSize } from '@motifx-community/ui';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

/** A group in each size. */
export default function Sizes() {
  return (
    <>
      {SIZES.map((size) => (
        <RadioGroup key={size} label={size} size={size} items={['One', 'Two']} value="Two" />
      ))}
    </>
  );
}
