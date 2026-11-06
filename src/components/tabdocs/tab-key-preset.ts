/**
 * The keys a manager starts with. `browser` uses keys that a browser tab lets through to the page, and
 * `desktop` uses the keys of a desktop editor (Ctrl+W, Ctrl+Tab…), which reach the page only in an
 * installed app. `auto` uses `desktop` when the page runs as an installed app, otherwise `browser`.
 */
export type TabKeyPreset = 'auto' | 'browser' | 'desktop';
