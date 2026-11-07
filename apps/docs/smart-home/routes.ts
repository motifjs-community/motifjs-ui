import type { RouteItem } from '@motifx/core';
import { Shell } from './Shell';

/** The screens of the panel, in the order of the rail; each is loaded when first opened. */
export const SCREENS = [
    { key: 'home', path: '/', label: 'Home', load: () => import('./screens/HomeScreen') },
    { key: 'rooms', path: '/rooms', label: 'Rooms', load: () => import('./screens/RoomsScreen') },
    { key: 'climate', path: '/climate', label: 'Climate', load: () => import('./screens/ClimateScreen') },
    { key: 'energy', path: '/energy', label: 'Energy', load: () => import('./screens/EnergyScreen') },
    { key: 'security', path: '/security', label: 'Security', load: () => import('./screens/SecurityScreen') },
    { key: 'automations', path: '/automations', label: 'Automations', load: () => import('./screens/AutomationsScreen') }
] as const;

export type ScreenKey = (typeof SCREENS)[number]['key'];

export const routes: RouteItem[] = [
    {
        path: '/',
        control: Shell,
        childs: SCREENS.map(s => ({ path: s.path, name: s.key, meta: { screen: s.key }, control: s.load }) as RouteItem)
    }
];
