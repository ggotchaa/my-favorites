import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/home/home.routes').then((m) => m.homeRoutes),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
