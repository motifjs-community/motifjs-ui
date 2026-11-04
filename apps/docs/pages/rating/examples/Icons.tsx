import { Rating } from '@motifx-community/ui';

// A heart of our own, as image addresses: an outline and a filled one, drawn in the stars' colours.
const svg = (body: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`)}`;
const HEART = 'M8 13.5S2 10 2 5.75A2.75 2.75 0 0 1 8 4.5a2.75 2.75 0 0 1 6 1.25C14 10 8 13.5 8 13.5z';
const EMPTY = svg(`<path d="${HEART}" fill="none" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>`);
const FILLED = svg(`<path d="${HEART}" fill="black"/>`);

/** Icons of your own: a name of the kit's set, or an image address. */
export default function Icons() {
  return <Rating label="How much do you like it?" emptyIcon={EMPTY} filledIcon={FILLED} value={3} />;
}
