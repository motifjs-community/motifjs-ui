import { sources } from '../../shared/sources';

/** The example files of the DataGrid pages, by name. */
export const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

/** An example's file, then the order data it uses. */
export const withOrders = (name: string, ...more: string[]) => code(name, ...more, 'orders.ts', 'order.ts');
