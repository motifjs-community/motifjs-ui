import { Application } from '@motifx/core';
import '@motifx-community/ui/styles.css';
import './shared/docs.css';
import { PageOutline } from './app/PageOutline';
import { routes } from './app/routes';
import { SiteSettings } from './app/SiteSettings';

const builder = Application.CreateBuilder();
builder.services.addSingleton(SiteSettings, SiteSettings);
builder.services.addSingleton(PageOutline, PageOutline);

const app = builder.build();
app.useDevelopment(true);
app.useRouter({
  routes,
  mode: 'history',
  scrollMemory: true,
  fallbacks: { notFound: () => import('./pages/not-found/NotFoundPage') },
});
app.run('#app');
