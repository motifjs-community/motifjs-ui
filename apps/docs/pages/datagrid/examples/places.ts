/** Provinces and their districts, for the cascading lists. */
export interface Province {
  code: string;
  name: string;
}

export interface District {
  id: number;
  name: string;
  province: string;
}

export const PROVINCES: Province[] = [
  { code: 'AN', name: 'Ankara' },
  { code: 'IS', name: 'İstanbul' },
  { code: 'IZ', name: 'İzmir' },
];

export const DISTRICTS: District[] = [
  { id: 1, name: 'Çankaya', province: 'AN' },
  { id: 2, name: 'Keçiören', province: 'AN' },
  { id: 3, name: 'Yenimahalle', province: 'AN' },
  { id: 4, name: 'Kadıköy', province: 'IS' },
  { id: 5, name: 'Beşiktaş', province: 'IS' },
  { id: 6, name: 'Üsküdar', province: 'IS' },
  { id: 7, name: 'Bornova', province: 'IZ' },
  { id: 8, name: 'Karşıyaka', province: 'IZ' },
  { id: 9, name: 'Konak', province: 'IZ' },
];
