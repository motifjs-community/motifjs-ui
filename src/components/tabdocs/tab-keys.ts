import type { TabDocumentKeys } from './tab-document-keys';

/** The keys of the strip and the splitters, the same everywhere. */
const LOCAL: Pick<
  TabDocumentKeys,
  'stripNext' | 'stripPrevious' | 'stripFirst' | 'stripLast' | 'closeFocusedTab' | 'resizeSmaller' | 'resizeLarger' | 'resizeMin' | 'resizeMax'
> = {
  stripNext: ['ArrowRight'],
  stripPrevious: ['ArrowLeft'],
  stripFirst: ['Home'],
  stripLast: ['End'],
  closeFocusedTab: ['Delete'],
  resizeSmaller: ['ArrowLeft', 'ArrowUp'],
  resizeLarger: ['ArrowRight', 'ArrowDown'],
  resizeMin: ['Home'],
  resizeMax: ['End'],
};

/**
 * The keys of a desktop code editor. In a browser tab the browser keeps Ctrl+W, Ctrl+Tab,
 * Ctrl+Shift+T, Ctrl+PageUp / PageDown and often Ctrl+1…9 for itself; an installed app gets them.
 */
export const DESKTOP_KEYS: Readonly<TabDocumentKeys> = {
  nextTab: ['Ctrl+PageDown'],
  previousTab: ['Ctrl+PageUp'],
  closeTab: ['Ctrl+W', 'Ctrl+F4'],
  closeAllTabs: ['Ctrl+K W'],
  closeSavedTabs: ['Ctrl+K U'],
  focusGroup: ['Ctrl+{n}'],
  splitRight: ['Ctrl+\\'],
  recentNext: ['Ctrl+Tab'],
  recentPrevious: ['Ctrl+Shift+Tab'],
  goBack: ['Alt+ArrowLeft'],
  goForward: ['Alt+ArrowRight'],
  reopenClosed: ['Ctrl+Shift+T'],
  keepOpen: ['Ctrl+K Enter'],
  togglePin: ['Ctrl+K Shift+Enter'],
  showOpenList: ['Ctrl+K Ctrl+P'],
  ...LOCAL,
};

/**
 * Keys a page in a browser tab receives, chosen the way the web version of the editor chooses them:
 * Ctrl+Alt in place of a Ctrl the browser keeps (Ctrl+E, the quick-open key, for the recent list),
 * then the desktop key as well, for an installed app or a browser that lets it through.
 */
export const BROWSER_KEYS: Readonly<TabDocumentKeys> = {
  nextTab: ['Alt+PageDown', 'Ctrl+PageDown'],
  previousTab: ['Alt+PageUp', 'Ctrl+PageUp'],
  closeTab: ['Ctrl+Alt+W', 'Ctrl+W'],
  closeAllTabs: ['Ctrl+K W'],
  closeSavedTabs: ['Ctrl+K U'],
  focusGroup: ['Ctrl+Alt+{n}', 'Ctrl+{n}'],
  splitRight: ['Ctrl+\\'],
  recentNext: ['Ctrl+E', 'Ctrl+Tab'],
  recentPrevious: ['Ctrl+Shift+E', 'Ctrl+Shift+Tab'],
  goBack: ['Alt+ArrowLeft'],
  goForward: ['Alt+ArrowRight'],
  reopenClosed: ['Ctrl+Alt+Shift+T', 'Ctrl+Shift+T'],
  keepOpen: ['Ctrl+K Enter'],
  togglePin: ['Ctrl+K Shift+Enter'],
  showOpenList: ['Ctrl+K Ctrl+P'],
  ...LOCAL,
};
