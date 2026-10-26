import type { TabDocumentKeys } from './tab-document-keys';

/** The keys of the strip, the splitters and "Move to…", and the moves no browser keeps: the same everywhere. */
const LOCAL: Pick<
  TabDocumentKeys,
  | 'stripNext'
  | 'stripPrevious'
  | 'stripFirst'
  | 'stripLast'
  | 'closeFocusedTab'
  | 'resizeSmaller'
  | 'resizeLarger'
  | 'resizeMin'
  | 'resizeMax'
  | 'moveToNextGroup'
  | 'moveToPreviousGroup'
  | 'moveToGroupLeft'
  | 'moveToGroupRight'
  | 'moveToGroupUp'
  | 'moveToGroupDown'
  | 'moveTo'
  | 'targetLeft'
  | 'targetRight'
  | 'targetUp'
  | 'targetDown'
  | 'targetNextGroup'
  | 'targetPreviousGroup'
  | 'targetDrop'
  | 'targetCancel'
  | 'float'
  | 'dock'
  | 'dockLeft'
  | 'dockRight'
  | 'dockTop'
  | 'dockBottom'
  | 'toggleAutoHide'
  | 'autoHideNext'
  | 'autoHidePrevious'
  | 'nextPart'
  | 'previousPart'
  | 'moveWindow'
  | 'maximizeWindow'
  | 'closeWindow'
  | 'windowLeft'
  | 'windowRight'
  | 'windowUp'
  | 'windowDown'
  | 'windowNarrower'
  | 'windowWider'
  | 'windowShorter'
  | 'windowTaller'
  | 'windowDone'
  | 'windowCancel'
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
  moveToNextGroup: ['Ctrl+Alt+ArrowRight'],
  moveToPreviousGroup: ['Ctrl+Alt+ArrowLeft'],
  moveToGroupLeft: ['Ctrl+K Shift+ArrowLeft'],
  moveToGroupRight: ['Ctrl+K Shift+ArrowRight'],
  moveToGroupUp: ['Ctrl+K Shift+ArrowUp'],
  moveToGroupDown: ['Ctrl+K Shift+ArrowDown'],
  moveTo: ['Ctrl+K M'],
  targetLeft: ['ArrowLeft'],
  targetRight: ['ArrowRight'],
  targetUp: ['ArrowUp'],
  targetDown: ['ArrowDown'],
  targetNextGroup: ['Tab'],
  targetPreviousGroup: ['Shift+Tab'],
  targetDrop: ['Enter'],
  targetCancel: ['Escape'],
  float: ['Ctrl+K O'],
  dock: ['Ctrl+K D'],
  dockLeft: ['Ctrl+K Alt+ArrowLeft'],
  dockRight: ['Ctrl+K Alt+ArrowRight'],
  dockTop: ['Ctrl+K Alt+ArrowUp'],
  dockBottom: ['Ctrl+K Alt+ArrowDown'],
  toggleAutoHide: ['Ctrl+K H'],
  autoHideNext: ['ArrowDown', 'ArrowRight'],
  autoHidePrevious: ['ArrowUp', 'ArrowLeft'],
  nextPart: ['F6'],
  previousPart: ['Shift+F6'],
  moveWindow: ['Ctrl+K Space'],
  maximizeWindow: ['Ctrl+K Shift+M'],
  closeWindow: ['Ctrl+K Shift+W'],
  windowLeft: ['ArrowLeft'],
  windowRight: ['ArrowRight'],
  windowUp: ['ArrowUp'],
  windowDown: ['ArrowDown'],
  windowNarrower: ['Shift+ArrowLeft'],
  windowWider: ['Shift+ArrowRight'],
  windowShorter: ['Shift+ArrowUp'],
  windowTaller: ['Shift+ArrowDown'],
  windowDone: ['Enter'],
  windowCancel: ['Escape'],
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
  moveTabLeft: ['Ctrl+Shift+PageUp'],
  moveTabRight: ['Ctrl+Shift+PageDown'],
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
  moveTabLeft: ['Alt+Shift+PageUp', 'Ctrl+Shift+PageUp'],
  moveTabRight: ['Alt+Shift+PageDown', 'Ctrl+Shift+PageDown'],
  ...LOCAL,
};
