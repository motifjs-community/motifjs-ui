/** An order of the examples. */
export interface Order {
  id: number;
  customer: string;
  city: string;
  amount: number;
}

const customers = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Edsger Dijkstra', 'Barbara Liskov', 'Donald Knuth'];
const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'];

/** `count` made-up orders, the same every time. */
export function makeOrders(count: number): Order[] {
  return Array.from({ length: count }, (_, i) => ({
    id: 1001 + i,
    customer: customers[i % customers.length],
    city: cities[(i * 7) % cities.length],
    amount: Math.round(((i * 37) % 900) + 100),
  }));
}
