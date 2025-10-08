import { Routes } from '@angular/router';
import { AadTokenComponent } from './components/aad-token/aad-token.component';
import { SigninSignoutComponent } from './components/signin-signout/signin-signout.component';
import { MsGraphComponent } from './components/ms-graph/ms-graph.component';
import { CheckAadGroupComponent } from './components/check-aad-group/check-aad-group.component';
import { CalGuardComponent } from './components/cal-guard/cal-guard.component';
import { RoleGuardComponent } from './components/role-guard/role-guard.component';
import { CalGuardService, RoleGuardService } from '@cvx/cal-angular';
import { UserInfoComponent } from './components/user-info/user-info.component';
import { ConfigPropComponent } from './components/config-prop/config-prop.component';

export const routes: Routes = [
  // Default route - redirect to signin-signout
  {
    path: '',
    redirectTo: 'signin-signout',
    pathMatch: 'full',
  },

  // Component routes
  {
    path: 'signin-signout',
    component: SigninSignoutComponent,
  },
  {
    path: 'config-prop',
    component: ConfigPropComponent,
  },
  {
    path: 'cal-guard',
    component: CalGuardComponent,
    canActivate: [CalGuardService],
  },
  {
    path: 'role-guard',
    component: RoleGuardComponent,
    canActivate: [RoleGuardService],
    data: {
      roles: ['Testing.Read'],
    },
  },
  {
    path: 'user-info',
    component: UserInfoComponent,
  },
  {
    path: 'ms-graph',
    component: MsGraphComponent,
  },
  {
    path: 'check-aad-group',
    component: CheckAadGroupComponent,
  },
  {
    path: 'aad-token',
    component: AadTokenComponent,
  },
];
