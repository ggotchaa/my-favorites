import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { MaterialModule } from 'src/app/materialModule.component';
import { PagesModule } from 'src/app/pages/pages.module';
import { RoleGroupComponent } from './role-group/role-group.component';
import { RoleGroupCreateComponent } from './role-group/role-group-actions/role-group-create/role-group-create.component';
import { RoleGroupEditComponent } from './role-group/role-group-actions/role-group-edit/role-group-edit.component';
import { RoleGroupDeleteComponent } from './role-group/role-group-actions/role-group-delete/role-group-delete.component';
import { StoreGroupComponent } from './store-group/store-group.component';
import { StoreGroupCreateComponent } from './store-group/store-group-actions/store-group-create/store-group-create.component';
import { StoreGroupDeleteComponent } from './store-group/store-group-actions/store-group-delete/store-group-delete.component';
import { StoreGroupEditComponent } from './store-group/store-group-actions/store-group-edit/store-group-edit.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminFacade } from './admin.facade';
import { AccountReportingComponent } from './account-reporting/account-reporting.component';
import { AccountReportingCreateComponent } from './account-reporting/account-reporting-actions/account-reporting-create/account-reporting-create.component';
import { AccountReportingEditComponent } from './account-reporting/account-reporting-actions/account-reporting-edit/account-reporting-edit.component';
import { AccountReportingDeleteComponent } from './account-reporting/account-reporting-actions/account-reporting-delete/account-reporting-delete.component';


@NgModule({
    declarations: [
        AccountReportingComponent,
        AccountReportingCreateComponent,
        AccountReportingEditComponent,
        AccountReportingDeleteComponent,
        AdminComponent, 
        RoleGroupComponent, 
        RoleGroupCreateComponent, 
        RoleGroupEditComponent, 
        RoleGroupDeleteComponent, 
        StoreGroupComponent, 
        StoreGroupCreateComponent, 
        StoreGroupDeleteComponent, 
        StoreGroupEditComponent
    ],
    imports: [
        CommonModule,
        AdminRoutingModule,
        MaterialModule,
        PagesModule,
        SharedModule
    ],
    providers: [AdminFacade]
})
export class AdminModule { }
