import type { Entry } from './entry';

/** Continents, countries and cities. */
export function world(): Entry[] {
  return [
    {
      id: 'europe',
      text: 'Europe',
      children: [
        { id: 'tr', text: 'Türkiye', children: [{ id: 'ankara', text: 'Ankara' }, { id: 'istanbul', text: 'İstanbul' }, { id: 'izmir', text: 'İzmir' }] },
        { id: 'de', text: 'Germany', children: [{ id: 'berlin', text: 'Berlin' }, { id: 'hamburg', text: 'Hamburg' }] },
        { id: 'it', text: 'Italy', children: [{ id: 'rome', text: 'Rome' }, { id: 'milan', text: 'Milan' }] },
      ],
    },
    {
      id: 'asia',
      text: 'Asia',
      children: [
        { id: 'jp', text: 'Japan', children: [{ id: 'tokyo', text: 'Tokyo' }, { id: 'osaka', text: 'Osaka' }] },
        { id: 'kr', text: 'Korea', children: [{ id: 'seoul', text: 'Seoul' }, { id: 'busan', text: 'Busan' }] },
      ],
    },
    { id: 'americas', text: 'Americas', children: [{ id: 'ca', text: 'Canada', children: [{ id: 'toronto', text: 'Toronto' }, { id: 'montreal', text: 'Montreal' }] }] },
  ];
}
