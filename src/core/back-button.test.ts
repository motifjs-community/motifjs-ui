import { describe, expect, it } from 'vitest';
import { backButtonHolders, holdBackButton } from './back-button';

async function until(ok: () => boolean) {
  for (let i = 0; i < 50 && !ok(); i++) await new Promise((r) => setTimeout(r, 10));
}

describe('holdBackButton', () => {
  it('closes the holder of the highest layer first, the last one held among equals, one entry each', async () => {
    const log: string[] = [];
    const releaseDocs = holdBackButton(window, () => void log.push('docs'), 0);
    holdBackButton(window, () => void log.push('list'), 1);
    holdBackButton(window, () => void log.push('sheet'), 1);
    expect(history.state.mxBack).toBe(3);
    history.back();
    await until(() => log.length === 1);
    expect(log).toEqual(['sheet']);
    history.back();
    await until(() => log.length === 2);
    expect(log).toEqual(['sheet', 'list']);
    expect(backButtonHolders(window)).toBe(1);
    // Let go by code: its entry is taken back.
    releaseDocs();
    await until(() => !history.state?.mxBack);
    expect(history.state?.mxBack ?? 0).toBe(0);
    expect(backButtonHolders(window)).toBe(0);
    expect(log).toEqual(['sheet', 'list']);
  });

  it('holds again right after letting go, once the entry going away is gone', async () => {
    const log: string[] = [];
    let pops = 0;
    const count = () => pops++;
    window.addEventListener('popstate', count);
    const release = holdBackButton(window, () => void log.push('a'));
    release();
    holdBackButton(window, () => void log.push('b'));
    // The entry of the first goes away, then the second one's comes.
    await until(() => pops === 1);
    window.removeEventListener('popstate', count);
    expect(history.state?.mxBack).toBe(1);
    history.back();
    await until(() => log.length === 1);
    expect(log).toEqual(['b']);
    await until(() => !history.state?.mxBack);
  });

  it('keeps the state the page had in its entry', async () => {
    history.replaceState({ route: 'here' }, '');
    const release = holdBackButton(window, () => {});
    expect(history.state).toEqual({ route: 'here', mxBack: 1 });
    release();
    await until(() => !history.state?.mxBack);
    expect(history.state).toEqual({ route: 'here' });
  });
});
