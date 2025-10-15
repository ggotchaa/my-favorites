import { Routes } from '@angular/router';
import { PagesComponent } from './pages/pages.component';
import { CalGuardService } from '@cvx/cal-angular';

export const APP_ROUTES: Routes = [
  {
      path: '',
      component: PagesComponent,
      loadChildren: () => import('./pages/pages.module').then((m) => m.PagesModule),
      canActivate: [
        // Adding CalGuardService here will prompt users to login for the given route.
        CalGuardService
      ]
  },
  {path: '**', redirectTo: '/errorpage'}
];

