import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DataState } from './data-state';
import { GridData } from './GridData';

type Row = { id: number };
const TOTAL = 50_000;

/** A pretend server whose answers the test sends. */
class Server extends data.DataAdapter<Row, number> {
  readonly requests: data.LoadOptions[] = [];
  private readonly pending: { options: data.LoadOptions; resolve: (r: data.LoadResult<Row>) => void; reject: (e: unknown) => void }[] = [];

  constructor(private readonly size = TOTAL) {
    super({ key: 'id' });
  }

  protected backendCapabilities(): data.Capabilities {
    return { filter: true, sort: true, paging: true, count: true, select: false, group: false, summary: false, insert: false, update: false, remove: false };
  }

  protected loadRows(options: data.LoadOptions): Promise<data.LoadResult<Row>> {
    this.requests.push(options);
    return new Promise((resolve, reject) => this.pending.push({ options, resolve, reject }));
  }

  blocks(): number[] {
    return this.requests.map((r) => (r.skip ?? 0) / 100);
  }

  async answer() {
    while (this.pending.length) {
      const { options, resolve } = this.pending.shift()!;
      const skip = options.skip ?? 0;
      const rows: Row[] = [];
      for (let i = skip; i < Math.min(this.size, skip + (options.take ?? 0)); i++) rows.push({ id: i });
      resolve({ rows, total: options.count ? this.size : undefined });
    }
    await settle();
  }

  async fail() {
    while (this.pending.length) this.pending.shift()!.reject(new Error('boom'));
    await settle();
  }
}

async function settle() {
  for (let i = 0; i < 30; i++) await Promise.resolve();
}

function grid(options: { cacheBlocks?: number } = {}) {
  const server = new Server();
  const source = new data.DataSource<Row, number>({ adapter: server, loadMode: 'blocks', pageSize: 100, cacheBlocks: options.cacheBlocks });
  const state = reactive<DataState>({ status: 'loading', version: 0, edits: 0, failedBlocks: 0 });
  const rows = new GridData<Row>({ source, owned: true, paged: false, pageSize: 100, saveMode: 'wait', validateRow: () => null, state, edited: () => {} });
  return { server, rows, state };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('GridData over blocks', () => {
  it('loads the first block and learns the total', async () => {
    const { server, rows, state } = grid();
    rows.ensure(0, 20, true);
    expect(server.blocks()).toEqual([0]);
    expect(rows.rowAt(5)).toBeUndefined();
    await server.answer();
    expect(rows.total).toBe(TOTAL);
    expect(state.status).toBe('ready');
    expect(rows.rowAt(5)).toEqual({ id: 5 });
  });

  it('jumping to the end in code asks only for the last block, nothing in between', async () => {
    const { server, rows } = grid();
    rows.ensure(0, 20, true);
    await server.answer();
    rows.ensure(TOTAL - 20, TOTAL, true);
    await server.answer();
    expect(server.blocks()).toEqual([0, 499]);
    expect(rows.rowAt(TOTAL - 1)).toEqual({ id: TOTAL - 1 });
  });

  it('a drag waits until it stops and loads only where it stopped', async () => {
    const { server, rows } = grid();
    rows.ensure(0, 20, true);
    await server.answer();
    for (let first = 1000; first <= 40_000; first += 1300) {
      rows.ensure(first, first + 20, false);
      vi.advanceTimersByTime(16);
    }
    expect(server.blocks()).toEqual([0]);
    rows.ensure(41_000, 41_020, false);
    vi.advanceTimersByTime(130);
    await server.answer();
    expect(server.blocks()).toEqual([0, 410]);
  });

  it('slow scrolling loads at once', async () => {
    const { server, rows } = grid();
    rows.ensure(0, 20, true);
    await server.answer();
    rows.ensure(90, 110, false);
    expect(server.blocks()).toEqual([0, 1]);
  });

  it('aborts a block that is no longer near the view', async () => {
    const { server, rows } = grid();
    rows.ensure(0, 20, true);
    await server.answer();
    rows.ensure(5000, 5020, true);
    const request = server.requests[1];
    rows.ensure(30_000, 30_020, true);
    expect(request.signal?.aborted).toBe(true);
    await server.answer();
    expect(rows.rowAt(5000)).toBeUndefined();
    expect(rows.rowAt(30_000)).toEqual({ id: 30_000 });
  });

  it('starts again after a sort change; answers from before it are ignored', async () => {
    const { server, rows, state } = grid();
    rows.ensure(0, 20, true);
    rows.setSort([{ field: 'id', dir: 'desc' }]);
    expect(state.status).toBe('loading');
    await server.answer();
    expect(server.requests.at(-1)!.sort).toEqual([{ field: 'id', dir: 'desc' }]);
    expect(rows.rowAt(0)).toEqual({ id: 0 });
    expect(state.status).toBe('ready');
  });

  it('drops old blocks beyond the cache size but never the pinned one', async () => {
    const { server, rows } = grid({ cacheBlocks: 4 });
    rows.ensure(0, 20, true);
    await server.answer();
    rows.pin(10);
    for (let b = 10; b < 20; b++) {
      rows.ensure(b * 100, b * 100 + 20, true);
      await server.answer();
    }
    expect(rows.rowAt(10)).toEqual({ id: 10 });
    expect(rows.rowAt(1000)).toBeUndefined();
    expect(rows.rowAt(1900)).toEqual({ id: 1900 });
  });

  it('reports a first-load error and retries', async () => {
    const { server, rows, state } = grid();
    rows.ensure(0, 20, true);
    await server.fail();
    expect(state.status).toBe('error');
    rows.retry();
    await server.answer();
    expect(state.status).toBe('ready');
  });

  it('counts later block failures apart', async () => {
    const { server, rows, state } = grid();
    rows.ensure(0, 20, true);
    await server.answer();
    rows.ensure(200, 220, true);
    await server.fail();
    expect(state.status).toBe('ready');
    expect(state.failedBlocks).toBe(1);
    rows.retry();
    await server.answer();
    expect(state.failedBlocks).toBe(0);
    expect(rows.rowAt(210)).toEqual({ id: 210 });
  });
});
