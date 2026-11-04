import { Avatar, Stack } from '@motifx-community/ui';

// A picture of our own, so the example needs no network: a sunset as an SVG.
const PICTURE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="sky" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#3b5bdb"/><stop offset="1" stop-color="#f08c00"/></linearGradient></defs>' +
    '<rect width="64" height="64" fill="url(#sky)"/><circle cx="32" cy="40" r="12" fill="#ffd43b"/>' +
    '<path d="M0 46h64v18H0z" fill="#2b8a3e"/></svg>',
)}`;

/** A picture; initials when there is none or it cannot load; a person icon without a name. */
export default function Content() {
  return (
    <Stack orientation="horizontal" wrap align="center">
      <Avatar name="Ada Lovelace" src={PICTURE} />
      <Avatar name="Ada Lovelace" />
      <Avatar name="Alan Turing" src="does-not-exist.png" />
      <Avatar initials="QA" label="Quality team" />
      <Avatar />
    </Stack>
  );
}
