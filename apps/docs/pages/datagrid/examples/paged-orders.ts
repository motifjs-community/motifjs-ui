import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { SlowAdapter } from '../../../shared/slow-adapter';
import type { Order } from './order';
import { makeOrders } from './orders';

/** How many times the server below was asked for rows. */
export const pagedLoads = reactive({ count: 0 });

const server = new SlowAdapter<Order, number>({ data: makeOrders(100_000), key: 'id' }, 250);
server.onLoading(() => pagedLoads.count++);

/** 100,000 orders on a server, loaded a page at a time; the paged grid shows them, the export reads them. */
export const pagedOrders = new data.DataSource<Order, number>({ adapter: server, loadMode: 'page', pageSize: 20 });
