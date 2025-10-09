import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/home/home.routes').then((m) => m.homeRoutes),
  },
  {
    path: 'sign-in-failed',
    loadComponent: () =>
      import('./features/auth/sign-in-failure/sign-in-failure.component').then(
        (m) => m.SignInFailureComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
