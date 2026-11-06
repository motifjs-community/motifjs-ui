/** A customer, as stored by a second sample service. */
export interface Customer {
  id: number;
  name: string;
  city: string;
}

const FIRST = ['Ada', 'Grace', 'Alan', 'Cahit', 'Katherine', 'Edsger', 'Barbara', 'Donald', 'İlhan', 'Margaret', 'Feza', 'Ali Nesin'];
const LAST = ['Lovelace', 'Hopper', 'Turing', 'Arf', 'Johnson', 'Dijkstra', 'Liskov', 'Knuth', 'Koman', 'Hamilton', 'Gürsey', 'Yılmaz'];
const CITIES = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];

/** `n` sample customers, the same ones every time. */
export function makeCustomers(n: number): Customer[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `${FIRST[i % FIRST.length]} ${LAST[Math.floor(i / FIRST.length) % LAST.length]} ${Math.floor(i / (FIRST.length * LAST.length)) + 1}`,
    city: CITIES[(i * 5) % CITIES.length],
  }));
}
