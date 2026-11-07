import { Application } from '@motifx/core';
import '@motifx-community/ui/styles.css';
import './smart-home.css';
import { HomeModel } from './HomeModel';
import { routes } from './routes';

// One home for the whole app: every screen reads and changes the same model.
const builder = Application.CreateBuilder();
builder.services.addSingleton(HomeModel, HomeModel);

const app = builder.build();
/* @DEV-ONLY */ app.useDevelopment(true);
// Hash addresses: the app lives in one folder of a static site.
app.useRouter({ routes, mode: 'hash' });
app.run('#app');
