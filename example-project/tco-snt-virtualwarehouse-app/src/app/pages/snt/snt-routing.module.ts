import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { SntCreateComponent } from './snt-actions/snt-create/snt-create.component';
import { SntComponent } from './snt.component';
import { SntEditComponent } from './snt-actions/snt-edit/snt-edit.component';
import { SntShowComponent } from './snt-actions/snt-show/snt-show.component';
import { SntCorrectionComponent } from './snt-actions/snt-correction/snt-correction.component';
import { SntCopyComponent } from './snt-actions/snt-copy/snt-copy.component';
import { RoleType } from 'src/app/api/GCPClient';
import { CheckRoleGuard } from 'src/app/shared/guards/check-role.guard';


const routes: Routes = [
  {
    path: '',
    children: [
        {
          path: '',
          component: SntComponent,
          canActivate: [CheckRoleGuard],
          data: {
            roles: [RoleType.SntOperator, RoleType.SntReadOnly, RoleType.TCOWarehouse],
          }
        },
        {
          path: 'new',
          component: SntCreateComponent,
          canActivate: [CheckRoleGuard],
          data: {
            roles: [RoleType.SntOperator, RoleType.SntReadOnly],
          }
        },
        {
          path: 'edit/:id',
          component: SntEditComponent,
          canActivate: [CheckRoleGuard],
          data: {
            roles: [RoleType.SntOperator, RoleType.SntReadOnly],
          }
        },
        {
          path: 'show/:id',
          component: SntShowComponent,
          canActivate: [CheckRoleGuard],
          data: {
            roles: [RoleType.SntOperator, RoleType.SntReadOnly, RoleType.TCOWarehouse],
          }
        },
        {
          path: 'correction/:id',
          component: SntCorrectionComponent,
          canActivate: [CheckRoleGuard],
          data: {
            roles: [RoleType.SntOperator, RoleType.SntReadOnly, RoleType.TCOWarehouse],
          }
        },
        {
          path: 'copy/:id',
          component: SntCopyComponent,
          canActivate: [CheckRoleGuard],
          data: {
            roles: [RoleType.SntOperator, RoleType.SntReadOnly, RoleType.TCOWarehouse],
          }
        }
      ]
    }
]


@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ru-RU'},
  ],
})
export class SntRoutingModule { }

