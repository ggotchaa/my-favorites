import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { SignInFailureComponent } from './sign-in-failure/sign-in-failure.component';

@NgModule({
  imports: [SharedModule, AuthRoutingModule, SignInFailureComponent],
})
export class AuthModule {}
