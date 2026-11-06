import { reactive } from '@motifx/core';
import { TextBox } from '@motifx-community/ui';

const SearchIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5" />
    <path d="M10.5 10.5l3 3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  </svg>
);

const CopyIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M5.5 5.5h8v8h-8zM3 10.5h-.5v-8h8v.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

/** Fixed text around the value, an icon at the start, and a custom button in the box. */
export default function PrefixSuffix() {
  const s = reactive({ site: '', query: '' });
  const link = 'https://motifjs.com/invite/42';
  return (
    <>
      <TextBox label="Site" prefix="https://" suffix=".com" x-model={() => s.site} />
      <TextBox label="Search" type="search" icon={() => <SearchIcon />} clearButton x-model={() => s.query} />
      <TextBox
        label="Invite link"
        readOnly
        value={link}
        buttons={[{ icon: () => <CopyIcon />, hint: 'Copy', click: () => navigator.clipboard.writeText(link) }]}
      />
    </>
  );
}
