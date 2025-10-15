import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { InvoiceCreateComponent } from './invoice-actions/invoice-create/invoice-create.component';
import { CheckRoleGuard } from '../../../../shared/guards/check-role.guard';
import { RoleType } from '../../../../api/GCPClient';
import { InvoiceEditComponent } from './invoice-actions/invoice-edit/invoice-edit.component';
import { InvoiceReadComponent } from './invoice-actions/invoice-read/invoice-read.component';
import { ArModuleComponent } from '../ar-module/ar-module.component';


const routes: Routes = [
  {
    path: '',
    children: [
        {
          path: '',
          component: ArModuleComponent, // ToDo check if the user have only AP roles
          canActivate: [CheckRoleGuard],
          data: {
            roles: [RoleType.ArReadOnly, RoleType.ArReadWrite],
          }
        },
        {
          path: 'new',
          component: InvoiceCreateComponent,
          canActivate: [CheckRoleGuard],
          data: {
            roles: [RoleType.ArReadWrite],
           }
        },
        {
          path: 'edit/:jdeNumber/:jdeType/:jdeInvoiceId',
          component: InvoiceEditComponent,
          canActivate: [CheckRoleGuard],
          data: {
            roles: [RoleType.ArReadWrite],
           }
        },
        {
          path: 'read/:esfInvoiceId',
          component: InvoiceReadComponent,
          canActivate: [CheckRoleGuard],
          data: {
            roles: [RoleType.ArReadWrite, RoleType.ArReadOnly],
           }
        },
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
export class InvoiceRoutingModule { }

