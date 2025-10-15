import { NgModule } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { Routes, RouterModule } from '@angular/router';
import { CalGuardService } from '@cvx/cal-angular';
import { AdminComponent } from './admin.component';
import { RoleGroupComponent } from './role-group/role-group.component';
import { StoreGroupComponent } from './store-group/store-group.component';
import { AccountReportingComponent } from './account-reporting/account-reporting.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AdminComponent,
      },
      {
        path: 'rolegroup',
        children: [
          {
            path: '',
            component: RoleGroupComponent 
          },
        ]
      },
      {
        path: 'storegroup',
        children: [
          {
            path: '',
            component: StoreGroupComponent
          }
        ]
      },
      {
        path: 'account-reporting',
        children: [
          {
            path: '',
            component: AccountReportingComponent
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ru-RU'},
  ],
})
export class AdminRoutingModule { }
// {
//   path: 'rolegroup',
//   children: [
//     {
//       path: '',
//       component: RoleGroupComponent
//     },
//     {
//       path: 'new',
//       component: SelectRoleGroupComponent
//     }
//   ]
// },