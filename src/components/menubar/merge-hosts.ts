import type { MenuBar } from './MenuBar';

// The main bars by name, and the bars that want to merge into one not there yet.
const hosts = new Map<string, MenuBar>();
const waiting = new Set<MenuBar>();

export const mergeHosts = {
  get(name: string): MenuBar | null {
    return hosts.get(name) ?? null;
  },

  /** Makes `bar` the main bar of `name`; the bars waiting for it merge now. */
  add(name: string, bar: MenuBar): void {
    hosts.set(name, bar);
    for (const one of [...waiting]) one.merge();
  },

  remove(name: string, bar: MenuBar): void {
    if (hosts.get(name) === bar) hosts.delete(name);
  },

  wait(bar: MenuBar): void {
    waiting.add(bar);
  },

  stopWaiting(bar: MenuBar): void {
    waiting.delete(bar);
  },
};
