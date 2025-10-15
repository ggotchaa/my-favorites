import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MainEinvoicingComponent } from './components/main-einvoicing/main-einvoicing.component';
import { EINVOICING_API_BASE_URL } from 'src/app/api/EInvoicingApiClient';
import { environment } from 'src/environments/environment';
import { CheckRoleGuard } from '../../shared/guards/check-role.guard';
import { RoleType } from '../../api/GCPClient';
const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: MainEinvoicingComponent,
                canActivate: [CheckRoleGuard],
                data: {
                  roles: [RoleType.ArReadWrite, RoleType.ArReadOnly, RoleType.ApUser, RoleType.ApOperator],
                }
            }
        ]
    }
]

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [
        { provide: EINVOICING_API_BASE_URL, useValue: environment.einvoicingApiUrl },
        { provide: MAT_DATE_LOCALE, useValue: 'ru-RU' },
    ],
})
export class EInvoicingRoutingModule { }

