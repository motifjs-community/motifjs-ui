import { Button } from '@motifx-community/ui';

const SaveIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3 2.5h8l2.5 2.5v8.5h-10.5zM5.5 2.5v3.5h5v-3.5M5 13.5v-4h6v4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
  </svg>
);

/** An icon from JSX or from an image address, an icon-only button named by its hint, and JSX children. */
export default function IconAndChildren() {
  return (
    <>
      <Button text="Save" icon={() => <SaveIcon />} />
      <Button text="Next" icon="../favicon.svg" iconPosition="end" variant="outline" />
      <Button icon={() => <SaveIcon />} hint="Save" variant="ghost" />
      <Button tone="accent">
        Total <b>42</b>
      </Button>
    </>
  );
}
