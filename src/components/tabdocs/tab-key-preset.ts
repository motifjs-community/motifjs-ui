/**
 * The keys a manager starts with: `browser` uses keys a browser tab lets the page have, `desktop` the
 * keys of a desktop editor (Ctrl+W, Ctrl+Tab…), which reach the page only in an installed app.
 * `auto` picks `desktop` when the page runs installed, else `browser`.
 */
export type TabKeyPreset = 'auto' | 'browser' | 'desktop';
