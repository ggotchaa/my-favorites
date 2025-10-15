import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { SignInFailureComponent } from './sign-in-failure/sign-in-failure.component';

@NgModule({
  declarations: [SignInFailureComponent],
  imports: [SharedModule, AuthRoutingModule],
})
export class AuthModule {}
