import { Application } from '@motifx/core';
import '@motifx-community/ui/styles.css';
import './shared/docs.css';
import { PageOutline } from './app/PageOutline';
import { routes } from './app/routes';
import { SiteSettings } from './app/SiteSettings';

// A static host may answer /datagrid as /datagrid/: the address is the route's own before the router reads it.
if (location.pathname.length > 1 && location.pathname.endsWith('/')) {
  history.replaceState(history.state, '', location.pathname.slice(0, -1) + location.search + location.hash);
}

const builder = Application.CreateBuilder();
builder.services.addSingleton(SiteSettings, SiteSettings);
builder.services.addSingleton(PageOutline, PageOutline);

const app = builder.build();
/* @DEV-ONLY */ app.useDevelopment(true);
app.useRouter({
  routes,
  mode: 'history',
  scrollMemory: true,
  fallbacks: { notFound: () => import('./pages/not-found/NotFoundPage') },
});
app.run('#app');
