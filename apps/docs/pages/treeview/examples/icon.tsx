export const FOLDER = 'M1.5 3.5h5l1.5 1.5h6.5v8h-13z';
export const FILE = 'M3.5 1.5h6l3 3v10h-9zM9.5 1.5v3h3';

/** A small outline icon, a new component for each row. */
export function icon(path: string) {
  return (
    <svg viewBox="0 0 16 16">
      <path d={path} fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
    </svg>
  );
}
