import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleType } from 'src/app/api/GCPClient';
import { CheckRoleGuard } from 'src/app/shared/guards/check-role.guard';
import { FormCreateComponent } from './forms-actions/form-create/form-create.component';
import { FormEditComponent } from './forms-actions/form-edit/form-edit.component';
import { FormShowComponent } from './forms-actions/form-show/form-show.component';
import { FormsComponent } from './forms.component';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: FormsComponent,
        canActivate: [CheckRoleGuard],
        data: {
          roles: [
            RoleType.SntOperator,
            RoleType.SntReadOnly,
            RoleType.TCOWarehouse,
          ],
        },
      },
      {
        path: 'new',
        component: FormCreateComponent,
        canActivate: [CheckRoleGuard],
        data: {
          roles: [
            RoleType.SntOperator,
            RoleType.SntReadOnly,
            RoleType.TCOWarehouse,
          ],
        },
      },
      {
        path: 'edit/:id',
        component: FormEditComponent,
        canActivate: [CheckRoleGuard],
        data: {
          roles: [
            RoleType.SntOperator,
            RoleType.SntReadOnly,
            RoleType.TCOWarehouse,
          ],
        },
      },
      {
        path: 'show/:id',
        component: FormShowComponent,
        canActivate: [CheckRoleGuard],
        data: {
          roles: [
            RoleType.SntOperator,
            RoleType.SntReadOnly,
            RoleType.TCOWarehouse,
          ],
        },
      },
    ],
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'ru-RU' }],
})
export class FormRoutingModule {}
