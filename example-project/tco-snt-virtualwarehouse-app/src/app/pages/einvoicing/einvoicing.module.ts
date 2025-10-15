import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from 'src/app/shared/shared.module';
import { ArModuleComponent } from './components/ar-module/ar-module.component';
import { MainEinvoicingComponent } from './components/main-einvoicing/main-einvoicing.component';
import { EsfInvoiceEditDialogComponent } from './components/shared/dialogs/esf-invoice-edit-dialog/esf-invoice-edit-dialog.component';
import { SharedInvoiceModule } from './components/shared/shared-invoice.module';
import { EInvoicingRoutingModule } from './einvoicing-routing.module';
import { PoComponent } from './components/ap-module/po/po.component';
import { SoComponent } from './components/ap-module/so/so.component';
import { NcComponent } from './components/ap-module/nc/nc.component';
import { ApModuleTableService } from './components/shared/services/ap-module-table.service';
import { LastSyncDatesComponent } from './components/shared/components/last-sync-dates/last-sync-dates.component';
import { UndistributedComponent } from './components/ap-module/undistributed/undistributed.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ArDraftsComponent } from './components/ar-module/ar-drafts/ar-drafts.component';

@NgModule({
    declarations: [
        MainEinvoicingComponent,
        EsfInvoiceEditDialogComponent,
        ArModuleComponent,
        PoComponent,
        SoComponent,
        NcComponent,
        UndistributedComponent,
        LastSyncDatesComponent,
        ArDraftsComponent
    ],
    imports: [
        CommonModule,
        MatTabsModule,
        MatTableModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatButtonModule,
        ReactiveFormsModule,
        FormsModule,
        MatInputModule,
        EInvoicingRoutingModule,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        SharedModule,
        MatSelectModule,
        MatDialogModule,
        MatIconModule,
        SharedInvoiceModule,
        FlexLayoutModule,
        MatCheckboxModule
    ],
    providers: [
        ApModuleTableService
    ]
})
export class EInvoicingModule { }
