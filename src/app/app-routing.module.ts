import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { calCanActivateGuard } from './core/guards/cal-auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/home/home.module').then((m) => m.HomeModule),
    canActivate: [calCanActivateGuard],
  },
  {
    path: 'sign-in-failed',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
