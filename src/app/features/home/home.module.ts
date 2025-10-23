import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomePageComponent } from './home-page/home-page.component';
import { ReportsComponent } from './reports/reports.component';
import { ReportDetailsDialogComponent } from './reports/report-details-dialog/report-details-dialog.component';
import { TenderAwardsComponent } from './tender-awards/tender-awards.component';
import { TenderStatusDialogComponent } from './tender-awards/status-change-dialog/tender-status-dialog.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { SendForApprovalDialogComponent } from './tender-awards/send-for-approval-dialog/send-for-approval-dialog.component';
import { ManageBiddersDialogComponent } from './tender-awards/manage-bidders-dialog/manage-bidders-dialog.component';
import { AuditLogComponent } from './audit-log/audit-log.component';
import { ViewProposalsDialogComponent } from './tender-awards/view-proposals-dialog/view-proposals-dialog.component';

@NgModule({
  declarations: [
    HomePageComponent,
    ReportsComponent,
    ReportDetailsDialogComponent,
    TenderAwardsComponent,
    TenderStatusDialogComponent,
    CustomerListComponent,
    SendForApprovalDialogComponent,
    ManageBiddersDialogComponent,
    AuditLogComponent,
    ViewProposalsDialogComponent,
  ],
  imports: [SharedModule, HomeRoutingModule],
})
export class HomeModule {}
