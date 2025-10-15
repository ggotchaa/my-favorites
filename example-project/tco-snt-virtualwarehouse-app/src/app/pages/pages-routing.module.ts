import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleType } from '../api/GCPClient';
import { CheckRoleGuard } from '../shared/guards/check-role.guard';
import { BalanceComponent } from './balances/balance.component';
import { ErrorpageComponent } from './common/errorpage/errorpage.component';
import { GSVSComponent } from './gsvs/gsvs.component';
import { ModulesComponent } from './modules/modules.component';
import { ProfileComponent } from './profile/profile.component';
import { WarehouseComponent } from './warehouse/warehouse.component';
import { AllNotificationsComponent } from './all-notifications/all-notifications.component';

// Don't change the sequence of path. It affects directly to navigation.component.ts
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'modules',
        component: ModulesComponent,
        data: {
          roles: [
            RoleType.SntReadOnly,
            RoleType.SntOperator,
            RoleType.TCOWarehouse,
            RoleType.Admin,
            RoleType.ArReadOnly,
            RoleType.ArReadWrite,
            RoleType.ApUser,
            RoleType.ApOperator,
          ],
        },
      },

      {
        path: 'warehouse',
        component: WarehouseComponent,
        canActivate: [CheckRoleGuard],
        data: {
          roles: [
            RoleType.SntReadOnly,
            RoleType.SntOperator,
            RoleType.TCOWarehouse,
          ],
        },
      },
      {
        path: 'balance',
        component: BalanceComponent,
        canActivate: [CheckRoleGuard],
        data: {
          roles: [
            RoleType.SntReadOnly,
            RoleType.SntOperator,
            RoleType.TCOWarehouse,
          ],
        },
      },
      {
        path: 'gsvs',
        component: GSVSComponent,
        canActivate: [CheckRoleGuard],
        data: {
          roles: [
            RoleType.SntReadOnly,
            RoleType.SntOperator,
            RoleType.TCOWarehouse,
          ],
        },
      },

      {
        path: 'forms',
        loadChildren: () =>
          import('./forms/forms.module').then((m) => m.FormModule),
        canLoad: [CheckRoleGuard],
        data: {
          roles: [
            RoleType.SntReadOnly,
            RoleType.SntOperator,
            RoleType.TCOWarehouse,
          ],
        },
      },
      {
        path: 'snt',
        loadChildren: () => import('./snt/snt.module').then((m) => m.SntModule),
        canLoad: [CheckRoleGuard],
        data: {
          roles: [
            RoleType.SntReadOnly,
            RoleType.SntOperator,
            RoleType.TCOWarehouse,
          ],
        },
      },
      {
        path: 'einvoicing',
        loadChildren: () =>
          import('./einvoicing/einvoicing.module').then(
            (m) => m.EInvoicingModule
          ),
        canLoad: [CheckRoleGuard],
        data: {
          roles: [
            RoleType.ArReadOnly,
            RoleType.ArReadWrite,
            RoleType.ApUser, 
            RoleType.ApOperator,
          ],
        },
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('./admin/admin.module').then((m) => m.AdminModule),
        canLoad: [CheckRoleGuard],
        canActivate: [CheckRoleGuard],
        data: {
          roles: [RoleType.Admin],
        },
      },
      {
        path: '',
        component: ModulesComponent,        
        data: {
          roles: [
            RoleType.SntReadOnly,
            RoleType.SntOperator,
            RoleType.TCOWarehouse,
            RoleType.Admin,
            RoleType.ArReadOnly,
            RoleType.ArReadWrite,
            RoleType.ApUser,
            RoleType.ApOperator,
          ],
        },
      },
      {
        path: 'error',
        component: ErrorpageComponent,
        canActivate: [CheckRoleGuard],
        data: {
          roles: [
            RoleType.SntReadOnly,
            RoleType.SntOperator,
            RoleType.TCOWarehouse,
            RoleType.Admin,
            RoleType.ArReadOnly,
            RoleType.ArReadWrite,
            RoleType.ApUser, 
            RoleType.ApOperator,
          ],
        },
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [CheckRoleGuard],
        data: {
          roles: [RoleType.SntOperator, RoleType.TCOWarehouse, RoleType.ArReadWrite, RoleType.ApUser, RoleType.ApOperator, RoleType.DaoaUsers],
        },
      },
      {
        path: 'allnotifications',
        component: AllNotificationsComponent,
        canActivate: [CheckRoleGuard],
        data: {
          roles: [
            RoleType.SntReadOnly,
            RoleType.SntOperator,
            RoleType.TCOWarehouse,
            RoleType.Admin,
            RoleType.ArReadOnly,
            RoleType.ArReadWrite,
            RoleType.ApUser,
            RoleType.ApOperator
          ],
        },
      },
    ],
  },
  { path: '**', redirectTo: '/error' },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
