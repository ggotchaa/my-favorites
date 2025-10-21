import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SignInFailureComponent } from './sign-in-failure/sign-in-failure.component';

const routes: Routes = [
  {
    path: '',
    component: SignInFailureComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
