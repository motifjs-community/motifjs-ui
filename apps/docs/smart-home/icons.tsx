/** Outline icons of the panel, drawn from paths in a 24 by 24 box. */
function icon(d: string) {
    return () => (
        <svg class="sh-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d={d} fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    );
}

export const HomeIcon = icon('M3.5 11 12 4l8.5 7M5.5 9.5V20h13V9.5M10 20v-5.5h4V20');
export const RoomsIcon = icon('M4 20h16M6 20V4h9v16M15 6h3v14M12.5 12.5v.5');
export const ClimateIcon = icon('M12 14.5V5.5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0zM10 11v6M15 6h3M15 9.5h3M15 13h2');
export const EnergyIcon = icon('M13 3 5.5 13.5H12L11 21l7.5-10.5H12z');
export const SecurityIcon = icon('M12 3.5 5 6.5v5c0 4.3 3 7.6 7 9 4-1.4 7-4.7 7-9v-5zM9.5 12l2 2 3.5-4');
export const AutomationsIcon = icon('M12 7v5l3 2M20 12a8 8 0 1 1-2.3-5.7M20 4v4h-4');
export const BellIcon = icon('M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0');
export const SunIcon = icon('M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4');
export const CloudIcon = icon('M7 18.5h10a4 4 0 0 0 .6-8 6 6 0 0 0-11.5 1.6A3.3 3.3 0 0 0 7 18.5z');
export const MoonIcon = icon('M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z');
export const FilmIcon = icon('M4 5h16v14H4zM8 5v14M16 5v14M4 9h4M4 15h4M16 9h4M16 15h4');
export const DoorIcon = icon('M6 21V4h12v17M4 21h16M14.5 12.5v.5');
export const LockIcon = icon('M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13v9.5h-13zM12 15v2');
export const UnlockIcon = icon('M7 11V8a5 5 0 0 1 9.6-2M5.5 11h13v9.5h-13zM12 15v2');
export const BulbIcon = icon('M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z');
export const MinusIcon = icon('M6 12h12');
export const PlusIcon = icon('M12 6v12M6 12h12');
export const DropIcon = icon('M12 3.5S6.5 10 6.5 14a5.5 5.5 0 0 0 11 0C17.5 10 12 3.5 12 3.5z');
export const WindIcon = icon('M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h8');
