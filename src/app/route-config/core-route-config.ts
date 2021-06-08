
import {StarterAppComponent} from '../routes/starter-app/starter-app.component';
import { STARTER_APP_ROUTES, HOME_ROUTE } from './starter-app-route-config/starter-app-route-config';

export const CORE_ROUTES = [
  {
    // starterApp only provides the global nav bar at present - but will be a useful place to do stuff that applies to all routes
    // Note: although each route uses claimsResolver this doesnt actually result in multiple REST call to claims
    // because we cache at http level using an interceptor
    path: 'starterApp',
    component: StarterAppComponent,
    children: STARTER_APP_ROUTES
  },
  {
    path: '', redirectTo: '/starterApp/' + HOME_ROUTE, pathMatch: 'full'
  },
  {
    path: '**', redirectTo: '/starterApp/' + HOME_ROUTE
  }
];

export const CORE_PROVIDERS = [];
