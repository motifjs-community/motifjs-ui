import type { UiPack } from './ui-pack';

/** What a pack loader gives: the pack, or a module whose `default` is the pack (`import('./tr.json')`). */
export type UiPackModule = UiPack | { default: UiPack };
